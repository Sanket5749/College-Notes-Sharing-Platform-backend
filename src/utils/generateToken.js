import jwt from 'jsonwebtoken';

/**
 * Generates a signed JSON Web Token (JWT) for an authenticated user.
 * 
 * Notice:
 * The JWT payload contains only minimal, non-sensitive identifier info ({ userId }).
 * Passwords, secrets, or sensitive personal data must NEVER be stored in the JWT payload.
 *
 * @param {string} userId - The user's UUID from the database.
 * @returns {string} - The signed JWT token.
 */
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables.');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ userId }, secret, {
    expiresIn,
  });
};

export default generateToken;
