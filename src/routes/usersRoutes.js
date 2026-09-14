import express from 'express';
import { getAllUsers } from '../controllers/usersController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all registered users (supports ?role=student|admin)
 * @access  Private (Admin Only)
 */
router.get('/', authenticate, requireAdmin, getAllUsers);

export default router;
