"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchCatalogData } from "@/lib/api/catalogService"

/**
 * Non-blocking Background Prefetch & Warming Service
 * Warms routes and catalog data during idle cycles without blocking FCP / LCP.
 */
export default function AppSplashScreen() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return

    const scheduleIdleTask = (callback: () => void) => {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(callback, { timeout: 4000 })
      } else {
        setTimeout(callback, 3500)
      }
    }

    scheduleIdleTask(() => {
      // 1. Prefetch core routes in the background
      try {
        router.prefetch("/checkout")
        router.prefetch("/about")
        router.prefetch("/how-it-works")
        router.prefetch("/faq")
        router.prefetch("/contact")
      } catch (e) {}

      // 2. Warm catalog cache in background if not already populated
      fetchCatalogData().catch(() => {})
    })
  }, [router])

  // Zero render-blocking DOM elements for instant 0ms FCP/LCP
  return null
}

