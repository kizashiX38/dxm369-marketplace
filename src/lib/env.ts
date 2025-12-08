'use server';

// src/lib/env.ts
// DXM369 Environment Hardening - Enterprise-Grade Configuration
// Single source of truth for all environment variables
// SERVER-ONLY MODULE - Do not import in client components

import { z } from "zod";

// Helper to pretty-print Zod errors
function formatZodErrors(err: z.ZodError): string {
  return err.issues
    .map((e) => {
      const path = e.path.join(".") || "(root)";
      return `- ${path}: ${e.message}`;
    })
    .join("\n");
}

/**
 * SERVER-ONLY ENV (never exposed to the browser)
 * Anything secret or sensitive goes here.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  AMAZON_ACCESS_KEY_ID: z.string().optional(),
  AMAZON_SECRET_ACCESS_KEY: z.string().optional(),
  AMAZON_ASSOCIATE_TAG: z.string().optional(),

  AMAZON_REGION: z.string().default("us-east-1"),
  AMAZON_HOST: z.string().default("webservices.amazon.com"),

  // Local ASIN scraping service (fallback when API not available)
  ASIN_SCRAPER_URL: z.string().default("http://localhost:5000"),
  ASIN_SCRAPER_ENABLED: z.string().default("true"),

  DATABASE_URL: z.string().optional(),

  SENDGRID_API_KEY: z.string().optional(),

  APP_SECRET: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  RATE_LIMIT_SECRET: z.string().optional(),

  // Admin & Security
  ADMIN_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  // Database pool
  DATABASE_POOL_MIN: z.string().optional(),
  DATABASE_POOL_MAX: z.string().optional(),

  // Email
  FROM_EMAIL: z.string().optional().default("noreply@dxm369.com"),

  // Observability
  SENTRY_DSN: z.string().url().optional(),

  // Earnings sync
  AMAZON_SESSION_COOKIES: z.string().optional(),
  AMAZON_SESSION_ID: z.string().optional(),
  AMAZON_UBID_MAIN: z.string().optional(),
  
  // Tracking IDs (comma-separated list)
  AMAZON_TRACKING_IDS: z.string().optional(),
});

/**
 * CLIENT-SAFE ENV (NEXT_PUBLIC_*)
 * These are safe to expose to the browser.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_ENV: z
    .string()
    .optional()
    .default("development"),

  NEXT_PUBLIC_SITE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_SITE_URL is required")
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("http://localhost:3000"),

  NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG: z
    .string()
    .min(1, "NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG is required")
    .default("dxm369-20"),

  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_ADMIN_KEY: z.string().optional(),
  NEXT_PUBLIC_TRACKING_BASE_TAG: z.string().optional(),
});

// Raw read from process.env
const rawServerEnv = {
  NODE_ENV: process.env.NODE_ENV,

  AMAZON_ACCESS_KEY_ID: process.env.AMAZON_ACCESS_KEY_ID?.trim(),
  AMAZON_SECRET_ACCESS_KEY: process.env.AMAZON_SECRET_ACCESS_KEY?.trim(),
  AMAZON_ASSOCIATE_TAG: process.env.AMAZON_ASSOCIATE_TAG?.trim(),

  AMAZON_REGION: process.env.AMAZON_REGION,
  AMAZON_HOST: process.env.AMAZON_HOST,

  ASIN_SCRAPER_URL: process.env.ASIN_SCRAPER_URL,
  ASIN_SCRAPER_ENABLED: process.env.ASIN_SCRAPER_ENABLED,

  // DATABASE_URL: Support both direct DATABASE_URL and Vercel-provided DATABASE_POSTGRES_*_URL variants
  // Use NON_POOLING if available, since pooler URLs have pgbouncer parameter incompatible with node-pg
  // Strip trailing newlines that Vercel CLI sometimes adds
  // Also remove the pgbouncer parameter if present
  DATABASE_URL: (() => {
    const url = (process.env.DATABASE_URL || process.env.DATABASE_POSTGRES_URL_NON_POOLING || process.env.DATABASE_POSTGRES_URL || process.env.DATABASE_POSTGRES_PRISMA_URL)?.trim();
    if (!url) return undefined;
    // Remove pgbouncer parameter which causes issues with node-pg
    return url.replace('&pgbouncer=true', '').replace('?pgbouncer=true', '');
  })(),

  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

  APP_SECRET: process.env.APP_SECRET?.trim(),
  JWT_SECRET: process.env.JWT_SECRET?.trim(),
  RATE_LIMIT_SECRET: process.env.RATE_LIMIT_SECRET?.trim(),

  ADMIN_SECRET: process.env.ADMIN_SECRET,
  CRON_SECRET: process.env.CRON_SECRET,

  DATABASE_POOL_MIN: process.env.DATABASE_POOL_MIN,
  DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX,

  FROM_EMAIL: process.env.FROM_EMAIL,

  SENTRY_DSN: process.env.SENTRY_DSN,

  AMAZON_SESSION_COOKIES: process.env.AMAZON_SESSION_COOKIES,
  AMAZON_SESSION_ID: process.env.AMAZON_SESSION_ID,
  AMAZON_UBID_MAIN: process.env.AMAZON_UBID_MAIN,
  
  AMAZON_TRACKING_IDS: process.env.AMAZON_TRACKING_IDS,
};

const rawClientEnv = {
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG: process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_ADMIN_KEY: process.env.NEXT_PUBLIC_ADMIN_KEY,
  NEXT_PUBLIC_TRACKING_BASE_TAG: process.env.NEXT_PUBLIC_TRACKING_BASE_TAG,
};

// Parse & validate
const parsedServer = serverEnvSchema.safeParse(rawServerEnv);
if (!parsedServer.success) {
  const message =
    "❌ Invalid server environment variables:\n" +
    formatZodErrors(parsedServer.error);

  // In production: hard fail
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  } else {
    // In dev: log loudly, but continue to allow iteration
    console.warn(message);
  }
}

const parsedClient = clientEnvSchema.safeParse(rawClientEnv);
if (!parsedClient.success) {
  const message =
    "❌ Invalid client environment variables (NEXT_PUBLIC_*):\n" +
    formatZodErrors(parsedClient.error);

  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  } else {
    console.warn(message);
  }
}

const serverEnv = (parsedServer.success
  ? parsedServer.data
  : (rawServerEnv as z.infer<typeof serverEnvSchema>));

const clientEnv = (parsedClient.success
  ? parsedClient.data
  : (rawClientEnv as z.infer<typeof clientEnvSchema>));

/**
 * Extra hardening: variables that MUST be present in production.
 */
