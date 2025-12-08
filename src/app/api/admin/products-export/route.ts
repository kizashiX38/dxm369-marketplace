// src/app/api/admin/products-export/route.ts
// Export products to JSON/CSV

import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json'; // json or csv
    const category = searchParams.get('category');

    // Mock data - replace with real DB query
    const mockProducts = [
      {
        asin: 'B08WPRMVWB',
        title: 'Example GPU',
        brand: 'NVIDIA',
        category: 'gpu',
        price: 299.99,
        dxmScore: 7.8,
      },
    ];

    if (format === 'csv') {
      // Convert to CSV
      const headers = [
        'ASIN',
        'Title',
        'Brand',
        'Category',
        'Price',
        'DXM Score',
      ];
      const rows = mockProducts.map((p) => [
        p.asin,
        p.title,
        p.brand,
        p.category,
        p.price,
        p.dxmScore,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((cell) =>
              typeof cell === 'string' && cell.includes(',')
                ? `"${cell}"`
                : cell
            )
            .join(',')
        ),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="products.csv"',
        },
      });
    }

    // JSON format
    const json = JSON.stringify(mockProducts, null, 2);
    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="products.json"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Export failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
