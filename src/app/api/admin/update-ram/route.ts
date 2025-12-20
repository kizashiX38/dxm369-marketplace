import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Delete dead RAM ASINs
    await queryOne(`DELETE FROM product_catalog WHERE category = 'RAM' AND asin IN ($1, $2)`, 
      ['B09R97JSZX', 'B09PRCP2DY']);

    // Insert working RAM products
    const ramProducts = [
      {
        asin: 'B0BZHTVHN5',
        title: 'CORSAIR VENGEANCE RGB DDR5 RAM 32GB (2x16GB) 6000MHz',
        brand: 'Corsair',
        price: 131,
        listPrice: 149,
        imageUrl: 'https://m.media-amazon.com/images/I/81agXcNA6zL._AC_SL1500_.jpg',
        dxmScore: 94
      },
      {
        asin: 'B0CTHXMYL8',
        title: 'Crucial Pro 32GB DDR5 RAM Kit (2x16GB) 6000MHz',
        brand: 'Crucial',
        price: 131,
        listPrice: 139,
        imageUrl: 'https://m.media-amazon.com/images/I/71QsF8ezSBL._AC_SL1500_.jpg',
        dxmScore: 93
      },
      {
        asin: 'B09R7S7PXC',
        title: 'CORSAIR VENGEANCE DDR5 RAM 64GB (2x32GB) 5200MHz',
        brand: 'Corsair',
        price: 839,
        listPrice: 999,
        imageUrl: 'https://m.media-amazon.com/images/I/81Rw6Pffb0L._AC_SL1500_.jpg',
        dxmScore: 89
      },
      {
        asin: 'B0F7RY9V4N',
        title: 'CORSAIR Vengeance DDR5 RAM 96GB (2x48GB) 6000MHz',
        brand: 'Corsair',
        price: 3715,
        listPrice: 4199,
        imageUrl: 'https://m.media-amazon.com/images/I/81mwcITtHBL._AC_SL1500_.jpg',
        dxmScore: 85
      }
    ];

    for (const product of ramProducts) {
      await queryOne(`
        INSERT INTO product_catalog (asin, title, brand, category, current_price, list_price, image_url, prime_eligible, dxm_value_score) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (asin) DO UPDATE SET
          title = EXCLUDED.title,
          current_price = EXCLUDED.current_price,
          list_price = EXCLUDED.list_price,
          image_url = EXCLUDED.image_url,
          dxm_value_score = EXCLUDED.dxm_value_score
      `, [
        product.asin,
        product.title,
        product.brand,
        'RAM',
        product.price,
        product.listPrice,
        product.imageUrl,
        true,
        product.dxmScore
      ]);
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'RAM database updated successfully',
      updated: ramProducts.length
    });
  } catch (error) {
    console.error('Database update error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to update database' 
    }, { status: 500 });
  }
}
