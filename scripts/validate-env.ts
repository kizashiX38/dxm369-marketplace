#!/usr/bin/env ts-node
// scripts/validate-env.ts
// DXM369 Environment Validation Script
// Validates all environment variables and provides detailed report

import { validateEnvironment, getEnvironmentReadinessScore } from "../src/lib/env";

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║     DXM369 Environment Validation Report                     ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log("");

const result = validateEnvironment();
const score = getEnvironmentReadinessScore();

// Overall Status
console.log(`📊 Environment Readiness: ${score}%`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log("");

// Errors
if (result.errors.length > 0) {
  console.log("❌ ERRORS (Must be fixed):");
  result.errors.forEach((error) => {
    console.log(`   • ${error}`);
  });
  console.log("");
}

// Warnings
if (result.warnings.length > 0) {
  console.log("⚠️  WARNINGS (Recommended fixes):");
  result.warnings.forEach((warning) => {
    console.log(`   • ${warning}`);
  });
  console.log("");
}

// Missing Variables
if (result.missing.length > 0) {
  console.log("📋 MISSING VARIABLES:");
  result.missing.forEach((varName) => {
    console.log(`   • ${varName}`);
  });
  console.log("");
}

// Configured Variables
if (result.configured.length > 0) {
  console.log("✅ CONFIGURED VARIABLES:");
  result.configured.forEach((varName) => {
    console.log(`   • ${varName}`);
  });
  console.log("");
}

// Summary
console.log("╔══════════════════════════════════════════════════════════════╗");
if (result.valid) {
  console.log("║  ✅ Environment is VALID and ready for deployment           ║");
} else {
  console.log("║  ❌ Environment has ERRORS - fix before deployment         ║");
}
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log("");

// Exit with appropriate code
process.exit(result.valid ? 0 : 1);

