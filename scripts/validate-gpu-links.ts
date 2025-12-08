#!/usr/bin/env ts-node
// scripts/validate-gpu-links.ts
// Validates all GPU ASIN affiliate links for DXM369 Marketplace

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

interface ValidationResult {
  asin: string;
  statusCode: number;
  productTitle: string;
  matchesGpuModel: 'Y' | 'N';
  affiliateTagOk: 'Y' | 'N';
  notes: string;
}

async function validateAsin(asin: string): Promise<ValidationResult> {
  const url = `https://www.amazon.com/dp/${asin}?tag=dxm369-20`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow'
    });

    const html = await response.text();
    let productTitle = 'N/A';
    let matchesGpuModel: 'Y' | 'N' = 'N';
    let affiliateTagOk: 'Y' | 'N' = 'Y'; // Tag is always in our request URL
    let notes = '';

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      productTitle = titleMatch[1].trim();
    }

    // Check if it's a GPU (basic check)
    const gpuKeywords = ['GPU', 'Graphics Card', 'NVIDIA', 'AMD', 'GeForce', 'Radeon'];
    const isGpu = gpuKeywords.some(keyword => productTitle.toUpperCase().includes(keyword.toUpperCase()));
    matchesGpuModel = isGpu ? 'Y' : 'N';

    // Check for bot protection, errors, or not found pages
    if (html.includes('captcha') || html.includes("Sorry, we just need to make sure you're not a robot")) {
      notes = 'Bot protection';
    } else if (response.status !== 200) {
      notes = `HTTP ${response.status}`;
    } else if (html.includes('Page Not Found') || html.includes('404 Not Found') || productTitle.includes('404 Not Found')) {
      notes = 'Page Not Found (404)';
    } else if (productTitle.includes('Amazon.com')) { // Generic Amazon pages
        notes = 'Possible placeholder or broken page';
    }

    if (html.includes('currently unavailable')) {
        notes += (notes ? '; ' : '') + 'Unavailable';
    }
    
    return {
      asin,
      statusCode: response.status,
      productTitle,
      matchesGpuModel,
      affiliateTagOk,
      notes
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      asin,
      statusCode: 0,
      productTitle: 'Error',
      matchesGpuModel: 'N',
      affiliateTagOk: 'N',
      notes: `Request failed: ${message}`
    };
  }
}

async function getGpuAsinsFromDb(pool: Pool): Promise<string[]> {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT asin FROM products WHERE category = 'gpu'");
        return res.rows.map(row => row.asin);
    } finally {
        client.release();
    }
}

async function getGpuAsinsFromSeed(): Promise<string[]> {
    console.warn('⚠️ Could not connect to DB, falling back to seed file.');
    const seedPath = path.join(process.cwd(), 'data', 'asin-seed.json');
    const fileContent = await fs.readFile(seedPath, 'utf-8');
    const seedData = JSON.parse(fileContent);
    return seedData.products.gpu.map((p: { asin: string }) => p.asin);
}

async function main() {
  console.log('🛰️ DXM369 GPU Link Validation Sweep');
  console.log('=====================================\n');

  let asins: string[] = [];
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 3000, // Short timeout
  });

  try {
    asins = await getGpuAsinsFromDb(pool);
    console.log(`Found ${asins.length} GPU ASINs in the database.`);
  } catch (dbError) {
    try {
        asins = await getGpuAsinsFromSeed();
        console.log(`Found ${asins.length} GPU ASINs in the seed file.`);
    } catch (seedError) {
        console.error('❌ Failed to fetch ASINs from both database and seed file.');
        console.error('DB Error:', dbError);
        console.error('Seed Error:', seedError);
        await pool.end();
        return;
    }
  }
  
  const results: ValidationResult[] = [];

  for (const asin of asins) {
    console.log(`Validating ${asin}...`);
    const result = await validateAsin(asin);
    results.push(result);

    // Delay to avoid throttling
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n📊 Validation Results:');
  console.log('======================\n');

  console.log('| ASIN        | Status | Title                                | GPU? | Tag OK? | Notes                      |');
  console.log('|-------------|--------|--------------------------------------|------|---------|----------------------------|');

  for (const result of results) {
    const titleShort = result.productTitle.substring(0, 35).padEnd(35);
    const notesShort = result.notes.substring(0, 25).padEnd(25);
    console.log(`| ${result.asin.padEnd(12)} | ${String(result.statusCode).padEnd(6)} | ${titleShort} | ${result.matchesGpuModel.padEnd(4)} | ${result.affiliateTagOk.padEnd(7)} | ${notesShort} |`);
  }

  // Summary
  const valid = results.filter(r => r.statusCode === 200 && r.matchesGpuModel === 'Y');
  const issues = results.filter(r => r.statusCode !== 200 || r.matchesGpuModel !== 'Y');

  console.log(`\n\n✅ Valid links: ${valid.length}`);
  console.log(`❌ Issues found: ${issues.length}`);

  if (issues.length > 0) {
    console.log('\n--- Issues Detail ---');
    issues.forEach(issue => console.log(`- ASIN: ${issue.asin}, Status: ${issue.statusCode}, Notes: ${issue.notes}, Title: "${issue.productTitle}"`));
  }

  await pool.end();
}

main().catch(console.error);