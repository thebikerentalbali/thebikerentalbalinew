import React from "react"

export default function DetailLoading() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] pb-36 sm:py-8 w-full touch-pan-y animate-pulse pt-4">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Main Showcase Card Skeleton */}
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-sm border border-black/5">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="space-y-2">
              <div className="h-8 sm:h-9 bg-neutral-200 rounded-xl w-48 sm:w-64"></div>
              <div className="h-4 bg-neutral-200 rounded-lg w-28"></div>
            </div>
            <div className="flex gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-100 rounded-full"></div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-100 rounded-full"></div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-100 rounded-full"></div>
            </div>
          </div>

          {/* Vehicle Stage */}
          <div className="w-full h-[220px] sm:h-[280px] flex items-center justify-center my-4">
            <div className="w-60 h-44 sm:w-72 sm:h-52 bg-neutral-100 rounded-3xl"></div>
          </div>

          {/* Nav Arrows */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-neutral-100"></div>
            <div className="w-8 h-8 rounded-full bg-neutral-100"></div>
          </div>

          {/* Vendor Card Skeleton */}
          <div className="w-full h-14 bg-neutral-50 rounded-2xl sm:rounded-3xl border border-black/5"></div>
        </div>

        {/* Specifications Skeleton */}
        <div className="bg-white rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-sm border border-black/5 h-48"></div>

        {/* Inclusions Skeleton */}
        <div className="bg-white rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-sm border border-black/5 h-44"></div>

        {/* Requirements Skeleton */}
        <div className="bg-white rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-sm border border-black/5 h-44"></div>

      </div>
    </div>
  )
}
