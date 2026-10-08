import crypto from 'crypto';
import path from 'path';
import { Note } from '../models/Note.js';
import { Subject } from '../models/Subject.js';
import { normalizeBranchName } from '../constants/branches.js';
import { DEFAULT_SUBJECTS_WITH_IDS } from './subjectsController.js';
import {
  uploadPdfToCloudinary,
  deleteFromCloudinary,
  getCloudinaryDownloadUrl,
} from '../config/cloudinary.js';

/**
 * Helper to sanitize filenames for safe cloud storage keys
 */
const sanitizeFileName = (originalName) => {
  const baseName = path.basename(originalName, path.extname(originalName));
  const cleanedBase = baseName.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
  return `${cleanedBase}.pdf`;
};

/**
 * @desc    Get paginated notes with optional filtering (semester, subject_id, search, branch)
 * @route   GET /api/notes
 * @access  Public
 */
export const getNotes = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const { search, semester, subject_id, branch } = req.query;

    const filter = {};

    // Apply semester filter
    if (semester) {
      const parsedSemester = parseInt(semester, 10);
      if (!isNaN(parsedSemester)) {
        filter.semester = parsedSemester;
      }
    }

    // Apply subject_id filter
    if (subject_id) {
      filter.subject_id = subject_id;
    }

    // Apply search filter on title or description
    if (search && search.trim()) {
      const searchTerm = search.trim();
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // Apply branch / department filter
    if (branch) {
      const normalizedBranch = normalizeBranchName(branch);
      if (normalizedBranch) {
        try {
          const parsedSem = semester ? parseInt(semester, 10) : null;
          const subjQuery = {};

          if (parsedSem && parsedSem > 2) {
            subjQuery.department = normalizedBranch;
          } else {
            subjQuery.$or = [
              { department: normalizedBranch },
              { department: 'Common Engineering' },
            ];
          }

          const matchedSubjects = await Subject.find(subjQuery).select('_id');
          const subjectIds = (matchedSubjects || []).map((s) => s._id);

          const defaultMatchingIds = DEFAULT_SUBJECTS_WITH_IDS
            .filter((s) => {
              if (parsedSem && s.semester !== parsedSem) return false;
              if (s.department === normalizedBranch) return true;
              if ((!parsedSem || parsedSem <= 2) && s.department === 'Common Engineering') return true;
              return false;
            })
            .map((s) => s.id);

          const allValidIds = [...new Set([...subjectIds, ...defaultMatchingIds])];
          if (allValidIds.length > 0) {
            filter.subject_id = { $in: allValidIds };
          } else {
            filter.subject_id = '00000000-0000-0000-0000-000000000000';
          }
        } catch {
          // If query fails, continue without filtering
        }
      }
    }

    // Count matching documents
    const total = await Note.countDocuments(filter);

    // Fetch notes with pagination and populating
    const notes = await Note.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('uploaded_by', 'id name prn')
      .populate('subject_id', 'id name department semester')
      .lean();

    // Attach uploader note count and verification badge status (10+ uploaded notes)
    const uploaderIds = [
      ...new Set(
        notes
          .map((n) => (n.uploaded_by?._id || n.uploaded_by)?.toString())
          .filter(Boolean)
      ),
    ];

    const countMap = {};
    if (uploaderIds.length > 0) {
      const counts = await Note.aggregate([
        { $match: { uploaded_by: { $in: uploaderIds.map((id) => (Note.base.Types.ObjectId.isValid(id) ? new Note.base.Types.ObjectId(id) : id)) } } },
        { $group: { _id: '$uploaded_by', count: { $sum: 1 } } },
      ]);

      counts.forEach((row) => {
        countMap[row._id.toString()] = row.count;
      });
    }

    // Format notes for consistent frontend consumption
    const formattedNotes = notes.map((n) => {
      const authorId = (n.uploaded_by?._id || n.uploaded_by)?.toString() || '';
      const authorNotesCount = countMap[authorId] || 0;
      const isVerified = authorNotesCount >= 10;

      const uploaderObj = {
        id: authorId,
        name: n.uploaded_by?.name || 'Student',
        prn: n.uploaded_by?.prn || '',
        notes_count: authorNotesCount,
        is_verified: isVerified,
      };

      const subjectObj =
        n.subject_id && typeof n.subject_id === 'object'
          ? {
              id: n.subject_id._id || n.subject_id.id,
              name: n.subject_id.name,
              department: n.subject_id.department,
              semester: n.subject_id.semester,
            }
          : {
              id: n.subject_id,
            };

      return {
        id: n._id.toString(),
        title: n.title,
        description: n.description,
        semester: n.semester,
        file_name: n.file_name,
        file_path: n.file_path,
        file_url: n.file_url,
        file_size: n.file_size,
        downloads: n.downloads || 0,
        created_at: n.createdAt,
        uploaded_by: authorId,
        subjects: subjectObj,
        subject: subjectObj,
        users: uploaderObj,
        uploader: uploaderObj,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: 'Notes retrieved successfully.',
      data: {
        notes: formattedNotes,
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get full metadata for a single note by ID
 * @route   GET /api/notes/:id
 * @access  Public
 */
export const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id)
      .populate('uploaded_by', 'id name prn')
      .populate('subject_id', 'id name department semester')
      .lean();

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    const authorId = (note.uploaded_by?._id || note.uploaded_by)?.toString() || '';
    let authorNotesCount = 0;
    if (authorId) {
      authorNotesCount = await Note.countDocuments({ uploaded_by: authorId });
    }
    const isVerified = authorNotesCount >= 10;

    const uploaderObj = {
      id: authorId,
      name: note.uploaded_by?.name || 'Student',
      prn: note.uploaded_by?.prn || '',
      notes_count: authorNotesCount,
      is_verified: isVerified,
    };

    const subjectObj =
      note.subject_id && typeof note.subject_id === 'object'
        ? {
            id: note.subject_id._id || note.subject_id.id,
            name: note.subject_id.name,
            department: note.subject_id.department,
            semester: note.subject_id.semester,
          }
        : {
            id: note.subject_id,
          };

    const formattedNote = {
      id: note._id.toString(),
      title: note.title,
      description: note.description,
      semester: note.semester,
      file_name: note.file_name,
      file_path: note.file_path,
      file_url: note.file_url,
      file_size: note.file_size,
      downloads: note.downloads || 0,
      created_at: note.createdAt,
      uploaded_by: authorId,
      subjects: subjectObj,
      subject: subjectObj,
      users: uploaderObj,
      uploader: uploaderObj,
    };

    return res.status(200).json({
      success: true,
      message: 'Note details retrieved successfully.',
      data: {
        note: formattedNote,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload a new PDF note to Cloudinary & store metadata in MongoDB
 * @route   POST /api/notes/upload
 * @access  Private (Authenticated Users)
 */
export const uploadNote = async (req, res, next) => {
  try {
    const { title, description, subject_id, semester } = req.body;

    // 1. Verify file was provided by Multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file using the "file" field.',
      });
    }

    // 2. Validate metadata fields
    if (!title || !subject_id || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, subject_id, and semester.',
      });
    }

    const parsedSemester = parseInt(semester, 10);
    if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be an integer between 1 and 8.',
      });
    }

    // 3. Verify subject exists (or resolve/seed from default subjects)
    let activeSubject = await Subject.findById(subject_id);

    if (!activeSubject) {
      const defaultSubj = DEFAULT_SUBJECTS_WITH_IDS.find((s) => s.id === subject_id);
      if (defaultSubj) {
        try {
          activeSubject = await Subject.create({
            _id: defaultSubj.id,
            name: defaultSubj.name,
            semester: defaultSubj.semester,
            department: defaultSubj.department,
          });
        } catch {
          activeSubject = await Subject.findById(defaultSubj.id);
        }
      }

      if (!activeSubject) {
        return res.status(404).json({
          success: false,
          message: 'The specified subject does not exist.',
        });
      }
    }

    // 4. Upload buffer to Cloudinary
    const sanitizedBase = sanitizeFileName(req.file.originalname).replace('.pdf', '');
    const uniqueId = crypto.randomUUID();
    const folder = `college_notes/semester-${parsedSemester}`;
    const publicId = `${Date.now()}-${uniqueId}-${sanitizedBase}`;

    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadPdfToCloudinary(req.file.buffer, {
        folder,
        public_id: publicId,
      });
    } catch (uploadErr) {
      const statusCode = uploadErr.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        message: `Failed to upload PDF to Cloudinary: ${uploadErr.message}`,
      });
    }

    // 5. Insert note metadata into MongoDB
    let note;
    try {
      note = await Note.create({
        title: title.trim(),
        description: description ? description.trim() : null,
        subject_id: activeSubject._id,
        semester: parsedSemester,
        file_name: req.file.originalname,
        file_path: cloudinaryResult.public_id,
        file_url: cloudinaryResult.secure_url,
        file_size: req.file.size,
        cloudinary_public_id: cloudinaryResult.public_id,
        uploaded_by: req.user.id,
        downloads: 0,
      });
    } catch (dbError) {
      // Rollback: Clean up uploaded file in Cloudinary if DB insert fails
      await deleteFromCloudinary(cloudinaryResult.public_id);
      return next(dbError);
    }

    // Compute user's total uploaded notes count for verification badge
    const totalUserNotes = await Note.countDocuments({ uploaded_by: req.user.id });
    const authorNotesCount = totalUserNotes || 1;
    const isVerified = authorNotesCount >= 10;

    let successMessage = 'Study note uploaded and published successfully!';
    if (authorNotesCount === 10) {
      successMessage = '🎉 Congratulations! You have uploaded 10 study notes and earned the Verified Contributor badge!';
    } else if (isVerified) {
      successMessage = `Study note published! (${authorNotesCount} notes contributed • Verified)`;
    }

    const uploaderObj = {
      id: req.user.id,
      name: req.user.name,
      prn: req.user.prn,
      notes_count: authorNotesCount,
      is_verified: isVerified,
    };

    const subjectObj = {
      id: activeSubject._id,
      name: activeSubject.name,
      department: activeSubject.department,
      semester: activeSubject.semester,
    };

    const formattedNote = {
      id: note._id.toString(),
      title: note.title,
      description: note.description,
      semester: note.semester,
      file_name: note.file_name,
      file_path: note.file_path,
      file_url: note.file_url,
      file_size: note.file_size,
      downloads: note.downloads,
      created_at: note.createdAt,
      uploaded_by: req.user.id,
      subjects: subjectObj,
      subject: subjectObj,
      users: uploaderObj,
      uploader: uploaderObj,
    };

    return res.status(201).json({
      success: true,
      message: successMessage,
      data: {
        note: formattedNote,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a note record (alternative direct creation or proxy for upload)
 * @route   POST /api/notes
 * @access  Private (Authenticated Users)
 */
export const createNote = async (req, res, next) => {
  // If request sent with multipart file, delegate to uploadNote
  if (req.file) {
    return uploadNote(req, res, next);
  }

  try {
    const { title, description, subject_id, semester, file_name, file_path, file_url, file_size } = req.body;

    if (!title || !subject_id || !semester || !file_name || (!file_path && !file_url) || !file_size) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required fields: title, subject_id, semester, file_name, file_path, file_size, or use POST /api/notes/upload with a PDF file.',
      });
    }

    const parsedSemester = parseInt(semester, 10);
    if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be an integer between 1 and 8.',
      });
    }

    let activeSubject = await Subject.findById(subject_id);
    if (!activeSubject) {
      const defaultSubj = DEFAULT_SUBJECTS_WITH_IDS.find((s) => s.id === subject_id);
      if (defaultSubj) {
        activeSubject = await Subject.create({
          _id: defaultSubj.id,
          name: defaultSubj.name,
          semester: defaultSubj.semester,
          department: defaultSubj.department,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'The specified subject does not exist.',
        });
      }
    }

    const note = await Note.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      subject_id: activeSubject._id,
      semester: parsedSemester,
      file_name,
      file_path: file_path || file_url,
      file_url: file_url || file_path,
      file_size: parseInt(file_size, 10),
      cloudinary_public_id: file_path || null,
      uploaded_by: req.user.id,
      downloads: 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing note (Owner or Admin only)
 * @route   PUT /api/notes/:id
 * @access  Private (Owner or Admin)
 */
