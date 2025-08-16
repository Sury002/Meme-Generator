const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000 // Close sockets after 45s of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    console.error('Connection URI:', process.env.MONGODB_URI.replace(/:\/\/.*@/, '://<credentials>@'));
    
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;