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
  Flame,
  Zap,
} from "lucide-react"

import ScooterCard from "@/components/ScooterCard"
import VendorStoryItem from "@/components/VendorStoryItem"
import HomeFilterModal from "@/components/HomeFilterModal"
import HomeSavedModal from "@/components/HomeSavedModal"
import { fetchCatalogData } from "@/lib/api/catalogService"
import { subscribeToPlatformSettings } from "@/utils/pricing"

// Dynamic import for the heavy map modal with SSR disabled
const HomeMapModal = dynamic(() => import("@/components/HomeMapModal"), {
  ssr: false,
  loading: () => null,
})

const BRANDS = [
  { name: "Honda", icon: Flame },
  { name: "Vespa", icon: Zap },
  { name: "Yamaha", icon: Flame },
  { name: "Kawasaki", icon: Zap },
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

  useEffect(() => {
    async function loadData(forceRefresh = false) {
      try {
        const data = await fetchCatalogData({ forceRefresh })
        if (data?.vendors) setTopVendors(data.vendors)
        if (data?.scooters) setAllScooters(data.scooters)
      } catch (err) {
        console.error("Failed to load catalog data:", err)
      }
    }

    if (initialVendors.length === 0 || initialScooters.length === 0) {
      loadData()
    }

    const unsubscribe = subscribeToPlatformSettings(() => {
      loadData(true)
    })

    return () => unsubscribe()
  }, [initialVendors, initialScooters, initialSettings])

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
    <div className="flex flex-col min-h-screen bg-[#0A0A0C] text-white px-5 pb-24 sm:px-8 md:px-12 md:pb-32 selection:bg-white selection:text-black">
      {/* Floating Navbar - Always Visible */}
      <nav aria-label="Main Navigation" className="fixed top-4 left-4 right-4 md:left-12 md:right-12 z-50 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto relative pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/40 shadow-xl rounded-full p-2.5 px-4 sm:px-5 flex justify-between items-center transition-all duration-300">
            {/* Location Selector (Street level) */}
            <button
              onClick={openLocationPicker}
              type="button"
              aria-label="Open Vendor Location Map"
              className="flex items-center gap-2.5 text-left hover:bg-black/5 p-1.5 pr-3 rounded-full transition-colors active-press cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nearby</span>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-bold text-black leading-tight">
                    Vendor Locations
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-700" aria-hidden="true" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              type="button"
              aria-label={isNavOpen ? "Close Menu" : "Open Menu"}
              className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black transition-colors active-press cursor-pointer"
            >
              {isNavOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>

          {/* Dropdown Menu */}
          {isNavOpen && (
            <div className="absolute top-[70px] left-0 right-0 bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 fade-in text-black">
              <Link href="/about" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[16px] font-bold text-black px-2 py-1 hover:text-neutral-600 transition-colors">About Us</Link>
              <Link href="/how-it-works" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[16px] font-bold text-black px-2 py-1 hover:text-neutral-600 transition-colors">How it Works</Link>
              <Link href="/faq" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[16px] font-bold text-black px-2 py-1 hover:text-neutral-600 transition-colors">FAQ</Link>
              <Link href="/contact" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[16px] font-bold text-black px-2 py-1 hover:text-neutral-600 transition-colors">Contact Support</Link>

              <div className="h-[1px] bg-gray-200 my-1"></div>

              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-extrabold text-gray-400 uppercase tracking-wider px-2">Partners</span>
                <Link href="/partnersignup" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[16px] font-bold text-black px-2 py-1 hover:text-neutral-600 transition-colors flex justify-between items-center group">
                  Partner Portal
                  <span className="text-[11px] font-bold bg-black text-white px-2.5 py-1 rounded-full shadow-xs">Sign In / Sign Up</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="w-full max-w-7xl mx-auto mt-24 sm:mt-28 md:mt-32">
        {/* Header */}
        <header className="flex justify-between items-start mb-6 sm:mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-[1.1] text-white tracking-tight">
              Find Your <br className="md:hidden" /> Perfect Ride
            </h1>
          </div>
          <button
            onClick={() => setIsSavedModalOpen(true)}
            type="button"
            aria-label="View saved scooters"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-white/20 shrink-0 hover:bg-neutral-100 transition-all relative active-press cursor-pointer"
          >
            <Heart className="w-5 h-5 text-black" aria-hidden="true" />
            {savedScooters.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </header>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-8 md:mb-12 md:max-w-2xl md:mx-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scooter name or brand..."
              aria-label="Search scooter name or brand"
              className="w-full pl-12 pr-4 h-14 md:h-16 bg-white border-none rounded-full focus:ring-0 outline-none text-[15px] md:text-[16px] placeholder:text-gray-400 text-black font-semibold shadow-xl"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            type="button"
            aria-label="Open Filter Settings"
            className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-xl shrink-0 border border-white/20 transition-transform hover:scale-105 active-press relative cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 md:w-6 md:h-6 text-black" aria-hidden="true" />
            {(maxPrice < 500000 || selectedYear !== "All") && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-black rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        {/* Top Vendors (Story Layout) */}
        {topVendors.length > 0 && (
          <section aria-labelledby="nearby-vendors-heading" className="mb-10 md:mb-14">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 id="nearby-vendors-heading" className="text-xl md:text-2xl font-extrabold text-white">Nearby Vendors</h2>
              <button
                type="button"
                onClick={() => {
                  setIsMapCardVisible(true)
                  openLocationPicker()
                }}
                className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-black bg-white hover:bg-neutral-100 px-4 py-2 rounded-full shadow-md transition-all active-press cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Explore Map</span>
              </button>
            </div>
            <div className="flex gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-2 scrollbar-hide -mx-5 px-5 sm:-mx-8 sm:px-8 md:mx-0 md:px-0">
              {topVendors.map((vendor, idx) => (
                <VendorStoryItem key={vendor.id} vendor={vendor} isEager={idx < 3} />
              ))}
            </div>
          </section>
        )}

        {/* Filter and Brands */}
        <section aria-labelledby="brands-heading" className="mb-10 md:mb-14">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 id="brands-heading" className="text-xl md:text-2xl font-extrabold text-white">Brand</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto md:flex-wrap md:justify-center md:overflow-visible pb-2 scrollbar-hide -mx-5 px-5 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 items-center">
            {/* Duration Dropdown (White Rounded Pill) */}
            <div className="relative shrink-0">
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                aria-label="Filter rental duration plan"
                className="appearance-none bg-white text-black pl-5 pr-10 h-12 md:h-14 md:text-[16px] rounded-full font-extrabold text-[15px] outline-none border-none shadow-xl flex items-center cursor-pointer focus:ring-0 transition-transform hover:scale-105 active-press"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
              <ChevronDown className="w-4 h-4 text-black absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>

            {/* Brand Chips (White Rounded Pills) */}
            {BRANDS.map((brand) => {
              const isActive = activeBrand === brand.name
              return (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => setActiveBrand(isActive ? "" : brand.name)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 px-5 h-12 md:h-14 md:px-6 rounded-full whitespace-nowrap transition-all shadow-xl hover:scale-105 active-press ${
                    isActive
                      ? "bg-white text-black ring-4 ring-white/30 font-black"
                      : "bg-white/90 text-black hover:bg-white font-bold"
                  }`}
                >
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center bg-black text-white">
                    <brand.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-sm md:text-base">{brand.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Popular Scooters (Horizontal Carousel) */}
        <section aria-labelledby="popular-scooters-heading" className="mb-10 md:mb-14">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 id="popular-scooters-heading" className="text-xl md:text-2xl font-extrabold text-white">Popular</h2>
            <Link href="#all-scooters" className="text-gray-400 text-sm font-bold hover:text-white transition-colors">See all</Link>
          </div>

          {filteredPopular.length === 0 ? (
            <div className="bg-white text-black rounded-[32px] p-8 text-center font-bold shadow-xl">
              No scooters found matching your filters.
            </div>
          ) : (
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-1 px-1 -mx-5 px-5 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 snap-x scrollbar-hide">
              {filteredPopular.map((scooter, index) => (
                <ScooterCard
                  key={scooter.id}
                  scooter={scooter}
                  durationFilter={durationFilter}
                  isSaved={savedScooters.includes(scooter.id)}
                  onToggleSave={toggleSaveScooter}
                  isHero={index === 0}
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
              <h2 id="more-listings-heading" className="text-xl md:text-2xl font-extrabold text-white">More Listings</h2>
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

        {/* Filter Modal */}
        <HomeFilterModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />

        {/* Saved Scooters Modal */}
        <HomeSavedModal
          isOpen={isSavedModalOpen}
          onClose={() => setIsSavedModalOpen(false)}
          savedScooters={savedScooters}
          allScooters={allScooters}
          durationFilter={durationFilter}
          onToggleSave={toggleSaveScooter}
        />

        {/* Dynamic Location & Vendor Map Modal */}
        {isLocationModalOpen && (
          <HomeMapModal
            isOpen={isLocationModalOpen}
            onClose={closeLocationPicker}
            vendors={filteredMapVendors}
            selectedVendorId={selectedMapVendorId}
            onSelectVendor={setSelectedMapVendorId}
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
