import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { getCatalogServerData } from "@/lib/api/catalogService";
import { SITE_NAME, SITE_URL } from "@/lib/seo/schemaGenerator";

interface PageProps {
  params: Promise<{ vendorSlug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vendorSlug } = await params;
  const catalog = await getCatalogServerData();
  const vendors = catalog.vendors || [];

  const vendor = vendors.find(
    (v: any) => v.name?.toLowerCase().replace(/[^a-z0-9]+/g, '') === vendorSlug.toLowerCase()
  );

  if (vendor) {
    const title = `${vendor.name} - Scooter Rental Bali | ${SITE_NAME}`;
    const description = `Rent top-rated scooters from ${vendor.name} in Bali. Fast delivery, 24/7 support, and verified fleet.`;
    const imageUrl = vendor.logo || vendor.image_url || `${SITE_URL}/icons/icon-512x512.png`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/${vendorSlug}`,
        siteName: SITE_NAME,
        images: [
          {
            url: imageUrl,
            width: 512,
            height: 512,
            alt: vendor.name,
          },
        ],
      },
      twitter: {
        card: "summary",
        title,
        description,
        images: [imageUrl],
      },
    };
  }

  return {
    title: `Vendor Not Found | ${SITE_NAME}`,
    description: "The requested vendor profile could not be found.",
  };
}

export default async function VendorSlugPage({ params }: PageProps) {
  const { vendorSlug } = await params;
  const catalog = await getCatalogServerData();
  const vendors = catalog.vendors || [];

  const vendor = vendors.find(
    (v: any) => v.name?.toLowerCase().replace(/[^a-z0-9]+/g, '') === vendorSlug.toLowerCase()
  );

  if (vendor) {
    redirect(`/vendor/${vendor.id}`);
  }

  notFound();
}
