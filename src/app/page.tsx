"use client"

import { useState } from "react"
import { Heart, Search, SlidersHorizontal, Star, Bike, MapPin, ChevronDown, Menu, X } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })

const topVendors = [
  { id: 1, name: "Putu Rentals", rating: 4.9, location: "Jl. Raya Ubud", initials: "PR" },
  { id: 2, name: "Wayan Bikes", rating: 4.8, location: "Batu Bolong", initials: "WB" },
  { id: 3, name: "Made Scooter", rating: 4.7, location: "Legian St", initials: "MS" },
  { id: 4, name: "Nyoman Rides", rating: 4.9, location: "Seminyak", initials: "NR" },
]

const brands = [
  { name: "Honda", icon: Bike },
  { name: "Vespa", icon: Bike },
  { name: "Yamaha", icon: Bike },
  { name: "Suzuki", icon: Bike },
]

const popularScooters = [
  { id: 1, name: "Vespa Primavera", price: "350,000", rating: 4.9, img: "/images/scooter.png" },
  { id: 2, name: "Yamaha NMAX", price: "200,000", rating: 4.8, img: "/images/scooter.png" },
  { id: 3, name: "Honda PCX", price: "200,000", rating: 4.7, img: "/images/scooter.png" },
]

const recommendedScooters = [
  { id: 4, name: "Honda Scoopy", price: "150,000", rating: 4.8, img: "/images/scooter.png" },
  { id: 5, name: "Vespa Sprint", price: "350,000", rating: 4.9, img: "/images/scooter.png" },
  { id: 6, name: "Yamaha Lexi", price: "150,000", rating: 4.6, img: "/images/scooter.png" },
  { id: 7, name: "Honda Vario", price: "120,000", rating: 4.5, img: "/images/scooter.png" },
]

