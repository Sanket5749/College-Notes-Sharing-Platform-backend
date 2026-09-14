import { supabase } from '../config/supabase.js';

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private (Admin Only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, prn } = req.query;

    let query = supabase
      .from('users')
      .select('id, name, prn, role, created_at')
      .order('created_at', { ascending: false });

    if (role && (role === 'student' || role === 'admin')) {
      query = query.eq('role', role);
    }

    if (prn) {
      query = query.eq('prn', prn.trim());
    }

    const { data: users, error } = await query;

    if (error) return next(error);

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
