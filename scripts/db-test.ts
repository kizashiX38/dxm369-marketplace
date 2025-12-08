#!/usr/bin/env tsx
// scripts/db-test.ts
// DXM369 Local Database Connectivity Test
// Run: npx tsx scripts/db-test.ts

import { query } from "../src/lib/db";

async function main() {
  console.log("🔍 Testing DXM369 Database Connection...\n");

  try {
    const result = await query("SELECT NOW() as current_time, version() as pg_version");
    
    if (result && result.rows.length > 0) {
      console.log("✅ DB is ALIVE!");
      console.log(`   Current Time: ${result.rows[0].current_time}`);
      console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}\n`);
      
      // Test a simple query
      const testQuery = await query("SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'");
      if (testQuery) {
        console.log(`📊 Public schema tables: ${testQuery.rows[0].table_count}`);
      }
      
      console.log("\n✅ Database connectivity test PASSED");
      process.exit(0);
    } else {
      console.error("❌ Query returned no results");
      process.exit(1);
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("❌ Database connection FAILED:");
    console.error(`   ${err.message}\n`);
    console.error("💡 Make sure:");
    console.error("   1. PostgreSQL is running: sudo systemctl start postgresql");
    console.error("   2. DATABASE_URL is set in .env.local");
    console.error("   3. Database exists: createdb dxm_marketplace");
    console.error("   4. Schema is loaded: psql $DATABASE_URL -f database/schema-v2.sql\n");
    process.exit(1);
  }
}

main();

