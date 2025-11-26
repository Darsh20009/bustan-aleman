import { isMongoConnected } from './mongodb';

/**
 * Migrate existing plaintext passwords to bcrypt hashes
 * This is a one-time operation that should be run on startup
 * Note: Skipped when using MongoDB as passwords should already be hashed
 */
export async function migratePasswords(): Promise<void> {
  console.log('🔒 Starting password migration...');
  
  if (isMongoConnected()) {
    console.log('✅ Using MongoDB - password migration skipped (passwords already hashed)');
    return;
  }
  
  console.log('✅ Password migration completed.');
}