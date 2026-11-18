"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight, 
  ShieldCheck, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  MapPin, 
  Gift, 
  MessageCircle,
  Clock
} from "lucide-react"
import { Campaign, getCampaigns, fetchCampaigns, subscribeToCampaigns, resolveCampaignLink } from "@/utils/campaigns"

interface CampaignCardProps {
  initialCampaigns?: Campaign[]
}

export default function CampaignCard({ initialCampaigns }: CampaignCardProps) {
  const filterActiveCampaigns = useCallback(
    (list: Campaign[]) => list.filter((c) => c.is_active !== false),
    []
  )

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    if (initialCampaigns && initialCampaigns.length > 0) {
      return filterActiveCampaigns(initialCampaigns)
    }
    return filterActiveCampaigns(getCampaigns(false))
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [hasCopiedCode, setHasCopiedCode] = useState(false)

  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const didSwipeRef = useRef(false)

  // Fetch Supabase campaigns in background (supports 0 campaigns when empty/deleted)
  useEffect(() => {
    fetchCampaigns(false)
      .then((data) => {
        setCampaigns(Array.isArray(data) ? filterActiveCampaigns(data) : [])
      })
      .catch(() => {})

    const unsubscribe = subscribeToCampaigns((updated) => {
      setCampaigns(Array.isArray(updated) ? filterActiveCampaigns(updated) : [])
    })

    return () => {
      unsubscribe()
    }
  }, [filterActiveCampaigns])

  // Auto slide if multiple campaigns exist
  useEffect(() => {
    if (campaigns.length <= 1 || isPaused || selectedCampaign) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length)
    }, 6500)

    return () => clearInterval(timer)
  }, [campaigns.length, isPaused, selectedCampaign])

  const activeCampaign = useMemo(() => {
    if (campaigns.length === 0) return null
    return campaigns[currentIndex % campaigns.length]
  }, [campaigns, currentIndex])

  const nextSlide = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (campaigns.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % campaigns.length)
  }, [campaigns.length])

  const prevSlide = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (campaigns.length <= 1) return
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length)
  }, [campaigns.length])

  const handleCopyCode = (code?: string) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setHasCopiedCode(true)
    setTimeout(() => setHasCopiedCode(false), 3000)
  }

  if (!activeCampaign) return null

  const isTourCampaign = activeCampaign.category === "tour"
  const tourHref = `/tours/${encodeURIComponent(activeCampaign.id)}`
  const tourPrice = activeCampaign.tour_details?.price || 0
  const tourPriceUnit = activeCampaign.tour_details?.price_unit || "per rider"
  const activeLink = resolveCampaignLink(activeCampaign.cta_link)
  const isDirectExternalCard = Boolean(
    !isTourCampaign &&
    activeLink?.isExternal &&
    !activeCampaign.voucher_code &&
    !activeCampaign.partner_whatsapp &&
    !activeCampaign.voucher_terms
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    if (campaigns.length <= 1 || e.touches.length !== 1) return
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    didSwipeRef.current = false
    setIsPaused(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    setIsPaused(false)
    if (!start || campaigns.length <= 1 || e.changedTouches.length === 0) return

    const dx = start.x - e.changedTouches[0].clientX
    const dy = Math.abs(start.y - e.changedTouches[0].clientY)
    if (Math.abs(dx) > 42 && Math.abs(dx) > dy) {
      didSwipeRef.current = true
      if (dx > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
      setTimeout(() => {
        didSwipeRef.current = false
      }, 250)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (didSwipeRef.current) {
      e.preventDefault()
      return
    }
    if (!isDirectExternalCard && !isTourCampaign) {
      setSelectedCampaign(activeCampaign)
    }
  }

  return (
    <section
      aria-label="Promotional Campaigns"
      className="mb-8 md:mb-10 relative select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Simple, Clean & Responsive Campaign Card (with Touch Swipe across Spa, Tour & Promos) */}
      <div
        key={activeCampaign.id}
        onClick={handleCardClick}
        className="cirrel-glass group relative overflow-hidden rounded-[22px] md:rounded-[26px] flex flex-col md:flex-row items-stretch cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active-press animate-in fade-in"
      >
        {isTourCampaign ? (
          <Link
            href={tourHref}
            prefetch={true}
            onClick={(e) => {
              if (didSwipeRef.current) e.preventDefault()
            }}
            aria-label={activeCampaign.title || "View Scooter Tour Details"}
            className="absolute inset-0 z-10"
          />
        ) : isDirectExternalCard && activeLink ? (
          <a
            href={activeLink.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (didSwipeRef.current) e.preventDefault()
            }}
            aria-label={activeCampaign.title || "Open booking website"}
            className="absolute inset-0 z-10"
          />
        ) : null}

        {/* Media Pane (Compact top banner on mobile, sleek left split on desktop) */}
        {activeCampaign.image_url && (
          <div className="relative w-full h-48 sm:h-52 md:h-auto md:w-[40%] lg:w-[38%] md:min-h-[220px] shrink-0 overflow-hidden bg-[#f4f6f9] dark:bg-[#141a24]">
            <Image
              src={activeCampaign.image_url}
              alt={activeCampaign.title || "Campaign"}
              fill
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/25" />

            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              {activeCampaign.badge ? (
                <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                  {activeCampaign.badge}
                </span>
              ) : isTourCampaign ? (
                <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                  SCOOTER TOUR
                </span>
              ) : (
                <span />
              )}

              {isTourCampaign && tourPrice > 0 && (
                <span className="px-3 py-1 rounded-full bg-[var(--accent-blue)] text-white text-[11px] font-bold shadow-sm">
                  Rp {tourPrice.toLocaleString("id-ID")} / {tourPriceUnit.replace(/^per\s+/i, "")}
                </span>
              )}
            </div>

            {/* Partner Logo, Brand Title & Location overlaid cleanly on image */}
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden shrink-0 border border-white/40">
                {activeCampaign.partner_logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeCampaign.partner_logo_url}
                    alt={activeCampaign.partner_name || "Partner"}
                    className="w-full h-full object-contain p-0.5"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-[#0b1220]">
                    {activeCampaign.partner_name ? activeCampaign.partner_name.slice(0, 2).toUpperCase() : "TB"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-sm font-bold text-white leading-tight truncate drop-shadow-sm">
                  {activeCampaign.partner_name || "The Bike Rental Bali"}
                </span>
                {activeCampaign.partner_location && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/90 font-medium leading-tight mt-0.5 max-w-full">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{activeCampaign.partner_location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Pane */}
        <div className="relative z-10 flex-1 p-4 sm:p-5 md:p-6 flex flex-col justify-between gap-3.5 min-w-0 pointer-events-none">
          <div className="space-y-2.5">
            {/* Fallback Partner Row (when card has no image) + Discount/Badge Pills */}
            {(!activeCampaign.image_url || activeCampaign.discount_text) && (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {!activeCampaign.image_url ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full cirrel-well flex items-center justify-center overflow-hidden shrink-0">
                      {activeCampaign.partner_logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={activeCampaign.partner_logo_url}
                          alt={activeCampaign.partner_name || "Partner"}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--accent-text)]">
                          {activeCampaign.partner_name ? activeCampaign.partner_name.slice(0, 2).toUpperCase() : "TB"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-[var(--ink-2)] truncate">
                        {activeCampaign.partner_name || "The Bike Rental Bali"}
                      </span>
                      {activeCampaign.partner_location && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted-ink)] font-medium">
                          <MapPin className="w-3 h-3 shrink-0 text-[var(--accent-text)]" />
                          <span>{activeCampaign.partner_location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  {!activeCampaign.image_url && activeCampaign.badge && (
                    <span className="cirrel-pill text-[10px] uppercase tracking-wider">
                      {activeCampaign.badge}
                    </span>
                  )}
                  {activeCampaign.discount_text && (
                    <span className="cirrel-pill cirrel-pill--info text-[10px] sm:text-[11px]">
                      <Gift className="w-3 h-3 shrink-0" />
                      <span>{activeCampaign.discount_text}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Title & Full Short Description (without ... truncation) */}
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-[var(--ink)] leading-snug tracking-tight">
                {activeCampaign.title}
              </h2>
              {activeCampaign.subtitle && (
                <p className="text-xs sm:text-sm text-[var(--muted-ink)] mt-1.5 font-medium leading-relaxed whitespace-normal">
                  {activeCampaign.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Action & Slider Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {isTourCampaign ? (
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href={tourHref}
                  prefetch={true}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (didSwipeRef.current) e.preventDefault()
                  }}
                  className="relative z-20 pointer-events-auto inline-flex items-center gap-1.5 cirrel-btn-primary px-4 py-2 text-xs font-bold"
                >
                  <span>{activeCampaign.cta_text || "View Tour & Itinerary"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {activeCampaign.tour_details?.duration && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--muted-ink)]">
                    <Clock className="w-3 h-3 text-[var(--accent-text)]" />
                    <span>{activeCampaign.tour_details.duration}</span>
                  </span>
                )}
              </div>
            ) : activeLink?.isExternal && !isDirectExternalCard ? (
              <a
                href={activeLink.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="relative z-20 pointer-events-auto inline-flex items-center gap-1.5 cirrel-btn-primary px-4 py-2 text-xs font-bold"
              >
                <span>{activeCampaign.cta_text || "Book Now"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 cirrel-btn-primary px-4 py-2 text-xs font-bold">
                <span>{activeCampaign.cta_text || (activeLink?.isExternal ? "Book Now" : "View Offer")}</span>
                {activeLink?.isExternal ? (
                  <ExternalLink className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </span>
            )}

            {campaigns.length > 1 && (
              <div className="relative z-20 pointer-events-auto flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1 mr-1">
                  {campaigns.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Slide ${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentIndex(idx)
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentIndex === idx ? "w-5 bg-[var(--accent-blue)]" : "w-1.5 bg-[var(--line-2)]"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous"
                  className="cirrel-ibtn w-7 h-7 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next"
                  className="cirrel-ibtn w-7 h-7 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CAMPAIGN DETAILS MODAL (Cirrel Frosted Liquid Glass)              */}
      {/* ================================================================= */}
      {selectedCampaign && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setSelectedCampaign(null)}
        >
          <div 
            className="cirrel-modal rounded-[30px] max-w-lg w-full p-6 sm:p-8 space-y-5 my-auto animate-in zoom-in-95 text-[var(--ink)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-[var(--line)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl cirrel-well flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedCampaign.partner_logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={selectedCampaign.partner_logo_url} 
                      alt={selectedCampaign.partner_name || "Partner"} 
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs font-bold text-[var(--ink)]">
                      {selectedCampaign.partner_name ? selectedCampaign.partner_name.slice(0, 2).toUpperCase() : "TB"}
                    </span>
                  )}
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase text-[var(--muted-ink)] tracking-wider">
                    {selectedCampaign.partner_name || "The Bike Rental Bali"}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--ink)] leading-tight">
                    {selectedCampaign.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="cirrel-ibtn w-9 h-9 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Campaign Banner Preview (if provided) */}
            {selectedCampaign.image_url && (
              <div className="relative z-10 h-44 w-full rounded-[20px] overflow-hidden bg-[#09111f] border border-[var(--line)]">
                <Image
                  src={selectedCampaign.image_url}
                  alt={selectedCampaign.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 512px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {selectedCampaign.badge && (
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {selectedCampaign.badge}
                  </span>
                )}
              </div>
            )}

            {/* Offer Highlight Box */}
            {selectedCampaign.discount_text && (
              <div className="relative z-10 cirrel-kpi cirrel-kpi--1 p-4 rounded-[20px] space-y-1">
                <p className="relative z-10 text-[10px] font-bold text-[var(--tile-muted)] uppercase tracking-wider">
                  Special Offer Highlight
                </p>
                <h4 className="relative z-10 text-base sm:text-lg font-bold text-[var(--tile-ink)] leading-tight">
                  {selectedCampaign.discount_text}
                </h4>
              </div>
            )}

            {/* Full Subtitle / Description */}
            {selectedCampaign.subtitle && (
              <div className="relative z-10 space-y-1">
                <p className="text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wider">About This Offer</p>
                <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed font-medium">
                  {selectedCampaign.subtitle}
                </p>
              </div>
            )}

            {/* Voucher Code Box (if applicable) */}
            {selectedCampaign.voucher_code && (
              <div className="relative z-10 space-y-2">
                <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wider">
                  Promo Voucher Code
                </label>
                <div className="flex items-center justify-between p-3 cirrel-well rounded-[18px] gap-3">
                  <span className="font-mono text-base sm:text-lg font-bold text-[var(--ink)] tracking-widest pl-2 select-all">
                    {selectedCampaign.voucher_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedCampaign.voucher_code)}
                    className="cirrel-btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 active-press cursor-pointer shrink-0"
                  >
                    {hasCopiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#4fdc78] stroke-[2.5]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Partner Location & Terms */}
            <div className="relative z-10 space-y-2 text-xs text-[var(--muted-ink)] pt-1">
              {selectedCampaign.partner_location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[var(--accent-text)] shrink-0 mt-0.5" />
                  <span><strong className="text-[var(--ink)]">Location:</strong> {selectedCampaign.partner_location}</span>
                </div>
              )}
              {selectedCampaign.voucher_terms && (
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--good)] shrink-0 mt-0.5" />
                  <span><strong className="text-[var(--ink)]">Terms:</strong> {selectedCampaign.voucher_terms}</span>
                </div>
              )}
            </div>

            {/* Actions: WhatsApp 1-Click Booking or CTA Action */}
            <div className="relative z-10 pt-3 flex flex-col sm:flex-row items-center gap-3">
              {selectedCampaign.partner_whatsapp ? (
                <a
                  href={`https://wa.me/${selectedCampaign.partner_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi ${selectedCampaign.partner_name || 'Team'}, I saw the collaboration on The Bike Rental Bali and would like to claim promo voucher code: ${selectedCampaign.voucher_code || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider shadow-md active-press transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Book via WhatsApp</span>
                </a>
              ) : null}

              {(() => {
                const modalLink = resolveCampaignLink(selectedCampaign.cta_link)
                if (!modalLink) return null
                return modalLink.isExternal ? (
                  <a
                    href={modalLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full cirrel-btn-primary py-3.5 px-6 text-xs font-bold uppercase tracking-wider active-press flex items-center justify-center gap-2 text-center"
                  >
                    <span>{selectedCampaign.cta_text || "Book Now"}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href={modalLink.href}
                    onClick={() => setSelectedCampaign(null)}
                    className="w-full cirrel-btn-primary py-3.5 px-6 text-xs font-bold uppercase tracking-wider active-press flex items-center justify-center gap-2 text-center"
                  >
                    <span>{selectedCampaign.cta_text || "Rent Now"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )
              })()}

              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="w-full sm:w-auto cirrel-btn px-5 py-3.5 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  )
}
