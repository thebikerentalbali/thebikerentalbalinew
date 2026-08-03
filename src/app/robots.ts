import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://thebikerentalbali.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/partnerportal/dashboard',
          '/partnerportal/bookings',
          '/partnerportal/fleet',
          '/partnerportal/calendar',
          '/partnerportal/settings',
          '/api/',
          '/admin',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/partnerportal/dashboard',
          '/partnerportal/bookings',
          '/partnerportal/fleet',
          '/partnerportal/calendar',
          '/partnerportal/settings',
          '/api/',
          '/admin',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
