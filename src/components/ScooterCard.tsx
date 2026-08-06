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
          className="bg-white rounded-[32px] md:rounded-[40px] p-5 md:p-6 shadow-sm border border-gray-50 flex flex-col relative group transition-all duration-200 hover:scale-[1.02] hover:shadow-md block active-press"
        >
          {/* Badge */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-white/95 backdrop-blur-sm px-3 md:px-4 py-1.5 rounded-full flex items-center gap-1.5 z-20 shadow-xs border border-gray-100">
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            <span className="text-xs md:text-sm font-extrabold text-gray-900">{scooter.year || "2025"}</span>
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
            className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/90 backdrop-blur-sm w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-20 shadow-sm hover:scale-110 active-press transition-transform"
          >
            <Heart
              className={`w-4 h-4 md:w-5 md:h-5 ${
                isSaved ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Image */}
          <div className="relative w-full h-48 md:h-56 mb-4 md:mb-5 rounded-2xl md:rounded-3xl overflow-hidden bg-[#F8F9FA] flex items-center justify-center">
            <Image
              src={scooter.img || scooter.image_url || "/images/scooter.png"}
              alt={scooter.name || "Scooter rental"}
              fill
              sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 360px"
              className="object-contain p-3 drop-shadow-md transition-transform duration-300 hover:scale-105"
              priority={isHero}
              loading={isHero ? "eager" : "lazy"}
              fetchPriority={isHero ? "high" : "auto"}
            />
          </div>

          {/* Info */}
          <div className="flex items-center justify-between px-1 pb-1 gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-0.5 truncate">{scooter.name}</h3>
              <div className="flex flex-col">
                <span className="font-extrabold text-gray-900 text-[16px] sm:text-[18px] leading-tight">
                  Rp {price.toLocaleString()}
                </span>
                <span className="text-[12px] font-semibold text-gray-400 mt-0.5">
                  {durationFilter}
                </span>
              </div>
            </div>
            <span className="bg-black text-white group-hover:bg-neutral-800 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 pointer-events-none transition-all duration-200 shadow-xs">
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
        className="bg-white rounded-[24px] md:rounded-[32px] p-3 md:p-4 shadow-sm border border-gray-50 flex flex-col group transition-all hover:scale-[1.02] hover:shadow-md active-press"
      >
        <div className="relative w-full aspect-square mb-3 md:mb-4 rounded-2xl bg-[#F8F9FA] flex items-center justify-center p-3 md:p-5">
          <button
            type="button"
            aria-label={isSaved ? `Unsave ${scooter.name}` : `Save ${scooter.name}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSave(e, scooter.id)
            }}
            className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur-sm w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center z-20 shadow-sm hover:scale-110 active-press transition-transform"
          >
            <Heart
              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                isSaved ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
              aria-hidden="true"
            />
          </button>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 md:px-3 py-1 md:py-1.5 rounded-full flex items-center gap-1 md:gap-1.5 z-10 shadow-sm border border-gray-100">
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            <span className="text-[11px] md:text-[13px] font-extrabold text-gray-900">
              {scooter.year || "2025"}
            </span>
          </div>
          <Image
            src={scooter.img || scooter.image_url || "/images/scooter.png"}
            alt={scooter.name || "Scooter rental"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 drop-shadow-md transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <div className="px-1 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900 mb-0.5 truncate">
              {scooter.name}
            </h3>
            <div className="flex flex-col">
              <span className="font-extrabold text-gray-900 text-[13px] md:text-[15px] leading-tight">
                Rp {price.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-gray-400 mt-0.5">
                {durationFilter}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <span className="w-full bg-black text-white group-hover:bg-neutral-800 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap flex items-center justify-center transition-all duration-200">
              Book Now
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default memo(ScooterCardComponent)
