"use client"

import { useState, useEffect } from "react"
import { Download, Smartphone, X, Check, Share2, Sparkles, ExternalLink } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

export default function VendorPWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Check if already running as standalone PWA
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Check platform
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    const isAndroidDevice = /android/i.test(userAgent)
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream

    setIsAndroid(isAndroidDevice)
    setIsIOS(isIOSDevice)

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem('tbrb_pwa_banner_dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === 'accepted') {
          setIsInstalled(true)
          setIsInstallable(false)
          setDeferredPrompt(null)
        }
      } catch (err) {
        console.error("PWA install error:", err)
        setShowInstructionsModal(true)
      }
    } else {
      // If prompt is not available, show guide modal
      setShowInstructionsModal(true)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('tbrb_pwa_banner_dismissed', 'true')
  }

  if (isInstalled) return null

  return (
    <>
      {/* Floating Bottom / Header Install Pill for Android & Mobile */}
      {!isDismissed && (
        <aside 
          aria-label="App Installation Prompt" 
          className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-[420px] bg-black text-white p-4 rounded-2xl shadow-2xl border border-neutral-800 z-50 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-[2px] shrink-0 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[13px] font-bold text-white tracking-tight truncate">
                  Vendor Portal App
                </h2>
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded">
                  Android APK / PWA
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
                Install on your Android home screen for instant booking alerts and offline access.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-white text-black hover:bg-neutral-200 active:scale-95 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{deferredPrompt ? "Install App (Android)" : "Download App"}</span>
                </button>

                <button
                  onClick={() => setShowInstructionsModal(true)}
                  className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold py-2 px-3 rounded-xl border border-neutral-800 transition-colors cursor-pointer"
                >
                  Guide
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-neutral-500 hover:text-white p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Manual Step-by-Step Android / iOS Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-[28px] max-w-md w-full p-6 text-white shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-900 border border-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">Install Vendor App</h3>
                <p className="text-xs text-neutral-400">The Bike Rental Bali • Android PWA</p>
              </div>
            </div>

            {isAndroid ? (
              /* Android Chrome Instructions */
              <div className="space-y-3.5 text-xs text-neutral-300">
                <p className="text-neutral-400">
                  Follow these 3 quick steps in Google Chrome or Samsung Internet:
                </p>
                <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center text-xs shrink-0">1</span>
                  <div>
                    <p className="font-bold text-white">Tap the Chrome Menu</p>
                    <p className="text-neutral-400 mt-0.5">Tap the three vertical dots <strong>(⋮)</strong> in the top-right corner of your browser.</p>
                  </div>
                </div>

                <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center text-xs shrink-0">2</span>
                  <div>
                    <p className="font-bold text-white">Select "Install App" or "Add to Home Screen"</p>
                    <p className="text-neutral-400 mt-0.5">Choose <strong>Install app</strong> from the menu options.</p>
                  </div>
                </div>

                <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center text-xs shrink-0">3</span>
                  <div>
                    <p className="font-bold text-white">Confirm Installation</p>
                    <p className="text-neutral-400 mt-0.5">Tap <strong>Install</strong> to add the Vendor Portal directly to your Android apps drawer and home screen.</p>
                  </div>
                </div>
              </div>
            ) : isIOS ? (
              /* iOS Safari Instructions */
              <div className="space-y-3.5 text-xs text-neutral-300">
                <p className="text-neutral-400">To install on iPhone / iPad using Safari:</p>
                <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs shrink-0">1</span>
                  <div>
                    <p className="font-bold text-white">Tap Share Button</p>
                    <p className="text-neutral-400 mt-0.5">Tap the <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> Share icon at the bottom of Safari.</p>
                  </div>
                </div>

                <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs shrink-0">2</span>
                  <div>
                    <p className="font-bold text-white">Add to Home Screen</p>
                    <p className="text-neutral-400 mt-0.5">Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop Chrome Instructions */
              <div className="space-y-3.5 text-xs text-neutral-300">
                <p className="text-neutral-400">To install on Desktop or Android:</p>
                <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs shrink-0">1</span>
                  <div>
                    <p className="font-bold text-white">Look for Install Icon in Address Bar</p>
                    <p className="text-neutral-400 mt-0.5">Click the computer/download icon on the right side of the Chrome URL bar.</p>
                  </div>
                </div>
              </div>
            )}

            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full mt-5 bg-amber-400 hover:bg-amber-300 text-black font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Launch Android Install Prompt</span>
              </button>
            )}

            <button
              onClick={() => setShowInstructionsModal(false)}
              className="w-full mt-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2.5 rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Got It, Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
