import type { Metadata } from 'next';
import { fetchScooterDetailServer } from '@/lib/api/catalogService';
import ScooterDetailClient from '@/components/ScooterDetailClient';

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchScooterDetailServer(id);
  if (!data?.scooter) {
    return {
      title: 'Scooter Rental Bali | THE BIKE RENTAL BALI',
      description: 'Rent scooters across Bali with trusted local partners and doorstep delivery.',
    };
  }

  const scooterName = data.scooter.name || 'Scooter';
  const vendorName = data.vendor?.name || 'Trusted Partner';
  const price = data.scooter.price_daily ? `Rp ${data.scooter.price_daily.toLocaleString()}/day` : '';

  return {
    title: `${scooterName} Rental Bali | ${price} - THE BIKE RENTAL BALI`,
    description: `Rent ${scooterName} from ${vendorName} in Bali. Compare prices, delivery to Ubud, Canggu, Seminyak, Kuta, Uluwatu, Sanur with 2 helmets included.`,
    openGraph: {
      title: `${scooterName} Rental Bali | ${price}`,
      description: `Rent ${scooterName} in Bali with doorstep delivery. Verified local rental partner.`,
      images: [
        {
          url: data.scooter.image_url || '/icons/icon-512x512.png',
          alt: `${scooterName} in Bali`,
        },
      ],
    },
  };
}

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchScooterDetailServer(id);

  return (
    <ScooterDetailClient
      id={id}
      initialScooter={data?.scooter || null}
      initialVendor={data?.vendor || null}
      initialSettings={data?.settings}
    />
  );
}
