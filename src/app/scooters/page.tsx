import type { Metadata } from 'next';
import { getCatalogServerData } from '@/lib/api/catalogService';
import AllScootersClient from '@/components/AllScootersClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Scooters in Bali | Filter by Location, Brand & Price',
  description:
    'Browse all available Honda, Yamaha, Vespa, and Kawasaki scooters across Canggu, Seminyak, Ubud, Sanur, Kuta, and Uluwatu with transparent daily, weekly, and monthly rates.',
};

export default async function AllScootersPage() {
  const catalogData = await getCatalogServerData();

  return (
    <AllScootersClient
      initialVendors={catalogData?.vendors || []}
      initialScooters={catalogData?.scooters || []}
    />
  );
}
