import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'https://edunotesrcpit.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://college-notes-sharing-platform-backend-6wdi.onrender.com';

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 College Notes Backend Server is running!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🌐 Production Backend: ${BACKEND_URL}`);
  console.log(`💻 Production Frontend: ${CLIENT_URL}`);
  console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
