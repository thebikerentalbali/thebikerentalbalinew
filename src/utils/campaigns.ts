import { createClient } from '@/lib/supabase/client';

export type CampaignCategory = 'spa' | 'video' | 'tour' | 'scooter' | 'dining' | 'custom';
export type CampaignTheme = 'dark' | 'sunset' | 'ocean' | 'emerald' | 'violet' | 'amber';

export interface TourItineraryStop {
  time: string;
  title: string;
  location?: string;
  description: string;
}

export interface TourDetails {
  price: number;
  price_unit?: string;
  duration?: string;
  meeting_point?: string;
  includes?: string[];
  itinerary: TourItineraryStop[];
}

export const DEFAULT_TOUR_DETAILS: TourDetails = {
  price: 350000,
  price_unit: 'per rider',
  duration: 'Full Day (8 Hours)',
  meeting_point: 'Hotel / Villa Pickup (Canggu, Seminyak, Ubud)',
  includes: ['Scooter & 2 Helmets', 'Local Guide', 'Full Fuel Tank', 'Bottled Water'],
  itinerary: [
    {
      time: '08:30 AM',
      title: 'Hotel Pickup & Briefing',
      location: 'Canggu / Seminyak',
      description: 'Meet your guide, get fitted with helmets, and review the scenic route.',
    },
    {
      time: '10:00 AM',
      title: 'Tegenungan Waterfall Stop',
      location: 'Gianyar, Ubud',
      description: 'Ride through lush village roads to swim and take photos at the waterfall.',
    },
    {
      time: '12:30 PM',
      title: 'Tegalalang Rice Terraces & Lunch',
      location: 'Ubud',
      description: 'Enjoy scenic valley views and an authentic Balinese lunch stop.',
    },
  ],
};

const TOUR_JSON_PREFIX = 'TOUR_JSON:';

/**
 * Parses serialized scooter tour details from hero_overlay_text.
 */
export function parseTourDetails(raw?: string | null): TourDetails | undefined {
  if (!raw || typeof raw !== 'string' || !raw.startsWith(TOUR_JSON_PREFIX)) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw.slice(TOUR_JSON_PREFIX.length));
    if (!parsed || typeof parsed !== 'object') return undefined;
    return {
      price: Number(parsed.price) || 0,
      price_unit: typeof parsed.price_unit === 'string' ? parsed.price_unit : 'per rider',
      duration: typeof parsed.duration === 'string' ? parsed.duration : '',
      meeting_point: typeof parsed.meeting_point === 'string' ? parsed.meeting_point : '',
      includes: Array.isArray(parsed.includes) ? parsed.includes.filter(Boolean).map(String) : [],
      itinerary: Array.isArray(parsed.itinerary)
        ? parsed.itinerary.map((stop: any) => ({
            time: String(stop?.time || ''),
            title: String(stop?.title || ''),
            location: stop?.location ? String(stop.location) : '',
            description: String(stop?.description || ''),
          }))
        : [],
    };
  } catch {
    return undefined;
  }
}

/**
 * Serializes scooter tour details into hero_overlay_text for zero-migration DB persistence.
 */
export function serializeTourDetails(details?: TourDetails): string {
  if (!details) return '';
  return `${TOUR_JSON_PREFIX}${JSON.stringify(details)}`;
}

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
  tour_details?: TourDetails;
}

/**
 * Maps a raw Supabase campaigns row into a typed Campaign object.
 */
export function mapCampaignRow(item: any): Campaign {
  const category = (item.category as CampaignCategory) || 'scooter';
  const heroOverlay = item.hero_overlay_text || '';
  const tourDetails = item.tour_details || parseTourDetails(heroOverlay);
  return {
    id: String(item.id),
    title: item.title || 'Special Campaign',
    subtitle: item.subtitle || '',
    category,
    partner_name: item.partner_name || '',
    partner_logo_url: item.partner_logo_url || '',
    video_url: item.video_url || '',
    youtube_id: item.youtube_id || extractYouTubeId(item.video_url) || '',
    hero_overlay_text: heroOverlay,
    badge: item.badge || '',
    discount_text: item.discount_text || '',
    voucher_code: item.voucher_code || '',
    partner_whatsapp: item.partner_whatsapp || '',
    partner_location: item.partner_location || '',
    voucher_terms: item.voucher_terms || '',
    cta_text:
      item.cta_text ||
      (category === 'spa' ? 'Book Now' : category === 'tour' ? 'View Tour & Itinerary' : 'Learn More'),
    cta_link: item.cta_link || '',
    image_url: item.image_url || '',
    theme: (item.theme as CampaignTheme) || 'dark',
    is_active: item.is_active !== false,
    order: Number(item.order) || 0,
    created_at: item.created_at || new Date().toISOString(),
    tour_details: tourDetails,
  };
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

/**
 * Resolves a campaign CTA link cleanly and marks whether it opens an external website.
 */
export function resolveCampaignLink(link?: string): { href: string; isExternal: boolean } | null {
  if (!link) return null;
  const trimmed = link.trim();
  if (!trimmed || trimmed === '#claim-voucher') return null;

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return null;
  }

  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return { href: trimmed, isExternal: false };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return { href: trimmed, isExternal: true };
  }

  return { href: `https://${trimmed}`, isExternal: true };
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
 * Returns locally cached campaigns without reviving removed/mock presets.
 */
export function getCampaigns(includeInactive = false): Campaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const mapped = parsed.map(mapCampaignRow);
        return includeInactive ? mapped : mapped.filter(c => c.is_active !== false);
      }
    }
  } catch (e) {
    console.error('Failed to parse cached campaigns:', e);
  }
  return [];
}

/**
 * Fetches campaigns from Supabase database (authoritative even when empty).
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

    if (!error && Array.isArray(data)) {
      const remoteCampaigns: Campaign[] = data.map(mapCampaignRow);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteCampaigns));
      } catch {}
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
  const resolvedLink = resolveCampaignLink(campaign.cta_link);
  const serializedHeroOverlay =
    campaign.category === 'tour' && campaign.tour_details
      ? serializeTourDetails(campaign.tour_details)
      : campaign.hero_overlay_text || '';
  const campaignToSave: Campaign = {
    ...campaign,
    hero_overlay_text: serializedHeroOverlay,
    cta_link: resolvedLink ? resolvedLink.href : '',
    image_url: campaign.image_url || '',
    youtube_id: resolvedYoutubeId,
  };

  const current = getCampaigns(true);
  const exists = current.some(c => c.id === campaignToSave.id);
  const updatedList = exists
    ? current.map(c => c.id === campaignToSave.id ? { ...c, ...campaignToSave } : c)
    : [campaignToSave, ...current];

  // Save to local storage safely (never block publishing if storage quota is full)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (storageErr) {
    console.warn('Skipping local campaign cache write due to storage limit:', storageErr);
  }
  window.dispatchEvent(new Event('campaigns_updated'));

  // Sync to Supabase
  const supabase = createClient();
  const { error } = await supabase
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
      cta_text:
        campaignToSave.cta_text ||
        (campaignToSave.category === 'spa'
          ? 'Book Now'
          : campaignToSave.category === 'tour'
          ? 'View Tour & Itinerary'
          : 'Learn More'),
      cta_link: campaignToSave.cta_link || '',
      image_url: campaignToSave.image_url || '',
      theme: campaignToSave.theme || 'dark',
      is_active: campaignToSave.is_active,
      order: campaignToSave.order || 0,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(error.message || 'Failed to save campaign to database');
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
