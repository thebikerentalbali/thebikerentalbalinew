"use client"

import React, { memo } from "react"
import { X } from "lucide-react"

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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] p-6 pb-12 md:pb-6 shadow-xl animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 relative"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Filters</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors active-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Max Price Filter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-700">Max Daily Price</span>
              <span className="text-sm font-extrabold text-gray-900">
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
              className="w-full accent-black cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-1">
              <span>Rp 50k</span>
              <span>Rp 500k+</span>
            </div>
          </div>

          {/* Production Year Filter */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-gray-700">Production Year</span>
              {selectedYear !== "All" && (
                <button
                  type="button"
                  onClick={() => setSelectedYear("All")}
                  className="text-xs font-bold text-gray-500 hover:text-black transition-colors"
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
                    className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all active-press cursor-pointer ${
                      isSelected
                        ? "bg-black text-white shadow-xs scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
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
          className="w-full bg-black text-white font-bold text-lg py-4 rounded-2xl mt-8 shadow-md hover:bg-neutral-800 transition-colors active-press cursor-pointer"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  )
}

export default memo(HomeFilterModalComponent)
