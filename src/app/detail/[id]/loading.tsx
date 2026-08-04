import React from "react"
import { ChevronLeft, Share2, Heart } from "lucide-react"

export default function DetailLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 w-full touch-pan-y animate-pulse py-4 sm:py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Skeleton */}
        <header className="flex flex-col gap-3 py-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-white rounded-full border border-gray-100 shadow-sm flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </div>
            <div className="hidden sm:block h-4 bg-gray-200 rounded-md w-48"></div>
            <div className="flex items-center gap-2">
              <div className="w-11 h-11 bg-white rounded-full border border-gray-100 shadow-sm"></div>
              <div className="w-11 h-11 bg-white rounded-full border border-gray-100 shadow-sm"></div>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <div className="h-4 bg-gray-200 rounded-full w-32"></div>
            <div className="h-8 bg-gray-200 rounded-xl w-3/4 sm:w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded-md w-64"></div>
          </div>
        </header>

        {/* Responsive Grid Skeleton */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1.55fr_1fr] gap-6 md:gap-8 items-start">
          
          {/* Left Column */}
          <div className="w-full space-y-6">
            <div className="w-full h-[320px] sm:h-[380px] md:h-[430px] bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex items-center justify-center">
              <div className="w-48 h-48 bg-gray-100 rounded-2xl"></div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="h-5 bg-gray-200 rounded w-40"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-16 bg-gray-50 rounded-2xl"></div>
                <div className="h-16 bg-gray-50 rounded-2xl"></div>
                <div className="h-16 bg-gray-50 rounded-2xl"></div>
                <div className="h-16 bg-gray-50 rounded-2xl"></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <div className="h-5 bg-gray-200 rounded w-36"></div>
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              <div className="h-4 bg-gray-100 rounded w-4/6"></div>
            </div>
          </div>

          {/* Right Column Sticky Card */}
          <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
            <div className="h-8 bg-gray-200 rounded-xl w-1/2"></div>
            <div className="h-12 bg-gray-50 rounded-2xl w-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </div>
            <div className="h-14 bg-black/10 rounded-2xl w-full"></div>
          </div>

        </div>

      </div>
    </div>
  )
}
