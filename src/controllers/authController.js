import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { Note } from '../models/Note.js';
import { generateToken } from '../utils/generateToken.js';

// Regex for strictly 9-digit PRN validation
const PRN_REGEX = /^\d{9}$/;

/**
 * @desc    Register a new user using 9-digit PRN (No email required)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, prn, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !prn || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, 9-digit PRN, and password.',
      });
    }

    const trimmedName = name.trim();
    const sanitizedPrn = String(prn).trim();
    const userRole = role === 'admin' ? 'admin' : 'student';

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long.',
      });
    }

    // 2. Validate 9-digit PRN format
    if (!PRN_REGEX.test(sanitizedPrn)) {
      return res.status(400).json({
        success: false,
        message: 'PRN must consist of exactly 9 numeric digits.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 3. Check if account with this PRN already exists
    const existingUser = await User.findOne({ prn: sanitizedPrn });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this 9-digit PRN already exists.',
      });
    }

    // 4. Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Store user in MongoDB
    const newUser = await User.create({
      name: trimmedName,
      prn: sanitizedPrn,
      password: hashedPassword,
      role: userRole,
    });

    const safeUser = newUser.toJSON();
    delete safeUser.password;
    safeUser.notes_count = 0;
    safeUser.is_verified = false;

    // 6. Generate JWT token
    const token = generateToken(newUser._id.toString());

    // 7. Return response (password is excluded)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully with PRN.',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & retrieve token via 9-digit PRN
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { prn, identifier, password } = req.body;

    // Accepts either prn or identifier
    const rawPrn = (prn || identifier || '').toString().trim();

    if (!rawPrn || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your 9-digit PRN and password.',
      });
    }

    if (!PRN_REGEX.test(rawPrn)) {
      return res.status(400).json({
        success: false,
        message: 'PRN must consist of exactly 9 numeric digits.',
      });
    }

    // Find user in MongoDB by 9-digit PRN
    const user = await User.findOne({ prn: rawPrn });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your PRN and password.',
      });
    }

    // Compare passwords using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your PRN and password.',
      });
    }

    // Generate JWT
    const token = generateToken(user._id.toString());

    // Count user's uploaded notes
    const userNotesCount = await Note.countDocuments({ uploaded_by: user._id });

    // Exclude password before returning response
    const safeUser = user.toJSON();
    delete safeUser.password;
    safeUser.notes_count = userNotesCount;
    safeUser.is_verified = userNotesCount >= 10;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Requires valid JWT)
 */
export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getMe,
};
