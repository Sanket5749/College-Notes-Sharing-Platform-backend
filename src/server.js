import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'https://edunotesrcpit.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://college-notes-sharing-platform-backend-6wdi.onrender.com';

let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
  } catch (err) {
    console.error('Failed to initialize MongoDB connection:', err.message);
  }

  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 College Notes Backend Server is running!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🍃 Database: MongoDB`);
    console.log(`☁️  Storage: Cloudinary`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`🌐 Production Backend: ${BACKEND_URL}`);
    console.log(`💻 Production Frontend: ${CLIENT_URL}`);
    console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
};

startServer();

// Graceful shutdown handling
const shutdown = async (signal) => {
  console.log(`${signal} signal received: Closing HTTP server & MongoDB connection.`);
  if (server) {
    server.close(async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
      } catch (err) {
        console.error('Error closing MongoDB connection:', err.message);
      }
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
