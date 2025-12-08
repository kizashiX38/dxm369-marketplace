import { NextRequest, NextResponse } from 'next/server';

/**
 * GET/POST /api/admin/bridge?action=...
 * Proxy all bridge operations (cache stats, clear cache, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get('action');
    const bridgeUrl = process.env.BRIDGE_SERVER_URL || 'http://localhost:5000';

    let bridgePath = '';
    switch (action) {
      case 'cache-stats':
        bridgePath = '/api/cache/stats';
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    const response = await fetch(`${bridgeUrl}${bridgePath}`);

    if (!response.ok) {
      throw new Error(`Bridge returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Bridge request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get('action');
    const bridgeUrl = process.env.BRIDGE_SERVER_URL || 'http://localhost:5000';

    let bridgePath = '';
    switch (action) {
      case 'clear-cache':
        bridgePath = '/api/cache/clear';
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    const response = await fetch(`${bridgeUrl}${bridgePath}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Bridge returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Bridge request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
