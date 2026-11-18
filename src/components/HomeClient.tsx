"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Menu,
  X,
  Heart,
  MapPin,
  Bike,
} from "lucide-react"

import ScooterCard from "@/components/ScooterCard"
import CampaignCard from "@/components/CampaignCard"
import ThemeToggle from "@/components/ThemeToggle"
import { fetchCatalogData } from "@/lib/api/catalogService"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { subscribeToPlatformSettings } from "@/utils/pricing"

// Dynamic code-split imports for heavy modals - zero JS cost until user clicks
const HomeFilterModal = dynamic(() => import("@/components/HomeFilterModal"), {
  ssr: false,
  loading: () => null,
})
const HomeSavedModal = dynamic(() => import("@/components/HomeSavedModal"), {
  ssr: false,
  loading: () => null,
})
const HomeMapModal = dynamic(() => import("@/components/HomeMapModal"), {
  ssr: false,
  loading: () => null,
})

const BRANDS = [
  { name: "Honda", icon: Bike },
  { name: "Vespa", icon: Bike },
  { name: "Yamaha", icon: Bike },
  { name: "Kawasaki", icon: Bike },
]

interface HomeClientProps {
  initialVendors?: any[]
  initialScooters?: any[]
  initialSettings?: any
}

export default function HomeClient({
  initialVendors = [],
  initialScooters = [],
  initialSettings,
}: HomeClientProps) {
  const [topVendors, setTopVendors] = useState<any[]>(initialVendors)
  const [allScooters, setAllScooters] = useState<any[]>(initialScooters)

  const [activeBrand, setActiveBrand] = useState("")
  const [durationFilter, setDurationFilter] = useState("Daily")
  const [searchQuery, setSearchQuery] = useState("")
  const [savedScooters, setSavedScooters] = useState<number[]>([])

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)

  // Filters state
  const [maxPrice, setMaxPrice] = useState(500000)
  const [selectedYear, setSelectedYear] = useState("All")

  // Map state
  const [selectedMapVendorId, setSelectedMapVendorId] = useState<number | null>(null)
  const [mapSearchQuery, setMapSearchQuery] = useState("")
  const [isMapCardVisible, setIsMapCardVisible] = useState(false)

  // Non-blocking sync: Trust initial server data on mount, only subscribe to live updates during idle
  useEffect(() => {
    let unsubscribeSettings: (() => void) | null = null
    let supabaseChannel: any = null
    let supabaseClient: any = null

    // If server passed empty data for any reason, fetch client-side
    if (initialVendors.length === 0 || initialScooters.length === 0) {
      fetchCatalogData().then((data) => {
        if (data?.vendors?.length) setTopVendors(data.vendors)
        if (data?.scooters?.length) setAllScooters(data.scooters)
      }).catch(() => {})
    }

    const scheduleIdleTask = (cb: () => void) => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(cb, { timeout: 3500 })
      } else {
        setTimeout(cb, 3000)
      }
    }

    // Defer Realtime WebSockets to background idle cycle to protect initial 0-3s FCP/LCP
    scheduleIdleTask(() => {
      unsubscribeSettings = subscribeToPlatformSettings(() => {
        fetchCatalogData({ forceRefresh: true }).then((data) => {
          if (data?.vendors?.length) setTopVendors(data.vendors)
          if (data?.scooters?.length) setAllScooters(data.scooters)
        }).catch(() => {})
      })

      try {
        supabaseClient = createBrowserClient()
        supabaseChannel = supabaseClient
          .channel('public:catalog_live_updates')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, () => {
            fetchCatalogData({ forceRefresh: true }).then((d) => d?.vendors && setTopVendors(d.vendors)).catch(() => {})
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'scooters' }, () => {
            fetchCatalogData({ forceRefresh: true }).then((d) => d?.scooters && setAllScooters(d.scooters)).catch(() => {})
          })
          .subscribe()
      } catch (e) {}
    })

    return () => {
      if (unsubscribeSettings) unsubscribeSettings()
      if (supabaseClient && supabaseChannel) {
        supabaseClient.removeChannel(supabaseChannel)
      }
    }
  }, [initialVendors.length, initialScooters.length])

  const openLocationPicker = useCallback(() => {
    setIsLocationModalOpen(true)
  }, [])

  const closeLocationPicker = useCallback(() => {
    setIsLocationModalOpen(false)
  }, [])

  const toggleSaveScooter = useCallback((e: React.MouseEvent, id: number) => {
    e.preventDefault()
    setSavedScooters((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    )
  }, [])

  // Filter Logic memoized
  const allFiltered = useMemo(() => {
    const brandLower = activeBrand ? activeBrand.toLowerCase() : ""
    const qLower = searchQuery.trim() ? searchQuery.toLowerCase() : ""

    return allScooters.filter((scooter) => {
      // Price
      const priceVal = scooter.price_daily || scooter.price
      if (typeof priceVal === "number") {
        if (priceVal > maxPrice) return false
      } else {
        const parsed = parseInt(String(priceVal || "0").replace(/[^0-9]/g, ""))
        if (!isNaN(parsed) && parsed > 0 && parsed > maxPrice) return false
      }

      // Brand
      if (brandLower) {
        const nameMatch = scooter.name && scooter.name.toLowerCase().includes(brandLower)
        const brandMatch = scooter.brand && scooter.brand.toLowerCase().includes(brandLower)
        if (!nameMatch && !brandMatch) return false
      }

      // Year
      if (selectedYear && selectedYear !== "All") {
        const sYear = scooter.year ? String(scooter.year) : "2025"
        if (sYear !== selectedYear) return false
      }

      // Search Query
      if (qLower) {
        const nameMatch = scooter.name && scooter.name.toLowerCase().includes(qLower)
        const brandMatch = scooter.brand && scooter.brand.toLowerCase().includes(qLower)
        if (!nameMatch && !brandMatch) return false
      }

      return true
    })
  }, [allScooters, maxPrice, activeBrand, selectedYear, searchQuery])

  const filteredPopular = useMemo(() => allFiltered.slice(0, 3), [allFiltered])
  const filteredRecommended = useMemo(() => allFiltered.slice(3), [allFiltered])

  // Filtered vendors for map modal
  const filteredMapVendors = useMemo(() => {
    if (!mapSearchQuery.trim()) return topVendors
    const q = mapSearchQuery.toLowerCase()
    return topVendors.filter(
      (v) =>
        v.name?.toLowerCase().includes(q) ||
        v.location?.toLowerCase().includes(q) ||
        v.address?.toLowerCase().includes(q)
    )
  }, [topVendors, mapSearchQuery])

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 pb-24 md:px-10 md:pb-28 text-[var(--ink)]">
      {/* Floating Cirrel Liquid Glass Navbar */}
      <nav aria-label="Main Navigation" className="fixed top-4 left-4 right-4 md:left-10 md:right-10 z-50 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto relative pointer-events-auto">
          <div className="cirrel-glass-hi rounded-full p-2 px-3 sm:px-4 flex justify-between items-center gap-3 transition-all duration-300">
            {/* Location Selector (Street level) */}
            <button
              onClick={openLocationPicker}
              type="button"
              aria-label="Open Vendor Location Map"
              className="flex items-center gap-2.5 text-left hover:bg-[var(--card-2)] p-1 pr-3 rounded-full transition-colors active-press cursor-pointer"
            >
              <div className="cirrel-mark w-9 h-9 rounded-full shrink-0 relative">
                <MapPin className="w-4 h-4 text-white" aria-hidden="true" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#30d158] rounded-full border-2 border-[var(--bg)] animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-wider">Nearby</span>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-bold text-[var(--ink)] leading-tight">
                    Vendor Locations
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-ink)]" aria-hidden="true" />
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <ThemeToggle className="w-9 h-9" />
              <button
                onClick={() => setIsSavedModalOpen(true)}
                type="button"
                aria-label="View saved scooters"
                className="cirrel-ibtn w-9 h-9 relative active-press cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />
                {savedScooters.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--accent-blue)] rounded-full border-2 border-[var(--bg)]" />
                )}
              </button>
              <button
                onClick={() => setIsNavOpen(!isNavOpen)}
                type="button"
                aria-label={isNavOpen ? "Close Menu" : "Open Menu"}
                className="cirrel-ibtn w-9 h-9 active-press cursor-pointer"
              >
                {isNavOpen ? <X className="w-4 h-4" aria-hidden="true" /> : <Menu className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isNavOpen && (
            <div className="absolute top-[66px] left-0 right-0 cirrel-modal rounded-[26px] p-5 sm:p-6 flex flex-col gap-2 animate-in slide-in-from-top-4 fade-in text-[var(--ink)]">
              <div className="relative z-10 flex flex-col gap-1">
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
          )}
        </div>
      </nav>

      <main className="w-full max-w-7xl mx-auto pt-24 sm:pt-28 md:pt-32">
        {/* Hero Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7 sm:mb-9">
          <div>
            <div className="cirrel-pill cirrel-pill--info mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>Verified Bali Scooter Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold leading-[1.06] text-[var(--ink)] tracking-tight">
              Find Your <br className="md:hidden" /> Perfect Ride
            </h1>
          </div>
          <p className="text-sm md:text-base text-[var(--muted-ink)] font-medium max-w-md">
            Compare trusted local scooter garages across Bali with transparent daily, weekly & monthly rates.
          </p>
        </header>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-8 md:mb-10 md:max-w-2xl md:mx-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-[var(--accent-text)]" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scooter name or brand..."
              aria-label="Search scooter name or brand"
              className="cirrel-glass w-full pl-12 pr-4 h-13 md:h-15 rounded-full outline-none text-[15px] md:text-[16px] placeholder:text-[var(--muted-ink)] text-[var(--ink)] font-medium focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            type="button"
            aria-label="Open Filter Settings"
            className="cirrel-ibtn w-13 h-13 md:w-15 md:h-15 shrink-0 hover:scale-105 active-press relative cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 md:w-6 md:h-6 text-[var(--ink)]" aria-hidden="true" />
            {(maxPrice < 500000 || selectedYear !== "All") && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[var(--accent-blue)] rounded-full border-2 border-[var(--bg)]" />
            )}
          </button>
        </div>

        {/* Promotional Campaign Card */}
        <CampaignCard />

        {/* Filter and Brands */}
        <section aria-labelledby="brands-heading" className="mb-10 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <h2 id="brands-heading" className="text-xl md:text-2xl font-bold text-[var(--ink)]">Brand & Plan</h2>

            {/* Cirrel Segmented Duration Switcher */}
            <div className="cirrel-seg inline-flex items-center self-start sm:self-auto" role="group" aria-label="Filter rental duration plan">
              {["Daily", "Weekly", "Monthly"].map((plan) => {
                const isSelected = durationFilter === plan
                return (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setDurationFilter(plan)}
                    aria-pressed={isSelected}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "cirrel-btn-primary text-white"
                        : "text-[var(--muted-ink)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {plan}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2.5 overflow-x-auto md:flex-wrap md:overflow-visible pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 items-center">
            <button
              type="button"
              onClick={() => setActiveBrand("")}
              data-active={activeBrand === ""}
              className="cirrel-chip px-5 h-11 md:h-12 text-sm whitespace-nowrap active-press cursor-pointer shrink-0"
            >
              All Brands
            </button>

            {/* Brand Chips */}
            {BRANDS.map((brand) => {
              const isActive = activeBrand === brand.name
              return (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => setActiveBrand(isActive ? "" : brand.name)}
                  aria-pressed={isActive}
                  data-active={isActive}
                  className="cirrel-chip flex items-center gap-2 px-5 h-11 md:h-12 whitespace-nowrap active-press cursor-pointer shrink-0"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? "bg-white/20 text-white" : "cirrel-well text-[var(--ink)]"}`}>
                    <brand.icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-sm">{brand.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Popular Scooters (Horizontal Carousel) */}
        <section aria-labelledby="popular-scooters-heading" className="mb-10 md:mb-12">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 id="popular-scooters-heading" className="text-xl md:text-2xl font-bold text-[var(--ink)]">Popular</h2>
            <Link href="#all-scooters" className="text-[var(--accent-text)] text-sm font-semibold hover:underline transition-colors">See all</Link>
          </div>

          {filteredPopular.length === 0 ? (
            <div className="cirrel-glass rounded-[26px] p-8 text-center text-[var(--muted-ink)] font-medium">
              No scooters found matching your filters.
            </div>
          ) : (
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-1 -mx-4 px-4 md:mx-0 md:px-0 snap-x scrollbar-hide">
              {filteredPopular.map((scooter, index) => (
                <ScooterCard
                  key={scooter.id}
                  scooter={scooter}
                  durationFilter={durationFilter}
                  isSaved={savedScooters.includes(scooter.id)}
                  onToggleSave={toggleSaveScooter}
                  isHero={index < 2}
                  variant="popular"
                />
              ))}
            </div>
          )}
        </section>

        {/* More Listings (Grid) */}
        {filteredRecommended.length > 0 && (
          <section id="all-scooters" aria-labelledby="more-listings-heading">
            <div className="flex justify-between items-end mb-4 md:mb-6">
              <h2 id="more-listings-heading" className="text-xl md:text-2xl font-bold text-[var(--ink)]">More Listings</h2>
              <span className="cirrel-pill text-xs">{filteredRecommended.length} available</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredRecommended.map((scooter) => (
                <ScooterCard
                  key={scooter.id}
                  scooter={scooter}
                  durationFilter={durationFilter}
                  isSaved={savedScooters.includes(scooter.id)}
                  onToggleSave={toggleSaveScooter}
                  variant="grid"
                />
              ))}
            </div>
          </section>
        )}

        {/* Minimal Cirrel Glass Footer Strip */}
        <footer className="mt-16 cirrel-glass rounded-[26px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[var(--muted-ink)]">
          <div className="relative z-10 flex items-center gap-3">
            <div className="cirrel-mark w-8 h-8 rounded-[10px]">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[var(--ink)] font-bold block">THE BIKE RENTAL BALI</span>
              <span>&copy; {new Date().getFullYear()} All rights reserved</span>
            </div>
          </div>
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[var(--ink-2)]">
            <Link href="/about" className="hover:text-[var(--accent-text)] transition-colors">About</Link>
            <Link href="/how-it-works" className="hover:text-[var(--accent-text)] transition-colors">How it Works</Link>
            <Link href="/faq" className="hover:text-[var(--accent-text)] transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-[var(--accent-text)] transition-colors">Contact</Link>
            <Link href="/partnersignup" className="text-[var(--accent-text)] hover:underline">Partner Portal</Link>
          </div>
        </footer>

        {/* Filter Modal */}
        {isFilterOpen && (
          <HomeFilterModal
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />
        )}

        {/* Saved Scooters Modal */}
        {isSavedModalOpen && (
          <HomeSavedModal
            isOpen={isSavedModalOpen}
            onClose={() => setIsSavedModalOpen(false)}
            savedScooters={savedScooters}
            allScooters={allScooters}
            durationFilter={durationFilter}
            onToggleSave={toggleSaveScooter}
          />
        )}

        {/* Dynamic Location & Vendor Map Modal */}
        {isLocationModalOpen && (
          <HomeMapModal
            isOpen={isLocationModalOpen}
            onClose={closeLocationPicker}
            vendors={filteredMapVendors}
            selectedVendorId={selectedMapVendorId}
            onSelectVendor={(id) => setSelectedMapVendorId(typeof id === "number" ? id : Number(id) || null)}
            searchQuery={mapSearchQuery}
            onSearchChange={setMapSearchQuery}
            isCardVisible={isMapCardVisible}
            setIsCardVisible={setIsMapCardVisible}
          />
        )}
      </main>
    </div>
  )
}
