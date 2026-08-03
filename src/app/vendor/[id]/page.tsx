"use client"

import { useParams } from 'next/navigation';
import { clientCache } from '@/lib/cache/clientCache';
import VendorDetailClient from '@/components/VendorDetailClient';

export default function VendorPage() {
  const params = useParams();
  const id = params?.id as string;

  const initialVendor = typeof window !== 'undefined' && id
    ? (clientCache.get<any>(`vendor_${id}`)?.vendor || clientCache.get<any>('catalog_data')?.vendors?.find((v: any) => v.id.toString() === id) || null)
    : null;

  const initialScooters = typeof window !== 'undefined' && id
    ? (clientCache.get<any>(`vendor_${id}`)?.scooters || clientCache.get<any>('catalog_data')?.scooters?.filter((s: any) => s.vendor_id?.toString() === id) || [])
    : [];

  return (
    <VendorDetailClient
      id={id}
      initialVendor={initialVendor}
      initialScooters={initialScooters}
      initialReviews={[]}
    />
  );
}
