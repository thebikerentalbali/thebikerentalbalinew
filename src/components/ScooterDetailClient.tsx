"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  X,
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Heart, 
  Share2, 
  Check, 
  MapPin, 
  Bike,
  ShieldCheck,
  Fuel,
  Gauge,
  Cog,
  Package,
  Calendar,
  CheckCircle2,
  FileCheck,
  Truck,
  Wrench,
  Sparkles
} from "lucide-react"
import { fetchScooterDetail, fetchVendorDetail } from "@/lib/api/catalogService"
import { subscribeToPlatformSettings } from "@/utils/pricing"
import TransparentLoader from "@/components/TransparentLoader"

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
        fill="#000000"
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
  const [imageIndex, setImageIndex] = useState<number>(0)
  const [activeSection, setActiveSection] = useState<string>("specs")
  const [otherScooters, setOtherScooters] = useState<any[]>([])
  const [openInclusions, setOpenInclusions] = useState<Record<string, boolean>>({
    helmets: true,
  })

  const toggleInclusion = (id: string) => {
    setOpenInclusions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

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

    let unsubscribe: (() => void) | null = null;
    const scheduleIdle = (cb: () => void) => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(cb, { timeout: 3500 });
      } else {
        setTimeout(cb, 3000);
      }
    };

    scheduleIdle(() => {
      unsubscribe = subscribeToPlatformSettings(async () => {
        if (id) {
          const data = await fetchScooterDetail(id, { forceRefresh: true });
          if (data) {
            if (data.scooter) setScooter(data.scooter);
            if (data.vendor) setVendor(data.vendor);
          }
        }
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id, initialScooter])

  // Fetch other scooters from the same vendor in background
  useEffect(() => {
    const vendorId = vendor?.id || scooter?.vendor_id
    if (vendorId) {
      if (vendor?.scooters && Array.isArray(vendor.scooters)) {
        const otherListings = vendor.scooters.filter((s: any) => String(s.id) !== String(id))
        setOtherScooters(otherListings)
      } else {
        fetchVendorDetail(vendorId).then((vData) => {
          if (vData?.scooters) {
            const otherListings = vData.scooters.filter((s: any) => String(s.id) !== String(id))
            setOtherScooters(otherListings)
          }
        }).catch(() => {})
      }
    }
  }, [vendor?.id, vendor?.scooters, scooter?.vendor_id, id])

  if (loading) {
    return <TransparentLoader />
  }

  if (!scooter) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] text-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-xs">
          <Bike className="w-8 h-8 text-black" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-black text-black tracking-tight uppercase">Scooter Not Found</h2>
        <p className="text-sm text-neutral-600 max-w-sm">The vehicle listing you are looking for is unavailable or has been removed from our fleet.</p>
        <Link href="/" prefetch={true} className="mt-2 px-6 py-3 bg-black text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors active-press uppercase tracking-wider">
          Return to Catalog
        </Link>
      </div>
    )
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

  // Image list for carousel navigation
  const scooterImages = useMemo(() => {
    const list: string[] = []
    if (scooter.image_url) list.push(scooter.image_url)
    if (scooter.img && !list.includes(scooter.img)) list.push(scooter.img)
    if (scooter.image_url_2 && !list.includes(scooter.image_url_2)) list.push(scooter.image_url_2)
    if (scooter.image_url_3 && !list.includes(scooter.image_url_3)) list.push(scooter.image_url_3)
    if (list.length === 0) list.push("/images/scooter.png")
    return list
  }, [scooter])

  const imageSliderRef = useRef<HTMLDivElement>(null)

  const handleImageScroll = () => {
    if (imageSliderRef.current) {
      const scrollLeft = imageSliderRef.current.scrollLeft
      const width = imageSliderRef.current.clientWidth
      if (width > 0) {
        setImageIndex(Math.round(scrollLeft / width))
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-black antialiased w-full max-w-full overflow-x-hidden pt-4 pb-36 sm:py-8">
      
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2 border border-neutral-800 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-white" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. HERO SHOWCASE CARD                                                    */}
        {/* ========================================================================= */}
        <article className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-sm border border-black/5 flex flex-col justify-between transition-all">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2 sm:mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                {formattedName}
              </h1>
              <p className="text-xs font-extrabold text-neutral-400 mt-1 uppercase tracking-wider">
                {brandDisplay}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleShare}
                aria-label="Share this scooter"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-100 rounded-full flex items-center justify-center text-black hover:bg-neutral-200 transition-all active-press cursor-pointer shrink-0"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button 
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                aria-label={isLiked ? `Unsave ${formattedName}` : `Save ${formattedName}`}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-all active-press cursor-pointer shrink-0"
              >
                <Heart className={`w-4 h-4 transition-colors ${isLiked ? "fill-black text-black" : "text-black"}`} aria-hidden="true" />
              </button>
              <button 
                type="button"
                onClick={handleBack} 
                aria-label="Close details"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-100 rounded-full flex items-center justify-center text-black hover:bg-neutral-200 transition-all active-press cursor-pointer shrink-0"
              >
                <X className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Vehicle Rounded Card Display (Never Zoomed & No Arrow Buttons) */}
          <div className="relative w-full h-[230px] sm:h-[290px] bg-gradient-to-b from-[#F8F9FB] to-[#EEF1F5] rounded-[28px] sm:rounded-[36px] border border-gray-200/80 overflow-hidden my-3 sm:my-4 shadow-2xs">
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div 
              ref={imageSliderRef}
              onScroll={handleImageScroll}
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth"
            >
              {scooterImages.map((imgSrc, idx) => (
                <div key={idx} className="relative min-w-full h-full shrink-0 snap-center flex items-center justify-center p-3 sm:p-5">
                  <Image
                    src={imgSrc}
                    alt={`${formattedName} scooter rental Bali ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, 650px"
                    className="object-contain object-center p-2 sm:p-4 drop-shadow-md select-none transition-all duration-300"
                  />
                </div>
              ))}
            </div>

            {/* Minimalist Indicator Dots (only if multiple images) */}
            {scooterImages.length > 1 && (
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 pointer-events-none">
                {scooterImages.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === imageIndex ? "w-4 bg-black shadow-2xs" : "w-1.5 bg-black/20"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Rounded Vendor Card Below Image Display */}
          {vendor && (
            <div className="w-full">
              <Link 
                href={`/vendor/${vendor.id}`} 
                prefetch={true}
                onPointerEnter={() => fetchVendorDetail(vendor.id)}
                onTouchStart={() => fetchVendorDetail(vendor.id)}
                className="group flex items-center justify-between p-3 sm:p-3.5 bg-neutral-50 hover:bg-neutral-100 rounded-2xl sm:rounded-3xl border border-black/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border border-black/10 shrink-0 flex items-center justify-center font-black text-xs text-black">
                    {(vendor.logo || vendor.logo_url) ? (
                      <Image 
                        src={vendor.logo || vendor.logo_url} 
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
                      <span className="font-extrabold text-black text-sm tracking-tight truncate">
                        {vendor.name}
                      </span>
                      <InstagramVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    {vendor.address && (
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-black shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-xs">{vendor.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white border border-black/10 flex items-center justify-center text-black shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
              </Link>
            </div>
          )}

          {/* Section Navigation Tabs (Swipe Left & Right, directly below vendor name) */}
          <div className="w-full pt-3.5 mt-3.5 border-t border-black/5">
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar snap-x -mx-1 px-1">
              {[
                { id: "specs", label: "Specifications" },
                { id: "about", label: "About Scooter" },
                { id: "inclusions", label: "Inclusions" },
                { id: "requirements", label: "Requirements" },
              ].map((tab) => {
                const isActive = activeSection === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSection(tab.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer active-press snap-start ${
                      isActive 
                        ? "bg-black text-white shadow-xs" 
                        : "bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200 border border-black/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

        </article>

        {/* ========================================================================= */}
        {/* 2. VEHICLE SPECIFICATIONS                                                 */}
        {/* ========================================================================= */}
        {activeSection === "specs" && (
          <section className="bg-white rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-xs border border-black/5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-4">
              <Bike className="w-4 h-4 text-black stroke-[2.2]" />
              <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                Vehicle Specifications
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              {/* Engine */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-black stroke-[2.2]" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Engine</span>
                </div>
                <span className="text-sm font-black text-black">{engineDisplay}</span>
              </div>

              {/* Transmission */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Cog className="w-3.5 h-3.5 text-black stroke-[2.2]" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Transmission</span>
                </div>
                <span className="text-sm font-black text-black truncate">{transmissionDisplay}</span>
              </div>

              {/* Fuel Capacity */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Fuel className="w-3.5 h-3.5 text-black stroke-[2.2]" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Fuel Tank</span>
                </div>
                <span className="text-sm font-black text-black">{fuelDisplay}</span>
              </div>

              {/* Storage */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Package className="w-3.5 h-3.5 text-black stroke-[2.2]" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Storage</span>
                </div>
                <span className="text-sm font-black text-black">Underseat Trunk</span>
              </div>

              {/* Year */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-black stroke-[2.2]" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Model Year</span>
                </div>
                <span className="text-sm font-black text-black">{yearDisplay}</span>
              </div>

              {/* Availability */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.2]" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Availability</span>
                </div>
                <span className="text-sm font-black text-black">{availableUnits} Available</span>
              </div>

            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. ABOUT THIS SCOOTER                                                     */}
        {/* ========================================================================= */}
        {activeSection === "about" && (
          <section className="bg-white rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-xs border border-black/5 animate-in fade-in duration-200">
            <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">
              About the {formattedName}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
              {scooter.description && !scooter.description.includes("FAZZIO") 
                ? scooter.description 
                : `The ${formattedName} is engineered for agile maneuverability, effortless handling, and exceptional fuel economy across Bali. Equipped with a smooth automatic CVT transmission, comfortable dual seating, and convenient underseat storage, it delivers an easy and dependable ride whether you are navigating coastal roads in Canggu and Seminyak, touring Ubud's scenic routes, or exploring the beaches of Uluwatu. Thoroughly sanitized, fueled, and safety-inspected prior to handover.`
              }
            </p>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 4. RENTAL INCLUSIONS & GUARANTEE (FAQ / CARD STYLE)                       */}
        {/* ========================================================================= */}
        {activeSection === "inclusions" && (
          <section className="bg-white rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-xs border border-black/5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-black stroke-[2.2]" />
                <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                  Rental Inclusions & Guarantee
                </h2>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 text-black border border-black/10">
                Included
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "helmets",
                  icon: ShieldCheck,
                  title: "2 Helmets & Phone Mount",
                  badge: "Included",
                  summary: "Clean sanitized helmets in your size + secure phone mount",
                  description: "Two sanitized SNI-certified helmets matched to your size and an adjustable handlebar phone mount for navigation across Bali."
                },
                {
                  id: "delivery",
                  icon: Truck,
                  title: "Free Doorstep Delivery & Pickup",
                  badge: "Service Area",
                  summary: "Direct delivery to your hotel, villa, or resort",
                  description: "Direct handover and pickup at your hotel, villa, or accommodation across Canggu, Seminyak, Kuta, Ubud, Sanur, and Uluwatu."
                },
                {
                  id: "assistance",
                  icon: Wrench,
                  title: "24/7 Roadside Assistance",
                  badge: "Islandwide",
                  summary: "On-demand tire repair, battery support, or bike swap",
                  description: "Islandwide rapid mobile mechanic support for puncture repairs, battery jumpstarts, or prompt scooter replacement."
                },
                {
                  id: "pricing",
                  icon: Sparkles,
                  title: "Transparent Pricing & Guaranteed Booking",
                  badge: "Guaranteed",
                  summary: "All-inclusive daily rates with zero hidden charges",
                  description: "Instant digital confirmation, transparent rates with no surprise deposit deductions, and priority customer service."
                }
              ].map((item) => {
                const isOpen = !!openInclusions[item.id]
                const IconComponent = item.icon
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen 
                        ? "bg-neutral-50/90 border-black/20 shadow-xs" 
                        : "bg-neutral-50/50 hover:bg-neutral-50 border-black/5"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleInclusion(item.id)}
                      aria-expanded={isOpen}
                      className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left gap-3 cursor-pointer group select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? "bg-black text-white shadow-xs" : "bg-neutral-200/70 text-black group-hover:bg-black group-hover:text-white"
                        }`}>
                          <IconComponent className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-xs sm:text-sm text-black tracking-tight leading-snug">
                              {item.title}
                            </h3>
                            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-black/10 text-neutral-700 shrink-0">
                              {item.badge}
                            </span>
                          </div>
                          {!isOpen && (
                            <p className="text-[11px] text-neutral-500 font-medium truncate mt-0.5">
                              {item.summary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isOpen ? "bg-black text-white rotate-180" : "bg-white border border-black/10 text-black group-hover:bg-black group-hover:text-white"
                      }`}>
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 sm:px-4.5 sm:pb-4.5 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed border-t border-black/5 animate-in fade-in duration-200">
                        <p>{item.description}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 5. RENTAL REQUIREMENTS                                                    */}
        {/* ========================================================================= */}
        {activeSection === "requirements" && (
          <section className="bg-white rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-xs border border-black/5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="w-4 h-4 text-black stroke-[2.2]" />
              <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                Rental Requirements
              </h2>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border border-black/5">
                <span className="w-5 h-5 rounded-full bg-black text-white font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                <span className="font-bold text-black">Valid Passport or ID Photo</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border border-black/5">
                <span className="w-5 h-5 rounded-full bg-black text-white font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                <span className="font-bold text-black">Driver License or International Permit</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border border-black/5">
                <span className="w-5 h-5 rounded-full bg-black text-white font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                <span className="font-bold text-black">Online Checkout & Free Handover Delivery</span>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 6. ALWAYS DISPLAYED: SAME VENDOR GARAGE (ROUNDED CARD & MINIMAL TITLE)   */}
        {/* ========================================================================= */}
        {vendor && (
          <section className="bg-white rounded-[32px] sm:rounded-[36px] p-5 sm:p-6 shadow-xs border border-black/5">
            
            {/* Minimal Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm sm:text-base font-extrabold text-black tracking-tight truncate">
                {vendor.name} Garage
              </h2>

              {vendor.id && (
                <Link
                  href={`/vendor/${vendor.id}`}
                  prefetch={true}
                  className="bg-neutral-100 hover:bg-black hover:text-white text-black px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active-press shrink-0 flex items-center gap-1 border border-black/5"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Responsive Rounded Scooter Cards */}
            {otherScooters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherScooters.map((item) => {
                  const itemPrice = Number(item.price_daily || item.price || 0)
                  const itemFormattedName = formatTitleCase(item.name)
                  return (
                    <Link
                      key={item.id}
                      href={`/detail/${item.id}`}
                      prefetch={true}
                      className="bg-neutral-50 hover:bg-neutral-100/90 rounded-[24px] p-3 sm:p-3.5 border border-black/5 transition-all flex items-center justify-between gap-3 group active-press"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Image Pod */}
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 bg-white rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-black/5 shadow-2xs">
                          <Image
                            src={item.image_url || item.img || "/images/scooter.png"}
                            alt={itemFormattedName}
                            fill
                            sizes="72px"
                            className="object-contain p-1.5 group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs sm:text-sm text-black truncate group-hover:text-black leading-snug">
                            {itemFormattedName}
                          </h3>
                          <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                            {item.engine || "125 cc"} • {item.transmission || "Automatic"}
                          </p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xs sm:text-sm font-black text-black">
                              Rp {itemPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-medium">/ day</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Arrow / Action */}
                      <div className="w-8 h-8 rounded-full bg-white border border-black/10 flex items-center justify-center text-black shrink-0 group-hover:bg-black group-hover:text-white transition-all shadow-xs">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="bg-neutral-50 rounded-[24px] p-5 text-center border border-black/5">
                <p className="text-xs text-neutral-500 font-medium">
                  Explore the full garage and customer reviews directly on the vendor profile.
                </p>
                {vendor.id && (
                  <Link
                    href={`/vendor/${vendor.id}`}
                    prefetch={true}
                    className="inline-block mt-3 bg-black text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-neutral-800 transition-all active-press"
                  >
                    Visit {vendor.name} Profile
                  </Link>
                )}
              </div>
            )}

          </section>
        )}

        {/* Desktop Book Button */}
        <div className="hidden sm:block pt-2">
          <Link 
            href={`/checkout?scooterId=${scooter.id}`} 
            prefetch={true}
            onClick={() => {
              try {
                sessionStorage.setItem("checkout_prefill", JSON.stringify({ scooter, vendor }))
              } catch (e) {}
            }}
            onPointerDown={() => {
              try {
                sessionStorage.setItem("checkout_prefill", JSON.stringify({ scooter, vendor }))
              } catch (e) {}
            }}
            className="w-full bg-black hover:bg-neutral-800 text-white py-4 px-8 rounded-2xl text-sm font-bold uppercase tracking-wider active-press transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Book This Scooter</span>
            <ChevronRight className="w-4 h-4 text-white stroke-[2.5]" />
          </Link>
        </div>

      </div>

      {/* Floating Sticky Mobile Quick Rent Bar */}
      <nav aria-label="Quick Booking Bar" className="sm:hidden fixed bottom-4 left-4 right-4 mx-auto bg-black text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl z-40 border border-neutral-800">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Daily Rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-white tracking-tight">
              Rp {priceDaily.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">/ day</span>
          </div>
        </div>
        
        <Link 
          href={`/checkout?scooterId=${scooter.id}`} 
          prefetch={true}
          onClick={() => {
            try {
              sessionStorage.setItem("checkout_prefill", JSON.stringify({ scooter, vendor }))
            } catch (e) {}
          }}
          onPointerDown={() => {
            try {
              sessionStorage.setItem("checkout_prefill", JSON.stringify({ scooter, vendor }))
            } catch (e) {}
          }}
          className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-neutral-100 active-press transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Rent Now</span>
          <ChevronRight className="w-3.5 h-3.5 text-black stroke-[2.5]" />
        </Link>
      </nav>

    </div>
  )
}
