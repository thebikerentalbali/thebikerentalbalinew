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

export function getNormalizedVendorCoordinates(vendor: any): { lat: number; lng: number } {
  let lat = Number(vendor?.lat);
  let lng = Number(vendor?.lng);

  if (!lat || !lng || isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
    const text = `${vendor?.name || ''} ${vendor?.address || ''} ${vendor?.delivery_area || ''}`.toLowerCase();
    if (text.includes('canggu') || text.includes('berawa') || text.includes('pererenan') || text.includes('batu bolong')) {
      lat = -8.6478; lng = 115.1385;
    } else if (text.includes('seminyak') || text.includes('petitenget') || text.includes('kerobokan')) {
      lat = -8.6892; lng = 115.1686;
    } else if (text.includes('kuta') || text.includes('legian') || text.includes('airport') || text.includes('tuban')) {
      lat = -8.7185; lng = 115.1686;
    } else if (text.includes('sanur')) {
      lat = -8.6882; lng = 115.2635;
    } else if (text.includes('uluwatu') || text.includes('pecatu') || text.includes('bingin') || text.includes('padang padang')) {
      lat = -8.8149; lng = 115.1147;
    } else if (text.includes('nusa dua') || text.includes('benoa')) {
      lat = -8.7985; lng = 115.2243;
    } else if (text.includes('jimbaran')) {
      lat = -8.7733; lng = 115.1652;
    } else if (text.includes('denpasar')) {
      lat = -8.6705; lng = 115.2126;
    } else {
      lat = -8.5069; lng = 115.2625; // Ubud / Bali Central default
    }
  }
  return { lat, lng };
}

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", 
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", 
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy", 
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", 
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", 
  "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Melissa", "George", "Deborah", 
  "Timothy", "Stephanie"
];

const REVIEW_COMMENTS = [
  "Great scooter, ran perfectly the whole trip! The vendor was very responsive and drop-off was super easy. Definitely coming back.",
  "Excellent service and the bike was in top condition. We drove it all around Ubud and didn't have a single problem with the brakes or engine.",
  "Very responsive vendor. Highly recommended.",
  "Smooth rental process. The scooter was clean and well maintained.",
  "Best rental experience in Bali so far. I loved that they provided two good quality helmets and the bike felt practically brand new.",
  "Friendly staff and transparent pricing.",
  "No issues at all. Would definitely rent here again.",
  "Bike worked flawlessly for our week-long stay.",
  "Great value for money. Very reliable and surprisingly fuel-efficient on the steep mountain roads.",
  "Loved the flexibility and easy drop-off.",
  "Scooter was practically brand new. 5 stars!",
  "Customer service was exceptional.",
  "They provided two helmets and a full tank. Awesome! The communication through WhatsApp was clear and they arrived right on time.",
  "Super easy to communicate with.",
  "The scooter handled the steep hills without a problem.",
  "Highly trustworthy vendor.",
  "Quick and easy. No hidden fees.",
  "They delivered the bike right to our hotel.",
  "Incredible experience, very professional.",
  "The bike was powerful and fuel efficient."
];

/**
 * Smart deterministic review autogenerator.
 * Returns real database reviews first; if fewer than 5 real reviews exist,
 * blends deterministic realistic reviews (40-70) based on vendor ID hash.
 */
