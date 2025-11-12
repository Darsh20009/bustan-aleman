import { defineConfig } from "drizzle-kit";

// Build database connection string
let databaseUrl = '';

// Only use AWS RDS if explicitly enabled (same as server/db.ts)
const ENABLE_AWS_RDS = process.env.ENABLE_AWS_RDS === 'true';

if (ENABLE_AWS_RDS && process.env.AWS_DB_HOST && process.env.AWS_DB_PORT && 
    process.env.AWS_DB_NAME && process.env.AWS_DB_USER && 
    process.env.AWS_DB_PASSWORD) {
  databaseUrl = `postgresql://${process.env.AWS_DB_USER}:${process.env.AWS_DB_PASSWORD}@${process.env.AWS_DB_HOST}:${process.env.AWS_DB_PORT}/${process.env.AWS_DB_NAME}?sslmode=require`;
  console.log('🔗 Using AWS RDS database for migrations');
} else {
  // Fallback to local or external database URL
  databaseUrl = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL || '';
  console.log('🔗 Using local database for migrations');
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL not found, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: ENABLE_AWS_RDS ? {
    host: process.env.AWS_DB_HOST!,
    port: parseInt(process.env.AWS_DB_PORT || '5432'),
    user: process.env.AWS_DB_USER!,
    password: process.env.AWS_DB_PASSWORD!,
    database: process.env.AWS_DB_NAME!,
    ssl: {
      rejectUnauthorized: false
    }
  } : {
    url: databaseUrl,
  },
  schemaFilter: ["bustan"],
});
