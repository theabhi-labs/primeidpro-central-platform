/**
 * Phase 2A Comprehensive Device Authentication & Tenant Isolation Test Suite
 * Tests cases A through M
 */
const http = require('http');
const crypto = require('crypto');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { seedDefaultData } = require('../src/utils/seeder');

const User = require('../src/models/User');
const Center = require('../src/models/Center');
const Device = require('../src/models/Device');
const Job = require('../src/models/Job');
const { signDeviceToken } = require('../src/utils/jwt');

let server;
let baseUrl;

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method: method.toUpperCase(),
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(message);
  }
  console.log(`  ✅ [PASS] ${message}`);
}

async function runPhase2aTests() {
  console.log('\n================================================================');
  console.log('🧪 PHASE 2A: DEVICE AUTH & TENANT ISOLATION VERIFICATION (A-M)');
  console.log('================================================================\n');

  try {
    await connectDB();
    await seedDefaultData();

    server = http.createServer(app);
    await new Promise((res) => server.listen(0, res));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    const centerA = await Center.findOne({ centerCode: 'CSC-DL-1001' });
    let centerB = await Center.findOne({ centerCode: 'CSC-MH-2002' });
    if (!centerB) {
      centerB = await Center.create({
        centerName: 'Mumbai Studio B',
        centerCode: 'CSC-MH-2002',
        address: 'Andheri',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
        walletBalance: 100
      });
    }

    // Ensure fresh test state for Center A
    await Job.deleteMany({ centerId: centerA._id });

    // Setup Device A for Center A
    const devAId = 'PIP-DEV-TEST-A';
    const instAId = 'inst-uuid-a-111';
    const tokenA = signDeviceToken({ deviceId: devAId, installationId: instAId, centerId: centerA._id.toString() });
    let deviceA = await Device.findOne({ deviceId: devAId });
    if (!deviceA) {
      deviceA = await Device.create({
        centerId: centerA._id,
        deviceId: devAId,
        installationId: instAId,
        deviceName: 'Device A',
        authToken: tokenA,
        authTokenHash: crypto.createHash('sha256').update(tokenA).digest('hex'),
        status: 'ACTIVE'
      });
    } else {
      deviceA.status = 'ACTIVE';
      await deviceA.save();
    }

    // Setup Device B for Center B
    const devBId = 'PIP-DEV-TEST-B';
    const instBId = 'inst-uuid-b-222';
    const tokenB = signDeviceToken({ deviceId: devBId, installationId: instBId, centerId: centerB._id.toString() });
    let deviceB = await Device.findOne({ deviceId: devBId });
    if (!deviceB) {
      deviceB = await Device.create({
        centerId: centerB._id,
        deviceId: devBId,
        installationId: instBId,
        deviceName: 'Device B',
        authToken: tokenB,
        authTokenHash: crypto.createHash('sha256').update(tokenB).digest('hex'),
        status: 'ACTIVE'
      });
    } else {
      deviceB.status = 'ACTIVE';
      await deviceB.save();
    }

    console.log('📌 Running TEST A: Valid demo device token...');
    const resA = await request('GET', '/api/v1/app/pending-jobs', null, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': tokenA
    });
    assert(resA.status === 200, 'Valid device token returns HTTP 200');

    console.log('📌 Running TEST B: Missing device token...');
    const resB = await request('GET', '/api/v1/app/pending-jobs', null, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId
    });
    assert(resB.status === 401, 'Missing device token returns HTTP 401');

    console.log('📌 Running TEST C: Invalid device token...');
    const resC = await request('GET', '/api/v1/app/pending-jobs', null, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': 'invalid.token.signature'
    });
    assert(resC.status === 401, 'Invalid device token returns HTTP 401');

    console.log('📌 Running TEST D: Unknown device ID...');
    const unknownToken = signDeviceToken({ deviceId: 'PIP-DEV-UNKNOWN', installationId: 'inst-unknown', centerId: centerA._id.toString() });
    const resD = await request('GET', '/api/v1/app/pending-jobs', null, {
      'X-Device-Id': 'PIP-DEV-UNKNOWN',
      'X-Installation-Id': 'inst-unknown',
      'X-Device-Token': unknownToken
    });
    assert(resD.status === 401, 'Unknown device ID returns HTTP 401');

    console.log('📌 Running TEST E: Installation ID mismatch...');
    const resE = await request('GET', '/api/v1/app/pending-jobs', null, {
      'X-Device-Id': devAId,
      'X-Installation-Id': 'wrong-installation-id',
      'X-Device-Token': tokenA
    });
    assert(resE.status === 401, 'Installation ID mismatch returns HTTP 401');

    console.log('📌 Running TEST F: Revoked device access...');
    deviceA.status = 'REVOKED';
    await deviceA.save();
    const resF = await request('GET', '/api/v1/app/pending-jobs', null, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': tokenA
    });
    assert(resF.status === 403, 'Revoked device returns HTTP 403');
    deviceA.status = 'ACTIVE';
    await deviceA.save();

    console.log('📌 Running TEST G: Blocked device access...');
    deviceA.status = 'BLOCKED';
    await deviceA.save();
    const resG = await request('GET', '/api/v1/app/pending-jobs', null, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': tokenA
    });
    assert(resG.status === 403, 'Blocked device returns HTTP 403');
    deviceA.status = 'ACTIVE';
    await deviceA.save();

    console.log('📌 Running TEST H: Valid device + unpaid job exclusion...');
    const unpaidJobA = await Job.create({
      jobCode: `PIP-UNPAID-${Date.now()}`,
      centerId: centerA._id,
      customerName: 'Unpaid A',
      copies: 8,
      priceInr: 50,
      creditCost: 10,
      jobStatus: 'CREATED'
    });
    const resH = await request('GET', '/api/v1/app/pending-jobs', null, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': tokenA
    });
    const hasUnpaid = resH.data.data?.some((j) => j.jobCode === unpaidJobA.jobCode);
    assert(!hasUnpaid, 'Unpaid job is excluded from pending queue');

    console.log('📌 Running TEST I: Valid device + own paid job availability...');
    const paidJobA = await Job.create({
      jobCode: `PIP-PAID-${Date.now()}`,
      centerId: centerA._id,
      customerName: 'Paid A',
      copies: 8,
      priceInr: 50,
      creditCost: 10,
      jobStatus: 'QUEUED'
    });
    const resI = await request('GET', '/api/v1/app/pending-jobs', null, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': tokenA
    });
    const hasPaid = resI.data.data?.some((j) => j.jobCode === paidJobA.jobCode);
    assert(hasPaid, 'Own paid job is present in pending queue');

    console.log('📌 Running TEST J: Center A device requesting Center B job...');
    const jobB = await Job.create({
      jobCode: `PIP-JOB-B-${Date.now()}`,
      centerId: centerB._id,
      customerName: 'Customer B',
      copies: 8,
      priceInr: 50,
      creditCost: 10,
      jobStatus: 'QUEUED'
    });
    const resJ = await request('POST', `/api/v1/app/jobs/${jobB._id}/ack`, {}, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': tokenA
    });
    assert(resJ.status === 409 || resJ.status === 404, `Device A cannot claim Center B job (Status: ${resJ.status})`);

    console.log('📌 Running TEST K: Concurrent claim on same job...');
    const concurrentJob = await Job.create({
      jobCode: `PIP-CONC-${Date.now()}`,
      centerId: centerA._id,
      customerName: 'Conc Customer',
      copies: 8,
      priceInr: 50,
      creditCost: 10,
      jobStatus: 'QUEUED'
    });
    const claim1 = request('POST', `/api/v1/app/jobs/${concurrentJob._id}/ack`, {}, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': tokenA
    });
    const claim2 = request('POST', `/api/v1/app/jobs/${concurrentJob._id}/ack`, {}, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': tokenA
    });
    const [c1, c2] = await Promise.all([claim1, claim2]);
    const succCount = (c1.status === 200 ? 1 : 0) + (c2.status === 200 ? 1 : 0);
    assert(succCount === 1, 'Only one device successfully claimed the job');

    console.log('📌 Running TEST L: Heartbeat from revoked device...');
    deviceA.status = 'REVOKED';
    await deviceA.save();
    const resL = await request('POST', '/api/v1/devices/heartbeat', { printerStatus: { name: 'DNP' } }, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': tokenA
    });
    assert(resL.status === 403, 'Heartbeat from revoked device returns HTTP 403');
    deviceA.status = 'ACTIVE';
    await deviceA.save();

    console.log('📌 Running TEST M: Completion from revoked device...');
    deviceA.status = 'REVOKED';
    await deviceA.save();
    const resM = await request('POST', `/api/v1/app/jobs/${paidJobA._id}/complete`, { idempotencyKey: `rev_${Date.now()}` }, {
      'X-Device-Id': devAId,
      'X-Installation-Id': instAId,
      'X-Device-Token': tokenA
    });
    assert(resM.status === 403, 'Completion from revoked device returns HTTP 403');
    deviceA.status = 'ACTIVE';
    await deviceA.save();

    console.log('\n================================================================');
    console.log('🎉 ALL 13 PHASE 2A TESTS (A through M) PASSED WITH 100% SUCCESS!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ PHASE 2A TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await disconnectDB();
  }
}

if (require.main === module) {
  runPhase2aTests();
}

module.exports = { runPhase2aTests };
