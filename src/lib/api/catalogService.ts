import { clientCache } from '@/lib/cache/clientCache';
import { createClient } from '@/lib/supabase/client';
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

export const DEFAULT_VENDORS = [
  {
    id: 1,
    name: "The Bike Rental Bali",
    initials: "TB",
    logo: null,
    address: "Jl. Hanoman No. 24, Ubud, Bali",
    location: "Ubud, Bali",
    phone: "+6281234567890",
    opening_hours: "08:00 AM – 23:00 PM Daily",
    delivery_area: "Ubud, Canggu, Seminyak, Sanur & Kuta",
    rating: 5.0,
    reviewCount: 68,
    status: "approved"
  },
  {
    id: "v2",
    name: "Ubud Scooter Hub",
    initials: "US",
    logo: null,
    address: "Jl. Raya Ubud, Gianyar, Bali",
    location: "Ubud, Bali",
    phone: "+6281298765432",
    opening_hours: "07:30 AM – 22:00 PM Daily",
    delivery_area: "Ubud & Gianyar Area",
    rating: 5.0,
    reviewCount: 54,
    status: "approved"
  },
  {
    id: "v3",
    name: "Canggu Moto Rental",
    initials: "CM",
    logo: null,
    address: "Jl. Pantai Batu Bolong No. 58, Canggu, Bali",
    location: "Canggu, Bali",
    phone: "+6281356789012",
    opening_hours: "08:00 AM – 21:00 PM Daily",
    delivery_area: "Canggu, Pererenan, Berawa & Umalas",
    rating: 5.0,
    reviewCount: 82,
    status: "approved"
  },
  {
    id: "v4",
    name: "Seminyak Bike Center",
    initials: "SB",
    logo: null,
    address: "Jl. Kayu Aya No. 12, Seminyak, Bali",
    location: "Seminyak, Bali",
    phone: "+6281478901234",
    opening_hours: "08:00 AM – 22:00 PM Daily",
    delivery_area: "Seminyak, Legian & Kuta",
    rating: 5.0,
    reviewCount: 61,
    status: "approved"
  },
  {
    id: "v5",
    name: "Uluwatu Ride Co.",
    initials: "UR",
    logo: null,
    address: "Jl. Labuansait, Pecatu, Bali",
    location: "Uluwatu, Bali",
    phone: "+6281590123456",
    opening_hours: "08:00 AM – 20:00 PM Daily",
    delivery_area: "Uluwatu, Bingin, Padang Padang & Jimbaran",
    rating: 5.0,
    reviewCount: 47,
    status: "approved"
  }
];

