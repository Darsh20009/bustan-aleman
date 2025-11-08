import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const sql = neon(process.env.EXTERNAL_DATABASE_URL);

async function runMigration() {
  try {
    console.log('📁 Reading migration file...');
    const migrationSQL = readFileSync('./migrations/0000_organic_fabian_cortez.sql', 'utf8');
    
    console.log('🔄 Executing migration SQL...');
    await sql(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'bustan' 
      ORDER BY table_name LIMIT 40;
    `;
    
    console.log(`\n✅ Tables in database: ${result.length}`);
    result.forEach((row) => console.log(`  - ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
