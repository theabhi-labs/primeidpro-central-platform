const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Center = require('../src/models/Center');
const Device = require('../src/models/Device');
const { signToken } = require('../src/utils/jwt');

let mongoServer;
let server;
let baseUrl;

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      method: method.toUpperCase(),
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function runFixVerification() {
  console.log('🚀 Running Verification for 4 Production Fixes...\n');

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // 1. Create a Test Studio Center & Operator
  const center = await Center.create({
    ownerId: new mongoose.Types.ObjectId(),
    centerName: 'JAS Digital Studio',
    centerCode: 'CSC-GR-1359',
    slug: 'jas-digital-studio',
    qrToken: 'test-qr-token-12345',
    address: 'Main Market Road',
    city: 'Gorakhpur',
    state: 'Uttar Pradesh',
    pincode: '273001',
    phone: '9876543210',
    email: 'jas@primeidpro.test',
    status: 'ACTIVE',
    serviceSettings: {
      pricePerPhoto: 7,
      minimumQuantity: 3,
      maximumQuantity: 20,
      quantityStep: 1,
      onlinePaymentEnabled: true,
      cashPaymentEnabled: true,
      serviceEnabled: true
    }
  });

  const operator = await User.create({
    name: 'Abhishek Yadav',
    email: 'operator@jas.test',
    passwordHash: 'dummyhash123',
    role: 'CSC',
    centerId: center._id,
    phone: '9876543210'
  });

  const authHeaders = {
    Authorization: `Bearer ${signToken({ id: operator._id, role: operator.role, centerId: center._id })}`
  };

  // Test 1: GET /api/v1/centers/me
  console.log('📌 Test 1: GET /api/v1/centers/me returns Studio Profile...');
  const meRes = await request('GET', '/api/v1/centers/me', null, authHeaders);

  if (meRes.status === 200 && meRes.body.data?.centerCode === 'CSC-GR-1359') {
    console.log('  ✅ [PASS] /api/v1/centers/me returned 200 with center details');
  } else {
    throw new Error(`Test 1 Failed: status ${meRes.status}, body: ${JSON.stringify(meRes.body)}`);
  }

  // Test 2: GET /api/v1/centers/service-settings
  console.log('📌 Test 2: GET /api/v1/centers/service-settings returns settings & center data...');
  const settingsRes = await request('GET', '/api/v1/centers/service-settings', null, authHeaders);

  if (settingsRes.status === 200 && settingsRes.body.data?.pricePerPhoto === 7 && settingsRes.body.data?.qrToken) {
    console.log('  ✅ [PASS] /api/v1/centers/service-settings returned 200 with settings and qrToken');
  } else {
    throw new Error(`Test 2 Failed: status ${settingsRes.status}, body: ${JSON.stringify(settingsRes.body)}`);
  }

  // Test 3: QR Code Resolution by qrToken, slug, and centerCode
  console.log('📌 Test 3: Public QR Token resolution (/api/v1/public/qr/:token)...');
  const qrRes = await request('GET', `/api/v1/public/qr/${center.qrToken}`);
  const slugRes = await request('GET', `/api/v1/public/qr/${center.slug}`);
  const codeRes = await request('GET', `/api/v1/public/qr/${center.centerCode}`);

  if (qrRes.status === 200 && slugRes.status === 200 && codeRes.status === 200) {
    console.log('  ✅ [PASS] Public QR resolution resolved successfully by qrToken, slug, and centerCode');
  } else {
    throw new Error(`Test 3 Failed: qr=${qrRes.status}, slug=${slugRes.status}, code=${codeRes.status}`);
  }

  // Test 4: Device Online Status (last seen 2 minutes ago is ONLINE)
  console.log('📌 Test 4: Device online calculation (2 minutes ago must be ONLINE)...');
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const device = await Device.create({
    centerId: center._id,
    deviceId: 'PIP-DEV-EC3D81D8',
    installationId: 'inst-test-1234',
    deviceName: 'Front Counter PC',
    status: 'ACTIVE',
    lastSeenAt: twoMinutesAgo
  });

  const devicesRes = await request('GET', '/api/v1/centers/devices', null, authHeaders);

  const matchedDevice = devicesRes.body.data?.find((d) => d.deviceId === 'PIP-DEV-EC3D81D8');
  if (matchedDevice && matchedDevice.isOnline === true) {
    console.log('  ✅ [PASS] Device seen 2 minutes ago correctly marked isOnline: true');
  } else {
    throw new Error(`Test 4 Failed: isOnline is ${matchedDevice?.isOnline}`);
  }

  console.log('\n================================================================');
  console.log('🎉 ALL 4 PRODUCTION FIX TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================\n');

  if (server) server.close();
  await mongoose.disconnect();
  await mongoServer.stop();
  process.exit(0);
}

runFixVerification().catch(async (err) => {
  console.error('❌ Verification Failed:', err);
  if (server) server.close();
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  process.exit(1);
});
