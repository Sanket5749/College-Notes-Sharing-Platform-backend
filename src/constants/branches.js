/**
 * Allowed Engineering Branches and Departments
 * Strictly limited to the 9 engineering branches specified:
 * 1. Computer Engineering
 * 2. Mechanical Engineering
 * 3. Civil Engineering
 * 4. Electrical Engineering
 * 5. Electronics & Telecommunication (ENTC)
 * 6. Artificial Intelligence & Data Science (AIDS)
 * 7. Artificial Intelligence & Machine Learning (AIML)
 * 8. Data Science (DS)
 * 9. Information Technology (IT)
 */

export const ALLOWED_BRANCHES = [
  {
    id: 'computer-engineering',
    name: 'Computer Engineering',
    shortName: 'Computer',
    code: 'COMP',
    aliases: ['computer engineering', 'computer', 'ce', 'cs', 'cse'],
  },
  {
    id: 'mechanical-engineering',
    name: 'Mechanical Engineering',
    shortName: 'Mechanical',
    code: 'MECH',
    aliases: ['mechanical engineering', 'mechanical', 'mech'],
  },
  {
    id: 'civil-engineering',
    name: 'Civil Engineering',
    shortName: 'Civil',
    code: 'CIVIL',
    aliases: ['civil engineering', 'civil'],
  },
  {
    id: 'electrical-engineering',
    name: 'Electrical Engineering',
    shortName: 'Electrical',
    code: 'ELEC',
    aliases: ['electrical engineering', 'electrical', 'ee'],
  },
  {
    id: 'entc',
    name: 'Electronics & Telecommunication (ENTC)',
    shortName: 'ENTC',
    code: 'ENTC',
    aliases: ['entc', 'electronics and telecommunication', 'etc', 'ece', 'electronics'],
  },
  {
    id: 'aids',
    name: 'Artificial Intelligence & Data Science (AIDS)',
    shortName: 'AI & Data Science',
    code: 'AIDS',
    aliases: ['aids', 'ai & ds', 'ai and data science', 'artificial intelligence and data science'],
  },
  {
    id: 'aiml',
    name: 'Artificial Intelligence & Machine Learning (AIML)',
    shortName: 'AI & ML',
    code: 'AIML',
    aliases: ['aiml', 'ai & ml', 'ai and machine learning', 'artificial intelligence and machine learning'],
  },
  {
    id: 'ds',
    name: 'Data Science (DS)',
    shortName: 'Data Science',
    code: 'DS',
    aliases: ['ds', 'data science'],
  },
  {
    id: 'it',
    name: 'Information Technology (IT)',
    shortName: 'IT',
    code: 'IT',
    aliases: ['it', 'information technology'],
  },
];

export const BRANCH_NAMES = ALLOWED_BRANCHES.map((b) => b.name);

export const isValidBranch = (branchInput) => {
  if (!branchInput) return false;
  const normalized = branchInput.trim().toLowerCase();
  return ALLOWED_BRANCHES.some(
    (b) =>
      b.id === normalized ||
      b.code.toLowerCase() === normalized ||
      b.name.toLowerCase() === normalized ||
      b.aliases.includes(normalized)
  );
};

export const normalizeBranchName = (branchInput) => {
  if (!branchInput) return null;
  const normalized = branchInput.trim().toLowerCase();
  const matched = ALLOWED_BRANCHES.find(
    (b) =>
      b.id === normalized ||
      b.code.toLowerCase() === normalized ||
      b.name.toLowerCase() === normalized ||
      b.aliases.includes(normalized)
  );
  return matched ? matched.name : null;
};
