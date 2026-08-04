"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function NavigationProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Reset when route completes changing
  useEffect(() => {
    setIsNavigating(false)
    setProgress(100)
    const timeout = setTimeout(() => {
      setProgress(0)
    }, 300)
    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  useEffect(() => {
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
          setIsNavigating(true)
          setProgress(25)
          setTimeout(() => setProgress(65), 150)
          setTimeout(() => setProgress(85), 400)
        }
      }
    }

    document.addEventListener("click", handleAnchorClick, { capture: true })
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true })
    }
  }, [])

  if (progress === 0 && !isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent overflow-hidden">
      <div
        className="h-full bg-black transition-all duration-300 ease-out shadow-[0_0_8px_rgba(0,0,0,0.6)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 150ms ease-out, opacity 300ms ease-in" : "width 300ms cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      />
    </div>
  )
}
