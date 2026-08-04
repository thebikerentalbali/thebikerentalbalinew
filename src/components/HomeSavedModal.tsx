"use client"

import React, { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, X } from "lucide-react"

interface HomeSavedModalProps {
  isOpen: boolean
  onClose: () => void
  savedScooters: number[]
  allScooters: any[]
  durationFilter: string
  onToggleSave: (e: React.MouseEvent, id: number) => void
}

function HomeSavedModalComponent({
  isOpen,
  onClose,
  savedScooters,
  allScooters,
  durationFilter,
  onToggleSave,
}: HomeSavedModalProps) {
  if (!isOpen) return null

  const savedList = allScooters.filter((s: any) => savedScooters.includes(s.id))

  return (
    <aside
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Saved Scooters"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] p-6 pb-12 md:pb-6 shadow-xl animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 relative max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Saved Scooters</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved scooters"
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors active-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {savedList.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
              <p className="font-bold text-gray-900">No saved scooters yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Tap the heart icon on a scooter to save it for later.
              </p>
            </div>
          ) : (
            savedList.map((scooter: any) => {
              const price =
                durationFilter === "Weekly"
                  ? Number(scooter.price_weekly || 0)
                  : durationFilter === "Monthly"
                  ? Number(scooter.price_monthly || 0)
                  : Number(scooter.price_daily || scooter.price || 0)

              return (
                <Link
                  key={scooter.id}
                  href={`/detail/${scooter.id}`}
                  onClick={onClose}
                  prefetch={true}
                  className="bg-gray-50 p-3 rounded-2xl flex items-center gap-4 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 active-press"
                >
                  <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm p-1">
                    <Image
                      src={scooter.img || scooter.image_url || "/images/scooter.png"}
                      alt={scooter.name || "Scooter"}
                      fill
                      sizes="64px"
                      className="object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 text-[14px] truncate">{scooter.name}</h4>
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                        <span className="text-[11px] font-bold text-gray-700">
                          {scooter.year || "2024"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-[14px] font-extrabold text-gray-900">
                        Rp {price.toLocaleString()}
                      </span>
                      <span className="text-gray-400 font-semibold text-[11px]">
                        {durationFilter}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Unsave ${scooter.name}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onToggleSave(e, scooter.id)
                    }}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 active-press"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}

export default memo(HomeSavedModalComponent)
