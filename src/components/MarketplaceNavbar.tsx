"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ChevronDown, Menu, X, Heart, ShoppingCart } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"
import { fetchCatalogData } from "@/lib/api/catalogService"
import {
  SavedBooking,
  getSavedBookings,
  removeSavedBooking,
  clearSavedBookings,
  subscribeToSavedBookings,
} from "@/utils/myBookings"

const HomeSavedModal = dynamic(() => import("@/components/HomeSavedModal"), {
  ssr: false,
  loading: () => null,
})
const HomeBookingsModal = dynamic(() => import("@/components/HomeBookingsModal"), {
  ssr: false,
  loading: () => null,
})
const HomeMapModal = dynamic(() => import("@/components/HomeMapModal"), {
  ssr: false,
  loading: () => null,
})

const SAVED_SCOOTERS_KEY = "tbrb_saved_scooters"

export function readStoredSavedScooters(): number[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(SAVED_SCOOTERS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : []
  } catch {
    return []
  }
}

export function writeStoredSavedScooters(ids: number[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SAVED_SCOOTERS_KEY, JSON.stringify(ids))
    window.dispatchEvent(new Event("saved_scooters_updated"))
  } catch {}
}

interface MarketplaceNavbarProps {
  vendors?: any[]
  allScooters?: any[]
  savedScooters?: number[]
  durationFilter?: string
  onToggleSave?: (e: React.MouseEvent, id: number) => void
  isLocationModalOpen?: boolean
  onOpenLocationModal?: () => void
  onCloseLocationModal?: () => void
  compactSpacing?: boolean
}

