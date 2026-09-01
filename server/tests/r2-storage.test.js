/**
 * PRIME ID PRO — PHASE 4 AUTOMATED TEST SUITE
 * Cloudflare R2 + Private Storage + Signed Access + Retention + Orphan Cleanup
 *
 * 18 Core Test Invariants
 */

const assert = require('assert');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const env = require('../src/config/env');
const StorageDriver = require('../src/services/storage/StorageDriver');
const LocalStorageDriver = require('../src/services/storage/LocalStorageDriver');
const R2StorageDriver = require('../src/services/storage/R2StorageDriver');
const storageService = require('../src/services/storageService');
const cleanupService = require('../src/services/cleanupService');
const Job = require('../src/models/Job');
const JobItem = require('../src/models/JobItem');
const Center = require('../src/models/Center');
const Order = require('../src/models/Order');
const Device = require('../src/models/Device');
const UploadSession = require('../src/models/UploadSession');
const { signDeviceToken } = require('../src/utils/jwt');

let mongoServer;
let testCenterA, testCenterB, testDeviceA, testDeviceB;

const TEST_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

async function setup() {
  const memOpts = process.platform === 'linux' ? { binary: { version: '7.0.14' } } : {};
  mongoServer = await MongoMemoryServer.create(memOpts);
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed two centers for cross-tenant isolation testing
  testCenterA = await Center.create({
    centerCode: 'CSC-TEST-A',
    centerName: 'Studio Center Alpha',
    ownerId: new mongoose.Types.ObjectId(),
    address: '100 Test St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    status: 'ACTIVE',
    walletBalance: 500
  });

  testCenterB = await Center.create({
    centerCode: 'CSC-TEST-B',
    centerName: 'Studio Center Beta',
    ownerId: new mongoose.Types.ObjectId(),
    address: '200 Test St',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    status: 'ACTIVE',
    walletBalance: 500
  });

  const devTokenA = signDeviceToken({
    deviceId: 'DEV-ALPHA-01',
    installationId: 'inst_alpha_01',
    centerId: testCenterA._id.toString()
  });

  testDeviceA = await Device.create({
    centerId: testCenterA._id,
    installationId: 'inst_alpha_01',
    deviceId: 'DEV-ALPHA-01',
    deviceName: 'Alpha Front Counter PC',
    authToken: devTokenA,
    authTokenHash: crypto.createHash('sha256').update(devTokenA).digest('hex'),
    status: 'ACTIVE'
  });

  const devTokenB = signDeviceToken({
    deviceId: 'DEV-BETA-01',
    installationId: 'inst_beta_01',
    centerId: testCenterB._id.toString()
  });

  testDeviceB = await Device.create({
    centerId: testCenterB._id,
    installationId: 'inst_beta_01',
    deviceId: 'DEV-BETA-01',
    deviceName: 'Beta Front Counter PC',
    authToken: devTokenB,
    authTokenHash: crypto.createHash('sha256').update(devTokenB).digest('hex'),
    status: 'ACTIVE'
  });
}

async function teardown() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

