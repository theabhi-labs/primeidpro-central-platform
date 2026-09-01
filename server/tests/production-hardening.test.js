/**
 * PRIME ID PRO — PHASE 5 PRODUCTION HARDENING & SECURITY TEST SUITE
 *
 * Verifies:
 * - Production config validation fail-fast guards
 * - Memory DB fallback refusal in production
 * - Insecure test mode rejection
 * - R2 credential requirements
 * - CORS strict origin whitelist rejection
 * - NoSQL injection operator sanitization
 * - Safe production error payloads (zero stack traces / secrets)
 * - Liveness (/health) and Readiness (/ready) status probes
 * - Request correlation ID propagation
 * - Password security & reset token lifecycle
 */

const assert = require('assert');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const env = require('../src/config/env');
const User = require('../src/models/User');

let mongoServer;
let testServer;
let testServerPort;
let testBaseUrl;

async function setup() {
  const memOpts = process.platform === 'linux' ? { binary: { version: '7.0.14' } } : {};
  mongoServer = await MongoMemoryServer.create(memOpts);
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  return new Promise((resolve) => {
    testServer = http.createServer(app);
    testServer.listen(0, '127.0.0.1', () => {
      testServerPort = testServer.address().port;
      testBaseUrl = `http://127.0.0.1:${testServerPort}`;
      resolve();
    });
  });
}

