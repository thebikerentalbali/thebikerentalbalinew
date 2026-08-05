import React from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

export default function DetailLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 w-full touch-pan-y animate-pulse py-4 sm:py-6 md:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Main Showcase Card Skeleton */}
        <div className="bg-[#F8F9FA] rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200/80 mb-8">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="space-y-2">
              <div className="h-8 sm:h-9 bg-gray-200 rounded-xl w-48 sm:w-64"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-20"></div>
            </div>
            <div className="w-10 h-10 bg-white rounded-full border border-gray-200"></div>
          </div>

          {/* Vehicle Stage */}
          <div className="w-full h-[230px] sm:h-[300px] md:h-[340px] flex items-center justify-center my-4">
            <div className="w-60 h-44 sm:w-80 sm:h-56 bg-gray-200/70 rounded-3xl"></div>
          </div>

          {/* Nav Arrows */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200"></div>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200"></div>
          </div>

          {/* Custom Scooter Title & Price */}
          <div className="flex items-baseline justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded-lg w-36"></div>
            <div className="h-7 bg-gray-200 rounded-lg w-32"></div>
          </div>

          {/* Duration Pills */}
          <div className="h-10 bg-gray-200/70 rounded-2xl mb-6"></div>

          {/* 2x2 Customization Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="h-16 bg-gray-200/60 rounded-2xl"></div>
            <div className="h-16 bg-gray-200/60 rounded-2xl"></div>
            <div className="h-16 bg-gray-200/60 rounded-2xl"></div>
            <div className="h-16 bg-gray-200/60 rounded-2xl"></div>
          </div>

          {/* Rent Button */}
          <div className="h-14 bg-gray-300 rounded-2xl sm:rounded-3xl w-full"></div>
        </div>

        {/* Supporting details skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 h-64"></div>
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 h-64"></div>
        </div>

      </div>
    </div>
  )
}
