import { NextRequest, NextResponse } from 'next/server';
import { validateProductLinks } from '@/lib/linkChecker';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    
    if (!Array.isArray(urls)) {
      return NextResponse.json({ error: 'URLs must be an array' }, { status: 400 });
    }

    const results = await validateProductLinks(urls);
    
    return NextResponse.json({ 
      ok: true, 
      data: results 
    });
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to validate links' 
    }, { status: 500 });
  }
}