export const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, subject_id, semester } = req.body;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Authorization check: Uploader or Admin
    const isOwner = note.uploaded_by.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to update this note.',
      });
    }

    const updates = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty.',
        });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (semester !== undefined) {
      const parsedSemester = parseInt(semester, 10);
      if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
        return res.status(400).json({
          success: false,
          message: 'Semester must be an integer between 1 and 8.',
        });
      }
      updates.semester = parsedSemester;
    }

    if (subject_id !== undefined) {
      const subject = await Subject.findById(subject_id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'The specified subject does not exist.',
        });
      }
      updates.subject_id = subject_id;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fields to update (title, description, subject_id, semester).',
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(id, updates, { new: true })
      .populate('uploaded_by', 'id name prn')
      .populate('subject_id', 'id name department semester');

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      data: {
        note: updatedNote,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a note and its corresponding PDF in Cloudinary (Owner or Admin only)
 * @route   DELETE /api/notes/:id
 * @access  Private (Owner or Admin)
 */
export const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Authorization check: Uploader or Admin
    const isOwner = note.uploaded_by.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this note.',
      });
    }

    // Delete file from Cloudinary
    const publicId = note.cloudinary_public_id || note.file_path;
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // Delete record from MongoDB
    await Note.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate a download URL for note PDF from Cloudinary and increment download counter
 * @route   GET /api/notes/:id/download
 * @access  Public (or Authenticated)
 */
export const downloadNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Generate Cloudinary attachment / download URL
    const publicId = note.cloudinary_public_id || note.file_path;
    const downloadUrl = getCloudinaryDownloadUrl(publicId, note.file_name, note.file_url);

    // Safely increment download count
    note.downloads = (note.downloads || 0) + 1;
    await note.save();

    // If client requested a direct redirect via query ?redirect=true
    if (req.query.redirect === 'true') {
      return res.redirect(downloadUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Download URL generated successfully.',
      data: {
        downloadUrl,
        download_url: downloadUrl,
        fileName: note.file_name,
        expiresInSeconds: 3600,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNotes,
  getNoteById,
  uploadNote,
  createNote,
  updateNote,
  deleteNote,
  downloadNote,
};
