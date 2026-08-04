import { Metadata } from 'next';
import ScooterDetailClient from '@/components/ScooterDetailClient';
import { fetchScooterDetailServer } from '@/lib/api/catalogService';
import { getProductSchema, getBreadcrumbSchema, SITE_URL, SITE_NAME } from '@/lib/seo/schemaGenerator';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchScooterDetailServer(id);
  const scooter = data?.scooter;
  const vendor = data?.vendor;

  if (!scooter) {
    return {
      title: 'Scooter Not Found | THE BIKE RENTAL BALI',
      description: 'The requested scooter listing is unavailable or has been removed.',
    };
  }

  const title = `Rent ${scooter.name} in Bali | From Rp ${(scooter.price_daily || 0).toLocaleString()} / day`;
  const description = `Rent a ${scooter.year ? `${scooter.year} ` : ''}${scooter.name} (${scooter.engine || '125cc'}) from ${vendor?.name || 'Verified Vendor'} in Bali. 2 helmets included, fast hotel delivery.`;
  const imageUrl = scooter.image_url || `${SITE_URL}/icons/icon-512x512.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/detail/${id}`,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: scooter.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${SITE_URL}/detail/${id}`,
    },
  };
}

export default async function DetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await fetchScooterDetailServer(id);
  const scooter = data?.scooter;
  const vendor = data?.vendor;

  const productSchema = scooter
    ? getProductSchema({
        name: scooter.name,
        description: `Rent ${scooter.name} (${scooter.engine || '125cc'}, ${scooter.year || '2024'}) in Bali from ${vendor?.name || 'Verified Vendor'}.`,
        image: scooter.image_url || `${SITE_URL}/icons/icon-512x512.png`,
        price: scooter.price_daily || 0,
        currency: 'IDR',
        url: `/detail/${id}`,
        brand: scooter.brand || 'Motorcycle',
        ratingValue: 5.0,
        reviewCount: 38,
      })
    : null;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Scooters', url: '/#scooters' },
    { name: scooter?.name || 'Scooter Details', url: `/detail/${id}` },
  ]);

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ScooterDetailClient
        id={id}
        initialScooter={scooter || null}
        initialVendor={vendor || null}
        initialSettings={data?.settings}
      />
    </>
  );
}
