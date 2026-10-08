import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Note } from '../models/Note.js';

/**
 * Middleware to authenticate requests using a JSON Web Token (JWT).
 * 
 * Flow:
 * 1. Checks for Authorization header formatted as: Bearer <token>
 * 2. Verifies token validity and expiration.
 * 3. Extracts userId and queries MongoDB for current user profile (excluding password).
 * 4. Attaches safe user object to req.user with computed note statistics.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is missing from Authorization header.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authorization failed.',
      });
    }

    if (!decoded || !decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or outdated authentication token. Please log in again.',
      });
    }

    // Fetch user details from MongoDB (exclude password)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Attach note count and verification badge status (10+ uploaded notes)
    const userNotesCount = await Note.countDocuments({ uploaded_by: user._id });

    const safeUser = user.toJSON();
    safeUser.notes_count = userNotesCount;
    safeUser.is_verified = userNotesCount >= 10;

    // Attach authenticated user to request object
    req.user = safeUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict route access strictly to admin users.
 * Must be placed AFTER `authenticate` in route definitions.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required prior to role verification.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges are required to perform this action.',
    });
  }

  next();
};

export default { authenticate, requireAdmin };
