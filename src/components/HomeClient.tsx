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
import VendorStoryItem from "@/components/VendorStoryItem"
import HomeFilterModal from "@/components/HomeFilterModal"
import HomeSavedModal from "@/components/HomeSavedModal"
import { fetchCatalogData } from "@/lib/api/catalogService"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import { subscribeToPlatformSettings } from "@/utils/pricing"

// Dynamic import for the heavy map modal with SSR disabled
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

  useEffect(() => {
    async function loadData(forceRefresh = false) {
      try {
        const data = await fetchCatalogData({ forceRefresh })
        if (data?.vendors && Array.isArray(data.vendors)) {
          setTopVendors(data.vendors)
        }
        if (data?.scooters && Array.isArray(data.scooters)) {
          setAllScooters(data.scooters)
        }
      } catch (err) {
        console.error("Failed to load catalog data:", err)
      }
    }

    // Always run instant client sync on mount to ensure newly added vendors show up immediately
    loadData(true)

    const unsubscribe = subscribeToPlatformSettings(() => {
      loadData(true)
    })

    // Supabase Realtime Sync for Vendors and Scooters
    const supabase = createBrowserClient()
    const channel = supabase
      .channel('public:catalog_live_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, () => {
        loadData(true)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scooters' }, () => {
        loadData(true)
      })
      .subscribe()

    return () => {
      unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [])

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
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] px-6 pb-24 md:px-12 md:pb-32">
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
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 shadow-xs relative">
                <MapPin className="w-4 h-4 text-white" aria-hidden="true" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-black rounded-full border-2 border-white animate-pulse" />
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
                  <span className="text-[11px] font-bold bg-black text-white px-3 py-1 rounded-full">Sign In / Sign Up</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="w-full max-w-7xl mx-auto pt-28 sm:pt-32 md:pt-36 lg:pt-40">
        {/* Header */}
        <header className="flex justify-between items-start mb-6 sm:mb-8 md:mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-heading font-extrabold leading-[1.08] text-gray-900 tracking-tight">
              Find Your <br className="md:hidden" /> Perfect Ride
            </h1>
          </div>
          <button
            onClick={() => setIsSavedModalOpen(true)}
            type="button"
            aria-label="View saved scooters"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 shrink-0 hover:bg-gray-50 transition-all relative active-press cursor-pointer"
          >
            <Heart className="w-5 h-5 text-black" aria-hidden="true" />
            {savedScooters.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-black rounded-full border-2 border-white"></span>
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
              className="w-full pl-12 pr-4 h-14 md:h-16 bg-white border border-transparent focus:border-black/20 rounded-full focus:ring-2 focus:ring-black outline-none text-[15px] md:text-[16px] placeholder:text-gray-400 text-gray-900 font-medium shadow-sm transition-all"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            type="button"
            aria-label="Open Filter Settings"
            className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-gray-100 transition-transform hover:scale-105 active-press relative cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 md:w-6 md:h-6 text-gray-700" aria-hidden="true" />
            {(maxPrice < 500000 || selectedYear !== "All") && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-black rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        {/* Top Vendors (Story Layout) */}
        {topVendors.length > 0 && (
          <section aria-labelledby="nearby-vendors-heading" className="mb-10 md:mb-12">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 id="nearby-vendors-heading" className="text-xl md:text-2xl font-bold text-gray-900">Nearby Vendors</h2>
            </div>
            <div className="flex gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
              {topVendors.map((vendor, idx) => (
                <VendorStoryItem key={vendor.id} vendor={vendor} isEager={idx < 3} />
              ))}
            </div>
          </section>
        )}

        {/* Filter and Brands */}
        <section aria-labelledby="brands-heading" className="mb-10 md:mb-12">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 id="brands-heading" className="text-xl md:text-2xl font-bold text-gray-900">Brand</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto md:flex-wrap md:justify-center md:overflow-visible pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 items-center">
            {/* Duration Dropdown */}
            <div className="relative shrink-0">
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                aria-label="Filter rental duration plan"
                className="appearance-none bg-black text-white pl-5 pr-10 h-12 md:h-14 md:text-[16px] rounded-full font-bold text-[15px] outline-none border border-black shadow-sm flex items-center cursor-pointer focus:ring-2 focus:ring-black transition-all hover:scale-105 active-press"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
              <ChevronDown className="w-4 h-4 text-white absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>

            {/* Brand Chips */}
            {BRANDS.map((brand) => {
              const isActive = activeBrand === brand.name
              return (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => setActiveBrand(isActive ? "" : brand.name)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 px-5 h-12 md:h-14 md:px-6 rounded-full whitespace-nowrap transition-all shadow-sm hover:scale-105 active-press cursor-pointer ${
                    isActive
                      ? "bg-black text-white font-bold shadow-md scale-105"
                      : "bg-white text-gray-800 border border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center ${isActive ? "bg-white/20 text-white" : "bg-gray-100"}`}>
                    <brand.icon className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
                  </div>
                  <span className="font-bold text-sm md:text-base">{brand.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Popular Scooters (Horizontal Carousel) */}
        <section aria-labelledby="popular-scooters-heading" className="mb-10 md:mb-12">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 id="popular-scooters-heading" className="text-xl md:text-2xl font-bold text-gray-900">Popular</h2>
            <Link href="#all-scooters" className="text-gray-400 text-sm font-semibold hover:text-black transition-colors">See all</Link>
          </div>

          {filteredPopular.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-gray-500 font-medium shadow-sm border border-gray-100">
              No scooters found matching your filters.
            </div>
          ) : (
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-1 px-1 -mx-6 px-6 md:mx-0 md:px-0 snap-x scrollbar-hide">
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
              <h2 id="more-listings-heading" className="text-xl md:text-2xl font-bold text-gray-900">More Listings</h2>
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
