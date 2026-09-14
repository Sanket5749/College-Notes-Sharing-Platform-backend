import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

/**
 * Middleware to authenticate requests using a JSON Web Token (JWT).
 * 
 * Flow:
 * 1. Checks for Authorization header formatted as: Bearer <token>
 * 2. Verifies token validity and expiration.
 * 3. Extracts userId and queries database for current user profile (excluding password).
 * 4. Attaches safe user object to req.user.
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

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
      });
    }

    // Fetch user details from database (never select password)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, prn, role, created_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Attach note count and verification badge status (10+ uploaded notes)
    const { count: userNotesCount } = await supabase
      .from('notes')
      .select('id', { count: 'exact', head: true })
      .eq('uploaded_by', user.id);

    user.notes_count = userNotesCount || 0;
    user.is_verified = (userNotesCount || 0) >= 10;

    // Attach authenticated user to request object
    req.user = user;
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
