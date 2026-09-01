const { verifyDeviceToken } = require('../utils/jwt');
const Device = require('../models/Device');
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

    if (!deviceToken) {
      return ApiResponse.error(res, 'Device authentication token required (X-Device-Token header)', 401);
    }

    let decoded;
    try {
      decoded = verifyDeviceToken(deviceToken);
    } catch {
      return ApiResponse.error(res, 'Invalid or expired device token', 401);
    }

    const targetDeviceId = decoded.deviceId || deviceId;
    if (!targetDeviceId) {
      return ApiResponse.error(res, 'Device identity missing from token and headers', 401);
    }

    // Header device ID must match token payload if both are provided
    if (deviceId && decoded.deviceId && deviceId !== decoded.deviceId) {
      return ApiResponse.error(res, 'Device identifier mismatch between header and token', 401);
    }

    const device = await Device.findOne({ deviceId: targetDeviceId });
    if (!device) {
      return ApiResponse.error(res, 'Device not registered or binding removed', 401);
    }

    // Verify installation identity
    if (installationId && device.installationId && device.installationId !== installationId) {
      return ApiResponse.error(res, 'Device installation identity mismatch', 401);
    }
    if (decoded.installationId && device.installationId && device.installationId !== decoded.installationId) {
      return ApiResponse.error(res, 'Device installation identity mismatch in token', 401);
    }

    // Verify center binding
    if (decoded.centerId && device.centerId.toString() !== decoded.centerId.toString()) {
      return ApiResponse.error(res, 'Device center binding mismatch', 401);
    }

    if (device.status === 'REVOKED') {
      return ApiResponse.error(res, 'Device access has been revoked by studio operator or administrator', 403);
    }

    if (device.status === 'BLOCKED') {
      return ApiResponse.error(res, 'Device has been blocked due to security violations', 403);
    }

    if (device.status === 'PENDING') {
      return ApiResponse.error(res, 'Device registration is pending activation', 403);
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
