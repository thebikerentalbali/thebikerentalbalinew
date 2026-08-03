import { clientCache } from '@/lib/cache/clientCache';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { serverCache } from '@/lib/cache/serverCache';
import { DEFAULT_PLATFORM_SETTINGS, getCustomerPrice, PlatformSettings } from '@/utils/pricing';

export interface CatalogData {
  vendors: any[];
  scooters: any[];
  settings: PlatformSettings;
  cachedAt?: string;
}

export interface ScooterDetailData {
  scooter: any;
  vendor: any;
  settings: PlatformSettings;
}

export interface VendorDetailData {
  vendor: any;
  scooters: any[];
  reviews: any[];
  settings: PlatformSettings;
}

function getDirectSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';
  return createSupabaseClient(url, key);
}

/**
 * High-speed Server-side catalog loader with in-memory caching & single-flight stampede protection.
 * Used for instant Server-Side Pre-Rendering (0ms waterfall).
 */
export async function getCatalogServerData(options?: { forceRefresh?: boolean }): Promise<CatalogData> {
  const cacheKey = 'catalog:full';

  if (options?.forceRefresh) {
    serverCache.delete(cacheKey);
  }

  return serverCache.fetchWithCache(
    cacheKey,
    async () => {
      const supabase = getDirectSupabase();

      // Parallel batch query hitting PostgreSQL with composite indexes
      const [
        { data: vendors, error: vErr },
        { data: scooters, error: sErr },
        { data: reviews, error: rErr },
        { data: settingsData }
      ] = await Promise.all([
        supabase
          .from('vendors')
          .select('id, name, logo, image_url, address, lat, lng, phone, opening_hours, delivery_area, status, rating, review_count, created_at')
          .eq('status', 'approved')
          .order('created_at', { ascending: false }),
        supabase
          .from('scooters')
          .select('id, vendor_id, name, brand, engine, year, fuel_capacity, transmission, image_url, price_daily, price_weekly, price_monthly, total_units, available_units, created_at')
          .order('name', { ascending: true }),
        supabase
          .from('reviews')
          .select('vendor_id, rating'),
        supabase
          .from('platform_settings')
          .select('*')
          .limit(1)
          .maybeSingle(),
      ]);

      if (vErr) console.warn('[CatalogService] Vendors query error:', vErr);
      if (sErr) console.warn('[CatalogService] Scooters query error:', sErr);
      if (rErr) console.warn('[CatalogService] Reviews query error:', rErr);

      // Real review calculations from database
      const reviewStats: Record<string, { count: number; totalRating: number }> = {};
      if (reviews) {
        for (const r of reviews) {
          if (r.vendor_id) {
            if (!reviewStats[r.vendor_id]) {
              reviewStats[r.vendor_id] = { count: 0, totalRating: 0 };
            }
            reviewStats[r.vendor_id].count += 1;
            reviewStats[r.vendor_id].totalRating += Number(r.rating) || 5;
          }
        }
      }

      const settings: PlatformSettings = settingsData ? {
        markup_daily: Number(settingsData.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily,
        markup_weekly_per_day: Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day,
        markup_monthly_per_day: Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day,
        markup_weekly: (Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day) * 7,
        markup_monthly: (Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day) * 30,
      } : DEFAULT_PLATFORM_SETTINGS;

      const formattedVendors = (vendors || []).map((v: any) => {
        const stats = reviewStats[v.id];
        const count = stats?.count ?? v.review_count ?? 0;
        const avgRating = stats?.count && stats.count > 0 
          ? (stats.totalRating / stats.count).toFixed(1) 
          : (v.rating ? Number(v.rating).toFixed(1) : '5.0');

        return {
          ...v,
          initials: v.name
            ? v.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
            : 'V',
          location: v.address || 'Bali',
          rating: Number(avgRating),
          reviewCount: count,
        };
      });

      const formattedScooters = (scooters || []).map((s: any) => {
        const prices = getCustomerPrice(s.price_daily || 0, s.price_weekly, s.price_monthly, settings);
        const stats = reviewStats[s.vendor_id];
        const count = stats?.count || 0;
        const avgRating = count > 0 ? (stats.totalRating / count).toFixed(1) : '5.0';

        return {
          ...s,
          price: prices.daily.toLocaleString(),
          price_daily: prices.daily,
          price_weekly: prices.weekly,
          price_monthly: prices.monthly,
          img: s.image_url || '/images/scooter.png',
          year: s.year || '2024',
          rating: Number(avgRating),
          reviewCount: count,
        };
      });

      return {
        vendors: formattedVendors,
        scooters: formattedScooters,
        settings,
        cachedAt: new Date().toISOString(),
      };
    },
    30_000 // 30s in-memory hot cache
  );
}

/**
 * Fast Client-side catalog fetcher with SWR deduplication
 */
export async function fetchCatalogData(options?: { forceRefresh?: boolean }): Promise<CatalogData> {
  const cacheKey = 'catalog';

  if (options?.forceRefresh) {
    clientCache.invalidate(cacheKey);
  }

  return clientCache.dedupeFetch(cacheKey, async () => {
    // 1. High-speed cached server API
    try {
      const url = options?.forceRefresh ? '/api/catalog?refresh=true' : '/api/catalog';
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 30 },
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          clientCache.set(cacheKey, json.data);
          return json.data as CatalogData;
        }
      }
    } catch (apiErr) {
      console.warn('[CatalogService] API route error, falling back to direct Supabase query:', apiErr);
    }

    // 2. Direct Supabase Client Fallback
    const supabase = createBrowserClient();
    const [
      { data: vendors },
      { data: scooters },
      { data: reviews },
      { data: settingsData }
    ] = await Promise.all([
      supabase.from('vendors').select('id, name, logo, image_url, address, lat, lng, phone, opening_hours, delivery_area, status, rating, review_count, created_at').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('scooters').select('id, vendor_id, name, brand, engine, year, fuel_capacity, transmission, image_url, price_daily, price_weekly, price_monthly, total_units, available_units, created_at').order('name', { ascending: true }),
      supabase.from('reviews').select('vendor_id, rating'),
      supabase.from('platform_settings').select('*').limit(1).maybeSingle(),
    ]);

    const reviewStats: Record<string, { count: number; totalRating: number }> = {};
    if (reviews) {
      for (const r of reviews) {
        if (r.vendor_id) {
          if (!reviewStats[r.vendor_id]) reviewStats[r.vendor_id] = { count: 0, totalRating: 0 };
          reviewStats[r.vendor_id].count += 1;
          reviewStats[r.vendor_id].totalRating += Number(r.rating) || 5;
        }
      }
    }

    const settings: PlatformSettings = settingsData ? {
      markup_daily: Number(settingsData.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily,
      markup_weekly_per_day: Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day,
      markup_monthly_per_day: Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day,
      markup_weekly: (Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day) * 7,
      markup_monthly: (Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day) * 30,
    } : DEFAULT_PLATFORM_SETTINGS;

    const formattedVendors = (vendors || []).map((v: any) => {
      const stats = reviewStats[v.id];
      const count = stats?.count ?? v.review_count ?? 0;
      const avgRating = stats?.count && stats.count > 0 
        ? (stats.totalRating / stats.count).toFixed(1) 
        : (v.rating ? Number(v.rating).toFixed(1) : '5.0');

      return {
        ...v,
        initials: v.name ? v.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'V',
        location: v.address || 'Bali',
        rating: Number(avgRating),
        reviewCount: count,
      };
    });

    const formattedScooters = (scooters || []).map((s: any) => {
      const prices = getCustomerPrice(s.price_daily || 0, s.price_weekly, s.price_monthly, settings);
      const stats = reviewStats[s.vendor_id];
      const count = stats?.count || 0;
      const avgRating = count > 0 ? (stats.totalRating / count).toFixed(1) : '5.0';

      return {
        ...s,
        price: prices.daily.toLocaleString(),
        price_daily: prices.daily,
        price_weekly: prices.weekly,
        price_monthly: prices.monthly,
        img: s.image_url || '/images/scooter.png',
        year: s.year || '2024',
        rating: Number(avgRating),
        reviewCount: count,
      };
    });

    const result: CatalogData = {
      vendors: formattedVendors,
      scooters: formattedScooters,
      settings,
      cachedAt: new Date().toISOString(),
    };

    clientCache.set(cacheKey, result);
    return result;
  });
}

