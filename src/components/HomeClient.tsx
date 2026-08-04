"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Heart, Search, SlidersHorizontal, Star, Bike, MapPin, ChevronDown, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { fetchCatalogData } from '@/lib/api/catalogService'
import { clientCache } from '@/lib/cache/clientCache'
import { subscribeToPlatformSettings, PlatformSettings } from '@/utils/pricing'

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })

const brands = [
  { name: "Honda", icon: Bike },
  { name: "Vespa", icon: Bike },
  { name: "Yamaha", icon: Bike },
  { name: "Suzuki", icon: Bike },
]

interface HomeClientProps {
  initialVendors: any[];
  initialScooters: any[];
  initialSettings?: PlatformSettings;
}

export default function HomeClient({ initialVendors = [], initialScooters = [], initialSettings }: HomeClientProps) {
  const router = useRouter()

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
      clientCache.set('catalog', {
        vendors: initialVendors,
        scooters: initialScooters,
        settings: initialSettings,
        cachedAt: new Date().toISOString()
      });
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("showMap") === "true") {
        setIsLocationModalOpen(true);
        window.history.replaceState({}, '', '/');
      }
    }

    async function loadData(forceRefresh = false) {
      try {
        const data = await fetchCatalogData({ forceRefresh });
        if (data?.vendors) setTopVendors(data.vendors);
        if (data?.scooters) setAllScooters(data.scooters);
      } catch (err) {
        console.error("Failed to load catalog data:", err);
      }
    }

    // Only fetch client-side if SSR didn't supply vendors/scooters
    if (initialVendors.length === 0 || initialScooters.length === 0) {
      loadData();
    }

    const unsubscribe = subscribeToPlatformSettings(() => {
      loadData(true);
    });

    return () => unsubscribe();
  }, [initialVendors, initialScooters, initialSettings]);

  const openLocationPicker = () => {
    setIsLocationModalOpen(true);
  }

  const toggleSaveScooter = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    setSavedScooters(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    )
  }

  // Filter Logic
  const filterByPrice = (priceVal: any) => {
    if (typeof priceVal === 'number') return priceVal <= maxPrice;
    const parsed = parseInt(String(priceVal || '0').replace(/[^0-9]/g, ''));
    return isNaN(parsed) || parsed === 0 || parsed <= maxPrice;
  }
  const filterByBrand = (scooter: any) => {
    if (!activeBrand) return true;
    const brandLower = activeBrand.toLowerCase();
    const nameMatch = scooter.name && scooter.name.toLowerCase().includes(brandLower);
    const brandMatch = scooter.brand && scooter.brand.toLowerCase().includes(brandLower);
    return Boolean(nameMatch || brandMatch);
  }
  const filterByYear = (scooter: any) => {
    if (!selectedYear || selectedYear === "All") return true;
    const sYear = scooter.year ? String(scooter.year) : "2024";
    return sYear === selectedYear;
  }
  const filterBySearch = (scooter: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = scooter.name && scooter.name.toLowerCase().includes(q);
    const brandMatch = scooter.brand && scooter.brand.toLowerCase().includes(q);
    return Boolean(nameMatch || brandMatch);
  }

  const allFiltered = useMemo(() => {
    return allScooters.filter(s => filterByPrice(s.price_daily || s.price) && filterByBrand(s) && filterByYear(s) && filterBySearch(s));
  }, [allScooters, maxPrice, activeBrand, selectedYear, searchQuery]);

  const filteredPopular = useMemo(() => allFiltered.slice(0, 3), [allFiltered]);
  const filteredRecommended = useMemo(() => allFiltered.slice(3), [allFiltered]);

  // Filtered vendors for the map modal
  const filteredMapVendors = useMemo(() => {
    if (!mapSearchQuery.trim()) return topVendors;
    const q = mapSearchQuery.toLowerCase();
    return topVendors.filter(v => 
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.address && v.address.toLowerCase().includes(q)) ||
      (v.delivery_area && v.delivery_area.toLowerCase().includes(q))
    );
  }, [topVendors, mapSearchQuery]);

  const selectedMapVendor = useMemo(() => {
    if (!selectedMapVendorId) return filteredMapVendors[0] || topVendors[0] || null;
    return topVendors.find(v => String(v.id) === String(selectedMapVendorId)) || topVendors[0] || null;
  }, [selectedMapVendorId, filteredMapVendors, topVendors]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] px-6 pb-24 md:px-12 md:pb-32">
      {/* Floating Navbar (Apple Glass) - Always Visible */}
      <div className="fixed top-4 left-4 right-4 md:left-12 md:right-12 z-50 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto relative pointer-events-auto">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-3xl p-3 px-4 flex justify-between items-center transition-all duration-300">
            {/* Location Selector (Street level) */}
            <button 
              onClick={openLocationPicker} 
              type="button"
              className="flex items-center gap-2.5 text-left hover:bg-black/5 p-1.5 pr-3 rounded-full transition-colors active-press"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nearby</span>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-bold text-gray-900 leading-tight">
                    Vendor Locations
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              type="button"
              className="w-10 h-10 rounded-full bg-white/80 border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-sm active-press"
            >
              {isNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
      </div>

      <div className="w-full max-w-7xl mx-auto mt-28 md:mt-32">
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
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 shrink-0 hover:bg-gray-50 transition-colors relative active-press"
          >
            <Heart className="w-5 h-5 text-gray-800" />
            {savedScooters.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </header>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-8 md:mb-12 md:max-w-2xl md:mx-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scooter name or brand..."
              className="w-full pl-12 pr-4 h-14 md:h-16 bg-white border-none rounded-full focus:ring-0 outline-none text-[15px] md:text-[16px] placeholder:text-gray-400 text-gray-800 shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            type="button"
            className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-gray-100 transition-transform hover:scale-105 active-press relative"
          >
            <SlidersHorizontal className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
            {(maxPrice < 500000 || selectedYear !== "All") && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-black rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        {/* Top Vendors (Story Layout) */}
        {topVendors.length > 0 && (
          <div className="mb-10 md:mb-12">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Nearby Vendors</h2>
              <button
                type="button"
                onClick={() => {
                  setIsMapCardVisible(true);
                  openLocationPicker();
                }}
                className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-black bg-white hover:bg-black hover:text-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-xs transition-all active-press cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Explore Map</span>
              </button>
            </div>
            <div className="flex gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
              {topVendors.map((vendor, idx) => (
                <Link key={vendor.id} href={`/vendor/${vendor.id}`} prefetch={true} className="flex flex-col items-center gap-2 md:gap-3 min-w-[80px] md:min-w-[100px] transition-transform hover:scale-105 active-press">
                  {/* Instagram-style Ring */}
                  <div className="p-[2px] md:p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white p-[2px] md:p-[3px]">
                      <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                        {vendor.logo ? (
                          <Image
                            src={vendor.logo}
                            alt={vendor.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 768px) 64px, 80px"
                            loading={idx < 3 ? "eager" : "lazy"}
                          />
                        ) : (
                          <span className="text-lg md:text-xl font-bold text-gray-600">{vendor.initials}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Details */}
                  <div className="text-center flex flex-col items-center">
                    <h3 className="font-semibold text-gray-900 text-[13px] md:text-[15px] leading-tight truncate w-[85px] md:w-[100px]">{vendor.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] md:text-[13px] mt-0.5 md:mt-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100 w-fit">
                      <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-yellow-700">5.0</span>
                    </div>
                    <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-[12px] text-gray-400 mt-0.5 md:mt-1">
                      <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span className="truncate max-w-[80px] md:max-w-[100px]">{vendor.location}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filter and Brands */}
        <div className="mb-10 md:mb-12">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Brand</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto md:flex-wrap md:justify-center md:overflow-visible pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 items-center">

            {/* Duration Dropdown */}
            <div className="relative shrink-0">
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="appearance-none bg-black text-white pl-5 pr-10 h-12 md:h-14 md:text-[16px] rounded-full font-medium text-[15px] outline-none border-none shadow-sm flex items-center cursor-pointer focus:ring-0 transition-transform hover:scale-105 active-press"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
              <ChevronDown className="w-4 h-4 text-white absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Brand Chips */}
            {brands.map((brand) => {
              const isActive = activeBrand === brand.name
              return (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => setActiveBrand(isActive ? "" : brand.name)}
                  className={`flex items-center gap-2 px-5 h-12 md:h-14 md:px-6 rounded-full whitespace-nowrap transition-all shadow-sm hover:scale-105 active-press ${isActive ? "bg-black text-white" : "bg-white text-gray-800 border border-gray-100"
                    }`}
                >
                  <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                    <brand.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <span className="font-medium text-[15px] md:text-[16px]">{brand.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Popular Scrolling Cards / Grid on Desktop */}
        <div className="mb-10 md:mb-12">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Popular Options</h2>
          </div>

          {filteredPopular.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-gray-500 font-bold border border-gray-100">
              No scooters found matching your filters.
            </div>
          ) : (
            <div className="flex gap-4 md:gap-6 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
              {filteredPopular.map((scooter, index) => (
                <Link key={scooter.id} href={`/detail/${scooter.id}`} prefetch={true} className="min-w-full md:min-w-0 sm:min-w-[340px] shrink-0 block relative bg-white rounded-[32px] md:rounded-[40px] p-4 md:p-5 shadow-sm border border-gray-50 snap-center md:snap-align-none transition-transform hover:-translate-y-1 hover:shadow-md active-press">
                  {/* Year & Save */}
                  <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-white/90 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-1.5 z-10 shadow-sm border border-gray-100">
                    <span className="text-xs md:text-sm font-extrabold text-gray-900">{scooter.year || '2024'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSaveScooter(e, scooter.id);
                    }}
                    className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/90 backdrop-blur-sm w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-20 shadow-sm hover:scale-110 active-press transition-transform"
                  >
                    <Heart className={`w-4 h-4 md:w-5 md:h-5 ${savedScooters.includes(scooter.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>

                  {/* Image */}
                  <div className="relative w-full h-48 md:h-56 mb-4 md:mb-5 rounded-2xl md:rounded-3xl overflow-hidden bg-[#F8F9FA] flex items-center justify-center">
                    <Image
                      src={scooter.img || "/images/scooter.png"}
                      alt={scooter.name}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
                      className="object-contain p-3 drop-shadow-md transition-transform duration-300 hover:scale-105"
                      priority={index === 0}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex items-end justify-between px-2 pb-2">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{scooter.name}</h3>
                      <p className="text-gray-500 text-sm md:text-base">
                        <span className="font-extrabold text-gray-900 text-[16px] md:text-[18px]">Rp {durationFilter === 'Weekly' ? Number(scooter.price_weekly || 0).toLocaleString() : durationFilter === 'Monthly' ? Number(scooter.price_monthly || 0).toLocaleString() : Number(scooter.price_daily || 0).toLocaleString()}</span> /{durationFilter}
                      </p>
                    </div>
                    <span className="bg-black text-white px-5 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-semibold pointer-events-none transition-colors">
                      Book Now
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* More Listings (Grid) - only if there are additional scooters */}
        {filteredRecommended.length > 0 && (
          <div>
            <div className="flex justify-between items-end mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">More Listings</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredRecommended.map(scooter => (
                <Link key={scooter.id} href={`/detail/${scooter.id}`} prefetch={true} className="bg-white rounded-[24px] md:rounded-[32px] p-3 md:p-4 shadow-sm border border-gray-50 flex flex-col group transition-all hover:scale-[1.02] hover:shadow-md active-press">
                  <div className="relative w-full aspect-square mb-3 md:mb-4 rounded-2xl bg-[#F8F9FA] flex items-center justify-center p-3 md:p-5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSaveScooter(e, scooter.id);
                      }}
                      className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur-sm w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center z-20 shadow-sm hover:scale-110 active-press transition-transform"
                    >
                      <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${savedScooters.includes(scooter.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 md:px-3 py-1 md:py-1.5 rounded-full flex items-center gap-1 md:gap-1.5 z-10 shadow-sm border border-gray-100">
                      <span className="text-[11px] md:text-[13px] font-extrabold text-gray-900">{scooter.year || '2024'}</span>
                    </div>
                    <Image
                      src={scooter.img || "/images/scooter.png"}
                      alt={scooter.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain p-3 drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 text-[14px] md:text-[16px] leading-tight mb-1.5 px-1">{scooter.name}</h3>
                  <p className="text-gray-900 text-[13px] md:text-[15px] font-extrabold mt-auto px-1">Rp {durationFilter === 'Weekly' ? Number(scooter.price_weekly || 0).toLocaleString() : durationFilter === 'Monthly' ? Number(scooter.price_monthly || 0).toLocaleString() : Number(scooter.price_daily || 0).toLocaleString()} <span className="font-medium text-[11px] md:text-[13px] text-gray-500">/{durationFilter === 'Daily' ? 'day' : durationFilter === 'Weekly' ? 'week' : 'month'}</span></p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filter Modal */}
        {isFilterOpen && (
          <div 
            onClick={() => setIsFilterOpen(false)}
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
                  onClick={() => setIsFilterOpen(false)}
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
                      const isSelected = selectedYear === year;
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setSelectedYear(year)}
                          className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all active-press ${isSelected
                              ? "bg-black text-white shadow-sm scale-105"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                          {year === "All" ? "All Years" : year}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-black text-white font-bold text-lg py-4 rounded-2xl mt-8 shadow-sm hover:bg-gray-900 transition-colors active-press"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Saved Scooters Modal */}
        {isSavedModalOpen && (
          <div 
            onClick={() => setIsSavedModalOpen(false)}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] p-6 pb-12 md:pb-6 shadow-xl animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 relative max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Saved Scooters</h3>
                <button
                  type="button"
                  onClick={() => setIsSavedModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors active-press"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {savedScooters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="font-bold text-gray-900">No saved scooters yet</p>
                    <p className="text-sm text-gray-500 mt-1">Tap the heart icon on a scooter to save it for later.</p>
                  </div>
                ) : (
                  allScooters.filter((s: any) => savedScooters.includes(s.id)).map((scooter: any) => (
                    <Link 
                      key={scooter.id} 
                      href={`/detail/${scooter.id}`} 
                      onClick={() => setIsSavedModalOpen(false)}
                      prefetch={true}
                      className="bg-gray-50 p-3 rounded-2xl flex items-center gap-4 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 active-press"
                    >
                      <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm p-1">
                        <Image
                          src={scooter.img || "/images/scooter.png"}
                          alt={scooter.name}
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 text-[14px]">{scooter.name}</h4>
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            <span className="text-[11px] font-bold text-gray-700">{scooter.year || '2024'}</span>
                          </div>
                        </div>
                        <p className="text-[13px] font-extrabold text-gray-900 mt-1">Rp {durationFilter === 'Weekly' ? Number(scooter.price_weekly || 0).toLocaleString() : durationFilter === 'Monthly' ? Number(scooter.price_monthly || 0).toLocaleString() : Number(scooter.price_daily || 0).toLocaleString()} <span className="text-gray-500 font-medium text-[11px]">/{durationFilter}</span></p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSaveScooter(e, scooter.id);
                        }}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 active-press"
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </button>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Location & Vendor Map Modal */}
        {isLocationModalOpen && (
          <div 
            onClick={() => setIsLocationModalOpen(false)}
            className="fixed inset-0 z-[100] flex flex-col bg-black/70 backdrop-blur-sm md:items-center md:justify-center p-0 md:p-6 lg:p-10 animate-in fade-in duration-200"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col w-full h-[100dvh] md:h-[82vh] md:max-h-[780px] md:max-w-5xl bg-white md:rounded-[36px] md:shadow-2xl relative overflow-hidden md:border md:border-gray-200"
            >
              {/* Top Floating Control Bar (Minimalist Black & White) */}
              <div className="absolute top-3 left-3 right-3 md:top-5 md:left-5 md:right-5 z-20 flex flex-col gap-2 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(false)}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-black text-white hover:bg-neutral-800 shadow-md flex items-center justify-center transition-transform active:scale-95 shrink-0 cursor-pointer"
                    aria-label="Close Map"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Search / Filter Area Input */}
                  <div className="relative flex-1 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-gray-200 flex items-center px-3.5 py-2 md:py-2.5">
                    <Search className="w-4 h-4 text-black shrink-0 mr-2" />
                    <input
                      type="text"
                      value={mapSearchQuery}
                      onChange={(e) => {
                        setMapSearchQuery(e.target.value);
                        setIsMapCardVisible(true);
                      }}
                      placeholder="Search area (e.g. Canggu, Ubud, Seminyak)..."
                      className="w-full text-xs md:text-sm font-semibold text-black placeholder-gray-400 outline-none bg-transparent"
                    />
                    {mapSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMapSearchQuery("")}
                        className="text-gray-400 hover:text-black font-bold text-xs px-1.5 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Verified Count Badge */}
                  <div className="hidden sm:flex items-center gap-1.5 bg-black text-white px-3.5 py-2.5 rounded-full shadow-md text-xs font-bold shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{filteredMapVendors.length} Verified</span>
                  </div>
                </div>

                {/* Quick Area Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto scrollbar-hide -mx-1 px-1">
                  {["All Bali", "Canggu", "Seminyak", "Ubud", "Sanur", "Kuta", "Uluwatu", "Nusa Dua"].map((area) => {
                    const isSelected = area === "All Bali" ? !mapSearchQuery : mapSearchQuery.toLowerCase() === area.toLowerCase();
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          setMapSearchQuery(area === "All Bali" ? "" : area);
                          setIsMapCardVisible(true);
                        }}
                        className={`text-[11px] md:text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-black text-white shadow-sm"
                            : "bg-white/95 backdrop-blur-md text-black hover:bg-black hover:text-white border border-gray-200"
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MAP COMPONENT */}
              <div className="flex-1 w-full h-full relative z-0">
                <MapPicker
                  vendors={filteredMapVendors}
                  selectedVendorId={selectedMapVendor?.id}
                  onVendorClick={(id) => {
                    setSelectedMapVendorId(id);
                    setIsMapCardVisible(true);
                  }}
                  className="w-full h-full"
                />
              </div>

              {/* Selected Vendor Floating Bottom Drawer (Minimalist Black & White) */}
              {selectedMapVendor && isMapCardVisible && (
                <div className="absolute bottom-3 left-3 right-3 md:bottom-5 md:left-5 md:right-auto md:max-w-md z-20 pointer-events-auto animate-in slide-in-from-bottom-4 duration-200">
                  <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 md:p-5 shadow-2xl border border-gray-200 flex flex-col gap-3">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Vendor Avatar */}
                        <div className="w-12 h-12 rounded-2xl bg-black text-white font-extrabold text-sm flex items-center justify-center shrink-0 border border-black overflow-hidden shadow-xs">
                          {selectedMapVendor.logo || selectedMapVendor.logo_url || selectedMapVendor.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={selectedMapVendor.logo || selectedMapVendor.logo_url || selectedMapVendor.image_url} 
                              alt={selectedMapVendor.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <span>{selectedMapVendor.initials || 'VN'}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-base text-gray-900 truncate leading-tight">
                              {selectedMapVendor.name}
                            </h4>
                            <span className="flex items-center gap-1 bg-black text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 fill-white text-white" />
                              <span>{selectedMapVendor.rating ? Number(selectedMapVendor.rating).toFixed(1) : '5.0'}</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-black shrink-0" />
                            <span>{selectedMapVendor.address || 'Bali, Indonesia'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Minimize Card Button */}
                      <button
                        type="button"
                        onClick={() => setIsMapCardVisible(false)}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Minimize"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {selectedMapVendor.delivery_area && (
                      <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100 leading-snug line-clamp-1">
                        🚚 <strong>Delivery:</strong> {selectedMapVendor.delivery_area}
                      </p>
                    )}

                    {/* CTA Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLocationModalOpen(false);
                        router.push(`/vendor/${selectedMapVendor.id}?fromMap=true`);
                      }}
                      className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-xs md:text-sm py-3 px-4 rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>View Scooters & Profile</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Show card pill button if minimized */}
              {selectedMapVendor && !isMapCardVisible && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => setIsMapCardVisible(true)}
                    className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer active-press"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Show {selectedMapVendor.name}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
