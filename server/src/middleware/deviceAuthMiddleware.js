const { verifyDeviceToken } = require('../utils/jwt');
const Device = require('../models/Device');
const Center = require('../models/Center');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const authenticateDevice = async (req, res, next) => {
  try {
    const deviceToken =
      req.headers['x-device-token'] ||
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);
    const deviceId = req.headers['x-device-id'];
    const installationId = req.headers['x-installation-id'];
    const centerCode = req.headers['x-center-code'];
    const centerId = req.headers['x-center-id'];

    let device = null;

    // 1. Try verify deviceToken if provided
    if (deviceToken) {
      try {
        const decoded = verifyDeviceToken(deviceToken);
        const targetDeviceId = decoded.deviceId || deviceId;
        if (targetDeviceId) {
          device = await Device.findOne({ deviceId: targetDeviceId });
        }
      } catch (tokenErr) {
        logger.debug(`[DeviceAuth] Token verification note: ${tokenErr.message}`);
      }
    }

    // 2. Lookup by deviceId if not resolved yet
    if (!device && deviceId) {
      device = await Device.findOne({ deviceId, status: { $ne: 'REVOKED' } });
    }

    // 3. Lookup by installationId if not resolved yet
    if (!device && installationId) {
      device = await Device.findOne({ installationId, status: { $ne: 'REVOKED' } });
    }

    // 4. Lookup by Center Code if provided
    if (!device && centerCode) {
      const cleanCode = centerCode.toUpperCase().trim();
      const center = await Center.findOne({ centerCode: cleanCode, status: 'ACTIVE' });
      if (center) {
        device = await Device.findOne({ centerId: center._id, status: { $ne: 'REVOKED' } });
        if (!device) {
          device = await Device.create({
            deviceId: deviceId || `PIP-DEV-${Date.now()}`,
            centerId: center._id,
            installationId: installationId || `inst-${Date.now()}`,
            status: 'ACTIVE',
            deviceName: 'Front Counter PC'
          });
        }
      }
    }

    // 5. Lookup by centerId if provided
    if (!device && centerId) {
      device = await Device.findOne({ centerId, status: { $ne: 'REVOKED' } });
      if (!device) {
        const center = await Center.findById(centerId);
        if (center && center.status === 'ACTIVE') {
          device = await Device.create({
            deviceId: deviceId || `PIP-DEV-${Date.now()}`,
            centerId: center._id,
            installationId: installationId || `inst-${Date.now()}`,
            status: 'ACTIVE',
            deviceName: 'Front Counter PC'
          });
        }
      }
    }

    if (!device) {
      return ApiResponse.error(res, 'Device authorization failed. Please pair or connect your account.', 401);
    }

    if (device.status === 'REVOKED') {
      return ApiResponse.error(res, 'Device access has been revoked by studio operator or administrator', 403);
    }

    if (device.status === 'BLOCKED') {
      return ApiResponse.error(res, 'Device has been blocked due to security violations', 403);
    }

    // Ensure status is active
    if (device.status === 'PENDING') {
      device.status = 'ACTIVE';
    }

    // Gracefully sync installation identity if client updated or reinstalled
    if (installationId && device.installationId !== installationId) {
      device.installationId = installationId;
    }

    // Update last seen & IP
    device.lastSeenAt = new Date();
    device.ipAddress = req.ip || req.connection?.remoteAddress || '';
    if (req.headers['x-app-version']) {
      device.appVersion = req.headers['x-app-version'];
    }
    await device.save();

    req.device = device;
    req.centerId = device.centerId;
    next();
  } catch (err) {
    logger.error(`[DeviceAuth] Authentication error: ${err.message}`);
    return ApiResponse.error(res, 'Device authorization failed', 401);
  }
};

authenticateDevice.authenticateDevice = authenticateDevice;

module.exports = authenticateDevice;
