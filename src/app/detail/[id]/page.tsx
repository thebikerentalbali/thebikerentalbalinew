"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronLeft, Heart, Star, MapPin, ChevronRight, Loader2 } from "lucide-react"
import { createClient } from '@/lib/supabase/client'

export default function DetailPage() {
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()
  
  const [scooter, setScooter] = useState<any>(null)
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen bg-[#EBECEF] w-full md:py-8">
      <div className="flex flex-col min-h-screen md:min-h-0 bg-[#EBECEF] relative pb-28 md:pb-0 md:max-w-5xl md:mx-auto md:shadow-2xl md:rounded-[40px] md:overflow-hidden md:border md:border-gray-200">
        {/* Header */}
        <header className="flex justify-between items-center p-6 pt-8 relative z-10">
          <Link href="/" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </Link>
          <h1 className="text-xl font-medium text-gray-900 absolute left-1/2 -translate-x-1/2">
            Scooter Detail
          </h1>
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-gray-800" />
          </button>
        </header>

        {/* Desktop Grid Layout */}
        <div className="flex flex-col md:grid md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_450px] md:gap-8 lg:gap-12 md:p-8">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col">
            {/* Main Hero Image */}
            <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center mt-4 mb-4 md:mb-6 md:bg-white/40 md:rounded-[32px]">
              <div 
                className="w-full h-full bg-contain bg-center bg-no-repeat drop-shadow-2xl scale-110 md:hover:scale-125 transition-transform duration-500"
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
          <div className="px-6 md:px-0 space-y-6 md:pb-8 flex flex-col justify-center">
          
          {/* Vendor Profile */}
          {vendor && (
            <Link href={`/vendor/${vendor.id}`} className="block bg-white rounded-3xl p-5 shadow-sm transition-transform active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={vendor.image_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"} alt={vendor.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-[15px]">{vendor.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{vendor.rating}</span>
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

          {/* Scooter Details */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{scooter.name} Details</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              The {scooter.name} ({scooter.brand}) is a premium choice for riding around Bali.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Available</span>
                <span className="font-medium text-[#E65100] text-sm">{scooter.available_units} Units</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Engine</span>
                <span className="font-medium text-gray-900 text-sm">{scooter.engine || '150cc'}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Year</span>
                <span className="font-medium text-gray-900 text-sm">{scooter.year || '2023'}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Fuel Capacity</span>
                <span className="font-medium text-gray-900 text-sm">{scooter.fuel_capacity || '7 Liters'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-500 text-sm">Transmission</span>
                <span className="font-medium text-gray-900 text-sm">{scooter.transmission || 'Automatic'}</span>
              </div>
            </div>
          </div>
          
          {/* Desktop Book Rent Button */}
          <div className="hidden md:flex items-center justify-between bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-6">
            <div className="flex flex-col">
              <span className="text-[13px] text-gray-500 font-medium">Rental Price</span>
              <div className="flex items-end mt-1">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">${scooter.price_daily}</span>
                <span className="text-[13px] text-gray-500 font-medium ml-1 mb-1">/Per Day</span>
              </div>
            </div>
            <Link href="/checkout" className="bg-black text-white px-8 py-4 rounded-full text-base font-semibold shadow-xl shadow-black/20 hover:scale-105 transition-transform">
              Book Rent
            </Link>
          </div>
        </div>

        </div>
      </div>
      
      {/* Bottom Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/70 backdrop-blur-xl rounded-t-[40px] px-8 py-5 flex items-center justify-between shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border-t border-white/50 pb-8 sm:pb-5">
        <div className="flex items-end">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">${scooter.price_daily}</span>
          <span className="text-[13px] text-gray-500 font-medium ml-1 mb-1.5">/Per Day</span>
        </div>
        
        <Link href="/checkout" className="bg-black text-white px-8 py-4 rounded-full text-base font-semibold shadow-xl shadow-black/20 hover:scale-105 transition-transform">
          Book Rent
        </Link>
      </div>

    </div>
  )
}
