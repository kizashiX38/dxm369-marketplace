// DEBUG: Database connection test
import { NextResponse } from "next/server";
import { checkConnection, getPool } from "@/lib/db";
import { env } from "@/lib/env";

export const GET = async () => {
  try {
    const dbUrl = env.DATABASE_URL;
    const masked = dbUrl
      ? `${dbUrl.substring(0, 30)}...${dbUrl.substring(dbUrl.length - 20)}`
      : "NOT SET";

    // Try to connect
    try {
      const pool = getPool();
      const connected = await checkConnection();

      return NextResponse.json({
        status: "success",
        database_url_set: !!dbUrl,
        database_url_masked: masked,
        database_url_cleaned: dbUrl ? dbUrl.replace(/sslmode=require.*$/, 'sslmode=require...').substring(0, 60) : 'NOT SET',
        connected,
        pool_info: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount,
        },
      });
    } catch (connErr) {
      const err = connErr instanceof Error ? connErr : new Error(String(connErr));
      return NextResponse.json({
        status: "error",
        database_url_set: !!dbUrl,
        database_url_masked: masked,
        error_message: err.message,
        error_code: (err as any).code,
        error_syscall: (err as any).syscall,
        error_errno: (err as any).errno,
        error_address: (err as any).address,
        error_port: (err as any).port,
      }, { status: 500 });
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return NextResponse.json({
      status: "critical_error",
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? (err as any).stack : undefined,
    }, { status: 500 });
  }
};
