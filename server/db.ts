import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket to accept self-signed certificates in development
class CustomWebSocket extends ws {
  constructor(address: string | URL, protocols?: string | string[]) {
    super(address, protocols, {
      rejectUnauthorized: false  // Accept self-signed certificates
    });
  }
}

neonConfig.webSocketConstructor = CustomWebSocket as any;
neonConfig.pipelineConnect = false;

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// Build Aiven database URL from individual secrets if available
let databaseUrl = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL;

if (process.env.AIVEN_DB_HOST && process.env.AIVEN_DB_PORT && 
    process.env.AIVEN_DB_NAME && process.env.AIVEN_DB_USER && 
    process.env.AIVEN_DB_PASSWORD) {
  // Construct Aiven PostgreSQL connection string with SSL mode require
  databaseUrl = `postgresql://${process.env.AIVEN_DB_USER}:${process.env.AIVEN_DB_PASSWORD}@${process.env.AIVEN_DB_HOST}:${process.env.AIVEN_DB_PORT}/${process.env.AIVEN_DB_NAME}?sslmode=require`;
  console.log(`🔗 Connecting to Aiven database at ${process.env.AIVEN_DB_HOST}:${process.env.AIVEN_DB_PORT}`);
}

if (databaseUrl) {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
  const dbSource = databaseUrl.includes('aivencloud.com') ? "Aiven Cloud" : 
                   process.env.EXTERNAL_DATABASE_URL ? "External Render" : "Local";
  console.log(`✅ Database connection initialized (${dbSource})`);
} else {
  console.log("⚠️  No database URL found. Using JSON storage fallback.");
}

export { pool, db };