import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/orvix';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // Quick timeout fallback if Mongo server isn't running locally
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${mongoUri}: ${error.message}`);
    console.warn('[MongoDB Warning] Backend running in DB-disconnected mode. Health checks and non-persisted routes will continue functioning.');
    return null;
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected.');
  }
};

export const isDbConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};
