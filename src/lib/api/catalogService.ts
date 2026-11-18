import { clientCache } from '@/lib/cache/clientCache';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { serverCache } from '@/lib/cache/serverCache';
import { DEFAULT_PLATFORM_SETTINGS, getCustomerPrice, PlatformSettings } from '@/utils/pricing';
import { isBookingFinished, reconcileExpiredBookings } from '@/utils/rentalTime';

let lastBackgroundReconcileAt = 0;
function triggerBackgroundReconcile(supabase: any) {
  const now = Date.now();
  if (now - lastBackgroundReconcileAt < 30_000) return;
  lastBackgroundReconcileAt = now;
  void reconcileExpiredBookings(supabase).catch(() => {});
}

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

export function getNormalizedVendorCoordinates(vendor: any): { lat: number; lng: number } {
  let lat = Number(vendor?.lat);
  let lng = Number(vendor?.lng);

  // If vendor already has valid, non-zero coordinates within Bali bounds (Lat: -9.0 to -8.0, Lng: 114.4 to 115.8)
  const hasValidDbCoords = !isNaN(lat) && !isNaN(lng) && lat < -8.0 && lat > -9.0 && lng > 114.4 && lng < 115.8;

  if (!hasValidDbCoords) {
    const text = `${vendor?.name || ''} ${vendor?.address || ''} ${vendor?.delivery_area || ''}`.toLowerCase();
    
    // Precise Area Geocoding based on vendor location title
    if (text.includes('pererenan')) {
      lat = -8.6430; lng = 115.1240;
    } else if (text.includes('berawa')) {
      lat = -8.6610; lng = 115.1430;
    } else if (text.includes('batu bolong') || text.includes('echo beach') || text.includes('canggu')) {
      lat = -8.6530; lng = 115.1320;
    } else if (text.includes('petitenget') || text.includes('batu belig')) {
      lat = -8.6790; lng = 115.1510;
    } else if (text.includes('umalas') || text.includes('kerobokan')) {
      lat = -8.6690; lng = 115.1680;
    } else if (text.includes('seminyak') || text.includes('kayu aya') || text.includes('dhyana pura')) {
      lat = -8.6892; lng = 115.1586;
    } else if (text.includes('legian') || text.includes('padma')) {
      lat = -8.7050; lng = 115.1670;
    } else if (text.includes('kuta') || text.includes('pantai kuta')) {
      lat = -8.7185; lng = 115.1686;
    } else if (text.includes('airport') || text.includes('tuban') || text.includes('ngurah rai')) {
      lat = -8.7450; lng = 115.1670;
    } else if (text.includes('sanur') || text.includes('tamblingan')) {
      lat = -8.6882; lng = 115.2635;
    } else if (text.includes('bingin') || text.includes('padang padang')) {
      lat = -8.8050; lng = 115.1080;
    } else if (text.includes('uluwatu') || text.includes('pecatu') || text.includes('suluban')) {
      lat = -8.8149; lng = 115.0947;
    } else if (text.includes('ungasan') || text.includes('balangan')) {
      lat = -8.8150; lng = 115.1450;
    } else if (text.includes('nusa dua') || text.includes('itdc')) {
      lat = -8.7985; lng = 115.2243;
    } else if (text.includes('benoa') || text.includes('tanjung benoa')) {
      lat = -8.7610; lng = 115.2220;
    } else if (text.includes('jimbaran') || text.includes('kedonganan')) {
      lat = -8.7733; lng = 115.1652;
    } else if (text.includes('denpasar') || text.includes('renon') || text.includes('teuku umar')) {
      lat = -8.6705; lng = 115.2126;
    } else if (text.includes('tegallalang')) {
      lat = -8.4350; lng = 115.2790;
    } else if (text.includes('sayan') || text.includes('kedewatan')) {
      lat = -8.4980; lng = 115.2450;
    } else if (text.includes('mas') || text.includes('sukawati') || text.includes('celuk')) {
      lat = -8.5385; lng = 115.2745;
    } else if (text.includes('tabanan') || text.includes('tanah lot')) {
      lat = -8.6210; lng = 115.0865;
    } else if (text.includes('amed') || text.includes('candidasa') || text.includes('padangbai')) {
      lat = -8.3410; lng = 115.6540;
    } else {
      lat = -8.5130; lng = 115.2630; // Ubud Centre Default
    }

    // Apply slight deterministic offset so multiple vendors in the same area do not overlap
    const idKey = String(vendor?.id || vendor?.name || 'v');
    const hash = idKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offsetLat = (((hash % 7) - 3) * 0.0025);
    const offsetLng = ((((hash * 3) % 7) - 3) * 0.0025);
    lat += offsetLat;
    lng += offsetLng;
  }

  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

function sanitizeVendor(v: any) {
  if (!v) return v;
  const { auth_id: _authId, email: _email, ...safeVendor } = v;
  const coords = getNormalizedVendorCoordinates(v);
  return {
    ...safeVendor,
    lat: coords.lat,
    lng: coords.lng,
    initials: v.name
      ? v.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
      : 'V',
    location: v.address || 'Bali',
  };
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

      // Single parallel batch: vendors, scooters, settings, and active confirmed bookings
      const [
        { data: vendors, error: vErr },
        { data: scooters, error: sErr },
        { data: settingsData },
        { data: confirmedBookings }
      ] = await Promise.all([
        supabase
          .from('vendors')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false }),
        supabase
          .from('scooters')
          .select('id, vendor_id, name, brand, engine, year, fuel_capacity, transmission, image_url, price_daily, price_weekly, price_monthly, total_units, available_units, created_at')
          .order('name', { ascending: true }),
        supabase
          .from('platform_settings')
          .select('*')
          .limit(1)
          .maybeSingle(),
        supabase
          .from('bookings')
          .select('id, scooter_id, quantity, end_date')
          .eq('status', 'confirmed'),
      ]);

      if (vErr) console.warn('[CatalogService] Vendors query error:', vErr);
      if (sErr) console.warn('[CatalogService] Scooters query error:', sErr);

      // Compute restored units immediately in memory for any finished bookings without blocking response
      const nowMs = Date.now();
      const restoredByScooter: Record<string, number> = {};
      let hasExpired = false;
      if (confirmedBookings && confirmedBookings.length > 0) {
        for (const b of confirmedBookings) {
          if (b.scooter_id && isBookingFinished(b.end_date, nowMs)) {
            hasExpired = true;
            const key = String(b.scooter_id);
            restoredByScooter[key] = (restoredByScooter[key] || 0) + Math.max(1, Number(b.quantity) || 1);
          }
        }
      }
      if (hasExpired) {
        triggerBackgroundReconcile(supabase);
      }

      const settings: PlatformSettings = settingsData ? {
        markup_daily: Number(settingsData.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily,
        markup_weekly_per_day: Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day,
        markup_monthly_per_day: Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day,
        markup_weekly: (Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day) * 7,
        markup_monthly: (Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day) * 30,
      } : DEFAULT_PLATFORM_SETTINGS;

      const formattedVendors = (vendors || []).map((v: any) => sanitizeVendor(v));

      const formattedScooters = (scooters || []).map((s: any) => {
        const prices = getCustomerPrice(s.price_daily || 0, s.price_weekly, s.price_monthly, settings);
        const restored = restoredByScooter[String(s.id)] || 0;
        const totalUnits = Number(s.total_units ?? 1);
        const liveAvailable = restored > 0
          ? Math.min(totalUnits, Number(s.available_units ?? 0) + restored)
          : s.available_units;

        return {
          ...s,
          available_units: liveAvailable,
          price: prices.daily.toLocaleString(),
          price_daily: prices.daily,
          price_weekly: prices.weekly,
          price_monthly: prices.monthly,
          img: s.image_url || '/images/scooter.png',
          year: s.year || '2024',
        };
      });

      return {
        vendors: formattedVendors,
        scooters: formattedScooters,
        settings,
        cachedAt: new Date().toISOString(),
      };
    },
    60_000 // 60s in-memory hot cache (invalidated immediately on mutations)
  );
}

