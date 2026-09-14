import express from 'express';
import {
  getNotes,
  getNoteById,
  uploadNote,
  createNote,
  updateNote,
  deleteNote,
  downloadNote,
} from '../controllers/notesController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadPdfMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/notes
 * @desc    Get paginated notes (supports ?page, ?limit, ?search, ?semester, ?subject_id)
 * @access  Private (Requires valid JWT)
 */
router.get('/', authenticate, getNotes);

/**
 * @route   POST /api/notes/upload
 * @desc    Upload PDF file to storage and record metadata
 * @access  Private
 */
router.post('/upload', authenticate, uploadPdfMiddleware('file'), uploadNote);

/**
 * @route   POST /api/notes
 * @desc    Create a note record or upload note
 * @access  Private
 */
router.post('/', authenticate, uploadPdfMiddleware('file'), createNote);

/**
 * @route   GET /api/notes/:id/download
 * @desc    Generate a secure signed download URL & increment download count
 * @access  Private (Requires valid JWT)
 */
router.get('/:id/download', authenticate, downloadNote);

/**
 * @route   GET /api/notes/:id
 * @desc    Get note details by ID
 * @access  Private (Requires valid JWT)
 */
router.get('/:id', authenticate, getNoteById);

/**
 * @route   PUT /api/notes/:id
 * @desc    Update note details (Owner or Admin only)
 * @access  Private
 */
router.put('/:id', authenticate, updateNote);

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete note and file from storage (Owner or Admin only)
 * @access  Private
 */
router.delete('/:id', authenticate, deleteNote);

export default router;
