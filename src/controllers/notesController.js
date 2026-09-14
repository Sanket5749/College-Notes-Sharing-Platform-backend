import crypto from 'crypto';
import path from 'path';
import { supabase, STORAGE_BUCKET } from '../config/supabase.js';
import { normalizeBranchName } from '../constants/branches.js';
import { DEFAULT_SUBJECTS_WITH_IDS } from './subjectsController.js';

/**
 * Helper to sanitize filenames for safe cloud storage keys
 */
const sanitizeFileName = (originalName) => {
  const baseName = path.basename(originalName, path.extname(originalName));
  const cleanedBase = baseName.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
  return `${cleanedBase}.pdf`;
};

/**
 * @desc    Get paginated notes with optional filtering (semester, subject_id, search)
 * @route   GET /api/notes
 * @access  Public
 */
export const getNotes = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const { search, semester, subject_id, branch } = req.query;

    // Build base query with exact count for pagination
    let query = supabase
      .from('notes')
      .select(
        `
        id,
        title,
        description,
        semester,
        file_name,
        file_path,
        file_size,
        downloads,
        created_at,
        uploaded_by,
        subjects (
          id,
          name,
          department,
          semester
        ),
        users (
          id,
          name,
          prn
        )
      `,
        { count: 'exact' }
      );

    // Apply semester filter
    if (semester) {
      const parsedSemester = parseInt(semester, 10);
      if (!isNaN(parsedSemester)) {
        query = query.eq('semester', parsedSemester);
      }
    }

    // Apply subject_id filter
    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }

    // Apply search filter on title or description
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Apply branch / department filter
    if (branch) {
      const normalizedBranch = normalizeBranchName(branch);
      if (normalizedBranch) {
        try {
          let subjQuery = supabase.from('subjects').select('id');

          const parsedSem = semester ? parseInt(semester, 10) : null;
          if (parsedSem && parsedSem > 2) {
            subjQuery = subjQuery.eq('department', normalizedBranch);
          } else {
            subjQuery = subjQuery.or(`department.eq."${normalizedBranch}",department.eq."Common Engineering"`);
          }

          const { data: matchedSubjects } = await subjQuery;
          const subjectIds = (matchedSubjects || []).map((s) => s.id);

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
            query = query.in('subject_id', allValidIds);
          } else {
            query = query.in('subject_id', ['00000000-0000-0000-0000-000000000000']);
          }
        } catch {
          // If query fails, continue
        }
      }
    }

    // Order and paginate
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: notes, count, error } = await query;

    if (error) {
      return next(error);
    }

    // Attach uploader note count and verification badge status (10+ uploaded notes)
    if (notes && notes.length > 0) {
      const uploaderIds = [...new Set(notes.map((n) => n.uploaded_by).filter(Boolean))];

      if (uploaderIds.length > 0) {
        const { data: uploaderNotes } = await supabase
          .from('notes')
          .select('uploaded_by')
          .in('uploaded_by', uploaderIds);

        const countMap = {};
        if (uploaderNotes) {
          uploaderNotes.forEach((row) => {
            countMap[row.uploaded_by] = (countMap[row.uploaded_by] || 0) + 1;
          });
        }

        notes.forEach((n) => {
          const authorNotesCount = countMap[n.uploaded_by] || 0;
          const isVerified = authorNotesCount >= 10;
          const userObj = n.users || {};
          userObj.notes_count = authorNotesCount;
          userObj.is_verified = isVerified;
          n.users = userObj;
          n.uploader = {
            ...userObj,
            notes_count: authorNotesCount,
            is_verified: isVerified,
          };
        });
      }
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: 'Notes retrieved successfully.',
      data: {
        notes: notes || [],
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

    const { data: note, error } = await supabase
      .from('notes')
      .select(
        `
        id,
        title,
        description,
        semester,
        file_name,
        file_path,
        file_size,
        downloads,
        created_at,
        uploaded_by,
        subjects (
          id,
          name,
          department,
          semester
        ),
        users (
          id,
          name,
          prn
        )
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Attach uploader note count and verification badge status (10+ uploaded notes)
    if (note.uploaded_by) {
      const { count: authorCount } = await supabase
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .eq('uploaded_by', note.uploaded_by);

      const authorNotesCount = authorCount || 0;
      const isVerified = authorNotesCount >= 10;
      const userObj = note.users || {};
      userObj.notes_count = authorNotesCount;
      userObj.is_verified = isVerified;
      note.users = userObj;
      note.uploader = {
        ...userObj,
        notes_count: authorNotesCount,
        is_verified: isVerified,
      };
    }

    return res.status(200).json({
      success: true,
      message: 'Note details retrieved successfully.',
      data: {
        note,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload a new PDF note to Supabase Storage & store metadata in DB
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

    // 3. Verify subject exists (or resolve from default subjects)
    let activeSubjectId = subject_id;
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', subject_id)
      .maybeSingle();

    if (subjectError) {
      return next(subjectError);
    }

    if (!subject) {
      const defaultSubj = DEFAULT_SUBJECTS_WITH_IDS.find((s) => s.id === subject_id);
      if (defaultSubj) {
        try {
          const { data: createdSubj, error: insertSubjErr } = await supabase
            .from('subjects')
            .insert([
              {
                id: defaultSubj.id,
                name: defaultSubj.name,
                semester: defaultSubj.semester,
                department: defaultSubj.department,
              },
            ])
            .select('id')
            .maybeSingle();

          if (!insertSubjErr && createdSubj) {
            activeSubjectId = createdSubj.id;
          }
        } catch {
          // Continue if insert fails
        }
      } else {
        return res.status(404).json({
          success: false,
          message: 'The specified subject does not exist.',
        });
      }
    }

    // 4. Organize storage path by semester folder with unique filename
    // Structure: semester-<N>/<timestamp>-<uuid>-<cleaned_filename>.pdf
    const sanitizedName = sanitizeFileName(req.file.originalname);
    const uniqueId = crypto.randomUUID();
    const filePath = `semester-${parsedSemester}/${Date.now()}-${uniqueId}-${sanitizedName}`;

    // 5. Upload buffer directly to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (storageError) {
      return res.status(500).json({
        success: false,
        message: `Failed to upload PDF to cloud storage: ${storageError.message}`,
      });
    }

    // 6. Insert note metadata into PostgreSQL table
    const { data: note, error: dbError } = await supabase
      .from('notes')
      .insert([
        {
          title: title.trim(),
          description: description ? description.trim() : null,
          subject_id: activeSubjectId,
          semester: parsedSemester,
          file_name: req.file.originalname,
          file_path: filePath,
          file_size: req.file.size,
          uploaded_by: req.user.id,
          downloads: 0,
        },
      ])
      .select(
        `
        id,
        title,
        description,
        semester,
        file_name,
        file_path,
        file_size,
        downloads,
        created_at,
        uploaded_by,
        subjects (
          id,
          name,
          department
        ),
        users (
          id,
          name,
          prn
        )
      `
      )
      .single();

    if (dbError) {
      // Rollback: Clean up uploaded file in storage if DB insert fails
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      return next(dbError);
    }

    // Compute user's total uploaded notes count for verification badge
    const { count: totalUserNotes } = await supabase
      .from('notes')
      .select('id', { count: 'exact', head: true })
      .eq('uploaded_by', req.user.id);

    const authorNotesCount = totalUserNotes || 1;
    const isVerified = authorNotesCount >= 10;

    let successMessage = 'Study note uploaded and published successfully!';
    if (authorNotesCount === 10) {
      successMessage = '🎉 Congratulations! You have uploaded 10 study notes and earned the Verified Contributor badge!';
    } else if (isVerified) {
      successMessage = `Study note published! (${authorNotesCount} notes contributed • Verified)`;
    }

    if (note.users) {
      note.users.notes_count = authorNotesCount;
      note.users.is_verified = isVerified;
    }
    note.uploader = {
      ...(note.users || {}),
      notes_count: authorNotesCount,
      is_verified: isVerified,
    };

    return res.status(201).json({
      success: true,
      message: successMessage,
      data: {
        note,
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
    const { title, description, subject_id, semester, file_name, file_path, file_size } = req.body;

    if (!title || !subject_id || !semester || !file_name || !file_path || !file_size) {
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

    // Verify subject exists (or resolve from default subjects)
    let activeSubjectId = subject_id;
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', subject_id)
      .maybeSingle();

    if (subjectError) return next(subjectError);
    if (!subject) {
      const defaultSubj = DEFAULT_SUBJECTS_WITH_IDS.find((s) => s.id === subject_id);
      if (defaultSubj) {
        try {
          const { data: createdSubj, error: insertSubjErr } = await supabase
            .from('subjects')
            .insert([
              {
                id: defaultSubj.id,
                name: defaultSubj.name,
                semester: defaultSubj.semester,
                department: defaultSubj.department,
              },
            ])
            .select('id')
            .maybeSingle();

          if (!insertSubjErr && createdSubj) {
            activeSubjectId = createdSubj.id;
          }
        } catch {
          // Continue if insert fails
        }
      } else {
        return res.status(404).json({
          success: false,
          message: 'The specified subject does not exist.',
        });
      }
    }

    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert([
        {
          title: title.trim(),
          description: description ? description.trim() : null,
          subject_id: activeSubjectId,
          semester: parsedSemester,
          file_name,
          file_path,
          file_size: parseInt(file_size, 10),
          uploaded_by: req.user.id,
          downloads: 0,
        },
      ])
      .select('*, subjects(id, name, department), users(id, name, prn)')
      .single();

    if (insertError) return next(insertError);

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

    // 1. Fetch note to check existence and ownership
    const { data: note, error: findError } = await supabase
      .from('notes')
      .select('id, uploaded_by')
      .eq('id', id)
      .maybeSingle();

    if (findError) return next(findError);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // 2. Authorization check: Uploader or Admin
    const isOwner = note.uploaded_by === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to update this note.',
      });
    }

    // 3. Prepare update payload
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
      // Verify new subject exists
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('id', subject_id)
        .maybeSingle();

      if (subjectError) return next(subjectError);
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

    // 4. Update in database
    const { data: updatedNote, error: updateError } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select('*, subjects(id, name, department), users(id, name, prn)')
      .single();

    if (updateError) return next(updateError);

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
 * @desc    Delete a note and its corresponding PDF in Supabase Storage (Owner or Admin only)
 * @route   DELETE /api/notes/:id
 * @access  Private (Owner or Admin)
 */
export const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch note to get file_path and uploaded_by
    const { data: note, error: findError } = await supabase
      .from('notes')
      .select('id, file_path, uploaded_by')
      .eq('id', id)
      .maybeSingle();

    if (findError) return next(findError);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // 2. Authorization check: Uploader or Admin
    const isOwner = note.uploaded_by === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this note.',
      });
    }

    // 3. Delete file from Supabase Storage
    if (note.file_path) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([note.file_path]);

      if (storageError) {
        console.warn(`[STORAGE WARNING] Could not remove file ${note.file_path}:`, storageError.message);
      }
    }

    // 4. Delete record from database
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (deleteError) return next(deleteError);

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate a secure signed URL to download note PDF and increment download counter
 * @route   GET /api/notes/:id/download
 * @access  Public (or Authenticated)
 */
export const downloadNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Find note
    const { data: note, error: findError } = await supabase
      .from('notes')
      .select('id, title, file_name, file_path, downloads')
      .eq('id', id)
      .maybeSingle();

    if (findError) return next(findError);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // 2. Generate signed download URL (valid for 5 minutes = 300 seconds)
    // download: note.file_name prompts browser with correct file name
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(note.file_path, 300, {
        download: note.file_name,
      });

    if (signedError || !signedData?.signedUrl) {
      return res.status(500).json({
        success: false,
        message: `Failed to generate download URL: ${signedError?.message || 'Storage error'}`,
      });
    }

    // 3. Increment download counter safely
    const currentDownloads = note.downloads || 0;
    await supabase
      .from('notes')
      .update({ downloads: currentDownloads + 1 })
      .eq('id', note.id);

    // If client requested a direct redirect via query ?redirect=true
    if (req.query.redirect === 'true') {
      return res.redirect(signedData.signedUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Secure download URL generated successfully.',
      data: {
        downloadUrl: signedData.signedUrl,
        expiresInSeconds: 300,
        fileName: note.file_name,
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
