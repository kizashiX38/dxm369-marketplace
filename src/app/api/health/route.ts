// src/app/api/health/route.ts
// DXM369 Health Check Endpoint
// Returns system status including database connectivity

import { NextResponse } from "next/server";
import { checkConnection, getStatus, isDatabaseConfigured } from "@/lib/db";
import { apiSafe } from "@/lib/apiSafe";
import { env } from "@/lib/env";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: "ok" | "degraded" | "down";
  name: string;
  version: string;
  timestamp: string;
  uptime: number;
  database: {
    configured: boolean;
    connected: boolean;
    poolSize?: number;
    idleCount?: number;
    waitingCount?: number;
  };
  services: {
    amazon: boolean;
    email: boolean;
  };
  environment: string;
}

const startTime = Date.now();

export const GET = apiSafe(async () => {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  // Check database status
  const dbConfigured = isDatabaseConfigured();
  let dbConnected = false;
  let poolInfo: { poolSize?: number; idleCount?: number; waitingCount?: number } = {};
  
  if (dbConfigured) {
    try {
      dbConnected = await checkConnection();
      const status = await getStatus();
      poolInfo = {
        poolSize: status.poolSize,
        idleCount: status.idleCount,
        waitingCount: status.waitingCount,
      };
    } catch (error) {
      console.warn('[Health Check] DB connection test failed:', error instanceof Error ? error.message : String(error));
      dbConnected = false;
    }
  }
  
  // Check services using centralized environment access
  const services = {
    amazon: !!(env.AMAZON_ACCESS_KEY_ID && env.AMAZON_SECRET_ACCESS_KEY),
    email: !!env.SENDGRID_API_KEY,
  };
  
  // Determine overall status
  let status: "ok" | "degraded" | "down" = "ok";
  
  if (dbConfigured && !dbConnected) {
    status = "degraded";
  }
  
  const healthStatus: HealthStatus = {
    status,
    name: "dxm369-gear-nexus",
    version: "2.0.0",
    timestamp,
    uptime,
    database: {
      configured: dbConfigured,
      connected: dbConnected,
      ...poolInfo,
    },
    services,
    environment: env.NODE_ENV || "development",
  };
  
  // Return appropriate status code
  const statusCode = status === "ok" ? 200 : status === "degraded" ? 200 : 503;
  
  return NextResponse.json({ ok: true, data: healthStatus }, { status: statusCode });
});
