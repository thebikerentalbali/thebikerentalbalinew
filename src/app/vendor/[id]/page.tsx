import { Metadata } from 'next';
import VendorDetailClient from '@/components/VendorDetailClient';
import { fetchVendorDetailServer } from '@/lib/api/catalogService';
import { getLocalBusinessSchema, getBreadcrumbSchema, SITE_URL, SITE_NAME } from '@/lib/seo/schemaGenerator';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchVendorDetailServer(id);
  const vendor = data?.vendor;

  if (!vendor) {
    return {
      title: 'Vendor Not Found | THE BIKE RENTAL BALI',
      description: 'The requested rental vendor profile is unavailable.',
    };
  }

  const title = `${vendor.name} - Scooter Rental Bali | Verified Fleet & Fast Delivery`;
  const description = `Rent trusted scooters from ${vendor.name} in Bali. Located at ${vendor.address || 'Bali'}. Operating hours: ${vendor.opening_hours || '08:00 AM – 20:00 PM'}. Book online with instant confirmation.`;
  const imageUrl = vendor.logo || vendor.image_url || `${SITE_URL}/icons/icon-512x512.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/vendor/${id}`,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: vendor.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${SITE_URL}/vendor/${id}`,
    },
  };
}

export default async function VendorPage({ params }: PageProps) {
  const { id } = await params;
  const data = await fetchVendorDetailServer(id);
  const vendor = data?.vendor;
  const scooters = data?.scooters || [];
  const reviews = data?.reviews || [];

  const localBusinessSchema = vendor
    ? getLocalBusinessSchema({
        name: vendor.name,
        description: `Verified scooter rental vendor in Bali. Serving ${vendor.delivery_area || vendor.address || 'Bali'}.`,
        url: `${SITE_URL}/vendor/${id}`,
        image: vendor.logo || vendor.image_url || `${SITE_URL}/icons/icon-512x512.png`,
        addressLocality: vendor.address || 'Bali',
        ratingValue: 5.0,
        reviewCount: reviews.length > 0 ? reviews.length : 45,
      })
    : null;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Vendors', url: '/#vendors' },
    { name: vendor?.name || 'Vendor Details', url: `/vendor/${id}` },
  ]);

  return (
    <>
      {localBusinessSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <VendorDetailClient
        id={id}
        initialVendor={vendor || null}
        initialScooters={scooters}
        initialReviews={reviews}
        initialSettings={data?.settings}
      />
    </>
  );
}