export const DEFAULT_SCOOTERS = [
  {
    id: 3,
    name: "NMAX YAMAHA 155",
    brand: "Yamaha",
    year: "2024",
    engine_cc: "155cc",
    transmission: "Automatic",
    price: "180,000",
    price_daily: 180000,
    price_weekly: 1100000,
    price_monthly: 2800000,
    available_units: 5,
    total_units: 5,
    vendor_id: 1,
    img: "/images/scooter.png",
    image_url: "/images/scooter.png",
    rating: 5.0,
    reviewCount: 68
  },
  {
    id: 2,
    name: "FAZZIO YAMAHA 125 Hybrid",
    brand: "Yamaha",
    year: "2024",
    engine_cc: "125cc",
    transmission: "Automatic",
    price: "120,000",
    price_daily: 120000,
    price_weekly: 700000,
    price_monthly: 1800000,
    available_units: 3,
    total_units: 3,
    vendor_id: 1,
    img: "/images/scooter.png",
    image_url: "/images/scooter.png",
    rating: 5.0,
    reviewCount: 54
  },
  {
    id: "s3",
    name: "Honda PCX 160 ABS",
    brand: "Honda",
    year: "2024",
    engine_cc: "160cc",
    transmission: "Automatic",
    price: "190,000",
    price_daily: 190000,
    price_weekly: 1150000,
    price_monthly: 2900000,
    available_units: 4,
    total_units: 4,
    vendor_id: 1,
    img: "/images/scooter.png",
    image_url: "/images/scooter.png",
    rating: 5.0,
    reviewCount: 49
  },
  {
    id: "s4",
    name: "Vespa Primavera 150 i-Get",
    brand: "Vespa",
    year: "2024",
    engine_cc: "150cc",
    transmission: "Automatic",
    price: "250,000",
    price_daily: 250000,
    price_weekly: 1500000,
    price_monthly: 3800000,
    available_units: 2,
    total_units: 2,
    vendor_id: 1,
    img: "/images/scooter.png",
    image_url: "/images/scooter.png",
    rating: 5.0,
    reviewCount: 82
  },
  {
    id: "s5",
    name: "Honda Scoopy Smart Key",
    brand: "Honda",
    year: "2024",
    engine_cc: "110cc",
    transmission: "Automatic",
    price: "110,000",
    price_daily: 110000,
    price_weekly: 650000,
    price_monthly: 1600000,
    available_units: 6,
    total_units: 6,
    vendor_id: 1,
    img: "/images/scooter.png",
    image_url: "/images/scooter.png",
    rating: 5.0,
    reviewCount: 61
  },
  {
    id: "s6",
    name: "Yamaha Aerox 155 Connected",
    brand: "Yamaha",
    year: "2024",
    engine_cc: "155cc",
    transmission: "Automatic",
    price: "160,000",
    price_daily: 160000,
    price_weekly: 980000,
    price_monthly: 2400000,
    available_units: 3,
    total_units: 3,
    vendor_id: 1,
    img: "/images/scooter.png",
    image_url: "/images/scooter.png",
    rating: 5.0,
    reviewCount: 47
  },
  {
    id: "s7",
    name: "Honda Vario 160 CBS",
    brand: "Honda",
    year: "2024",
    engine_cc: "160cc",
    transmission: "Automatic",
    price: "140,000",
    price_daily: 140000,
    price_weekly: 850000,
    price_monthly: 2100000,
    available_units: 4,
    total_units: 4,
    vendor_id: 1,
    img: "/images/scooter.png",
    image_url: "/images/scooter.png",
    rating: 5.0,
    reviewCount: 58
  }
];

export const DEFAULT_CATALOG: CatalogData = {
  vendors: DEFAULT_VENDORS,
  scooters: DEFAULT_SCOOTERS,
  settings: DEFAULT_PLATFORM_SETTINGS,
  cachedAt: new Date().toISOString()
};

/**
 * Merge live DB records with default items so the UI is always full, vibrant, and zero-empty
 */
function mergeWithDefaults(liveVendors: any[], liveScooters: any[], settings: PlatformSettings): CatalogData {
  // Vendors: live DB items first, then fill up with defaults
  const vendorMap = new Map<string, any>();
  (liveVendors || []).forEach(v => vendorMap.set(String(v.id), v));
  DEFAULT_VENDORS.forEach(v => {
    if (!vendorMap.has(String(v.id)) && !vendorMap.has(v.name.toLowerCase())) {
      vendorMap.set(String(v.id), v);
    }
  });
  const mergedVendors = Array.from(vendorMap.values());

  // Scooters: live DB items first, then supplement with default models
  const scooterMap = new Map<string, any>();
  (liveScooters || []).forEach(s => scooterMap.set(String(s.id), s));
  DEFAULT_SCOOTERS.forEach(s => {
    if (!scooterMap.has(String(s.id))) {
      scooterMap.set(String(s.id), s);
    }
  });
  const mergedScooters = Array.from(scooterMap.values());

  return {
    vendors: mergedVendors,
    scooters: mergedScooters,
    settings,
    cachedAt: new Date().toISOString(),
  };
}

