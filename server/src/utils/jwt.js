const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (payload, expiresIn = env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(payload, env.JWT_SECRET || 'default_jwt_secret', { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET || 'default_jwt_secret');
};

const generateDeviceToken = (payload) => {
  return jwt.sign(payload, env.DEVICE_JWT_SECRET || 'default_device_secret', { expiresIn: '365d' });
};

const verifyDeviceToken = (token) => {
  return jwt.verify(token, env.DEVICE_JWT_SECRET || 'default_device_secret');
};

module.exports = {
  generateToken,
  signToken: generateToken,
  verifyToken,
  generateDeviceToken,
  signDeviceToken: generateDeviceToken,
  verifyDeviceToken
};
