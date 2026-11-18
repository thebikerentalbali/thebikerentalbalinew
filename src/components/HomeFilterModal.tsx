"use client"

import React, { memo } from "react"
import { X, SlidersHorizontal } from "lucide-react"

interface HomeFilterModalProps {
  isOpen: boolean
  onClose: () => void
  maxPrice: number
  setMaxPrice: (price: number) => void
  selectedYear: string
  setSelectedYear: (year: string) => void
}

function HomeFilterModalComponent({
  isOpen,
  onClose,
  maxPrice,
  setMaxPrice,
  selectedYear,
  setSelectedYear,
}: HomeFilterModalProps) {
  if (!isOpen) return null

  return (
    <aside
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Filter Options"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/50 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md cirrel-modal rounded-t-[30px] md:rounded-[30px] p-6 pb-10 md:pb-6 animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 relative text-[var(--ink)]"
      >
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="cirrel-mark w-9 h-9 rounded-[11px]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-[var(--ink)]">Filters</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="cirrel-ibtn w-9 h-9 active-press cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6 relative z-10">
          {/* Max Price Filter */}
          <div className="cirrel-well rounded-[20px] p-4">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-sm font-semibold text-[var(--ink-2)]">Max Daily Price</span>
              <span className="text-sm font-bold text-[var(--accent-text)]">
                Rp {maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="500000"
              step="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-label="Max daily price slider"
              className="w-full accent-[#0a84ff] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-semibold text-[var(--muted-ink)] mt-1.5">
              <span>Rp 50k</span>
              <span>Rp 500k+</span>
            </div>
          </div>

          {/* Production Year Filter */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-[var(--ink-2)]">Production Year</span>
              {selectedYear !== "All" && (
                <button
                  type="button"
                  onClick={() => setSelectedYear("All")}
                  className="text-xs font-bold text-[var(--accent-text)] hover:underline transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", "2025", "2024", "2023", "2022", "2021", "2020"].map((year) => {
                const isSelected = selectedYear === year
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    data-active={isSelected}
                    className="cirrel-chip px-4 py-2 text-xs md:text-sm active-press cursor-pointer"
                  >
                    {year === "All" ? "All Years" : year}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="relative z-10 w-full cirrel-btn-primary font-bold text-base py-3.5 mt-7 active-press cursor-pointer"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  )
}

export default memo(HomeFilterModalComponent)
