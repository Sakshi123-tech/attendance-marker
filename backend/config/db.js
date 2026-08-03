const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_attendance');
    
    console.log(`[Database] MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

// Monitor mongoose connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] Mongoose connection disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database] Mongoose connection error: ${err}`);
});

module.exports = connectDB;
