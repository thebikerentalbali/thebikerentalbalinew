"use client"

import Link from "next/link"
import { ChevronLeft, Heart, Star, MapPin, ChevronRight } from "lucide-react"

export default function DetailPage() {
  return (
    <div className="min-h-screen bg-[#EBECEF] w-full md:py-8">
      <div className="flex flex-col min-h-screen md:min-h-0 bg-[#EBECEF] relative pb-28 md:max-w-xl md:mx-auto md:shadow-2xl md:rounded-[40px] md:overflow-hidden md:border md:border-gray-200">
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

        {/* Hero Image */}
        <div className="relative w-full h-[300px] flex items-center justify-center mt-4 mb-8">
          <div 
            className="w-full h-full bg-contain bg-center bg-no-repeat drop-shadow-2xl scale-110"
            style={{ backgroundImage: 'url("/images/scooter.png")' }}
          />
        </div>

        {/* Vendor & Details */}
        <div className="px-6 space-y-6">
          
          {/* Vendor Profile */}
          <Link href="/vendor/1" className="block bg-white rounded-3xl p-5 shadow-sm transition-transform active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" alt="Vendor" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-[15px]">Putu Rentals</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">4.9</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 border-l border-gray-200 pl-2 max-w-[120px]">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="text-[13px] truncate">Jl. Monkey Forest No. 12, Ubud</span>
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          {/* Scooter Details */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scooter Details</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              The Vespa Primavera is a modern classic, offering a smooth and stylish ride around Bali. Perfect for navigating both city streets and coastal roads with ease.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Available</span>
                <span className="font-medium text-[#E65100] text-sm">5 Units</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Engine</span>
                <span className="font-medium text-gray-900 text-sm">150cc</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Year</span>
                <span className="font-medium text-gray-900 text-sm">2023</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Fuel Capacity</span>
                <span className="font-medium text-gray-900 text-sm">7 Liters</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-500 text-sm">Transmission</span>
                <span className="font-medium text-gray-900 text-sm">Automatic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/70 backdrop-blur-xl rounded-t-[40px] px-8 py-5 flex items-center justify-between shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border-t border-white/50 pb-8 sm:pb-5 md:absolute md:max-w-none md:rounded-none md:bg-white md:backdrop-blur-none md:border-none">
          <div className="flex items-end">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">$25</span>
            <span className="text-[13px] text-gray-500 font-medium ml-1 mb-1.5">/Per Day</span>
          </div>
          
          <Link href="/checkout" className="bg-black text-white px-8 py-4 rounded-full text-base font-semibold shadow-xl shadow-black/20 hover:scale-105 transition-transform">
            Book Rent
          </Link>
        </div>
      </div>
    </div>
  )
}
