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

// Prioritize external database from Render, then fall back to local DATABASE_URL
const databaseUrl = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL;

if (databaseUrl) {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
  const dbSource = process.env.EXTERNAL_DATABASE_URL ? "External Render" : "Local";
  console.log(`✅ Database connection initialized (${dbSource})`);
} else {
  console.log("⚠️  No database URL found. Using JSON storage fallback.");
}

export { pool, db };