const requiredInProd: (keyof typeof serverEnv)[] = [
  "AMAZON_ACCESS_KEY_ID",
  "AMAZON_SECRET_ACCESS_KEY",
  "AMAZON_ASSOCIATE_TAG",
  "DATABASE_URL",
  "APP_SECRET",
  "JWT_SECRET",
  "RATE_LIMIT_SECRET",
];

// Only validate required vars at runtime, not during build
// Skip validation during Vercel build phase
const isVercelBuild = process.env.VERCEL === "1" && !process.env.AWS_LAMBDA_FUNCTION_VERSION;

if (serverEnv.NODE_ENV === "production" && !isVercelBuild) {
  const missing: string[] = [];

  for (const key of requiredInProd) {
    const value = serverEnv[key];
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      [
        "❌ Missing REQUIRED production env vars:",
        ...missing.map((k) => `- ${k}`),
      ].join("\n")
    );
  }
}

/**
 * Final exported env object:
 * - Safe to import in server-side code (API routes, getServerSideProps, etc.)
 * - DO NOT import this from client components (to avoid bundling secrets).
 */
export const env = {
  ...serverEnv,
  ...clientEnv,
} as const;

// Convenience type
export type Env = typeof env;

// Backward compatibility exports
export const amazonConfig = {
  accessKeyId: serverEnv.AMAZON_ACCESS_KEY_ID || "",
  secretAccessKey: serverEnv.AMAZON_SECRET_ACCESS_KEY || "",
  associateTag: serverEnv.AMAZON_ASSOCIATE_TAG || "dxm369-20",
  region: serverEnv.AMAZON_REGION,
  host: serverEnv.AMAZON_HOST,
  publicAssociateTag: clientEnv.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG,
  scraperUrl: serverEnv.ASIN_SCRAPER_URL,
  scraperEnabled: serverEnv.ASIN_SCRAPER_ENABLED === "true",
};

export const databaseConfig = {
  url: serverEnv.DATABASE_URL || "",
  poolMin: parseInt(serverEnv.DATABASE_POOL_MIN || "2", 10),
  poolMax: parseInt(serverEnv.DATABASE_POOL_MAX || "10", 10),
};

export const emailConfig = {
  sendgridApiKey: serverEnv.SENDGRID_API_KEY || "",
  fromEmail: serverEnv.FROM_EMAIL || "noreply@dxm369.com",
};

