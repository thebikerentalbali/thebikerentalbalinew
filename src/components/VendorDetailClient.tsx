"use client"

import { useState, useEffect } from "react"
import { 
  ChevronLeft, 
  MapPin, 
  Star, 
  Share, 
  X, 
  BadgeCheck, 
  Check, 
  Bike
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { fetchVendorDetail, fetchScooterDetail, getVendorDeterministicReviews, invalidateAllCatalogCaches } from "@/lib/api/catalogService"
import { clientCache } from "@/lib/cache/clientCache"
import { subscribeToPlatformSettings } from "@/utils/pricing"
import TransparentLoader from "@/components/TransparentLoader"

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
  const [reviews, setReviews] = useState<any[]>(() => getVendorDeterministicReviews(id, initialReviews))
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
    }
    setIsSubmittingReview(true)
    try {
      const { error, data } = await supabase.from("reviews").insert({
        vendor_id: id,
        user_name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment
      }).select().single()

      if (!error && data) {
        setReviews(prev => [data, ...prev])
        invalidateAllCatalogCaches()
        setIsWriteReviewModalOpen(false)
        setNewReview({ name: "", rating: 5, comment: "" })
      } else {
        // Fallback / optimistic submission
        const localReview = {
          id: `review-${Date.now()}`,
          vendor_id: id,
          user_name: newReview.name,
          rating: newReview.rating,
          comment: newReview.comment,
          created_at: new Date().toISOString()
        }
        setReviews(prev => [localReview, ...prev])
        setIsWriteReviewModalOpen(false)
        setNewReview({ name: "", rating: 5, comment: "" })
      }
    } catch (e) {
      console.error("Submit review error:", e)
    } finally {
      setIsSubmittingReview(false)
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
            setReviews(getVendorDeterministicReviews(id, data.reviews || []))
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
          setReviews(getVendorDeterministicReviews(id, data.reviews || []))
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

  if (loading) {
    return <TransparentLoader />
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

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-black antialiased w-full max-w-full overflow-x-hidden pb-16">
      
      {/* ======================================================== */}
      {/* MOBILE LAYOUT (SM & DOWN)                                */}
      {/* ======================================================== */}
      <div className="block md:hidden">
        
        {/* Mobile Header Card */}
        <header className="px-4 pt-4">
          <div className="bg-white rounded-[32px] shadow-xs border border-gray-100 overflow-hidden relative">
            
            {/* 1. Cover Area with Scooter Rounded Cards Showcase */}
            <div className="relative min-h-[190px] w-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-4 flex flex-col justify-between overflow-hidden">
              
              {/* Top Action Overlay (Back & Share) */}
              <div className="flex items-center justify-between z-20 mb-3">
                <button 
                  onClick={handleBack} 
                  aria-label="Go Back"
                  className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-black shadow-xs border border-white/20 active-press cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-black" />
                </button>

                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Fleet Showcase</span>
                </div>

                <button 
                  onClick={handleShare}
                  aria-label="Share Vendor Profile"
                  className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-black shadow-xs border border-white/20 active-press cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-black" /> : <Share className="w-4 h-4 text-black" />}
                </button>
              </div>

              {/* Dynamic Scooter Images Rounded Cards Strip on Cover */}
              <div className="relative z-10">
                <style jsx>{`
                  .hide-scrollbar::-webkit-scrollbar { display: none; }
                  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                <div className="flex gap-2.5 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
                  {scooters.length > 0 ? (
                    scooters.map((scooter) => (
                      <Link
                        key={scooter.id}
                        href={`/detail/${scooter.id}`}
                        prefetch={true}
                        className="bg-white/95 backdrop-blur-md rounded-2xl p-2 pr-3 flex items-center gap-2.5 shrink-0 shadow-md border border-white/40 hover:scale-105 active-press transition-all"
                      >
                        <div className="relative w-12 h-12 bg-neutral-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          <Image
                            src={scooter.image_url || "/images/scooter.png"}
                            alt={scooter.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-black truncate max-w-[100px] leading-tight">
                            {formatTitleCase(scooter.name)}
                          </span>
                          <span className="text-[10px] font-semibold text-neutral-500">
                            Rp {Number(scooter.price_daily || 0).toLocaleString("id-ID")}/d
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-white/60 text-xs py-2 px-3">No scooters in fleet</div>
                  )}
                </div>
              </div>

            </div>

            {/* 2. Provider Profile Details: Smaller Logo before Vendor Name, Smaller Title */}
            <div className="p-5">
              
              {/* Header Row: Smaller Logo placed BEFORE Vendor Name with Smaller Title */}
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Smaller Logo */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-xs bg-white flex items-center justify-center shrink-0">
                    {vendor.logo || vendor.image_url ? (
                      <Image 
                        src={vendor.logo || vendor.image_url} 
                        alt={vendor.name} 
                        width={40} 
                        height={40} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="font-bold text-xs text-gray-700">{vendor.name?.slice(0, 2).toUpperCase() || "VN"}</span>
                    )}
                  </div>

                  {/* Smaller Title & Verified Badge */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
                      {vendor.name}
                    </h1>
                    <InstagramVerifiedBadge className="w-4 h-4 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium pl-0.5">
                <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                <span className="truncate max-w-[280px]">{vendor.address || "Bali, Indonesia"}</span>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between border-t border-b border-gray-100 py-3 my-3.5">
                {/* Rating */}
                <div className="flex flex-col items-center justify-center flex-1 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-black text-black" />
                    <span className="font-bold text-base text-gray-900">{vendor.rating ? Number(vendor.rating).toFixed(1) : "5.0"}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">rating</span>
                </div>

                <div className="w-px h-6 bg-gray-200" />

                {/* Reviews */}
                <div className="flex flex-col items-center justify-center flex-1 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>
                  <span className="font-bold text-base text-gray-900">{reviews.length}+</span>
                  <span className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">reviews</span>
                </div>

                <div className="w-px h-6 bg-gray-200" />

                {/* Scooters Count */}
                <div className="flex flex-col items-center justify-center flex-1">
                  <span className="font-bold text-base text-gray-900">{totalFleetCount}</span>
                  <span className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">scooters</span>
                </div>
              </div>

              {/* Swipeable Reviews directly under vendor info */}
              <div>
                <div className="flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="snap-start shrink-0 w-[260px] bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? "fill-black text-black" : "fill-gray-200 text-gray-200"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-3 mb-2 font-medium">"{review.comment}"</p>
                      </div>
                      <p className="font-bold text-xs text-gray-900">- {review.user_name || "Guest"}</p>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="w-full text-center py-4 text-xs text-gray-500">No reviews yet. Be the first!</div>
                  )}
                </div>
                <div className="flex items-center gap-2.5 mt-3">
                  <button 
                    onClick={() => setIsWriteReviewModalOpen(true)}
                    className="flex-1 bg-black text-white font-bold py-2.5 rounded-full text-xs hover:bg-neutral-800 shadow-sm transition-colors active-press cursor-pointer"
                  >
                    Write a Review
                  </button>
                  {reviews.length > 0 && (
                    <button 
                      onClick={() => setIsReviewModalOpen(true)}
                      className="flex-1 bg-white border border-gray-200 text-black font-bold py-2.5 rounded-full text-xs hover:bg-gray-50 transition-colors active-press cursor-pointer"
                    >
                      See More
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Mobile Scooters Fleet Section */}
        <div className="px-4 mt-5">
          {/* Brand Filter Pills on Mobile */}
          {availableBrands.length > 1 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer active-press ${
                      selectedBrand === brand
                        ? "bg-black text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-200 hover:text-black"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filteredScooters.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-3xl p-6 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Bike className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-xs">No scooters available for this brand</p>
                <button 
                  onClick={() => setSelectedBrand("All")}
                  className="mt-3 text-xs font-bold bg-black text-white px-4 py-2 rounded-full active-press cursor-pointer shadow-xs"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              filteredScooters.map((scooter) => {
                const formattedName = formatTitleCase(scooter.name)
                return (
                  <Link 
                    key={scooter.id} 
                    href={`/detail/${scooter.id}`} 
                    prefetch={true}
                    onPointerEnter={() => fetchScooterDetail(scooter.id)}
                    onTouchStart={() => fetchScooterDetail(scooter.id)}
                    className="bg-white rounded-3xl p-4 flex gap-3.5 shadow-xs items-center border border-gray-200/80 active-press transition-colors cursor-pointer"
                  >
                    <div className="relative w-24 h-24 rounded-2xl bg-[#F8F9FA] flex items-center justify-center p-2 shrink-0 overflow-hidden border border-gray-100">
                      <Image 
                        src={scooter.image_url || "/images/scooter.png"} 
                        alt={formattedName} 
                        fill 
                        sizes="96px" 
                        className="object-contain p-1 drop-shadow-md" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500 bg-[#F8F9FA] px-2 py-0.5 rounded-full border border-gray-200/60">
                          {scooter.brand || "Scooter"}
                        </span>
                        {/* Black and White Available Label */}
                        <div className="flex items-center gap-1.5 bg-black text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {scooter.available_units || 1} AVAILABLE
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{formattedName}</h3>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-base font-black text-gray-900 leading-none">
                          Rp {scooter.price_daily?.toLocaleString("id-ID") || scooter.price_daily}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold">Daily</span>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* DESKTOP LAYOUT (MD AND UP)                               */}
      {/* ======================================================== */}
      <div className="hidden md:block w-full max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Breadcrumb & Quick Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack} 
              aria-label="Go Back"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <nav className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-bold">{vendor.name}</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-black" /> : <Share className="w-4 h-4 text-black" />}
              <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
            </button>
          </div>
        </div>

        {/* Desktop Header Card */}
        <div className="bg-white rounded-[32px] overflow-hidden shadow-xs border border-gray-200/80">
          
          {/* Cover Area with Scooter Fleet Rounded Cards Showcase */}
          <div className="relative min-h-[220px] lg:h-64 w-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-6 flex flex-col justify-between overflow-hidden">
            
            {/* Top Label */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Fleet Showcase</span>
              </div>
              <span className="text-xs font-semibold text-neutral-400">{scooters.length} Models in Fleet</span>
            </div>

            {/* Dynamic Scooter Images Rounded Cards Strip on Cover */}
            <div className="relative z-10 pt-4">
              <div className="flex gap-3.5 overflow-x-auto pb-2 hide-scrollbar">
                {scooters.map((scooter) => (
                  <Link
                    key={scooter.id}
                    href={`/detail/${scooter.id}`}
                    prefetch={true}
                    className="bg-white/95 backdrop-blur-md rounded-2xl p-3 pr-4 flex items-center gap-3 shrink-0 shadow-lg border border-white/30 hover:scale-105 active-press transition-all group"
                  >
                    <div className="relative w-14 h-14 bg-neutral-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      <Image
                        src={scooter.image_url || "/images/scooter.png"}
                        alt={scooter.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1 group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-black truncate max-w-[130px] leading-tight">
                        {formatTitleCase(scooter.name)}
                      </span>
                      <span className="text-xs font-extrabold text-neutral-900 mt-0.5">
                        Rp {Number(scooter.price_daily || 0).toLocaleString("id-ID")} <span className="text-[10px] font-normal text-neutral-500">/ day</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Profile Details: Smaller Logo before Vendor Name, Smaller Title */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              
              {/* Smaller Logo before Vendor Name & Smaller Title */}
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-white border-2 border-gray-200 shadow-xs shrink-0 flex items-center justify-center">
                  {vendor.logo || vendor.image_url ? (
                    <Image 
                      src={vendor.logo || vendor.image_url} 
                      alt={vendor.name} 
                      width={56} 
                      height={56} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-700">{(vendor.name || "V").substring(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">{vendor.name}</h1>
                    <InstagramVerifiedBadge className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>{vendor.address || "Bali, Indonesia"}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-neutral-800 shadow-sm transition-colors text-xs cursor-pointer"
                >
                  Write a Review
                </button>
              </div>

            </div>

            {/* 3 Column Stats Bar */}
            <div className="flex items-center gap-8 py-4 border-t border-gray-100 max-w-md">
              {/* Rating */}
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-black text-black" />
                  <span className="font-bold text-base text-gray-900">{vendor.rating ? Number(vendor.rating).toFixed(1) : "5.0"}</span>
                </div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">rating</span>
              </div>
              
              <div className="w-px h-6 bg-gray-200" />

              {/* Reviews */}
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>
                <span className="font-bold text-base text-gray-900">{reviews.length}+</span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">reviews</span>
              </div>

              <div className="w-px h-6 bg-gray-200" />

              {/* Scooters Count */}
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-base text-gray-900">{totalFleetCount}</span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">scooters</span>
              </div>
            </div>

          </div>
        </div>

        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Area (8 Columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Scooters Fleet Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Available Scooters</h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{scooters.length} bikes in garage</p>
                </div>

                {availableBrands.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-gray-200 shadow-2xs">
                    {availableBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                  <p className="text-gray-500 font-medium">No scooters found for this brand filter.</p>
                  <button 
                    onClick={() => setSelectedBrand("All")}
                    className="mt-4 text-xs font-bold bg-black text-white px-4 py-2 rounded-full shadow-xs cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredScooters.map((scooter) => {
                    const formattedName = formatTitleCase(scooter.name)
                    return (
                      <Link 
                        key={scooter.id} 
                        href={`/detail/${scooter.id}`}
                        prefetch={true}
                        onPointerEnter={() => fetchScooterDetail(scooter.id)}
                        onTouchStart={() => fetchScooterDetail(scooter.id)}
                        className="bg-white rounded-3xl p-4 border border-gray-200/80 shadow-xs hover:shadow-md active-press transition-all flex flex-col justify-between cursor-pointer"
                      >
                        <div>
                          {/* Image Backdrop Box */}
                          <div className="relative w-full h-44 bg-[#F8F9FA] rounded-2xl flex items-center justify-center p-3 mb-3 overflow-hidden border border-gray-100">
                            <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase text-gray-600 bg-white border border-gray-200/80 px-2.5 py-0.5 rounded-full z-10">
                              {scooter.brand || "Scooter"}
                            </span>
                            
                            {/* Black and White Available Label */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black text-white px-2.5 py-1 rounded-full shadow-xs z-10">
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                {scooter.available_units || 1} AVAILABLE
                              </span>
                            </div>

                            <Image 
                              src={scooter.image_url || "/images/scooter.png"} 
                              alt={formattedName} 
                              fill
                              sizes="(max-width: 768px) 100vw, 300px"
                              className="object-contain p-2 drop-shadow-md"
                            />
                          </div>

                          {/* Title */}
                          <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{formattedName}</h3>
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3">
                          <div>
                            <span className="text-xs text-gray-400 font-bold block leading-none mb-1">Starting from</span>
                            <span className="text-base font-black text-gray-900">
                              Rp {scooter.price_daily?.toLocaleString("id-ID") || scooter.price_daily}
                              <span className="text-xs text-gray-400 font-normal"> / day</span>
                            </span>
                          </div>

                          <span className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-2xs">
                            View
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Verified Reviews Section (Desktop) */}
            <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-xs border border-gray-200/80">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Customer Reviews</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-xs text-yellow-700">{vendor.rating ? Number(vendor.rating).toFixed(1) : "5.0"}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">•</span>
                    <span className="text-xs text-gray-500 font-medium">{reviews.length} authenticated reviews</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="bg-black text-white font-bold px-5 py-2.5 rounded-full text-xs hover:bg-neutral-800 shadow-sm transition-colors cursor-pointer"
                >
                  Write Review
                </button>
              </div>

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.slice(0, 6).map((review) => (
                  <div key={review.id} className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? "fill-black text-black" : "fill-gray-200 text-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 font-medium mb-3">"{review.comment || "Smooth rental process and well-maintained bike."}"</p>
                    </div>
                    <p className="font-bold text-xs text-gray-900">- {review.user_name || "Guest"}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-xs text-gray-500 font-medium">No reviews yet. Be the first!</div>
                )}
              </div>

              {reviews.length > 6 && (
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold rounded-full text-xs transition-all cursor-pointer"
                  >
                    See All Reviews
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Sticky Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-8 self-start">
            
            {/* Host Partner Garage Location Card */}
            <div className="bg-white rounded-[32px] p-6 shadow-xs border border-gray-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-base tracking-tight">Garage Hub</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  Pickup Location
                </span>
              </div>
              
              <div className="space-y-3 pt-1">
                <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200/80">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Dispatch Address
                  </span>
                  <p className="font-bold text-gray-900 text-xs leading-relaxed flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                    <span>{vendor.address || "Bali, Indonesia"}</span>
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Reviews Modal for Mobile & Desktop */}
      {isReviewModalOpen && (
        <div 
          onClick={() => setIsReviewModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <div>
                <h3 className="font-bold text-lg">Reviews</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-black text-black" />
                  <span className="text-xs font-bold">5.0</span>
                  <span className="text-xs text-gray-500">({reviews.length} reviews)</span>
                </div>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-gray-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-gray-900">{review.user_name || "Customer"}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? "fill-black text-black" : "fill-gray-200 text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">"{review.comment}"</p>
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
                className="w-full bg-black text-white font-bold py-3 rounded-full text-xs hover:bg-neutral-800 shadow-md transition-colors cursor-pointer"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {isWriteReviewModalOpen && (
        <div 
          onClick={() => setIsWriteReviewModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900">Write a Review</h3>
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
                className="w-full bg-black text-white font-bold py-3 rounded-full text-xs hover:bg-neutral-800 shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
