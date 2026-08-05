import type { Metadata } from 'next';
import { getCatalogServerData } from '@/lib/api/catalogService';
import HomeClient from '@/components/HomeClient';
import { getLocalBusinessSchema, getFAQSchema } from '@/lib/seo/schemaGenerator';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Scooter Rental Bali | Compare Prices, Trusted Vendors & Fast Delivery',
  description: 'Compare trusted scooter rental companies across Bali. Book Honda, Yamaha and Vespa scooters with daily, weekly and monthly rentals. Fast delivery to Ubud, Canggu, Seminyak, Kuta, Sanur, Uluwatu, Nusa Dua, Jimbaran, Denpasar and across Bali.',
  alternates: {
    canonical: 'https://thebikerentalbali.com',
  },
  openGraph: {
    title: 'Scooter Rental Bali | Compare Prices, Trusted Vendors & Fast Delivery',
    description: 'Compare trusted scooter rental companies across Bali. Book Honda, Yamaha and Vespa scooters with daily, weekly and monthly rentals. Fast delivery to Ubud, Canggu, Seminyak, Kuta, Sanur, Uluwatu, Nusa Dua, Jimbaran, Denpasar and across Bali.',
    url: 'https://thebikerentalbali.com',
    siteName: 'THE BIKE RENTAL BALI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://thebikerentalbali.com/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'THE BIKE RENTAL BALI - Scooter Rental Marketplace'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scooter Rental Bali | Compare Prices, Trusted Vendors & Fast Delivery',
    description: 'Compare trusted scooter rental companies across Bali. Book Honda, Yamaha and Vespa scooters with daily, weekly and monthly rentals.',
    images: ['https://thebikerentalbali.com/icons/icon-512x512.png']
  }
};

const HOMEPAGE_FAQS = [
  {
    question: 'How does THE BIKE RENTAL BALI marketplace work?',
    answer: 'THE BIKE RENTAL BALI is Bali\'s trusted scooter rental marketplace where travelers can compare verified local rental companies, scooter models, real-time prices, customer reviews, and delivery options all in one place.'
  },
  {
    question: 'What is the average cost of renting a scooter in Bali?',
    answer: 'Daily rental rates range from IDR 75,000 to IDR 95,000 for standard automatic scooters (Honda Scoopy, Vario) and IDR 130,000 to IDR 180,000 for maxi touring scooters (Yamaha NMAX, Honda PCX, ADV). Weekly and monthly rates offer substantial discounts up to 40%.'
  },
  {
    question: 'Where can I get a scooter delivered in Bali?',
    answer: 'Our verified vendors provide fast doorstep delivery to hotels, villas, and resorts across Ubud, Canggu, Seminyak, Kuta, Legian, Sanur, Uluwatu, Jimbaran, Nusa Dua, Berawa, Pererenan, and directly at Bali Ngurah Rai Airport (DPS).'
  },
  {
    question: 'What documents are required to rent a scooter in Bali?',
    answer: 'You will need a valid passport copy, your national driver\'s license, and an International Driving Permit (IDP) with motorcycle endorsement. Booking online through our marketplace protects you without needing to leave a physical passport as collateral.'
  }
];

export default async function Page() {
  const catalogData = await getCatalogServerData();
  const localBusinessSchema = getLocalBusinessSchema();
  const faqSchema = getFAQSchema(HOMEPAGE_FAQS);

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
      <HomeClient
        initialVendors={catalogData?.vendors || []}
        initialScooters={catalogData?.scooters || []}
        initialSettings={catalogData?.settings}
      />
    </>
  );
}
