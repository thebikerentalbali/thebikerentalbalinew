import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";
import AppSplashScreen from "@/components/AppSplashScreen";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import { getWebSiteSchema, getOrganizationSchema } from "@/lib/seo/schemaGenerator";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thebikerentalbali.com"),
  title: {
    default: "Scooter Rental Bali | Compare Prices, Trusted Vendors & Fast Delivery",
    template: "%s | THE BIKE RENTAL BALI"
  },
  description: "Compare trusted scooter rental companies across Bali. Book Honda, Yamaha and Vespa scooters with daily, weekly and monthly rentals. Fast delivery to Ubud, Canggu, Seminyak, Kuta, Sanur, Uluwatu, Nusa Dua, Jimbaran, Denpasar and across Bali.",
  applicationName: "THE BIKE RENTAL BALI",
  authors: [{ name: "THE BIKE RENTAL BALI" }],
  generator: "Next.js",
  keywords: [
    "Scooter Rental Bali",
    "Rent Scooter Bali",
    "Bali Scooter Rental",
    "Motorbike Rental Bali",
    "Motorcycle Rental Bali",
    "Scooter Hire Bali",
    "Best Scooter Rental Bali",
    "Trusted Scooter Rental Bali",
    "Premium Scooter Rental Bali",
    "Scooter Rental Marketplace Bali",
    "Compare Scooter Rental Bali",
    "Bali Scooter Booking",
    "Scooter Delivery Bali",
    "Weekly Scooter Rental Bali",
    "Monthly Scooter Rental Bali",
    "Daily Scooter Rental Bali",
    "Airport Scooter Rental Bali"
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vendor Portal",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "THE BIKE RENTAL BALI",
    title: "Scooter Rental Bali | Compare Prices, Trusted Vendors & Fast Delivery",
    description: "Compare trusted scooter rental companies across Bali. Book Honda, Yamaha and Vespa scooters with daily, weekly and monthly rentals.",
    url: "https://thebikerentalbali.com",
    locale: "en_US",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "THE BIKE RENTAL BALI - Scooter Rental Marketplace"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Scooter Rental Bali | Compare Prices, Trusted Vendors & Fast Delivery",
    description: "Compare trusted scooter rental companies across Bali. Book Honda, Yamaha and Vespa scooters with daily, weekly and monthly rentals.",
    images: ["/icons/icon-512x512.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = getWebSiteSchema();
  const organizationSchema = getOrganizationSchema();

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://runupdfoqyedncgqiday.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://runupdfoqyedncgqiday.supabase.co" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Vendor Portal" />
        <meta name="apple-mobile-web-app-title" content="Vendor Portal" />
        <meta name="theme-color" content="#000000" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <AppSplashScreen />
        <PWARegister />
        <main className="flex-1 w-full min-h-screen relative bg-[#F0F2F5]">
          {children}
        </main>
        <SpeedInsights />
      </body>
    </html>
  );
}
