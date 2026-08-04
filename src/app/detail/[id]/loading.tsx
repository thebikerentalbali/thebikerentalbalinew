import React from "react"
import { ChevronLeft, Heart } from "lucide-react"

export default function DetailLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 w-full touch-pan-y animate-pulse py-4 sm:py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Skeleton */}
        <header className="flex justify-between items-center py-3 mb-4 sm:mb-6">
          <div className="w-11 h-11 bg-white rounded-full border border-gray-100 shadow-sm flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </div>
          <div className="h-5 bg-gray-200 rounded-md w-36"></div>
          <div className="w-11 h-11 bg-white rounded-full border border-gray-100 shadow-sm flex items-center justify-center">
            <Heart className="w-5 h-5 text-gray-300" />
          </div>
        </header>

        {/* Responsive Grid Skeleton */}
        <div className="flex flex-col md:grid md:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.15fr_1fr] gap-6 md:gap-8 lg:gap-10">
          
          {/* Left Column */}
          <div className="flex flex-col space-y-4">
            <div className="w-full h-[320px] sm:h-[380px] md:h-[450px] bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 flex items-center justify-center">
              <div className="w-48 h-48 bg-gray-100 rounded-2xl"></div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200"></div>
              <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200"></div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm h-24"></div>
            <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="h-16 bg-gray-50 rounded-2xl"></div>
              <div className="h-20 bg-gray-50 rounded-2xl"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-14 bg-gray-50 rounded-xl"></div>
                <div className="h-14 bg-gray-50 rounded-xl"></div>
              </div>
            </div>
            <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm h-40"></div>
            <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm h-40"></div>
          </div>

        </div>

      </div>
    </div>
  )
}
