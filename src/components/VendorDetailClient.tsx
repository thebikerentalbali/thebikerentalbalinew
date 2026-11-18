"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { 
  ChevronLeft, 
  ChevronRight,
  MapPin, 
  Share, 
  Check, 
  Bike,
  Clock,
  ShieldCheck,
  ExternalLink
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { fetchVendorDetail, fetchScooterDetail } from "@/lib/api/catalogService"
import { subscribeToPlatformSettings } from "@/utils/pricing"
import { normalizeGoogleMapsUrl, fetchVendorGoogleMapsFallback } from "@/utils/vendorMaps"
import TransparentLoader from "@/components/TransparentLoader"

interface VendorDetailClientProps {
  id: string
  initialVendor: any
  initialScooters: any[]
  initialReviews?: any[]
  initialSettings?: any
}

function GoogleMarkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
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
        fill="#0a84ff"
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
}: VendorDetailClientProps) {
  const router = useRouter()

  const [vendor, setVendor] = useState<any>(initialVendor)
  const [scooters, setScooters] = useState<any[]>(initialScooters)
  const [loading, setLoading] = useState<boolean>(!initialVendor)
  const [fallbackMapsUrl, setFallbackMapsUrl] = useState<string>("")
  const [selectedBrand, setSelectedBrand] = useState<string>("All")
  const [copiedLink, setCopiedLink] = useState(false)

  // Full frame cover gallery list
  const coverImages = useMemo(() => {
    const list: { url: string; scooter?: any }[] = []
    if (vendor?.cover_image) {
      list.push({ url: vendor.cover_image })
    }
    if (vendor?.image_url && !list.some(l => l.url === vendor.image_url)) {
      list.push({ url: vendor.image_url })
    }
    scooters.forEach(s => {
      if (s.image_url && !list.some(l => l.url === s.image_url)) {
        list.push({ url: s.image_url, scooter: s })
      }
    })
    if (list.length === 0) {
      list.push({ url: "/images/scooter.png" })
    }
    return list
  }, [vendor, scooters])

  const [mobileCoverIndex, setMobileCoverIndex] = useState(0)
  const mobileCoverRef = useRef<HTMLDivElement>(null)

  const [desktopCoverIndex, setDesktopCoverIndex] = useState(0)
  const desktopCoverRef = useRef<HTMLDivElement>(null)

  const scrollMobileCover = (direction: "prev" | "next") => {
    if (mobileCoverRef.current) {
      const width = mobileCoverRef.current.clientWidth
      const newIdx = direction === "next" 
        ? Math.min(mobileCoverIndex + 1, coverImages.length - 1)
        : Math.max(mobileCoverIndex - 1, 0)
      mobileCoverRef.current.scrollTo({
        left: newIdx * width,
        behavior: "smooth"
      })
      setMobileCoverIndex(newIdx)
    }
  }

  const scrollDesktopCover = (direction: "prev" | "next") => {
    if (desktopCoverRef.current) {
      const width = desktopCoverRef.current.clientWidth
      const newIdx = direction === "next" 
        ? Math.min(desktopCoverIndex + 1, coverImages.length - 1)
        : Math.max(desktopCoverIndex - 1, 0)
      desktopCoverRef.current.scrollTo({
        left: newIdx * width,
        behavior: "smooth"
      })
      setDesktopCoverIndex(newIdx)
    }
  }

  const handleMobileScroll = () => {
    if (mobileCoverRef.current) {
      const scrollLeft = mobileCoverRef.current.scrollLeft
      const width = mobileCoverRef.current.clientWidth
      if (width > 0) {
        setMobileCoverIndex(Math.round(scrollLeft / width))
      }
    }
  }

  const handleDesktopScroll = () => {
    if (desktopCoverRef.current) {
      const scrollLeft = desktopCoverRef.current.scrollLeft
      const width = desktopCoverRef.current.clientWidth
      if (width > 0) {
        setDesktopCoverIndex(Math.round(scrollLeft / width))
      }
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
          }
        } catch (err) {
          console.error("Failed to load vendor details:", err)
        } finally {
          setLoading(false)
        }
      }
      loadData()
    }

    if (id && !normalizeGoogleMapsUrl(initialVendor?.google_maps_url)) {
      fetchVendorGoogleMapsFallback(id).then((url) => {
        if (url) setFallbackMapsUrl(url)
      })
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
          const data = await fetchVendorDetail(id, { forceRefresh: true });
          if (data?.vendor) {
            setVendor(data.vendor);
            setScooters(data.scooters || []);
          }
        }
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-[var(--ink)]">
        <div className="cirrel-glass rounded-[30px] p-8 text-center max-w-sm">
          <h1 className="text-xl font-bold text-[var(--ink)] mb-2">Vendor Not Found</h1>
          <p className="text-[var(--muted-ink)] text-sm mb-5">The requested rental provider is unavailable.</p>
          <Link href="/" prefetch={true} className="inline-block cirrel-btn-primary px-6 py-2.5 text-xs font-bold">
            Go Back Home
          </Link>
        </div>
      </div>
    )
  }

  const availableBrands = ["All", ...Array.from(new Set(scooters.map((s) => s.brand).filter(Boolean)))]
  const filteredScooters = selectedBrand === "All" 
    ? scooters 
    : scooters.filter((s) => s.brand === selectedBrand)

  const totalFleetCount = scooters.reduce((sum, s) => sum + (s.total_units || 1), 0)
  const googleMapsUrl = normalizeGoogleMapsUrl(vendor?.google_maps_url) || fallbackMapsUrl

  return (
    <div className="min-h-screen text-[var(--ink)] antialiased w-full max-w-full overflow-x-hidden pb-16">
      
      {/* ======================================================== */}
      {/* MOBILE LAYOUT (SM & DOWN)                                */}
      {/* ======================================================== */}
      <div className="block md:hidden">
        
        {/* Mobile Header Card */}
        <header className="px-4 pt-4">
          <div className="cirrel-glass rounded-[30px] overflow-hidden relative">
            
            {/* 1. Full Frame Cover Image Carousel */}
            <div className="relative z-10 w-full h-64 sm:h-72 bg-[#070d18] rounded-b-[28px] overflow-hidden select-none shadow-sm">
              
              {/* Top Action Overlay (Back & Share) */}
              <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
                <button 
                  onClick={handleBack} 
                  aria-label="Go Back"
                  className="w-10 h-10 bg-black/55 hover:bg-black/75 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-md border border-white/25 active-press cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                <button 
                  onClick={handleShare} 
                  aria-label="Share Vendor Profile"
                  className="w-10 h-10 bg-black/55 hover:bg-black/75 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-md border border-white/25 active-press cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-[#4fdc78]" /> : <Share className="w-4 h-4 text-white" />}
                </button>
              </div>

              {/* Full Frame Slider Container */}
              <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
              <div 
                ref={mobileCoverRef}
                onScroll={handleMobileScroll}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth"
              >
                {coverImages.map((img, idx) => (
                  <div key={idx} className="relative min-w-full h-full shrink-0 snap-center bg-[#070d18] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        aria-hidden="true"
                        sizes="100vw"
                        className="object-cover object-center blur-xl opacity-40 scale-110"
                      />
                    </div>

                    <div className="relative w-full h-full flex items-center justify-center p-1.5 sm:p-2 z-10">
                      <Image
                        src={img.url}
                        alt={`${vendor.name} cover image ${idx + 1}`}
                        fill
                        priority={idx === 0}
                        sizes="100vw"
                        className={`object-contain object-center ${img.scooter ? 'p-3 drop-shadow-md' : ''}`}
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-15 pointer-events-none" />

                    {img.scooter && (
                      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
                        <Link 
                          href={`/detail/${img.scooter.id}`}
                          prefetch={true}
                          className="bg-black/55 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/25 hover:bg-black/75 flex items-center gap-1 transition-all"
                        >
                          <span>{formatTitleCase(img.scooter.name)}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <span className="text-[10px] font-bold text-white bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/25">
                          {idx + 1} / {coverImages.length}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Indicator Dots */}
              {coverImages.length > 1 && (
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 pointer-events-none">
                  {coverImages.map((_, i) => (
                    <span 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === mobileCoverIndex ? "w-4 bg-[#3d9bff] shadow-xs" : "w-1 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}

            </div>

            {/* 2. Provider Profile Details */}
            <div className="relative z-10 p-5 text-[var(--ink)]">
              <div className="mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-[var(--line-2)] shadow-xs bg-white flex items-center justify-center shrink-0">
                    {(vendor.logo || vendor.logo_url) ? (
                      <Image 
                        src={vendor.logo || vendor.logo_url} 
                        alt={vendor.name || "Vendor"} 
                        width={44} 
                        height={44} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="font-bold text-xs text-[#0b1220]">{vendor.name?.slice(0, 2).toUpperCase() || "VN"}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h1 className="text-base sm:text-lg font-bold text-[var(--ink)] leading-tight truncate">
                        {vendor.name}
                      </h1>
                      <InstagramVerifiedBadge className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-ink)] font-medium mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
                      <span className="truncate max-w-[240px] sm:max-w-xs">{vendor.address || "Bali, Indonesia"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between border-t border-[var(--line)] pt-3.5 mt-3.5 gap-2">
                <div className="flex flex-col items-center justify-center flex-1">
                  <span className="font-bold text-base text-[var(--ink)]">{totalFleetCount}</span>
                  <span className="text-[10px] text-[var(--muted-ink)] font-bold mt-0.5 uppercase tracking-wider">scooters</span>
                </div>

                <div className="w-px h-6 bg-[var(--line)]" />

                <div className="flex flex-col items-center justify-center flex-1 min-w-0 px-1">
                  <span className="font-bold text-xs text-[var(--ink)] truncate max-w-full">
                    {vendor.opening_hours || "08:00 – 20:00"}
                  </span>
                  <span className="text-[10px] text-[var(--muted-ink)] font-bold mt-0.5 uppercase tracking-wider">hours</span>
                </div>

                <div className="w-px h-6 bg-[var(--line)]" />

                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="flex items-center gap-1 text-[var(--good)]">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold text-xs">Verified</span>
                  </div>
                  <span className="text-[10px] text-[var(--muted-ink)] font-bold mt-0.5 uppercase tracking-wider">partner</span>
                </div>
              </div>

              {/* Google Reviews Button (when vendor configured their Google Maps link) */}
              {googleMapsUrl && (
                <div className="mt-4 pt-3.5 border-t border-[var(--line)]">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full cirrel-btn py-3 px-4 text-xs font-bold flex items-center justify-between gap-3 active-press cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                        <GoogleMarkIcon className="w-4 h-4" />
                      </span>
                      <div className="text-left min-w-0">
                        <span className="block text-[var(--ink)] font-bold text-xs leading-tight">Google Reviews</span>
                        <span className="block text-[10px] text-[var(--muted-ink)] font-medium truncate">
                          View authentic reviews on Google Maps
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Scooters Fleet Section */}
        <div className="px-4 mt-5">
          {availableBrands.length > 1 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    data-active={selectedBrand === brand}
                    className="cirrel-chip px-4 py-2 text-xs shrink-0 cursor-pointer active-press"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filteredScooters.length === 0 ? (
              <div className="text-center py-8 cirrel-glass rounded-[26px] p-6">
                <div className="relative z-10 w-12 h-12 rounded-full cirrel-well flex items-center justify-center mx-auto mb-3">
                  <Bike className="w-6 h-6 text-[var(--muted-ink)]" />
                </div>
                <p className="relative z-10 text-[var(--muted-ink)] font-medium text-xs">No scooters available for this brand</p>
                <button 
                  onClick={() => setSelectedBrand("All")}
                  className="relative z-10 mt-3 text-xs font-bold cirrel-btn-primary px-4 py-2 active-press cursor-pointer"
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
                    className="cirrel-glass rounded-[24px] p-3.5 flex gap-3.5 items-center active-press transition-all cursor-pointer"
                  >
                    <div className="relative z-10 w-24 h-24 rounded-[18px] bg-gradient-to-b from-white/95 to-[#eaf0f8]/95 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-xs">
                      <Image 
                        src={scooter.image_url || "/images/scooter.png"} 
                        alt={formattedName} 
                        fill 
                        sizes="96px" 
                        className="object-contain p-1 drop-shadow-md" 
                      />
                    </div>
                    <div className="relative z-10 flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="cirrel-pill text-[10px] uppercase tracking-wider">
                          {scooter.brand || "Scooter"}
                        </span>
                        <div className="cirrel-pill cirrel-pill--good text-[10px] uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{scooter.available_units || 1} AVAIL</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-[var(--ink)] text-sm mb-1 truncate">{formattedName}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base font-bold text-[var(--ink)] leading-none">
                          Rp {scooter.price_daily?.toLocaleString("id-ID") || scooter.price_daily}
                        </span>
                        <span className="text-xs text-[var(--muted-ink)] font-semibold">/ day</span>
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
              className="cirrel-ibtn w-10 h-10 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <nav className="cirrel-glass px-4 py-2 rounded-full flex items-center gap-2 text-sm text-[var(--muted-ink)] font-medium">
              <Link href="/" className="relative z-10 hover:text-[var(--ink)] transition-colors">Home</Link>
              <span className="relative z-10">/</span>
              <span className="relative z-10 text-[var(--ink)] font-bold">{vendor.name}</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="cirrel-btn px-4 py-2.5 text-xs font-bold flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[var(--good)]" /> : <Share className="w-4 h-4 text-[var(--accent-text)]" />}
              <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
            </button>
          </div>
        </div>

        {/* Desktop Header Card */}
        <div className="cirrel-glass rounded-[30px] overflow-hidden">
          
          {/* Full Frame Cover Image Carousel */}
          <div className="relative z-10 w-full h-80 lg:h-96 bg-[#070d18] rounded-b-[32px] overflow-hidden select-none shadow-sm">
            <div 
              ref={desktopCoverRef}
              onScroll={handleDesktopScroll}
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth"
            >
              {coverImages.map((img, idx) => (
                <div key={idx} className="relative min-w-full h-full shrink-0 snap-center bg-[#070d18] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      aria-hidden="true"
                      sizes="100vw"
                      className="object-cover object-center blur-xl opacity-40 scale-110"
                    />
                  </div>

                  <div className="relative w-full h-full flex items-center justify-center p-3 lg:p-4 z-10">
                    <Image
                      src={img.url}
                      alt={`${vendor.name} cover image ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="100vw"
                      className={`object-contain object-center ${img.scooter ? 'p-6 drop-shadow-md' : ''}`}
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-15 pointer-events-none" />

                  {img.scooter && (
                    <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between pointer-events-auto">
                      <Link 
                        href={`/detail/${img.scooter.id}`}
                        prefetch={true}
                        className="bg-black/55 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/25 hover:bg-black/75 flex items-center gap-2 transition-all"
                      >
                        <span>{formatTitleCase(img.scooter.name)}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <span className="text-xs font-bold text-white bg-black/55 backdrop-blur-md px-3 py-1 rounded-full border border-white/25">
                        {idx + 1} / {coverImages.length}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {coverImages.length > 1 && (
              <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-none">
                {coverImages.map((_, i) => (
                  <span 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === desktopCoverIndex ? "w-5 bg-[#3d9bff] shadow-xs" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="relative z-10 p-8 text-[var(--ink)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-white border-2 border-[var(--line-2)] shadow-xs shrink-0 flex items-center justify-center">
                  {(vendor.logo || vendor.logo_url) ? (
                    <Image 
                      src={vendor.logo || vendor.logo_url} 
                      alt={vendor.name || "Vendor"} 
                      width={56} 
                      height={56} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-lg font-bold text-[#0b1220]">{(vendor.name || "V").substring(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h1 className="text-lg lg:text-xl font-bold text-[var(--ink)] leading-tight">{vendor.name}</h1>
                    <InstagramVerifiedBadge className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted-ink)] font-medium mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
                    <span>{vendor.address || "Bali, Indonesia"}</span>
                  </div>
                </div>
              </div>

              {googleMapsUrl && (
                <div className="flex items-center gap-3">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cirrel-btn font-bold px-5 py-3 text-xs cursor-pointer active-press flex items-center gap-2.5"
                  >
                    <GoogleMarkIcon className="w-4 h-4 shrink-0" />
                    <span>Google Reviews</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                  </a>
                </div>
              )}
            </div>

            {/* 3 Column Real Info Bar */}
            <div className="flex items-center gap-8 py-4 border-t border-[var(--line)] flex-wrap">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-[var(--accent-text)]" />
                <span className="font-bold text-base text-[var(--ink)]">{totalFleetCount}</span>
                <span className="text-xs text-[var(--muted-ink)] font-bold uppercase tracking-wider">scooters</span>
              </div>

              <div className="w-px h-6 bg-[var(--line)]" />

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent-text)]" />
                <span className="font-bold text-sm text-[var(--ink)]">{vendor.opening_hours || "08:00 AM – 08:00 PM Daily"}</span>
              </div>

              <div className="w-px h-6 bg-[var(--line)]" />

              <div className="flex items-center gap-1.5 text-[var(--good)]">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Verified Partner</span>
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
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[var(--ink)] tracking-tight">Available Scooters</h2>
                  <p className="text-xs text-[var(--muted-ink)] font-medium mt-0.5">{scooters.length} bikes in garage</p>
                </div>

                {availableBrands.length > 1 && (
                  <div className="cirrel-seg flex items-center gap-1">
                    {availableBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          selectedBrand === brand
                            ? "cirrel-btn-primary text-white"
                            : "text-[var(--muted-ink)] hover:text-[var(--ink)]"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {filteredScooters.length === 0 ? (
                <div className="cirrel-glass rounded-[26px] p-12 text-center">
                  <p className="relative z-10 text-[var(--muted-ink)] font-medium">No scooters found for this brand filter.</p>
                  <button 
                    onClick={() => setSelectedBrand("All")}
                    className="relative z-10 mt-4 text-xs font-bold cirrel-btn-primary px-5 py-2 cursor-pointer"
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
                        className="cirrel-glass rounded-[26px] p-4 hover:-translate-y-0.5 active-press transition-all flex flex-col justify-between cursor-pointer"
                      >
                        <div className="relative z-10">
                          <div className="relative w-full h-44 bg-gradient-to-b from-white/95 to-[#eaf0f8]/95 rounded-[20px] flex items-center justify-center p-3 mb-3 overflow-hidden shadow-xs">
                            <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase text-[#0b1220] bg-white/90 border border-black/10 px-2.5 py-0.5 rounded-full z-10">
                              {scooter.brand || "Scooter"}
                            </span>
                            
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#0b1220]/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full shadow-xs z-10">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#4fdc78]" />
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

                          <h3 className="font-bold text-[var(--ink)] text-base mb-1 truncate">{formattedName}</h3>
                        </div>

                        <div className="relative z-10 flex items-center justify-between border-t border-[var(--line)] pt-3 mt-3">
                          <div>
                            <span className="text-xs text-[var(--muted-ink)] font-bold block leading-none mb-1">Starting from</span>
                            <span className="text-base font-bold text-[var(--ink)]">
                              Rp {scooter.price_daily?.toLocaleString("id-ID") || scooter.price_daily}
                              <span className="text-xs text-[var(--muted-ink)] font-normal"> / day</span>
                            </span>
                          </div>

                          <span className="cirrel-btn-primary px-4 py-2 text-xs font-bold whitespace-nowrap">
                            View
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Google Maps & Reviews Section (Desktop) */}
            {googleMapsUrl && (
              <div className="cirrel-glass rounded-[30px] p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[var(--line)] flex items-center justify-center shrink-0">
                    <GoogleMarkIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--ink)] tracking-tight">Google Reviews</h2>
                    <p className="text-xs sm:text-sm text-[var(--muted-ink)] font-medium mt-1">
                      Read verified customer ratings and check {vendor.name}&apos;s exact location directly on Google Maps.
                    </p>
                  </div>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 cirrel-btn-primary font-bold px-6 py-3 text-xs shrink-0 flex items-center justify-center gap-2 active-press"
                >
                  <span>View Google Reviews</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

          </div>

          {/* Sticky Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-8 self-start">
            <div className="cirrel-glass rounded-[30px] p-6 space-y-4">
              <div className="relative z-10 flex items-center justify-between">
                <h3 className="font-bold text-[var(--ink)] text-base tracking-tight">Garage Hub</h3>
                <span className="cirrel-pill cirrel-pill--info text-[10px] uppercase tracking-wider">
                  Pickup Location
                </span>
              </div>
              
              <div className="relative z-10 space-y-3 pt-1">
                <div className="cirrel-well rounded-[20px] p-4">
                  <span className="text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-widest block mb-1">
                    Dispatch Address
                  </span>
                  <p className="font-bold text-[var(--ink)] text-xs leading-relaxed flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0 mt-0.5" />
                    <span>{vendor.address || "Bali, Indonesia"}</span>
                  </p>
                </div>

                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full cirrel-btn py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 active-press"
                  >
                    <GoogleMarkIcon className="w-4 h-4" />
                    <span>Google Reviews &amp; Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
