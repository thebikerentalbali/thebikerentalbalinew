"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
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
  MessageCircle
} from "lucide-react"
import { Campaign, getCampaigns, fetchCampaigns, subscribeToCampaigns } from "@/utils/campaigns"

interface CampaignCardProps {
  initialCampaigns?: Campaign[]
}

export default function CampaignCard({ initialCampaigns }: CampaignCardProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    if (initialCampaigns && initialCampaigns.length > 0) {
      return initialCampaigns.filter(c => c.is_active !== false)
    }
    return getCampaigns(false)
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [hasCopiedCode, setHasCopiedCode] = useState(false)

  // Fetch Supabase campaigns in background
  useEffect(() => {
    fetchCampaigns(false).then((data) => {
      if (data && data.length > 0) {
        setCampaigns(data)
      }
    }).catch(() => {})

    const unsubscribe = subscribeToCampaigns((updated) => {
      if (updated && updated.length > 0) {
        setCampaigns(updated)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

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

  return (
    <section 
      aria-label="Promotional Campaigns"
      className="mb-10 md:mb-12 relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Simple Rounded Cinematic Card (Black & White Vibe) */}
      <div 
        onClick={() => setSelectedCampaign(activeCampaign)}
        className="group relative overflow-hidden rounded-3xl md:rounded-[32px] min-h-[260px] sm:min-h-[290px] md:min-h-[310px] p-6 sm:p-8 md:p-10 text-white bg-black border border-white/10 shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-white/25 active-press"
      >
        {/* Cinematic Background Image with Dark Vignette */}
        {activeCampaign.image_url ? (
          <Image
            src={activeCampaign.image_url}
            alt={activeCampaign.title || "Campaign"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            className="object-cover object-center filter brightness-[0.55] transition-transform duration-700 group-hover:scale-105"
            priority={true}
          />
        ) : null}

        {/* Pure Black & White Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* Top Row: Partner Branding + Badge */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Circular Partner Logo or Avatar */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
              {activeCampaign.partner_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={activeCampaign.partner_logo_url} 
                  alt={activeCampaign.partner_name || "Partner"} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-black text-white font-black text-[11px] sm:text-xs flex items-center justify-center uppercase rounded-full">
                  {activeCampaign.partner_name ? activeCampaign.partner_name.slice(0, 2) : "TB"}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-bold text-neutral-200 block truncate">
                {activeCampaign.partner_name || "The Bike Rental Bali"}
              </span>
              {activeCampaign.partner_location && (
                <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 font-medium truncate">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  {activeCampaign.partner_location}
                </span>
              )}
            </div>
          </div>

          {/* Badge Pill */}
          {activeCampaign.badge ? (
            <span className="px-3.5 py-1.5 rounded-full bg-white text-black text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md shrink-0">
              {activeCampaign.badge}
            </span>
          ) : null}
        </div>

        {/* Bottom Area: Full Title, Description & View Details Pill */}
        <div className="relative z-10 space-y-3 pt-6">
          {activeCampaign.discount_text && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
              <Gift className="w-3.5 h-3.5 text-white" />
              <span>{activeCampaign.discount_text}</span>
            </div>
          )}

          {/* Complete Title - Clean & Fully Visible */}
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-snug tracking-tight break-words max-w-2xl">
            {activeCampaign.title}
          </h2>

          {activeCampaign.subtitle && (
            <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 max-w-xl font-medium leading-relaxed">
              {activeCampaign.subtitle}
            </p>
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-black uppercase tracking-wider shadow-lg transition-all">
              <span>{activeCampaign.cta_text || "View Details"}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            {/* Slider Dots & Arrows (if multiple campaigns) */}
            {campaigns.length > 1 && (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                        currentIndex === idx ? "w-6 bg-white" : "w-1.5 bg-white/30"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CAMPAIGN DETAILS MODAL (Clean Black & White Design) */}
      {/* ================================================================= */}
      {selectedCampaign && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setSelectedCampaign(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-black/10 my-auto animate-in zoom-in-95 text-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedCampaign.partner_logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={selectedCampaign.partner_logo_url} 
                      alt={selectedCampaign.partner_name || "Partner"} 
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs font-black text-black">
                      {selectedCampaign.partner_name ? selectedCampaign.partner_name.slice(0, 2).toUpperCase() : "TB"}
                    </span>
                  )}
                </div>
                <div>
                  <span className="inline-block text-[10px] font-black uppercase text-gray-500 tracking-wider">
                    {selectedCampaign.partner_name || "The Bike Rental Bali"}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
                    {selectedCampaign.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campaign Banner Preview (if provided) */}
            {selectedCampaign.image_url && (
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-neutral-900 border border-black/10">
                <Image
                  src={selectedCampaign.image_url}
                  alt={selectedCampaign.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {selectedCampaign.badge && (
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-wider shadow-sm">
                    {selectedCampaign.badge}
                  </span>
                )}
              </div>
            )}

            {/* Offer Highlight Box */}
            {selectedCampaign.discount_text && (
              <div className="bg-neutral-900 text-white p-4 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Special Offer Highlight
                </p>
                <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                  {selectedCampaign.discount_text}
                </h4>
              </div>
            )}

            {/* Full Subtitle / Description */}
            {selectedCampaign.subtitle && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">About This Offer</p>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                  {selectedCampaign.subtitle}
                </p>
              </div>
            )}

            {/* Voucher Code Box (if applicable) */}
            {selectedCampaign.voucher_code && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Promo Voucher Code
                </label>
                <div className="flex items-center justify-between p-3.5 bg-neutral-100 rounded-2xl border border-neutral-200 gap-3">
                  <span className="font-mono text-base sm:text-lg font-black text-black tracking-widest pl-2 select-all">
                    {selectedCampaign.voucher_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedCampaign.voucher_code)}
                    className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm active-press transition-all cursor-pointer shrink-0"
                  >
                    {hasCopiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
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
            <div className="space-y-2 text-xs text-gray-600 pt-1">
              {selectedCampaign.partner_location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <span><strong>Location:</strong> {selectedCampaign.partner_location}</span>
                </div>
              )}
              {selectedCampaign.voucher_terms && (
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Terms:</strong> {selectedCampaign.voucher_terms}</span>
                </div>
              )}
            </div>

            {/* Actions: WhatsApp 1-Click Booking or CTA Action */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              {selectedCampaign.partner_whatsapp ? (
                <a
                  href={`https://wa.me/${selectedCampaign.partner_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi ${selectedCampaign.partner_name || 'Team'}, I saw the collaboration on The Bike Rental Bali and would like to claim promo voucher code: ${selectedCampaign.voucher_code || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md active-press transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Book via WhatsApp</span>
                </a>
              ) : null}

              {selectedCampaign.cta_link && selectedCampaign.cta_link !== "#claim-voucher" ? (
                selectedCampaign.cta_link.startsWith("http") ? (
                  <a
                    href={selectedCampaign.cta_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md active-press transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <span>{selectedCampaign.cta_text || "Proceed"}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href={selectedCampaign.cta_link}
                    onClick={() => setSelectedCampaign(null)}
                    className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md active-press transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <span>{selectedCampaign.cta_text || "Rent Now"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )
              ) : null}

              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
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
