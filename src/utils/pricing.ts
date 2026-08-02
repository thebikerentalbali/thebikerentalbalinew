export interface PlatformSettings {
  markup_daily: number;    // IDR markup added per day
  markup_weekly: number;   // IDR markup added per week
  markup_monthly: number;  // IDR markup added per month
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  markup_daily: 25000,
  markup_weekly: 150000,
  markup_monthly: 500000,
};

const STORAGE_KEY = 'platform_commission_settings';

export function getPlatformSettings(): PlatformSettings {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        markup_daily: Number(parsed.markup_daily) || DEFAULT_PLATFORM_SETTINGS.markup_daily,
        markup_weekly: Number(parsed.markup_weekly) || DEFAULT_PLATFORM_SETTINGS.markup_weekly,
        markup_monthly: Number(parsed.markup_monthly) || DEFAULT_PLATFORM_SETTINGS.markup_monthly,
      };
    }
  } catch (e) {
    console.error('Failed to get platform settings:', e);
  }
  return DEFAULT_PLATFORM_SETTINGS;
}

export function savePlatformSettings(settings: PlatformSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('platform_settings_updated'));
  } catch (e) {
    console.error('Failed to save platform settings:', e);
  }
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
  const daily = vendorNetDaily + settings.markup_daily;
  const weekly = (vendorNetWeekly && vendorNetWeekly > 0)
    ? vendorNetWeekly + settings.markup_weekly
    : (vendorNetDaily + settings.markup_daily) * 6;
  const monthly = (vendorNetMonthly && vendorNetMonthly > 0)
    ? vendorNetMonthly + settings.markup_monthly
    : (vendorNetDaily + settings.markup_daily) * 20;

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
  let commission = 0;

  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    commission = (months * settings.markup_monthly + remDays * settings.markup_daily) * qty;
  } else if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remDays = days % 7;
    commission = (weeks * settings.markup_weekly + remDays * settings.markup_daily) * qty;
  } else {
    commission = (days * settings.markup_daily) * qty;
  }

  // Safety safeguard: commission should not exceed total price
  if (totalPrice > 0 && commission >= totalPrice) {
    commission = Math.min(commission, Math.round(totalPrice * 0.25));
  }

  return commission;
}