export function getVendorDeterministicReviews(vendorId: string, realReviews: any[] = []): any[] {
  const loadedReviews = Array.isArray(realReviews) ? [...realReviews] : [];
  
  if (loadedReviews.length >= 5) {
    return loadedReviews;
  }

  const idStr = String(vendorId || 'vendor');
  const hash = idStr.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const absHash = Math.abs(hash);
  const numFakeReviews = (absHash % 31) + 40; // deterministic number 40-70

  let currentSeed = absHash;
  const seededRandom = () => {
    const x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  };

  const generatedReviews = [];
  const baseTimestamp = Date.now();
  for (let i = 0; i < numFakeReviews; i++) {
    const firstName = FIRST_NAMES[Math.floor(seededRandom() * FIRST_NAMES.length)];
    const lastInitial = String.fromCharCode(65 + Math.floor(seededRandom() * 26));
    const comment = REVIEW_COMMENTS[Math.floor(seededRandom() * REVIEW_COMMENTS.length)];
    const daysAgo = Math.floor(seededRandom() * 90) + 1;
    const createdAt = new Date(baseTimestamp - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    generatedReviews.push({
      id: `generated-${vendorId}-${i}`,
      vendor_id: vendorId,
      user_name: `${firstName} ${lastInitial}.`,
      rating: 5,
      comment,
      created_at: createdAt,
      is_generated: true,
    });
  }

  return [...loadedReviews, ...generatedReviews];
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
        const realCount = stats?.count ?? 0;
        let count = realCount;
        let avgRating = '5.0';

        if (realCount >= 5) {
          avgRating = (stats.totalRating / realCount).toFixed(1);
        } else {
          const autoReviews = getVendorDeterministicReviews(v.id, []);
          count = realCount + autoReviews.length;
          avgRating = '5.0';
        }

        const coords = getNormalizedVendorCoordinates(v);

        return {
          ...v,
          lat: coords.lat,
          lng: coords.lng,
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
        const realCount = stats?.count || 0;
        const autoReviews = realCount < 5 ? getVendorDeterministicReviews(s.vendor_id, []) : [];
        const count = realCount >= 5 ? realCount : realCount + autoReviews.length;
        const avgRating = realCount >= 5 && realCount > 0 ? (stats.totalRating / realCount).toFixed(1) : '5.0';

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
      vendor: vData || null,
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

    const supabase = getDirectSupabase();
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('vendor_id', id)
      .order('created_at', { ascending: false });

    const allReviews = getVendorDeterministicReviews(id, reviews || []);

    if (vendor) {
      return {
        vendor: {
          ...vendor,
          rating: Number(vendor.rating) || 5.0,
          reviewCount: allReviews.length,
        },
        scooters,
        reviews: allReviews,
        settings: catalog.settings,
      };
    }

    const { data: vData } = await supabase.from('vendors').select('*').eq('id', id).maybeSingle();
    if (!vData) return null;

    const coords = getNormalizedVendorCoordinates(vData);
    return {
      vendor: {
        ...vData,
        lat: coords.lat,
        lng: coords.lng,
        initials: vData.name ? vData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'V',
        location: vData.address || 'Bali',
        rating: Number(vData.rating) || 5.0,
        reviewCount: allReviews.length,
      },
      scooters,
      reviews: allReviews,
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
      const realCount = stats?.count ?? 0;
      let count = realCount;
      let avgRating = '5.0';

      if (realCount >= 5) {
        avgRating = (stats.totalRating / realCount).toFixed(1);
      } else {
        const autoReviews = getVendorDeterministicReviews(v.id, []);
        count = realCount + autoReviews.length;
        avgRating = '5.0';
      }

      const coords = getNormalizedVendorCoordinates(v);

      return {
        ...v,
        lat: coords.lat,
        lng: coords.lng,
        initials: v.name ? v.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'V',
        location: v.address || 'Bali',
        rating: Number(avgRating),
        reviewCount: count,
      };
    });

    const formattedScooters = (scooters || []).map((s: any) => {
      const prices = getCustomerPrice(s.price_daily || 0, s.price_weekly, s.price_monthly, settings);
      const stats = reviewStats[s.vendor_id];
      const realCount = stats?.count || 0;
      const autoReviews = realCount < 5 ? getVendorDeterministicReviews(s.vendor_id, []) : [];
      const count = realCount >= 5 ? realCount : realCount + autoReviews.length;
      const avgRating = realCount >= 5 && realCount > 0 ? (stats.totalRating / realCount).toFixed(1) : '5.0';

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

      const allReviews = getVendorDeterministicReviews(id, rData || []);

      const result: VendorDetailData = {
        vendor: {
          ...vData,
          rating: Number(vData.rating) || 5.0,
          reviewCount: allReviews.length,
        },
        scooters: formattedScooters,
        reviews: allReviews,
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
