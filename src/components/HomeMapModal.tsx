"use client"

import React, { memo } from "react"
import { Search, MapPin, Star, X, ShieldCheck, Truck, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-3">
      <div className="w-9 h-9 rounded-full border-[3px] border-black/10 border-t-black animate-spin" />
      <span className="text-xs font-bold text-gray-600">Loading Vendor Map...</span>
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
      className="fixed inset-0 z-[100] flex flex-col bg-black/70 backdrop-blur-sm md:items-center md:justify-center p-0 md:p-6 lg:p-10 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full h-[100dvh] md:h-[84vh] md:max-h-[820px] md:max-w-5xl bg-white md:rounded-[36px] md:shadow-2xl relative overflow-hidden md:border md:border-gray-200"
      >
        {/* Top Floating Control Bar */}
        <div className="absolute top-3 left-3 right-3 md:top-5 md:left-5 md:right-5 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-black text-white hover:bg-neutral-800 shadow-md flex items-center justify-center transition-transform active:scale-95 shrink-0 cursor-pointer"
              aria-label="Close Map"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Search / Filter Area Input */}
            <div className="relative flex-1 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-gray-200 flex items-center px-3.5 py-2 md:py-2.5">
              <Search className="w-4 h-4 text-black shrink-0 mr-2" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value)
                  setIsCardVisible(true)
                }}
                placeholder="Search vendor or location (e.g. Canggu, Ubud, Seminyak)..."
                aria-label="Search vendor area"
                className="w-full text-xs md:text-sm font-semibold text-black placeholder-gray-400 outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear area search"
                  className="text-gray-400 hover:text-black font-bold text-xs px-1.5 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Verified Count Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-black text-white px-3.5 py-2.5 rounded-full shadow-md text-xs font-bold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-white" aria-hidden="true" />
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
                  className={`text-[11px] md:text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-black text-white shadow-sm"
                      : "bg-white/95 backdrop-blur-md text-black hover:bg-black hover:text-white border border-gray-200"
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

        {/* Selected Vendor Floating Bottom Drawer (Only Vendor Profile) */}
        {selectedVendor && isCardVisible && (
          <article className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-auto md:max-w-md z-20 pointer-events-auto animate-in slide-in-from-bottom-4 duration-200">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 md:p-5 shadow-2xl border border-gray-200 flex flex-col gap-3">
              {/* Header Row: Vendor Avatar + Title + Rating */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Vendor Avatar */}
                  <div className="w-13 h-13 rounded-2xl bg-black text-white font-extrabold text-sm flex items-center justify-center shrink-0 border border-black/10 overflow-hidden shadow-xs relative">
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
                      <h4 className="font-extrabold text-sm md:text-base text-gray-900 leading-tight">
                        {selectedVendor.name}
                      </h4>
                      <span className="flex items-center gap-1 bg-black text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        <span>{selectedVendor.rating ? Number(selectedVendor.rating).toFixed(1) : "5.0"}</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-semibold truncate mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-black shrink-0" aria-hidden="true" />
                      <span>{selectedVendor.address || "Bali, Indonesia"}</span>
                    </p>
                  </div>
                </div>

                {/* Minimize Card Button */}
                <button
                  type="button"
                  onClick={() => setIsCardVisible(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Minimize vendor drawer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delivery Coverage Tag */}
              {selectedVendor.delivery_area && (
                <div className="text-[11px] text-gray-700 bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-black shrink-0" aria-hidden="true" />
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
                className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-xs md:text-sm py-3 px-4 rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
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
              className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer active-press"
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
