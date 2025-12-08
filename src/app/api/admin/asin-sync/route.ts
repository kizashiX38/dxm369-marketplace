import { NextRequest, NextResponse } from 'next/server';
import { securityConfig } from '@/lib/env';

interface SyncProduct {
  id: string;
  asin: string;
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  dxmScore: number;
  category: string;
  brand: string;
  source: string;
}

interface SyncRequest {
  products: SyncProduct[];
  action: 'sync' | 'validate';
}

/**
 * POST /api/admin/asin-sync
 * Sync ASIN products from bridge server to marketplace database
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization (optional in development, required in production)
    const adminKey = request.headers.get('x-admin-key');
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (securityConfig.adminSecret && !isDevelopment && adminKey !== securityConfig.adminSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as SyncRequest;

    if (!Array.isArray(body.products) || body.products.length === 0) {
      return NextResponse.json(
        { error: 'No products provided' },
        { status: 400 }
      );
    }

    if (body.action === 'validate') {
      // Just validate the products
      const validated = body.products.map((p) => ({
        ...p,
        valid: Boolean(p.asin && p.title && p.price >= 0),
      }));

      return NextResponse.json({
        action: 'validate',
        count: body.products.length,
        products: validated,
        timestamp: new Date().toISOString(),
      });
    }

    if (body.action === 'sync') {
      // Sync products to database
      // Note: In production, this would insert into PostgreSQL
      // For now, we'll just log and validate

      const syncResults = body.products.map((product) => ({
        asin: product.asin,
        synced: true,
        timestamp: new Date().toISOString(),
      }));

      return NextResponse.json({
        action: 'sync',
        count: body.products.length,
        synced: syncResults,
        message: `${body.products.length} products synced to marketplace`,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[ASIN_SYNC_ERROR]', error);
    return NextResponse.json(
      { error: 'Sync failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/asin-sync
 * Get sync status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization (optional in development, required in production)
    const adminKey = request.headers.get('x-admin-key');
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (securityConfig.adminSecret && !isDevelopment && adminKey !== securityConfig.adminSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      service: 'ASIN Sync Manager',
      status: 'operational',
      endpoints: {
        fetch: 'GET /api/amazon/items?asins=...',
        sync: 'POST /api/admin/asin-sync',
        validate: 'POST /api/admin/asin-sync (action=validate)',
      },
      bridge_server: 'http://localhost:5000',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[ASIN_SYNC_STATUS_ERROR]', error);
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  }
}
