import { defineConfig } from "drizzle-kit";

// Build AWS RDS connection string if credentials are available
let databaseUrl = '';
if (process.env.AWS_DB_HOST && process.env.AWS_DB_PORT && 
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
  dbCredentials: {
    url: databaseUrl,
  },
  schemaFilter: ["bustan"],
});
