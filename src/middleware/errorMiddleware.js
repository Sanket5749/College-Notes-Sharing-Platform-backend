/**
 * 404 Not Found Middleware
 * Intercepts any request that does not match any registered API route.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized Error Handling Middleware
 * Ensures every error in the application is returned with a consistent JSON schema:
 * {
 *   "success": false,
 *   "message": "..."
 * }
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle explicit custom status codes on error object
  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // Handle Supabase / PostgreSQL specific error codes
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique constraint violation (e.g., duplicate PRN)
        statusCode = 409;
        message = 'A record with this information already exists.';
        if (err.details && err.details.includes('prn')) {
          message = 'An account with this 9-digit PRN already exists.';
        }
        break;
      case '23503': // Foreign key violation
        statusCode = 400;
        message = 'Referenced record does not exist (invalid foreign key).';
        break;
      case '22P02': // Invalid text representation (e.g., invalid UUID syntax)
        statusCode = 400;
        message = 'Invalid ID format provided.';
        break;
      case 'PGRST116': // Supabase query expecting single row found 0
        statusCode = 404;
        message = 'Requested resource was not found.';
        break;
      default:
        // Keep standard message or database error message
        break;
    }
  }

  // Log server errors for backend debugging (without leaking in production response)
  if (statusCode >= 500) {
    console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default { notFound, errorHandler };
