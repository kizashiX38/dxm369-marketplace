#!/usr/bin/env ts-node

/**
 * DXM ASIN Sourcing Engine - Prerequisites Checker
 *
 * Validates all environment and filesystem requirements before running
 * the multi-source ETL pipeline.
 *
 * Execution: npx ts-node scripts/dxm-prereq-check.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

const checks: CheckResult[] = [];

function log(msg: string, icon = '📍') {
  console.log(`${icon} ${msg}`);
}

function addCheck(name: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, severity: 'critical' | 'warning' | 'info' = 'info') {
  checks.push({ name, status, message, severity });
}

// ===== CHECKS =====

function checkKaggleConfig(): void {
  log('Checking Kaggle CLI configuration...', '🔍');

  const kaggleDir = path.join(process.env.HOME || '/home/dxm', '.kaggle');
  const kaggleJson = path.join(kaggleDir, 'kaggle.json');

  if (!fs.existsSync(kaggleJson)) {
    addCheck('Kaggle Config', 'FAIL', `Missing ~/.kaggle/kaggle.json`, 'critical');
    log(`⚠️ Kaggle configuration not found at ${kaggleJson}`, '❌');
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(kaggleJson, 'utf-8'));
    if (config.username && config.key) {
      addCheck('Kaggle Config', 'PASS', `Configured for user: ${config.username}`, 'info');
      log(`✓ Kaggle configured for: ${config.username}`, '✓');
    } else {
      addCheck('Kaggle Config', 'FAIL', 'Missing username or key in kaggle.json', 'critical');
      log('❌ Invalid kaggle.json format', '❌');
    }
  } catch (error) {
    addCheck('Kaggle Config', 'FAIL', `Invalid JSON in kaggle.json: ${error}`, 'critical');
    log('❌ Invalid JSON format', '❌');
  }
}

function checkDataDirectory(): void {
  log('Checking data directory...', '🔍');

  const dataDir = path.join(process.env.HOME || '/home/dxm', 'Documents/DXM_ASIN_Sourcing/data');

  if (!fs.existsSync(dataDir)) {
    addCheck('Data Directory', 'WARN', `Directory doesn't exist: ${dataDir}`, 'warning');
    log(`⚠️ Data directory not found: ${dataDir}`, '⚠️');
    log(`💡 Create it with: mkdir -p "${dataDir}"`, '💡');
    return;
  }

  addCheck('Data Directory', 'PASS', `Directory exists: ${dataDir}`, 'info');
  log(`✓ Data directory exists`, '✓');

  // Check for datasets
  const files = fs.readdirSync(dataDir);
  const hasKaggle10k = files.some(f => f.includes('electronics') && f.endsWith('.csv'));
  const hasKaggle14m = files.some(f => f.includes('amazon_products') && f.endsWith('.csv'));
  const hasGitHub = fs.existsSync(path.join(dataDir, 'github-electronics'));

  if (hasKaggle10k) {
    addCheck('Kaggle 10K Dataset', 'PASS', 'Found electronics_data.csv', 'info');
    log(`✓ Kaggle 10K dataset found`, '✓');
  } else {
    addCheck('Kaggle 10K Dataset', 'WARN', 'electronics_data.csv not found', 'warning');
    log(`⚠️ Missing Kaggle 10K dataset`, '⚠️');
  }

  if (hasKaggle14m) {
    addCheck('Kaggle 1.4M Dataset', 'PASS', 'Found amazon_products_2023.csv', 'info');
    log(`✓ Kaggle 1.4M dataset found`, '✓');
  } else {
    addCheck('Kaggle 1.4M Dataset', 'WARN', 'amazon_products_2023.csv not found', 'warning');
    log(`⚠️ Missing Kaggle 1.4M dataset`, '⚠️');
  }

  if (hasGitHub) {
    addCheck('GitHub Datasets', 'PASS', 'Found github-electronics directory', 'info');
    log(`✓ GitHub datasets directory found`, '✓');
  } else {
    addCheck('GitHub Datasets', 'WARN', 'github-electronics directory not found', 'warning');
    log(`⚠️ Missing GitHub datasets`, '⚠️');
  }
}

function checkEnvironment(): void {
  log('Checking environment variables...', '🔍');

  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret) {
    addCheck('ADMIN_SECRET', 'PASS', 'Set to: ' + adminSecret.substring(0, 3) + '***', 'info');
    log(`✓ ADMIN_SECRET configured`, '✓');
  } else {
    addCheck('ADMIN_SECRET', 'WARN', 'Not set (will default to ak3693)', 'warning');
    log(`⚠️ ADMIN_SECRET not set`, '⚠️');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    addCheck('NEXT_PUBLIC_SITE_URL', 'PASS', `Set to: ${siteUrl}`, 'info');
    log(`✓ NEXT_PUBLIC_SITE_URL: ${siteUrl}`, '✓');
  } else {
    addCheck('NEXT_PUBLIC_SITE_URL', 'WARN', 'Not set (using localhost:3002)', 'warning');
    log(`⚠️ NEXT_PUBLIC_SITE_URL not set`, '⚠️');
  }
}

function checkDevServer(): void {
  log('Checking dev server availability...', '🔍');

  const healthCheck = childProcess.spawnSync('curl', [
    '-s', '-o', '/dev/null', '-w', '%{http_code}',
    'http://localhost:3002/api/health'
  ], { encoding: 'utf-8' });

  const statusCode = healthCheck.stdout.trim();

  if (statusCode === '200') {
    addCheck('Dev Server', 'PASS', 'Running on http://localhost:3002', 'info');
    log(`✓ Dev server responding (HTTP ${statusCode})`, '✓');
  } else if (statusCode === '' || statusCode === '000') {
    addCheck('Dev Server', 'WARN', 'Not responding on localhost:3002', 'warning');
    log(`⚠️ Dev server not responding`, '⚠️');
    log(`💡 Start it with: npm run dev`, '💡');
  } else {
    addCheck('Dev Server', 'WARN', `Unexpected status: ${statusCode}`, 'warning');
    log(`⚠️ Dev server status: ${statusCode}`, '⚠️');
  }
}

function checkOutputDirectory(): void {
  log('Checking output directory...', '🔍');

  const outputDir = '/tmp/dxm-asin-engine';

  if (!fs.existsSync(outputDir)) {
    try {
      fs.mkdirSync(outputDir, { recursive: true });
      addCheck('Output Directory', 'PASS', `Created: ${outputDir}`, 'info');
      log(`✓ Output directory created`, '✓');
    } catch (error) {
      addCheck('Output Directory', 'FAIL', `Cannot create: ${error}`, 'critical');
      log(`❌ Cannot create output directory`, '❌');
    }
  } else {
    addCheck('Output Directory', 'PASS', `Exists: ${outputDir}`, 'info');
    log(`✓ Output directory exists`, '✓');
  }
}

// ===== MAIN =====

async function main() {
  console.log('\n🚀 DXM ASIN SOURCING ENGINE - PREREQUISITES CHECKER\n');

  checkKaggleConfig();
  checkDataDirectory();
  checkEnvironment();
  checkDevServer();
  checkOutputDirectory();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = checks.filter(c => c.status === 'PASS').length;
  const warnings = checks.filter(c => c.status === 'WARN').length;
  const failed = checks.filter(c => c.status === 'FAIL').length;

  for (const check of checks) {
    const icon = check.status === 'PASS' ? '✓' : check.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name.padEnd(25)} [${check.status}] ${check.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`PASSED: ${passed} | WARNINGS: ${warnings} | FAILED: ${failed}`);
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    console.log('❌ CRITICAL ISSUES FOUND - Cannot proceed\n');
    process.exit(1);
  }

  if (warnings > 0) {
    console.log('⚠️ WARNINGS - Some data sources may be missing\n');
    console.log('To download datasets, run:');
    console.log('  kaggle datasets download -d akeshkumarhp/electronics-products-amazon-10k-items');
    console.log('  kaggle datasets download -d asaniczka/amazon-products-dataset-2023-1-4m-products\n');
  } else {
    console.log('✅ ALL CHECKS PASSED - Ready to run sourcing engine\n');
    console.log('Execute with:');
    console.log('  ADMIN_SECRET="ak3693" npx ts-node scripts/dxm-asin-sourcing-engine.ts\n');
  }
}

main().catch(error => {
  console.error('Check failed:', error);
  process.exit(1);
});
