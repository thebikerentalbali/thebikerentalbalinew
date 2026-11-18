import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serverCache } from '@/lib/cache/serverCache';
import { DEFAULT_PLATFORM_SETTINGS, getCustomerPrice, PlatformSettings } from '@/utils/pricing';
import { isBookingFinished, reconcileExpiredBookings } from '@/utils/rentalTime';

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

        // Fetch scooter, settings, and active confirmed bookings in 1 parallel round-trip
        const [
          { data: scooterData, error: sErr },
          { data: settingsData },
          { data: activeBookings }
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
          supabase
            .from('bookings')
            .select('id, quantity, end_date')
            .eq('scooter_id', id)
            .eq('status', 'confirmed'),
        ]);

        if (sErr || !scooterData) {
          return null;
        }

        const nowMs = Date.now();
        let restoredUnits = 0;
        if (activeBookings && activeBookings.length > 0) {
          for (const b of activeBookings) {
            if (isBookingFinished(b.end_date, nowMs)) {
              restoredUnits += Math.max(1, Number(b.quantity) || 1);
            }
          }
          if (restoredUnits > 0) {
            void reconcileExpiredBookings(supabase).catch(() => {});
          }
        }

        const totalUnits = Number(scooterData.total_units ?? 1);
        const liveAvailable = restoredUnits > 0
          ? Math.min(totalUnits, Number(scooterData.available_units ?? 0) + restoredUnits)
          : scooterData.available_units;

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
            available_units: liveAvailable,
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
