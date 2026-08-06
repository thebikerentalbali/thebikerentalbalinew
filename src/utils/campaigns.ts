import { createClient } from '@/lib/supabase/client';

export type CampaignCategory = 'spa' | 'video' | 'tour' | 'scooter' | 'dining' | 'custom';
export type CampaignTheme = 'dark' | 'sunset' | 'ocean' | 'emerald' | 'violet' | 'amber';

export interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  category?: CampaignCategory;
  partner_name?: string;
  partner_logo_url?: string;
  video_url?: string;
  youtube_id?: string;
  hero_overlay_text?: string;
  badge?: string;
  discount_text?: string;
  voucher_code?: string;
  partner_whatsapp?: string;
  partner_location?: string;
  voucher_terms?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  theme?: CampaignTheme;
  is_active: boolean;
  order?: number;
  created_at?: string;
}

/**
 * Extracts the YouTube Video ID from various YouTube URL formats.
 */
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const cleaned = url.trim();
  if (cleaned.length === 11 && !cleaned.includes('/') && !cleaned.includes('?')) {
    return cleaned;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = cleaned.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'default-spa-collaboration',
    title: 'Exclusive Spa & Wellness Collaboration',
    partner_name: 'Sanctuary Spa & Massage Bali',
    partner_logo_url: undefined,
    category: 'spa',
    subtitle: 'Show your scooter rental booking confirmation to claim 25% off all traditional Balinese massage & body scrub treatments.',
    badge: '💆 25% SPA DISCOUNT',
    discount_text: 'EXCLUSIVE FOR OUR RIDERS',
    voucher_code: 'BALIRIDER25',
    partner_whatsapp: '6281234567890',
    partner_location: 'Seminyak, Canggu & Ubud, Bali',
    voucher_terms: 'Valid with any active scooter booking confirmation. Present voucher code upon arrival.',
    hero_overlay_text: 'RELAX & RECHARGE',
    cta_text: 'Claim Spa Voucher',
    cta_link: '#claim-voucher',
    image_url: '/images/scooter.png',
    theme: 'sunset',
    is_active: true,
    order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-travel-guide-video',
    title: 'Bali Travel Guide | Best Places & Scenic Routes',
    partner_name: 'Bali Head Tour',
    partner_logo_url: undefined,
    category: 'video',
    subtitle: 'Experience Bali through its culture, secret waterfalls, and scenic mountain roads. Watch our ultimate rider guide.',
    badge: '🎥 ISLAND GUIDE',
    discount_text: 'TOP HIDDEN SPOTS',
    video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    youtube_id: 'ScMzIvxBSi4',
    hero_overlay_text: 'EXPLORE the island of God',
    cta_text: 'Watch Video Guide',
    cta_link: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    partner_location: 'Bali, Indonesia',
    image_url: '/images/scooter.png',
    theme: 'dark',
    is_active: true,
    order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-scooter-promo',
    title: 'Explore Bali on Two Wheels',
    partner_name: 'The Bike Rental Bali',
    partner_logo_url: '/images/scooter.png',
    category: 'scooter',
    subtitle: 'Rent Honda, Yamaha & Vespa scooters with free doorstep delivery across Bali & 2 helmets included.',
    badge: '🔥 LIMITED PROMO',
    discount_text: 'SAVE UP TO 25% TODAY',
    hero_overlay_text: 'RIDE WITH FREEDOM',
    cta_text: 'Rent Now',
    cta_link: '#all-scooters',
    partner_location: 'All Bali Delivery',
    image_url: '/images/scooter.png',
    theme: 'ocean',
    is_active: true,
    order: 3,
    created_at: new Date().toISOString(),
  }
];

const STORAGE_KEY = 'tbrb_active_campaigns_v2';

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
        title: item.title || 'Special Campaign',
        subtitle: item.subtitle || '',
        category: (item.category as CampaignCategory) || 'scooter',
        partner_name: item.partner_name || '',
        partner_logo_url: item.partner_logo_url || '',
        video_url: item.video_url || '',
        youtube_id: item.youtube_id || extractYouTubeId(item.video_url) || '',
        hero_overlay_text: item.hero_overlay_text || '',
        badge: item.badge || 'PROMO',
        discount_text: item.discount_text || '',
        voucher_code: item.voucher_code || '',
        partner_whatsapp: item.partner_whatsapp || '',
        partner_location: item.partner_location || '',
        voucher_terms: item.voucher_terms || '',
        cta_text: item.cta_text || 'Learn More',
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

  const resolvedYoutubeId = campaign.youtube_id || extractYouTubeId(campaign.video_url) || '';
  const campaignToSave: Campaign = {
    ...campaign,
    youtube_id: resolvedYoutubeId,
  };

  const current = getCampaigns(true);
  const exists = current.some(c => c.id === campaignToSave.id);
  const updatedList = exists
    ? current.map(c => c.id === campaignToSave.id ? { ...c, ...campaignToSave } : c)
    : [campaignToSave, ...current];

  // Save to local storage immediately
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  window.dispatchEvent(new Event('campaigns_updated'));

  // Sync to Supabase in background
  try {
    const supabase = createClient();
    await supabase
      .from('campaigns')
      .upsert({
        id: campaignToSave.id,
        title: campaignToSave.title,
        subtitle: campaignToSave.subtitle,
        category: campaignToSave.category || 'scooter',
        partner_name: campaignToSave.partner_name || '',
        partner_logo_url: campaignToSave.partner_logo_url || '',
        video_url: campaignToSave.video_url || '',
        youtube_id: campaignToSave.youtube_id || '',
        hero_overlay_text: campaignToSave.hero_overlay_text || '',
        badge: campaignToSave.badge || '',
        discount_text: campaignToSave.discount_text || '',
        voucher_code: campaignToSave.voucher_code || '',
        partner_whatsapp: campaignToSave.partner_whatsapp || '',
        partner_location: campaignToSave.partner_location || '',
        voucher_terms: campaignToSave.voucher_terms || '',
        cta_text: campaignToSave.cta_text || 'Learn More',
        cta_link: campaignToSave.cta_link || '#all-scooters',
        image_url: campaignToSave.image_url || '/images/scooter.png',
        theme: campaignToSave.theme || 'dark',
        is_active: campaignToSave.is_active,
        order: campaignToSave.order || 0,
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
