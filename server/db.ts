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

// Validate and build database URL
function isValidDatabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return url.startsWith('postgres://') || url.startsWith('postgresql://');
  } catch {
    return false;
  }
}

// Use EXTERNAL_DATABASE_URL if valid, otherwise fallback to DATABASE_URL
let databaseUrl: string | undefined;
if (isValidDatabaseUrl(process.env.EXTERNAL_DATABASE_URL)) {
  databaseUrl = process.env.EXTERNAL_DATABASE_URL;
} else {
  if (process.env.EXTERNAL_DATABASE_URL) {
    console.log('⚠️  EXTERNAL_DATABASE_URL is set but invalid, falling back to DATABASE_URL');
  }
  databaseUrl = process.env.DATABASE_URL;
}

// Check if AWS RDS should be used (via environment variable for safer deployment)
const ENABLE_AWS_RDS = process.env.ENABLE_AWS_RDS === 'true';

// Try AWS RDS connection if enabled and all credentials are available
async function tryAwsRdsConnection(): Promise<boolean> {
  if (!ENABLE_AWS_RDS) return false;
  
  if (!process.env.AWS_DATABASE_HOST || !process.env.AWS_DATABASE_PORT || 
      !process.env.AWS_DATABASE_NAME || !process.env.AWS_DATABASE_USER || 
      !process.env.AWS_DATABASE_PASSWORD) {
    console.log('⚠️  AWS RDS credentials incomplete, skipping...');
    return false;
  }

  console.log(`🔗 Attempting to connect to AWS RDS at ${process.env.AWS_DATABASE_HOST}:${process.env.AWS_DATABASE_PORT}`);
  
  const pgPool = new PgPool({
    host: process.env.AWS_DATABASE_HOST,
    port: parseInt(process.env.AWS_DATABASE_PORT || '5432'),
    database: process.env.AWS_DATABASE_NAME,
    user: process.env.AWS_DATABASE_USER,
    password: process.env.AWS_DATABASE_PASSWORD,
    ssl: {
      rejectUnauthorized: false  // TODO: Use AWS RDS CA certificate in production
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  
  // Test connection before committing to this pool
  try {
    const client = await pgPool.connect();
    console.log('✅ Successfully connected to AWS RDS');
    client.release();
    
    // Only assign if connection succeeds
    pool = pgPool;
    db = drizzlePg(pgPool, { schema });
    return true;
  } catch (err: any) {
    console.error('❌ Failed to connect to AWS RDS:', err.message);
    console.log('⚠️  Falling back to local database...');
    await pgPool.end();  // Clean up failed pool
    return false;
  }
}

function initializeLocalDatabase() {
  if (!databaseUrl) return;
  
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
    if (!ENABLE_AWS_RDS && process.env.AWS_DATABASE_HOST) {
      console.log(`⚠️  AWS RDS database available but disabled. Set environment variable ENABLE_AWS_RDS=true to use it.`);
    }
  }
}

// Initialize database connection (async wrapper for AWS RDS fallback)
export async function initializeDatabase() {
  const awsConnected = await tryAwsRdsConnection();

  if (!awsConnected && databaseUrl) {
    initializeLocalDatabase();
  } else if (!awsConnected && !databaseUrl) {
    console.log("⚠️  No database URL found. Using JSON storage fallback.");
  }
}

export { pool, db };