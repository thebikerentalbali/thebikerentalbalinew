"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  Heart, 
  Star, 
  MapPin, 
  ChevronRight, 
  Loader2, 
  Clock, 
  Check, 
  ShieldCheck, 
  Truck, 
  FileText, 
  Sparkles,
  CheckCircle2,
  PhoneCall
} from "lucide-react"
import { fetchScooterDetail } from '@/lib/api/catalogService'
import { subscribeToPlatformSettings } from '@/utils/pricing'

export default function DetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  
  const [scooter, setScooter] = useState<any>(null)
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData(forceRefresh = false) {
      if (!id) return
      try {
        const data = await fetchScooterDetail(id, { forceRefresh });
        if (data) {
          if (data.scooter) setScooter(data.scooter);
          if (data.vendor) setVendor(data.vendor);
        }
      } catch (err) {
        console.error("Error loading scooter detail:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();

    const unsubscribe = subscribeToPlatformSettings(() => {
      loadData(true);
    });

    return () => unsubscribe();
  }, [id])

  // Helper to get delivery area without parentheses
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBECEF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!scooter) {
    return (
      <div className="min-h-screen bg-[#EBECEF] flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Scooter not found</h2>
        <Link href="/" className="px-6 py-2 bg-black text-white rounded-full">Go Back Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EBECEF] w-full max-w-full overflow-x-hidden md:py-8 touch-pan-y">
      <div className="flex flex-col min-h-screen md:min-h-0 bg-[#EBECEF] relative pb-32 md:pb-0 md:max-w-5xl md:mx-auto md:shadow-2xl md:rounded-[40px] md:overflow-hidden md:border md:border-gray-200 w-full max-w-full overflow-x-hidden">
        
        {/* Header */}
        <header className="flex justify-between items-center p-6 pt-8 relative z-10">
          <button 
            onClick={() => router.back()} 
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">
            Scooter Detail
          </h1>
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <Heart className="w-5 h-5 text-gray-800" />
          </button>
        </header>

        {/* Desktop Grid Layout */}
        <div className="flex flex-col md:grid md:grid-cols-[1fr_420px] lg:grid-cols-[1fr_480px] md:gap-8 lg:gap-10 md:p-8 w-full max-w-full overflow-x-hidden">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col w-full max-w-full overflow-hidden">
            {/* Main Hero Image */}
            <div className="relative w-full h-[280px] md:h-[420px] flex items-center justify-center mt-2 mb-4 md:mb-6 md:bg-white md:rounded-[32px] md:p-8 md:shadow-sm overflow-hidden">
              <div 
                className="w-full h-full bg-contain bg-center bg-no-repeat drop-shadow-xl md:hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url("${scooter.image_url || '/images/scooter.png'}")` }}
              />
            </div>
            
            {/* Thumbnail Gallery (Desktop Only) */}
            <div className="hidden md:flex items-center gap-4 px-2 mb-6">
              <button className="w-24 h-24 rounded-2xl bg-white border-2 border-black flex items-center justify-center p-2 shadow-sm overflow-hidden transition-transform hover:-translate-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={scooter.image_url || "/images/scooter.png"} alt="View 1" className="w-full h-full object-contain drop-shadow-md" />
              </button>
              <button className="w-24 h-24 rounded-2xl bg-white/60 border-2 border-transparent flex items-center justify-center p-2 shadow-sm overflow-hidden hover:bg-white transition-all hover:-translate-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={scooter.image_url || "/images/scooter.png"} alt="View 2" className="w-full h-full object-contain drop-shadow-md opacity-80" />
              </button>
            </div>
          </div>

          {/* Right Column: Content Area */}
          <div className="px-5 md:px-0 space-y-4 md:space-y-5 md:pb-8 flex flex-col justify-start w-full max-w-full overflow-x-hidden">
          
            {/* 1. Vendor Profile Card */}
            {vendor && (
              <Link 
                href={`/vendor/${vendor.id}`} 
                className="block bg-white rounded-3xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.99] border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={vendor.logo || vendor.image_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"} 
                        alt={vendor.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{vendor.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-800">5.0</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-xs border-l border-gray-200 pl-2">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          <span className="truncate max-w-[150px] sm:max-w-[200px]">{vendor.address || 'Bali, Indonesia'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </Link>
            )}

            {/* 2. Main Scooter Card (with Operating Hours placed ABOVE Description) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-5">
              
              {/* Operating Hours Section (Placed Above Description) */}
              <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-4 sm:p-4.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Operating Hours
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Open Daily
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <p className="font-bold text-lg sm:text-xl text-white tracking-tight">
                    {vendor?.opening_hours || '08:00 AM – 08:00 PM'}
                  </p>
                  <span className="text-xs text-gray-300">WITA (Bali Time)</span>
                </div>
              </div>

              {/* Description Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900">Description</h3>
                  <span className="font-bold text-white bg-black px-3 py-0.5 rounded-full text-xs tracking-wide shadow-xs">
                    {scooter.available_units || 1} Units Available
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The {scooter.name} delivers a smooth and effortless ride with exceptional comfort, fuel efficiency, and reliability. Perfectly suited for navigating the vibrant streets and scenic routes of Bali, this scooter offers an exceptional riding experience with modern features and elegant design.
                </p>
              </div>

              {/* Specifications Grid */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Specifications</h4>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-0.5">Engine</span>
                    <span className="text-sm font-bold text-gray-900">{scooter.engine || '125 cc'}</span>
                  </div>
                  <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-0.5">Year</span>
                    <span className="text-sm font-bold text-gray-900">{scooter.year || '2024'}</span>
                  </div>
                  <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-0.5">Fuel Capacity</span>
                    <span className="text-sm font-bold text-gray-900">{scooter.fuel_capacity || '5.1 L'}</span>
                  </div>
                  <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-0.5">Transmission</span>
                    <span className="text-sm font-bold text-gray-900">{scooter.transmission || 'Automatic'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. NEW CARD: Delivery & Coverage Areas */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <div className="w-9 h-9 rounded-2xl bg-neutral-100 flex items-center justify-center text-gray-900 font-bold">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 leading-tight">Delivery & Pickup Coverage</h3>
                  <span className="text-xs text-gray-500">Direct handover to your accommodation</span>
                </div>
              </div>

              {/* Coverage area badge */}
              <div className="bg-blue-50/70 border border-blue-100/80 rounded-2xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-0.5">Covered Service Area</span>
                    <p className="text-xs font-semibold text-blue-950 leading-snug">
                      {vendor?.delivery_area || getDeliveryArea(vendor?.address)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bullet points */}
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p><strong className="text-gray-900">Hotel & Villa Drop-off:</strong> Direct delivery straight to your hotel, villa, or Airbnb address.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p><strong className="text-gray-900">Direct Shop Pickup:</strong> Free collection and drop-off at vendor garage location.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p><strong className="text-gray-900">Flexible Scheduling:</strong> On-time dispatch during operational hours.</p>
                </div>
              </div>
            </div>

            {/* 4. NEW CARD: Rental Requirements & Inclusions */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <div className="w-9 h-9 rounded-2xl bg-neutral-100 flex items-center justify-center text-gray-900 font-bold">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 leading-tight">Rental Requirements & Inclusions</h3>
                  <span className="text-xs text-gray-500">What you need & what comes included</span>
                </div>
              </div>

              {/* Requirements block */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Required Documents</span>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-black font-bold shrink-0" />
                    <span>Valid Passport or National ID copy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-black font-bold shrink-0" />
                    <span>International or National Driving License</span>
                  </div>
                </div>
              </div>

              {/* What's included block */}
              <div className="space-y-2.5 text-xs text-gray-600 pt-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Included with Every Rental</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl text-emerald-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium">2 Sanitized Helmets</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl text-emerald-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium">Phone Mount Holder</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl text-emerald-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium">Free 24h Cancellation</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl text-emerald-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium">24/7 Roadside Assistance</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Book Rent Button */}
            <div className="hidden md:flex items-center justify-between bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-2">
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500 font-medium">Rental Price</span>
                <div className="flex items-end mt-1">
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">Rp {(scooter.price_daily || 0).toLocaleString()}</span>
                  <span className="text-[13px] text-gray-500 font-medium ml-1 mb-1">/Per Day</span>
                </div>
              </div>
              <Link 
                href={`/checkout?scooterId=${scooter.id}`} 
                className="bg-black text-white px-8 py-4 rounded-full text-base font-semibold shadow-xl shadow-black/20 hover:scale-105 transition-transform"
              >
                Book Rent
              </Link>
            </div>

          </div>

        </div>
      </div>
      
      {/* Bottom Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-6 left-5 right-5 mx-auto bg-white/95 backdrop-blur-xl rounded-full px-5 py-3.5 flex items-center justify-between shadow-[0_10px_35px_-5px_rgba(0,0,0,0.25)] border border-white/60 z-40">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-gray-900 tracking-tight">Rp {(scooter.price_daily || 0).toLocaleString()}</span>
          <span className="text-xs text-gray-500 font-medium">/day</span>
        </div>
        
        <Link 
          href={`/checkout?scooterId=${scooter.id}`} 
          className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-black/20 hover:scale-105 active:scale-95 transition-transform"
        >
          Book Rent
        </Link>
      </div>

    </div>
  )
}
