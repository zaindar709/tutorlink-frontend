const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutorlink';

let connected = false;

async function connectMongo() {
  if (connected) return mongoose.connection;
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI);
  connected = true;
  console.log('[signaling] MongoDB connected');
  return mongoose.connection;
}

module.exports = { connectMongo, mongoose };
