import React from "react"

export default function DetailLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 w-full touch-pan-y animate-pulse py-4 sm:py-6 md:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Main Showcase Card Skeleton */}
        <div className="bg-[#F8F9FA] rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200/80 mb-6">
          
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200"></div>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200"></div>
          </div>

          {/* Vendor Card Skeleton */}
          <div className="w-full h-16 bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80"></div>
        </div>

        {/* Rates Section Skeleton */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 mb-6 h-48"></div>

        {/* Specifications Skeleton */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 mb-6 h-52"></div>

        {/* Requirements Button Skeleton */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 mb-8 h-20"></div>

      </div>
    </div>
  )
}
