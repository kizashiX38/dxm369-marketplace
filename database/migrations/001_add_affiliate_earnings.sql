-- Migration: Add affiliate_earnings table
-- Date: 2025-12-06
-- Description: Adds table for Amazon Associates earnings CSV imports

CREATE TABLE IF NOT EXISTS affiliate_earnings (
  id SERIAL PRIMARY KEY,
  report_date DATE NOT NULL,
  marketplace TEXT NOT NULL,
  tracking_id TEXT NOT NULL,
  clicks INT,
  ordered_items INT,
  shipped_items INT,
  returned_items INT,
  commission NUMERIC(12, 2),
  bounties NUMERIC(12, 2),
  ad_fees NUMERIC(12, 2),
  currency TEXT DEFAULT 'USD',
  raw_row JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for affiliate_earnings
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_report_date ON affiliate_earnings(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_tracking_id ON affiliate_earnings(tracking_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_marketplace ON affiliate_earnings(marketplace);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_created_at ON affiliate_earnings(created_at DESC);

COMMENT ON TABLE affiliate_earnings IS 'Amazon Associates earnings imported from CSV reports';

