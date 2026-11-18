"use client"

import React, { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"

interface ScooterCardProps {
  scooter: any
  durationFilter: string
  isSaved: boolean
  onToggleSave: (e: React.MouseEvent, id: number) => void
  isHero?: boolean
  variant?: "popular" | "grid"
}

function ScooterCardComponent({
  scooter,
  durationFilter,
  isSaved,
  onToggleSave,
  isHero = false,
  variant = "popular",
}: ScooterCardProps) {
  const price =
    durationFilter === "Weekly"
      ? Number(scooter.price_weekly || 0)
      : durationFilter === "Monthly"
      ? Number(scooter.price_monthly || 0)
      : Number(scooter.price_daily || scooter.price || 0)

  if (variant === "popular") {
    return (
      <article className="flex-none w-[280px] sm:w-[320px] md:w-[360px] snap-start">
        <Link
          href={`/detail/${scooter.id}`}
          prefetch={true}
          onClick={() => {
            try {
              sessionStorage.setItem("checkout_prefill", JSON.stringify({ scooter }))
            } catch (e) {}
          }}
          onPointerDown={() => {
            try {
              sessionStorage.setItem("checkout_prefill", JSON.stringify({ scooter }))
            } catch (e) {}
          }}
          className="cirrel-glass rounded-[26px] md:rounded-[30px] p-4 md:p-5 flex flex-col relative group transition-all duration-300 hover:-translate-y-0.5 block active-press"
        >
          {/* Year Pill Badge */}
          <div className="absolute top-6 left-6 md:top-7 md:left-7 bg-[#0b1220]/75 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 z-20 border border-white/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3d9bff]" />
            <span className="text-xs font-bold text-white">{scooter.year || "2025"}</span>
          </div>

          {/* Save Button */}
          <button
            type="button"
            aria-label={isSaved ? `Unsave ${scooter.name}` : `Save ${scooter.name}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSave(e, scooter.id)
            }}
            className="absolute top-6 right-6 md:top-7 md:right-7 bg-[#0b1220]/70 backdrop-blur-md border border-white/20 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center z-20 shadow-sm hover:scale-110 active-press transition-transform"
          >
            <Heart
              className={`w-4 h-4 ${
                isSaved ? "fill-[#ff6f66] text-[#ff6f66]" : "text-white"
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Studio Image Well */}
          <div className="relative w-full h-48 md:h-54 mb-4 rounded-[20px] md:rounded-[22px] overflow-hidden bg-gradient-to-b from-white/95 to-[#eaf0f8]/95 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <Image
              src={scooter.img || scooter.image_url || "/images/scooter.png"}
              alt={scooter.name || "Scooter rental"}
              fill
              sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 360px"
              className="object-contain p-3 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              priority={isHero}
              loading={isHero ? "eager" : "lazy"}
              fetchPriority={isHero ? "high" : "auto"}
            />
          </div>

          {/* Info */}
          <div className="relative z-10 flex items-center justify-between px-1 pb-0.5 gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base md:text-lg font-bold text-[var(--ink)] mb-0.5 truncate tracking-tight">
                {scooter.name}
              </h3>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-[var(--ink)] text-[16px] sm:text-[18px] leading-tight">
                  Rp {price.toLocaleString()}
                </span>
                <span className="text-[12px] font-semibold text-[var(--muted-ink)]">
                  / {durationFilter.toLowerCase()}
                </span>
              </div>
            </div>
            <span className="cirrel-btn-primary px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 pointer-events-none">
              Book Now
            </span>
          </div>
        </Link>
      </article>
    )
  }

  // Grid layout (More Listings)
  return (
    <article>
      <Link
        href={`/detail/${scooter.id}`}
        prefetch={true}
        onClick={() => {
          try {
            sessionStorage.setItem("checkout_prefill", JSON.stringify({ scooter }))
          } catch (e) {}
        }}
        onPointerDown={() => {
          try {
            sessionStorage.setItem("checkout_prefill", JSON.stringify({ scooter }))
          } catch (e) {}
        }}
        className="cirrel-glass rounded-[24px] md:rounded-[26px] p-3 md:p-4 flex flex-col group transition-all duration-300 hover:-translate-y-0.5 active-press h-full"
      >
        <div className="relative w-full aspect-square mb-3 md:mb-3.5 rounded-[18px] md:rounded-[20px] bg-gradient-to-b from-white/95 to-[#eaf0f8]/95 flex items-center justify-center p-3 md:p-4 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <button
            type="button"
            aria-label={isSaved ? `Unsave ${scooter.name}` : `Save ${scooter.name}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSave(e, scooter.id)
            }}
            className="absolute top-2.5 left-2.5 md:top-3 md:left-3 bg-[#0b1220]/70 backdrop-blur-md border border-white/20 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center z-20 shadow-sm hover:scale-110 active-press transition-transform"
          >
            <Heart
              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                isSaved ? "fill-[#ff6f66] text-[#ff6f66]" : "text-white"
              }`}
              aria-hidden="true"
            />
          </button>
          <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 bg-[#0b1220]/75 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3d9bff]" />
            <span className="text-[11px] font-bold text-white">
              {scooter.year || "2025"}
            </span>
          </div>
          <Image
            src={scooter.img || scooter.image_url || "/images/scooter.png"}
            alt={scooter.name || "Scooter rental"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="relative z-10 px-1 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-[var(--ink)] mb-0.5 truncate">
              {scooter.name}
            </h3>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="font-bold text-[var(--ink)] text-[13px] md:text-[15px] leading-tight">
                Rp {price.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-[var(--muted-ink)]">
                / {durationFilter.toLowerCase()}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <span className="w-full cirrel-btn-primary py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap flex items-center justify-center">
              Book Now
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default memo(ScooterCardComponent)
