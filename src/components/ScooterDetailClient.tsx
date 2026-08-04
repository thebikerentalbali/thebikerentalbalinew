"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  Heart, 
  ChevronRight, 
  Share2, 
  Check, 
  MapPin, 
  Bike,
  ShieldCheck
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
      <div className="min-h-screen bg-[#F0F2F5] text-black flex flex-col items-center justify-center gap-4 px-6 text-center">
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

  const formattedName = formatTitleCase(scooter.name) || "Scooter"
  const engineDisplay = scooter.engine || "125 cc"
  const yearDisplay = scooter.year || "2025"
  const fuelDisplay = scooter.fuel_capacity || "5.1 L"
  const transmissionDisplay = scooter.transmission || "Automatic CVT"
  const brandDisplay = formatTitleCase(scooter.brand || scooter.name?.split(" ")[0] || "Honda")
  const availableUnits = scooter.available_units || 1
  const priceDaily = Number(scooter.price_daily || scooter.price || 0)
  const priceWeekly = Number(scooter.price_weekly || priceDaily * 6.5)
  const priceMonthly = Number(scooter.price_monthly || priceDaily * 22)

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black antialiased w-full max-w-full overflow-x-hidden pt-3 pb-24 md:py-6">
      
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2 border border-neutral-800 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-white" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Header */}
        <header className="flex justify-between items-center py-2.5 mb-4 sm:mb-6">
          <button 
            type="button"
            onClick={handleBack} 
            aria-label="Go Back"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-xs border border-gray-200 hover:bg-neutral-100 transition-all active-press cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-black" aria-hidden="true" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Fleet</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm font-extrabold text-gray-900 uppercase tracking-tight truncate max-w-[180px] sm:max-w-xs">{formattedName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleShare}
              aria-label="Share this scooter"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-xs border border-gray-200 hover:bg-neutral-100 transition-all active-press cursor-pointer shrink-0"
            >
              <Share2 className="w-4 h-4 text-black" aria-hidden="true" />
            </button>
            <button 
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              aria-label={isLiked ? `Unsave ${formattedName}` : `Save ${formattedName}`}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xs border border-gray-200 hover:bg-neutral-100 transition-all active-press cursor-pointer shrink-0"
            >
              <Heart className={`w-4 h-4 transition-colors ${isLiked ? "fill-black text-black" : "text-gray-700"}`} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Main 2-Column Responsive Layout */}
        <main className="flex flex-col lg:grid lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-8 items-start w-full">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: VEHICLE SHOWCASE & SPECIFICATIONS                            */}
          {/* ========================================================================= */}
          <div className="flex flex-col w-full space-y-4 sm:space-y-5">
            
            {/* 1. Main Scooter Showcase Card */}
            <article className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 shadow-xs border border-gray-200 flex flex-col justify-between">
              
              {/* Pills Row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-black text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {brandDisplay}
                  </span>
                  <span className="bg-[#F8F9FA] text-gray-800 border border-gray-200 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {yearDisplay}
                  </span>
                </div>
                <span className="bg-[#F8F9FA] text-black border border-gray-200 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {availableUnits} Available
                </span>
              </div>

              {/* Scooter High-Res Image Presentation */}
              <div className="relative w-full h-[240px] sm:h-[320px] md:h-[360px] flex items-center justify-center my-3 sm:my-4">
                <Image
                  src={scooter.image_url || "/images/scooter.png"}
                  alt={`${formattedName} scooter rental Bali`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 550px"
                  className="object-contain p-2 sm:p-4 drop-shadow-md"
                />
              </div>

              {/* Title & Core Summary */}
              <div className="pt-3 border-t border-gray-100">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight mb-1.5">
                  {formattedName}
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  {engineDisplay} • {transmissionDisplay} • 2 Helmets Included • Verified Clean & Serviced
                </p>
              </div>
            </article>

            {/* 2. Unified Specifications Strip */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-200">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                Vehicle Specifications
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Engine</span>
                  <span className="text-sm font-black text-gray-900 block">{engineDisplay}</span>
                  <span className="text-[11px] text-gray-500">4-Stroke SOHC</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Transmission</span>
                  <span className="text-sm font-black text-gray-900 block">{transmissionDisplay}</span>
                  <span className="text-[11px] text-gray-500">Twist & Go Automatic</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Fuel Tank</span>
                  <span className="text-sm font-black text-gray-900 block">{fuelDisplay}</span>
                  <span className="text-[11px] text-gray-500">~45–50 km/L</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Storage</span>
                  <span className="text-sm font-black text-gray-900 block">Underseat Trunk</span>
                  <span className="text-[11px] text-gray-500">Fits 1 Helmet</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Ignition</span>
                  <span className="text-sm font-black text-gray-900 block">Electric Start</span>
                  <span className="text-[11px] text-gray-500">Smart Key / Keyless</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Included Gear</span>
                  <span className="text-sm font-black text-gray-900 block">2 Helmets</span>
                  <span className="text-[11px] text-gray-500">+ Phone Mount</span>
                </div>
              </div>
            </section>

            {/* 3. About This Scooter */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-200">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5">
                About the {formattedName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {scooter.description && !scooter.description.includes("FAZZIO") 
                  ? scooter.description 
                  : `The ${formattedName} is engineered for agile maneuverability, effortless handling, and exceptional fuel economy across Bali. Equipped with a smooth automatic CVT transmission, comfortable dual seating, and convenient underseat storage, it delivers an easy and dependable ride whether you are navigating coastal roads in Canggu and Seminyak, touring Ubud's scenic routes, or exploring the beaches of Uluwatu. Thoroughly sanitized, fueled, and safety-inspected prior to handover.`
                }
              </p>
            </section>

          </div>


          {/* ========================================================================= */}
          {/* RIGHT COLUMN: BOOKING, PRICING, VENDOR & RENTAL RULES                     */}
          {/* ========================================================================= */}
          <div className="flex flex-col w-full space-y-4 sm:space-y-5 lg:sticky lg:top-6">
            
            {/* 1. Primary Booking Card */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-200">
              
              {/* Rates Breakdown */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Rental Rates
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded-full">
                    Best Price Guarantee
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-2xl border border-gray-200">
                    <div>
                      <span className="text-xs font-black text-gray-900 block">Daily</span>
                      <span className="text-[10px] text-gray-500">Flexible 24-hr rental</span>
                    </div>
                    <span className="text-base font-black text-gray-900">
                      Rp {priceDaily.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-2xl border border-gray-200">
                    <div>
                      <span className="text-xs font-black text-gray-900 block">Weekly</span>
                      <span className="text-[10px] text-gray-500">7 Days (Discounted)</span>
                    </div>
                    <span className="text-base font-black text-gray-900">
                      Rp {priceWeekly.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-2xl border border-gray-200">
                    <div>
                      <span className="text-xs font-black text-gray-900 block">Monthly</span>
                      <span className="text-[10px] text-gray-500">30 Days (Maximum Savings)</span>
                    </div>
                    <span className="text-base font-black text-gray-900">
                      Rp {priceMonthly.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inclusions List */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2.5 text-xs text-gray-700 font-bold">
                  <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>2 Sanitized Helmets + Phone Mount Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700 font-bold">
                  <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Free Hotel & Villa Delivery in Service Area</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700 font-bold">
                  <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>24/7 Roadside Mechanical Support Across Bali</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700 font-bold">
                  <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Instant Confirmation with Zero Hidden Fees</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link 
                href={`/checkout?scooterId=${scooter.id}`} 
                prefetch={true}
                className="w-full bg-black text-white text-center py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider hover:bg-neutral-800 active-press transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Book This Scooter</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </Link>
            </section>

            {/* 2. Verified Host Partner Card */}
            {vendor && (
              <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                    Verified Host Partner
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#F8F9FA] text-gray-800 border border-gray-200 px-2.5 py-0.5 rounded-full">
                    Active Partner
                  </span>
                </div>

                <Link 
                  href={`/vendor/${vendor.id}`} 
                  prefetch={true}
                  className="group flex items-center justify-between p-3 bg-[#F8F9FA] rounded-2xl border border-gray-200 hover:border-black transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white border border-gray-200 shrink-0 flex items-center justify-center font-black text-xs text-black">
                      {vendor.logo || vendor.image_url ? (
                        <Image 
                          src={vendor.logo || vendor.image_url} 
                          alt={vendor.name || "Vendor"} 
                          fill
                          sizes="44px"
                          className="object-cover" 
                        />
                      ) : (
                        <span>{vendor.name?.slice(0, 2).toUpperCase() || "VN"}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight truncate group-hover:text-black transition-colors">
                          {vendor.name}
                        </h3>
                        <InstagramVerifiedBadge className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-black shrink-0" />
                        <span className="truncate max-w-[170px]">{vendor.address || "Bali, Indonesia"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </Link>
              </section>
            )}

            {/* 3. Simple Rental Requirements */}
            <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-200">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Rental Requirements
              </h2>

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
                  <span className="font-bold text-gray-900">Online Checkout & WhatsApp Delivery Coordination</span>
                </div>
              </div>
            </section>

          </div>

        </main>
      </div>
      
      {/* Mobile Floating Sticky Booking Footer Bar */}
      <nav aria-label="Quick Booking Bar" className="lg:hidden fixed bottom-4 left-4 right-4 mx-auto bg-black text-white rounded-full px-5 py-3.5 flex items-center justify-between shadow-2xl z-40 border border-neutral-800">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Daily Rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-white tracking-tight">
              Rp {priceDaily.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">/ day</span>
          </div>
        </div>
        
        <Link 
          href={`/checkout?scooterId=${scooter.id}`} 
          prefetch={true}
          className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs hover:bg-neutral-100 active-press transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>Book Now</span>
          <ChevronRight className="w-3.5 h-3.5 text-black" />
        </Link>
      </nav>

    </div>
  )
}
