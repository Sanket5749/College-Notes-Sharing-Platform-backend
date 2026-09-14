import express from 'express';
import cors from 'cors';

import path from 'path';

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

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

import fs from 'fs';

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
