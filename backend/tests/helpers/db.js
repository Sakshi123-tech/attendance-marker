const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, clearDB, closeDB };
