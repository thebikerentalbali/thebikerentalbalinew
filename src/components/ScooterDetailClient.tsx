"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  Heart, 
  ChevronRight, 
  Star, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Headphones, 
  CheckCircle2,
  Bike,
  Gauge,
  Fuel,
  Package,
  KeyRound,
  Disc,
  Share2,
  Phone,
  Check
} from "lucide-react"
import { fetchScooterDetail } from "@/lib/api/catalogService"
import { subscribeToPlatformSettings } from "@/utils/pricing"

interface ScooterDetailClientProps {
  id: string
  initialScooter: any
  initialVendor: any
  initialSettings?: any
}

export default function ScooterDetailClient({
  id,
  initialScooter,
  initialVendor,
}: ScooterDetailClientProps) {
  const router = useRouter()

  const [scooter, setScooter] = useState<any>(initialScooter)
  const [vendor, setVendor] = useState<any>(initialVendor)
  const [loading, setLoading] = useState<boolean>(!initialScooter)
  const [isLiked, setIsLiked] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"daily" | "weekly" | "monthly">("daily")
  const [copiedToast, setCopiedToast] = useState(false)

  const handleBack = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (typeof window !== "undefined") {
      if (window.history.length <= 2) {
        router.push("/")
      } else {
        router.back()
      }
    } else {
      router.push("/")
    }
  }

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${scooter?.name || "Scooter"} Rental in Bali`,
            text: `Check out this ${scooter?.name || "Scooter"} rental on THE BIKE RENTAL BALI!`,
            url: window.location.href,
          })
        } catch {
          // Fallback or user canceled
        }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href)
          setCopiedToast(true)
          setTimeout(() => setCopiedToast(false), 2000)
        } catch {
          // Clipboard write failed
        }
      }
    }
  }

  useEffect(() => {
    if (!initialScooter && id) {
      async function loadData() {
        try {
          const data = await fetchScooterDetail(id)
          if (data) {
            if (data.scooter) setScooter(data.scooter)
            if (data.vendor) setVendor(data.vendor)
          }
        } catch (err) {
          console.error("Error loading scooter detail:", err)
        } finally {
          setLoading(false)
        }
      }
      loadData()
    }

    const unsubscribe = subscribeToPlatformSettings(async () => {
      if (id) {
        const data = await fetchScooterDetail(id, { forceRefresh: true })
        if (data) {
          if (data.scooter) setScooter(data.scooter)
          if (data.vendor) setVendor(data.vendor)
        }
      }
    })

    return () => unsubscribe()
  }, [id, initialScooter])

  // Helper to get delivery area
  const getDeliveryArea = (address?: string) => {
    if (!address) return "Ubud, Canggu, Seminyak, Sanur & Greater Bali"
    const lower = address.toLowerCase()
    if (lower.includes("ubud") || lower.includes("gianyar") || lower.includes("cempaka") || lower.includes("mas")) {
      return "Central Ubud, Mas, Sayan, Campuhan, Penestanan & Tegallalang"
    }
    if (lower.includes("canggu") || lower.includes("pererenan") || lower.includes("berawa") || lower.includes("tibubeneng")) {
      return "Batu Bolong, Echo Beach, Berawa, Pererenan & Umalas"
    }
    if (lower.includes("seminyak") || lower.includes("kerobokan") || lower.includes("kuta")) {
      return "Seminyak, Petitenget, Double Six, Legian & Sunset Road"
    }
    if (lower.includes("uluwatu") || lower.includes("bukit") || lower.includes("ungasan") || lower.includes("jimbaran") || lower.includes("pecatu")) {
      return "Uluwatu, Padang Padang, Bingin, Balangan & Jimbaran"
    }
    if (lower.includes("sanur")) {
      return "Sanur Beach, Renon & Denpasar Timur"
    }
    return `${address} and surrounding area (10km radius)`
  }

  // Price calculations
  const priceDaily = useMemo(() => Number(scooter?.price_daily || scooter?.price || 0), [scooter])
  const priceWeekly = useMemo(() => {
    if (scooter?.price_weekly && Number(scooter.price_weekly) > 0) {
      return Number(scooter.price_weekly)
    }
    return priceDaily * 7 * 0.9 // 10% default discount for weekly
  }, [scooter, priceDaily])

  const priceMonthly = useMemo(() => {
    if (scooter?.price_monthly && Number(scooter.price_monthly) > 0) {
      return Number(scooter.price_monthly)
    }
    return priceDaily * 30 * 0.75 // 25% default discount for monthly
  }, [scooter, priceDaily])

  const activeDisplayPrice = useMemo(() => {
    if (selectedPlan === "weekly") return Math.round(priceWeekly)
    if (selectedPlan === "monthly") return Math.round(priceMonthly)
    return priceDaily
  }, [selectedPlan, priceDaily, priceWeekly, priceMonthly])

  const activeDurationLabel = useMemo(() => {
    if (selectedPlan === "weekly") return "/ week"
    if (selectedPlan === "monthly") return "/ month"
    return "/ day"
  }, [selectedPlan])

  if (!scooter && !loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] text-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-xs">
          <Bike className="w-8 h-8 text-black" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Scooter Not Found</h2>
        <p className="text-sm text-gray-500 max-w-sm">The vehicle listing you are looking for is unavailable or has been removed from our fleet.</p>
        <Link href="/" prefetch={true} className="mt-2 px-6 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-neutral-800 transition-colors active-press">
          Return to Catalog
        </Link>
      </div>
    )
  }

  if (!scooter) {
    return null
  }

  const engineDisplay = scooter.engine || "125 cc"
  const yearDisplay = scooter.year || "2025"
  const fuelDisplay = scooter.fuel_capacity || "5.1 L"
  const transmissionDisplay = scooter.transmission || "Automatic CVT"
  const brandDisplay = scooter.brand || scooter.name?.split(" ")[0] || "Honda"
  const availableUnits = scooter.available_units || 1

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black antialiased w-full max-w-full overflow-x-hidden pt-3 pb-24 md:py-6">
      
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2 border border-gray-800 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-white" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Header Bar */}
        <header className="flex justify-between items-center py-2.5 mb-4 sm:mb-6">
          <button 
            type="button"
            onClick={handleBack} 
            aria-label="Go Back"
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-black shadow-xs border border-gray-200/80 hover:bg-neutral-100 transition-all active-press cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-black" aria-hidden="true" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Fleet</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm font-extrabold text-gray-900 truncate max-w-[180px] sm:max-w-xs">{scooter.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleShare}
              aria-label="Share this scooter"
              className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-black shadow-xs border border-gray-200/80 hover:bg-neutral-100 transition-all active-press cursor-pointer shrink-0"
            >
              <Share2 className="w-4 h-4 text-black" aria-hidden="true" />
            </button>
            <button 
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              aria-label={isLiked ? `Unsave ${scooter.name}` : `Save ${scooter.name}`}
              className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-xs border border-gray-200/80 hover:bg-neutral-100 transition-all active-press cursor-pointer shrink-0"
            >
              <Heart className={`w-5 h-5 transition-colors ${isLiked ? "fill-black text-black" : "text-gray-700"}`} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Responsive 2-Column Showcase Layout */}
        <main className="flex flex-col lg:grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8 items-start w-full">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: VEHICLE VISUAL SHOWCASE & TECHNICAL SPECIFICATIONS */}
          {/* ========================================================================= */}
          <div className="flex flex-col w-full space-y-4 sm:space-y-5">
            
            {/* 1. Main Scooter Stage Card */}
            <article className="relative w-full bg-white rounded-[32px] p-5 sm:p-7 md:p-8 shadow-xs border border-gray-200/80 flex flex-col justify-between overflow-hidden">
              
              {/* Top Tags Row */}
              <div className="flex items-center justify-between gap-2 z-10 mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-xs">
                    {yearDisplay}
                  </span>
                  <span className="bg-neutral-100 text-black border border-neutral-200/90 text-xs font-bold px-3 py-1.5 rounded-full">
                    {brandDisplay}
                  </span>
                </div>
                <span className="bg-neutral-100 text-black border border-neutral-200/90 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-black" /> Verified Fleet
                </span>
              </div>

              {/* High-Resolution Scooter Visual Presentation */}
              <div className="relative w-full h-[260px] sm:h-[340px] md:h-[400px] flex items-center justify-center my-3 sm:my-4">
                <Image
                  src={scooter.image_url || "/images/scooter.png"}
                  alt={`${scooter.name} scooter rental Bali`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 550px"
                  className="object-contain p-2 sm:p-4 drop-shadow-md transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Highlights Feature Strip */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
                <div className="p-2 bg-[#F8F9FA] rounded-2xl border border-gray-200/60">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Cleanliness</span>
                  <span className="text-xs font-extrabold text-gray-900 block mt-0.5">Sanitized</span>
                </div>
                <div className="p-2 bg-[#F8F9FA] rounded-2xl border border-gray-200/60">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Fuel Tank</span>
                  <span className="text-xs font-extrabold text-gray-900 block mt-0.5">{fuelDisplay}</span>
                </div>
                <div className="p-2 bg-[#F8F9FA] rounded-2xl border border-gray-200/60">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Status</span>
                  <span className="text-xs font-extrabold text-gray-900 block mt-0.5">{availableUnits} Available</span>
                </div>
              </div>
            </article>

            {/* 2. Scooter Technical Specifications Matrix (6 Black & White Cards) */}
            <section aria-labelledby="specs-heading" className="bg-white rounded-[32px] p-5 sm:p-6 shadow-xs border border-gray-200/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-black" aria-hidden="true" />
                  <h2 id="specs-heading" className="text-base font-extrabold text-gray-900 tracking-tight">
                    Technical Specifications
                  </h2>
                </div>
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Factory Specs
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                {/* Engine Card */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Engine</span>
                    <Gauge className="w-4 h-4 text-black" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">{engineDisplay}</p>
                    <p className="text-[11px] text-gray-500 font-medium">4-Stroke SOHC</p>
                  </div>
                </div>

                {/* Transmission Card */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Drive</span>
                    <Bike className="w-4 h-4 text-black" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">{transmissionDisplay}</p>
                    <p className="text-[11px] text-gray-500 font-medium">Twist & Go</p>
                  </div>
                </div>

                {/* Fuel Capacity Card */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Fuel Tank</span>
                    <Fuel className="w-4 h-4 text-black" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">{fuelDisplay}</p>
                    <p className="text-[11px] text-gray-500 font-medium">~45-50 km/L</p>
                  </div>
                </div>

                {/* Storage Card */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Storage</span>
                    <Package className="w-4 h-4 text-black" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">Underseat Trunk</p>
                    <p className="text-[11px] text-gray-500 font-medium">Fits 1 Helmet</p>
                  </div>
                </div>

                {/* Ignition / Key Card */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Ignition</span>
                    <KeyRound className="w-4 h-4 text-black" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">Electric Start</p>
                    <p className="text-[11px] text-gray-500 font-medium">Smart Key / Keyless</p>
                  </div>
                </div>

                {/* Braking System Card */}
                <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Braking</span>
                    <Disc className="w-4 h-4 text-black" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">Front Disc</p>
                    <p className="text-[11px] text-gray-500 font-medium">Combined Braking</p>
                  </div>
                </div>

              </div>
            </section>

            {/* 3. About This Scooter & Bali Riding Suitability */}
            <section aria-labelledby="about-scooter-heading" className="bg-white rounded-[32px] p-5 sm:p-6 shadow-xs border border-gray-200/80">
              <h2 id="about-scooter-heading" className="text-base font-extrabold text-gray-900 tracking-tight mb-2.5">
                About the {scooter.name}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                {scooter.description || `The ${scooter.name} is engineered for effortless handling, nimble maneuverability, and exceptional fuel efficiency. Perfectly calibrated for Bali's bustling coastal alleys in Canggu and Seminyak as well as scenic mountain slopes in Ubud and Uluwatu, it provides smooth acceleration, plush dual seating, and dependable performance.`}
              </p>
            </section>

          </div>


          {/* ========================================================================= */}
          {/* RIGHT COLUMN: PRICING, VENDOR, INCLUDED GEAR & DIRECT BOOKING */}
          {/* ========================================================================= */}
          <div className="flex flex-col w-full space-y-4 sm:space-y-5">
            
            {/* 1. Identity & Pricing Breakdown Card */}
            <section aria-labelledby="pricing-heading" className="bg-white rounded-[32px] p-5 sm:p-6 shadow-xs border border-gray-200/80">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                    {brandDisplay} Rental
                  </span>
                  <h1 id="pricing-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    {scooter.name}
                  </h1>
                </div>
                <div className="flex items-center gap-1 bg-black text-white text-xs font-extrabold px-3 py-1.5 rounded-full shrink-0 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-white text-white" aria-hidden="true" />
                  <span>{vendor?.rating ? Number(vendor.rating).toFixed(1) : "5.0"}</span>
                </div>
              </div>

              {/* 3-Tier Rental Plan Selector Pills */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Select Rental Duration Plan
                </span>
                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Daily Plan */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("daily")}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      selectedPlan === "daily"
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-[#F8F9FA] text-gray-900 border-gray-200 hover:border-black"
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedPlan === "daily" ? "text-gray-300" : "text-gray-500"}`}>
                      Daily
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold mt-0.5 truncate">
                      Rp {priceDaily.toLocaleString()}
                    </p>
                  </button>

                  {/* Weekly Plan */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("weekly")}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative ${
                      selectedPlan === "weekly"
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-[#F8F9FA] text-gray-900 border-gray-200 hover:border-black"
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedPlan === "weekly" ? "text-gray-300" : "text-gray-500"}`}>
                      Weekly
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold mt-0.5 truncate">
                      Rp {Math.round(priceWeekly).toLocaleString()}
                    </p>
                  </button>

                  {/* Monthly Plan */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("monthly")}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative ${
                      selectedPlan === "monthly"
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-[#F8F9FA] text-gray-900 border-gray-200 hover:border-black"
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedPlan === "monthly" ? "text-gray-300" : "text-gray-500"}`}>
                      Monthly
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold mt-0.5 truncate">
                      Rp {Math.round(priceMonthly).toLocaleString()}
                    </p>
                  </button>

                </div>
              </div>

              {/* Active Rate Highlight Bar */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Calculated Rate
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      Rp {activeDisplayPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">{activeDurationLabel}</span>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-black bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-xs">
                  Tax & Helmets Incl.
                </span>
              </div>
            </section>


            {/* 2. Verified Host Vendor Card */}
            {vendor && (
              <section aria-labelledby="host-heading" className="bg-white rounded-[32px] p-5 sm:p-6 shadow-xs border border-gray-200/80">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block">
                    Verified Host Partner
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                    Active Garage
                  </span>
                </div>

                <Link 
                  href={`/vendor/${vendor.id}`} 
                  prefetch={true}
                  className="group flex items-center justify-between p-3.5 bg-[#F8F9FA] rounded-2xl border border-gray-200/80 hover:border-black transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white border border-gray-200 shrink-0 shadow-xs flex items-center justify-center font-extrabold text-sm text-black">
                      {vendor.logo || vendor.image_url ? (
                        <Image 
                          src={vendor.logo || vendor.image_url} 
                          alt={vendor.name || "Vendor"} 
                          fill
                          sizes="48px"
                          className="object-cover" 
                        />
                      ) : (
                        <span>{vendor.name?.slice(0, 2).toUpperCase() || "VN"}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base truncate group-hover:text-black transition-colors">
                        {vendor.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1 text-black font-bold">
                          <Star className="w-3 h-3 fill-black text-black" aria-hidden="true" />
                          {vendor.rating ? Number(vendor.rating).toFixed(1) : "5.0"}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[140px] sm:max-w-[180px]">{vendor.address || "Bali, Indonesia"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black shrink-0 group-hover:bg-black group-hover:text-white transition-all shadow-2xs">
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </Link>

                {/* Vendor Operating Hours Strip */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-600 bg-white border border-gray-100 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-black shrink-0" aria-hidden="true" />
                    <span className="font-medium">Hours: {vendor.opening_hours || "08:00 AM – 22:00 PM"}</span>
                  </div>
                  <span className="font-extrabold text-black">Fast Dispatch</span>
                </div>
              </section>
            )}


            {/* 3. Included Equipment & Support (Strictly Black & White, NO Free 24h Cancellation) */}
            <section aria-labelledby="inclusions-heading" className="bg-white rounded-[32px] p-5 sm:p-6 shadow-xs border border-gray-200/80">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-black" aria-hidden="true" />
                  <h2 id="inclusions-heading" className="text-base font-extrabold text-gray-900 tracking-tight">
                    Included with Scooter
                  </h2>
                </div>
                <span className="text-[11px] font-extrabold text-gray-500 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  Complimentary
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                
                <div className="bg-[#F8F9FA] border border-gray-200/80 p-3 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-gray-900 block font-bold">2 Sanitized Helmets</strong>
                    <span className="text-gray-500 text-[11px]">Clean padding with adjustable visor</span>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] border border-gray-200/80 p-3 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-gray-900 block font-bold">Phone Mount Holder</strong>
                    <span className="text-gray-500 text-[11px]">Secure handlebar clamp for GPS navigation</span>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] border border-gray-200/80 p-3 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-gray-900 block font-bold">24/7 Roadside Assistance</strong>
                    <span className="text-gray-500 text-[11px]">Island-wide emergency & mechanical support</span>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] border border-gray-200/80 p-3 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="text-gray-900 block font-bold">Full Safety Inspection</strong>
                    <span className="text-gray-500 text-[11px]">Brakes, tires, engine & fluids checked</span>
                  </div>
                </div>

              </div>
            </section>


            {/* 4. Delivery & Pickup Coverage Zone */}
            <section aria-labelledby="delivery-heading" className="bg-white rounded-[32px] p-5 sm:p-6 shadow-xs border border-gray-200/80">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-black" aria-hidden="true" />
                  <h2 id="delivery-heading" className="text-base font-extrabold text-gray-900 tracking-tight">
                    Delivery & Pickup
                  </h2>
                </div>
                <span className="text-[11px] font-extrabold text-black bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  Direct Handover
                </span>
              </div>

              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200/80 mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  Primary Delivery Coverage
                </span>
                <p className="text-xs font-extrabold text-gray-900 leading-relaxed">
                  {vendor?.delivery_area || getDeliveryArea(vendor?.address)}
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500">
                  <span>Garage Dispatch:</span>
                  <span className="font-bold text-black truncate max-w-[190px]">{vendor?.address || "Bali, Indonesia"}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-black">•</span>
                  <p><strong className="text-gray-900">Hotel / Villa Delivery:</strong> Handed over directly to your lobby or accommodation.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-black">•</span>
                  <p><strong className="text-gray-900">Direct Shop Pickup:</strong> Collect instantly at the partner shop garage.</p>
                </div>
              </div>
            </section>


            {/* 5. 3-Step Rental Requirements */}
            <section aria-labelledby="requirements-heading" className="bg-white rounded-[32px] p-5 sm:p-6 shadow-xs border border-gray-200/80">
              <h2 id="requirements-heading" className="text-base font-extrabold text-gray-900 tracking-tight mb-3">
                Rental Requirements
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 bg-[#F8F9FA] p-3 rounded-2xl border border-gray-200/80">
                  <div className="w-6 h-6 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <p className="font-bold text-gray-900">Valid Passport or National ID Photo</p>
                </div>
                <div className="flex items-center gap-3 bg-[#F8F9FA] p-3 rounded-2xl border border-gray-200/80">
                  <div className="w-6 h-6 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <p className="font-bold text-gray-900">Valid Driving License or International Permit</p>
                </div>
                <div className="flex items-center gap-3 bg-[#F8F9FA] p-3 rounded-2xl border border-gray-200/80">
                  <div className="w-6 h-6 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <p className="font-bold text-gray-900">Online Checkout & WhatsApp Delivery Coordination</p>
                </div>
              </div>
            </section>


            {/* 6. Desktop Booking CTA Box */}
            <div className="hidden lg:flex flex-col bg-white rounded-[32px] p-6 shadow-sm border border-gray-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Estimated Rate</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-gray-900 tracking-tight">Rp {activeDisplayPrice.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 font-bold">{activeDurationLabel}</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold bg-neutral-100 text-black border border-neutral-200 px-3 py-1.5 rounded-full">
                  Instant Confirmation
                </span>
              </div>

              <Link 
                href={`/checkout?scooterId=${scooter.id}`} 
                prefetch={true}
                className="w-full bg-black text-white text-center py-4 rounded-full text-sm font-extrabold shadow-sm hover:bg-neutral-800 active-press transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book This Scooter</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </main>
      </div>
      
      {/* Mobile Floating Sticky Booking Footer Bar */}
      <nav aria-label="Quick Booking Bar" className="lg:hidden fixed bottom-4 left-4 right-4 mx-auto bg-black text-white rounded-full px-5 py-3.5 flex items-center justify-between shadow-2xl z-40 border border-neutral-800">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-white tracking-tight">Rp {activeDisplayPrice.toLocaleString()}</span>
            <span className="text-[11px] text-gray-400 font-medium">{activeDurationLabel}</span>
          </div>
        </div>
        
        <Link 
          href={`/checkout?scooterId=${scooter.id}`} 
          prefetch={true}
          className="bg-white text-black px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold shadow-xs hover:bg-neutral-100 active-press transition-all flex items-center gap-1.5"
        >
          <span>Book Now</span>
          <ChevronRight className="w-3.5 h-3.5 text-black" />
        </Link>
      </nav>

    </div>
  )
}
