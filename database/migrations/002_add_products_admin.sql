-- Migration: Add product management tables for admin panel
-- Created: 2025-12-07
-- Purpose: Enable database-driven product management with visibility control

-- Products table - simplified for admin management
CREATE TABLE IF NOT EXISTS marketplace_products (
  id SERIAL PRIMARY KEY,
  asin TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,  -- gpu, cpu, laptop, monitor, psu, ssd, motherboard, ram
  title TEXT NOT NULL,
  image_url TEXT,
  price NUMERIC(10, 2),
  rating NUMERIC(3, 2),
  review_count INTEGER DEFAULT 0,
  last_synced TIMESTAMPTZ,
  visible BOOLEAN DEFAULT true,
  data_raw JSONB,  -- Store full Amazon API response
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync logs table - track import/refresh operations
CREATE TABLE IF NOT EXISTS marketplace_sync_logs (
  id SERIAL PRIMARY KEY,
  asin TEXT,
  operation TEXT NOT NULL,  -- 'add', 'refresh', 'delete', 'import'
  status TEXT NOT NULL,     -- 'pending', 'success', 'error'
  message TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_products_asin ON marketplace_products(asin);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_visible ON marketplace_products(visible);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_last_synced ON marketplace_products(last_synced DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_sync_logs_asin ON marketplace_sync_logs(asin);
CREATE INDEX IF NOT EXISTS idx_marketplace_sync_logs_synced_at ON marketplace_sync_logs(synced_at DESC);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketplace_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF NOT EXISTS marketplace_products_updated_at ON marketplace_products;
CREATE TRIGGER marketplace_products_updated_at
BEFORE UPDATE ON marketplace_products
FOR EACH ROW
EXECUTE FUNCTION update_marketplace_products_timestamp();
