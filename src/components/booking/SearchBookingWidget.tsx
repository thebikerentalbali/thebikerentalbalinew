"use client"

import { useState } from "react"
import { MapPin, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SearchBookingWidget() {
  const [pickupLocation, setPickupLocation] = useState("")
  const [returnLocation, setReturnLocation] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [returnDate, setReturnDate] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic
    console.log({ pickupLocation, returnLocation, pickupDate, returnDate })
  }

  return (
    <div className="glass-card rounded-3xl p-4 md:p-6 w-full shadow-2xl">
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-center">
        
        {/* Location Inputs */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Pickup Location"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#1A1A1A] border border-transparent rounded-2xl focus:border-[#10F580]/50 focus:ring-2 focus:ring-[#10F580] outline-none transition-all text-sm font-medium"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
            />
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Return Location (Optional)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#1A1A1A] border border-transparent rounded-2xl focus:border-[#10F580]/50 focus:ring-2 focus:ring-[#10F580] outline-none transition-all text-sm font-medium"
              value={returnLocation}
              onChange={(e) => setReturnLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Date Inputs */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
            </div>
            <input
              type="date"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#1A1A1A] border border-transparent rounded-2xl focus:border-[#10F580]/50 focus:ring-2 focus:ring-[#10F580] outline-none transition-all text-sm font-medium"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              required
            />
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
            </div>
            <input
              type="date"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#1A1A1A] border border-transparent rounded-2xl focus:border-[#10F580]/50 focus:ring-2 focus:ring-[#10F580] outline-none transition-all text-sm font-medium"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Search Button */}
        <Button 
          type="submit" 
          className="w-full lg:w-auto h-full min-h-[56px] px-8 rounded-2xl font-extrabold text-lg bg-[#10F580] text-black hover:bg-[#0be054] shadow-[0_4px_22px_rgba(16,245,128,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </Button>
        
      </form>
    </div>
  )
}
