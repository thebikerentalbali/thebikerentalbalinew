import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getLocationBySlug, BALI_LOCATIONS } from '@/lib/seo/locationsData';
import { getLocalBusinessSchema, getFAQSchema, getBreadcrumbSchema } from '@/lib/seo/schemaGenerator';
import { getCatalogServerData } from '@/lib/api/catalogService';
import LocationLandingView from '@/components/seo/LocationLandingView';

type Props = {
  params: Promise<{ vendorSlug: string }>;
};

export async function generateStaticParams() {
  return BALI_LOCATIONS.map((loc) => ({
    vendorSlug: loc.slug,
  }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { vendorSlug } = await props.params;

  // 1. Check if it is an SEO Location landing page
  const location = getLocationBySlug(vendorSlug);
  if (location) {
    return {
      title: location.title,
      description: location.metaDescription,
      alternates: {
        canonical: `https://thebikerentalbali.com/${location.slug}`,
      },
      openGraph: {
        title: location.title,
        description: location.metaDescription,
        url: `https://thebikerentalbali.com/${location.slug}`,
        siteName: 'THE BIKE RENTAL BALI',
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: 'https://thebikerentalbali.com/icons/icon-512x512.png',
            width: 512,
            height: 512,
            alt: `${location.name} Scooter Rental - THE BIKE RENTAL BALI`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: location.title,
        description: location.metaDescription,
        images: ['https://thebikerentalbali.com/icons/icon-512x512.png'],
      },
    };
  }

  // 2. Check if it matches a vendor slug
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name, logo')
    .eq('status', 'approved');

  if (vendors) {
    const vendor = vendors.find(
      (v) => v.name.toLowerCase().replace(/[^a-z0-9]+/g, '') === vendorSlug
    );
    if (vendor) {
      return {
        title: `${vendor.name} - Premium Scooter Rental in Bali`,
        description: `Rent a scooter from ${vendor.name}. High-quality bikes and verified service in Bali.`,
        openGraph: {
          title: vendor.name,
          description: `Rent a scooter from ${vendor.name} in Bali.`,
          images: vendor.logo ? [vendor.logo] : [],
        },
      };
    }
  }

  return {
    title: 'Page Not Found | THE BIKE RENTAL BALI',
    description: 'The requested page could not be found.',
  };
}

export default async function DynamicSlugPage(props: Props) {
  const { vendorSlug } = await props.params;

  // 1. Handle Location Landing Page
  const location = getLocationBySlug(vendorSlug);
  if (location) {
    const catalogData = await getCatalogServerData();
    const localBusinessSchema = getLocalBusinessSchema({
      name: `Scooter Rental ${location.name}`,
      description: location.metaDescription,
      addressLocality: location.name,
      url: `https://thebikerentalbali.com/${location.slug}`,
    });
    const faqSchema = getFAQSchema(location.localFaqs || []);
    const breadcrumbSchema = getBreadcrumbSchema([
      { name: 'Home', url: 'https://thebikerentalbali.com' },
      { name: 'Locations', url: 'https://thebikerentalbali.com' },
      { name: location.name, url: `https://thebikerentalbali.com/${location.slug}` },
    ]);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
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
        <LocationLandingView
          location={location}
          scooters={catalogData?.scooters || []}
          vendors={catalogData?.vendors || []}
        />
      </>
    );
  }

  // 2. Handle Vendor Profile Redirect
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name')
    .eq('status', 'approved');

  if (vendors) {
    const vendor = vendors.find(
      (v) => v.name.toLowerCase().replace(/[^a-z0-9]+/g, '') === vendorSlug
    );
    if (vendor) {
      redirect(`/vendor/${vendor.id}`);
    }
  }

  notFound();
}
