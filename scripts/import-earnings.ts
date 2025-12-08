// scripts/import-earnings.ts
// Amazon Associates Earnings CSV Importer
// Imports earnings CSV reports into PostgreSQL affiliate_earnings table

import { readFileSync, statSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface EarningsRow {
  'Report Date': string;
  'Marketplace': string;
  'Tracking ID': string;
  'Clicks': string;
  'Ordered Items': string;
  'Shipped Items': string;
  'Returned Items': string;
  'Commission': string;
  'Bounties': string;
  'Ad Fees': string;
  'Currency': string;
  [key: string]: string;
}

/**
 * Parse a numeric value from CSV (handles commas, currency symbols)
 */
function parseNumeric(value: string | undefined): number | null {
  if (!value) return null;
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse an integer value from CSV
 */
function parseInt(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[,\s]/g, '').trim();
  const parsed = Number.parseInt(cleaned, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): string {
  // Try to parse common date formats
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  // Return in YYYY-MM-DD format
  return date.toISOString().split('T')[0];
}

async function importEarnings(csvPath: string) {
  console.log(`[DXM369 Earnings Import] Starting import from: ${csvPath}`);

  // Check if file exists
  try {
    const stats = statSync(csvPath);
    console.log(`[DXM369 Earnings Import] File size: ${stats.size} bytes`);
  } catch (error) {
    console.error(`[DXM369 Earnings Import] File not found: ${csvPath}`);
    process.exit(1);
  }

  // Read CSV file
  const fileContent = readFileSync(csvPath, 'utf-8');

  // Parse CSV
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as EarningsRow[];

  console.log(`[DXM369 Earnings Import] Parsed ${records.length} rows`);

  // Connect to database
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[DXM369 Earnings Import] DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : undefined,
  });

  try {
    // Begin transaction
    await pool.query('BEGIN');

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of records) {
      try {
        const reportDate = parseDate(row['Report Date'] || row['report_date'] || row['Date']);
        const marketplace = row['Marketplace'] || row['marketplace'] || 'US';
        const trackingId = row['Tracking ID'] || row['tracking_id'] || row['Tracking ID'] || '';
        const clicks = parseInt(row['Clicks'] || row['clicks']);
        const orderedItems = parseInt(row['Ordered Items'] || row['ordered_items'] || row['Ordered Items']);
        const shippedItems = parseInt(row['Shipped Items'] || row['shipped_items'] || row['Shipped Items']);
        const returnedItems = parseInt(row['Returned Items'] || row['returned_items'] || row['Returned Items']);
        const commission = parseNumeric(row['Commission'] || row['commission']);
        const bounties = parseNumeric(row['Bounties'] || row['bounties']);
        const adFees = parseNumeric(row['Ad Fees'] || row['ad_fees'] || row['Ad Fees']);
        const currency = row['Currency'] || row['currency'] || 'USD';

        // Skip rows with missing required fields
        if (!reportDate || !marketplace || !trackingId) {
          console.warn(`[DXM369 Earnings Import] Skipping row: missing required fields`, row);
          skipped++;
          continue;
        }

        // Insert into database
        await pool.query(
          `INSERT INTO affiliate_earnings (
            report_date, marketplace, tracking_id, clicks, ordered_items,
            shipped_items, returned_items, commission, bounties, ad_fees,
            currency, raw_row, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
          ON CONFLICT DO NOTHING`,
          [
            reportDate,
            marketplace,
            trackingId,
            clicks,
            orderedItems,
            shippedItems,
            returnedItems,
            commission,
            bounties,
            adFees,
            currency,
            JSON.stringify(row),
          ]
        );

        inserted++;
      } catch (error) {
        console.error(`[DXM369 Earnings Import] Error processing row:`, error);
        console.error(`[DXM369 Earnings Import] Row data:`, row);
        errors++;
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    console.log(`[DXM369 Earnings Import] Import complete!`);
    console.log(`  ✅ Inserted: ${inserted}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('[DXM369 Earnings Import] Transaction failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Main execution
const csvPath = process.argv[2];

if (!csvPath) {
  console.error('Usage: ts-node scripts/import-earnings.ts <path-to-csv>');
  console.error('Example: ts-node scripts/import-earnings.ts ./reports/earnings.csv');
  process.exit(1);
}

importEarnings(csvPath)
  .then(() => {
    console.log('[DXM369 Earnings Import] Success!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[DXM369 Earnings Import] Failed:', error);
    process.exit(1);
  });

