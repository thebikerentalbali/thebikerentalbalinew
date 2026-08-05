"use client"

import React, { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, MapPin } from "lucide-react"
import { fetchVendorDetail } from "@/lib/api/catalogService"

interface VendorStoryItemProps {
  vendor: any
  isEager?: boolean
}

function VendorStoryItemComponent({ vendor, isEager = false }: VendorStoryItemProps) {
  const handleIntentPrefetch = () => {
    if (vendor?.id) {
      fetchVendorDetail(String(vendor.id))
    }
  }

  return (
    <article className="flex-none">
      <Link
        href={`/vendor/${vendor.id}`}
        prefetch={true}
        onPointerEnter={handleIntentPrefetch}
        onTouchStart={handleIntentPrefetch}
        className="flex flex-col items-center gap-2 md:gap-3 min-w-[80px] md:min-w-[100px] transition-transform hover:scale-105 active-press group"
      >
        {/* Story Ring */}
        <div className="p-[2px] md:p-[3px] rounded-full bg-gradient-to-tr from-black via-neutral-700 to-neutral-400 shadow-sm group-hover:shadow-md transition-shadow duration-200">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white p-[2px] md:p-[3px]">
            <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
              {vendor.logo ? (
                <Image
                  src={vendor.logo}
                  alt={vendor.name || "Vendor"}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 64px, 80px"
                  loading={isEager ? "eager" : "lazy"}
                />
              ) : (
                <span className="text-lg md:text-xl font-bold text-gray-600">{vendor.initials}</span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="text-center flex flex-col items-center">
          <h3 className="font-semibold text-gray-900 text-[13px] md:text-[15px] leading-tight truncate w-[85px] md:w-[100px]">
            {vendor.name}
          </h3>
          <div className="flex items-center gap-1 text-[11px] md:text-[13px] mt-0.5 md:mt-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100 w-fit">
            <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span className="font-bold text-yellow-700">
              {vendor.rating ? Number(vendor.rating).toFixed(1) : "5.0"}
            </span>
          </div>
          <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-[12px] text-gray-400 mt-0.5 md:mt-1">
            <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
            <span className="truncate max-w-[80px] md:max-w-[100px]">{vendor.location || vendor.address || "Bali"}</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default memo(VendorStoryItemComponent)
