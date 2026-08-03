export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://thebikerentalbali.com';
export const SITE_NAME = 'THE BIKE RENTAL BALI';

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: ['The Bike Rental Bali', 'TBRB', 'TheBikeRentalBali'],
    url: SITE_URL,
    description: 'Bali\'s premier scooter rental marketplace. Compare verified rental companies, scooter models, prices, and fast delivery across Bali.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: 'en-US'
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icons/icon-512x512.png`,
      width: 512,
      height: 512
    },
    image: `${SITE_URL}/icons/icon-512x512.png`,
    description: 'Trusted scooter rental marketplace in Bali connecting travelers with verified local rental vendors.',
    email: 'thebikerentalbali@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ubud',
      addressRegion: 'Bali',
      addressCountry: 'ID'
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Bali'
    },
    sameAs: [
      'https://www.instagram.com/thebikerentalbali',
      'https://facebook.com/thebikerentalbali'
    ]
  };
}

export function getLocalBusinessSchema(options?: {
  name?: string;
  description?: string;
  url?: string;
  image?: string;
  addressLocality?: string;
  ratingValue?: number;
  reviewCount?: number;
  priceRange?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    '@id': `${options?.url || SITE_URL}/#autorental`,
    name: options?.name ? `${options.name} - ${SITE_NAME}` : SITE_NAME,
    alternateName: SITE_NAME,
    url: options?.url || SITE_URL,
    image: options?.image || `${SITE_URL}/icons/icon-512x512.png`,
    description: options?.description || 'Compare trusted scooter rental companies across Bali. Book Honda, Yamaha and Vespa scooters with daily, weekly and monthly rentals.',
    priceRange: options?.priceRange || 'IDR 70,000 - IDR 350,000 / day',
    currenciesAccepted: 'IDR, USD, EUR, AUD',
    paymentAccepted: 'Credit Card, Debit Card, QRIS, Bank Transfer',
    areaServed: [
      'Ubud', 'Canggu', 'Seminyak', 'Kuta', 'Legian', 'Sanur', 
      'Uluwatu', 'Jimbaran', 'Nusa Dua', 'Denpasar', 'Kerobokan', 'Pererenan'
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: options?.addressLocality || 'Bali',
      addressRegion: 'Bali',
      addressCountry: 'ID'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -8.5069,
      longitude: 115.2625
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: options?.ratingValue || 5.0,
      reviewCount: options?.reviewCount || 148,
      bestRating: 5,
      worstRating: 1
    }
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
    }))
  };
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function getProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  url: string;
  brand?: string;
  ratingValue?: number;
  reviewCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Motorcycle'
    },
    offers: {
      '@type': 'Offer',
      url: product.url.startsWith('http') ? product.url : `${SITE_URL}${product.url}`,
      priceCurrency: product.currency || 'IDR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.ratingValue || 5.0,
      reviewCount: product.reviewCount || 38,
      bestRating: 5,
      worstRating: 1
    }
  };
}

export function getArticleSchema(article: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  authorName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${article.slug}`
    },
    headline: article.title,
    description: article.description,
    image: article.image || `${SITE_URL}/icons/icon-512x512.png`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Organization',
      name: article.authorName || SITE_NAME,
      url: SITE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon-512x512.png`
      }
    }
  };
}
