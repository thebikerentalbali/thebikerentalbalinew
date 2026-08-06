import { createClient } from '@/lib/supabase/client';

export type CampaignTheme = 'dark' | 'sunset' | 'ocean' | 'emerald' | 'violet' | 'amber';

export interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  discount_text?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  theme?: CampaignTheme;
  is_active: boolean;
  order?: number;
  created_at?: string;
}

export const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'default-promo-1',
    title: 'Explore Bali on Two Wheels',
    subtitle: 'Rent Honda, Yamaha & Vespa scooters with free doorstep delivery across Bali & 2 helmets included.',
    badge: '🔥 LIMITED PROMO',
    discount_text: 'SAVE UP TO 25% TODAY',
    cta_text: 'Rent Now',
    cta_link: '#all-scooters',
    image_url: '/images/scooter.png',
    theme: 'dark',
    is_active: true,
    order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-promo-2',
    title: 'Monthly Island Living Deal',
    subtitle: 'Staying 30+ days in Bali? Get VIP monthly rates with complimentary 24/7 roadside assistance & free swaps.',
    badge: '🌴 LONG TERM SPECIAL',
    discount_text: 'UP TO 40% OFF MONTHLY',
    cta_text: 'View Verified Fleet',
    cta_link: '#all-scooters',
    image_url: '/images/scooter.png',
    theme: 'ocean',
    is_active: true,
    order: 2,
    created_at: new Date().toISOString(),
  }
];

const STORAGE_KEY = 'tbrb_active_campaigns';

/**
 * Returns locally cached active campaigns or default campaign presets.
 */
export function getCampaigns(includeInactive = false): Campaign[] {
  if (typeof window === 'undefined') return DEFAULT_CAMPAIGNS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: Campaign[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return includeInactive ? parsed : parsed.filter(c => c.is_active !== false);
      }
    }
  } catch (e) {
    console.error('Failed to parse cached campaigns:', e);
  }
  return includeInactive ? DEFAULT_CAMPAIGNS : DEFAULT_CAMPAIGNS.filter(c => c.is_active);
}

/**
 * Fetches campaigns from Supabase database with automatic fallback to localStorage/defaults.
 */
export async function fetchCampaigns(includeInactive = false): Promise<Campaign[]> {
  const local = getCampaigns(includeInactive);
  if (typeof window === 'undefined') return local;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const remoteCampaigns: Campaign[] = data.map((item: any) => ({
        id: String(item.id),
        title: item.title || 'Special Rental Offer',
        subtitle: item.subtitle || '',
        badge: item.badge || 'PROMO',
        discount_text: item.discount_text || '',
        cta_text: item.cta_text || 'Rent Now',
        cta_link: item.cta_link || '#all-scooters',
        image_url: item.image_url || '/images/scooter.png',
        theme: (item.theme as CampaignTheme) || 'dark',
        is_active: item.is_active !== false,
        order: Number(item.order) || 0,
        created_at: item.created_at || new Date().toISOString(),
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteCampaigns));
      window.dispatchEvent(new Event('campaigns_updated'));

      return includeInactive ? remoteCampaigns : remoteCampaigns.filter(c => c.is_active);
    }
  } catch (e) {
    console.warn('Could not load campaigns from Supabase table, using local cache fallback:', e);
  }

  return local;
}

/**
 * Saves or updates a campaign in Supabase and local cache.
 */
export async function saveCampaign(campaign: Campaign): Promise<Campaign[]> {
  if (typeof window === 'undefined') return DEFAULT_CAMPAIGNS;

  const current = getCampaigns(true);
  const exists = current.some(c => c.id === campaign.id);
  const updatedList = exists
    ? current.map(c => c.id === campaign.id ? { ...c, ...campaign } : c)
    : [campaign, ...current];

  // Save to local storage immediately
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  window.dispatchEvent(new Event('campaigns_updated'));

  // Sync to Supabase in background
  try {
    const supabase = createClient();
    await supabase
      .from('campaigns')
      .upsert({
        id: campaign.id,
        title: campaign.title,
        subtitle: campaign.subtitle,
        badge: campaign.badge,
        discount_text: campaign.discount_text,
        cta_text: campaign.cta_text,
        cta_link: campaign.cta_link,
        image_url: campaign.image_url,
        theme: campaign.theme || 'dark',
        is_active: campaign.is_active,
        order: campaign.order || 0,
        updated_at: new Date().toISOString(),
      });
  } catch (err) {
    console.warn('Could not sync campaign to Supabase table:', err);
  }

  return updatedList;
}

/**
 * Deletes a campaign from Supabase and local cache.
 */
export async function deleteCampaign(id: string): Promise<Campaign[]> {
  if (typeof window === 'undefined') return DEFAULT_CAMPAIGNS;

  const current = getCampaigns(true);
  const updatedList = current.filter(c => c.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  window.dispatchEvent(new Event('campaigns_updated'));

  try {
    const supabase = createClient();
    await supabase.from('campaigns').delete().eq('id', id);
  } catch (err) {
    console.warn('Could not delete campaign from Supabase table:', err);
  }

  return updatedList;
}

/**
 * Subscribes to campaign updates across tabs and within the current session.
 */
export function subscribeToCampaigns(callback: (campaigns: Campaign[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => {
    callback(getCampaigns(false));
  };

  window.addEventListener('campaigns_updated', handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener('campaigns_updated', handler);
    window.removeEventListener('storage', handler);
  };
}
