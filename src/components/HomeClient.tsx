"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Heart, Search, SlidersHorizontal, MapPin, ChevronDown, Menu, X, Bike } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { fetchCatalogData } from "@/lib/api/catalogService"
import { clientCache } from "@/lib/cache/clientCache"
import { subscribeToPlatformSettings, PlatformSettings } from "@/utils/pricing"
import ScooterCard from "@/components/ScooterCard"
import VendorStoryItem from "@/components/VendorStoryItem"
import HomeFilterModal from "@/components/HomeFilterModal"
import HomeSavedModal from "@/components/HomeSavedModal"

// Lazy load map modal on-demand to keep initial JS bundle ultra small
const HomeMapModal = dynamic(() => import("@/components/HomeMapModal"), {
  ssr: false,
})

const BRANDS = [
  { name: "Honda", icon: Bike },
  { name: "Vespa", icon: Bike },
  { name: "Yamaha", icon: Bike },
  { name: "Suzuki", icon: Bike },
]

interface HomeClientProps {
  initialVendors: any[]
  initialScooters: any[]
  initialSettings?: PlatformSettings
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
  const [isNavOpen, setIsNavOpen] = useState(false)

  // Saved Scooters State
  const [savedScooters, setSavedScooters] = useState<number[]>([])
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false)

  // Location & Map State
  const [searchQuery, setSearchQuery] = useState("")
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [selectedMapVendorId, setSelectedMapVendorId] = useState<number | string | null>(null)
  const [mapSearchQuery, setMapSearchQuery] = useState("")
  const [isMapCardVisible, setIsMapCardVisible] = useState(true)

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [maxPrice, setMaxPrice] = useState(500000)
  const [selectedYear, setSelectedYear] = useState<string>("All")

  useEffect(() => {
    // 1. Seed client cache immediately with SSR props for 0ms sub-routes
    if (initialVendors?.length > 0 || initialScooters?.length > 0) {
      clientCache.set("catalog", {
        vendors: initialVendors,
        scooters: initialScooters,
        settings: initialSettings,
        cachedAt: new Date().toISOString(),
      })
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("showMap") === "true") {
        setIsLocationModalOpen(true)
        window.history.replaceState({}, "", "/")
      }
    }

    async function loadData(forceRefresh = false) {
      try {
        const data = await fetchCatalogData({ forceRefresh })
        if (data?.vendors) setTopVendors(data.vendors)
        if (data?.scooters) setAllScooters(data.scooters)
      } catch (err) {
        console.error("Failed to load catalog data:", err)
      }
    }

    // Only fetch client-side if SSR didn't supply vendors/scooters
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
        const sYear = scooter.year ? String(scooter.year) : "2024"
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

  // Filtered vendors for the map modal
  const filteredMapVendors = useMemo(() => {
    if (!mapSearchQuery.trim()) return topVendors
    const q = mapSearchQuery.toLowerCase()
    return topVendors.filter(
      (v) =>
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.address && v.address.toLowerCase().includes(q)) ||
        (v.delivery_area && v.delivery_area.toLowerCase().includes(q))
    )
  }, [topVendors, mapSearchQuery])

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] px-6 pb-24 md:px-12 md:pb-32">
      {/* Floating Navbar (Apple Glass) - Always Visible */}
      <nav aria-label="Main Navigation" className="fixed top-4 left-4 right-4 md:left-12 md:right-12 z-50 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto relative pointer-events-auto">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-3xl p-3 px-4 flex justify-between items-center transition-all duration-300">
            {/* Location Selector (Street level) */}
            <button
              onClick={openLocationPicker}
              type="button"
              aria-label="Open Vendor Location Map"
              className="flex items-center gap-2.5 text-left hover:bg-black/5 p-1.5 pr-3 rounded-full transition-colors active-press"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nearby</span>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-bold text-gray-900 leading-tight">
                    Vendor Locations
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              type="button"
              aria-label={isNavOpen ? "Close Menu" : "Open Menu"}
              className="w-10 h-10 rounded-full bg-white/80 border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-sm active-press"
            >
              {isNavOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>

          {/* Dropdown Menu */}
          {isNavOpen && (
            <div className="absolute top-[80px] left-0 right-0 bg-white/95 backdrop-blur-2xl border border-white/60 shadow-xl rounded-3xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 fade-in">
              <Link href="/about" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[16px] font-semibold text-gray-800 px-2 py-1 hover:text-black transition-colors">About Us</Link>
              <Link href="/how-it-works" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[16px] font-semibold text-gray-800 px-2 py-1 hover:text-black transition-colors">How it Works</Link>
              <Link href="/faq" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[16px] font-semibold text-gray-800 px-2 py-1 hover:text-black transition-colors">FAQ</Link>
              <Link href="/contact" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[16px] font-semibold text-gray-800 px-2 py-1 hover:text-black transition-colors">Contact Support</Link>

              <div className="h-[1px] bg-gray-200 my-1"></div>

              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider px-2">Partners</span>
                <Link href="/partnersignup" onClick={() => setIsNavOpen(false)} prefetch={true} className="text-[16px] font-semibold text-gray-800 px-2 py-1 hover:text-black transition-colors flex justify-between items-center group">
                  Partner Portal
                  <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">Sign In / Sign Up</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="w-full max-w-7xl mx-auto mt-28 md:mt-32">
        {/* Header */}
        <header className="flex justify-between items-start mb-8 md:mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium leading-[1.1] text-gray-900 tracking-tight">
              Find Your <br className="md:hidden" /> Perfect Ride
            </h1>
          </div>
          <button
            onClick={() => setIsSavedModalOpen(true)}
            type="button"
            aria-label="View saved scooters"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 shrink-0 hover:bg-gray-50 transition-colors relative active-press"
          >
            <Heart className="w-5 h-5 text-gray-800" aria-hidden="true" />
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
              className="w-full pl-12 pr-4 h-14 md:h-16 bg-white border-none rounded-full focus:ring-0 outline-none text-[15px] md:text-[16px] placeholder:text-gray-400 text-gray-800 shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            type="button"
            aria-label="Open Filter Settings"
            className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-gray-100 transition-transform hover:scale-105 active-press relative"
          >
            <SlidersHorizontal className="w-5 h-5 md:w-6 md:h-6 text-gray-800" aria-hidden="true" />
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
              <button
                type="button"
                onClick={() => {
                  setIsMapCardVisible(true)
                  openLocationPicker()
                }}
                className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-black bg-white hover:bg-black hover:text-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-xs transition-all active-press cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Explore Map</span>
              </button>
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
                className="appearance-none bg-black text-white pl-5 pr-10 h-12 md:h-14 md:text-[16px] rounded-full font-medium text-[15px] outline-none border-none shadow-sm flex items-center cursor-pointer focus:ring-0 transition-transform hover:scale-105 active-press"
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
                  className={`flex items-center gap-2 px-5 h-12 md:h-14 md:px-6 rounded-full whitespace-nowrap transition-all shadow-sm hover:scale-105 active-press ${
                    isActive ? "bg-black text-white" : "bg-white text-gray-800 border border-gray-100"
                  }`}
                >
                  <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center ${isActive ? "bg-white/20" : "bg-gray-100"}`}>
                    <brand.icon className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-sm md:text-base">{brand.name}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Popular Scooters (Horizontal Carousel) */}
        <section aria-labelledby="popular-scooters-heading" className="mb-10 md:mb-14">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 id="popular-scooters-heading" className="text-xl md:text-2xl font-bold text-gray-900">Popular</h2>
            <Link href="#all-scooters" className="text-gray-400 text-sm font-semibold hover:text-black transition-colors">See all</Link>
          </div>

          {filteredPopular.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-gray-500 font-medium">
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
