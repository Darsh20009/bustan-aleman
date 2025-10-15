import { defineConfig } from "drizzle-kit";

// Build Aiven database URL from individual secrets if available
let databaseUrl: string;

if (process.env.AIVEN_DB_HOST && process.env.AIVEN_DB_PORT && 
    process.env.AIVEN_DB_NAME && process.env.AIVEN_DB_USER && 
    process.env.AIVEN_DB_PASSWORD) {
  // Use connection string with sslmode=require for Aiven
  databaseUrl = `postgresql://${process.env.AIVEN_DB_USER}:${process.env.AIVEN_DB_PASSWORD}@${process.env.AIVEN_DB_HOST}:${process.env.AIVEN_DB_PORT}/${process.env.AIVEN_DB_NAME}?sslmode=require`;
} else {
  databaseUrl = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL || '';
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not found, ensure the database is provisioned");
  }
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
