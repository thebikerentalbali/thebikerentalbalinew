import { Metadata } from 'next';
import Link from 'next/link';
import { SCOOTER_MODELS } from '@/lib/seo/scooterModelsData';
import { ChevronRight, ArrowRight, Gauge, Layers, ShieldCheck } from 'lucide-react';
import { getBreadcrumbSchema } from '@/lib/seo/schemaGenerator';

export const metadata: Metadata = {
  title: 'Scooter Models in Bali | Compare Honda, Yamaha & Vespa Rentals',
  description: 'Compare all popular scooter models available for rent in Bali: Honda Scoopy, Vario, PCX, ADV, Yamaha NMAX, Aerox, Fazzio, and Vespa Primavera & Sprint.',
  alternates: {
    canonical: 'https://thebikerentalbali.com/scooters',
  },
};

export default function ScootersHubPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://thebikerentalbali.com' },
    { name: 'Scooter Models', url: 'https://thebikerentalbali.com/scooters' },
  ]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs tracking-wider">
              TBR
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-gray-900 group-hover:text-gray-700 transition-colors">
              THE BIKE RENTAL BALI
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full transition-all"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="font-semibold text-gray-900">Scooter Models</span>
        </nav>

        {/* Hero */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 sm:p-10 shadow-sm border border-gray-100 mb-10">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            <span>Complete Model Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-gray-900 tracking-tight leading-[1.15] mb-4">
            Compare Scooter Models in Bali
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
            Find the perfect scooter for your Bali adventure. Compare engine sizes, trunk capacities, fuel economy, and estimated rental rates across compact automatics, touring maxi scooters, and stylish Italian Vespas.
          </p>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SCOOTER_MODELS.map((model) => (
            <Link
              key={model.slug}
              href={`/scooters/${model.slug}`}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col group hover:scale-[1.02] hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="bg-gray-100 text-gray-800 text-[11px] font-bold px-3 py-1 rounded-full">
                  {model.category}
                </span>
                <span className="text-xs font-semibold text-gray-500">{model.engine}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black">
                {model.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                {model.description}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Daily Estimate</div>
                  <div className="text-xs font-extrabold text-gray-900">{model.pricingEst.daily}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
