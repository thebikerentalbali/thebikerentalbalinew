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

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Vendor ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (forceRefresh) {
      serverCache.delete(`vendor:${id}`);
    }

    const data = await serverCache.fetchWithCache(
      `vendor:${id}`,
      async () => {
        const supabase = getSupabaseClient();

        // 1 parallel batch for vendor, scooters, reviews, and settings
        const [
          { data: vendor, error: vErr },
          { data: scooters, error: sErr },
          { data: reviews, error: rErr },
          { data: settingsData }
        ] = await Promise.all([
          supabase
            .from('vendors')
            .select('*')
            .eq('id', id)
            .eq('status', 'approved')
            .single(),
          supabase
            .from('scooters')
            .select('*')
            .eq('vendor_id', id)
            .order('name', { ascending: true }),
          supabase
            .from('reviews')
            .select('*')
            .eq('vendor_id', id)
            .order('created_at', { ascending: false }),
          supabase
            .from('platform_settings')
            .select('*')
            .limit(1)
            .maybeSingle(),
        ]);

        if (vErr || !vendor) {
          return null;
        }

        const settings: PlatformSettings = settingsData ? {
          markup_daily: Number(settingsData.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily,
          markup_weekly_per_day: Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day,
          markup_monthly_per_day: Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day,
          markup_weekly: (Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day) * 7,
          markup_monthly: (Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day) * 30,
        } : DEFAULT_PLATFORM_SETTINGS;

        const formattedScooters = (scooters || []).map((s: any) => {
          const prices = getCustomerPrice(s.price_daily || 0, s.price_weekly, s.price_monthly, settings);
          return {
            ...s,
            price_daily: prices.daily,
            price_weekly: prices.weekly,
            price_monthly: prices.monthly,
            img: s.image_url || '/images/scooter.png',
          };
        });

        return {
          vendor,
          scooters: formattedScooters,
          reviews: reviews || [],
          settings,
        };
      },
      60_000
    );

    if (!data) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    console.error('[Vendor Detail API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
