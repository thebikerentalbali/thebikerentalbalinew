'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, CheckCircle2, ShieldCheck, Clock, Navigation, Star, Heart, ArrowRight } from 'lucide-react';
import { LocationSEO, BALI_LOCATIONS } from '@/lib/seo/locationsData';
import { Scooter, Vendor } from '@/lib/types';

interface LocationLandingViewProps {
  location: LocationSEO;
  scooters: Scooter[];
  vendors: Vendor[];
}

export default function LocationLandingView({
  location,
  scooters,
  vendors
}: LocationLandingViewProps) {
  // Filter or show top scooters
  const displayScooters = scooters.slice(0, 8);
  const relatedLocations = BALI_LOCATIONS.filter(l => l.slug !== location.slug).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24">
      {/* Top Navigation Bar */}
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
              Browse Marketplace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="hover:text-black transition-colors">Locations</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="font-semibold text-gray-900">{location.name}</span>
        </nav>

        {/* Hero Banner */}
        <section className="bg-white rounded-[32px] md:rounded-[40px] p-6 sm:p-10 shadow-sm border border-gray-100 mb-10 relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
              <MapPin className="w-3.5 h-3.5 text-black" />
              <span>Verified Delivery in {location.name}, Bali</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-gray-900 tracking-tight leading-[1.15] mb-4">
              {location.heroHeadline}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-6">
              {location.introText}
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-800">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>Free Doorstep Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-800">
                <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                <span>Verified Local Fleets</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-800">
                <Clock className="w-4 h-4 text-black shrink-0" />
                <span>Sanitized Helmets Included</span>
              </div>
            </div>
          </div>
        </section>

        {/* Available Scooters in this Location */}
        <section className="mb-14">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Available Scooters for Delivery in {location.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Compare verified local fleets with daily, weekly & monthly rates.
              </p>
            </div>
            <Link
              href="/"
              className="text-xs sm:text-sm font-bold text-black hover:underline flex items-center gap-1 shrink-0"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {displayScooters.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-gray-500 font-bold border border-gray-100">
              Loading scooters for {location.name}...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {displayScooters.map((scooter) => (
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
          )}
        </section>

        {/* Location Content & Delivery Area Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Why Rent a Scooter in {location.name}?
              </h2>
              <ul className="space-y-3 mb-6">
                {(location.whyRentHere || []).map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-3 border-t border-gray-100">
                When you book through THE BIKE RENTAL BALI, our verified local partners ensure prompt vehicle handover directly at your villa, guesthouse, or hotel reception in {location.name}. Every rental includes two sanitized helmets, a phone mount for navigation, vehicle registration (STNK), and emergency roadside support.
              </p>
            </div>

            {/* Popular Attractions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-black" />
                <span>Top Places to Explore Around {location.name} by Scooter</span>
              </h2>
              <div className="space-y-3">
                {(location.topAttractions || []).map((attraction, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{attraction.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 pl-7">{attraction.description}</p>
                    <p className="text-[11px] text-gray-500 font-medium pl-7">
                      <strong className="text-gray-700">Rider Tip:</strong> {attraction.scooterTip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Delivery Info Box */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base mb-3">Delivery Information</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>Service Area:</strong> {location.deliveryInfo}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>Daily Pricing:</strong> {location.pricingSummary.daily}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>Weekly Pricing:</strong> {location.pricingSummary.weekly}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span><strong>Included:</strong> 2 Helmets + Phone Mount</span>
                </li>
              </ul>
            </div>

            {/* Recommended Models */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base mb-3">Popular Models in {location.name}</h3>
              <div className="space-y-2">
                {(location.popularModels || []).map((model, idx) => (
                  <Link
                    key={idx}
                    href={`/scooters/${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-xs sm:text-sm font-semibold text-gray-800 transition-colors"
                  >
                    <span>{model}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-14">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions about Scooter Rental in {location.name}
          </h2>
          <div className="space-y-4">
            {(location.localFaqs || []).map((faq, idx) => (
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

        {/* Related Nearby Areas */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Explore Other Scooter Rental Locations in Bali
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedLocations.map(area => (
              <Link
                key={area.slug}
                href={`/${area.slug}`}
                className="bg-gray-50 hover:bg-black hover:text-white text-gray-700 text-xs font-medium px-3.5 py-2 rounded-full border border-gray-200 transition-colors"
              >
                {area.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
