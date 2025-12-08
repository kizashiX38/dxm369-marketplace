// src/app/api/admin/earnings/upload/route.ts
// Admin Earnings CSV Upload API
// Handles CSV file uploads and imports them into the database

import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { db } from "@/lib/db";
import { apiSafe } from "@/lib/apiSafe";
import { securityConfig } from "@/lib/env";

/**
 * Parse a numeric value from CSV (handles commas, currency symbols)
 */
function parseNumeric(value: string | undefined): number | null {
  if (!value) return null;
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
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return date.toISOString().split('T')[0];
}

export const POST = apiSafe(async (request: NextRequest) => {
  // Verify admin access
  const adminKey = request.headers.get("x-admin-key");
  const secret = securityConfig.adminSecret;

  if (!secret || adminKey !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { ok: false, error: "File must be a CSV" },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    if (records.length === 0) {
      return NextResponse.json(
        { ok: false, error: "CSV file is empty" },
        { status: 400 }
      );
    }

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    // Process each row
    for (const row of records) {
      try {
        const reportDate = parseDate(
          row['Report Date'] || row['report_date'] || row['Date'] || ''
        );
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
          skipped++;
          continue;
        }

        // Insert into database (ON CONFLICT DO NOTHING to avoid duplicates)
        await db.query(
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
        // Log row-level errors but continue processing
        errors++;
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        message: "Earnings data imported successfully",
        stats: {
          inserted,
          skipped,
          errors,
          total: records.length,
        },
      }
    });
});

