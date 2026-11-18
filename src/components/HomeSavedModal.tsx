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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/50 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md cirrel-modal rounded-t-[30px] md:rounded-[30px] p-6 pb-10 md:pb-6 animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 relative max-h-[85vh] overflow-y-auto text-[var(--ink)]"
      >
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="cirrel-mark w-9 h-9 rounded-[11px]">
              <Heart className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-[var(--ink)]">Saved Scooters</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved scooters"
            className="cirrel-ibtn w-9 h-9 active-press cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 relative z-10">
          {savedList.length === 0 ? (
            <div className="text-center py-12 cirrel-well rounded-[24px]">
              <div className="w-14 h-14 cirrel-glass rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-[var(--muted-ink)]" aria-hidden="true" />
              </div>
              <p className="font-bold text-[var(--ink)]">No saved scooters yet</p>
              <p className="text-sm text-[var(--muted-ink)] mt-1 px-4">
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
                  className="cirrel-well p-3 rounded-[20px] flex items-center gap-4 hover:bg-[var(--card-3)] transition-colors active-press"
                >
                  <div className="relative w-16 h-16 bg-white/95 rounded-2xl overflow-hidden shrink-0 shadow-sm p-1">
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
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-[var(--ink)] text-[14px] truncate">{scooter.name}</h4>
                      <span className="cirrel-pill shrink-0 text-[11px]">
                        {scooter.year || "2024"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-[14px] font-bold text-[var(--ink)]">
                        Rp {price.toLocaleString()}
                      </span>
                      <span className="text-[var(--muted-ink)] font-semibold text-[11px]">
                        / {durationFilter.toLowerCase()}
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
                    className="cirrel-ibtn w-8 h-8 shrink-0 active-press cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-[#ff6f66] text-[#ff6f66]" />
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
