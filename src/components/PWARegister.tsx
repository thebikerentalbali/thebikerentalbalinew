"use client"

import { useEffect } from "react"

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Only activate service worker for partner portal to avoid interfering with consumer latency
      if (window.location.pathname.startsWith('/partnerportal')) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js", { scope: "/partnerportal" })
            .then((registration) => {
              console.log("PWA Service Worker registered for partner portal:", registration.scope)
            })
            .catch((error) => {
              console.warn("PWA Service Worker registration failed:", error)
            })
        })
      }
    }
  }, [])

  return null
}
