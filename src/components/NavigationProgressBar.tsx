"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import TransparentLoader from "@/components/TransparentLoader"

export default function NavigationProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset when route completes changing
  useEffect(() => {
    setIsNavigating(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true)
      // Safety timeout: auto-hide after 5 seconds if navigation takes too long or cancels
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false)
      }, 5000)
    }

    const handleStop = () => {
      setIsNavigating(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
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
