import React from "react"

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 w-full animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="flex items-center justify-between mb-8">
          <div className="w-10 h-10 bg-white rounded-full shadow-sm"></div>
          <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
          <div className="w-10 h-10 bg-white rounded-full shadow-sm"></div>
        </div>

        {/* Hero / Banner Skeleton */}
        <div className="w-full h-48 md:h-64 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-end gap-3 mb-8">
          <div className="h-7 bg-gray-200 rounded-xl w-2/3 md:w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded-lg w-1/2 md:w-1/4"></div>
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
