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
      return NextResponse.json({ success: false, error: 'Scooter ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (forceRefresh) {
      serverCache.delete(`scooter:${id}`);
    }

    const data = await serverCache.fetchWithCache(
      `scooter:${id}`,
      async () => {
        const supabase = getSupabaseClient();

        // Fetch scooter with joined vendor data and settings in 1 parallel round-trip
        const [
          { data: scooterData, error: sErr },
          { data: settingsData }
        ] = await Promise.all([
          supabase
            .from('scooters')
            .select('*, vendors(*)')
            .eq('id', id)
            .single(),
          supabase
            .from('platform_settings')
            .select('*')
            .limit(1)
            .maybeSingle(),
        ]);

        if (sErr || !scooterData) {
          return null;
        }

        const settings: PlatformSettings = settingsData ? {
          markup_daily: Number(settingsData.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily,
          markup_weekly_per_day: Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day,
          markup_monthly_per_day: Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day,
          markup_weekly: (Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day) * 7,
          markup_monthly: (Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day) * 30,
        } : DEFAULT_PLATFORM_SETTINGS;

        const prices = getCustomerPrice(
          scooterData.price_daily || 0,
          scooterData.price_weekly,
          scooterData.price_monthly,
          settings
        );

        const vendor = scooterData.vendors || null;

        return {
          scooter: {
            ...scooterData,
            price_daily: prices.daily,
            price_weekly: prices.weekly,
            price_monthly: prices.monthly,
            img: scooterData.image_url || '/images/scooter.png',
          },
          vendor,
          settings,
        };
      },
      60_000
    );

    if (!data) {
      return NextResponse.json({ success: false, error: 'Scooter not found' }, { status: 404 });
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
    console.error('[Scooter Detail API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
