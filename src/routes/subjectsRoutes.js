import express from 'express';
import {
  getBranches,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  seedSubjects,
} from '../controllers/subjectsController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/subjects/branches
 * @desc    Get the 9 allowed engineering branches metadata
 * @access  Public
 */
router.get('/branches', getBranches);

/**
 * @route   POST /api/subjects/seed
 * @desc    Seed default subjects for 9 branches across Semesters 1-8
 * @access  Private (Admin Only)
 */
router.post('/seed', authenticate, requireAdmin, seedSubjects);

/**
 * @route   GET /api/subjects
 * @desc    Get all subjects (supports ?semester, ?department, ?branch)
 * @access  Public
 */
router.get('/', getSubjects);

/**
 * @route   POST /api/subjects
 * @desc    Create a new subject
 * @access  Private (Admin Only)
 */
router.post('/', authenticate, requireAdmin, createSubject);

/**
 * @route   PUT /api/subjects/:id
 * @desc    Update a subject
 * @access  Private (Admin Only)
 */
router.put('/:id', authenticate, requireAdmin, updateSubject);

/**
 * @route   DELETE /api/subjects/:id
 * @desc    Delete a subject
 * @access  Private (Admin Only)
 */
router.delete('/:id', authenticate, requireAdmin, deleteSubject);

export default router;
