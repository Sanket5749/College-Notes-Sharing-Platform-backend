import express from 'express';
import cors from 'cors';

import path from 'path';
import fs from 'fs';

// Import route modules
import authRoutes from './routes/authRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import subjectsRoutes from './routes/subjectsRoutes.js';
import usersRoutes from './routes/usersRoutes.js';

// Import error handling middlewares
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// -----------------------------------------------------------------------------
// Global Middlewares
// -----------------------------------------------------------------------------

// Allowed frontend origins for Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  'https://edunotesrcpit.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

// Enable Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from built React frontend
const frontendDist = path.resolve(process.cwd(), '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// -----------------------------------------------------------------------------
// Base API Health Check & Info Route
// -----------------------------------------------------------------------------
const getApiInfo = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the College Notes Sharing Platform API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      notes: '/api/notes',
      subjects: '/api/subjects',
      users: '/api/users',
      health: '/api/health',
    },
    clientUrl: process.env.CLIENT_URL || 'https://edunotesrcpit.vercel.app',
    backendUrl: process.env.BACKEND_URL || 'https://college-notes-sharing-platform-backend-6wdi.onrender.com',
  });
};

app.get('/api/health', getApiInfo);
app.get('/api', getApiInfo);

// -----------------------------------------------------------------------------
// API Route Registrations
// -----------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/users', usersRoutes);

// -----------------------------------------------------------------------------
// Error Handling Middlewares (Must be registered last)
// -----------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

export default app;
