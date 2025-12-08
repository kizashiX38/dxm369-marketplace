#!/usr/bin/env ts-node
// scripts/check-env.ts
// DXM369 Pre-Deploy Environment Validation
// Blocks deployment if environment configuration is invalid

import { env } from "../src/lib/env";

function main() {
  // Just importing env will validate and throw in production.
  // If we reached here, config is structurally valid.
  // You can add any extra logic here if you want.
  console.log("✅ Environment configuration looks valid.");
  console.log(`   NODE_ENV=${env.NODE_ENV}`);
  console.log(`   NEXT_PUBLIC_ENV=${env.NEXT_PUBLIC_ENV}`);
  console.log(`   NEXT_PUBLIC_SITE_URL=${env.NEXT_PUBLIC_SITE_URL}`);
  console.log(`   NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=${env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG}`);
  
  // Additional checks
  if (env.NODE_ENV === "production") {
    console.log("\n🔒 Production mode detected - validating required variables...");
    
    const required = [
      "AMAZON_ACCESS_KEY_ID",
      "AMAZON_SECRET_ACCESS_KEY",
      "AMAZON_ASSOCIATE_TAG",
      "DATABASE_URL",
      "APP_SECRET",
      "JWT_SECRET",
      "RATE_LIMIT_SECRET",
    ];
    
    let allPresent = true;
    for (const key of required) {
      const value = (env as any)[key];
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        console.error(`❌ Missing required variable: ${key}`);
        allPresent = false;
      } else {
        console.log(`   ✅ ${key}`);
      }
    }
    
    if (!allPresent) {
      console.error("\n❌ Environment validation failed. Deployment blocked.");
      process.exit(1);
    }
    
    console.log("\n✅ All required production variables present.");
  } else {
    console.log("\n⚠️  Development mode - some variables may be optional.");
  }
  
  console.log("\n🚀 Environment check passed. Ready to build.");
}

main();

