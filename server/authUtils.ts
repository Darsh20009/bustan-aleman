import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param password Plain text password to verify
 * @param hash Stored hash to compare against
 * @returns True if password matches hash, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Check if a string is already a bcrypt hash
 * @param str String to check
 * @returns True if string appears to be a bcrypt hash
 */
export function isHashedPassword(str: string): boolean {
  return str.startsWith('$2b$') || str.startsWith('$2a$') || str.startsWith('$2y$');
}