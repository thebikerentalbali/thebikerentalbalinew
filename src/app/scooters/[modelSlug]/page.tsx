import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getScooterModelBySlug, SCOOTER_MODELS } from '@/lib/seo/scooterModelsData';
import { getProductSchema, getFAQSchema, getBreadcrumbSchema } from '@/lib/seo/schemaGenerator';
import { getCatalogServerData } from '@/lib/api/catalogService';
import ScooterModelView from '@/components/seo/ScooterModelView';

type Props = {
  params: Promise<{ modelSlug: string }>;
};

export async function generateStaticParams() {
  return SCOOTER_MODELS.map((model) => ({
    modelSlug: model.slug,
  }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { modelSlug } = await props.params;
  const model = getScooterModelBySlug(modelSlug);

  if (!model) {
    return {
      title: 'Scooter Not Found | THE BIKE RENTAL BALI',
      description: 'The requested scooter model could not be found.',
    };
  }

  return {
    title: model.title,
    description: model.metaDescription,
    alternates: {
      canonical: `https://thebikerentalbali.com/scooters/${model.slug}`,
    },
    openGraph: {
      title: model.title,
      description: model.metaDescription,
      url: `https://thebikerentalbali.com/scooters/${model.slug}`,
      siteName: 'THE BIKE RENTAL BALI',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: 'https://thebikerentalbali.com/icons/icon-512x512.png',
          width: 512,
          height: 512,
          alt: `${model.name} Rental Bali - THE BIKE RENTAL BALI`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: model.title,
      description: model.metaDescription,
      images: ['https://thebikerentalbali.com/icons/icon-512x512.png'],
    },
  };
}

export default async function ScooterModelPage(props: Props) {
  const { modelSlug } = await props.params;
  const model = getScooterModelBySlug(modelSlug);

  if (!model) {
    notFound();
  }

  const catalogData = await getCatalogServerData();
  const productSchema = getProductSchema({
    name: `${model.name} Rental Bali`,
    description: model.metaDescription,
    image: 'https://thebikerentalbali.com/icons/icon-512x512.png',
    price: 80000,
    url: `/scooters/${model.slug}`,
    brand: model.brand,
    ratingValue: 5.0,
    reviewCount: 42,
  });
  const faqSchema = getFAQSchema(model.faqs || []);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://thebikerentalbali.com' },
    { name: 'Scooters', url: 'https://thebikerentalbali.com/scooters' },
    { name: model.name, url: `https://thebikerentalbali.com/scooters/${model.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <ScooterModelView
        model={model}
        scooters={catalogData?.scooters || []}
      />
    </>
  );
}
