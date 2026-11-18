"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  MapPin,
  Bike,
  X,
} from "lucide-react"
import ScooterCard from "@/components/ScooterCard"
import MarketplaceNavbar, {
  readStoredSavedScooters,
  writeStoredSavedScooters,
} from "@/components/MarketplaceNavbar"
import { fetchCatalogData } from "@/lib/api/catalogService"

const HomeFilterModal = dynamic(() => import("@/components/HomeFilterModal"), {
  ssr: false,
  loading: () => null,
})

const BALI_LOCATIONS = [
  "All Locations",
  "Canggu",
  "Seminyak",
  "Ubud",
  "Sanur",
  "Kuta",
  "Uluwatu",
  "Nusa Dua",
  "Jimbaran",
  "Denpasar",
]

const DEFAULT_BRANDS = ["Honda", "Vespa", "Yamaha", "Kawasaki"]

interface AllScootersClientProps {
  initialVendors?: any[]
  initialScooters?: any[]
}

export default function AllScootersClient({
  initialVendors = [],
  initialScooters = [],
}: AllScootersClientProps) {
  const [vendors, setVendors] = useState<any[]>(initialVendors)
  const [scooters, setScooters] = useState<any[]>(initialScooters)
  const [savedScooters, setSavedScooters] = useState<number[]>([])

  // All Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [durationFilter, setDurationFilter] = useState("Daily")
  const [activeBrand, setActiveBrand] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [maxPrice, setMaxPrice] = useState(500000)
  const [selectedYear, setSelectedYear] = useState("All")
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "year_desc">("featured")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    setSavedScooters(readStoredSavedScooters())
    const syncSaved = () => setSavedScooters(readStoredSavedScooters())
    window.addEventListener("saved_scooters_updated", syncSaved)

    if (initialVendors.length === 0 || initialScooters.length === 0) {
      fetchCatalogData()
        .then((data) => {
          if (data?.vendors?.length) setVendors(data.vendors)
          if (data?.scooters?.length) setScooters(data.scooters)
        })
        .catch(() => {})
    }

    return () => {
      window.removeEventListener("saved_scooters_updated", syncSaved)
    }
  }, [initialVendors.length, initialScooters.length])

  const toggleSaveScooter = useCallback((e: React.MouseEvent, id: number) => {
    e.preventDefault()
    setSavedScooters((prev) => {
      const next = prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
      writeStoredSavedScooters(next)
      return next
    })
  }, [])

  const vendorMap = useMemo(() => {
    const map = new Map<string, any>()
    vendors.forEach((v) => {
      if (v?.id !== undefined) map.set(String(v.id), v)
    })
    return map
  }, [vendors])

  // Merge standard brands with any dynamic scooter brands present
  const brandOptions = useMemo(() => {
    const seen = new Set(DEFAULT_BRANDS.map((b) => b.toLowerCase()))
    const extras: string[] = []
    scooters.forEach((s) => {
      if (s.brand && !seen.has(String(s.brand).toLowerCase())) {
        seen.add(String(s.brand).toLowerCase())
        extras.push(String(s.brand))
      }
    })
    return [...DEFAULT_BRANDS, ...extras]
  }, [scooters])

  const locationOptions = useMemo(() => {
    const known = new Set(BALI_LOCATIONS.map((l) => l.toLowerCase()))
    const dynamicAreas: string[] = []
    vendors.forEach((v) => {
      const area = String(v?.location || v?.address || "").trim()
      if (area && !area.includes(",") && area.length <= 24 && !known.has(area.toLowerCase())) {
        known.add(area.toLowerCase())
        dynamicAreas.push(area)
      }
    })
    return [...BALI_LOCATIONS, ...dynamicAreas]
  }, [vendors])

  const getScooterPlanPrice = useCallback(
    (s: any) => {
      if (durationFilter === "Weekly") return Number(s.price_weekly || 0)
      if (durationFilter === "Monthly") return Number(s.price_monthly || 0)
      return Number(s.price_daily || s.price || 0)
    },
    [durationFilter]
  )

  const filteredScooters = useMemo(() => {
    const brandLower = activeBrand.trim().toLowerCase()
    const qLower = searchQuery.trim().toLowerCase()
    const locLower =
      selectedLocation && selectedLocation !== "All Locations"
        ? selectedLocation.toLowerCase()
        : ""

    const matched = scooters.filter((scooter) => {
      const vendor = vendorMap.get(String(scooter.vendor_id))
      const vendorText = [vendor?.address, vendor?.location, vendor?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      // Price filter (always respects max daily price slider)
      const dailyVal = Number(scooter.price_daily || String(scooter.price || "0").replace(/[^0-9]/g, ""))
      if (!isNaN(dailyVal) && dailyVal > 0 && dailyVal > maxPrice) return false

      // Brand filter
      if (brandLower) {
        const nameMatch = scooter.name?.toLowerCase().includes(brandLower)
        const brandMatch = scooter.brand?.toLowerCase().includes(brandLower)
        if (!nameMatch && !brandMatch) return false
      }

      // Year filter
      if (selectedYear && selectedYear !== "All") {
        const sYear = scooter.year ? String(scooter.year) : "2025"
        if (sYear !== selectedYear) return false
      }

      // Location filter
      if (locLower) {
        if (!vendorText.includes(locLower)) return false
      }

      // Search query (matches scooter name, brand, year, or garage/location)
      if (qLower) {
        const nameMatch = scooter.name?.toLowerCase().includes(qLower)
        const brandMatch = scooter.brand?.toLowerCase().includes(qLower)
        const yearMatch = scooter.year ? String(scooter.year).includes(qLower) : false
        const vendorMatch = vendorText.includes(qLower)
        if (!nameMatch && !brandMatch && !yearMatch && !vendorMatch) return false
      }

      return true
    })

    if (sortBy === "price_asc") {
      return [...matched].sort((a, b) => getScooterPlanPrice(a) - getScooterPlanPrice(b))
    }
    if (sortBy === "price_desc") {
      return [...matched].sort((a, b) => getScooterPlanPrice(b) - getScooterPlanPrice(a))
    }
    if (sortBy === "year_desc") {
      return [...matched].sort((a, b) => (Number(b.year) || 2025) - (Number(a.year) || 2025))
    }
    return matched
  }, [
    scooters,
    vendorMap,
    activeBrand,
    searchQuery,
    selectedLocation,
    maxPrice,
    selectedYear,
    sortBy,
    getScooterPlanPrice,
  ])

  const hasAnyFilter =
    Boolean(searchQuery.trim()) ||
    Boolean(activeBrand) ||
    selectedLocation !== "All Locations" ||
    maxPrice < 500000 ||
    selectedYear !== "All"

  const resetAllFilters = () => {
    setSearchQuery("")
    setActiveBrand("")
    setSelectedLocation("All Locations")
    setMaxPrice(500000)
    setSelectedYear("All")
    setSortBy("featured")
  }

  return (
    <div className="min-h-screen flex flex-col pb-24 text-[var(--ink)]">
      <MarketplaceNavbar
        vendors={vendors}
        allScooters={scooters}
        savedScooters={savedScooters}
        durationFilter={durationFilter}
        onToggleSave={toggleSaveScooter}
        compactSpacing
      />

      <main className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 md:px-10 space-y-5 sm:space-y-6">
        {/* Top Breadcrumb & Title */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              prefetch={true}
              aria-label="Back to Home"
              className="cirrel-ibtn w-9 h-9 sm:w-10 sm:h-10 shrink-0 active-press"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--ink)] tracking-tight leading-tight">
                All Scooters
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted-ink)] font-medium">
                Filter by location, brand, price, and rental plan
              </p>
            </div>
          </div>

          <span className="cirrel-pill text-xs font-bold shrink-0">
            {filteredScooters.length} available
          </span>
        </div>

        {/* Search Bar + Price/Year Modal Filter */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-text)]" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scooter, brand, or area..."
              aria-label="Search scooter name, brand, or area"
              className="cirrel-glass w-full pl-11 pr-9 h-12 sm:h-13 rounded-full outline-none text-sm sm:text-[15px] placeholder:text-[var(--muted-ink)] text-[var(--ink)] font-medium focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute inset-y-0 right-3 flex items-center text-[var(--muted-ink)] hover:text-[var(--ink)] cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Open Price and Year Filters"
            className="cirrel-ibtn w-12 h-12 sm:w-13 sm:h-13 shrink-0 active-press cursor-pointer relative"
          >
            <SlidersHorizontal className="w-5 h-5 text-[var(--ink)]" aria-hidden="true" />
            {(maxPrice < 500000 || selectedYear !== "All") && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[var(--accent-blue)] rounded-full border-2 border-[var(--bg)]" />
            )}
          </button>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3">
          {/* Row 1: Duration Plan Dropdown + Brand Chips (single line) */}
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            <div className="relative shrink-0">
              <select
                aria-label="Filter rental duration plan"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="cirrel-chip appearance-none pl-3.5 pr-8 h-9 sm:h-10 text-xs sm:text-sm font-semibold text-[var(--ink)] cursor-pointer outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
              <ChevronDown
                className="w-3.5 h-3.5 text-[var(--muted-ink)] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveBrand("")}
              data-active={activeBrand === ""}
              className="cirrel-chip px-3.5 sm:px-4 h-9 sm:h-10 text-xs sm:text-sm whitespace-nowrap active-press cursor-pointer shrink-0"
            >
              All Brands
            </button>

            {brandOptions.map((brand) => {
              const isActive = activeBrand.toLowerCase() === brand.toLowerCase()
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setActiveBrand(isActive ? "" : brand)}
                  data-active={isActive}
                  className="cirrel-chip px-3.5 sm:px-4 h-9 sm:h-10 text-xs sm:text-sm whitespace-nowrap active-press cursor-pointer shrink-0 font-semibold"
                >
                  {brand}
                </button>
              )
            })}
          </div>

          {/* Row 2: Location Filter + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-ink)] shrink-0 pr-0.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                <span>Location</span>
              </span>
              {locationOptions.map((loc) => {
                const isSelected = selectedLocation === loc
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setSelectedLocation(isSelected && loc !== "All Locations" ? "All Locations" : loc)}
                    data-active={isSelected}
                    className="cirrel-chip px-3.5 h-8 sm:h-9 text-[11px] sm:text-xs font-semibold whitespace-nowrap active-press cursor-pointer shrink-0"
                  >
                    {loc}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-[var(--accent-text)] hover:underline cursor-pointer px-2"
                >
                  Reset
                </button>
              )}
              <div className="relative">
                <select
                  aria-label="Sort scooters"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="cirrel-chip appearance-none pl-3.5 pr-8 h-8 sm:h-9 text-xs font-semibold text-[var(--ink)] cursor-pointer outline-none"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="year_desc">Newest Year</option>
                </select>
                <ChevronDown
                  className="w-3.5 h-3.5 text-[var(--muted-ink)] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2-Card Grid on Mobile, 3-4 Cards on Desktop */}
        {filteredScooters.length === 0 ? (
          <div className="cirrel-glass rounded-[26px] p-10 text-center space-y-3">
            <div className="relative z-10 w-12 h-12 rounded-full cirrel-well flex items-center justify-center mx-auto">
              <Bike className="w-6 h-6 text-[var(--muted-ink)]" />
            </div>
            <p className="relative z-10 text-sm font-semibold text-[var(--muted-ink)]">
              No scooters match your selected location or filters.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="relative z-10 cirrel-btn-primary px-5 py-2.5 text-xs font-bold cursor-pointer active-press"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredScooters.map((scooter) => {
              const vendor = vendorMap.get(String(scooter.vendor_id))
              const locLabel = vendor?.address || vendor?.location || undefined
              return (
                <ScooterCard
                  key={scooter.id}
                  scooter={scooter}
                  durationFilter={durationFilter}
                  isSaved={savedScooters.includes(scooter.id)}
                  onToggleSave={toggleSaveScooter}
                  variant="grid"
                  locationLabel={locLabel}
                />
              )
            })}
          </div>
        )}
      </main>

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
    </div>
  )
}