export const securityConfig = {
  adminSecret: serverEnv.ADMIN_SECRET || "",
  publicAdminKey: clientEnv.NEXT_PUBLIC_ADMIN_KEY || "",
  cronSecret: serverEnv.CRON_SECRET || "",
  appSecret: serverEnv.APP_SECRET || "",
  jwtSecret: serverEnv.JWT_SECRET || "",
  rateLimitSecret: serverEnv.RATE_LIMIT_SECRET || "",
};

export const appConfig = {
  environment: serverEnv.NODE_ENV,
  publicEnv: clientEnv.NEXT_PUBLIC_ENV,
  siteUrl: clientEnv.NEXT_PUBLIC_SITE_URL,
  baseUrl: clientEnv.NEXT_PUBLIC_BASE_URL || clientEnv.NEXT_PUBLIC_SITE_URL,
  isProduction: serverEnv.NODE_ENV === "production",
  isDevelopment: serverEnv.NODE_ENV === "development",
  isStaging: clientEnv.NEXT_PUBLIC_ENV === "staging",
};

export const observabilityConfig = {
  sentryDsn: serverEnv.SENTRY_DSN || "",
};

export const trackingConfig = {
  baseTag: clientEnv.NEXT_PUBLIC_TRACKING_BASE_TAG || "dxm369",
  trackingIds: serverEnv.AMAZON_TRACKING_IDS
    ? serverEnv.AMAZON_TRACKING_IDS.split(",").map(id => id.trim())
    : ["dxm369-20"],
};

export const earningsConfig = {
  sessionCookies: serverEnv.AMAZON_SESSION_COOKIES || "",
  sessionId: serverEnv.AMAZON_SESSION_ID || "",
  ubidMain: serverEnv.AMAZON_UBID_MAIN || "",
};

/**
 * CLIENT-SAFE PUBLIC CONFIG
 * Safe to import in client components (only exposes NEXT_PUBLIC_* values)
 */
export const publicConfig = {
  associateTag: clientEnv.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "dxm369-20",
  trackingBaseTag: clientEnv.NEXT_PUBLIC_TRACKING_BASE_TAG || "dxm369",
  siteUrl: clientEnv.NEXT_PUBLIC_SITE_URL,
  baseUrl: clientEnv.NEXT_PUBLIC_BASE_URL || clientEnv.NEXT_PUBLIC_SITE_URL,
  environment: clientEnv.NEXT_PUBLIC_ENV,
  adminKey: clientEnv.NEXT_PUBLIC_ADMIN_KEY || "",
} as const;

// Validation helpers (backward compatibility)
export function validateEnvironment(): { valid: boolean; errors: string[]; warnings: string[]; missing: string[]; configured: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing: string[] = [];
  const configured: string[] = [];

  if (!parsedServer.success) {
    errors.push(...parsedServer.error.issues.map(e => `${e.path.join(".")}: ${e.message}`));
  }

  if (!parsedClient.success) {
    errors.push(...parsedClient.error.issues.map(e => `${e.path.join(".")}: ${e.message}`));
  }

  if (serverEnv.NODE_ENV === "production") {
    for (const key of requiredInProd) {
      const value = serverEnv[key];
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        missing.push(key);
        errors.push(`Missing required production variable: ${key}`);
      } else {
        configured.push(key);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missing,
    configured,
  };
}

export function isDatabaseConfigured(): boolean {
  return !!serverEnv.DATABASE_URL && serverEnv.DATABASE_URL.startsWith("postgresql://");
}

export function isAmazonConfigured(): boolean {
  return !!(
    serverEnv.AMAZON_ACCESS_KEY_ID &&
    serverEnv.AMAZON_SECRET_ACCESS_KEY &&
    serverEnv.AMAZON_ASSOCIATE_TAG
  );
}

export function isEmailConfigured(): boolean {
  return !!serverEnv.SENDGRID_API_KEY;
}

export function isSecurityConfigured(): boolean {
  return !!(
    serverEnv.ADMIN_SECRET &&
    serverEnv.APP_SECRET &&
    serverEnv.JWT_SECRET
  );
}

export function getEnvironmentReadinessScore(): number {
  const validation = validateEnvironment();
  const totalChecks = validation.configured.length + validation.missing.length;
  if (totalChecks === 0) return 0;
  return Math.round((validation.configured.length / totalChecks) * 100);
}
