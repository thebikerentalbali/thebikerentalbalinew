"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Heart, ChevronRight, Star } from "lucide-react"
import { fetchScooterDetail } from '@/lib/api/catalogService'
import { subscribeToPlatformSettings } from '@/utils/pricing'

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

  useEffect(() => {
    // Background refresh only if initial data wasn't provided or settings change
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
      <div className="min-h-screen bg-[#F4F4F6] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-xl font-bold text-black tracking-tight">Scooter not found</h2>
        <p className="text-sm text-neutral-500">The requested vehicle listing is unavailable or has been removed.</p>
        <Link href="/" className="px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors">
          Return to Catalog
        </Link>
      </div>
    )
  }

  if (!scooter) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-black antialiased selection:bg-black selection:text-white w-full max-w-full overflow-x-hidden md:py-8">
      <div className="flex flex-col min-h-screen md:min-h-0 bg-[#F4F4F6] relative pb-32 md:pb-8 md:max-w-6xl md:mx-auto md:bg-white md:shadow-xl md:rounded-[36px] md:border md:border-neutral-200/80 md:overflow-hidden w-full max-w-full overflow-x-hidden">
        
        {/* Navigation Bar */}
        <header className="flex justify-between items-center px-5 sm:px-8 py-6 relative z-10">
          <button 
            onClick={() => router.back()} 
            aria-label="Go Back"
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-neutral-200/80 shadow-xs hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
          
          <h1 className="text-base sm:text-lg font-bold text-black tracking-tight absolute left-1/2 -translate-x-1/2">
            Scooter Details
          </h1>

          <button 
            onClick={() => setIsLiked(!isLiked)}
            aria-label="Save Scooter"
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-neutral-200/80 shadow-xs hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-black text-black' : 'text-black'}`} />
          </button>
        </header>

        {/* Responsive Content Grid */}
        <div className="flex flex-col md:grid md:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.15fr_1fr] md:gap-8 lg:gap-12 md:px-8 lg:px-10 md:pb-10 w-full max-w-full overflow-x-hidden">
          
          {/* Left Column: Vehicle Visual Showcase */}
          <div className="flex flex-col w-full max-w-full">
            
            {/* Primary Vehicle Stage */}
            <div className="relative w-full h-[300px] sm:h-[360px] md:h-[440px] flex items-center justify-center mx-auto mb-4 md:mb-6 bg-white md:bg-[#FAFAFA] md:rounded-[28px] md:border md:border-neutral-200/80 p-6 overflow-hidden">
              <Image
                src={scooter.image_url || '/images/scooter.png'}
                alt={scooter.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 550px"
                className="object-contain p-6 transition-transform duration-500 hover:scale-105"
              />
            </div>
            
            {/* Desktop Thumbnails */}
            <div className="hidden md:flex items-center gap-3 px-1 mb-6">
              <div className="relative w-20 h-20 rounded-2xl bg-white border-2 border-black flex items-center justify-center p-2 shadow-xs cursor-pointer overflow-hidden">
                <Image src={scooter.image_url || "/images/scooter.png"} alt="View 1" fill sizes="80px" className="object-contain p-1" />
              </div>
              <div className="relative w-20 h-20 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center p-2 shadow-xs opacity-60 hover:opacity-100 hover:border-black transition-all cursor-pointer overflow-hidden">
                <Image src={scooter.image_url || "/images/scooter.png"} alt="View 2" fill sizes="80px" className="object-contain p-1" />
              </div>
            </div>

            {/* Quick Summary Strip (Desktop) */}
            <div className="hidden md:flex items-center justify-between bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80">
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Vehicle</span>
                <span className="text-sm font-bold text-black">{scooter.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Status</span>
                <span className="text-xs font-bold text-black bg-white border border-neutral-200 px-2.5 py-0.5 rounded-full inline-block">
                  {scooter.available_units || 1} Units Ready
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Information Cards Stream */}
          <div className="px-4 sm:px-6 md:px-0 space-y-4 flex flex-col justify-start w-full max-w-full overflow-x-hidden">
          
            {/* 1. Vendor Profile Card */}
            {vendor && (
              <Link 
                href={`/vendor/${vendor.id}`} 
                className="block bg-white rounded-[24px] p-5 shadow-xs border border-neutral-200/80 transition-all hover:border-black active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      <Image 
                        src={vendor.logo || vendor.image_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"} 
                        alt={vendor.name} 
                        fill
                        sizes="48px"
                        className="object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-[15px] leading-snug">{vendor.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <div className="flex items-center gap-1 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                          <Star className="w-3 h-3 fill-black text-black" />
                          <span className="font-bold text-black text-xs">5.0</span>
                        </div>
                        <span className="text-neutral-400">•</span>
                        <span className="text-neutral-500 truncate max-w-[150px] sm:max-w-[220px]">
                          {vendor.address || 'Bali, Indonesia'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )}

            {/* 2. Main Scooter Card (with Operating Hours placed ABOVE Description) */}
            <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-neutral-200/80 space-y-5">
              
              {/* Operating Hours Banner (Above Description) */}
              <div className="bg-black text-white rounded-2xl p-4 sm:p-4.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                    Operating Hours
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-white px-2.5 py-0.5 rounded-full">
                    Open Daily
                  </span>
                </div>
                <div className="pt-0.5">
                  <p className="font-bold text-lg sm:text-xl text-white tracking-tight">
                    {vendor?.opening_hours || '08:00 AM – 23:00 PM'}
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
                <p className="text-neutral-600 text-sm leading-relaxed">
                  The {scooter.name} delivers a smooth and effortless ride with exceptional comfort, fuel efficiency, and reliability. Perfectly suited for navigating the vibrant streets and scenic routes of Bali, this scooter offers an exceptional riding experience with modern features and elegant design.
                </p>
              </div>

              {/* Specifications Matrix */}
              <div className="pt-4 border-t border-neutral-100">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3">Specifications</h4>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/60">
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-0.5">Engine</span>
                    <span className="text-sm font-bold text-black">{scooter.engine || '125 cc'}</span>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/60">
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-0.5">Year</span>
                    <span className="text-sm font-bold text-black">{scooter.year || '2024'}</span>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/60">
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-0.5">Fuel Capacity</span>
                    <span className="text-sm font-bold text-black">{scooter.fuel_capacity || '5.1 L'}</span>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/60">
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-0.5">Transmission</span>
                    <span className="text-sm font-bold text-black">{scooter.transmission || 'Automatic'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Delivery & Pickup Coverage Card */}
            <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-neutral-200/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="font-bold text-sm text-black uppercase tracking-wider">Delivery & Pickup</h3>
                  <span className="text-xs text-neutral-500">Service coverage across Bali</span>
                </div>
                <span className="text-[11px] font-bold text-black bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  Direct Delivery
                </span>
              </div>

              {/* Service Area Highlight */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Primary Coverage Zone
                </span>
                <p className="text-xs font-bold text-black leading-relaxed">
                  {vendor?.delivery_area || getDeliveryArea(vendor?.address)}
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
                  <span>Dispatch Location</span>
                  <span className="font-semibold text-black truncate max-w-[180px]">{vendor?.address || 'Bali, Indonesia'}</span>
                </div>
              </div>

              {/* Clean Minimalist Details */}
              <div className="space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-black shrink-0">•</span>
                  <p><strong className="text-black">Hotel / Villa Delivery:</strong> Handed over directly to your accommodation address.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-black shrink-0">•</span>
                  <p><strong className="text-black">Direct Garage Pickup:</strong> Free collection and handover at vendor shop.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-black shrink-0">•</span>
                  <p><strong className="text-black">Flexible Handover:</strong> Timely dispatch coordinated via WhatsApp.</p>
                </div>
              </div>
            </div>

            {/* 4. Rental Requirements & Included Card */}
            <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-neutral-200/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="font-bold text-sm text-black uppercase tracking-wider">Rental Requirements</h3>
                  <span className="text-xs text-neutral-500">Documentation & inclusions</span>
                </div>
                <span className="text-[11px] font-bold text-black bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  Policy
                </span>
              </div>

              {/* Required Documents */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 space-y-2.5">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Required Documents</span>
                <div className="space-y-1.5 text-xs text-black font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">•</span>
                    <span>Valid Passport or National ID Copy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">•</span>
                    <span>International or National Driving License</span>
                  </div>
                </div>
              </div>

              {/* Included Free */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Included With Every Rental</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-neutral-50 border border-neutral-200/80 p-2.5 rounded-xl font-semibold text-black">
                    2 Sanitized Helmets
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200/80 p-2.5 rounded-xl font-semibold text-black">
                    Phone Mount Holder
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200/80 p-2.5 rounded-xl font-semibold text-black">
                    Free 24h Cancellation
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200/80 p-2.5 rounded-xl font-semibold text-black">
                    24/7 Road Support
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Sticky Price & Booking Card */}
            <div className="hidden md:flex items-center justify-between bg-white rounded-[24px] p-6 shadow-xs border border-neutral-200/80 mt-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Rental Price</span>
                <div className="flex items-baseline mt-1">
                  <span className="text-2xl font-black text-black tracking-tight">Rp {(scooter.price_daily || 0).toLocaleString()}</span>
                  <span className="text-xs text-neutral-400 font-semibold ml-1.5">/ day</span>
                </div>
              </div>
              <Link 
                href={`/checkout?scooterId=${scooter.id}`} 
                className="bg-black text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-sm hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Book Rent
              </Link>
            </div>

          </div>

        </div>
      </div>
      
      {/* Mobile Floating Sticky Footer Bar */}
      <div className="md:hidden fixed bottom-5 left-4 right-4 mx-auto bg-black text-white rounded-full px-5 py-3 flex items-center justify-between shadow-2xl z-40 border border-neutral-800">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Daily Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-white tracking-tight">Rp {(scooter.price_daily || 0).toLocaleString()}</span>
            <span className="text-[11px] text-neutral-400 font-medium">/day</span>
          </div>
        </div>
        
        <Link 
          href={`/checkout?scooterId=${scooter.id}`} 
          className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold shadow-xs hover:bg-neutral-100 active:scale-95 transition-all"
        >
          Book Rent
        </Link>
      </div>

    </div>
  )
}
