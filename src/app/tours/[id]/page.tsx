import type { Metadata } from 'next';
import { fetchCampaignByIdServer } from '@/lib/api/catalogService';
import TourDetailClient from '@/components/TourDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tour = await fetchCampaignByIdServer(decodeURIComponent(id));
  if (!tour) {
    return {
      title: 'Scooter Tour Details | THE BIKE RENTAL BALI',
    };
  }
  return {
    title: `${tour.title} | Scooter Tour Bali`,
    description:
      tour.subtitle ||
      `Explore Bali on a guided scooter tour with ${tour.partner_name || 'The Bike Rental Bali'}.`,
  };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const initialTour = await fetchCampaignByIdServer(decodedId);

  return <TourDetailClient id={decodedId} initialTour={initialTour} />;
}
