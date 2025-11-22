import pg from 'pg';

const { Pool } = pg;

async function createSchema() {
  const pool = new Pool({
    host: process.env.AWS_DATABASE_HOST,
    port: parseInt(process.env.AWS_DATABASE_PORT || '5432'),
    database: process.env.AWS_DATABASE_NAME,
    user: process.env.AWS_DATABASE_USER,
    password: process.env.AWS_DATABASE_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to AWS RDS...');
    await pool.query('CREATE SCHEMA IF NOT EXISTS bustan;');
    console.log('✅ Schema "bustan" created successfully');
  } catch (error: any) {
    console.error('❌ Error creating schema:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createSchema();
