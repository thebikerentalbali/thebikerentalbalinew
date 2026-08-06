"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Play, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  MapPin, 
  Phone, 
  Gift, 
  MessageCircle 
} from "lucide-react"
import { Campaign, getCampaigns, fetchCampaigns, subscribeToCampaigns, extractYouTubeId } from "@/utils/campaigns"

const THEME_STYLES: Record<string, { bgOverlay: string; badgeBg: string; accentText: string; btnBg: string; glow: string }> = {
  dark: {
    bgOverlay: "from-black/85 via-black/45 to-black/90",
    badgeBg: "bg-white/15 border-white/20 text-white",
    accentText: "text-amber-300",
    btnBg: "bg-white text-black hover:bg-neutral-100",
    glow: "from-amber-500/20 via-transparent to-transparent",
  },
  sunset: {
    bgOverlay: "from-amber-950/85 via-orange-950/45 to-black/90",
    badgeBg: "bg-black/30 border-white/30 text-white",
    accentText: "text-amber-300",
    btnBg: "bg-gradient-to-r from-amber-400 to-orange-400 text-black hover:from-amber-300 hover:to-orange-300",
    glow: "from-orange-500/30 via-transparent to-transparent",
  },
  ocean: {
    bgOverlay: "from-cyan-950/85 via-blue-950/45 to-black/90",
    badgeBg: "bg-white/20 border-white/30 text-white",
    accentText: "text-cyan-300",
    btnBg: "bg-white text-blue-950 hover:bg-cyan-50",
    glow: "from-cyan-400/25 via-transparent to-transparent",
  },
  emerald: {
    bgOverlay: "from-emerald-950/85 via-teal-950/45 to-black/90",
    badgeBg: "bg-white/20 border-white/30 text-white",
    accentText: "text-emerald-300",
    btnBg: "bg-white text-emerald-950 hover:bg-emerald-50",
    glow: "from-emerald-400/25 via-transparent to-transparent",
  },
  violet: {
    bgOverlay: "from-purple-950/85 via-indigo-950/45 to-black/90",
    badgeBg: "bg-white/20 border-white/30 text-white",
    accentText: "text-pink-300",
    btnBg: "bg-white text-purple-950 hover:bg-purple-50",
    glow: "from-pink-500/25 via-transparent to-transparent",
  },
  amber: {
    bgOverlay: "from-stone-950/85 via-amber-950/45 to-black/90",
    badgeBg: "bg-amber-500/20 border-amber-400/30 text-amber-200",
    accentText: "text-amber-400",
    btnBg: "bg-amber-400 text-black hover:bg-amber-300",
    glow: "from-amber-400/25 via-transparent to-transparent",
  },
}

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
  
  // Modals state
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)
  const [activeVoucherCampaign, setActiveVoucherCampaign] = useState<Campaign | null>(null)
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
    if (campaigns.length <= 1 || isPaused || activeVideoUrl || activeVoucherCampaign) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length)
    }, 7000)

    return () => clearInterval(timer)
  }, [campaigns.length, isPaused, activeVideoUrl, activeVoucherCampaign])

  const activeCampaign = useMemo(() => {
    if (campaigns.length === 0) return null
    return campaigns[currentIndex % campaigns.length]
  }, [campaigns, currentIndex])

  const nextSlide = useCallback(() => {
    if (campaigns.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % campaigns.length)
  }, [campaigns.length])

  const prevSlide = useCallback(() => {
    if (campaigns.length <= 1) return
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length)
  }, [campaigns.length])

  const handleCopyVoucherCode = (code?: string) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setHasCopiedCode(true)
    setTimeout(() => setHasCopiedCode(false), 3000)
  }

  if (!activeCampaign) return null

  const themeKey = activeCampaign.theme || "dark"
  const theme = THEME_STYLES[themeKey] || THEME_STYLES.dark

  const youtubeId = activeCampaign.youtube_id || extractYouTubeId(activeCampaign.video_url)
  const isVideo = activeCampaign.category === "video" || Boolean(youtubeId)
  const isSpa = activeCampaign.category === "spa"
  const isTour = activeCampaign.category === "tour"
  const hasVoucher = Boolean(activeCampaign.voucher_code || isSpa)

  const isExternalLink = activeCampaign.cta_link?.startsWith("http")
  const targetLink = activeCampaign.cta_link || "#all-scooters"

  const handleActionClick = (e: React.MouseEvent) => {
    if (isVideo && youtubeId) {
      e.preventDefault()
      setActiveVideoUrl(`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`)
    } else if (hasVoucher) {
      e.preventDefault()
      setActiveVoucherCampaign(activeCampaign)
    }
  }

  return (
    <section 
      aria-label="Promotional Campaigns & Collaborations"
      className="mb-10 md:mb-12 relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Main Reference Card Container */}
      <div 
        className={`relative overflow-hidden rounded-[32px] sm:rounded-[40px] md:rounded-[44px] min-h-[330px] sm:min-h-[380px] md:min-h-[420px] p-6 sm:p-8 md:p-10 text-white border border-white/10 shadow-2xl flex flex-col justify-between transition-all duration-500 bg-neutral-950`}
      >
        {/* Full-bleed Background Image */}
        {activeCampaign.image_url && (
          <Image
            src={activeCampaign.image_url}
            alt={activeCampaign.title || "Campaign background"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            className="object-cover object-center transform scale-105 filter brightness-90 transition-transform duration-700"
            priority={true}
          />
        )}

        {/* Cinematic Multi-Layer Gradient Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgOverlay} backdrop-brightness-95`} />
        
        {/* Ambient Top Glow */}
        <div 
          className={`absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none bg-gradient-to-br ${theme.glow}`}
          aria-hidden="true" 
        />

        {/* ================================================================= */}
        {/* TOP BAR: Partner Avatar Logo + Title + Category Tag */}
        {/* ================================================================= */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
            
            {/* Circular Partner Logo Avatar */}
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 p-1 shadow-xl border-2 border-white/40 flex items-center justify-center overflow-hidden shrink-0 backdrop-blur-md">
              {activeCampaign.partner_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={activeCampaign.partner_logo_url} 
                  alt={activeCampaign.partner_name || "Partner logo"} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-black text-white font-black text-[10px] sm:text-xs flex items-center justify-center uppercase rounded-full">
                  {activeCampaign.partner_name ? activeCampaign.partner_name.slice(0, 2) : "TB"}
                </div>
              )}
            </div>

            {/* Complete Full Title & Partner Name (No Truncation) */}
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-snug drop-shadow-md break-words">
                {activeCampaign.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-neutral-200 drop-shadow-xs">
                  {activeCampaign.partner_name || "The Bike Rental Bali"}
                </span>
                {activeCampaign.partner_location && (
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-neutral-300 font-medium">
                    • <MapPin className="w-3 h-3 text-amber-400 shrink-0" /> {activeCampaign.partner_location}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Top-Right Badge Tag */}
          <div className="shrink-0">
            {activeCampaign.badge ? (
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md border shadow-md ${theme.badgeBg}`}>
                {isSpa ? <Sparkles className="w-3.5 h-3.5 text-amber-300" /> : <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                {activeCampaign.badge}
              </span>
            ) : null}
          </div>
        </div>

        {/* ================================================================= */}
        {/* CENTER HERO OVERLAY: YouTube Play Button or Hero Typography */}
        {/* ================================================================= */}
        <div className="relative z-10 py-6 sm:py-8 flex flex-col items-center justify-center text-center my-auto">
          
          {/* If YouTube video or guide */}
          {isVideo && (
            <button
              type="button"
              onClick={handleActionClick}
              aria-label="Play video guide"
              className="w-16 h-12 sm:w-20 sm:h-14 bg-red-600 hover:bg-red-700 active-press rounded-2xl flex items-center justify-center shadow-2xl transition-transform transform hover:scale-110 cursor-pointer border border-white/20 group mb-3"
            >
              <Play className="w-6 h-6 sm:w-8 h-8 fill-white text-white translate-x-0.5 transition-transform group-hover:scale-110" />
            </button>
          )}

          {/* Large Hero Text Slogan Overlay (matching "EXPLORE the island of God") */}
          {activeCampaign.hero_overlay_text ? (
            <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white/95 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] font-serif italic text-center max-w-2xl">
              {activeCampaign.hero_overlay_text}
            </h3>
          ) : (
            <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-md text-center max-w-xl">
              {activeCampaign.discount_text || "Special Island Partnership Deal"}
            </h3>
          )}
        </div>

        {/* ================================================================= */}
        {/* BOTTOM BAR: Subtitle Description + Action CTA + Video Trigger */}
        {/* ================================================================= */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-3 border-t border-white/10">
          
          <div className="max-w-xl space-y-1">
            {activeCampaign.discount_text && (
              <p className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase flex items-center gap-1.5 ${theme.accentText}`}>
                <Gift className="w-4 h-4" />
                {activeCampaign.discount_text}
              </p>
            )}
            {activeCampaign.subtitle && (
              <p className="text-xs sm:text-sm text-neutral-200/95 line-clamp-2 leading-relaxed font-medium drop-shadow-xs">
                {activeCampaign.subtitle}
              </p>
            )}
          </div>

          {/* CTA Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            {isVideo && youtubeId ? (
              <button
                type="button"
                onClick={handleActionClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-neutral-100 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active-press transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black text-black" />
                <span>{activeCampaign.cta_text || "Watch Video"}</span>
              </button>
            ) : hasVoucher ? (
              <button
                type="button"
                onClick={handleActionClick}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active-press transition-all cursor-pointer ${theme.btnBg}`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{activeCampaign.cta_text || "Claim Spa Voucher"}</span>
              </button>
            ) : isExternalLink ? (
              <a
                href={targetLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active-press transition-all cursor-pointer ${theme.btnBg}`}
              >
                <span>{activeCampaign.cta_text || "Rent Now"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>
            ) : (
              <Link
                href={targetLink}
                prefetch={true}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active-press transition-all cursor-pointer ${theme.btnBg}`}
              >
                <span>{activeCampaign.cta_text || "Rent Now"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            )}
          </div>

        </div>

        {/* Carousel Slide Indicators & Controls (if more than 1 campaign) */}
        {campaigns.length > 1 && (
          <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {campaigns.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`Go to campaign slide ${idx + 1}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx 
                      ? "w-8 bg-white" 
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous campaign"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors active-press cursor-pointer border border-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next campaign"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors active-press cursor-pointer border border-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ================================================================= */}
      {/* 1. YOUTUBE LIGHTBOX VIDEO MODAL */}
      {/* ================================================================= */}
      {activeVideoUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-neutral-800">
            {/* Close Bar */}
            <div className="flex items-center justify-between p-4 bg-neutral-900/80 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Play className="w-4 h-4 text-red-500 fill-red-500" />
                {activeCampaign.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveVideoUrl(null)}
                className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Iframe Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={activeVideoUrl}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. SPA & PARTNER VOUCHER CLAIM MODAL */}
      {/* ================================================================= */}
      {activeVoucherCampaign && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-gray-100 my-auto animate-in zoom-in-95 text-neutral-900">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {activeVoucherCampaign.partner_logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={activeVoucherCampaign.partner_logo_url} 
                      alt={activeVoucherCampaign.partner_name || "Partner"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Sparkles className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Official Partner Collaboration
                  </div>
                  <h3 className="text-lg font-black text-gray-900 leading-tight mt-0.5">
                    {activeVoucherCampaign.partner_name || "Exclusive Spa Voucher"}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveVoucherCampaign(null)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Offer Highlight Box */}
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-5 rounded-2xl border border-amber-200/80 space-y-2">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Exclusive Discount Offer
              </p>
              <h4 className="text-xl font-black text-gray-900 leading-tight">
                {activeVoucherCampaign.discount_text || "25% OFF ALL TREATMENTS"}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                {activeVoucherCampaign.subtitle}
              </p>
            </div>

            {/* Voucher Code Box */}
            {activeVoucherCampaign.voucher_code && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Your Promo Voucher Code
                </label>
                <div className="flex items-center justify-between p-3.5 bg-neutral-100 rounded-2xl border border-neutral-200 gap-3">
                  <span className="font-mono text-base sm:text-lg font-black text-black tracking-widest pl-2 select-all">
                    {activeVoucherCampaign.voucher_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyVoucherCode(activeVoucherCampaign.voucher_code)}
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

            {/* Partner Details & Location */}
            <div className="space-y-2 text-xs text-gray-600">
              {activeVoucherCampaign.partner_location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span><strong>Location:</strong> {activeVoucherCampaign.partner_location}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Redemption:</strong> {activeVoucherCampaign.voucher_terms || "Show your active scooter rental confirmation on The Bike Rental Bali upon arrival or booking."}</span>
              </div>
            </div>

            {/* Actions: Direct WhatsApp Booking */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {activeVoucherCampaign.partner_whatsapp ? (
                <a
                  href={`https://wa.me/${activeVoucherCampaign.partner_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi ${activeVoucherCampaign.partner_name || 'Spa'}, I booked a scooter with The Bike Rental Bali and would like to claim the discount voucher code: ${activeVoucherCampaign.voucher_code || 'BALIRIDER25'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md active-press transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Book via WhatsApp with Code</span>
                </a>
              ) : null}

              <button
                type="button"
                onClick={() => setActiveVoucherCampaign(null)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
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
