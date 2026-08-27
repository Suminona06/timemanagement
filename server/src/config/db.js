const mongoose = require('mongoose');

/**
 * Establishes a MongoDB connection using the MONGODB_URI environment variable.
 * Attaches lifecycle event listeners to log connection state changes.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These are mongoose 8.x defaults, listed explicitly for clarity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure code
  }
};

// ─── Connection Event Listeners ──────────────────────────────────────────────

mongoose.connection.on('connected', () => {
  console.log('📦 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from MongoDB');
});

// Graceful shutdown — close Mongoose connection when Node process terminates
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 Mongoose connection closed due to app termination (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('🔌 Mongoose connection closed due to app termination (SIGTERM)');
  process.exit(0);
});

module.exports = connectDB;
