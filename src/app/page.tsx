import { getCatalogServerData } from '@/lib/api/catalogService';
import HomeClient from '@/components/HomeClient';

export const revalidate = 30;

export default async function Page() {
  const catalogData = await getCatalogServerData();

  return (
    <HomeClient
      initialVendors={catalogData?.vendors || []}
      initialScooters={catalogData?.scooters || []}
      initialSettings={catalogData?.settings}
    />
  );
}
