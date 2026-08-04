import React from "react"
import { ChevronLeft, Share2, Star } from "lucide-react"

export default function DetailLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 w-full touch-pan-y animate-pulse">
      {/* Mobile Layout Skeleton */}
      <div className="block md:hidden">
        {/* Cover Photo */}
        <div className="relative h-72 w-full bg-gray-200">
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="w-10 h-10 bg-white rounded-full shadow-sm"></div>
            <div className="w-10 h-10 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>

        {/* Content Sheet */}
        <div className="bg-white rounded-t-3xl -mt-6 p-6 space-y-6 relative z-10 shadow-sm">
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded-md w-24"></div>
            <div className="h-7 bg-gray-200 rounded-xl w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded-xl w-1/3 mt-2"></div>
          </div>

          <div className="h-20 bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/3"></div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
            <div className="h-14 bg-gray-100 rounded-2xl w-full"></div>
            <div className="h-14 bg-black rounded-2xl w-full mt-4"></div>
          </div>
        </div>
      </div>

      {/* Desktop Layout Skeleton */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="h-6 w-48 bg-gray-200 rounded-lg mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="h-96 bg-gray-100 rounded-2xl w-full"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
          </div>
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="h-8 bg-gray-200 rounded-xl w-3/4"></div>
            <div className="h-6 bg-gray-100 rounded-lg w-1/3"></div>
            <div className="h-32 bg-gray-50 rounded-2xl"></div>
            <div className="h-14 bg-black rounded-2xl w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