/**
 * High-speed single scooter fetcher
 */
export async function fetchScooterDetail(id: string, options?: { forceRefresh?: boolean }): Promise<ScooterDetailData | null> {
  const cacheKey = `scooter_${id}`;

  if (options?.forceRefresh) {
    clientCache.invalidate(cacheKey);
  }

  return clientCache.dedupeFetch(cacheKey, async () => {
    try {
      const url = options?.forceRefresh ? `/api/scooters/${id}?refresh=true` : `/api/scooters/${id}`;
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          clientCache.set(cacheKey, json.data);
          return json.data as ScooterDetailData;
        }
      }
    } catch (e) {
      console.warn('[CatalogService] Fast scooter API error, falling back to Supabase:', e);
    }

    // Direct Supabase Fallback
    try {
      const supabase = createBrowserClient();
      const { data: sData } = await supabase.from('scooters').select('*').eq('id', id).single();
      if (!sData) return null;

      const [
        { data: vData },
        { data: settingsData }
      ] = await Promise.all([
        supabase.from('vendors').select('*').eq('id', sData.vendor_id).single(),
        supabase.from('platform_settings').select('*').limit(1).maybeSingle(),
      ]);

      const settings: PlatformSettings = settingsData ? {
        markup_daily: Number(settingsData.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily,
        markup_weekly_per_day: Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day,
        markup_monthly_per_day: Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day,
        markup_weekly: (Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day) * 7,
        markup_monthly: (Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day) * 30,
      } : DEFAULT_PLATFORM_SETTINGS;

      const prices = getCustomerPrice(sData.price_daily || 0, sData.price_weekly, sData.price_monthly, settings);

      const result: ScooterDetailData = {
        scooter: {
          ...sData,
          price_daily: prices.daily,
          price_weekly: prices.weekly,
          price_monthly: prices.monthly,
          img: sData.image_url || '/images/scooter.png',
          year: sData.year || '2024',
        },
        vendor: vData || null,
        settings,
      };

      clientCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.error('[CatalogService] Error fetching scooter detail:', err);
      return null;
    }
  });
}