/**
 * Instant Server-Side Scooter Detail Fetcher (0ms waterfall)
 */
export async function fetchScooterDetailServer(id: string): Promise<ScooterDetailData | null> {
  try {
    const catalog = await getCatalogServerData();
    const scooter = catalog.scooters.find((s: any) => String(s.id) === String(id));
    if (scooter) {
      const vendor = catalog.vendors.find((v: any) => String(v.id) === String(scooter.vendor_id)) || null;
      return {
        scooter,
        vendor,
        settings: catalog.settings,
      };
    }

    // Direct Supabase fallback
    const supabase = getDirectSupabase();
    const { data: sData } = await supabase.from('scooters').select('*').eq('id', id).maybeSingle();
    if (!sData) return null;

    const [
      { data: vData },
      { data: settingsData }
    ] = await Promise.all([
      supabase.from('vendors').select('*').eq('id', sData.vendor_id).maybeSingle(),
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

    return {
      scooter: {
        ...sData,
        price_daily: prices.daily,
        price_weekly: prices.weekly,
        price_monthly: prices.monthly,
        img: sData.image_url || '/images/scooter.png',
        year: sData.year || '2024',
      },
      vendor: sanitizeVendor(vData) || null,
      settings,
    };
  } catch (e) {
    console.error('[CatalogService] fetchScooterDetailServer error:', e);
    return null;
  }
}

/**
 * Instant Server-Side Vendor Detail Fetcher (0ms waterfall)
 */
export async function fetchVendorDetailServer(id: string): Promise<VendorDetailData | null> {
  try {
    const catalog = await getCatalogServerData();
    const vendor = catalog.vendors.find((v: any) => String(v.id) === String(id));
    const scooters = catalog.scooters.filter((s: any) => String(s.vendor_id) === String(id));

    if (vendor) {
      return {
        vendor,
        scooters,
        reviews: [],
        settings: catalog.settings,
      };
    }

    const supabase = getDirectSupabase();
    const { data: vData } = await supabase.from('vendors').select('*').eq('id', id).maybeSingle();
    if (!vData) return null;

    return {
      vendor: sanitizeVendor(vData),
      scooters,
      reviews: [],
      settings: catalog.settings,
    };
  } catch (e) {
    console.error('[CatalogService] fetchVendorDetailServer error:', e);
    return null;
  }
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
      { data: settingsData }
    ] = await Promise.all([
      supabase.from('vendors').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('scooters').select('id, vendor_id, name, brand, engine, year, fuel_capacity, transmission, image_url, price_daily, price_weekly, price_monthly, total_units, available_units, created_at').order('name', { ascending: true }),
      supabase.from('platform_settings').select('*').limit(1).maybeSingle(),
    ]);

    const settings: PlatformSettings = settingsData ? {
      markup_daily: Number(settingsData.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily,
      markup_weekly_per_day: Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day,
      markup_monthly_per_day: Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day,
      markup_weekly: (Number(settingsData.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day) * 7,
      markup_monthly: (Number(settingsData.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day) * 30,
    } : DEFAULT_PLATFORM_SETTINGS;

    const formattedVendors = (vendors || []).map((v: any) => sanitizeVendor(v));

    const formattedScooters = (scooters || []).map((s: any) => {
      const prices = getCustomerPrice(s.price_daily || 0, s.price_weekly, s.price_monthly, settings);
      return {
        ...s,
        price: prices.daily.toLocaleString(),
        price_daily: prices.daily,
        price_weekly: prices.weekly,
        price_monthly: prices.monthly,
        img: s.image_url || '/images/scooter.png',
        year: s.year || '2024',
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
        { data: settingsData }
      ] = await Promise.all([
        supabase.from('vendors').select('*').eq('id', id).eq('status', 'approved').single(),
        supabase.from('scooters').select('*').eq('vendor_id', id),
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
        vendor: sanitizeVendor(vData),
        scooters: formattedScooters,
        reviews: [],
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
