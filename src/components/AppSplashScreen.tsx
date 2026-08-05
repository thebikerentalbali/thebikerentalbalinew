"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Non-blocking Background Prefetch Service
 * Warms routes during idle cycles without blocking FCP / LCP.
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
      try {
        router.prefetch("/checkout")
        router.prefetch("/about")
        router.prefetch("/how-it-works")
        router.prefetch("/faq")
        router.prefetch("/contact")
      } catch (e) {}
    })
  }, [router])

  return null
}

