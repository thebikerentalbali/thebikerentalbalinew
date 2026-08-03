'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Calendar, Clock, BookOpen, ArrowRight, ShieldCheck, MapPin, Tag } from 'lucide-react';
import { BlogArticleSEO, BLOG_ARTICLES } from '@/lib/seo/blogArticlesData';

interface BlogArticleViewProps {
  article: BlogArticleSEO;
}

export default function BlogArticleView({ article }: BlogArticleViewProps) {
  const otherArticles = BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24">
      {/* Top Navigation */}
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
              className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              All Scooters
            </Link>
            <Link
              href="/blog"
              className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              All Guides
            </Link>
            <Link
              href="/"
              className="bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full transition-all"
            >
              Rent a Scooter
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <Link href="/blog" className="hover:text-black transition-colors">Guides & Blog</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">{article.title}</span>
        </nav>

        {/* Article Header Card */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 sm:p-10 shadow-sm border border-gray-100 mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-black text-white text-[11px] font-bold px-3 py-1 rounded-full">
              {article.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.publishDate}</span>
            </div>
            <span className="text-gray-300">&bull;</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-gray-900 tracking-tight leading-[1.2] mb-4">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
          {/* Main Article Body */}
          <article className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
            {/* Table of Contents */}
            {article.tableOfContents.length > 0 && (
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 mb-8">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-black" />
                  <span>Table of Contents</span>
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm">
                  {article.tableOfContents.map((item, idx) => (
                    <li key={idx}>
                      <a href={`#${item.id}`} className="text-gray-600 hover:text-black font-medium hover:underline">
                        {idx + 1}. {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rendered HTML */}
            <div
              className="prose prose-sm sm:prose max-w-none text-gray-800 leading-relaxed
                prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 prose-ul:mb-4
                prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1 prose-ol:mb-4
                prose-li:text-gray-700
                prose-table:w-full prose-table:border-collapse prose-table:my-6
                prose-th:bg-gray-100 prose-th:p-2.5 prose-th:text-left prose-th:text-xs prose-th:font-bold prose-th:border prose-th:border-gray-200
                prose-td:p-2.5 prose-td:text-xs prose-td:border prose-td:border-gray-200"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />

            {/* FAQs inside article */}
            {article.faqs.length > 0 && (
              <div id="faqs" className="mt-10 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {article.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{faq.question}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Marketplace Booking CTA Card */}
            <div className="bg-black text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready to Ride in Bali?</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                  Compare verified local scooter rental companies across Bali. Free doorstep delivery to your villa or airport.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center w-full bg-white text-black font-bold text-sm py-3.5 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  Browse Scooters
                </Link>
              </div>
            </div>

            {/* Related Locations */}
            {article.relatedAreas.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-black" />
                  <span>Related Rental Areas</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.relatedAreas.map((area, idx) => (
                    <Link
                      key={idx}
                      href={`/scooter-rental-${area}`}
                      className="capitalize bg-gray-50 hover:bg-black hover:text-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
                    >
                      {area}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Scooter Models */}
            {article.relatedModels.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-black" />
                  <span>Featured Scooter Models</span>
                </h3>
                <div className="space-y-2">
                  {article.relatedModels.map((model, idx) => (
                    <Link
                      key={idx}
                      href={`/scooters/${model}`}
                      className="capitalize flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-800 transition-colors"
                    >
                      <span>{model.replace('-', ' ')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Read More Articles */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">More Travel & Rental Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherArticles.map((other) => (
              <Link
                key={other.slug}
                href={`/blog/${other.slug}`}
                className="flex flex-col group p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="text-[11px] font-bold text-gray-500 mb-1">{other.category}</div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-black leading-snug mb-2 line-clamp-2">
                  {other.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                  {other.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-1 text-xs font-bold text-black">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
