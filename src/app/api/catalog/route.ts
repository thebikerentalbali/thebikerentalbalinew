import { NextResponse } from 'next/server';
import { getCatalogServerData, invalidateAllCatalogCaches } from '@/lib/api/catalogService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const catalogData = await getCatalogServerData({ forceRefresh });

    return NextResponse.json(
      { success: true, data: catalogData },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'X-Cache-Status': 'LIVE',
        },
      }
    );
  } catch (error: any) {
    console.error('[Catalog API] Fatal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  invalidateAllCatalogCaches();
  return NextResponse.json({ success: true, message: 'Catalog cache invalidated' });
}

