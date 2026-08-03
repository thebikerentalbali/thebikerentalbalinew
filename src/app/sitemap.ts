import { MetadataRoute } from 'next';
import { BALI_LOCATIONS } from '@/lib/seo/locationsData';
import { SCOOTER_MODELS } from '@/lib/seo/scooterModelsData';
import { BLOG_ARTICLES } from '@/lib/seo/blogArticlesData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thebikerentalbali.com';
  const currentDate = new Date().toISOString();

  // 1. Core Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/scooters`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/partnerportal`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 2. All 26 Bali Location Landing Pages
  const locationPages: MetadataRoute.Sitemap = BALI_LOCATIONS.map((loc) => ({
    url: `${baseUrl}/${loc.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. All 9 Scooter Model Pages
  const modelPages: MetadataRoute.Sitemap = SCOOTER_MODELS.map((model) => ({
    url: `${baseUrl}/scooters/${model.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. All 10 Blog Guides
  const blogPages: MetadataRoute.Sitemap = BLOG_ARTICLES.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: article.publishDate || currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...locationPages, ...modelPages, ...blogPages];
}
