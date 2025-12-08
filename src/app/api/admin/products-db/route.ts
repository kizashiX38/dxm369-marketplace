// src/app/api/admin/products-db/route.ts
// CRUD operations for products in database

import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from '@/lib/apiSafe';

interface Product {
  id?: string;
  asin: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  dxmScore: number;
  imageUrl?: string;
  availability?: string;
  vendor?: string;
}

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'list';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    if (action === 'list') {
      // Mock: return empty list (replace with DB query)
      const products: Product[] = [];
      return NextResponse.json({
        ok: true,
        data: {
          products,
          count: products.length,
          total: 0,
        },
      });
    }

    if (action === 'stats') {
      return NextResponse.json({
        ok: true,
        data: {
          totalProducts: 0,
          byCategory: {},
          lastSync: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { ok: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Database operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await safeJsonParse<{
      action: 'add' | 'update' | 'delete' | 'bulkImport';
      products?: Product[];
      product?: Product;
      asin?: string;
    }>(request);

    if (!body || !body.action) {
      return NextResponse.json(
        { ok: false, error: 'Missing action' },
        { status: 400 }
      );
    }

    const { action, products, product, asin } = body;

    if (action === 'add' && product) {
      // Validate ASIN
      if (!product.asin || !/^B[0-9A-Z]{9}$/.test(product.asin)) {
        return NextResponse.json(
          { ok: false, error: 'Invalid ASIN format' },
          { status: 400 }
        );
      }

      // Mock: add to DB
      return NextResponse.json({
        ok: true,
        message: 'Product added successfully',
        data: { asin: product.asin },
      });
    }

    if (action === 'update' && product) {
      return NextResponse.json({
        ok: true,
        message: 'Product updated successfully',
        data: { asin: product.asin },
      });
    }

    if (action === 'delete' && asin) {
      return NextResponse.json({
        ok: true,
        message: 'Product deleted successfully',
        data: { asin },
      });
    }

    if (action === 'bulkImport' && products && Array.isArray(products)) {
      const validProducts = products.filter(
        (p) => p.asin && /^B[0-9A-Z]{9}$/.test(p.asin)
      );
      const invalid = products.length - validProducts.length;

      return NextResponse.json({
        ok: true,
        message: `Imported ${validProducts.length} products${invalid > 0 ? `, ${invalid} invalid` : ''}`,
        data: {
          imported: validProducts.length,
          invalid,
          total: products.length,
        },
      });
    }

    return NextResponse.json(
      { ok: false, error: 'Invalid action or missing data' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