export default function Home() {
  const [activeBrand, setActiveBrand] = useState("")
  const [durationFilter, setDurationFilter] = useState("Daily")
  const [isNavOpen, setIsNavOpen] = useState(false)
  
  // Saved Scooters State
  const [savedScooters, setSavedScooters] = useState<number[]>([])
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false)

  // Location & Search State
  const [locationName, setLocationName] = useState("Tap to find location")
  const [isLocating, setIsLocating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [mapPosition, setMapPosition] = useState<[number, number]>([0, 0])
  const [tempLocationName, setTempLocationName] = useState("")
  const [tempSearchArea, setTempSearchArea] = useState("")
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [maxPrice, setMaxPrice] = useState(500000)

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
  });

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setMapPosition([lat, lng]);
      
      const roadName = results[0].formatted_address;
      const components = results[0].address_components;
      const locality = components.find(c => c.types.includes("locality"));
      const searchArea = locality ? locality.long_name : "";
      
      setTempLocationName(roadName);
      setTempSearchArea(searchArea);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      if (typeof window !== "undefined" && window.google) {
        const geocoder = new window.google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results[0]) {
          const address = response.results[0].formatted_address;
          setTempLocationName(address);
          const components = response.results[0].address_components;
          const locality = components.find((c: any) => c.types.includes("locality"));
          setTempSearchArea(locality ? locality.long_name : "");
        } else {
          setTempLocationName("Location Found");
        }
      } else {
        setTempLocationName("Location Found (No API)");
      }
    } catch (error) {
      console.error("Reverse geocoding error", error);
      setTempLocationName("Location Found");
    }
  }

  const handleMapPositionChange = (lat: number, lng: number) => {
    setMapPosition([lat, lng]);
    reverseGeocode(lat, lng);
  }

  const openLocationPicker = () => {
    setIsLocationModalOpen(true);
    setMapPosition([0, 0]);
    setTempLocationName("Please search or tap map");
    setValue("");
  }

  const toggleSaveScooter = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    setSavedScooters(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    )
  }

  // Filter Logic
  const filterByPrice = (priceStr: string) => parseInt(priceStr.replace(/,/g, '')) <= maxPrice
  
  const filteredPopular = popularScooters.filter(s => filterByPrice(s.price))
  const filteredRecommended = recommendedScooters.filter(s => filterByPrice(s.price))

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] px-6 pb-24 md:px-12 md:pb-32">
      {/* Floating Navbar (Apple Glass) - Always Visible */}
      <div className="fixed top-4 left-4 right-4 md:left-12 md:right-12 z-50 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto relative pointer-events-auto">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-3xl p-3 px-4 flex justify-between items-center transition-all duration-300">
            {/* Location Selector (Street level) */}
            <button onClick={openLocationPicker} className="flex items-center gap-2.5 text-left hover:bg-black/5 p-1.5 pr-3 rounded-full transition-colors">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deliver To</span>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-bold text-gray-900 leading-tight">
                    {locationName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="w-10 h-10 rounded-full bg-white/80 border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-sm"
            >
              {isNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Dropdown Menu */}
          {isNavOpen && (
            <div className="absolute top-[80px] left-0 right-0 bg-white/95 backdrop-blur-2xl border border-white/60 shadow-xl rounded-3xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 fade-in">
              <Link href="/about" className="text-[16px] font-semibold text-gray-800 px-2 py-1 hover:text-black transition-colors">About Us</Link>
              <Link href="/how-it-works" className="text-[16px] font-semibold text-gray-800 px-2 py-1 hover:text-black transition-colors">How it Works</Link>
              <Link href="/faq" className="text-[16px] font-semibold text-gray-800 px-2 py-1 hover:text-black transition-colors">FAQ</Link>
              <Link href="/contact" className="text-[16px] font-semibold text-gray-800 px-2 py-1 hover:text-black transition-colors">Contact Support</Link>
              
              <div className="h-[1px] bg-gray-200 my-1"></div>
              
              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider px-2">Partners</span>
                <Link href="/partnersignup" className="text-[16px] font-semibold text-gray-800 px-2 py-1 hover:text-black transition-colors flex justify-between items-center group">
                  Partner Portal
                  <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">Sign In / Sign Up</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto mt-28 md:mt-32">
        {/* Header - Back to normal on mobile, without "Hi welcome" */}
        <header className="flex justify-between items-start mb-8 md:mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium leading-[1.1] text-gray-900 tracking-tight">
              Find Your <br className="md:hidden" /> Perfect Ride
            </h1>
          </div>
          <button 
            onClick={() => setIsSavedModalOpen(true)}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 shrink-0 hover:bg-gray-50 transition-colors relative"
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
              placeholder="Search nearby rentals..."
              className="w-full pl-12 pr-4 h-14 md:h-16 bg-white border-none rounded-full focus:ring-0 outline-none text-[15px] md:text-[16px] placeholder:text-gray-400 text-gray-800 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-gray-100 transition-transform hover:scale-105"
          >
            <SlidersHorizontal className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
          </button>
        </div>

        {/* Top Vendors (Story Layout) */}
        <div className="mb-10 md:mb-12">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Nearby Vendors</h2>
            <button className="text-sm md:text-base text-gray-500 font-medium hover:text-black transition-colors">See All</button>
          </div>
          <div className="flex gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
            {topVendors.map((vendor) => (
              <Link key={vendor.id} href={`/vendor/${vendor.id}`} className="flex flex-col items-center gap-2 md:gap-3 min-w-[80px] md:min-w-[100px] transition-transform hover:scale-105">
                {/* Instagram-style Ring */}
                <div className="p-[2px] md:p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white p-[2px] md:p-[3px]">
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                      <span className="text-lg md:text-xl font-bold text-gray-600">{vendor.initials}</span>
                    </div>
                  </div>
                </div>
                {/* Details */}
                <div className="text-center flex flex-col items-center">
                  <h3 className="font-semibold text-gray-900 text-[13px] md:text-[15px] leading-tight truncate w-[85px] md:w-[100px]">{vendor.name}</h3>
                  <div className="flex items-center gap-0.5 md:gap-1 text-[11px] md:text-[13px] text-gray-500 mt-0.5 md:mt-1">
                    <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-700">{vendor.rating}</span>
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

        {/* Filter and Brands */}
        <div className="mb-10 md:mb-12">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Brand</h2>
            <button className="text-sm md:text-base text-gray-500 font-medium hover:text-black transition-colors">See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto md:flex-wrap md:justify-center md:overflow-visible pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 items-center">
            
            {/* Duration Dropdown replaces "All Scooter" */}
            <div className="relative shrink-0">
              <select 
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="appearance-none bg-black text-white pl-5 pr-10 h-12 md:h-14 md:text-[16px] rounded-full font-medium text-[15px] outline-none border-none shadow-sm flex items-center cursor-pointer focus:ring-0 transition-transform hover:scale-105"
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
                  onClick={() => setActiveBrand(isActive ? "" : brand.name)}
                  className={`flex items-center gap-2 px-5 h-12 md:h-14 md:px-6 rounded-full whitespace-nowrap transition-all shadow-sm hover:scale-105 ${
                    isActive ? "bg-black text-white" : "bg-white text-gray-800 border border-gray-100"
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
            <button className="text-sm md:text-base text-gray-500 font-medium hover:text-black transition-colors">See All</button>
          </div>
          
          <div className="flex gap-4 md:gap-6 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
            {filteredPopular.map(scooter => (
              <Link key={scooter.id} href={`/detail/${scooter.id}`} className="min-w-full md:min-w-0 sm:min-w-[340px] shrink-0 block relative bg-white rounded-[32px] md:rounded-[40px] p-4 md:p-5 shadow-sm border border-gray-50 snap-center md:snap-align-none transition-transform hover:-translate-y-1 hover:shadow-md">
                {/* Rating & Save */}
                <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-white/90 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-1.5 z-10 shadow-sm">
                  <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-black text-black" />
                  <span className="text-sm md:text-base font-bold">{scooter.rating}</span>
                </div>
                <button 
                  onClick={(e) => toggleSaveScooter(e, scooter.id)}
                  className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/90 backdrop-blur-sm w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-10 shadow-sm hover:scale-110 transition-transform"
                >
                  <Heart className={`w-4 h-4 md:w-5 md:h-5 ${savedScooters.includes(scooter.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>

                {/* Image */}
                <div className="relative w-full h-48 md:h-56 mb-4 md:mb-5 rounded-2xl md:rounded-3xl overflow-hidden bg-[#F8F9FA] flex items-center justify-center">
                   <div 
                     className="w-[90%] h-[90%] bg-contain bg-center bg-no-repeat"
                     style={{ backgroundImage: `url("${scooter.img}")` }}
                   />
                </div>

                {/* Info */}
                <div className="flex items-end justify-between px-2 pb-2">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{scooter.name}</h3>
                    <p className="text-gray-500 text-sm md:text-base">
                      <span className="font-extrabold text-gray-900 text-[16px] md:text-[18px]">Rp {scooter.price}</span> /{durationFilter}
                    </p>
                  </div>
                  <button className="bg-black text-white px-5 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-semibold hover:bg-gray-800 transition-colors">
                    Book Now
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* More Listings (Grid) */}
        <div>
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">More Listings</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredRecommended.map(scooter => (
              <Link key={scooter.id} href={`/detail/${scooter.id}`} className="bg-white rounded-[24px] md:rounded-[32px] p-3 md:p-4 shadow-sm border border-gray-50 flex flex-col group transition-all hover:scale-[1.02] hover:shadow-md">
                <div className="relative w-full aspect-square mb-3 md:mb-4 rounded-2xl bg-[#F8F9FA] flex items-center justify-center p-3 md:p-5">
                  <button 
                    onClick={(e) => toggleSaveScooter(e, scooter.id)}
                    className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur-sm w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center z-10 shadow-sm hover:scale-110 transition-transform"
                  >
                    <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${savedScooters.includes(scooter.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1 z-10 shadow-sm">
                    <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-black text-black" />
                    <span className="text-[11px] md:text-[13px] font-bold">{scooter.rating}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={scooter.img} alt={scooter.name} className="w-full h-full object-contain drop-shadow-md transition-transform group-hover:scale-110" />
                </div>
                <h3 className="font-bold text-gray-900 text-[14px] md:text-[16px] leading-tight mb-1.5 px-1">{scooter.name}</h3>
                <p className="text-gray-900 text-[13px] md:text-[15px] font-extrabold mt-auto px-1">Rp {scooter.price} <span className="font-medium text-[11px] md:text-[13px] text-gray-500">/day</span></p>
              </Link>
            ))}
          </div>
        </div>

        {/* Filter Modal */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] p-6 pb-12 md:pb-6 shadow-xl animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="font-bold text-gray-900 text-[15px]">Max Price (Daily)</label>
                    <span className="font-black text-lg text-black">Rp {maxPrice.toLocaleString('id-ID')}</span>
                  </div>
                  
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="100000" 
                      max="500000" 
                      step="50000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="flex justify-between text-xs font-medium text-gray-400 mt-2">
                      <span>Rp 100k</span>
                      <span>Rp 500k</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-black text-white font-bold text-lg py-4 rounded-2xl mt-8 shadow-sm hover:bg-gray-900 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Saved Scooters Modal */}
        {isSavedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] p-6 pb-12 md:pb-6 shadow-xl animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 relative max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Saved Scooters</h3>
                <button 
                  onClick={() => setIsSavedModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
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
                  [...popularScooters, ...recommendedScooters].filter(s => savedScooters.includes(s.id)).map(scooter => (
                    <Link key={scooter.id} href={`/detail/${scooter.id}`} className="bg-gray-50 p-3 rounded-2xl flex items-center gap-4 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                      <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={scooter.img} alt={scooter.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 text-[14px]">{scooter.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[11px] font-bold">{scooter.rating}</span>
                          </div>
                        </div>
                        <p className="text-[13px] font-extrabold text-gray-900 mt-1">Rp {scooter.price} <span className="text-gray-500 font-medium text-[11px]">/{durationFilter}</span></p>
                      </div>
                      <button 
                        onClick={(e) => toggleSaveScooter(e, scooter.id)}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"
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

        {/* Location Picker Modal */}
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:fade-in md:items-center md:justify-center md:bg-black/40 md:p-6">
            <div className="flex flex-col w-full h-full md:h-auto md:max-h-[90vh] md:max-w-md bg-white md:rounded-[32px] md:shadow-2xl relative overflow-hidden">
              
              {/* MAP LAYER (Background on mobile, normal block on desktop) */}
              <div className="absolute inset-0 z-0 md:relative md:h-[400px]">
                <MapPicker 
                  position={mapPosition} 
                  onPositionChange={handleMapPositionChange} 
                  className="w-full h-full object-cover"
                />
                
                {/* Locating overlay */}
                {isLocating && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin mb-3"></div>
                    <span className="font-bold text-gray-900">Finding you...</span>
                  </div>
                )}
              </div>

              {/* FOREGROUND UI OVERLAY ON MOBILE */}
              <div className="z-10 flex flex-col h-full pointer-events-none md:pointer-events-auto p-4 md:p-6 absolute inset-0 md:relative md:inset-auto">
                
                {/* Top Section (Search & Close) */}
                <div className="flex items-start gap-3 pointer-events-auto w-full">
                  {/* Back/Close Button */}
                  <button 
                    onClick={() => setIsLocationModalOpen(false)}
                    className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors shrink-0 border border-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search hotel or villa..."
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      disabled={!ready}
                      className="block w-full pl-11 pr-4 h-12 bg-white border border-gray-100 shadow-lg rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                    
                    {/* Autocomplete Suggestions */}
                    {status === "OK" && (
                      <ul className="absolute z-20 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden max-h-[250px] overflow-y-auto">
                        {data.map(({ place_id, description }) => (
                          <li
                            key={place_id}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition-colors border-b border-gray-50 last:border-0"
                            onClick={() => handleSelect(description)}
                          >
                            {description}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex-1"></div> {/* Spacer for map on mobile */}

                {/* Bottom Section (Confirm) */}
                <div className="pointer-events-auto mt-auto pt-6 pb-2 md:pb-0">
                  <button 
                    onClick={() => {
                      setLocationName(tempLocationName || "Selected Location");
                      setSearchQuery(tempSearchArea);
                      setIsLocationModalOpen(false);
                    }}
                    disabled={mapPosition[0] === 0 && !tempLocationName}
                    className="w-full bg-black disabled:bg-gray-300 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    Confirm Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
