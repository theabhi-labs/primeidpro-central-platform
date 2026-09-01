const mongoose = require('mongoose');
const env = require('./env');

let mongod = null;

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);

    // First attempt to connect to the configured MONGODB_URI with a 3s timeout
    const sanitizedUri = env.MONGODB_URI && env.MONGODB_URI.includes('@')
      ? env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
      : env.MONGODB_URI;
    console.log(`[Database] Attempting connection to MongoDB at: ${sanitizedUri}`);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });

    console.log(`[Database] MongoDB successfully connected to external instance: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  } catch (error) {
    console.warn(`[Database] External MongoDB connection failed (${error.message}).`);

    // Strictly enforce no in-memory database fallback in production
    if (env.USE_MEMORY_DB_FALLBACK && env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Starting embedded in-memory MongoDB engine for zero-dependency local execution...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        await mongoose.connect(uri);
        console.log(`[Database] In-memory MongoDB successfully initialized at ${uri}`);
      } catch (memErr) {
        console.error('[Database] Failed to initialize in-memory MongoDB fallback:', memErr);
        throw memErr;
      }
    } else {
      console.error('[Database] MongoDB connection failed and memory fallback is disabled for safety.');
      throw error;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection runtime error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected.');
  });
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[Database] MongoDB connection closed cleanly.');
  } catch (error) {
    console.error('[Database] Error closing database connection:', error);
  }
};

module.exports = { connectDB, closeDB, disconnectDB: closeDB };
