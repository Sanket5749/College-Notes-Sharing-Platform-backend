import { User } from '../models/User.js';

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private (Admin Only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, prn } = req.query;

    const filter = {};

    if (role && (role === 'student' || role === 'admin')) {
      filter.role = role;
    }

    if (prn) {
      filter.prn = prn.trim();
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: {
        users: users || [],
        count: users?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllUsers,
};