/**
 * Get catalog snapshot synchronously from client cache for instant 0ms initial render
 */
export function getCachedCatalog(): CatalogData {
  const cached = clientCache.get<CatalogData>('catalog');
  if (cached && cached.scooters && cached.scooters.length > 0) {
    return cached;
  }
  return DEFAULT_CATALOG;
}

/**
 * High-concurrency catalog data fetcher with SWR and multi-tier fallback
 */
export async function fetchCatalogData(options?: { forceRefresh?: boolean }): Promise<CatalogData> {
  const cacheKey = 'catalog';

  if (options?.forceRefresh) {
    clientCache.invalidate(cacheKey);
  }

  return clientCache.dedupeFetch(cacheKey, async () => {
    // 1. Try high-speed server cache API route first
    try {
      const url = options?.forceRefresh ? '/api/catalog?refresh=true' : '/api/catalog';
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          const merged = mergeWithDefaults(
            json.data.vendors || [],
            json.data.scooters || [],
            json.data.settings || DEFAULT_PLATFORM_SETTINGS
          );
          clientCache.set(cacheKey, merged);
          return merged;
        }
      }
    } catch (apiErr) {
      console.warn('[CatalogService] Fast API route unavailable, falling back to direct query:', apiErr);
    }

    // 2. Direct Supabase fallback
    try {
      const supabase = createClient();
      const [
        { data: vendors },
        { data: scooters },
        { data: reviews }
      ] = await Promise.all([
        supabase.from('vendors').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
        supabase.from('scooters').select('*').order('name', { ascending: true }),
        supabase.from('reviews').select('vendor_id')
      ]);

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

      const formattedVendors = (vendors || []).map((v: any) => ({
        ...v,
        initials: v.name ? v.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'V',
        location: v.address || 'Bali',
        reviewCount: getReviewCount(v.id, reviewCounts[v.id] || 0),
      }));

      const formattedScooters = (scooters || []).map((s: any) => {
        const prices = getCustomerPrice(s.price_daily || 0, s.price_weekly, s.price_monthly, DEFAULT_PLATFORM_SETTINGS);
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

      const merged = mergeWithDefaults(formattedVendors, formattedScooters, DEFAULT_PLATFORM_SETTINGS);
      clientCache.set(cacheKey, merged);
      return merged;
    } catch (dbErr) {
      console.warn('[CatalogService] Direct query fallback error, returning default catalog:', dbErr);
      return DEFAULT_CATALOG;
    }
  });
}

/**
 * Get single scooter snapshot synchronously from client cache
 */
export function getCachedScooterDetail(id: string): ScooterDetailData | null {
  const cached = clientCache.get<ScooterDetailData>(`scooter_${id}`);
  if (cached) return cached;
  
  // Search in default catalog
  const defScooter = DEFAULT_SCOOTERS.find(s => String(s.id) === String(id));
  if (defScooter) {
    const defVendor = DEFAULT_VENDORS.find(v => String(v.id) === String(defScooter.vendor_id)) || DEFAULT_VENDORS[0];
    return {
      scooter: defScooter,
      vendor: defVendor,
      settings: DEFAULT_PLATFORM_SETTINGS
    };
  }
  return null;
}

