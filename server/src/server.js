const app = require('./app');
const env = require('./config/env');
const { connectDB, closeDB } = require('./config/db');
const { seedDefaultData } = require('./utils/seeder');
const cleanupService = require('./services/cleanupService');
const logger = require('./utils/logger');

let server;

const startServer = async () => {
  try {
    // 0. Validate production environment configuration
    env.validateProductionConfig({ throwOnFailure: true });

    // 1. Connect to Database (with in-memory fallback if local daemon is stopped in dev/test)
    await connectDB();

    // 2. Seed default data (Super Admin, Demo CSC Studio, Pricing Rules, Releases)
    await seedDefaultData();

    // 3. Start Privacy Cleanup Worker for 10-minute expired customer photos
    cleanupService.start();

    // 4. Start HTTP Server
    server = app.listen(env.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 PRIME ID PRO CENTRAL WEB PLATFORM IS RUNNING!`);
      logger.info(`🌐 Domain: ${env.DOMAIN}`);
      logger.info(`📡 API Server: http://localhost:${env.PORT}`);
      logger.info(`💻 Mode: ${env.NODE_ENV}`);
      logger.info(`🔐 Storage Driver: ${env.STORAGE_DRIVER}`);
      logger.info(`💳 Razorpay Test Mode: ${env.PAYMENT_TEST_MODE}`);
      logger.info(`=======================================================`);
    });
  } catch (error) {
    logger.error('Failed to start Prime ID Pro central server:', error);
    process.exit(1);
  }
};

const handleShutdown = async (signal) => {
  logger.info(`[Server] Received ${signal}. Starting graceful shutdown...`);
  cleanupService.stop();

  if (server) {
    server.close(async () => {
      logger.info('[Server] HTTP server closed.');
      await closeDB();
      process.exit(0);
    });
  } else {
    await closeDB();
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();
