import type { Metadata } from 'next';
import { fetchVendorDetailServer } from '@/lib/api/catalogService';
import VendorDetailClient from '@/components/VendorDetailClient';

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchVendorDetailServer(id);
  if (!data?.vendor) {
    return {
      title: 'Partner Scooter Rental Bali | THE BIKE RENTAL BALI',
      description: 'Verified scooter rental partner in Bali with hotel delivery and transparent daily rates.',
    };
  }

  const vendorName = data.vendor.name || 'Partner';
  const vendorAddress = data.vendor.address || 'Bali';

  return {
    title: `${vendorName} - Scooter Rental in ${vendorAddress} | THE BIKE RENTAL BALI`,
    description: `Rent scooters from ${vendorName} in ${vendorAddress}, Bali. Compare available fleet, check operating hours, delivery coverage, and 5.0 customer reviews.`,
    openGraph: {
      title: `${vendorName} - Scooter Rental in Bali`,
      description: `Rent scooters from ${vendorName} in Bali. Fast hotel & villa delivery.`,
      images: data.vendor.logo ? [{ url: data.vendor.logo }] : [],
    },
  };
}

export default async function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchVendorDetailServer(id);

  return (
    <VendorDetailClient
      id={id}
      initialVendor={data?.vendor || null}
      initialScooters={data?.scooters || []}
      initialReviews={data?.reviews || []}
      initialSettings={data?.settings}
    />
  );
}
