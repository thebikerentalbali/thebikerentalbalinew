"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchCatalogData } from "@/lib/api/catalogService"
import { clientCache } from "@/lib/cache/clientCache"

export default function AppSplashScreen() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    let minTimer: NodeJS.Timeout
    let exitTimer: NodeJS.Timeout
    let safetyTimer: NodeJS.Timeout
    let isDone = false

    const completeSplash = () => {
      if (isDone) return
      isDone = true

      setIsFadingOut(true)
      exitTimer = setTimeout(() => {
        setIsVisible(false)
      }, 450)
    }

    async function smartPreloadEverything() {
      const startTime = Date.now()

      try {
        // 1. Fetch & warm full catalog in background cache
        const catalogPromise = fetchCatalogData().catch(() => null)

        // 2. Wait for fonts to be ready
        const fontsPromise = (document as any).fonts?.ready || Promise.resolve()

        // 3. Wait for DOM ready
        const domPromise = new Promise<void>((resolve) => {
          if (document.readyState === "complete") {
            resolve()
          } else {
            window.addEventListener("load", () => resolve(), { once: true })
          }
        })

        // 4. Prefetch core routes in Next.js router
        try {
          router.prefetch("/checkout")
          router.prefetch("/about")
          router.prefetch("/how-it-works")
          router.prefetch("/faq")
          router.prefetch("/contact")
        } catch (e) {}

        // Wait for core data + DOM + fonts
        const [catalog] = await Promise.allSettled([catalogPromise, fontsPromise, domPromise])

        // 5. Preload critical images into browser image cache
        const catalogData = (catalog.status === "fulfilled" ? catalog.value : null) || clientCache.get<any>("catalog_data")
        const imagePromises: Promise<void>[] = []

        if (catalogData?.scooters && Array.isArray(catalogData.scooters)) {
          const topScooters = catalogData.scooters.slice(0, 8)
          topScooters.forEach((s: any) => {
            const imgUrl = s.image_url || s.img
            if (imgUrl && typeof imgUrl === "string" && !imgUrl.startsWith("data:")) {
              const p = new Promise<void>((res) => {
                const img = new window.Image()
                img.src = imgUrl
                img.onload = () => res()
                img.onerror = () => res()
              })
              imagePromises.push(p)
            }
          })
        }

        if (catalogData?.vendors && Array.isArray(catalogData.vendors)) {
          const topVendors = catalogData.vendors.slice(0, 6)
          topVendors.forEach((v: any) => {
            if (v.logo && typeof v.logo === "string" && !v.logo.startsWith("data:")) {
              const p = new Promise<void>((res) => {
                const img = new window.Image()
                img.src = v.logo
                img.onload = () => res()
                img.onerror = () => res()
              })
              imagePromises.push(p)
            }
          })
        }

        // Wait up to 1000ms for images to warm
        await Promise.race([
          Promise.allSettled(imagePromises),
          new Promise((res) => setTimeout(res, 1000))
        ])

      } catch (err) {
        console.error("Smart preload error:", err)
      } finally {
        // Ensure a pleasant minimum presentation of 600ms so there's no visual flicker
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 600 - elapsed)
        minTimer = setTimeout(completeSplash, remaining)
      }
    }

    // Safety timeout: Never block the user for more than 2.2s even on slow 2G
    safetyTimer = setTimeout(completeSplash, 2200)

    smartPreloadEverything()

    return () => {
      clearTimeout(minTimer)
      clearTimeout(exitTimer)
      clearTimeout(safetyTimer)
    }
  }, [router])

  if (!isVisible) return null

  return (
    <div
      id="app-splash-screen"
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#000000] select-none transition-all duration-500 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none scale-102" : "opacity-100 scale-100"
      }`}
    >
      {/* Centered Clean Floating Brand Logo (No box, No card, No white corners) */}
      <div className="relative flex flex-col items-center gap-7 z-10 px-6">
        <div className="relative w-52 sm:w-60 md:w-68 flex items-center justify-center animate-pulse">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="THE BIKE RENTAL BALI"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* Minimalist Animated Progress Accent Bar */}
        <div className="w-28 sm:w-36 h-[2.5px] bg-white/10 rounded-full overflow-hidden relative mt-1">
          <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 rounded-full animate-[splashLoading_1.1s_ease-in-out_infinite]" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes splashLoading {
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
