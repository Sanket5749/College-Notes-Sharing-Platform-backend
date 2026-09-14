import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { ALLOWED_BRANCHES, normalizeBranchName } from '../constants/branches.js';
import { DEFAULT_SUBJECTS } from '../constants/defaultSubjects.js';

/**
 * Generate a deterministic UUID-like string for default subjects
 */
export const getDeterministicSubjectId = (name, semester, department) => {
  const hash = crypto.createHash('md5').update(`${name}-${semester}-${department}`).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-8${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
};

export const DEFAULT_SUBJECTS_WITH_IDS = DEFAULT_SUBJECTS.map((s) => ({
  id: getDeterministicSubjectId(s.name, s.semester, s.department),
  ...s,
  created_at: new Date().toISOString(),
}));

/**
 * @desc    Get all branches metadata
 * @route   GET /api/subjects/branches
 * @access  Public
 */
export const getBranches = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Allowed branches retrieved successfully.',
    data: {
      branches: ALLOWED_BRANCHES,
    },
  });
};

/**
 * @desc    Get all subjects (optionally filtered by semester or branch/department)
 * @route   GET /api/subjects
 * @access  Public
 */
export const getSubjects = async (req, res, next) => {
  try {
    const { semester, department, branch } = req.query;

    let targetBranchName = null;
    if (branch) {
      targetBranchName = normalizeBranchName(branch);
      if (!targetBranchName) {
        return res.status(400).json({
          success: false,
          message: `Invalid branch '${branch}'. Allowed branches: ${ALLOWED_BRANCHES.map((b) => b.shortName).join(', ')}`,
        });
      }
    } else if (department) {
      targetBranchName = normalizeBranchName(department) || department.trim();
    }

    let parsedSemester = null;
    if (semester) {
      parsedSemester = parseInt(semester, 10);
      if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
        return res.status(400).json({
          success: false,
          message: 'Semester must be an integer between 1 and 8.',
        });
      }
    }

    let subjects = [];

    // Attempt querying Supabase
    try {
      let query = supabase
        .from('subjects')
        .select('id, name, semester, department, created_at')
        .order('semester', { ascending: true })
        .order('name', { ascending: true });

      if (parsedSemester) {
        query = query.eq('semester', parsedSemester);
      }

      if (targetBranchName) {
        // If semester is 1 or 2, also include common subjects
        if (!parsedSemester || parsedSemester <= 2) {
          query = query.or(`department.eq."${targetBranchName}",department.eq."Common Engineering"`);
        } else {
          query = query.eq('department', targetBranchName);
        }
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        subjects = data;
      }
    } catch {
      // Database not reachable or unseeded, fall back to default subjects below
    }

    // Fallback: If database is empty or offline, use deterministic standard curriculum
    if (subjects.length === 0) {
      subjects = DEFAULT_SUBJECTS_WITH_IDS.filter((s) => {
        if (parsedSemester && s.semester !== parsedSemester) {
          return false;
        }
        if (targetBranchName) {
          if (s.department === targetBranchName) return true;
          if ((!parsedSemester || parsedSemester <= 2) && s.department === 'Common Engineering') return true;
          return false;
        }
        return true;
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subjects retrieved successfully.',
      data: {
        subjects,
        branches: ALLOWED_BRANCHES,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new subject
 * @route   POST /api/subjects
 * @access  Private (Admin Only)
 */
export const createSubject = async (req, res, next) => {
  try {
    const { name, semester, department } = req.body;

    if (!name || !semester || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, semester, and department.',
      });
    }

    const parsedSemester = parseInt(semester, 10);
    if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be an integer between 1 and 8.',
      });
    }

    const normalizedDept =
      normalizeBranchName(department) ||
      (department.trim().toLowerCase() === 'common engineering' ? 'Common Engineering' : null);

    if (!normalizedDept) {
      return res.status(400).json({
        success: false,
        message: `Invalid department '${department}'. Department must be one of the 9 allowed branches: ${ALLOWED_BRANCHES.map((b) => b.name).join(', ')}, or 'Common Engineering'.`,
      });
    }

    const { data: subject, error } = await supabase
      .from('subjects')
      .insert([
        {
          name: name.trim(),
          semester: parsedSemester,
          department: normalizedDept,
        },
      ])
      .select()
      .single();

    if (error) return next(error);

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      data: {
        subject,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a subject
 * @route   PUT /api/subjects/:id
 * @access  Private (Admin Only)
 */
export const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, semester, department } = req.body;

    const updates = {};
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
      updates.name = name.trim();
    }
    if (semester !== undefined) {
      const parsedSemester = parseInt(semester, 10);
      if (isNaN(parsedSemester) || parsedSemester < 1 || parsedSemester > 8) {
        return res.status(400).json({ success: false, message: 'Semester must be between 1 and 8.' });
      }
      updates.semester = parsedSemester;
    }
    if (department !== undefined) {
      const normalizedDept =
        normalizeBranchName(department) ||
        (department.trim().toLowerCase() === 'common engineering' ? 'Common Engineering' : null);

      if (!normalizedDept) {
        return res.status(400).json({
          success: false,
          message: `Invalid department '${department}'. Department must be one of the 9 allowed branches or 'Common Engineering'.`,
        });
      }
      updates.department = normalizedDept;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update (name, semester, department).',
      });
    }

    const { data: subject, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return next(error);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      data: {
        subject,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a subject
 * @route   DELETE /api/subjects/:id
 * @access  Private (Admin Only)
 */
export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: subject, error: findError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError) return next(findError);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.',
      });
    }

    const { error: deleteError } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (deleteError) return next(deleteError);

    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed standard curriculum subjects for 9 branches into database
 * @route   POST /api/subjects/seed
 * @access  Private (Admin Only)
 */
export const seedSubjects = async (req, res, next) => {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('subjects')
      .select('name, semester, department');

    if (fetchErr) return next(fetchErr);

    const existingSet = new Set((existing || []).map((s) => `${s.name}__${s.semester}__${s.department}`));

    const toInsert = DEFAULT_SUBJECTS.filter(
      (s) => !existingSet.has(`${s.name}__${s.semester}__${s.department}`)
    );

    if (toInsert.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All default subjects for 9 branches (Semesters 1-8) are already seeded.',
        data: { seededCount: 0, total: existing?.length || 0 },
      });
    }

    // Insert in batches of 50
    let insertedCount = 0;
    const batchSize = 50;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { error: insertErr } = await supabase.from('subjects').insert(batch);
      if (insertErr) return next(insertErr);
      insertedCount += batch.length;
    }

    return res.status(201).json({
      success: true,
      message: `Successfully seeded ${insertedCount} subjects across 9 branches (Semesters 1-8).`,
      data: { seededCount: insertedCount },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getBranches,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  seedSubjects,
};
