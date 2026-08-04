import React from "react"
import { ChevronLeft, Bell } from "lucide-react"

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white pb-24 touch-pan-y">
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-6 min-h-screen flex flex-col">
        {/* Header */}
        <header className="relative flex items-center justify-between mb-8">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <ChevronLeft className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl font-bold text-white absolute left-1/2 -translate-x-1/2">
            Checkout
          </h1>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Bell className="w-5 h-5 text-gray-800" />
          </div>
        </header>

        {/* Skeleton Content */}
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 flex-1 animate-pulse">
          {/* Left Column */}
          <div className="flex flex-col gap-6 mb-6">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl shrink-0"></div>
                <div className="flex-1 space-y-2.5">
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-1/2 mt-2"></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded-md w-1/4"></div>
                <div className="h-11 bg-gray-100 rounded-xl w-full"></div>
                <div className="h-12 bg-gray-50 rounded-xl w-full mt-2"></div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="h-5 bg-gray-200 rounded-lg w-1/3"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-gray-100 rounded-xl"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
              </div>
              <div className="h-12 bg-gray-100 rounded-xl"></div>
              <div className="h-12 bg-gray-100 rounded-xl"></div>
              <div className="h-14 bg-gray-200 rounded-2xl w-full mt-4"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