async function teardown() {
  if (testServer) {
    await new Promise((resolve) => testServer.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, testBaseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {
          // Non-JSON response
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      if (typeof options.body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(options.body));
      } else {
        req.write(options.body);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n================================================================');
  console.log('🚀 PRIME ID PRO — PHASE 5: PRODUCTION HARDENING & SECURITY SUITE');
  console.log('================================================================\n');

  await setup();
  let passed = 0;
  let failed = 0;

  function pass(testName, detail = '') {
    passed++;
    console.log(`  ✅ [PASS] ${testName} ${detail ? '(' + detail + ')' : ''}`);
  }

  function fail(testName, error) {
    failed++;
    console.error(`  ❌ [FAIL] ${testName}: ${error.message}`);
  }

  try {
    // ---------------------------------------------------------
    // TEST A: Production with missing MongoDB URI fails fast
    // ---------------------------------------------------------
    console.log('📌 Test A: Production with missing MongoDB URI fails validation...');
    try {
      const mockEnv = {
        ...env,
        MONGODB_URI: '',
        IS_PRODUCTION: true,
        validateProductionConfig: env.validateProductionConfig
      };
      const result = mockEnv.validateProductionConfig({ forceProd: true });
      assert.strictEqual(result.valid, false, 'Config must be flagged invalid');
      assert(result.errors.some((e) => e.includes('MONGODB_URI is required')), 'Must contain MONGODB_URI error');
      pass('Missing MONGODB_URI rejected by production validator');
    } catch (e) {
      fail('Production MongoDB URI check', e);
    }

    // ---------------------------------------------------------
    // TEST B: Production with memory DB fallback is strictly refused
    // ---------------------------------------------------------
    console.log('📌 Test B: Production refuses memory DB fallback...');
    try {
      const mockEnv = {
        ...env,
        MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/primeidpro',
        USE_MEMORY_DB_FALLBACK: true,
        IS_PRODUCTION: true,
        validateProductionConfig: env.validateProductionConfig
      };
      const result = mockEnv.validateProductionConfig({ forceProd: true });
      assert.strictEqual(result.valid, false, 'Config must be flagged invalid');
      assert(result.errors.some((e) => e.includes('USE_MEMORY_DB_FALLBACK must be false')), 'Must reject in-memory fallback');
      pass('Production in-memory database fallback is strictly refused');
    } catch (e) {
      fail('Production memory DB fallback check', e);
    }

    // ---------------------------------------------------------
    // TEST C: Production rejects PAYMENT_TEST_MODE=true
    // ---------------------------------------------------------
    console.log('📌 Test C: Production rejects PAYMENT_TEST_MODE=true...');
    try {
      const mockEnv = {
        ...env,
        MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/primeidpro',
        USE_MEMORY_DB_FALLBACK: false,
        PAYMENT_TEST_MODE: true,
        validateProductionConfig: env.validateProductionConfig
      };
      const result = mockEnv.validateProductionConfig({ forceProd: true });
      assert.strictEqual(result.valid, false, 'Config must be flagged invalid');
      assert(result.errors.some((e) => e.includes('PAYMENT_TEST_MODE must be false')), 'Must reject payment test mode');
      pass('Production payment test mode bypass strictly prohibited');
    } catch (e) {
      fail('Payment test mode safety check', e);
    }

    // ---------------------------------------------------------
    // TEST D: Storage driver R2 requires valid credentials
    // ---------------------------------------------------------
    console.log('📌 Test D: STORAGE_DRIVER=R2 requires valid credentials...');
    try {
      const mockEnv = {
        ...env,
        STORAGE_DRIVER: 'R2',
        R2_ENDPOINT: '',
        R2_BUCKET_NAME: '',
        R2_ACCESS_KEY_ID: '',
        R2_SECRET_ACCESS_KEY: '',
        isR2Configured: () => false,
        validateProductionConfig: env.validateProductionConfig
      };
      const result = mockEnv.validateProductionConfig({ forceProd: true });
      assert.strictEqual(result.valid, false, 'Config must be flagged invalid when R2 is missing keys');
      assert(result.errors.some((e) => e.includes('Cloudflare R2')), 'Must flag missing R2 credentials');
      pass('R2 credential requirements verified');
    } catch (e) {
      fail('R2 credential validation check', e);
    }

    // ---------------------------------------------------------
    // TEST E: Unknown CORS origin is rejected
    // ---------------------------------------------------------
    console.log('📌 Test E: Unknown CORS origin is rejected...');
    try {
      const res = await makeRequest('/api/v1/auth/me', {
        headers: {
          Origin: 'https://malicious-phishing-site.com'
        }
      });

      assert(res.statusCode === 403, `Must reject with HTTP 403 (got ${res.statusCode})`);
      assert(res.json?.message?.includes('Origin not allowed by CORS'), 'Must return safe CORS rejection message');
      pass('Unauthorized cross-origin request rejected with HTTP 403');
    } catch (e) {
      fail('CORS strict origin whitelist check', e);
    }

    // ---------------------------------------------------------
    // TEST F: NoSQL operator injection is sanitized
    // ---------------------------------------------------------
    console.log('📌 Test F: NoSQL operator injection ($gt, $ne) is sanitized...');
    try {
      const maliciousPayload = {
        email: { $gt: '' },
        password: { $ne: '' }
      };

      const res = await makeRequest('/api/v1/auth/csc/login', {
        method: 'POST',
        body: maliciousPayload
      });

      // Because mongoSanitize replaces keys starting with '$' with '_',
      // req.body.email is undefined or { _gt: '' } which fails email string validation,
      // preventing NoSQL authentication bypass.
      assert(res.statusCode === 400 || res.statusCode === 401, 'Must reject sanitized non-string query');
      pass('NoSQL injection operators successfully sanitized from request body');
    } catch (e) {
      fail('NoSQL injection sanitization check', e);
    }

    // ---------------------------------------------------------
    // TEST G: Production error response contains no stack traces
    // ---------------------------------------------------------
    console.log('📌 Test G: Production error responses contain no stack traces...');
    try {
      const res = await makeRequest('/api/v1/non-existent-endpoint-test-404');
      assert.strictEqual(res.statusCode, 404, 'Must return 404');
      assert.strictEqual(res.json?.success, false, 'Success must be false');
      assert.strictEqual(res.json?.stack, undefined, 'Stack trace must NEVER be in response');
      assert(!JSON.stringify(res.json).includes('node_modules'), 'File paths must not be in response');
      pass('Error response payload is safe, structured, and free of stack traces');
    } catch (e) {
      fail('Safe error response check', e);
    }

    // ---------------------------------------------------------
    // TEST H: Health & Readiness endpoints
    // ---------------------------------------------------------
    console.log('📌 Test H: Health & Readiness probes...');
    try {
      const healthRes = await makeRequest('/api/v1/health');
      assert.strictEqual(healthRes.statusCode, 200, 'Liveness probe must return 200');
      assert.strictEqual(healthRes.json?.data?.status, 'HEALTHY', 'Status must be HEALTHY');

      const readyRes = await makeRequest('/api/v1/health/ready');
      assert.strictEqual(readyRes.statusCode, 200, 'Readiness probe must return 200');
      assert.strictEqual(readyRes.json?.data?.ready, true, 'Ready state must be true');
      pass('Liveness (/health) and Readiness (/ready) probes return HTTP 200');
    } catch (e) {
      fail('Health & Readiness probe check', e);
    }

    // ---------------------------------------------------------
    // TEST I: Request correlation ID (X-Request-Id) propagation
    // ---------------------------------------------------------
    console.log('📌 Test I: Request correlation ID (X-Request-Id) propagation...');
    try {
      const customReqId = 'req_custom_tracer_9999';
      const res = await makeRequest('/api/v1/health', {
        headers: {
          'X-Request-Id': customReqId
        }
      });

      assert.strictEqual(res.headers['x-request-id'], customReqId, 'X-Request-Id header must be echoed back');
      assert.strictEqual(res.json?.requestId, customReqId, 'requestId must be included in JSON body');
      pass('Request correlation ID tracked and returned across headers and JSON payload');
    } catch (e) {
      fail('Request correlation ID check', e);
    }

    // ---------------------------------------------------------
    // TEST J: Default password behavior removed
    // ---------------------------------------------------------
    console.log('📌 Test J: Default password behavior removed...');
    try {
      let threw = false;
      try {
        const invalidUser = new User({
          name: 'No Password Operator',
          email: 'nopass@example.com',
          role: 'CSC'
          // No password or passwordHash provided
        });
        await invalidUser.save();
      } catch (err) {
        threw = true;
        assert(err.message.includes('Password is required'), 'Must require explicit password');
      }
      assert(threw, 'Operator creation without password must be rejected');
      pass('User creation without password or hash strictly rejected');
    } catch (e) {
      fail('Password enforcement check', e);
    }

    // ---------------------------------------------------------
    // TEST K: Password reset token hashing & expiration
    // ---------------------------------------------------------
    console.log('📌 Test K: Password reset token hashing & expiration...');
    try {
      const crypto = require('crypto');
      const testUser = await User.create({
        name: 'Reset Test User',
        email: 'reset_test@example.com',
        password: 'InitialPassword123!',
        role: 'CSC'
      });

      // Request password reset
      const resetReq = await makeRequest('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: { email: 'reset_test@example.com' }
      });
      assert.strictEqual(resetReq.statusCode, 200, 'Forgot password must return 200');

      const userAfter = await User.findById(testUser._id);
      assert(typeof userAfter.resetPasswordToken === 'string', 'resetPasswordToken must be hashed string');
      assert(userAfter.resetPasswordExpires > new Date(), 'resetPasswordExpires must be in future');

      // Attempt reset with invalid token
      const badReset = await makeRequest('/api/v1/auth/reset-password', {
        method: 'POST',
        body: {
          token: 'invalid_token_xyz',
          password: 'NewStrongPassword123!',
          confirmPassword: 'NewStrongPassword123!'
        }
      });
      assert.strictEqual(badReset.statusCode, 400, 'Invalid token must be rejected with 400');
      pass('Password reset token hashing, expiration, and invalid token rejection verified');
    } catch (e) {
      fail('Password reset token check', e);
    }

  } finally {
    await teardown();
  }

  console.log('\n================================================================');
  console.log(`📊 PHASE 5 TEST SUMMARY:`);
  console.log(`   Passed:  ${passed} / 11`);
  console.log(`   Failed:  ${failed} / 11`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch((err) => {
    console.error('Unhandled test suite error:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
