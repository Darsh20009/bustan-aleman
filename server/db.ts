import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import pg from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

const { Pool: PgPool } = pg;

// Configure WebSocket to accept self-signed certificates in development (for Neon)
class CustomWebSocket extends ws {
  constructor(address: string | URL, protocols?: string | string[]) {
    super(address, protocols, {
      rejectUnauthorized: false  // Accept self-signed certificates
    });
  }
}

neonConfig.webSocketConstructor = CustomWebSocket as any;
neonConfig.pipelineConnect = false;

let pool: any = null;
let db: any = null;

// Build Aiven database URL from individual secrets if available
let databaseUrl = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL;
let useAiven = false;

// Enable Aiven PostgreSQL database connection (disabled until secrets are verified)
const ENABLE_AIVEN = false;

if (ENABLE_AIVEN && process.env.AIVEN_DB_HOST && process.env.AIVEN_DB_PORT && 
    process.env.AIVEN_DB_NAME && process.env.AIVEN_DB_USER && 
    process.env.AIVEN_DB_PASSWORD) {
  useAiven = true;
  console.log(`🔗 Connecting to Aiven database at ${process.env.AIVEN_DB_HOST}:${process.env.AIVEN_DB_PORT}`);
}

if (useAiven) {
  // Use pg driver for Aiven with SSL configuration
  const pgPool = new PgPool({
    host: process.env.AIVEN_DB_HOST,
    port: parseInt(process.env.AIVEN_DB_PORT || '10370'),
    database: process.env.AIVEN_DB_NAME,
    user: process.env.AIVEN_DB_USER,
    password: process.env.AIVEN_DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false  // For development - in production use CA certificate
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  pool = pgPool;
  db = drizzlePg(pgPool, { schema });
  console.log(`✅ Database connection initialized (Aiven Cloud)`);
} else if (databaseUrl) {
  // Check if it's a filess.io database (use regular pg driver without SSL)
  if (databaseUrl.includes('filess.io')) {
    console.log(`🔗 Connecting to Filess.io database...`);
    const pgPool = new PgPool({
      connectionString: databaseUrl,
      ssl: false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool = pgPool;
    db = drizzlePg(pgPool, { schema });
    console.log(`✅ Database connection initialized (Filess.io)`);
  } else {
    // Use Neon driver for other databases
    const neonPool = new NeonPool({ connectionString: databaseUrl });
    pool = neonPool;
    db = drizzleNeon(neonPool, { schema });
    const dbSource = process.env.EXTERNAL_DATABASE_URL ? "External Render" : "Local";
    console.log(`✅ Database connection initialized (${dbSource})`);
    if (!ENABLE_AIVEN && process.env.AIVEN_DB_HOST) {
      console.log(`⚠️  Aiven database available but disabled. Set ENABLE_AIVEN=true in server/db.ts after fixing connection.`);
    }
  }
} else {
  console.log("⚠️  No database URL found. Using JSON storage fallback.");
}

export { pool, db };