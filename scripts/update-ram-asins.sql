-- Update RAM products with working ASINs from extraction
-- Replace dead links with verified working ones

-- Delete old dead RAM entries
DELETE FROM product_catalog WHERE category = 'RAM' AND asin IN ('B09R97JSZX', 'B09PRCP2DY');

-- Insert working RAM products
INSERT INTO product_catalog (asin, title, brand, category, current_price, list_price, image_url, prime_eligible, dxm_value_score) VALUES
('B0BZHTVHN5', 'CORSAIR VENGEANCE RGB DDR5 RAM 32GB (2x16GB) 6000MHz', 'Corsair', 'RAM', 131, 149, 'https://m.media-amazon.com/images/I/81agXcNA6zL._AC_SL1500_.jpg', true, 94),
('B0CTHXMYL8', 'Crucial Pro 32GB DDR5 RAM Kit (2x16GB) 6000MHz', 'Crucial', 'RAM', 131, 139, 'https://m.media-amazon.com/images/I/71QsF8ezSBL._AC_SL1500_.jpg', true, 93),
('B09R7S7PXC', 'CORSAIR VENGEANCE DDR5 RAM 64GB (2x32GB) 5200MHz', 'Corsair', 'RAM', 839, 999, 'https://m.media-amazon.com/images/I/81Rw6Pffb0L._AC_SL1500_.jpg', true, 89),
('B0F7RY9V4N', 'CORSAIR Vengeance DDR5 RAM 96GB (2x48GB) 6000MHz', 'Corsair', 'RAM', 3715, 4199, 'https://m.media-amazon.com/images/I/81mwcITtHBL._AC_SL1500_.jpg', true, 85)
ON CONFLICT (asin) DO UPDATE SET
  title = EXCLUDED.title,
  current_price = EXCLUDED.current_price,
  list_price = EXCLUDED.list_price,
  image_url = EXCLUDED.image_url,
  dxm_value_score = EXCLUDED.dxm_value_score;
