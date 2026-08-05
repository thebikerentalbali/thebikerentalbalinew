"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import TransparentLoader from "@/components/TransparentLoader"

export default function NavigationProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fast reset when route changes
  useEffect(() => {
    setIsNavigating(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [pathname, searchParams])

  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true)
      // Fast sub-second auto-dismiss: caps maximum loading overlay display to 600ms
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false)
        timeoutRef.current = null
      }, 600)
    }

    const handleStop = () => {
      setIsNavigating(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      const targetAttr = target.getAttribute("target")

      // Skip external links or same-page hashes or new tabs
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || targetAttr === "_blank") {
        return
      }

      // Check if internal route
      if (href.startsWith("/") || href.startsWith(window.location.origin)) {
        const currentUrl = window.location.pathname + window.location.search
        const targetUrl = href.replace(window.location.origin, "")

        if (currentUrl !== targetUrl) {
          handleStart()
        }
      }
    }

    window.addEventListener("app:start-loading", handleStart)
    window.addEventListener("app:stop-loading", handleStop)
    document.addEventListener("click", handleAnchorClick, { capture: true })

    return () => {
      window.removeEventListener("app:start-loading", handleStart)
      window.removeEventListener("app:stop-loading", handleStop)
      document.removeEventListener("click", handleAnchorClick, { capture: true })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!isNavigating) return null

  return <TransparentLoader />
}
