-- DXM369 Marketplace Database Schema
CREATE TABLE IF NOT EXISTS marketplace_products (
  id SERIAL PRIMARY KEY,
  asin VARCHAR(10) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2),
  brand VARCHAR(255),
  image_url TEXT,
  affiliate_url TEXT NOT NULL,
  description TEXT,
  rating DECIMAL(3,2),
  review_count INTEGER,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_visible ON marketplace_products(visible);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_price ON marketplace_products(price);
