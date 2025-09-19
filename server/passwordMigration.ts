import { jsonStorage } from './jsonStorage';
import { hashPassword, isHashedPassword } from './authUtils';

/**
 * Migrate existing plaintext passwords to bcrypt hashes
 * This is a one-time operation that should be run on startup
 */
export async function migratePasswords(): Promise<void> {
  console.log('🔒 Starting password migration...');
  
  try {
    const students = await jsonStorage.getAllStudents();
    let migrated = 0;
    
    for (const student of students) {
      // Check if password is already hashed
      if (!isHashedPassword(student.password)) {
        console.log(`Migrating password for student: ${student.studentName}`);
        
        // Hash the plaintext password
        const hashedPassword = await hashPassword(student.password);
        
        // Update the student record
        await jsonStorage.updateStudent(student.id, {
          ...student,
          password: hashedPassword,
        });
        
        migrated++;
      }
    }
    
    console.log(`✅ Password migration completed. Migrated ${migrated} passwords.`);
  } catch (error) {
    console.error('❌ Password migration failed:', error);
    // Don't throw - we don't want to crash the app if migration fails
  }
}