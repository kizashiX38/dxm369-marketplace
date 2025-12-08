// DEBUG: Environment variable inspection (remove after testing)
import { NextResponse } from "next/server";

export const GET = async () => {
  const dbUrl = process.env.DATABASE_URL || "NOT SET";
  const masked = dbUrl === "NOT SET"
    ? "NOT SET"
    : dbUrl.substring(0, 20) + "..." + dbUrl.substring(dbUrl.length - 10);

  return NextResponse.json({
    DATABASE_URL_SET: dbUrl !== "NOT SET",
    DATABASE_URL_MASKED: masked,
    DATABASE_URL_LENGTH: dbUrl.length,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
};
