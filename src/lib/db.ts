// src/lib/db.ts
// DXM369 PostgreSQL Database Client
// Production-ready connection pooling with graceful shutdown
// SERVER-ONLY MODULE - Do not import in client components

import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { env } from "./env";
import { log } from "./log";

// Database configuration from environment using centralized access
const getDatabaseConfig = (): PoolConfig => {
  const connectionString = env.DATABASE_URL;
  
  if (!connectionString) {
    log.warn('[DXM369 DB] DATABASE_URL not set - database features disabled');
    return {
      connectionString: '',
      max: 0,
    };
  }
  
  // Detect local Postgres (localhost/127.0.0.1) - disable SSL for local dev
  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  return {
    connectionString,
    max: parseInt(env.DATABASE_POOL_MAX || '10', 10),
    min: parseInt(env.DATABASE_POOL_MIN || '2', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    // SSL configuration: disable for local, enable for production cloud DBs
    ssl: isLocal ? false : { rejectUnauthorized: false },
  };
};

// Singleton pool instance
let pool: Pool | null = null;

/**
 * Get the database pool instance
 * Creates a new pool if one doesn't exist
 * 
 * DXM369 LOCAL-FIRST: Force strict mode - throws error if DB not configured
 * This prevents silent failures in local development
 */
export function getPool(): Pool {
  if (!env.DATABASE_URL) {
    throw new Error(
      "[DXM369 DB] DATABASE_URL is missing. Set it in .env.local\n" +
      "Example: DATABASE_URL=\"postgresql://dxm:dxm369@localhost:5432/dxm_marketplace\""
    );
  }
  
  if (!pool) {
    pool = new Pool(getDatabaseConfig());
    
    // Handle pool errors
    pool.on('error', (err) => {
      log.error('[DXM369 DB] Unexpected pool error:', err);
    });
    
    // Log connection info in development
    if (env.NODE_ENV !== 'production') {
      log.info('[DXM369 DB] Pool initialized');
    }
  }
  
  return pool;
}

/**
 * Execute a query with parameters
 * DXM369 LOCAL-FIRST: Throws error if DB not configured (no silent failures)
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const dbPool = getPool(); // Will throw if DATABASE_URL missing
  
  const start = Date.now();
  
  try {
    const result = await dbPool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (env.NODE_ENV !== 'production' && duration > 100) {
      log.info(`[DXM369 DB] Slow query (${duration}ms)`, { 
        query: text.substring(0, 80),
        duration 
      });
    }
    
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error('[DXM369 DB] Query error:', { 
      error: err.message,
      query: text.substring(0, 100)
    });
    throw error;
  }
}

/**
 * Execute a query and return the first row
 */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

/**
 * Execute a query and return all rows
 */
export async function queryAll<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows || [];
}

/**
 * Check database connectivity
 * Returns true if connected, false otherwise
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as connected');
    return result !== null && result.rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get database status information
 */
export async function getStatus(): Promise<{
  connected: boolean;
  poolSize: number;
  idleCount: number;
  waitingCount: number;
}> {
  try {
    const dbPool = getPool(); // Will throw if DATABASE_URL missing
    const connected = await checkConnection();
    
    return {
      connected,
      poolSize: dbPool.totalCount,
      idleCount: dbPool.idleCount,
      waitingCount: dbPool.waitingCount,
    };
  } catch (error) {
    return {
      connected: false,
      poolSize: 0,
      idleCount: 0,
      waitingCount: 0,
    };
  }
}

/**
 * Gracefully close the database pool
 * Call this on server shutdown
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    log.info('[DXM369 DB] Pool closed');
  }
}

/**
 * Check if database is configured
 */
export function isDatabaseConfigured(): boolean {
  return !!env.DATABASE_URL;
}

// Export default object for convenience
export const db = {
  query,
  queryOne,
  queryAll,
  getPool,
  checkConnection,
  getStatus,
  closePool,
  isDatabaseConfigured,
};

export default db;

