"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function AppSplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    let minTimer: NodeJS.Timeout
    let exitTimer: NodeJS.Timeout

    const handleReady = () => {
      // Allow a brief minimum presentation time for a silky-smooth app launch experience
      minTimer = setTimeout(() => {
        setIsFadingOut(true)
        exitTimer = setTimeout(() => {
          setIsVisible(false)
        }, 500)
      }, 700)
    }

    if (document.readyState === "complete") {
      handleReady()
    } else {
      window.addEventListener("load", handleReady)
    }

    return () => {
      window.removeEventListener("load", handleReady)
      clearTimeout(minTimer)
      clearTimeout(exitTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      id="app-splash-screen"
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#000000] select-none transition-all duration-500 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Centered Brand Favicon Logo with Pulse & Elevation */}
      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#111111] p-3.5 shadow-2xl border border-white/10 flex items-center justify-center overflow-hidden animate-pulse">
          {/* Subtle reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="THE BIKE RENTAL BALI"
            className="w-full h-full object-contain drop-shadow-md"
            onError={(e) => {
              // Fallback to icon-512x512 if needed
              (e.target as HTMLImageElement).src = "/icons/icon-512x512.png"
            }}
          />
        </div>

        {/* Brand Title & Sleek Animated Loader Bar */}
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-[0.2em] uppercase font-sans">
            THE BIKE RENTAL BALI
          </h2>
          
          {/* Minimalist Loading Bar */}
          <div className="w-32 h-[3px] bg-white/10 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 rounded-full animate-[loadingBar_1.2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
