import crypto from 'crypto';
import { Subject } from '../models/Subject.js';
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
 * Helper to auto-seed default subjects if Subject collection is empty
 */
const autoSeedIfEmpty = async () => {
  try {
    const count = await Subject.countDocuments();
    if (count === 0) {
      const docs = DEFAULT_SUBJECTS_WITH_IDS.map((s) => ({
        _id: s.id,
        name: s.name,
        semester: s.semester,
        department: s.department,
      }));
      await Subject.insertMany(docs, { ordered: false });
      console.log(`🌱 Auto-seeded ${docs.length} default subjects into MongoDB.`);
    }
  } catch (err) {
    // If concurrent insert happens or already seeded, silently continue
  }
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

    // Attempt querying MongoDB
    try {
      await autoSeedIfEmpty();

      const filter = {};

      if (parsedSemester) {
        filter.semester = parsedSemester;
      }

      if (targetBranchName) {
        if (!parsedSemester || parsedSemester <= 2) {
          filter.$or = [
            { department: targetBranchName },
            { department: 'Common Engineering' },
          ];
        } else {
          filter.department = targetBranchName;
        }
      }

      subjects = await Subject.find(filter).sort({ semester: 1, name: 1 });
    } catch {
      // If MongoDB query encounters an issue, fallback to default subjects
    }

    // Fallback: If database is empty or offline, use deterministic standard curriculum
    if (!subjects || subjects.length === 0) {
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

    const subject = await Subject.create({
      _id: crypto.randomUUID(),
      name: name.trim(),
      semester: parsedSemester,
      department: normalizedDept,
    });

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

    const subject = await Subject.findByIdAndUpdate(id, updates, { new: true });

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

    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.',
      });
    }

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
    const existing = await Subject.find({}).select('name semester department');

    const existingSet = new Set((existing || []).map((s) => `${s.name}__${s.semester}__${s.department}`));

    const toInsert = DEFAULT_SUBJECTS_WITH_IDS.filter(
      (s) => !existingSet.has(`${s.name}__${s.semester}__${s.department}`)
    ).map((s) => ({
      _id: s.id,
      name: s.name,
      semester: s.semester,
      department: s.department,
    }));

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
      await Subject.insertMany(batch, { ordered: false });
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
