'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, CheckCircle2, Zap, Fuel, Shield, ArrowRight, Gauge, Layers, Info } from 'lucide-react';
import { ScooterModelSEO, SCOOTER_MODELS } from '@/lib/seo/scooterModelsData';
import { Scooter } from '@/lib/types';

interface ScooterModelViewProps {
  model: ScooterModelSEO;
  scooters: Scooter[];
}

export default function ScooterModelView({ model, scooters }: ScooterModelViewProps) {
  // Filter scooters that match this model's brand/name
  const matchingScooters = scooters.filter(
    (s) =>
      s.name.toLowerCase().includes(model.name.toLowerCase().split(' ')[1] || '') ||
      s.brand?.toLowerCase() === model.brand.toLowerCase()
  ).slice(0, 6);

  const otherModels = SCOOTER_MODELS.filter((m) => m.slug !== model.slug);

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
              className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              Travel Guides
            </Link>
            <Link
              href="/"
              className="bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full transition-all"
            >
              Compare Rates
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <Link href="/scooters" className="hover:text-black transition-colors">Scooters</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="font-semibold text-gray-900">{model.name}</span>
        </nav>

        {/* Hero Section */}
        <section className="bg-white rounded-[32px] md:rounded-[40px] p-6 sm:p-10 shadow-sm border border-gray-100 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
                <Gauge className="w-3.5 h-3.5 text-black" />
                <span>{model.brand} &bull; {model.engine}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-gray-900 tracking-tight leading-[1.15] mb-4">
                {model.heroHeadline}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                {model.description}
              </p>

              {/* Price Estimate Card */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Daily Rate</div>
                  <div className="text-xs sm:text-sm font-black text-gray-900 mt-0.5">{model.pricingEst.daily}</div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Weekly Rate</div>
                  <div className="text-xs sm:text-sm font-black text-gray-900 mt-0.5">{model.pricingEst.weekly}</div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Monthly Rate</div>
                  <div className="text-xs sm:text-sm font-black text-gray-900 mt-0.5">{model.pricingEst.monthly}</div>
                </div>
              </div>
            </div>

            {/* Spec Highlights Grid */}
            <div className="lg:col-span-5 bg-[#F8F9FA] p-6 rounded-3xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-black" />
                <span>Key Specifications</span>
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                  <span className="text-gray-500">Engine</span>
                  <span className="font-bold text-gray-900">{model.specs.engineCc}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                  <span className="text-gray-500">Fuel Tank</span>
                  <span className="font-bold text-gray-900">{model.specs.fuelTank}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                  <span className="text-gray-500">Luggage Trunk</span>
                  <span className="font-bold text-gray-900">{model.specs.underSeatStorage}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                  <span className="text-gray-500">Fuel Economy</span>
                  <span className="font-bold text-gray-900">{model.specs.fuelEfficiency}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-bold text-gray-900">{model.specs.weight}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Marketplace Fleet for this Model */}
        {matchingScooters.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Available {model.name} Scooters from Verified Vendors
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Book online with doorstep delivery to your villa or airport.
                </p>
              </div>
              <Link href="/" className="text-xs sm:text-sm font-bold text-black hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {matchingScooters.map((scooter) => (
                <Link
                  key={scooter.id}
                  href={`/detail/${scooter.id}`}
                  className="bg-white rounded-[24px] md:rounded-[32px] p-3 md:p-4 shadow-sm border border-gray-50 flex flex-col group transition-all hover:scale-[1.02] hover:shadow-md"
                >
                  <div className="relative w-full aspect-square mb-3 md:mb-4 rounded-2xl bg-[#F8F9FA] flex items-center justify-center p-3 md:p-5">
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 z-10 shadow-sm border border-gray-100">
                      <span className="text-[10px] md:text-xs font-extrabold text-gray-900">{scooter.year || '2024'}</span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={scooter.img}
                      alt={scooter.name}
                      className="w-full h-full object-contain drop-shadow-md transition-transform group-hover:scale-110"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1 px-1">
                    {scooter.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 px-1">{scooter.vendor_name || 'Verified Vendor'}</p>
                  <p className="text-gray-900 text-xs md:text-sm font-extrabold mt-auto px-1">
                    Rp {Number(scooter.price_daily || 0).toLocaleString()}{' '}
                    <span className="font-medium text-[11px] text-gray-500">/day</span>
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Pros & Best For */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-black" />
              <span>Why Rent a {model.name} in Bali?</span>
            </h2>
            <ul className="space-y-3">
              {model.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-black" />
              <span>Who is it Best For?</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-6">
              {model.bestFor}
            </p>
            <h3 className="font-bold text-gray-900 text-sm mb-3">Recommended Locations to Ride:</h3>
            <div className="flex flex-wrap gap-2">
              {model.recommendedAreas.map((area, idx) => (
                <Link
                  key={idx}
                  href={`/scooter-rental-${area.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="bg-gray-50 hover:bg-black hover:text-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-14">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions about {model.name} Rental in Bali
          </h2>
          <div className="space-y-4">
            {model.faqs.map((faq, idx) => (
              <details key={idx} className="group border-b border-gray-100 pb-4 last:border-none">
                <summary className="font-bold text-sm sm:text-base text-gray-900 cursor-pointer list-none flex justify-between items-center group-open:text-black">
                  <span>{faq.question}</span>
                  <span className="text-lg font-normal transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Other Scooter Models */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Compare Other Popular Scooter Models
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {otherModels.map((other) => (
              <Link
                key={other.slug}
                href={`/scooters/${other.slug}`}
                className="p-3.5 rounded-2xl bg-gray-50 hover:bg-black hover:text-white group transition-all"
              >
                <div className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-white">{other.name}</div>
                <div className="text-[11px] text-gray-500 group-hover:text-gray-300 mt-0.5">{other.category}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
