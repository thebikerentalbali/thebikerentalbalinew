import { MetadataRoute } from 'next';
import { getCatalogServerData } from '@/lib/api/catalogService';
import { SITE_URL } from '@/lib/seo/schemaGenerator';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const currentDate = new Date();

  // Static marketing & informative pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/partnerportal`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const catalog = await getCatalogServerData();
    const scooters = catalog?.scooters || [];
    const vendors = catalog?.vendors || [];

    // Dynamic scooter detail pages
    const scooterPages: MetadataRoute.Sitemap = scooters.map((scooter: any) => ({
      url: `${baseUrl}/detail/${scooter.id}`,
      lastModified: scooter.updated_at ? new Date(scooter.updated_at) : currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    // Dynamic vendor detail pages
    const vendorPages: MetadataRoute.Sitemap = vendors.map((vendor: any) => ({
      url: `${baseUrl}/vendor/${vendor.id}`,
      lastModified: vendor.updated_at ? new Date(vendor.updated_at) : currentDate,
      changeFrequency: 'daily',
      priority: 0.85,
    }));

    // Dynamic vendor custom vanity slug pages
    const vendorSlugPages: MetadataRoute.Sitemap = vendors
      .filter((vendor: any) => vendor.name)
      .map((vendor: any) => {
        const slug = vendor.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
        return {
          url: `${baseUrl}/${slug}`,
          lastModified: vendor.updated_at ? new Date(vendor.updated_at) : currentDate,
          changeFrequency: 'daily',
          priority: 0.8,
        };
      });

    return [...staticPages, ...scooterPages, ...vendorPages, ...vendorSlugPages];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return staticPages;
  }
}
