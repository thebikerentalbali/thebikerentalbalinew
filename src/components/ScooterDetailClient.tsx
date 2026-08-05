"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  X,
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share2, 
  Check, 
  MapPin, 
  Bike,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Info
} from "lucide-react"
import { fetchScooterDetail } from "@/lib/api/catalogService"
import { subscribeToPlatformSettings } from "@/utils/pricing"

interface ScooterDetailClientProps {
  id: string
  initialScooter: any
  initialVendor: any
  initialSettings?: any
}

function formatTitleCase(str?: string) {
  if (!str) return ""
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function InstagramVerifiedBadge({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      aria-label="Verified Partner" 
      className={`inline-block ${className}`}
    >
      <title>Verified Partner</title>
      <path
        d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.137V5.15h-6.162L25.358 0l-5.36 3.094Z"
        fill="#0095F6"
      />
      <path
        d="M16.5 28.5 9 21l2.85-2.85 4.65 4.65 11.65-11.65L31 14l-14.5 14.5Z"
        fill="#FFFFFF"
      />
    </svg>
  )
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
  const [copiedToast, setCopiedToast] = useState(false)
  const [showPolicies, setShowPolicies] = useState(false)
  const [activeDuration, setActiveDuration] = useState<"daily" | "weekly" | "monthly">("daily")
  const [imageIndex, setImageIndex] = useState<number>(0)

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
      const formattedTitle = formatTitleCase(scooter?.name) || "Scooter"
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${formattedTitle} Rental in Bali`,
            text: `Rent ${formattedTitle} on THE BIKE RENTAL BALI!`,
            url: window.location.href,
          })
        } catch {
          // User dismissed or share error
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

  if (!scooter && !loading) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] text-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-xs">
          <Bike className="w-8 h-8 text-black" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Scooter Not Found</h2>
        <p className="text-sm text-gray-500 max-w-sm">The vehicle listing you are looking for is unavailable or has been removed from our fleet.</p>
        <Link href="/" prefetch={true} className="mt-2 px-6 py-3 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors active-press uppercase tracking-wider">
          Return to Catalog
        </Link>
      </div>
    )
  }

  if (!scooter) {
    return null
  }

  const rawName = scooter.name || "Scooter"
  const brandDisplay = formatTitleCase(scooter.brand || rawName.split(" ")[0] || "Honda")
  const formattedName = formatTitleCase(rawName)
  const engineDisplay = scooter.engine || "125 cc"
  const yearDisplay = scooter.year || "2025"
  const fuelDisplay = scooter.fuel_capacity || "5.1 L"
  const transmissionDisplay = scooter.transmission || "Automatic CVT"
  const availableUnits = scooter.available_units || 1
  const priceDaily = Number(scooter.price_daily || scooter.price || 0)
  const priceWeekly = Number(scooter.price_weekly || priceDaily * 6.5)
  const priceMonthly = Number(scooter.price_monthly || priceDaily * 22)

  // Current active price according to duration mode
  const currentPrice = 
    activeDuration === "weekly" 
      ? Math.round(priceWeekly / 7) 
      : activeDuration === "monthly" 
      ? Math.round(priceMonthly / 30) 
      : priceDaily

  const durationRateLabel = 
    activeDuration === "weekly" ? "/day" : activeDuration === "monthly" ? "/day" : "/day"

  // Image list for carousel navigation
  const scooterImages = [
    scooter.image_url || scooter.img || "/images/scooter.png",
    scooter.image_url_2 || scooter.image_url || scooter.img || "/images/scooter.png"
  ]

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % scooterImages.length)
  }

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + scooterImages.length) % scooterImages.length)
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black antialiased w-full max-w-full overflow-x-hidden py-4 sm:py-6 md:py-8">
      
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2 border border-neutral-800 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-white" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* ========================================================================= */}
        {/* MAIN SHOWCASE CARD                                                        */}
        {/* ========================================================================= */}
        <article className="bg-[#F8F9FA] rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200/80 flex flex-col justify-between mb-6 transition-all">
          
          {/* 1. Header: Brand Model on Left, Actions & Close (X) on Right */}
          <div className="flex items-start justify-between gap-4 mb-2 sm:mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#191919] tracking-tight font-sans">
                {formattedName}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-0.5 uppercase tracking-wider">
                {brandDisplay}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleShare}
                aria-label="Share this scooter"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-gray-700 shadow-xs border border-gray-200 hover:bg-gray-100 hover:text-black transition-all active-press cursor-pointer shrink-0"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button 
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                aria-label={isLiked ? `Unsave ${formattedName}` : `Save ${formattedName}`}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-xs border border-gray-200 hover:bg-gray-100 transition-all active-press cursor-pointer shrink-0"
              >
                <Heart className={`w-4 h-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} aria-hidden="true" />
              </button>
              
              {/* Close Button (X) */}
              <button 
                type="button"
                onClick={handleBack} 
                aria-label="Close details"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-gray-800 shadow-xs border border-gray-200 hover:bg-gray-100 hover:text-black transition-all active-press cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* 2. Vehicle Hero Showcase Stage */}
          <div className="relative w-full h-[230px] sm:h-[300px] md:h-[340px] flex items-center justify-center my-2 sm:my-4">
            <div className="absolute inset-0 bg-radial from-white via-transparent to-transparent opacity-60 pointer-events-none rounded-full blur-2xl"></div>
            
            <Image
              src={scooterImages[imageIndex]}
              alt={`${formattedName} scooter rental Bali`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 750px"
              className="object-contain p-2 sm:p-4 drop-shadow-xl transition-all duration-300 transform hover:scale-105"
            />
          </div>

          {/* 3. Image Carousel Controls Below Vehicle (<) (>) */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:border-black hover:text-black active-press transition-all shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:border-black hover:text-black active-press transition-all shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4. Rounded Vendor Card Below Image Display */}
          {vendor && (
            <div className="w-full">
              <Link 
                href={`/vendor/${vendor.id}`} 
                prefetch={true}
                className="group flex items-center justify-between p-3.5 bg-white hover:bg-neutral-50 rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-2xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center font-black text-xs text-black">
                    {vendor.logo || vendor.image_url ? (
                      <Image 
                        src={vendor.logo || vendor.image_url} 
                        alt={vendor.name || "Vendor"} 
                        fill
                        sizes="40px"
                        className="object-cover" 
                      />
                    ) : (
                      <span>{vendor.name?.slice(0, 2).toUpperCase() || "VN"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-gray-900 text-sm tracking-tight truncate group-hover:text-black transition-colors">
                        {vendor.name}
                      </span>
                      <InstagramVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    {vendor.address && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-black shrink-0" />
                        <span className="truncate max-w-[200px]">{vendor.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </Link>
            </div>
          )}

        </article>

        {/* ========================================================================= */}
        {/* RATES BREAKDOWN & BOOKING CARD                                            */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80 mb-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest block">
                Rental Rates
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                2 Helmets & Hotel Delivery Included
              </span>
            </div>

            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                  Rp {currentPrice.toLocaleString("id-ID")}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-400">
                  {durationRateLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Rental Duration Filter Pills */}
          <div className="grid grid-cols-3 gap-2 mb-5 p-1 bg-[#F0F2F5] rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveDuration("daily")}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeDuration === "daily" 
                  ? "bg-white text-black shadow-xs" 
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Daily (24h)
            </button>
            <button
              type="button"
              onClick={() => setActiveDuration("weekly")}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeDuration === "weekly" 
                  ? "bg-white text-black shadow-xs" 
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Weekly (-15%)
            </button>
            <button
              type="button"
              onClick={() => setActiveDuration("monthly")}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeDuration === "monthly" 
                  ? "bg-white text-black shadow-xs" 
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Monthly (-30%)
            </button>
          </div>

          <Link 
            href={`/checkout?scooterId=${scooter.id}`} 
            prefetch={true}
            className="w-full bg-[#1C1C1E] hover:bg-black text-white py-4 px-8 rounded-2xl text-sm font-bold uppercase tracking-wider active-press transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md hover:shadow-lg"
          >
            <span>Book This Scooter</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </Link>
        </section>

        {/* ========================================================================= */}
        {/* VEHICLE SPECIFICATIONS (CLEAN, NO EXTRA DESCRIPTIONS)                    */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bike className="w-4 h-4 text-gray-900" />
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
              Vehicle Specifications
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Engine</span>
              <span className="text-sm font-black text-gray-900 block">{engineDisplay}</span>
            </div>

            <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Transmission</span>
              <span className="text-sm font-black text-gray-900 block truncate">{transmissionDisplay}</span>
            </div>

            <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Fuel Capacity</span>
              <span className="text-sm font-black text-gray-900 block">{fuelDisplay}</span>
            </div>

            <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Storage</span>
              <span className="text-sm font-black text-gray-900 block">Underseat Trunk</span>
            </div>

            <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Model Year</span>
              <span className="text-sm font-black text-gray-900 block">{yearDisplay}</span>
            </div>

            <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Availability</span>
              <span className="text-sm font-black text-gray-900 block">{availableUnits} Available</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ABOUT THIS SCOOTER                                                        */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80 mb-6">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
            About the {formattedName}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
            {scooter.description && !scooter.description.includes("FAZZIO") 
              ? scooter.description 
              : `The ${formattedName} is engineered for agile maneuverability, effortless handling, and exceptional fuel economy across Bali. Equipped with a smooth automatic CVT transmission, comfortable dual seating, and convenient underseat storage, it delivers an easy and dependable ride whether you are navigating coastal roads in Canggu and Seminyak, touring Ubud's scenic routes, or exploring the beaches of Uluwatu. Thoroughly sanitized, fueled, and safety-inspected prior to handover.`
            }
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SINGLE BUTTON: RENTAL INCLUSIONS, GUARANTEE & REQUIREMENTS                */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-gray-200/80 mb-8">
          <button
            type="button"
            onClick={() => setShowPolicies(!showPolicies)}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-50 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F0F2F5] flex items-center justify-center text-gray-900 shrink-0">
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>
              <div>
                <span className="text-sm font-black text-gray-900 block">
                  Rental Inclusions & Requirements
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Helmets, roadside assistance, delivery, and booking rules
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-black group-hover:text-white transition-all">
              {showPolicies ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Expandable Panel */}
          {showPolicies && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Inclusions */}
              <div>
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                  Rental Inclusions & Guarantee
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-gray-800 font-bold">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                    <span>2 Clean Sanitized Helmets + Phone Mount Included</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-800 font-bold">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                    <span>Free Hotel & Villa Delivery in Service Area</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-800 font-bold">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                    <span>24/7 Roadside Mechanical Assistance Across Bali</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-800 font-bold">
                    <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                    <span>Instant Booking Confirmation & Transparent Rates</span>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                  Rental Requirements
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3 p-2.5 bg-[#F8F9FA] rounded-xl border border-gray-200">
                    <span className="w-5 h-5 rounded-full bg-black text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span className="font-bold text-gray-900">Valid Passport or ID Photo</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-[#F8F9FA] rounded-xl border border-gray-200">
                    <span className="w-5 h-5 rounded-full bg-black text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span className="font-bold text-gray-900">Driver License or International Permit</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 bg-[#F8F9FA] rounded-xl border border-gray-200">
                    <span className="w-5 h-5 rounded-full bg-black text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span className="font-bold text-gray-900">Online Checkout & Free Handover Delivery</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>

      </div>

      {/* Floating Sticky Mobile Quick Rent Bar */}
      <nav aria-label="Quick Booking Bar" className="sm:hidden fixed bottom-4 left-4 right-4 mx-auto bg-black text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl z-40 border border-neutral-800">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {activeDuration === "daily" ? "Daily Rate" : activeDuration === "weekly" ? "Weekly Rate" : "Monthly Rate"}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-white tracking-tight">
              Rp {currentPrice.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">/ day</span>
          </div>
        </div>
        
        <Link 
          href={`/checkout?scooterId=${scooter.id}`} 
          prefetch={true}
          className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-xs hover:bg-neutral-100 active-press transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>Rent Now</span>
          <ChevronRight className="w-3.5 h-3.5 text-black" />
        </Link>
      </nav>

    </div>
  )
}
