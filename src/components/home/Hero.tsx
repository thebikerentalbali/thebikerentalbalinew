"use client"

import { SearchBookingWidget } from "@/components/booking/SearchBookingWidget"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden">
      {/* Background Image / Placeholder (We will use a generic grey/dark background for now until image is provided) */}
      <div className="absolute inset-0 bg-black z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1629239846067-170f3f221be2?q=80&w=2940&auto=format&fit=crop")' }}
        />
      </div>

      <div className="container relative z-20 mx-auto px-4 md:px-8 h-full flex flex-col justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-white tracking-tighter mb-6 leading-[1.1]">
            Find Your <br/> <span className="text-[#10F580] drop-shadow-[0_0_35px_rgba(16,245,128,0.45)]">Perfect Ride</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-medium max-w-2xl mx-auto">
            Premium scooter rental in Bali. Experience the island with our luxury fleet, delivered directly to your door.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-5xl"
        >
          <SearchBookingWidget />
        </motion.div>
      </div>
    </section>
  )
}
