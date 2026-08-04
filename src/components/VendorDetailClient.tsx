"use client"

import { useState, useEffect } from "react"
import { 
  ChevronLeft, 
  MapPin, 
  Star, 
  Share, 
  X, 
  BadgeCheck, 
  MessageCircle, 
  Check, 
  ExternalLink,
  Bike,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { fetchVendorDetail } from "@/lib/api/catalogService"
import { clientCache } from "@/lib/cache/clientCache"
import { subscribeToPlatformSettings } from "@/utils/pricing"

interface VendorDetailClientProps {
  id: string
  initialVendor: any
  initialScooters: any[]
  initialReviews: any[]
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

export default function VendorDetailClient({
  id,
  initialVendor,
  initialScooters = [],
  initialReviews = [],
}: VendorDetailClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [vendor, setVendor] = useState<any>(initialVendor)
  const [scooters, setScooters] = useState<any[]>(initialScooters)
  const [reviews, setReviews] = useState<any[]>(initialReviews)
  const [loading, setLoading] = useState<boolean>(!initialVendor)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false)
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string>("All")
  const [copiedLink, setCopiedLink] = useState(false)

  const handleSubmitReview = async () => {
    if (!newReview.name || !newReview.comment) {
      alert("Please enter your name and review.")
      return
    }
    setIsSubmittingReview(true)
    const { error, data } = await supabase.from("reviews").insert({
      vendor_id: id,
      user_name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment
    }).select().single()
    setIsSubmittingReview(false)
    if (!error && data) {
      setReviews([data, ...reviews])
      clientCache.invalidate(`vendor_${id}`)
      setIsWriteReviewModalOpen(false)
      setNewReview({ name: "", rating: 5, comment: "" })
    } else {
      alert("Failed to submit review. Please try again.")
    }
  }

  useEffect(() => {
    if (!initialVendor && id) {
      async function loadData() {
        try {
          const data = await fetchVendorDetail(id)
          if (data?.vendor) {
            setVendor(data.vendor)
            setScooters(data.scooters || [])
            setReviews(data.reviews || [])
          }
        } catch (err) {
          console.error("Failed to load vendor details:", err)
        } finally {
          setLoading(false)
        }
      }
      loadData()
    }

    const unsubscribe = subscribeToPlatformSettings(async () => {
      if (id) {
        const data = await fetchVendorDetail(id, { forceRefresh: true })
        if (data?.vendor) {
          setVendor(data.vendor)
          setScooters(data.scooters || [])
          setReviews(data.reviews || [])
        }
      }
    })

    return () => unsubscribe()
  }, [id, initialVendor])

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("fromMap") === "true") {
        router.push("/?showMap=true")
      } else if (window.history.length <= 2) {
        router.push("/")
      } else {
        router.back()
      }
    }
  }

  const handleShare = () => {
    const vendorSlug = vendor?.name ? vendor.name.toLowerCase().replace(/[^a-z0-9]+/g, "") : "vendor"
    const url = `${window.location.origin}/${vendorSlug}`
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: vendor.name, url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const getWhatsAppUrl = () => {
    const phone = vendor?.phone?.replace(/[^0-9]/g, "") || "6281234567890"
    const cleanPhone = phone.startsWith("0") ? "62" + phone.substring(1) : phone
    const message = encodeURIComponent(`Hi ${vendor?.name || "there"}, I found your scooter rental on The Bike Rental Bali and would like to inquire about bike availability.`)
    return `https://wa.me/${cleanPhone}?text=${message}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Vendor Not Found</h1>
        <p className="text-gray-500 mb-4">The requested rental provider is unavailable.</p>
        <Link href="/" prefetch={true} className="bg-black text-white px-6 py-2 rounded-full font-bold">
          Go Back Home
        </Link>
      </div>
    )
  }

  const availableBrands = ["All", ...Array.from(new Set(scooters.map((s) => s.brand).filter(Boolean)))]
  const filteredScooters = selectedBrand === "All" 
    ? scooters 
    : scooters.filter((s) => s.brand === selectedBrand)

  const totalFleetCount = scooters.reduce((sum, s) => sum + (s.total_units || 1), 0)
  const totalAvailableCount = scooters.reduce((sum, s) => sum + (s.available_units || 1), 0)

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black antialiased w-full max-w-full overflow-x-hidden pb-16">
      
      {/* ======================================================== */}
      {/* TOP HEADER & BREADCRUMB NAVIGATION                      */}
      {/* ======================================================== */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack} 
              aria-label="Go Back"
              className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-black border border-gray-200/80 shadow-xs hover:bg-neutral-100 transition-all active-press cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-400">Garages</span>
              <span>/</span>
              <span className="text-gray-900 font-bold truncate max-w-[200px]">{vendor.name}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              aria-label="Share Vendor Profile"
              className="bg-white border border-gray-200/80 text-black hover:bg-neutral-100 px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 shadow-xs transition-all active-press cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-black" /> : <Share className="w-4 h-4 text-black" />}
              <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Share Profile"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN RESPONSIVE CONTAINER                                */}
      {/* ======================================================== */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. STOREFRONT HERO BANNER & HOST DETAILS                                  */}
        {/* ========================================================================= */}
        <section aria-labelledby="vendor-title-heading" className="bg-white rounded-[32px] p-6 sm:p-8 md:p-10 shadow-xs border border-gray-200/80 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Host Identity & Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              
              {/* Host Avatar / Logo */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-neutral-100 flex items-center justify-center font-black text-2xl text-black shrink-0">
                {vendor.logo || vendor.image_url ? (
                  <Image 
                    src={vendor.logo || vendor.image_url} 
                    alt={vendor.name} 
                    fill 
                    sizes="(max-width: 640px) 80px, 96px" 
                    className="object-cover" 
                  />
                ) : (
                  <span>{vendor.name?.slice(0, 2).toUpperCase() || "VN"}</span>
                )}
              </div>

              {/* Title & Location */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 id="vendor-title-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {vendor.name}
                  </h1>
                  <span className="bg-black text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                    <BadgeCheck className="w-3.5 h-3.5 text-white" />
                    <span>Verified Partner</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  <MapPin className="w-4 h-4 text-black shrink-0" />
                  <span className="leading-snug">{vendor.address || "Bali, Indonesia"}</span>
                </div>
              </div>

            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              <a 
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black hover:bg-neutral-800 text-white font-extrabold px-6 py-3.5 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active-press"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={
                  vendor.lat && vendor.lng && Number(vendor.lat) !== 0
                    ? `https://www.google.com/maps/search/?api=1&query=${Number(vendor.lat)},${Number(vendor.lng)}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.name + " " + (vendor.address || "Bali Indonesia"))}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-neutral-100 border border-gray-200/90 text-black font-extrabold px-5 py-3.5 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all active-press"
              >
                <MapPin className="w-4 h-4 text-black" />
                <span>Directions</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-6 mt-6 sm:mt-8">
            
            {/* Rating */}
            <div 
              onClick={() => setIsReviewModalOpen(true)}
              className="text-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-black text-black" />
                <span className="font-black text-xl sm:text-2xl text-gray-900">
                  {vendor.rating ? Number(vendor.rating).toFixed(1) : "5.0"}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 block">
                {reviews.length}+ Reviews
              </span>
            </div>

            {/* Total Fleet */}
            <div className="text-center border-x border-gray-100">
              <span className="font-black text-xl sm:text-2xl text-gray-900">
                {totalFleetCount}
              </span>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 block">
                Bikes in Fleet
              </span>
            </div>

            {/* Available Ready */}
            <div className="text-center">
              <span className="font-black text-xl sm:text-2xl text-gray-900">
                {totalAvailableCount}
              </span>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 block">
                Ready to Ride
              </span>
            </div>

          </div>

        </section>


        {/* ========================================================================= */}
        {/* 2. UPLOADED SCOOTER PHOTO SHOWCASE / FLEET GALLERY                        */}
        {/* ========================================================================= */}
        {scooters.length > 0 && (
          <section aria-labelledby="fleet-gallery-heading" className="bg-white rounded-[32px] p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">
                  Garage Visual Showcase
                </span>
                <h2 id="fleet-gallery-heading" className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Uploaded Fleet Vehicles ({scooters.length})
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-[#F8F9FA] border border-gray-200 px-3 py-1 rounded-full">
                Real Photos
              </span>
            </div>

            {/* Horizontal Scrollable Gallery Strip */}
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <div className="flex overflow-x-auto gap-4 pb-2 pt-1 snap-x hide-scrollbar">
              {scooters.map((scooter) => {
                const formattedBikeName = formatTitleCase(scooter.name)
                return (
                  <Link
                    key={scooter.id}
                    href={`/detail/${scooter.id}`}
                    prefetch={true}
                    className="snap-start shrink-0 w-[240px] sm:w-[280px] bg-[#F8F9FA] rounded-[24px] p-3.5 border border-gray-200/80 hover:border-black transition-all group active-press flex flex-col justify-between"
                  >
                    {/* Visual Photo Box */}
                    <div className="relative w-full h-40 sm:h-44 rounded-2xl bg-white flex items-center justify-center p-3 mb-3 overflow-hidden border border-gray-100 shadow-2xs">
                      {/* Brand Tag */}
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-extrabold tracking-wider uppercase text-gray-600 bg-neutral-100 px-2 py-0.5 rounded-full z-10">
                        {scooter.brand || "Scooter"}
                      </span>

                      {/* Black & White Available Badge */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded-full shadow-2xs z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider">
                          {scooter.available_units || 1} AVAILABLE
                        </span>
                      </div>

                      {/* Scooter Photo */}
                      <Image 
                        src={scooter.image_url || "/images/scooter.png"} 
                        alt={`${formattedBikeName} rental`} 
                        fill
                        sizes="(max-width: 640px) 240px, 280px"
                        className="object-contain p-2 drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Scooter Name & Specs */}
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm truncate group-hover:text-black">
                        {formattedBikeName}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {scooter.year || "2025"} • {scooter.engine || "125 cc"} • {scooter.transmission || "Automatic"}
                      </p>
                    </div>

                    {/* Price & Book Row */}
                    <div className="pt-2.5 border-t border-gray-200/70 flex items-center justify-between mt-2.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-gray-900">
                          Rp {scooter.price_daily?.toLocaleString("id-ID") || scooter.price_daily}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">/ day</span>
                      </div>
                      <span className="text-[11px] font-extrabold bg-black text-white px-3 py-1 rounded-full group-hover:bg-neutral-800 transition-colors shadow-2xs">
                        View
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>

          </section>
        )}


        {/* ========================================================================= */}
        {/* 3. AVAILABLE SCOOTERS LISTINGS GRID & BRAND FILTER                        */}
        {/* ========================================================================= */}
        <section aria-labelledby="catalog-heading" className="space-y-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">
                Garage Fleet Selection
              </span>
              <h2 id="catalog-heading" className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Available Scooter Listings
              </h2>
            </div>

            {/* Brand Filter Tabs */}
            {availableBrands.length > 1 && (
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-gray-200 shadow-2xs overflow-x-auto max-w-full">
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedBrand === brand
                        ? "bg-black text-white shadow-xs"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredScooters.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-gray-200/80">
              <Bike className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium text-sm">No scooters found for this filter.</p>
              <button 
                onClick={() => setSelectedBrand("All")}
                className="mt-4 text-xs font-bold bg-black text-white px-5 py-2.5 rounded-full hover:bg-neutral-800"
              >
                Show All Scooters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredScooters.map((scooter) => {
                const formattedBikeName = formatTitleCase(scooter.name)
                return (
                  <Link 
                    key={scooter.id} 
                    href={`/detail/${scooter.id}`}
                    prefetch={true}
                    className="bg-white rounded-[32px] p-5 border border-gray-200/80 shadow-xs hover:shadow-md active-press transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Image Backdrop Box */}
                      <div className="relative w-full h-48 sm:h-52 bg-[#F8F9FA] rounded-2xl flex items-center justify-center p-3 mb-4 overflow-hidden border border-gray-100">
                        {/* Brand Tag */}
                        <span className="absolute top-3 left-3 text-[10px] font-extrabold tracking-wider uppercase text-gray-600 bg-white border border-gray-200/80 px-2.5 py-0.5 rounded-full z-10">
                          {scooter.brand || "Scooter"}
                        </span>
                        
                        {/* Black and White Available Label */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black text-white px-2.5 py-1 rounded-full shadow-xs z-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider">
                            {scooter.available_units || 1} AVAILABLE
                          </span>
                        </div>

                        {/* Uploaded Scooter Image */}
                        <Image 
                          src={scooter.image_url || "/images/scooter.png"} 
                          alt={`${formattedBikeName} rental`} 
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-3 drop-shadow-md group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>

                      {/* Title & Specs */}
                      <h3 className="font-extrabold text-gray-900 text-base sm:text-lg mb-1 group-hover:text-black transition-colors truncate">
                        {formattedBikeName}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {scooter.year || "2025"} • {scooter.engine || "125 cc"} • {scooter.transmission || "Automatic CVT"}
                      </p>
                    </div>

                    {/* Price & CTA */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-gray-900 leading-none">
                          Rp {scooter.price_daily?.toLocaleString("id-ID") || scooter.price_daily}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold">/ day</span>
                      </div>
                      <span className="text-xs font-extrabold bg-black text-white px-5 py-2.5 rounded-full group-hover:bg-neutral-800 transition-colors shadow-2xs">
                        Book Now
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

        </section>


        {/* ========================================================================= */}
        {/* 4. CUSTOMER REVIEWS & RATINGS                                             */}
        {/* ========================================================================= */}
        <section aria-labelledby="reviews-heading" className="bg-white rounded-[32px] p-6 sm:p-8 md:p-10 shadow-xs border border-gray-200/80">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">
                Verified Feedback
              </span>
              <h2 id="reviews-heading" className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Customer Reviews ({reviews.length})
              </h2>
            </div>
            
            <button 
              onClick={() => setIsWriteReviewModalOpen(true)}
              className="text-xs font-extrabold bg-black text-white px-5 py-3 rounded-full hover:bg-neutral-800 transition-colors shadow-xs active-press cursor-pointer"
            >
              Write a Review
            </button>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-gray-200/80">
                <div>
                  <div className="flex items-center gap-0.5 mb-2.5">
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? "fill-black text-black" : "fill-gray-200 text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-3 leading-relaxed">
                    "{review.comment || "Smooth rental process, clean bike, and responsive host."}"
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <p className="font-extrabold text-xs text-gray-900">- {review.user_name || "Guest"}</p>
                  {review.created_at && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {reviews.length === 0 && (
              <div className="col-span-full text-center py-10 text-xs text-gray-500 font-medium">
                No customer reviews yet. Be the first to share your rental experience!
              </div>
            )}
          </div>

          {reviews.length > 6 && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold rounded-full text-xs transition-all cursor-pointer"
              >
                See All {reviews.length} Reviews
              </button>
            </div>
          )}

        </section>

      </div>

      {/* ======================================================== */}
      {/* REVIEWS LIST MODAL                                       */}
      {/* ======================================================== */}
      {isReviewModalOpen && (
        <div 
          onClick={() => setIsReviewModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <div>
                <h3 className="font-extrabold text-lg">Customer Reviews</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  <span className="text-xs font-bold">{vendor.rating ? Number(vendor.rating).toFixed(1) : "5.0"}</span>
                  <span className="text-xs text-gray-500">({reviews.length} verified reviews)</span>
                </div>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-xs text-gray-900">{review.user_name || "Customer"}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < (review.rating || 5) ? "fill-black text-black" : "fill-gray-200 text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">"{review.comment}"</p>
                  {review.created_at && (
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-center py-8 text-xs text-gray-500">No reviews found.</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  setIsReviewModalOpen(false)
                  setIsWriteReviewModalOpen(true)
                }}
                className="w-full bg-black text-white font-extrabold py-3.5 rounded-full text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WRITE REVIEW MODAL                                       */}
      {/* ======================================================== */}
      {isWriteReviewModalOpen && (
        <div 
          onClick={() => setIsWriteReviewModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">Write a Review</h3>
              <button 
                onClick={() => setIsWriteReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${star <= newReview.rating ? "fill-black text-black" : "fill-gray-200 text-gray-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Your Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Alex M."
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Your Feedback</label>
                <textarea 
                  rows={4}
                  placeholder="Share your experience renting with this partner..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl p-3.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black resize-none"
                />
              </div>

              <button 
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="w-full bg-black text-white font-extrabold py-3.5 rounded-full text-xs hover:bg-neutral-800 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
