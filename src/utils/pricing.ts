import { createClient } from '@/lib/supabase/client';

export interface PlatformSettings {
  markup_daily: number;          // IDR markup per day for daily rentals (< 7 days)
  markup_weekly_per_day: number; // IDR markup per day for weekly rentals (7 - 29 days)
  markup_monthly_per_day: number;// IDR markup per day for monthly rentals (30+ days)
  markup_weekly?: number;        // Total weekly markup (markup_weekly_per_day * 7)
  markup_monthly?: number;       // Total monthly markup (markup_monthly_per_day * 30)
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  markup_daily: 25000,
  markup_weekly_per_day: 20000,
  markup_monthly_per_day: 15000,
  markup_weekly: 140000,
  markup_monthly: 450000,
};

const STORAGE_KEY = 'platform_commission_settings';

export function getPlatformSettings(): PlatformSettings {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const daily = Number(parsed.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily;
      
      const weeklyPerDay = Number(parsed.markup_weekly_per_day) || 
        (parsed.markup_weekly ? Math.round(Number(parsed.markup_weekly) / 7) : DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day);
        
      const monthlyPerDay = Number(parsed.markup_monthly_per_day) || 
        (parsed.markup_monthly ? Math.round(Number(parsed.markup_monthly) / 30) : DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day);

      return {
        markup_daily: daily,
        markup_weekly_per_day: weeklyPerDay,
        markup_monthly_per_day: monthlyPerDay,
        markup_weekly: Number(parsed.markup_weekly) || (weeklyPerDay * 7),
        markup_monthly: Number(parsed.markup_monthly) || (monthlyPerDay * 30),
      };
    }
  } catch (e) {
    console.error('Failed to get platform settings:', e);
  }
  return DEFAULT_PLATFORM_SETTINGS;
}

/**
 * Asynchronously fetches platform settings from Supabase database
 * and updates local cache & event listeners.
 */
export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  const local = getPlatformSettings();
  if (typeof window === 'undefined') return local;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const daily = Number(data.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily;
      const weeklyPerDay = Number(data.markup_weekly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day;
      const monthlyPerDay = Number(data.markup_monthly_per_day) || DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day;

      const remoteSettings: PlatformSettings = {
        markup_daily: daily,
        markup_weekly_per_day: weeklyPerDay,
        markup_monthly_per_day: monthlyPerDay,
        markup_weekly: weeklyPerDay * 7,
        markup_monthly: monthlyPerDay * 30,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteSettings));
      window.dispatchEvent(new Event('platform_settings_updated'));
      return remoteSettings;
    }
  } catch (e) {
    console.warn('Could not load remote platform settings from Supabase, using local fallback:', e);
  }

  return local;
}

