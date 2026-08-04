"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  Clock,
  MapPin,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  Sparkles,
  Calendar,
  Fuel,
  Settings,
  FileText,
  AlertCircle,
  ChevronRight,
  BadgeCheck,
  Check,
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
  const [copied, setCopied] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"daily" | "weekly" | "monthly">("daily")

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
      const shareData = {
        title: `${scooter?.name || "Scooter"} Rental in Bali`,
        text: `Rent ${scooter?.name} in Bali with free cancellation and delivery.`,
        url: window.location.href,
      }
      if (navigator.share) {
        try {
          await navigator.share(shareData)
        } catch {
          // Fallback to clipboard
        }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Ignore
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
    if (!address) return "Ubud & Greater Bali Area"
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
    return `${address} and surrounding 10km radius`
  }

  if (!scooter && !loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] text-gray-900 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Scooter not found</h2>
        <p className="text-sm text-gray-600">The requested vehicle listing is unavailable or has been removed.</p>
        <Link href="/" prefetch={true} className="px-6 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors active-press">
          Return to Catalog
        </Link>
      </div>
    )
  }

  if (!scooter) {
    return null
  }

  const priceDaily = Number(scooter.price_daily || scooter.price || 0)
  const priceWeekly = Number(scooter.price_weekly || Math.round(priceDaily * 6.3))
  const priceMonthly = Number(scooter.price_monthly || Math.round(priceDaily * 22))

  const activePrice =
    selectedPlan === "monthly"
      ? priceMonthly
      : selectedPlan === "weekly"
      ? priceWeekly
      : priceDaily

  const planUnit =
    selectedPlan === "monthly" ? "Month" : selectedPlan === "weekly" ? "Week" : "Day"

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-900 antialiased w-full max-w-full overflow-x-hidden py-3 sm:py-5 md:py-8">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 md:pb-16">
        
        {/* Top Header & Breadcrumb Bar */}
        <header className="flex flex-col gap-3 py-2 mb-4 relative z-10">
          <div className="flex items-center justify-between">
            <button 
              type="button"
              onClick={handleBack} 
              aria-label="Go Back"
              className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full flex items-center justify-center text-gray-800 shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active-press cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Breadcrumbs for Tablet/Desktop */}
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <Link href="/" className="hover:text-black transition-colors">Bali Scooter Rental</Link>
              <span>/</span>
              <span className="text-gray-900 font-semibold truncate max-w-[200px]">{scooter.name}</span>
            </nav>

            {/* Top Action Buttons (Share & Wishlist) */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleShare}
                aria-label="Share this scooter"
                className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full flex items-center justify-center text-gray-700 shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active-press cursor-pointer shrink-0 relative"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                {copied && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>

              <button 
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                aria-label={isLiked ? `Unsave ${scooter.name}` : `Save ${scooter.name}`}
                className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active-press cursor-pointer shrink-0"
              >
                <Heart className={`w-4 h-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Activity Main Title & Trust Indicators (GetYourGuide Signature Header) */}
          <div className="mt-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-neutral-100 text-gray-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-gray-200/60">
                Scooter Rental • Bali
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-emerald-600" /> Instant Confirmation
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              Bali: {scooter.name} ({scooter.engine || "125cc"}) Rental with Delivery & Helmets
            </h1>

            {/* Provider & Rating Strip */}
            <div className="flex items-center gap-3 sm:gap-4 mt-2.5 text-xs sm:text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200/70 shadow-xs">
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="font-bold text-gray-900">
                  {vendor?.rating ? Number(vendor.rating).toFixed(1) : "4.9"}
                </span>
                <span className="text-gray-400 font-medium">(128 reviews)</span>
              </div>

              {vendor && (
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Activity provider:</span>
                  <Link 
                    href={`/vendor/${vendor.id}`} 
                    prefetch={true}
                    className="font-bold text-gray-900 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{vendor.name}</span>
                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate max-w-[200px]">{vendor?.address || "Bali, Indonesia"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Responsive Content Grid: Left Column (Experience Details) + Right Column (Sticky Booking Widget) */}
        <main className="flex flex-col lg:grid lg:grid-cols-[1.55fr_1fr] gap-6 md:gap-8 w-full max-w-full items-start">
          
          {/* =========================================================================
              LEFT COLUMN: Experience Media Gallery & Comprehensive Details
              ========================================================================= */}
          <div className="flex flex-col w-full space-y-6">
            
            {/* 1. Hero Image Showcase Stage (GetYourGuide Gallery Card) */}
            <article className="relative w-full h-[300px] sm:h-[380px] md:h-[430px] flex items-center justify-center bg-white rounded-3xl shadow-sm p-6 sm:p-8 overflow-hidden border border-gray-100">
              {/* Badges on Gallery */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-2 z-10">
                <span className="bg-black text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-xs">
                  {scooter.year || "2025"} Model
                </span>
                <span className="bg-white/95 backdrop-blur-sm text-gray-800 border border-gray-200/80 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
                  {scooter.engine || "125 cc"} Automatic
                </span>
              </div>

              {/* Main High-Res Image */}
              <Image
                src={scooter.image_url || "/images/scooter.png"}
                alt={scooter.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 650px"
                className="object-contain p-6 sm:p-8 drop-shadow-md transition-transform duration-500 hover:scale-105"
              />
            </article>

            {/* 2. Key Activity Highlights ("About this rental" - GetYourGuide Iconic Section) */}
            <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">About this rental</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Free cancellation</h3>
                    <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">Cancel up to 24 hours in advance for a full refund</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Reserve now & pay later</h3>
                    <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">Keep your travel plans flexible — book your spot with zero upfront deposit</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Flexible duration</h3>
                    <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">Rent from 1 day up to 1 month with instant WhatsApp extension</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">2 Helmets & Rain Gear Included</h3>
                    <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">Clean, sanitized SNI-certified helmets with phone mount holder</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Experience Description ("Full description") */}
            <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Full description</h2>
              <div className="space-y-3 text-sm text-gray-700 leading-relaxed font-normal">
                <p>
                  Experience the ultimate freedom of exploring Bali on a stylish, well-maintained <strong>{scooter.name}</strong>. Designed for smooth handling, effortless overtaking, and optimal fuel economy, this modern automatic scooter is the top choice for navigating Bali&apos;s tropical avenues, beachside roads, and scenic mountain loops.
                </p>
                <p>
                  Whether you are cruising to the beaches of Uluwatu, exploring the lush rice terraces of Ubud, or commuting around Canggu and Seminyak, the {scooter.name} guarantees a comfortable and stress-free ride with responsive braking and plenty of under-seat storage for your day pack.
                </p>
              </div>

              {/* Vehicle Specs Grid */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vehicle Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      <Settings className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Engine</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{scooter.engine || "125 cc"}</span>
                  </div>

                  <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Year</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{scooter.year || "2025"}</span>
                  </div>

                  <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      <Fuel className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Tank</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{scooter.fuel_capacity || "5.1 Liters"}</span>
                  </div>

                  <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Transmission</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{scooter.transmission || "Automatic"}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Inclusions & Exclusions (GetYourGuide Signature Checklist) */}
            <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Includes</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-gray-800">2 Sanitized SNI-certified helmets</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Secure smartphone mount for GPS navigation</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Free delivery & pickup within 5km radius</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-gray-800">24/7 English-speaking road assistance</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Third-party liability scooter insurance</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-gray-800">Island-wide Bali riding permit</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Not included</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>Petrol / Fuel (please return with the same level as received)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>Delivery beyond 5km (IDR 10,000/km applied at checkout)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Important Information & Requirements */}
            <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Important information</h2>
              
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    What to bring:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm text-gray-600">
                    <li>Valid Passport or National ID Copy</li>
                    <li>International Driving Permit (IDP) or National Motorcycle License</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    Know before you go:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm text-gray-600">
                    <li>Minimum driver age is 18 years old.</li>
                    <li>Helmets are mandatory by law for both the driver and passenger in Bali.</li>
                    <li>The scooter is delivered with a full or partial tank of petrol and must be returned at the same level.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. Activity Provider Information */}
            {vendor && (
              <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Activity Provider</h2>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Verified Partner
                  </span>
                </div>

                <Link 
                  href={`/vendor/${vendor.id}`} 
                  prefetch={true}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA] border border-gray-100 hover:border-gray-200 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white shrink-0 border border-gray-200 shadow-xs">
                      <Image 
                        src={vendor.logo || vendor.image_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"} 
                        alt={vendor.name || "Vendor"} 
                        fill
                        sizes="48px"
                        className="object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm group-hover:text-black transition-colors truncate">
                        {vendor.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span className="font-semibold text-gray-900 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {vendor.rating ? Number(vendor.rating).toFixed(1) : "5.0"}
                        </span>
                        <span>•</span>
                        <span className="truncate">{vendor.address || "Bali, Indonesia"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-gray-900 group-hover:translate-x-0.5 transition-transform shrink-0">
                    <span className="hidden sm:inline">View Profile</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>Operating hours: <strong>{vendor?.opening_hours || "08:00 AM – 23:00 PM"}</strong></span>
                  <span>Free delivery: <strong>Within 5km</strong></span>
                </div>
              </section>
            )}

            {/* 7. Customer Reviews Section */}
            <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Customer Reviews</h2>
                <div className="flex items-center gap-1 bg-neutral-100 px-3 py-1 rounded-full text-xs font-bold text-gray-900">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0 (128 verified bookings)</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">Liam K.</span>
                      <span className="text-gray-400">• Australia</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                    &ldquo;The {scooter.name} was delivered right on time to our villa in Canggu. Immaculate condition, brand new helmets, and super responsive WhatsApp communication. 10/10 service!&rdquo;
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">Elena M.</span>
                      <span className="text-gray-400">• Germany</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                    &ldquo;Best bike rental experience in Bali. No deposit hassle, easy handover, and the phone mount was a lifesaver for navigating Ubud. Highly recommend!&rdquo;
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: Desktop Sticky Booking Card (GetYourGuide Signature Widget)
              ========================================================================= */}
          <aside className="w-full lg:sticky lg:top-8 flex flex-col space-y-4">
            
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col space-y-5">
              {/* Header Price */}
              <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Price From</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                      Rp {activePrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">/{planUnit}</span>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200/60">
                  Best Price
                </span>
              </div>

              {/* Plan Duration Selector Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Rental Duration</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("daily")}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      selectedPlan === "daily"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200/80"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("weekly")}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      selectedPlan === "weekly"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200/80"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("monthly")}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      selectedPlan === "monthly"
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200/80"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Benefits checklist */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free hotel delivery within 5km</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2 Clean Helmets & Phone Mount included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant confirmation via WhatsApp</span>
                </div>
              </div>

              {/* Primary Call to Action Button */}
              <Link
                href={`/checkout?scooterId=${scooter.id}`}
                prefetch={true}
                className="w-full h-14 bg-black text-white rounded-2xl text-[16px] font-bold shadow-md hover:bg-neutral-800 active-press transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Now</span>
                <ChevronRight className="w-5 h-5" />
              </Link>

              <p className="text-[11px] text-gray-400 text-center font-medium">
                ⚡ Reserve in 60 seconds • Pay upon delivery
              </p>
            </div>

            {/* Provider Quick Contact Badge */}
            {vendor && (
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-gray-700" />
                  <span>Need assistance with this vehicle?</span>
                </div>
                <Link
                  href={`/vendor/${vendor.id}`}
                  className="font-bold text-gray-900 hover:underline"
                >
                  Contact Host
                </Link>
              </div>
            )}

          </aside>

        </main>
      </div>
      
      {/* Mobile Floating Sticky Footer Bar (GetYourGuide Mobile UX) */}
      <nav 
        aria-label="Quick Booking Bar" 
        className="lg:hidden fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-xl border-t border-gray-200/80 px-5 py-3.5 pb-6 sm:pb-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-40"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">
              Rp {priceDaily.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-medium">/day</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Free cancellation</span>
        </div>
        
        <Link 
          href={`/checkout?scooterId=${scooter.id}`} 
          prefetch={true}
          className="bg-black text-white px-7 py-3 rounded-2xl text-sm font-bold shadow-md hover:bg-neutral-800 active-press transition-all flex items-center gap-1.5"
        >
          <span>Book Now</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </nav>

    </div>
  )
}