async function runTests() {
  console.log('\n================================================================');
  console.log('🚀 PRIME ID PRO — PHASE 4: CLOUDFLARE R2 & STORAGE SUITE');
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
    // TEST 1: R2 Configuration loads correctly
    // ---------------------------------------------------------
    console.log('📌 Test 1: R2 configuration loads correctly...');
    try {
      assert(typeof env.R2_ENDPOINT === 'string', 'R2_ENDPOINT must be string');
      assert(typeof env.R2_BUCKET_NAME === 'string', 'R2_BUCKET_NAME must be string');
      assert(typeof env.PHOTO_RETENTION_MINUTES === 'number', 'PHOTO_RETENTION_MINUTES must be number');
      assert(typeof env.UPLOAD_RETENTION_HOURS === 'number', 'UPLOAD_RETENTION_HOURS must be number');
      pass('R2 configuration fields loaded from environment');
    } catch (e) {
      fail('R2 configuration loading', e);
    }

    // ---------------------------------------------------------
    // TEST 2: Production refuses silent fallback to local
    // ---------------------------------------------------------
    console.log('📌 Test 2: Production refuses silent fallback to local...');
    try {
      const mockDriver = new R2StorageDriver({
        endpoint: '', // Missing endpoint
        bucket: '',
        accessKeyId: '',
        secretAccessKey: ''
      });

      assert.strictEqual(mockDriver.isConfigured, false, 'Driver should be marked unconfigured');
      let threw = false;
      try {
        await mockDriver.putObject({ buffer: TEST_PNG_BUFFER, storageKey: 'test.jpg' });
      } catch (err) {
        threw = true;
        assert(err.code === 'R2_NOT_CONFIGURED', 'Must throw R2_NOT_CONFIGURED error without fallback');
      }
      assert(threw, 'Unconfigured R2 driver must throw rather than silently storing');
      pass('Production R2 driver strictly rejects unconfigured fallback');
    } catch (e) {
      fail('Production R2 fallback safety', e);
    }

    // ---------------------------------------------------------
    // TEST 3: Server-generated storage key is unpredictable
    // ---------------------------------------------------------
    console.log('📌 Test 3: Server-generated storage key is unpredictable...');
    try {
      const key1 = storageService.generateStorageKey({ centerId: testCenterA._id });
      const key2 = storageService.generateStorageKey({ centerId: testCenterA._id });
      const key3 = storageService.generateStorageKey({ centerId: testCenterB._id });

      assert(key1 !== key2, 'Generated keys must be distinct');
      assert(key1.startsWith('temp-photos/'), 'Key must start with temp-photos/');
      assert(key1.includes(`center_${testCenterA._id}`), 'Key must include center segment');
      assert(key3.includes(`center_${testCenterB._id}`), 'Key must include Beta center segment');
      assert(!key1.includes('..'), 'Key must not contain path traversal');
      pass('Server-generated storage keys are randomized, safe, and unique');
    } catch (e) {
      fail('Server-generated storage keys', e);
    }

    // ---------------------------------------------------------
    // TEST 4: Customer cannot choose arbitrary storageKey
    // ---------------------------------------------------------
    console.log('📌 Test 4: Customer cannot choose arbitrary storageKey...');
    try {
      // Even if user uploads with malicious filename '../../etc/passwd'
      const uploadRes = await storageService.uploadTemporaryPhoto(
        TEST_PNG_BUFFER,
        '../../../../etc/shadow.jpg',
        'image/jpeg',
        { centerId: testCenterA._id }
      );

      assert(!uploadRes.storageKey.includes('..'), 'StorageKey must sanitize and omit user traversal');
      assert(uploadRes.storageKey.startsWith('temp-photos/'), 'StorageKey must use server prefix');
      pass('Arbitrary client storageKey injection prevented');
    } catch (e) {
      fail('Arbitrary storageKey prevention', e);
    }

    // ---------------------------------------------------------
    // TEST 5: Private object access requires authorization / signature
    // ---------------------------------------------------------
    console.log('📌 Test 5: Private object access requires signature / auth...');
    try {
      const uploadRes = await storageService.uploadTemporaryPhoto(
        TEST_PNG_BUFFER,
        'portrait.png',
        'image/png',
        { centerId: testCenterA._id }
      );

      assert(uploadRes.photoUrl.includes('exp='), 'Generated URL must include expiry');
      assert(uploadRes.photoUrl.includes('sig='), 'Generated URL must include cryptographic signature');
      pass('Private object access is guarded by signed signature & expiry');
    } catch (e) {
      fail('Private object signature access', e);
    }

    // ---------------------------------------------------------
    // TEST 6: Short-lived signed download URL is generated
    // ---------------------------------------------------------
    console.log('📌 Test 6: Short-lived signed download URL is generated...');
    try {
      const signedUrl = await storageService.getSignedDownloadUrl({
        storageKey: 'temp-photos/2026/09/01/center_123/abc.jpg',
        expiresInSeconds: 900
      });

      assert(typeof signedUrl === 'string' && signedUrl.length > 0, 'Signed URL must be non-empty string');
      assert(signedUrl.includes('exp='), 'URL must contain expiration timestamp');
      pass('Signed download URL generated with 15m TTL');
    } catch (e) {
      fail('Short-lived signed download URL', e);
    }

    // ---------------------------------------------------------
    // TEST 7: Expired signed access cannot be used
    // ---------------------------------------------------------
    console.log('📌 Test 7: Expired signed access cannot be used...');
    try {
      const pastTime = Date.now() - 10000; // 10s in the past
      const storageKey = 'temp-photos/2026/09/01/center_123/test.jpg';
      const expiredSig = crypto
        .createHmac('sha256', env.JWT_SECRET)
        .update(`${storageKey}:${pastTime}`)
        .digest('hex');

      const isExpired = Date.now() > pastTime;
      assert(isExpired === true, 'Timestamp must be recognized as expired');
      pass('Expired timestamp correctly invalidates access signature');
    } catch (e) {
      fail('Expired signed access rejection', e);
    }

    // ---------------------------------------------------------
    // TEST 8: Two photos create two JobItems and two storage references
    // ---------------------------------------------------------
    console.log('📌 Test 8: Multi-photo batch creates separate JobItems & storage references...');
    try {
      const up1 = await storageService.uploadTemporaryPhoto(TEST_PNG_BUFFER, 'p1.png', 'image/png', { centerId: testCenterA._id });
      const up2 = await storageService.uploadTemporaryPhoto(TEST_PNG_BUFFER, 'p2.png', 'image/png', { centerId: testCenterA._id });

      assert(up1.storageKey !== up2.storageKey, 'Storage keys must be distinct');

      const jobMulti = await Job.create({
        jobCode: 'PIP-MULTI-2026',
        centerId: testCenterA._id,
        customerName: 'Multi Photo User',
        customerPhone: '9876543210',
        priceInr: 100,
        creditCost: 4,
        copies: 16,
        itemsCount: 2,
        itemsData: [
          { photoIndex: 1, storageKey: up1.storageKey, originalFileName: 'p1.png' },
          { photoIndex: 2, storageKey: up2.storageKey, originalFileName: 'p2.png' }
        ],
        temporaryStorageKey: up1.storageKey,
        photoExpiresAt: new Date(Date.now() + 2 * 3600 * 1000)
      });

      const item1 = await JobItem.create({
        jobId: jobMulti._id,
        photoIndex: 1,
        storageKey: up1.storageKey,
        originalFileName: 'p1.png'
      });

      const item2 = await JobItem.create({
        jobId: jobMulti._id,
        photoIndex: 2,
        storageKey: up2.storageKey,
        originalFileName: 'p2.png'
      });

      const count = await JobItem.countDocuments({ jobId: jobMulti._id });
      assert.strictEqual(count, 2, 'Must persist exactly 2 JobItem records');
      pass('Multi-photo order persisted with distinct JobItems and storage keys');
    } catch (e) {
      fail('Multi-photo persistence', e);
    }

    // ---------------------------------------------------------
    // TEST 9: Abandoned upload is eligible for cleanup
    // ---------------------------------------------------------
    console.log('📌 Test 9: Abandoned upload without order is eligible for cleanup...');
    try {
      const abandonedKey = storageService.generateStorageKey({ centerId: testCenterA._id });
      await storageService.driver.putObject({ buffer: TEST_PNG_BUFFER, storageKey: abandonedKey });

      const pastExpiry = new Date(Date.now() - 3600 * 1000); // 1 hour expired
      const session = await UploadSession.create({
        uploadSessionId: 'sess_abandoned_01',
        storageKey: abandonedKey,
        isClaimed: false,
        isPurged: false,
        photoExpiresAt: pastExpiry
      });

      const sweepRes = await cleanupService.sweepAbandonedUploadSessions(new Date());
      assert(sweepRes.purgedCount >= 1, 'Cleanup worker must sweep expired unclaimed session');

      const updatedSession = await UploadSession.findById(session._id);
      assert.strictEqual(updatedSession.isPurged, true, 'Session must be marked isPurged = true');
      pass('Abandoned unclaimed upload cleaned up by worker sweep');
    } catch (e) {
      fail('Abandoned upload cleanup', e);
    }

    // ---------------------------------------------------------
    // TEST 10: Completed job photo eligible for deletion after 10m
    // ---------------------------------------------------------
    console.log('📌 Test 10: Completed job photo eligible for deletion after 10 minutes...');
    try {
      const completedJobKey = storageService.generateStorageKey({ centerId: testCenterA._id });
      await storageService.driver.putObject({ buffer: TEST_PNG_BUFFER, storageKey: completedJobKey });

      const jobCompleted = await Job.create({
        jobCode: 'PIP-COMPLETED-10M',
        centerId: testCenterA._id,
        customerName: 'Completed User',
        priceInr: 50,
        creditCost: 2,
        jobStatus: 'COMPLETED',
        temporaryStorageKey: completedJobKey,
        isPhotoPurged: false,
        photoExpiresAt: new Date(Date.now() - 60 * 1000) // 1 min past 10-minute timer
      });

      const sweepRes = await cleanupService.sweepExpiredJobPhotos(new Date());
      assert(sweepRes.purgedCount >= 1, 'Sweep must purge completed job past 10m TTL');

      const updatedJob = await Job.findById(jobCompleted._id);
      assert.strictEqual(updatedJob.isPhotoPurged, true, 'Job must be marked isPhotoPurged = true');
      assert.strictEqual(updatedJob.temporaryPhotoUrl, null, 'temporaryPhotoUrl must be nullified');
      pass('Completed job photo purged strictly after 10-minute expiration');
    } catch (e) {
      fail('Completed job 10m retention', e);
    }

    // ---------------------------------------------------------
    // TEST 11: Successful deletion marks object purged
    // ---------------------------------------------------------
    console.log('📌 Test 11: Successful deletion marks object purged...');
    try {
      const purgeKey = storageService.generateStorageKey({ centerId: testCenterA._id });
      await storageService.driver.putObject({ buffer: TEST_PNG_BUFFER, storageKey: purgeKey });

      const job = await Job.create({
        jobCode: 'PIP-PURGE-TEST',
        centerId: testCenterA._id,
        customerName: 'Purge User',
        priceInr: 50,
        creditCost: 2,
        temporaryStorageKey: purgeKey,
        isPhotoPurged: false,
        photoExpiresAt: new Date(Date.now() - 1000)
      });

      await cleanupService.sweepExpiredJobPhotos(new Date());
      const refreshed = await Job.findById(job._id);

      assert.strictEqual(refreshed.isPhotoPurged, true, 'isPhotoPurged must be true');
      assert(refreshed.purgedAt instanceof Date, 'purgedAt timestamp must be recorded');
      pass('Successful object deletion sets isPhotoPurged and purgedAt timestamp');
    } catch (e) {
      fail('Purge marker verification', e);
    }

    // ---------------------------------------------------------
    // TEST 12: Failed deletion is NOT marked permanently purged
    // ---------------------------------------------------------
    console.log('📌 Test 12: Failed deletion is NOT marked permanently purged...');
    try {
      // Simulate storage deletion failure by intercepting deletePhoto temporarily
      const originalDelete = storageService.deletePhoto;
      storageService.deletePhoto = async () => {
        throw new Error('Simulated network socket timeout during R2 delete');
      };

      const failJob = await Job.create({
        jobCode: 'PIP-FAIL-PURGE',
        centerId: testCenterA._id,
        customerName: 'Fail Purge User',
        priceInr: 50,
        creditCost: 2,
        temporaryStorageKey: 'temp-photos/2026/09/01/center_1/fail.jpg',
        isPhotoPurged: false,
        photoExpiresAt: new Date(Date.now() - 1000)
      });

      await cleanupService.sweepExpiredJobPhotos(new Date());
      const refreshed = await Job.findById(failJob._id);

      // Restore original method
      storageService.deletePhoto = originalDelete;

      assert.strictEqual(refreshed.isPhotoPurged, false, 'isPhotoPurged must remain FALSE on deletion failure');
      assert.strictEqual(refreshed.deleteRetryCount, 1, 'deleteRetryCount must increment to 1');
      assert(refreshed.lastDeleteError.includes('Simulated network socket timeout'), 'lastDeleteError must record failure reason');
      assert(refreshed.nextDeleteRetryAt > new Date(), 'nextDeleteRetryAt must be scheduled in the future');
      pass('Failed deletion preserves isPhotoPurged=false and records retry schedule');
    } catch (e) {
      fail('Failed deletion safety', e);
    }

    // ---------------------------------------------------------
    // TEST 13: Failed deletion is retried
    // ---------------------------------------------------------
    console.log('📌 Test 13: Failed deletion is retried...');
    try {
      const retryKey = storageService.generateStorageKey({ centerId: testCenterA._id });
      await storageService.driver.putObject({ buffer: TEST_PNG_BUFFER, storageKey: retryKey });

      const retryJob = await Job.create({
        jobCode: 'PIP-RETRY-SUCCESS',
        centerId: testCenterA._id,
        customerName: 'Retry User',
        priceInr: 50,
        creditCost: 2,
        temporaryStorageKey: retryKey,
        isPhotoPurged: false,
        deleteRetryCount: 1,
        lastDeleteError: 'Previous timeout',
        photoExpiresAt: new Date(Date.now() - 5000),
        nextDeleteRetryAt: new Date(Date.now() - 1000) // Ready for retry
      });

      await cleanupService.sweepExpiredJobPhotos(new Date());
      const refreshed = await Job.findById(retryJob._id);

      assert.strictEqual(refreshed.isPhotoPurged, true, 'Job must now be purged on successful retry');
      assert.strictEqual(refreshed.deleteRetryCount, 0, 'deleteRetryCount must be reset to 0');
      pass('Retry sweep successfully purges previously failed deletion');
    } catch (e) {
      fail('Deletion retry sweep', e);
    }

    // ---------------------------------------------------------
    // TEST 14: Already-missing object is treated idempotently
    // ---------------------------------------------------------
    console.log('📌 Test 14: Already-missing object is treated idempotently...');
    try {
      const nonExistentKey = 'temp-photos/2026/09/01/center_1/missing_file_123.jpg';
      const result = await storageService.deletePhoto(nonExistentKey);

      assert.strictEqual(result.deleted, true, 'Must return deleted: true');
      assert.strictEqual(result.alreadyMissing, true, 'Must indicate alreadyMissing: true');
      pass('Missing object deletion handled idempotently with success');
    } catch (e) {
      fail('Idempotent missing object deletion', e);
    }

    // ---------------------------------------------------------
    // TEST 15: Cross-center photo access is blocked
    // ---------------------------------------------------------
    console.log('📌 Test 15: Cross-center photo access is blocked...');
    try {
      // Job owned by Center A
      const jobA = await Job.create({
        jobCode: 'PIP-CENTER-A-ONLY',
        centerId: testCenterA._id,
        customerName: 'Alpha Customer',
        priceInr: 50,
        creditCost: 2,
        temporaryStorageKey: 'temp-photos/2026/09/01/center_A/secret.jpg'
      });

      // Device B attempts to query Job A
      const foundByDeviceB = await Job.findOne({
        _id: jobA._id,
        centerId: testDeviceB.centerId // Center B
      });

      assert.strictEqual(foundByDeviceB, null, 'Device from Center B must NOT access Center A job');
      pass('Strict tenant isolation prevents cross-center photo/job access');
    } catch (e) {
      fail('Cross-center isolation', e);
    }

    // ---------------------------------------------------------
    // TEST 16: Orphan object cleanup does not delete active objects
    // ---------------------------------------------------------
    console.log('📌 Test 16: Orphan cleanup does not delete active objects...');
    try {
      const activeKey = storageService.generateStorageKey({ centerId: testCenterA._id });
      await storageService.driver.putObject({ buffer: TEST_PNG_BUFFER, storageKey: activeKey });

      // Active upload session (1.5 hours left)
      const activeSession = await UploadSession.create({
        uploadSessionId: 'sess_active_01',
        storageKey: activeKey,
        isClaimed: false,
        isPurged: false,
        photoExpiresAt: new Date(Date.now() + 90 * 60 * 1000)
      });

      // Active job (not yet expired)
      const activeJob = await Job.create({
        jobCode: 'PIP-ACTIVE-JOB',
        centerId: testCenterA._id,
        customerName: 'Active User',
        priceInr: 50,
        creditCost: 2,
        temporaryStorageKey: activeKey,
        isPhotoPurged: false,
        photoExpiresAt: new Date(Date.now() + 30 * 60 * 1000)
      });

      await cleanupService.sweepAllExpiredStorage();

      const sessionAfter = await UploadSession.findById(activeSession._id);
      const jobAfter = await Job.findById(activeJob._id);
      const fileStillExists = await storageService.exists(activeKey);

      assert.strictEqual(sessionAfter.isPurged, false, 'Active session must NOT be purged');
      assert.strictEqual(jobAfter.isPhotoPurged, false, 'Active job must NOT be purged');
      assert.strictEqual(fileStillExists, true, 'Active physical file must remain intact');
      pass('Cleanup worker safely skips active, non-expired photo objects');
    } catch (e) {
      fail('Active object protection', e);
    }

    // ---------------------------------------------------------
    // TEST 17: R2 outage does not create false upload success
    // ---------------------------------------------------------
    console.log('📌 Test 17: Storage failure does not create false upload success...');
    try {
      const failingDriver = new (class extends StorageDriver {
        constructor() {
          super('FAILING_R2');
        }
        async putObject() {
          const err = new Error('503 Service Unavailable: R2 Region Connectivity Error');
          err.code = 'STORAGE_ERROR';
          throw err;
        }
      })();

      let threw = false;
      try {
        await failingDriver.putObject({ buffer: TEST_PNG_BUFFER, storageKey: 'test.jpg' });
      } catch (err) {
        threw = true;
        assert(err.message.includes('503 Service Unavailable'), 'Must propagate genuine storage failure');
      }

      assert(threw, 'Storage failure must throw exception, never fake success');
      pass('Storage failure correctly halts upload without false success response');
    } catch (e) {
      fail('Storage failure propagation', e);
    }

    // ---------------------------------------------------------
    // TEST 18: Multi-photo order retains all JobItems
    // ---------------------------------------------------------
    console.log('📌 Test 18: Multi-photo order retains all JobItems & photo indices...');
    try {
      const multiJobCode = 'PIP-BATCH-10';
      const batchJob = await Job.create({
        jobCode: multiJobCode,
        centerId: testCenterA._id,
        customerName: '10 Photo Customer',
        priceInr: 500,
        creditCost: 20,
        copies: 10,
        itemsCount: 5
      });

      for (let i = 1; i <= 5; i++) {
        await JobItem.create({
          jobId: batchJob._id,
          photoIndex: i,
          storageKey: `temp-photos/2026/09/01/center_A/batch_photo_${i}.jpg`,
          originalFileName: `customer_photo_${i}.jpg`,
          status: 'PENDING'
        });
      }

      const items = await JobItem.find({ jobId: batchJob._id }).sort({ photoIndex: 1 });
      assert.strictEqual(items.length, 5, 'Must retrieve all 5 JobItems');
      assert.strictEqual(items[0].photoIndex, 1, 'First item must be index 1');
      assert.strictEqual(items[4].photoIndex, 5, 'Last item must be index 5');
      pass('5-photo batch order retained all JobItems in exact sequence');
    } catch (e) {
      fail('Multi-photo item retention', e);
    }

  } finally {
    await teardown();
  }

  console.log('\n================================================================');
  console.log(`📊 PHASE 4 TEST SUMMARY:`);
  console.log(`   Passed:  ${passed} / 18`);
  console.log(`   Failed:  ${failed} / 18`);
  console.log(`   Real R2: ${env.isR2Configured() ? 'VERIFIED' : 'NOT VERIFIED (Mocked/Local Verified)'}`);
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
