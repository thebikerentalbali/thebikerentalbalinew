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
  ChevronDown
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

// Color options matching scooter finishes
const COLOR_OPTIONS = [
  { id: "pearl-white", name: "Pearl White", hex: "#F5F5F0", border: "#E5E5E0" },
  { id: "matte-black", name: "Matte Black", hex: "#1C1C1E", border: "#333336" },
  { id: "carbon-grey", name: "Carbon Grey", hex: "#4B4C50", border: "#606166" },
  { id: "sport-red", name: "Sport Red", hex: "#C81E1E", border: "#E02E2E" },
]

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

  // Interactive customization states matching scooter specs
  const [selectedColor, setSelectedColor] = useState<string>("pearl-white")
  const [selectedTransmission, setSelectedTransmission] = useState<string>("")
  const [selectedTireType, setSelectedTireType] = useState<string>("")
  const [ignitionMode, setIgnitionMode] = useState<"smart-key" | "fuel-injection">("smart-key")
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

  // Transmission / Velg dropdown options matching the scooter specs
  const transmissionOptions = [
    `${transmissionDisplay} • Smooth Drive`,
    "Eco Idle-Stop System Enabled",
    "Sport CVT Enhanced Response"
  ]

  // Tire dropdown options matching scooter specs
  const tireOptions = [
    `Tubeless ${scooter.brand === "Vespa" ? "120/70 R12" : "110/80 R14"} Max Grip`,
    "Michelin City Grip Pro All-Weather",
    "IRC Sport Radial Tubeless"
  ]

  const currentTransmission = selectedTransmission || transmissionOptions[0]
  const currentTire = selectedTireType || tireOptions[0]

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

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* ========================================================================= */}
        {/* MAIN SHOWCASE CARD (SCREENSHOT LAYOUT)                                    */}
        {/* ========================================================================= */}
        <article className="bg-[#F8F9FA] rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200/80 flex flex-col justify-between mb-8 transition-all">
          
          {/* 1. Header: Brand Model on Left, Close (X) on Right */}
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
              {/* Optional Share / Save icon buttons */}
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
              
              {/* Close Button matching screenshot (X) */}
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
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-contain p-2 sm:p-4 drop-shadow-xl transition-all duration-300 transform hover:scale-105"
            />
          </div>

          {/* 3. Image Carousel Controls Below Vehicle (<) (>) */}
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
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

          {/* 4. "Custom Scooter" Title & Pricing Header */}
          <div className="flex items-baseline justify-between mb-5 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                Custom Scooter
              </h2>
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                {engineDisplay} • {yearDisplay} Edition
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

          {/* Rental Duration Filter Pills (Daily, Weekly, Monthly) */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-[#EBECEF] rounded-2xl">
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

          {/* 5. 2x2 Customization Grid Matching Scooter Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            
            {/* Top-Left: Color Swatches */}
            <div className="flex flex-col justify-center">
              <label className="text-xs font-bold text-gray-500 mb-2.5 block">
                Color
              </label>
              <div className="flex items-center gap-3">
                {COLOR_OPTIONS.map((color) => {
                  const isSelected = selectedColor === color.id
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color.id)}
                      aria-label={`Select ${color.name}`}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all relative flex items-center justify-center ${
                        isSelected 
                          ? "ring-2 ring-black ring-offset-2 scale-105 shadow-sm" 
                          : "hover:scale-105 opacity-90 hover:opacity-100"
                      }`}
                      style={{ 
                        backgroundColor: color.hex, 
                        border: `1px solid ${color.border}` 
                      }}
                    >
                      {isSelected && (
                        <Check 
                          className={`w-3.5 h-3.5 ${color.id === "pearl-white" ? "text-black" : "text-white"}`} 
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Top-Right: Velg / Transmission Selector */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block">
                Velg Type
              </label>
              <div className="relative">
                <select
                  value={currentTransmission}
                  onChange={(e) => setSelectedTransmission(e.target.value)}
                  className="w-full appearance-none bg-[#ECEEF1] hover:bg-[#E5E7EB] text-gray-900 text-xs sm:text-[13px] font-bold px-4 py-3.5 rounded-2xl pr-10 border border-transparent focus:border-gray-400 focus:outline-hidden transition-all cursor-pointer truncate"
                >
                  {transmissionOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Bottom-Left: Ignition / Charge Type Iconic Buttons */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block">
                Charge Type
              </label>
              <div className="flex items-center gap-3">
                {/* Mode A: Keyless Smart Ignition (5-dot matrix icon matching screenshot) */}
                <button
                  type="button"
                  onClick={() => setIgnitionMode("smart-key")}
                  aria-label="Smart Keyless Ignition"
                  title="Smart Keyless Ignition System"
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                    ignitionMode === "smart-key"
                      ? "bg-black text-white shadow-xs scale-105"
                      : "bg-[#ECEEF1] text-gray-600 hover:bg-[#E5E7EB] hover:text-black"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-1 p-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                  </div>
                </button>

                {/* Mode B: Fuel Injection PGM-FI (Multi-dot petal icon matching screenshot) */}
                <button
                  type="button"
                  onClick={() => setIgnitionMode("fuel-injection")}
                  aria-label="Electronic Fuel Injection"
                  title="Electronic Fuel Injection (PGM-FI)"
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                    ignitionMode === "fuel-injection"
                      ? "bg-black text-white shadow-xs scale-105"
                      : "bg-[#ECEEF1] text-gray-600 hover:bg-[#E5E7EB] hover:text-black"
                  }`}
                >
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-current absolute"></div>
                    <div className="w-1 h-1 rounded-full bg-current absolute top-0 left-1/2 -translate-x-1/2"></div>
                    <div className="w-1 h-1 rounded-full bg-current absolute bottom-0 left-1/2 -translate-x-1/2"></div>
                    <div className="w-1 h-1 rounded-full bg-current absolute left-0 top-1/2 -translate-y-1/2"></div>
                    <div className="w-1 h-1 rounded-full bg-current absolute right-0 top-1/2 -translate-y-1/2"></div>
                  </div>
                </button>

                <span className="text-[11px] font-bold text-gray-500">
                  {ignitionMode === "smart-key" ? "Smart Keyless Entry" : "PGM-FI Fuel System"}
                </span>
              </div>
            </div>

            {/* Bottom-Right: Tire Type Selector */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block">
                Tire Type
              </label>
              <div className="relative">
                <select
                  value={currentTire}
                  onChange={(e) => setSelectedTireType(e.target.value)}
                  className="w-full appearance-none bg-[#ECEEF1] hover:bg-[#E5E7EB] text-gray-900 text-xs sm:text-[13px] font-bold px-4 py-3.5 rounded-2xl pr-10 border border-transparent focus:border-gray-400 focus:outline-hidden transition-all cursor-pointer truncate"
                >
                  {tireOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* 6. Action Button: Full-width Dark "Rent a Scooter" Button */}
          <div className="w-full">
            <Link 
              href={`/checkout?scooterId=${scooter.id}`} 
              prefetch={true}
              className="w-full bg-[#1C1C1E] hover:bg-black text-white py-4 sm:py-4.5 px-8 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-bold uppercase tracking-wider active-press transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md hover:shadow-lg"
            >
              <span>Rent a Scooter</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </Link>
          </div>

        </article>

        {/* ========================================================================= */}
        {/* SUPPORTING DETAILS: SPECS, HOST PARTNER, INCLUSIONS & REQUIREMENTS        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Specifications & About */}
          <div className="space-y-6">
            
            {/* Vehicle Specifications */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80">
              <div className="flex items-center gap-2 mb-4">
                <Bike className="w-4 h-4 text-gray-900" />
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Vehicle Specifications
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Engine</span>
                  <span className="text-sm font-black text-gray-900 block">{engineDisplay}</span>
                  <span className="text-[11px] text-gray-500">4-Stroke SOHC</span>
                </div>

                <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Transmission</span>
                  <span className="text-sm font-black text-gray-900 block truncate">{transmissionDisplay}</span>
                  <span className="text-[11px] text-gray-500">Automatic Twist & Go</span>
                </div>

                <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Fuel Capacity</span>
                  <span className="text-sm font-black text-gray-900 block">{fuelDisplay}</span>
                  <span className="text-[11px] text-gray-500">~45–50 km/L</span>
                </div>

                <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Storage</span>
                  <span className="text-sm font-black text-gray-900 block">Underseat Trunk</span>
                  <span className="text-[11px] text-gray-500">Fits 1-2 Helmets</span>
                </div>
              </div>
            </section>

            {/* About This Scooter */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                About the {formattedName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {scooter.description && !scooter.description.includes("FAZZIO") 
                  ? scooter.description 
                  : `The ${formattedName} is engineered for agile maneuverability, effortless handling, and exceptional fuel economy across Bali. Equipped with a smooth automatic CVT transmission, comfortable dual seating, and convenient underseat storage, it delivers an easy and dependable ride whether you are navigating coastal roads in Canggu and Seminyak, touring Ubud's scenic routes, or exploring the beaches of Uluwatu. Thoroughly sanitized, fueled, and safety-inspected prior to handover.`
                }
              </p>
            </section>

          </div>

          {/* Right Column: Host Partner, Inclusions & Requirements */}
          <div className="space-y-6">
            
            {/* Verified Host Partner Card */}
            {vendor && (
              <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80">
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
                  className="group flex items-center justify-between p-3.5 bg-[#F8F9FA] rounded-2xl border border-gray-200 hover:border-black transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white border border-gray-200 shrink-0 flex items-center justify-center font-black text-xs text-black shadow-2xs">
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
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight truncate group-hover:text-black transition-colors">
                          {vendor.name}
                        </h4>
                        <InstagramVerifiedBadge className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                        <span className="truncate max-w-[190px]">{vendor.address || "Bali, Indonesia"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </Link>
              </section>
            )}

            {/* Inclusions & Guarantees */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3.5">
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
            </section>

            {/* Rental Requirements */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/80">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3.5">
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
            </section>

          </div>

        </div>

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
