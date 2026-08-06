"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, ChevronLeft, Sparkles, Tag, ArrowRight, ShieldCheck, Flame } from "lucide-react"
import { Campaign, getCampaigns, fetchCampaigns, subscribeToCampaigns } from "@/utils/campaigns"

const THEME_STYLES: Record<string, { bg: string; badgeBg: string; accentText: string; btnBg: string; glow: string }> = {
  dark: {
    bg: "bg-gradient-to-br from-neutral-950 via-neutral-900 to-black border-white/15",
    badgeBg: "bg-white/10 border-white/20 text-white",
    accentText: "text-amber-300",
    btnBg: "bg-white text-black hover:bg-neutral-100",
    glow: "from-amber-500/20 via-transparent to-transparent",
  },
  sunset: {
    bg: "bg-gradient-to-br from-amber-700 via-orange-600 to-rose-700 border-white/20",
    badgeBg: "bg-black/20 border-white/30 text-white",
    accentText: "text-yellow-200",
    btnBg: "bg-white text-orange-900 hover:bg-orange-50",
    glow: "from-yellow-400/30 via-transparent to-transparent",
  },
  ocean: {
    bg: "bg-gradient-to-br from-cyan-950 via-sky-900 to-blue-950 border-white/20",
    badgeBg: "bg-white/15 border-white/25 text-white",
    accentText: "text-cyan-300",
    btnBg: "bg-white text-sky-950 hover:bg-sky-50",
    glow: "from-cyan-400/25 via-transparent to-transparent",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 border-white/20",
    badgeBg: "bg-white/15 border-white/25 text-white",
    accentText: "text-emerald-300",
    btnBg: "bg-white text-emerald-950 hover:bg-emerald-50",
    glow: "from-emerald-400/25 via-transparent to-transparent",
  },
  violet: {
    bg: "bg-gradient-to-br from-purple-950 via-indigo-900 to-neutral-950 border-white/20",
    badgeBg: "bg-white/15 border-white/25 text-white",
    accentText: "text-pink-300",
    btnBg: "bg-white text-purple-950 hover:bg-purple-50",
    glow: "from-pink-500/25 via-transparent to-transparent",
  },
  amber: {
    bg: "bg-gradient-to-br from-stone-950 via-amber-950 to-neutral-900 border-amber-500/20",
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
    if (campaigns.length <= 1 || isPaused) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [campaigns.length, isPaused])

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

  if (!activeCampaign) return null

  const themeKey = activeCampaign.theme || "dark"
  const theme = THEME_STYLES[themeKey] || THEME_STYLES.dark

  const isExternalLink = activeCampaign.cta_link?.startsWith("http")
  const targetLink = activeCampaign.cta_link || "#all-scooters"

  return (
    <section 
      aria-label="Promotional Campaigns"
      className="mb-10 md:mb-12 relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div 
        className={`relative overflow-hidden rounded-[28px] sm:rounded-[36px] md:rounded-[40px] p-6 sm:p-8 md:p-10 text-white border shadow-xl transition-all duration-500 ${theme.bg}`}
      >
        {/* Background Ambient Glow & Patterns */}
        <div 
          className={`absolute -top-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none bg-gradient-to-br ${theme.glow}`}
          aria-hidden="true" 
        />
        <div 
          className="absolute -bottom-24 -right-24 w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-3xl pointer-events-none bg-white/5"
          aria-hidden="true" 
        />

        {/* Content Layout */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
          
          {/* Text & CTA Left Section */}
          <div className="flex-1 max-w-xl space-y-3.5 sm:space-y-4">
            
            {/* Badges Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {activeCampaign.badge && (
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md border shadow-xs ${theme.badgeBg}`}>
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {activeCampaign.badge}
                </span>
              )}

              {activeCampaign.discount_text && (
                <span className={`text-[12px] sm:text-xs font-black tracking-wide flex items-center gap-1 ${theme.accentText}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeCampaign.discount_text}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[38px] font-black leading-[1.12] tracking-tight text-white drop-shadow-xs">
              {activeCampaign.title}
            </h2>

            {/* Subtitle */}
            {activeCampaign.subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-neutral-200/90 leading-relaxed max-w-lg font-medium">
                {activeCampaign.subtitle}
              </p>
            )}

            {/* Action Row */}
            <div className="pt-2 sm:pt-3 flex items-center gap-4 flex-wrap">
              {isExternalLink ? (
                <a
                  href={targetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-105 active-press transition-all cursor-pointer ${theme.btnBg}`}
                >
                  <span>{activeCampaign.cta_text || "Rent Now"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </a>
              ) : (
                <Link
                  href={targetLink}
                  prefetch={true}
                  className={`inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-105 active-press transition-all cursor-pointer ${theme.btnBg}`}
                >
                  <span>{activeCampaign.cta_text || "Rent Now"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              )}

              <div className="flex items-center gap-1.5 text-neutral-300/80 text-[11px] sm:text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Vendors & Delivery</span>
              </div>
            </div>

          </div>

          {/* Right Image Graphic Section */}
          <div className="relative flex items-center justify-center shrink-0 self-center md:self-auto">
            <div className="relative w-52 h-36 sm:w-64 sm:h-44 md:w-72 md:h-48 lg:w-80 lg:h-52 flex items-center justify-center">
              {/* Radial glow background behind image */}
              <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl transform scale-75" />
              
              <Image
                src={activeCampaign.image_url || "/images/scooter.png"}
                alt={activeCampaign.title || "Campaign promotion"}
                fill
                sizes="(max-width: 640px) 220px, (max-width: 1024px) 280px, 340px"
                className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:scale-105"
                priority={true}
                loading="eager"
              />
            </div>
          </div>

        </div>

        {/* Carousel Slide Indicators & Controls (if more than 1 campaign) */}
        {campaigns.length > 1 && (
          <div className="mt-5 md:mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
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
    </section>
  )
}
