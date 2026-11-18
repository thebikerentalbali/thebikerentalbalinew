"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Clock, MapPin, Route } from "lucide-react"
import {
  Campaign,
  getCampaigns,
  fetchCampaigns,
  subscribeToCampaigns,
} from "@/utils/campaigns"

interface ScooterToursSectionProps {
  initialCampaigns?: Campaign[]
}

export default function ScooterToursSection({
  initialCampaigns,
}: ScooterToursSectionProps) {
  const filterTours = useCallback(
    (list: Campaign[]) => list.filter((c) => c.is_active !== false && c.category === "tour"),
    []
  )

  const [tours, setTours] = useState<Campaign[]>(() => {
    if (initialCampaigns && initialCampaigns.length > 0) {
      return filterTours(initialCampaigns)
    }
    return filterTours(getCampaigns(false))
  })

  useEffect(() => {
    fetchCampaigns(false)
      .then((data) => {
        if (Array.isArray(data)) setTours(filterTours(data))
      })
      .catch(() => {})

    const unsubscribe = subscribeToCampaigns((updated) => {
      if (Array.isArray(updated)) setTours(filterTours(updated))
    })
    return () => unsubscribe()
  }, [filterTours])

  if (tours.length === 0) return null

  return (
    <section aria-labelledby="scooter-tours-heading" className="mb-10 md:mb-12">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h2
            id="scooter-tours-heading"
            className="text-xl md:text-2xl font-bold text-[var(--ink)] tracking-tight"
          >
            Scooter Tours &amp; Itineraries
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-ink)] font-medium mt-0.5">
            Curated Bali rides with full timed itineraries and local guides.
          </p>
        </div>
        <span className="cirrel-pill text-xs shrink-0">{tours.length} available</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {tours.map((tour) => {
          const td = tour.tour_details
          const price = td?.price || 0
          const priceUnit = td?.price_unit || "per rider"
          const itinerary = td?.itinerary || []
          const stopsPreview = itinerary.slice(0, 3)

          return (
            <Link
              key={tour.id}
              href={`/tours/${encodeURIComponent(tour.id)}`}
              prefetch={true}
              className="cirrel-glass group rounded-[24px] md:rounded-[28px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 active-press cursor-pointer"
            >
              {/* Cover Image with Overlay Logo, Title & Location */}
              <div className="relative w-full h-48 sm:h-52 bg-[#0b1220] overflow-hidden shrink-0">
                {tour.image_url ? (
                  <Image
                    src={tour.image_url}
                    alt={tour.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0f2544] via-[#101c31] to-[#080d17]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/25" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
                  {tour.badge ? (
                    <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                      {tour.badge}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                      SCOOTER TOUR
                    </span>
                  )}

                  {price > 0 && (
                    <span className="px-3 py-1 rounded-full bg-[var(--accent-blue)] text-white text-[11px] font-bold shadow-sm">
                      Rp {price.toLocaleString("id-ID")} <span className="font-normal opacity-90">/ {priceUnit.replace(/^per\s+/i, "")}</span>
                    </span>
                  )}
                </div>

                {/* Partner Logo, Name & Location overlaid on photo */}
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden shrink-0 border border-white/40">
                    {tour.partner_logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tour.partner_logo_url}
                        alt={tour.partner_name || "Tour Operator"}
                        className="w-full h-full object-contain p-0.5"
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-[#0b1220]">
                        {tour.partner_name ? tour.partner_name.slice(0, 2).toUpperCase() : "TB"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs sm:text-sm font-bold text-white leading-tight truncate drop-shadow-sm">
                      {tour.partner_name || "The Bike Rental Bali Tours"}
                    </span>
                    {tour.partner_location && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-white/90 font-medium leading-tight mt-0.5 max-w-full">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{tour.partner_location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="relative z-10 p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] leading-snug tracking-tight">
                    {tour.title}
                  </h3>
                  {tour.subtitle && (
                    <p className="text-xs sm:text-sm text-[var(--muted-ink)] font-medium leading-relaxed whitespace-normal">
                      {tour.subtitle}
                    </p>
                  )}

                  {/* Duration & Stops Pills */}
                  {(td?.duration || itinerary.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {td?.duration && (
                        <span className="cirrel-pill text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-[var(--accent-text)]" />
                          <span>{td.duration}</span>
                        </span>
                      )}
                      {itinerary.length > 0 && (
                        <span className="cirrel-pill text-[11px] font-semibold">
                          <Route className="w-3 h-3 text-[var(--accent-text)]" />
                          <span>{itinerary.length} Itinerary {itinerary.length === 1 ? "Stop" : "Stops"}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Compact Itinerary Preview */}
                  {stopsPreview.length > 0 && (
                    <div className="cirrel-well rounded-[18px] p-3 space-y-1.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-ink)]">
                        Route Highlights
                      </span>
                      <div className="space-y-1">
                        {stopsPreview.map((stop, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[var(--ink-2)]">
                            <span className="font-mono text-[11px] font-bold text-[var(--accent-text)] shrink-0">
                              {stop.time || `#${idx + 1}`}
                            </span>
                            <span className="font-semibold text-[var(--ink)] leading-snug">
                              {stop.title}
                            </span>
                          </div>
                        ))}
                        {itinerary.length > stopsPreview.length && (
                          <span className="block text-[11px] font-bold text-[var(--accent-text)] pt-0.5">
                            +{itinerary.length - stopsPreview.length} more stops inside
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Row */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--line)]">
                  <div>
                    {price > 0 ? (
                      <>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-ink)]">
                          Tour Price
                        </span>
                        <span className="text-base font-bold text-[var(--ink)]">
                          Rp {price.toLocaleString("id-ID")}
                          <span className="text-xs font-medium text-[var(--muted-ink)]"> {priceUnit}</span>
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-[var(--muted-ink)]">View Full Itinerary</span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5 cirrel-btn-primary px-4 py-2 text-xs font-bold shrink-0">
                    <span>{tour.cta_text || "View Tour & Itinerary"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
