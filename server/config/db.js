const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lifeflow';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`\x1b[32m%s\x1b[0m`, `✅ MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-sync all 25 district hospitals into MongoDB
    try {
      const { autoSeedHospitals } = require('../seedHospitals');
      await autoSeedHospitals();
    } catch (seedErr) {
      console.warn('Auto seed hospitals warning:', seedErr.message);
    }

    return conn;
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