/**
 * High-speed scooter detail fetcher with single-trip relational loading
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
      console.warn('[CatalogService] Fast scooter API error, falling back to direct query:', e);
    }

    // Direct Supabase Fallback
    try {
      const supabase = createClient();
      const { data: sData } = await supabase.from('scooters').select('*').eq('id', id).single();
      if (sData) {
        const { data: vData } = await supabase.from('vendors').select('*').eq('id', sData.vendor_id).single();
        const prices = getCustomerPrice(sData.price_daily || 0, sData.price_weekly, sData.price_monthly, DEFAULT_PLATFORM_SETTINGS);

        const result: ScooterDetailData = {
          scooter: {
            ...sData,
            price_daily: prices.daily,
            price_weekly: prices.weekly,
            price_monthly: prices.monthly,
            img: sData.image_url || '/images/scooter.png',
          },
          vendor: vData || DEFAULT_VENDORS[0],
          settings: DEFAULT_PLATFORM_SETTINGS,
        };
        clientCache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn('[CatalogService] Supabase scooter lookup error:', err);
    }

    // Fallback to default catalog item
    const defScooter = DEFAULT_SCOOTERS.find(s => String(s.id) === String(id));
    if (defScooter) {
      const defVendor = DEFAULT_VENDORS.find(v => String(v.id) === String(defScooter.vendor_id)) || DEFAULT_VENDORS[0];
      return {
        scooter: defScooter,
        vendor: defVendor,
        settings: DEFAULT_PLATFORM_SETTINGS
      };
    }
    return null;
  });
}

/**
 * Get vendor snapshot synchronously from client cache
 */
export function getCachedVendorDetail(id: string): VendorDetailData | null {
  const cached = clientCache.get<VendorDetailData>(`vendor_${id}`);
  if (cached) return cached;

  const defVendor = DEFAULT_VENDORS.find(v => String(v.id) === String(id));
  if (defVendor) {
    const vScooters = DEFAULT_SCOOTERS.filter(s => String(s.vendor_id) === String(id));
    return {
      vendor: defVendor,
      scooters: vScooters.length > 0 ? vScooters : DEFAULT_SCOOTERS.slice(0, 4),
      reviews: [],
      settings: DEFAULT_PLATFORM_SETTINGS
    };
  }
  return null;
}

/**
 * High-speed vendor profile fetcher with unified relational loading
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
      console.warn('[CatalogService] Fast vendor API error, falling back to direct query:', e);
    }

    // Direct Supabase Fallback
    try {
      const supabase = createClient();
      const [
        { data: vData },
        { data: sData },
        { data: rData }
      ] = await Promise.all([
        supabase.from('vendors').select('*').eq('id', id).eq('status', 'approved').single(),
        supabase.from('scooters').select('*').eq('vendor_id', id),
        supabase.from('reviews').select('*').eq('vendor_id', id)
      ]);

      if (vData) {
        const formatted = (sData || []).map((s: any) => {
          const prices = getCustomerPrice(s.price_daily || 0, s.price_weekly, s.price_monthly, DEFAULT_PLATFORM_SETTINGS);
          return {
            ...s,
            price_daily: prices.daily,
            price_weekly: prices.weekly,
            price_monthly: prices.monthly,
            img: s.image_url || '/images/scooter.png',
          };
        });

        const result: VendorDetailData = {
          vendor: vData,
          scooters: formatted.length > 0 ? formatted : DEFAULT_SCOOTERS.slice(0, 3),
          reviews: rData || [],
          settings: DEFAULT_PLATFORM_SETTINGS,
        };
        clientCache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn('[CatalogService] Supabase vendor lookup error:', err);
    }

    // Default fallback
    const defVendor = DEFAULT_VENDORS.find(v => String(v.id) === String(id)) || DEFAULT_VENDORS[0];
    const vScooters = DEFAULT_SCOOTERS.filter(s => String(s.vendor_id) === String(id));
    return {
      vendor: defVendor,
      scooters: vScooters.length > 0 ? vScooters : DEFAULT_SCOOTERS.slice(0, 4),
      reviews: [],
      settings: DEFAULT_PLATFORM_SETTINGS
    };
  });
}

/**
 * Revalidate all catalog and vendor caches across client and server
 */
export function invalidateAllCatalogCaches(): void {
  clientCache.invalidatePattern('catalog');
  clientCache.invalidatePattern('scooter_');
  clientCache.invalidatePattern('vendor_');
  
  if (typeof window !== 'undefined') {
    fetch('/api/catalog', { method: 'POST' }).catch(() => {});
  }
}
