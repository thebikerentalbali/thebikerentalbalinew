"use client"

import React, { memo } from "react"
import { Search, MapPin, X, ShieldCheck, Truck, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg)] gap-3">
      <div className="w-9 h-9 rounded-full border-[3px] border-[var(--line-2)] border-t-[var(--accent-blue)] animate-spin" />
      <span className="text-xs font-bold text-[var(--muted-ink)]">Loading Vendor Map...</span>
    </div>
  ),
})

interface HomeMapModalProps {
  isOpen: boolean
  onClose: () => void
  vendors: any[]
  selectedVendorId: number | string | null
  onSelectVendor: (id: number | string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  isCardVisible: boolean
  setIsCardVisible: (visible: boolean) => void
}

function HomeMapModalComponent({
  isOpen,
  onClose,
  vendors,
  selectedVendorId,
  onSelectVendor,
  searchQuery,
  onSearchChange,
  isCardVisible,
  setIsCardVisible,
}: HomeMapModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const selectedVendor =
    vendors.find((v) => String(v.id) === String(selectedVendorId)) || vendors[0] || null

  return (
    <aside
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vendor Profile Map"
      className="fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-md md:items-center md:justify-center p-0 md:p-6 lg:p-10 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full h-[100dvh] md:h-[84vh] md:max-h-[820px] md:max-w-5xl cirrel-modal md:rounded-[30px] relative overflow-hidden"
      >
        {/* Top Floating Control Bar */}
        <div className="absolute top-3 left-3 right-3 md:top-5 md:left-5 md:right-5 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="cirrel-ibtn w-10 h-10 md:w-11 md:h-11 active:scale-95 shrink-0 cursor-pointer"
              aria-label="Close Map"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Search / Filter Area Input */}
            <div className="relative flex-1 cirrel-glass-hi rounded-full flex items-center px-3.5 py-2 md:py-2.5">
              <Search className="w-4 h-4 text-[var(--accent-text)] shrink-0 mr-2" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value)
                  setIsCardVisible(true)
                }}
                placeholder="Search vendor or location (e.g. Canggu, Ubud, Seminyak)..."
                aria-label="Search vendor area"
                className="w-full text-xs md:text-sm font-semibold text-[var(--ink)] placeholder:text-[var(--muted-ink)] outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear area search"
                  className="text-[var(--muted-ink)] hover:text-[var(--ink)] font-bold text-xs px-1.5 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Verified Count Badge */}
            <div className="hidden sm:flex items-center gap-1.5 cirrel-btn-primary px-3.5 py-2.5 text-xs font-bold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{vendors.length} Verified Partners</span>
            </div>
          </div>

          {/* Quick Area Filter Pills */}
          <nav aria-label="Area filter" className="flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto scrollbar-hide -mx-1 px-1">
            {["All Bali", "Canggu", "Seminyak", "Ubud", "Sanur", "Kuta", "Uluwatu", "Nusa Dua"].map((area) => {
              const isSelected =
                area === "All Bali" ? !searchQuery : searchQuery.toLowerCase() === area.toLowerCase()
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => {
                    onSearchChange(area === "All Bali" ? "" : area)
                    setIsCardVisible(true)
                  }}
                  data-active={isSelected}
                  className={`text-[11px] md:text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "cirrel-btn-primary"
                      : "cirrel-glass-hi text-[var(--ink)] hover:opacity-90"
                  }`}
                >
                  {area}
                </button>
              )
            })}
          </nav>
        </div>

        {/* MAP COMPONENT */}
        <div className="flex-1 w-full h-full relative z-0">
          <MapPicker
            vendors={vendors}
            selectedVendorId={selectedVendor?.id}
            onVendorClick={(id) => {
              onSelectVendor(id)
              setIsCardVisible(true)
            }}
            className="w-full h-full"
          />
        </div>

        {/* Selected Vendor Floating Bottom Drawer */}
        {selectedVendor && isCardVisible && (
          <article className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-auto md:max-w-md z-20 pointer-events-auto animate-in slide-in-from-bottom-4 duration-200">
            <div className="cirrel-modal rounded-[26px] p-4 md:p-5 flex flex-col gap-3 text-[var(--ink)]">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl cirrel-mark font-bold text-sm shrink-0 overflow-hidden relative">
                    {selectedVendor.logo || selectedVendor.logo_url || selectedVendor.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedVendor.logo || selectedVendor.logo_url || selectedVendor.image_url}
                        alt={selectedVendor.name || "Vendor profile"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span>{selectedVendor.initials || "VN"}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm md:text-base text-[var(--ink)] leading-tight">
                        {selectedVendor.name}
                      </h4>
                      <span className="cirrel-pill cirrel-pill--good text-[10px] shrink-0">
                        <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                        <span>Verified</span>
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-ink)] font-semibold truncate mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" aria-hidden="true" />
                      <span>{selectedVendor.address || "Bali, Indonesia"}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCardVisible(false)}
                  className="cirrel-ibtn w-7 h-7 cursor-pointer shrink-0"
                  aria-label="Minimize vendor drawer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delivery Coverage Tag */}
              {selectedVendor.delivery_area && (
                <div className="relative z-10 text-[11px] text-[var(--ink-2)] cirrel-well px-3 py-2 rounded-xl flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" aria-hidden="true" />
                  <span className="truncate"><strong>Delivery Area:</strong> {selectedVendor.delivery_area}</span>
                </div>
              )}

              {/* CTA Button to Vendor Profile */}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  router.push(`/vendor/${selectedVendor.id}?fromMap=true`)
                }}
                className="relative z-10 w-full cirrel-btn-primary font-bold text-xs md:text-sm py-3 px-4 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Vendor Profile & Fleet</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        )}

        {/* Show card pill button if minimized */}
        {selectedVendor && !isCardVisible && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsCardVisible(true)}
              className="cirrel-btn-primary text-xs font-bold px-4 py-2.5 flex items-center gap-2 cursor-pointer active-press"
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Show {selectedVendor.name} Profile</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default memo(HomeMapModalComponent)