export function savePlatformSettings(settings: Partial<PlatformSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const daily = Number(settings.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily;
    const weeklyPerDay = Number(settings.markup_weekly_per_day) || 
      (settings.markup_weekly ? Math.round(Number(settings.markup_weekly) / 7) : DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day);
    const monthlyPerDay = Number(settings.markup_monthly_per_day) || 
      (settings.markup_monthly ? Math.round(Number(settings.markup_monthly) / 30) : DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day);

    const payload: PlatformSettings = {
      markup_daily: daily,
      markup_weekly_per_day: weeklyPerDay,
      markup_monthly_per_day: monthlyPerDay,
      markup_weekly: weeklyPerDay * 7,
      markup_monthly: monthlyPerDay * 30,
    };
    
    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event('platform_settings_updated'));

    // Attempt to upsert to Supabase asynchronously
    (async () => {
      try {
        const supabase = createClient();
        await supabase
          .from('platform_settings')
          .upsert({
            id: 'default',
            markup_daily: daily,
            markup_weekly_per_day: weeklyPerDay,
            markup_monthly_per_day: monthlyPerDay,
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('Could not sync platform settings to Supabase table:', err);
      }
    })();
  } catch (e) {
    console.error('Failed to save platform settings:', e);
  }
}

/**
 * Subscribes to platform settings updates (both intra-tab and cross-tab)
 */
export function subscribeToPlatformSettings(callback: (settings: PlatformSettings) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => {
    callback(getPlatformSettings());
  };

  window.addEventListener('platform_settings_updated', handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener('platform_settings_updated', handler);
    window.removeEventListener('storage', handler);
  };
}

/**
 * Calculates customer display price from vendor net price and markup
 */
export function getCustomerPrice(
  vendorNetDaily: number = 0,
  vendorNetWeekly?: number,
  vendorNetMonthly?: number,
  settings: PlatformSettings = DEFAULT_PLATFORM_SETTINGS
) {
  const dailyMarkup = Number(settings.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily;
  const weeklyMarkupPerDay = Number(settings.markup_weekly_per_day) || 
    (settings.markup_weekly ? Math.round(Number(settings.markup_weekly) / 7) : DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day);
  const monthlyMarkupPerDay = Number(settings.markup_monthly_per_day) || 
    (settings.markup_monthly ? Math.round(Number(settings.markup_monthly) / 30) : DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day);

  const totalWeeklyMarkup = weeklyMarkupPerDay * 7;
  const totalMonthlyMarkup = monthlyMarkupPerDay * 30;

  const daily = vendorNetDaily + dailyMarkup;
  const weekly = (vendorNetWeekly && vendorNetWeekly > 0)
    ? vendorNetWeekly + totalWeeklyMarkup
    : (vendorNetDaily * 6) + totalWeeklyMarkup;
  const monthly = (vendorNetMonthly && vendorNetMonthly > 0)
    ? vendorNetMonthly + totalMonthlyMarkup
    : (vendorNetDaily * 20) + totalMonthlyMarkup;

  return {
    daily,
    weekly,
    monthly
  };
}

/**
 * Helper to calculate rental duration in days
 */
export function calculateRentalDays(startDate?: string | Date, endDate?: string | Date): number {
  if (!startDate) return 1;
  try {
    let s: Date;
    let e: Date;

    if (typeof startDate === 'string' && (startDate.includes(' to ') || startDate.includes(' - '))) {
      const parts = startDate.includes(' to ') ? startDate.split(' to ') : startDate.split(' - ');
      return calculateRentalDays(parts[0], parts[1]);
    }

    if (startDate instanceof Date) {
      s = new Date(startDate);
    } else {
      const cleanS = startDate.substring(0, 10);
      const [sy, sm, sd] = cleanS.split('-').map(Number);
      s = new Date(sy, (sm || 1) - 1, sd || 1);
    }

    if (endDate instanceof Date) {
      e = new Date(endDate);
    } else if (typeof endDate === 'string' && endDate) {
      const cleanE = endDate.substring(0, 10);
      const [ey, em, ed] = cleanE.split('-').map(Number);
      e = new Date(ey, (em || 1) - 1, ed || 1);
    } else {
      e = new Date(s);
    }

    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    const diffTime = e.getTime() - s.getTime();
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  } catch {
    return 1;
  }
}

/**
 * Calculates admin commission / markup earned for a specific booking
 */
export function calculateBookingCommission(
  startDate?: string | Date,
  endDate?: string | Date,
  quantity: number = 1,
  totalPrice: number = 0,
  settings: PlatformSettings = DEFAULT_PLATFORM_SETTINGS
): number {
  const days = calculateRentalDays(startDate, endDate);
  const qty = Math.max(1, Number(quantity) || 1);

  const dailyMarkup = Number(settings.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily;
  const weeklyMarkupPerDay = Number(settings.markup_weekly_per_day) || 
    (settings.markup_weekly ? Math.round(Number(settings.markup_weekly) / 7) : DEFAULT_PLATFORM_SETTINGS.markup_weekly_per_day);
  const monthlyMarkupPerDay = Number(settings.markup_monthly_per_day) || 
    (settings.markup_monthly ? Math.round(Number(settings.markup_monthly) / 30) : DEFAULT_PLATFORM_SETTINGS.markup_monthly_per_day);

  let commission = 0;
  if (days >= 30) {
    commission = days * monthlyMarkupPerDay * qty;
  } else if (days >= 7) {
    commission = days * weeklyMarkupPerDay * qty;
  } else {
    commission = days * dailyMarkup * qty;
  }

  // Safety safeguard: commission should not exceed total price
  if (totalPrice > 0 && commission >= totalPrice) {
    commission = Math.min(commission, Math.round(totalPrice * 0.25));
  }

  return commission;
}
