import { Metadata } from 'next';
import { fetchScooterDetail } from '@/lib/api/catalogService';
import { getProductSchema, getBreadcrumbSchema } from '@/lib/seo/schemaGenerator';
import DetailClientView from '@/components/DetailClientView';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  try {
    const data = await fetchScooterDetail(id);
    if (data?.scooter) {
      const scooter = data.scooter;
      const vendor = data.vendor;
      const title = `${scooter.name} Rental Bali | Rp ${Number(scooter.price_daily || 0).toLocaleString()}/day`;
      const description = `Rent ${scooter.name} in Bali from verified partner ${vendor?.name || 'THE BIKE RENTAL BALI'}. Includes free delivery, sanitized helmets, phone mount & 24/7 roadside support.`;

      return {
        title,
        description,
        alternates: {
          canonical: `https://thebikerentalbali.com/detail/${scooter.id}`,
        },
        openGraph: {
          title,
          description,
          url: `https://thebikerentalbali.com/detail/${scooter.id}`,
          siteName: 'THE BIKE RENTAL BALI',
          locale: 'en_US',
          type: 'website',
          images: [
            {
              url: scooter.image_url || scooter.img || 'https://thebikerentalbali.com/icons/icon-512x512.png',
              width: 600,
              height: 450,
              alt: `${scooter.name} Scooter Rental Bali`,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [scooter.image_url || scooter.img || 'https://thebikerentalbali.com/icons/icon-512x512.png'],
        },
      };
    }
  } catch (e) {
    console.error('Error generating metadata for scooter detail:', e);
  }

  return {
    title: 'Scooter Details | THE BIKE RENTAL BALI',
    description: 'Rent top-quality scooters in Bali with free delivery, helmets, and verified partners.',
  };
}

export default async function DetailPage(props: Props) {
  const { id } = await props.params;
  let initialScooter = null;
  let initialVendor = null;
  let productSchema = null;
  let breadcrumbSchema = null;

  try {
    const data = await fetchScooterDetail(id);
    if (data?.scooter) {
      initialScooter = data.scooter;
      initialVendor = data.vendor;

      productSchema = getProductSchema({
        name: `${initialScooter.name} Rental Bali`,
        description: `Rent ${initialScooter.name} (${initialScooter.year || '2024'}) in Bali. Available with verified partner ${initialVendor?.name || 'Local Partner'}.`,
        image: initialScooter.image_url || initialScooter.img || 'https://thebikerentalbali.com/icons/icon-512x512.png',
        price: Number(initialScooter.price_daily) || 80000,
        url: `/detail/${initialScooter.id}`,
        brand: initialScooter.brand || 'Honda',
        ratingValue: 5.0,
        reviewCount: 28,
      });

      breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://thebikerentalbali.com' },
        { name: 'Scooters', url: 'https://thebikerentalbali.com/scooters' },
        { name: initialScooter.name, url: `https://thebikerentalbali.com/detail/${initialScooter.id}` },
      ]);
    }
  } catch (e) {
    console.error('Error loading detail server data:', e);
  }

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
      )}
      <DetailClientView
        id={id}
        initialScooter={initialScooter}
        initialVendor={initialVendor}
      />
    </>
  );
}
