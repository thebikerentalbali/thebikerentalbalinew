import React from "react"

export default function VendorLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 w-full touch-pan-y animate-pulse">
      {/* Cover Skeleton */}
      <div className="h-48 md:h-64 w-full bg-gray-200 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 flex items-center justify-between">
          <div className="w-10 h-10 bg-white rounded-full shadow-sm"></div>
          <div className="w-10 h-10 bg-white rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Header Info Skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-3xl -mt-10 p-6 md:p-8 shadow-sm border border-gray-100 mb-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-sm shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
              <div className="h-4 bg-gray-100 rounded-md w-1/3"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-50 rounded-2xl w-full max-w-sm"></div>
        </div>

        {/* Scooter Fleet Section Header */}
        <div className="h-6 bg-gray-200 rounded-lg w-44 mb-4"></div>

        {/* Scooter Fleet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="w-full h-40 bg-gray-100 rounded-2xl"></div>
              <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
              <div className="h-10 bg-gray-100 rounded-xl w-full mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
