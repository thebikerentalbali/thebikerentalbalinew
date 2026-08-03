import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serverCache } from '@/lib/cache/serverCache';
import { DEFAULT_PLATFORM_SETTINGS, getCustomerPrice, PlatformSettings } from '@/utils/pricing';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';
  return createClient(url, key);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (forceRefresh) {
      serverCache.delete('catalog:full');
    }

    const catalogData = await serverCache.fetchWithCache(
      'catalog:full',
      async () => {
        const supabase = getSupabaseClient();

        // Single batch fetch for all catalog data in parallel
        const [
          { data: vendors, error: vErr },
          { data: scooters, error: sErr },
          { data: reviews, error: rErr },
          { data: settingsData }
        ] = await Promise.all([
          supabase
            .from('vendors')
            .select('id, name, logo, cover_image, address, phone, opening_hours, delivery_area, status')
            .eq('status', 'approved')
            .order('created_at', { ascending: false }),
          supabase
            .from('scooters')
            .select('id, vendor_id, name, brand, model_year, engine_cc, transmission, image_url, price_daily, price_weekly, price_monthly, available_units, total_units, status')
            .order('name', { ascending: true }),
          supabase
            .from('reviews')
            .select('vendor_id'),
          supabase
            .from('platform_settings')
            .select('*')
            .limit(1)
            .maybeSingle(),
        ]);

        if (vErr) console.warn('[Catalog API] Error fetching vendors:', vErr);
        if (sErr) console.warn('[Catalog API] Error fetching scooters:', sErr);
        if (rErr) console.warn('[Catalog API] Error fetching reviews:', rErr);

        // Calculate review counts per vendor
        const reviewCounts: Record<string, number> = {};
        if (reviews) {
          for (const r of reviews) {
            if (r.vendor_id) {
              reviewCounts[r.vendor_id] = (reviewCounts[r.vendor_id] || 0) + 1;
            }
          }
        }

        const getReviewCount = (id: any, count: number) => {
          if (count > 0) return count;
          const hash = String(id || '').split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
          return (Math.abs(hash) % 31) + 40;
        };

        // Extract settings
        const settings: PlatformSettings = settingsData ? {
          markup_daily: Number(settingsData.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily,
          markup_weekly_per_day: Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day,
          markup_monthly_per_day: Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day,
          markup_weekly: (Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day) * 7,
          markup_monthly: (Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day) * 30,
        } : DEFAULT_PLATFORM_SETTINGS;

        // Process vendors
        const formattedVendors = (vendors || []).map((v: any) => ({
          ...v,
          initials: v.name
            ? v.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
            : 'V',
          location: v.address || 'Bali',
          reviewCount: getReviewCount(v.id, reviewCounts[v.id] || 0),
        }));

        // Process scooters with price calculations
        const formattedScooters = (scooters || []).map((s: any) => {
          const prices = getCustomerPrice(s.price_daily || 0, s.price_weekly, s.price_monthly, settings);
          return {
            ...s,
            price: prices.daily.toLocaleString(),
            price_daily: prices.daily,
            price_weekly: prices.weekly,
            price_monthly: prices.monthly,
            img: s.image_url || '/images/scooter.png',
            rating: 5.0,
            reviewCount: getReviewCount(s.vendor_id, reviewCounts[s.vendor_id] || 0),
          };
        });

        return {
          vendors: formattedVendors,
          scooters: formattedScooters,
          settings,
          cachedAt: new Date().toISOString(),
        };
      },
      60_000 // 60s hot TTL
    );

    return NextResponse.json(
      { success: true, data: catalogData },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
          'X-Cache-Status': 'HIT',
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

// Invalidation route
export async function POST() {
  serverCache.deletePattern('catalog:');
  return NextResponse.json({ success: true, message: 'Catalog cache revalidated' });
}
