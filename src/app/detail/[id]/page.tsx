"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Heart, Star, MapPin, ChevronRight, Loader2, Clock, Check, X } from "lucide-react"
import { createClient } from '@/lib/supabase/client'

export default function DetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const supabase = createClient()
  
  const [scooter, setScooter] = useState<any>(null)
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeInfoModal, setActiveInfoModal] = useState<'hours' | 'delivery' | 'requirements' | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      
      const { data: sData } = await supabase.from('scooters').select('*').eq('id', id).single()
      if (sData) {
        setScooter(sData)
        const { data: vData } = await supabase.from('vendors').select('*').eq('id', sData.vendor_id).single()
        setVendor(vData)
      }
      setLoading(false)
    }
    loadData()
  }, [id])

  // Helper to get delivery area without parentheses
  const getDeliveryArea = (address?: string) => {
    if (!address) return "Ubud & Greater Bali Area"
    const lower = address.toLowerCase()
    if (lower.includes("ubud") || lower.includes("gianyar") || lower.includes("cempaka") || lower.includes("mas")) {
      return "Ubud area only - Central Ubud, Mas, Sayan, Campuhan, Penestanan & Tegallalang"
    }
    if (lower.includes("canggu") || lower.includes("pererenan") || lower.includes("berawa") || lower.includes("tibubeneng")) {
      return "Canggu area only - Batu Bolong, Echo Beach, Berawa, Pererenan & Umalas"
    }
    if (lower.includes("seminyak") || lower.includes("kerobokan") || lower.includes("kuta")) {
      return "Seminyak & Kuta area only - Petitenget, Double Six, Legian & Sunset Road"
    }
    if (lower.includes("uluwatu") || lower.includes("bukit") || lower.includes("ungasan") || lower.includes("jimbaran") || lower.includes("pecatu")) {
      return "South Bali Bukit area only - Uluwatu, Padang Padang, Bingin, Balangan & Jimbaran"
    }
    if (lower.includes("sanur")) {
      return "Sanur area only - Sanur Beach, Renon & Denpasar Timur"
    }
    return `${address} and surrounding 10km radius`
  }

  if (loading) {
    return <div className="min-h-screen bg-[#EBECEF] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
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
      <div className="flex flex-col min-h-screen md:min-h-0 bg-[#EBECEF] relative pb-28 md:pb-0 md:max-w-5xl md:mx-auto md:shadow-2xl md:rounded-[40px] md:overflow-hidden md:border md:border-gray-200 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-6 pt-8 relative z-10">
          <button onClick={() => router.back()} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-medium text-gray-900 absolute left-1/2 -translate-x-1/2">
            Scooter Detail
          </h1>
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <Heart className="w-5 h-5 text-gray-800" />
          </button>
        </header>

        {/* Desktop Grid Layout */}
        <div className="flex flex-col md:grid md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_450px] md:gap-8 lg:gap-12 md:p-8 w-full max-w-full overflow-x-hidden">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col w-full max-w-full overflow-hidden">
            {/* Main Hero Image */}
            <div className="relative w-full h-[280px] md:h-[400px] flex items-center justify-center mt-2 mb-4 md:mb-6 md:bg-white/40 md:rounded-[32px] overflow-hidden">
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
          <div className="px-6 md:px-0 space-y-6 md:pb-8 flex flex-col justify-center w-full max-w-full overflow-x-hidden">
          
          {/* Vendor Profile */}
          {vendor && (
            <Link href={`/vendor/${vendor.id}`} className="block bg-white rounded-3xl p-5 shadow-sm transition-transform active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={vendor.logo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"} alt={vendor.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-[15px]">{vendor.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-700">5.0</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 border-l border-gray-200 pl-2 max-w-[120px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="text-[13px] truncate">{vendor.address || 'Bali'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          )}

          {/* Quick Info Pill Buttons (Only this container allows horizontal swiping) */}
          {vendor && (
            <div 
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide hide-scrollbar w-full max-w-full touch-pan-x py-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              <button 
                onClick={() => setActiveInfoModal('hours')}
                className="bg-black hover:bg-neutral-800 active:scale-95 transition-all text-white text-xs font-semibold px-4 py-2.5 rounded-full shrink-0 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-white" />
                <span>Operating Hours</span>
              </button>

              <button 
                onClick={() => setActiveInfoModal('delivery')}
                className="bg-black hover:bg-neutral-800 active:scale-95 transition-all text-white text-xs font-semibold px-4 py-2.5 rounded-full shrink-0 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>Delivery Areas</span>
              </button>

              <button 
                onClick={() => setActiveInfoModal('requirements')}
                className="bg-black hover:bg-neutral-800 active:scale-95 transition-all text-white text-xs font-semibold px-4 py-2.5 rounded-full shrink-0 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Rental Requirements</span>
              </button>
            </div>
          )}

          {/* Scooter Details Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
            {/* Description Section */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                The {scooter.name} delivers a smooth and effortless ride with exceptional comfort, fuel efficiency, and reliability. Perfectly suited for navigating the vibrant streets and scenic routes of Bali, this scooter offers an exceptional riding experience with modern features and elegant design.
              </p>
            </div>

            {/* Available Title & Units Row (Positioned directly below description) */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">Available</span>
              <span className="font-bold text-white bg-black px-3.5 py-1 rounded-full text-xs tracking-wide shadow-sm">
                {scooter.available_units} Units
              </span>
            </div>

            {/* Specifications Section */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h4 className="text-sm font-bold text-gray-900 mb-1">Specifications</h4>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Engine</span>
                <span className="font-medium text-gray-900 text-sm">{scooter.engine || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Year</span>
                <span className="font-medium text-gray-900 text-sm">{scooter.year || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Fuel Capacity</span>
                <span className="font-medium text-gray-900 text-sm">{scooter.fuel_capacity || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500 text-sm">Transmission</span>
                <span className="font-medium text-gray-900 text-sm">{scooter.transmission || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Desktop Book Rent Button */}
          <div className="hidden md:flex items-center justify-between bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-6">
            <div className="flex flex-col">
              <span className="text-[13px] text-gray-500 font-medium">Rental Price</span>
              <div className="flex items-end mt-1">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">Rp {(scooter.price_daily || 0).toLocaleString()}</span>
                <span className="text-[13px] text-gray-500 font-medium ml-1 mb-1">/Per Day</span>
              </div>
            </div>
            <Link href={`/checkout?scooterId=${scooter.id}`} className="bg-black text-white px-8 py-4 rounded-full text-base font-semibold shadow-xl shadow-black/20 hover:scale-105 transition-transform">
              Book Rent
            </Link>
          </div>
        </div>

        </div>
      </div>
      
      {/* Bottom Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 mx-auto bg-white/90 backdrop-blur-xl rounded-full px-5 py-3 flex items-center justify-between shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-white/50 z-40">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-gray-900 tracking-tight">Rp {(scooter.price_daily || 0).toLocaleString()}</span>
          <span className="text-[11px] text-gray-500 font-medium">/day</span>
        </div>
        
        <Link href={`/checkout?scooterId=${scooter.id}`} className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-black/20 hover:scale-105 transition-transform">
          Book Rent
        </Link>
      </div>

      {/* Info Modals (Operating Hours, Delivery Areas, Rental Requirements) */}
      {activeInfoModal && vendor && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setActiveInfoModal(null)}
        >
          <div 
            className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-bold">
                  {activeInfoModal === 'hours' && <Clock className="w-4 h-4" />}
                  {activeInfoModal === 'delivery' && <MapPin className="w-4 h-4" />}
                  {activeInfoModal === 'requirements' && <Check className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  {activeInfoModal === 'hours' && 'Operating Hours'}
                  {activeInfoModal === 'delivery' && 'Delivery Areas'}
                  {activeInfoModal === 'requirements' && 'Rental Requirements'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveInfoModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {activeInfoModal === 'hours' && (
              <div className="space-y-4">
                <div className="bg-neutral-900 text-white rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Working Schedule</span>
                    <span className="text-[11px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">Open Daily</span>
                  </div>
                  <p className="font-bold text-xl text-white">{vendor.opening_hours || '08:00 AM – 08:00 PM'}</p>
                  <p className="text-xs text-gray-300 mt-1">Monday through Sunday (WITA Bali Time)</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Service Details</h4>
                  <div className="space-y-2.5 text-xs text-gray-600">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>
                      <p><strong className="text-gray-900">Instant Delivery:</strong> Drop-off directly to your hotel or villa during open hours.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-[10px] font-bold">2</div>
                      <p><strong className="text-gray-900">Direct Shop Pickup:</strong> Free collection and return at the vendor location.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-[10px] font-bold">3</div>
                      <p><strong className="text-gray-900">Continuous Support:</strong> Responsive customer service & assistance throughout the day.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeInfoModal === 'delivery' && (
              <div className="space-y-4">
                <div className="bg-neutral-900 text-white rounded-2xl p-4">
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Delivery Coverage</span>
                  <p className="font-bold text-base text-white leading-snug">{vendor.delivery_area || getDeliveryArea(vendor.address)}</p>
                  <p className="text-xs text-gray-300 mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>Dispatched from: {vendor.address || 'Bali, Indonesia'}</span>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Delivery Policy</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">To Your Accommodation:</strong> Delivered straight to your hotel, villa, or Airbnb.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">Free Delivery Radius:</strong> Free delivery within 5km from shop location.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">Included Equipment:</strong> 2 sanitized helmets & phone holder.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeInfoModal === 'requirements' && (
              <div className="space-y-4">
                <div className="bg-neutral-900 text-white rounded-2xl p-4">
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Required Documents</span>
                  <div className="space-y-2 text-xs text-gray-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="font-semibold text-white">Valid Passport or National ID copy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="font-semibold text-white">International or National Driving License</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">What's Included & Policies</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">Free Cancellation:</strong> 100% free cancellation up to 24h before rental date.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">2 Sanitized Helmets:</strong> Clean and sanitized before every handover.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">Safety Inspected:</strong> Fully inspected for tires, brakes, and lights prior to delivery.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button 
                onClick={() => setActiveInfoModal(null)}
                className="w-full bg-black text-white font-bold py-3.5 rounded-2xl hover:bg-gray-800 transition-colors text-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
