const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: MONGODB_URI is not defined in .env file.');
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ LifeFlow will run with a mock in-memory fallback database.');
    process.env.USE_MOCK_DB = 'true';
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`\x1b[32m%s\x1b[0m`, `✅ MongoDB Connected: ${conn.connection.host}`);
    process.env.USE_MOCK_DB = 'false';
    return conn;
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `❌ MongoDB Connection Error: ${error.message}`);
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ Falling back to mock in-memory database...');
    process.env.USE_MOCK_DB = 'true';
    return null;
  }
};

module.exports = connectDB;
