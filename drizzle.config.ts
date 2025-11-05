import { defineConfig } from "drizzle-kit";

// Use local DATABASE_URL (Aiven connection temporarily disabled)
const databaseUrl = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL || '';
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