/**
 * High-speed vendor profile fetcher
 */
export async function fetchVendorDetail(id: string, options?: { forceRefresh?: boolean }): Promise<VendorDetailData | null> {
  const cacheKey = `vendor_${id}`;

  if (options?.forceRefresh) {
    clientCache.invalidate(cacheKey);
  }

  return clientCache.dedupeFetch(cacheKey, async () => {
    try {
      const url = options?.forceRefresh ? `/api/vendors/${id}?refresh=true` : `/api/vendors/${id}`;
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          clientCache.set(cacheKey, json.data);
          return json.data as VendorDetailData;
        }
      }
    } catch (e) {
      console.warn('[CatalogService] Fast vendor API error, falling back to Supabase:', e);
    }

    // Direct Supabase Fallback
    try {
      const supabase = createBrowserClient();
      const [
        { data: vData },
        { data: sData },
        { data: rData },
        { data: settingsData }
      ] = await Promise.all([
        supabase.from('vendors').select('*').eq('id', id).eq('status', 'approved').single(),
        supabase.from('scooters').select('*').eq('vendor_id', id),
        supabase.from('reviews').select('*').eq('vendor_id', id).order('created_at', { ascending: false }),
        supabase.from('platform_settings').select('*').limit(1).maybeSingle(),
      ]);

      if (!vData) return null;

      const settings: PlatformSettings = settingsData ? {
        markup_daily: Number(settingsData.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily,
        markup_weekly_per_day: Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day,
        markup_monthly_per_day: Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day,
        markup_weekly: (Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day) * 7,
        markup_monthly: (Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day) * 30,
      } : DEFAULT_PLATFORM_SETTINGS;

      const formattedScooters = (sData || []).map((s: any) => {
        const prices = getCustomerPrice(s.price_daily || 0, s.price_weekly, s.price_monthly, settings);
        return {
          ...s,
          price_daily: prices.daily,
          price_weekly: prices.weekly,
          price_monthly: prices.monthly,
          img: s.image_url || '/images/scooter.png',
          year: s.year || '2024',
        };
      });

      const result: VendorDetailData = {
        vendor: vData,
        scooters: formattedScooters,
        reviews: rData || [],
        settings,
      };

      clientCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.error('[CatalogService] Error fetching vendor detail:', err);
      return null;
    }
  });
}

/**
 * Invalidate catalog caches across client and server
 */
export function invalidateAllCatalogCaches(): void {
  clientCache.invalidatePattern('catalog');
  clientCache.invalidatePattern('scooter_');
  clientCache.invalidatePattern('vendor_');

  if (typeof window !== 'undefined') {
    fetch('/api/catalog', { method: 'POST' }).catch(() => {});
  }
}
