"use client"

import { useState, useEffect } from "react"
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
  Sparkles,
  Zap,
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
      <div className="min-h-screen bg-[#F0F2F5] text-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Scooter not found</h2>
        <p className="text-sm text-gray-500">The requested vehicle listing is unavailable or has been removed.</p>
        <Link href="/" prefetch={true} className="px-6 py-3 bg-black text-white rounded-full text-sm font-bold hover:bg-neutral-800 transition-colors active-press">
          Return to Catalog
        </Link>
      </div>
    )
  }

  if (!scooter) {
    return null
  }

  const priceDaily = Number(scooter.price_daily || scooter.price || 0)

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-foreground antialiased w-full max-w-full overflow-x-hidden py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 md:pb-12">
        
        {/* Navigation Bar Header */}
        <header className="flex justify-between items-center py-3 mb-4 sm:mb-6 relative z-10">
          <button 
            type="button"
            onClick={handleBack} 
            aria-label="Go Back"
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-black shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active-press cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          
          <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight absolute left-1/2 -translate-x-1/2">
            Scooter Details
          </h1>

          <button 
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            aria-label={isLiked ? `Unsave ${scooter.name}` : `Save ${scooter.name}`}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active-press cursor-pointer shrink-0"
          >
            <Heart className={`w-5 h-5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} aria-hidden="true" />
          </button>
        </header>

        {/* Responsive Content Grid */}
        <main className="flex flex-col md:grid md:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.15fr_1fr] gap-6 md:gap-8 lg:gap-10 w-full max-w-full">
          
          {/* Left Column: Vehicle Visual Showcase Stage */}
          <div className="flex flex-col w-full max-w-full space-y-4">
            
            {/* Primary Vehicle Stage Card (Crisp White Rounded Card) */}
            <article className="relative w-full h-[320px] sm:h-[380px] md:h-[450px] flex items-center justify-center bg-white rounded-[32px] shadow-sm p-6 sm:p-8 overflow-hidden border border-gray-100">
              {/* Year & Status Badge */}
              <div className="absolute top-5 left-5 sm:top-6 sm:left-6 flex items-center gap-2 z-10">
                <span className="bg-black text-white text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full shadow-xs">
                  {scooter.year || "2025"}
                </span>
                <span className="bg-neutral-100 text-gray-800 border border-neutral-200/80 text-xs font-bold px-3 py-1.5 rounded-full hidden sm:inline-block">
                  {scooter.engine || "125 cc"}
                </span>
              </div>

              {/* Free Cancellation Badge */}
              <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-10">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Free 24h Cancellation
                </span>
              </div>

              {/* Main High-Res Image */}
              <Image
                src={scooter.image_url || "/images/scooter.png"}
                alt={scooter.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 550px"
                className="object-contain p-6 sm:p-8 drop-shadow-lg transition-transform duration-500 hover:scale-105"
              />
            </article>
            
            {/* Desktop Thumbnails */}
            <div className="hidden md:flex items-center gap-3 px-1">
              <div className="relative w-20 h-20 rounded-2xl bg-white border-2 border-black flex items-center justify-center p-2 shadow-xs cursor-pointer overflow-hidden">
                <Image src={scooter.image_url || "/images/scooter.png"} alt={`${scooter.name} angle 1`} fill sizes="80px" className="object-contain p-1" loading="lazy" />
              </div>
              <div className="relative w-20 h-20 rounded-2xl bg-white border border-gray-200 flex items-center justify-center p-2 shadow-xs opacity-60 hover:opacity-100 hover:border-black transition-all cursor-pointer overflow-hidden">
                <Image src={scooter.image_url || "/images/scooter.png"} alt={`${scooter.name} angle 2`} fill sizes="80px" className="object-contain p-1" loading="lazy" />
              </div>
            </div>

            {/* Quick Summary Strip (Desktop White Card) */}
            <div className="hidden md:flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-black">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Vehicle</span>
                <span className="text-base font-extrabold text-gray-900">{scooter.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Availability</span>
                <span className="text-xs font-extrabold text-gray-900 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full inline-block mt-0.5">
                  {scooter.available_units || 1} Units Ready
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Information Cards Stream */}
          <div className="space-y-4 flex flex-col justify-start w-full max-w-full">
          
            {/* 1. Vendor Profile Card (Clean White Rounded Card) */}
            {vendor && (
              <Link 
                href={`/vendor/${vendor.id}`} 
                prefetch={true}
                className="block bg-white text-black rounded-[28px] p-5 shadow-sm border border-gray-100 transition-all hover:border-gray-300 hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 shadow-xs">
                      <Image 
                        src={vendor.logo || vendor.image_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"} 
                        alt={vendor.name || "Vendor"} 
                        fill
                        sizes="56px"
                        className="object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-gray-900 text-[15px] sm:text-base leading-snug truncate">{vendor.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <div className="flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded-full shrink-0">
                          <Star className="w-3 h-3 fill-white text-white" aria-hidden="true" />
                          <span className="font-bold text-[11px]">{vendor.rating ? Number(vendor.rating).toFixed(1) : "5.0"}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 truncate max-w-[140px] sm:max-w-[200px] font-medium">
                          {vendor.address || "Bali, Indonesia"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-black shrink-0">
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            )}

            {/* 2. Main Scooter Details & Operating Hours Card */}
            <div className="bg-white text-black rounded-[28px] p-5 sm:p-6 shadow-sm border border-gray-100 space-y-5">
              
              {/* Operating Hours Card */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-200/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-black" aria-hidden="true" />
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Operating Hours
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-black px-2.5 py-0.5 rounded-full shadow-xs">
                    Open Daily
                  </span>
                </div>
                <div>
                  <p className="font-extrabold text-lg sm:text-xl text-black tracking-tight">
                    {vendor?.opening_hours || "08:00 AM – 23:00 PM"}
                  </p>
                </div>
              </div>

              {/* Description Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">Description</h3>
                  <span className="text-xs font-bold text-black bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                    {scooter.available_units || 1} Units Available
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The {scooter.name} delivers a smooth and effortless ride with exceptional comfort, fuel efficiency, and reliability. Perfectly suited for navigating the vibrant streets and scenic routes of Bali, this scooter offers an exceptional riding experience with modern features and elegant design.
                </p>
              </div>

              {/* Specifications Matrix */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Specifications</h4>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="bg-[#F8F9FA] rounded-xl p-3 border border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">Engine</span>
                    <span className="text-sm font-bold text-black">{scooter.engine || "125 cc"}</span>
                  </div>
                  <div className="bg-[#F8F9FA] rounded-xl p-3 border border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">Year</span>
                    <span className="text-sm font-bold text-black">{scooter.year || "2025"}</span>
                  </div>
                  <div className="bg-[#F8F9FA] rounded-xl p-3 border border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">Fuel Capacity</span>
                    <span className="text-sm font-bold text-black">{scooter.fuel_capacity || "5.1 L"}</span>
                  </div>
                  <div className="bg-[#F8F9FA] rounded-xl p-3 border border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">Transmission</span>
                    <span className="text-sm font-bold text-black">{scooter.transmission || "Automatic"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Delivery & Pickup Coverage Card */}
            <div className="bg-white text-black rounded-[28px] p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-sm text-black uppercase tracking-wider">Delivery & Pickup</h3>
                  <span className="text-xs text-gray-500">Service coverage across Bali</span>
                </div>
                <span className="text-[11px] font-bold text-black bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  Direct Delivery
                </span>
              </div>

              {/* Service Area Highlight */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200/80">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Primary Coverage Zone
                </span>
                <p className="text-xs font-bold text-black leading-relaxed">
                  {vendor?.delivery_area || getDeliveryArea(vendor?.address)}
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500">
                  <span>Dispatch Location</span>
                  <span className="font-semibold text-black truncate max-w-[180px]">{vendor?.address || "Bali, Indonesia"}</span>
                </div>
              </div>

              {/* Delivery Features */}
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" aria-hidden="true" />
                  <p><strong className="text-black">Hotel / Villa Delivery:</strong> Handed over directly to your accommodation address.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" aria-hidden="true" />
                  <p><strong className="text-black">Direct Garage Pickup:</strong> Free collection and handover at vendor shop.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 mt-0.5" aria-hidden="true" />
                  <p><strong className="text-black">Flexible Handover:</strong> Timely dispatch coordinated via WhatsApp.</p>
                </div>
              </div>
            </div>

            {/* 4. Rental Requirements & Included Inclusions Card */}
            <div className="bg-white text-black rounded-[28px] p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-sm text-black uppercase tracking-wider">Rental Requirements</h3>
                  <span className="text-xs text-gray-500">Documentation & inclusions</span>
                </div>
                <span className="text-[11px] font-bold text-black bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  Policy
                </span>
              </div>

              {/* Required Documents */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200/80 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Required Documents</span>
                <div className="space-y-1.5 text-xs text-black font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black">•</span>
                    <span>Valid Passport or National ID Copy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black">•</span>
                    <span>International or National Driving License</span>
                  </div>
                </div>
              </div>

              {/* Included Free */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Included With Every Rental</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F8F9FA] border border-gray-200/80 p-2.5 rounded-xl font-semibold text-black flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-black shrink-0" aria-hidden="true" />
                    <span>2 Sanitized Helmets</span>
                  </div>
                  <div className="bg-[#F8F9FA] border border-gray-200/80 p-2.5 rounded-xl font-semibold text-black flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-black shrink-0" aria-hidden="true" />
                    <span>Phone Mount Holder</span>
                  </div>
                  <div className="bg-[#F8F9FA] border border-gray-200/80 p-2.5 rounded-xl font-semibold text-black flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-black shrink-0" aria-hidden="true" />
                    <span>Free 24h Cancellation</span>
                  </div>
                  <div className="bg-[#F8F9FA] border border-gray-200/80 p-2.5 rounded-xl font-semibold text-black flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-black shrink-0" aria-hidden="true" />
                    <span>24/7 Road Support</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Sticky Price & Booking Card */}
            <div className="hidden md:flex items-center justify-between bg-white text-black rounded-[28px] p-6 shadow-sm border border-gray-100 mt-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rental Price</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-gray-900 tracking-tight">Rp {priceDaily.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 font-semibold">Daily</span>
                </div>
              </div>
              <Link 
                href={`/checkout?scooterId=${scooter.id}`} 
                prefetch={true}
                className="bg-black text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-sm hover:bg-neutral-800 active-press transition-all cursor-pointer"
              >
                Book Rent
              </Link>
            </div>

          </div>

        </main>
      </div>
      
      {/* Mobile Floating Sticky Footer Bar */}
      <nav aria-label="Quick Booking Bar" className="md:hidden fixed bottom-5 left-4 right-4 mx-auto bg-black text-white rounded-full px-5 py-3 flex items-center justify-between shadow-2xl z-40 border border-gray-800">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Daily Rate</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-white tracking-tight">Rp {priceDaily.toLocaleString()}</span>
            <span className="text-[11px] text-gray-400 font-medium">Daily</span>
          </div>
        </div>
        
        <Link 
          href={`/checkout?scooterId=${scooter.id}`} 
          prefetch={true}
          className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold shadow-xs hover:bg-neutral-100 active-press transition-all"
        >
          Book Rent
        </Link>
      </nav>

    </div>
  )
}
