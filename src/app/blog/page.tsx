import { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_ARTICLES } from '@/lib/seo/blogArticlesData';
import { ChevronRight, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { getBreadcrumbSchema } from '@/lib/seo/schemaGenerator';

export const metadata: Metadata = {
  title: 'Bali Scooter Rental Guides, Tips & Itineraries | Travel Blog',
  description: 'Expert guides on renting scooters in Bali, international driving permit rules, traffic safety, scenic routes, secret beaches, and model comparisons.',
  alternates: {
    canonical: 'https://thebikerentalbali.com/blog',
  },
};

export default function BlogHubPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://thebikerentalbali.com' },
    { name: 'Travel Guides & Blog', url: 'https://thebikerentalbali.com/blog' },
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
              Browse Scooters
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="font-semibold text-gray-900">Guides & Blog</span>
        </nav>

        {/* Hero */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 sm:p-10 shadow-sm border border-gray-100 mb-10">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
            <BookOpen className="w-3.5 h-3.5 text-black" />
            <span>Traveler Knowledge Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-gray-900 tracking-tight leading-[1.15] mb-4">
            Bali Scooter Guides & Road Trips
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
            Essential tourist advice, international license requirements, safety guidelines, scooter model comparisons, and hidden beach itineraries for exploring Bali by scooter.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col group hover:scale-[1.02] hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {article.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-black leading-snug">
                {article.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                {article.excerpt}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{article.publishDate}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
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