export default function MarketplaceNavbar({
  vendors: externalVendors,
  allScooters: externalScooters,
  savedScooters: externalSavedScooters,
  durationFilter = "Daily",
  onToggleSave: externalToggleSave,
  isLocationModalOpen: controlledMapOpen,
  onOpenLocationModal,
  onCloseLocationModal,
  compactSpacing = false,
}: MarketplaceNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false)
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false)
  const [internalMapOpen, setInternalMapOpen] = useState(false)

  const [savedBookings, setSavedBookings] = useState<SavedBooking[]>([])
  const [internalSavedIds, setInternalSavedIds] = useState<number[]>([])
  const [lazyVendors, setLazyVendors] = useState<any[]>([])
  const [lazyScooters, setLazyScooters] = useState<any[]>([])

  const [selectedMapVendorId, setSelectedMapVendorId] = useState<number | null>(null)
  const [mapSearchQuery, setMapSearchQuery] = useState("")
  const [isMapCardVisible, setIsMapCardVisible] = useState(false)

  const isMapOpen = controlledMapOpen !== undefined ? controlledMapOpen : internalMapOpen
  const savedIds = externalSavedScooters !== undefined ? externalSavedScooters : internalSavedIds
  const activeVendors = externalVendors !== undefined ? externalVendors : lazyVendors
  const activeScooters = externalScooters !== undefined ? externalScooters : lazyScooters

  useEffect(() => {
    setSavedBookings(getSavedBookings())
    const unsubBookings = subscribeToSavedBookings((updated) => setSavedBookings(updated))

    setInternalSavedIds(readStoredSavedScooters())
    const syncSaved = () => setInternalSavedIds(readStoredSavedScooters())
    window.addEventListener("saved_scooters_updated", syncSaved)
    window.addEventListener("storage", syncSaved)

    return () => {
      unsubBookings()
      window.removeEventListener("saved_scooters_updated", syncSaved)
      window.removeEventListener("storage", syncSaved)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lazily fetch catalog only when a modal needing it is opened standalone
  useEffect(() => {
    if (!isMapOpen && !isSavedModalOpen) return
    if (externalVendors !== undefined && externalScooters !== undefined) return
    if (lazyVendors.length > 0 && lazyScooters.length > 0) return

    fetchCatalogData()
      .then((data) => {
        if (data?.vendors?.length) setLazyVendors(data.vendors)
        if (data?.scooters?.length) setLazyScooters(data.scooters)
      })
      .catch(() => {})
  }, [isMapOpen, isSavedModalOpen, externalVendors, externalScooters, lazyVendors.length, lazyScooters.length])

  const openMap = useCallback(() => {
    if (onOpenLocationModal) {
      onOpenLocationModal()
    } else {
      setInternalMapOpen(true)
    }
  }, [onOpenLocationModal])

  const closeMap = useCallback(() => {
    if (onCloseLocationModal) {
      onCloseLocationModal()
    } else {
      setInternalMapOpen(false)
    }
  }, [onCloseLocationModal])

  const handleToggleSave = useCallback(
    (e: React.MouseEvent, id: number) => {
      if (externalToggleSave) {
        externalToggleSave(e, id)
        return
      }
      e.preventDefault()
      const current = readStoredSavedScooters()
      const next = current.includes(id)
        ? current.filter((sId) => sId !== id)
        : [...current, id]
      writeStoredSavedScooters(next)
      setInternalSavedIds(next)
    },
    [externalToggleSave]
  )

  const filteredMapVendors = useMemo(() => {
    if (!mapSearchQuery.trim()) return activeVendors
    const q = mapSearchQuery.toLowerCase()
    return activeVendors.filter(
      (v) =>
        v.name?.toLowerCase().includes(q) ||
        v.location?.toLowerCase().includes(q) ||
        v.address?.toLowerCase().includes(q)
    )
  }, [activeVendors, mapSearchQuery])

  const renderControlsRow = (isFloating: boolean) => (
    <>
      <button
        onClick={openMap}
        type="button"
        tabIndex={isFloating && !isScrolled ? -1 : 0}
        aria-label="Open Vendor Location Map"
        className={`flex flex-col text-left py-1 rounded-full transition-colors active-press cursor-pointer min-w-0 ${
          isFloating ? "hover:bg-[var(--card-2)] px-2.5" : "pr-2"
        }`}
      >
        <span className="text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-wider leading-tight">
          Nearby
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[13px] sm:text-sm font-bold text-[var(--ink)] leading-tight truncate">
            Vendor Locations
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-ink)] shrink-0" aria-hidden="true" />
        </div>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle className="w-9 h-9" />
        <button
          onClick={() => setIsSavedModalOpen(true)}
          type="button"
          tabIndex={isFloating && !isScrolled ? -1 : 0}
          aria-label="View saved scooters"
          className="cirrel-ibtn w-9 h-9 relative active-press cursor-pointer"
        >
          <Heart className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />
          {savedIds.length > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--accent-blue)] rounded-full border-2 border-[var(--bg)]" />
          )}
        </button>
        <button
          onClick={() => setIsBookingsModalOpen(true)}
          type="button"
          tabIndex={isFloating && !isScrolled ? -1 : 0}
          aria-label="View completed bookings"
          className="cirrel-ibtn w-9 h-9 relative active-press cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />
          {savedBookings.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[var(--accent-blue)] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[var(--bg)]">
              {savedBookings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setIsNavOpen((prev) => !prev)}
          type="button"
          tabIndex={isFloating && !isScrolled ? -1 : 0}
          aria-label={isNavOpen ? "Close Menu" : "Open Menu"}
          className="cirrel-ibtn w-9 h-9 active-press cursor-pointer"
        >
          {isNavOpen ? <X className="w-4 h-4" aria-hidden="true" /> : <Menu className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Animated Floating Cirrel Liquid Glass Navbar (appears on scroll, disappears at top) */}
      <nav
        aria-label="Main Navigation"
        aria-hidden={!isScrolled}
        className={`fixed top-3 sm:top-4 left-4 right-4 md:left-10 md:right-10 z-50 transition-all duration-300 ease-out ${
          isScrolled
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-4 scale-[0.98] pointer-events-none"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto relative">
          <div className="cirrel-glass-hi rounded-full p-2 px-3 sm:px-4 flex justify-between items-center gap-3">
            {renderControlsRow(true)}
          </div>
        </div>
      </nav>

      {/* Dropdown Menu */}
      {isNavOpen && (
        <div className="fixed top-[68px] sm:top-[76px] left-4 right-4 md:left-10 md:right-10 z-50 pointer-events-none">
          <div className="w-full max-w-7xl mx-auto pointer-events-auto">
            <div className="cirrel-modal rounded-[26px] p-5 sm:p-6 flex flex-col gap-2 animate-in slide-in-from-top-4 fade-in text-[var(--ink)]">
              <div className="relative z-10 flex flex-col gap-1">
                <Link href="/" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[15px] font-semibold text-[var(--ink)] px-3 py-2.5 rounded-2xl hover:bg-[var(--card-2)] transition-colors">Home</Link>
                <Link href="/about" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[15px] font-semibold text-[var(--ink)] px-3 py-2.5 rounded-2xl hover:bg-[var(--card-2)] transition-colors">About Us</Link>
                <Link href="/how-it-works" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[15px] font-semibold text-[var(--ink)] px-3 py-2.5 rounded-2xl hover:bg-[var(--card-2)] transition-colors">How it Works</Link>
                <Link href="/faq" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[15px] font-semibold text-[var(--ink)] px-3 py-2.5 rounded-2xl hover:bg-[var(--card-2)] transition-colors">FAQ</Link>
                <Link href="/contact" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[15px] font-semibold text-[var(--ink)] px-3 py-2.5 rounded-2xl hover:bg-[var(--card-2)] transition-colors">Contact Support</Link>

                <div className="h-px bg-[var(--line)] my-2" />

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-[var(--muted-ink)] uppercase tracking-wider px-3">Partners</span>
                  <Link href="/partnersignup" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[15px] font-semibold text-[var(--ink)] px-3 py-2 rounded-2xl hover:bg-[var(--card-2)] transition-colors flex justify-between items-center group">
                    <span>Partner Portal</span>
                    <span className="cirrel-btn-primary text-[11px] font-bold px-3.5 py-1.5">Sign In / Sign Up</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flat unboxed Top Controls at Page Top */}
      <div
        className={`w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-5 sm:pt-7 transition-opacity duration-300 ${
          compactSpacing ? "mb-4 sm:mb-6" : "mb-10 sm:mb-12 md:mb-14"
        } ${isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <div className="flex justify-between items-center gap-3">
          {renderControlsRow(false)}
        </div>
      </div>

      {/* Modals */}
      {isSavedModalOpen && (
        <HomeSavedModal
          isOpen={isSavedModalOpen}
          onClose={() => setIsSavedModalOpen(false)}
          savedScooters={savedIds}
          allScooters={activeScooters}
          durationFilter={durationFilter}
          onToggleSave={handleToggleSave}
        />
      )}

      {isBookingsModalOpen && (
        <HomeBookingsModal
          isOpen={isBookingsModalOpen}
          onClose={() => setIsBookingsModalOpen(false)}
          bookings={savedBookings}
          onRemoveBooking={(id) => setSavedBookings(removeSavedBooking(id))}
          onClearBookings={() => setSavedBookings(clearSavedBookings())}
        />
      )}

      {isMapOpen && (
        <HomeMapModal
          isOpen={isMapOpen}
          onClose={closeMap}
          vendors={filteredMapVendors}
          selectedVendorId={selectedMapVendorId}
          onSelectVendor={(id) => setSelectedMapVendorId(typeof id === "number" ? id : Number(id) || null)}
          searchQuery={mapSearchQuery}
          onSearchChange={setMapSearchQuery}
          isCardVisible={isMapCardVisible}
          setIsCardVisible={setIsMapCardVisible}
        />
      )}
    </>
  )
}
