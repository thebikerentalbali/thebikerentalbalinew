"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Bell, Star, MapPin, Map, Info, Minus, Plus, PlusCircle, X, Trash2, Loader2, Store } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { fetchCatalogData, fetchScooterDetail } from '@/lib/api/catalogService'
import { clientCache } from '@/lib/cache/clientCache'
import { subscribeToPlatformSettings } from '@/utils/pricing'
import { addSavedBookings } from '@/utils/myBookings'

export default function CheckoutPage() {
  const router = useRouter()
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup")
  const [helmets, setHelmets] = useState<number>(1)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [agreedToFee, setAgreedToFee] = useState(false)

  const handleBack = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    if (typeof window !== 'undefined') {
      if (window.history.length <= 2) {
        router.push('/')
      } else {
        router.back()
      }
    } else {
      router.push('/')
    }
  }

  // Helper date formatting
  const formatIsoDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDaysFromCart = (cartItems: any[]) => {
    if (!cartItems || cartItems.length === 0) return 1
    const item = cartItems[0]
    if (item.durationMode === "weekly") return (item.durationCount || 1) * 7
    if (item.durationMode === "monthly") return (item.durationCount || 1) * 30
    return item.durationCount || 1
  }

  const addDaysToDate = (dateStr: string, days: number) => {
    if (!dateStr) return ""
    const [y, m, d] = dateStr.split('-').map(Number)
    if (!y || !m || !d) return ""
    const date = new Date(y, m - 1, d)
    date.setDate(date.getDate() + days)
    return formatIsoDate(date)
  }

  const [startDate, setStartDate] = useState(() => formatIsoDate(new Date()))
  const [endDate, setEndDate] = useState(() => addDaysToDate(formatIsoDate(new Date()), 1))
  const [startTime, setStartTime] = useState("09:00")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    setStartTime(`${hh}:${mm}`)
  }, [])

  const [cart, setCart] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search)
        const sId = params.get("scooterId")

        // 1. Instant sessionStorage prefill from "Rent Now" click
        const prefillStr = sessionStorage.getItem("checkout_prefill")
        if (prefillStr) {
          const prefill = JSON.parse(prefillStr)
          if (prefill?.scooter && (!sId || String(prefill.scooter.id) === String(sId))) {
            const s = prefill.scooter
            return [{
              ...s,
              img: s.image_url || s.img || "/images/scooter.png",
              rating: 5.0,
              available: s.available_units || 1,
              daily: s.price_daily || s.daily || 0,
              weekly: s.price_weekly || s.weekly || 0,
              monthly: s.price_monthly || s.monthly || 0,
              quantity: 1,
              durationMode: "daily",
              durationCount: 1
            }]
          }
        }

        // 2. ClientCache single scooter
        if (sId) {
          const singleCached = clientCache.get<any>(`scooter_${sId}`)
          if (singleCached?.scooter) {
            const s = singleCached.scooter
            return [{
              ...s,
              img: s.image_url || s.img || "/images/scooter.png",
              rating: 5.0,
              available: s.available_units || 1,
              daily: s.price_daily || s.daily || 0,
              weekly: s.price_weekly || s.weekly || 0,
              monthly: s.price_monthly || s.monthly || 0,
              quantity: 1,
              durationMode: "daily",
              durationCount: 1
            }]
          }
        }

        // 3. ClientCache full catalog
        const cached = clientCache.get<any>('catalog') || clientCache.get<any>('catalog_data')
        if (sId && cached?.scooters) {
          const selected = cached.scooters.find((s: any) => s.id.toString() === sId)
          if (selected) {
            return [{
              ...selected,
              img: selected.image_url || selected.img || "/images/scooter.png",
              rating: 5.0,
              available: selected.available_units || 1,
              daily: selected.price_daily || 0,
              weekly: selected.price_weekly || 0,
              monthly: selected.price_monthly || 0,
              quantity: 1,
              durationMode: "daily",
              durationCount: 1
            }]
          }
        }
      } catch (e) {}
    }
    return []
  })

  const [vendors, setVendors] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const prefillStr = sessionStorage.getItem("checkout_prefill")
        if (prefillStr) {
          const prefill = JSON.parse(prefillStr)
          if (prefill?.vendor) return [prefill.vendor]
        }
      } catch (e) {}
      const cached = clientCache.get<any>('catalog') || clientCache.get<any>('catalog_data')
      return cached?.vendors || []
    }
    return []
  })

  const [vendorScooters, setVendorScooters] = useState<any[]>(() => {
    const cached = typeof window !== 'undefined' ? (clientCache.get<any>('catalog') || clientCache.get<any>('catalog_data')) : null
    if (cached?.scooters) {
      return cached.scooters.map((s: any) => ({
        ...s,
        img: s.image_url || s.img || "/images/scooter.png",
        rating: 5.0,
        available: s.available_units,
        daily: s.price_daily,
        weekly: s.price_weekly,
        monthly: s.price_monthly
      }))
    }
    return []
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [isResolvingScooter, setIsResolvingScooter] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search)
        const sId = params.get("scooterId")
        if (!sId) return false
        const prefillStr = sessionStorage.getItem("checkout_prefill")
        if (prefillStr) {
          const prefill = JSON.parse(prefillStr)
          if (prefill?.scooter && String(prefill.scooter.id) === String(sId)) return false
        }
        if (clientCache.get<any>(`scooter_${sId}`)) return false
        const cached = clientCache.get<any>('catalog') || clientCache.get<any>('catalog_data')
        if (cached?.scooters?.some((s: any) => s.id.toString() === sId)) return false
        return true
      } catch (e) {}
    }
    return false
  })
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Find the vendor of the currently selected scooter(s) in the booking cart
  const activeVendorId = cart[0]?.vendor_id
  const activeVendor = useMemo(() => {
    if (!activeVendorId) return null
    return vendors.find((v: any) => String(v.id) === String(activeVendorId))
  }, [vendors, activeVendorId])

  // Filter available scooters to ONLY show those belonging to the active vendor
  const relatedVendorScooters = useMemo(() => {
    if (!activeVendorId) return vendorScooters
    return vendorScooters.filter((s: any) => String(s.vendor_id) === String(activeVendorId))
  }, [vendorScooters, activeVendorId])

  useEffect(() => {
    const today = formatIsoDate(new Date())
    setStartDate(prev => prev || today)

    let isMounted = true

    async function loadData(forceRefresh = false) {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const sId = params?.get("scooterId")

      // Fast single scooter fetch if cart is empty and sId provided
      if (sId && cart.length === 0) {
        fetchScooterDetail(sId).then((data) => {
          if (!isMounted || !data?.scooter) return
          const s = data.scooter
          const formatted = {
            ...s,
            img: s.image_url || s.img || "/images/scooter.png",
            rating: 5.0,
            available: s.available_units || 1,
            daily: s.price_daily || s.daily || 0,
            weekly: s.price_weekly || s.weekly || 0,
            monthly: s.price_monthly || s.monthly || 0,
            quantity: 1,
            durationMode: "daily",
            durationCount: 1
          }
          setCart([formatted])
          if (data.vendor) {
            setVendors(prev => prev.some(v => String(v.id) === String(data.vendor.id)) ? prev : [data.vendor, ...prev])
          }
          setIsResolvingScooter(false)
          setLoading(false)
        }).catch(() => {
          if (isMounted) setIsResolvingScooter(false)
        })
      }

      try {
        const catalog = await fetchCatalogData({ forceRefresh })
        if (!isMounted) return

        if (catalog?.vendors) {
          setVendors(catalog.vendors)
        }
        if (catalog?.scooters) {
          const formatted = catalog.scooters.map((s: any) => ({
            ...s,
            img: s.image_url || s.img || "/images/scooter.png",
            rating: 5.0,
            available: s.available_units,
            daily: s.price_daily,
            weekly: s.price_weekly,
            monthly: s.price_monthly
          }))
          setVendorScooters(formatted)

          if (sId) {
            const selected = formatted.find((s: any) => s.id.toString() === sId)
            if (selected) {
              setCart(prev => {
                if (prev.length === 0) {
                  const initialCart = [{ ...selected, quantity: 1, durationMode: "daily", durationCount: 1 }]
                  const days = getDaysFromCart(initialCart)
                  setEndDate(addDaysToDate(today, days))
                  return initialCart
                }
                return prev
              })
            }
          } else {
            setEndDate(prev => prev || addDaysToDate(today, 1))
          }
        }
      } catch (err) {
        console.error("Failed to load scooters in checkout:", err)
      } finally {
        if (isMounted) {
          setIsResolvingScooter(false)
          setLoading(false)
        }
      }
    }
    
    loadData()

    let unsubscribe: (() => void) | null = null
    const scheduleIdle = (cb: () => void) => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(cb, { timeout: 3500 })
      } else {
        setTimeout(cb, 3000)
      }
    }

    scheduleIdle(() => {
      unsubscribe = subscribeToPlatformSettings(() => {
        loadData(true)
      })
    })

    return () => {
      isMounted = false
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart)
    if (newStart) {
      const days = getDaysFromCart(cart)
      setEndDate(addDaysToDate(newStart, days))
    }
  }

  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd)
    if (startDate && newEnd) {
      const [sy, sm, sd] = startDate.split('-').map(Number)
      const [ey, em, ed] = newEnd.split('-').map(Number)
      const s = new Date(sy, sm - 1, sd)
      const e = new Date(ey, em - 1, ed)
      const diffTime = e.getTime() - s.getTime()
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)))
      if (diffDays > 0) {
        setCart(prev => prev.map(item => ({
          ...item,
          durationMode: "daily",
          durationCount: diffDays
        })))
      }
    }
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta
        return { ...item, quantity: Math.max(1, Math.min(newQ, item.available)) }
      }
      return item
    }))
  }

  const updateDurationMode = (id: number, mode: "daily" | "weekly" | "monthly") => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, durationMode: mode, durationCount: 1 } : item
      )
      if (startDate) {
        const days = getDaysFromCart(updated)
        setEndDate(addDaysToDate(startDate, days))
      }
      return updated
    })
  }

  const updateDurationCount = (id: number, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, durationCount: Math.max(1, item.durationCount + delta) } : item
      )
      if (startDate) {
        const days = getDaysFromCart(updated)
        setEndDate(addDaysToDate(startDate, days))
      }
      return updated
    })
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const addToCart = (scooter: any) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === scooter.id)
      let updated
      if (exists) {
        updated = prev.map(i => i.id === scooter.id ? { ...i, quantity: i.quantity + 1 } : i)
      } else {
        updated = [...prev, { ...scooter, quantity: 1, durationMode: "daily", durationCount: 1 }]
      }
      if (startDate) {
        const days = getDaysFromCart(updated)
        setEndDate(addDaysToDate(startDate, days))
      }
      return updated
    })
    setShowAddModal(false)
  }

  const getTotalPrice = () => {
    let total = 0
    cart.forEach(item => {
      let base = item.daily
      if (item.durationMode === "weekly") base = item.weekly
      if (item.durationMode === "monthly") base = item.monthly
      total += base * item.quantity * item.durationCount
    })
    return total
  }

  const getWhatsAppLink = () => {
    const firstVendor = cart[0]?.vendors
    const vendorName = firstVendor?.name || "The Bike Rental Bali"
    let targetPhone = firstVendor?.phone ? firstVendor.phone.replace(/[^0-9]/g, '') : "6285174119423"
    if (targetPhone.startsWith('0')) targetPhone = '62' + targetPhone.slice(1)
    if (!targetPhone.startsWith('62') && targetPhone.length > 5) targetPhone = '62' + targetPhone

    const formatDisplayDate = (dateStr: string) => {
      if (!dateStr) return ""
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
      const [y, m, d] = dateStr.split('-')
      if (!y || !m || !d) return dateStr
      const monthIdx = parseInt(m, 10) - 1
      const monthName = months[monthIdx] || m
      return `${y}-${monthName}-${d.padStart(2, '0')}`
    }

    let message = `*NEW BOOKING REQUEST*\n\n`;
    message += `*VENDOR:* ${vendorName}\n`;
    message += `*CUSTOMER:* ${firstName || "Guest"} ${lastName || ""}`.trim() + `\n`;
    message += `*HELMETS:* ${helmets}\n`;
    message += `*METHOD:* ${deliveryMethod === 'delivery' ? 'Delivery' : 'Pick Up'}\n`;
    if (deliveryMethod === 'delivery') {
      message += `*DELIVERY ADDRESS:* ${deliveryAddress || "Not provided"}\n`;
      message += `*DELIVERY FEE AGREEMENT:* ${agreedToFee ? 'Yes (Agreed)' : 'No'}\n`;
    }
    if (startDate && endDate) {
      message += `*RENTAL PERIOD (24H):*\n  ${formatDisplayDate(startDate)} (${startTime}) to ${formatDisplayDate(endDate)} (${startTime})\n`;
    } else if (startDate) {
      message += `*RENTAL PERIOD:*\n  ${formatDisplayDate(startDate)} (${startTime})\n`;
    } else if (endDate) {
      message += `*RENTAL PERIOD:*\n  ${formatDisplayDate(endDate)} (${startTime})\n`;
    }
    message += `\n*FLEET BOOKED:*\n`;
    cart.forEach(item => {
      const durationLabel = item.durationMode === "daily" ? "Days" : item.durationMode === "weekly" ? "Weeks" : "Months";
      message += `• Quantity: ${item.quantity}\n   Vehicle: ${item.name}\n   Duration: ${item.durationCount} ${durationLabel}\n\n`;
    });
    message = message.trimEnd() + `\n\n*TOTAL PRICE:* Rp ${getTotalPrice().toLocaleString()}`;

    return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message)}`;
  }

  const handleConfirmBooking = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (cart.length === 0 || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Save each booked item into the Supabase bookings table
      for (const item of cart) {
        let base = item.daily
        if (item.durationMode === "weekly") base = item.weekly
        if (item.durationMode === "monthly") base = item.monthly
        const itemTotal = base * item.quantity * item.durationCount

        const finalStartDate = startDate || new Date().toISOString().split('T')[0]
        const finalEndDate = endDate || finalStartDate
        const startDateTimeStr = `${finalStartDate}T${startTime || "09:00"}`
        const endDateTimeStr = `${finalEndDate}T${startTime || "09:00"}`

        const vendorId = item.vendor_id || (item.vendors && (item.vendors as any).id) || null
        const { error } = await supabase.from('bookings').insert({
          scooter_id: item.id,
          vendor_id: vendorId,
          customer_name: `${firstName} ${lastName}`.trim() || 'Guest Customer',
          customer_phone: '',
          customer_email: '',
          start_date: startDateTimeStr,
          end_date: endDateTimeStr,
          total_price: itemTotal,
          quantity: item.quantity || 1,
          status: 'pending'
        })

        if (error) {
          console.error("Supabase booking insert error:", error)
        }
      }
    } catch (err) {
      console.error("Booking error:", err)
    } finally {
      setIsSubmitting(false)
      const waUrl = getWhatsAppLink()

      const finalStart = `${startDate || new Date().toISOString().split('T')[0]} (${startTime || "09:00"})`
      const finalEnd = `${endDate || new Date().toISOString().split('T')[0]} (${startTime || "09:00"})`
      const nowIso = new Date().toISOString()

      addSavedBookings(
        cart.map((item, idx) => {
          let base = item.daily
          if (item.durationMode === "weekly") base = item.weekly
          if (item.durationMode === "monthly") base = item.monthly
          const itemTotal = base * item.quantity * item.durationCount

          return {
            id: `booking-${Date.now()}-${idx}-${item.id}`,
            scooterId: item.id,
            scooterName: item.name,
            scooterImg: item.img || item.image_url || "/images/scooter.png",
            vendorName: item.vendors?.name || "The Bike Rental Bali",
            vendorPhone: item.vendors?.phone || "",
            customerName: `${firstName} ${lastName}`.trim() || "Guest Customer",
            startDate: finalStart,
            endDate: finalEnd,
            quantity: item.quantity || 1,
            durationMode: item.durationMode,
            durationCount: item.durationCount || 1,
            totalPrice: itemTotal,
            deliveryMethod,
            deliveryAddress,
            whatsappUrl: waUrl,
            createdAt: nowIso,
          }
        })
      )

      window.location.href = waUrl
    }
  }

  return (
    <div className="min-h-screen text-[var(--ink)] w-full max-w-full overflow-x-hidden md:py-8 touch-pan-y">
      <div className="flex flex-col min-h-screen md:min-h-0 relative p-5 sm:p-6 pb-36 md:pb-8 md:max-w-6xl md:mx-auto md:cirrel-glass md:rounded-[34px] md:overflow-hidden w-full max-w-full overflow-x-hidden">
        
        {/* Header */}
        <header className="relative z-10 flex justify-between items-center mb-8">
          <button 
            type="button"
            onClick={handleBack} 
            aria-label="Go Back"
            className="cirrel-ibtn w-11 h-11 active-press cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <h1 className="text-xl font-bold text-[var(--ink)] tracking-tight absolute left-1/2 -translate-x-1/2">
            Checkout
          </h1>
          <button 
            type="button" 
            aria-label="Notifications"
            className="cirrel-ibtn w-11 h-11 relative active-press"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-[var(--accent-blue)] rounded-full border-2 border-[var(--bg)]" />
          </button>
        </header>

        {loading ? (
          <div className="relative z-10 flex flex-col md:grid md:grid-cols-2 md:gap-10 flex-1 animate-pulse">
            <div className="flex flex-col gap-6 mb-6">
              <div className="cirrel-glass rounded-[26px] p-6 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 cirrel-well rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-5 cirrel-well rounded-lg w-3/4" />
                    <div className="h-4 cirrel-well rounded-md w-1/3" />
                    <div className="h-6 cirrel-well rounded-lg w-1/2 mt-2" />
                  </div>
                </div>
                <div className="border-t border-[var(--line)] pt-4 space-y-3">
                  <div className="h-4 cirrel-well rounded-md w-1/4" />
                  <div className="h-11 cirrel-well rounded-xl w-full" />
                  <div className="h-12 cirrel-well rounded-xl w-full mt-2" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="cirrel-glass rounded-[26px] p-6 space-y-4">
                <div className="h-5 cirrel-well rounded-lg w-1/3" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 cirrel-well rounded-xl" />
                  <div className="h-12 cirrel-well rounded-xl" />
                </div>
                <div className="h-12 cirrel-well rounded-xl" />
                <div className="h-12 cirrel-well rounded-xl" />
                <div className="h-14 cirrel-well rounded-full w-full mt-4" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col md:grid md:grid-cols-2 md:gap-10 flex-1">
            
            {/* Left Column: Cart Items */}
            <div className="flex flex-col h-full">
              
              {isResolvingScooter || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get("scooterId") && cart.length === 0) ? (
                <div className="cirrel-glass rounded-[26px] p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 mb-6 animate-pulse">
                  <div className="w-16 h-16 rounded-2xl cirrel-mark flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin stroke-[2.2]" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--ink)]">Loading Your Selected Scooter</h3>
                    <p className="text-xs text-[var(--muted-ink)] max-w-xs leading-relaxed">
                      Retrieving vehicle specifications, included helmets, insurance, and verified rates...
                    </p>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div className="cirrel-glass rounded-[28px] p-8 flex flex-col items-center justify-center text-center mb-6">
                  <div className="relative z-10 w-16 h-16 rounded-2xl cirrel-well flex items-center justify-center mb-4 text-[var(--accent-text)]">
                    <Store className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="relative z-10 text-base font-bold text-[var(--ink)] mb-1">No Scooter Selected</h3>
                  <p className="relative z-10 text-xs text-[var(--muted-ink)] max-w-xs mb-5 leading-relaxed">
                    Select a scooter from our verified Bali rental fleet to calculate rates and confirm your booking.
                  </p>
                  <Link
                    href="/"
                    className="relative z-10 px-6 py-3 cirrel-btn-primary font-bold text-xs uppercase tracking-wider active-press flex items-center gap-2 cursor-pointer"
                  >
                    <span>Browse Verified Fleet</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                cart.map(item => {
          const itemPrice = item.durationMode === "daily" ? item.daily : item.durationMode === "weekly" ? item.weekly : item.monthly
          const durationLabel = item.durationMode === "daily" ? "Days" : item.durationMode === "weekly" ? "Weeks" : "Months"
          const displayLabel = item.durationMode === "daily" ? "Day" : item.durationMode === "weekly" ? "Week" : "Month"

          return (
            <div key={item.id} className="cirrel-glass rounded-[26px] p-5 flex flex-col gap-5 relative mb-6">

              {/* Top Row: Scooter Info & Remove */}
              <div className="relative z-10 flex gap-4 items-center">
                <div className="w-24 h-24 bg-gradient-to-b from-white/95 to-[#eaf0f8]/95 rounded-[18px] flex items-center justify-center p-2 relative shrink-0 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-[var(--ink)] text-[17px] leading-tight truncate">{item.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Star className="w-3.5 h-3.5 fill-[#ffb340] text-[#ffb340]" />
                        <span className="text-[13px] font-bold text-[var(--ink)]">5.0</span>
                      </div>
                    </div>
                    {cart.length > 1 && (
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-[var(--muted-ink)] hover:text-[var(--bad)] rounded-full hover:bg-[var(--bad-soft)] transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-[18px] font-bold text-[var(--ink)]">
                      Rp {itemPrice.toLocaleString()}
                    </span>
                    <span className="text-[12px] text-[var(--muted-ink)] font-medium">/{displayLabel}</span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Quantity & Settings */}
              <div className="relative z-10 border-t border-[var(--line)] pt-5 space-y-5">
                {/* Duration Mode Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[14px] text-[var(--ink-2)] font-semibold">Rental Plan</label>
                    <span className="cirrel-pill cirrel-pill--good text-[11px]">
                      {item.available} Units Available
                    </span>
                  </div>
                  <div className="flex cirrel-seg">
                    <button
                      onClick={() => updateDurationMode(item.id, "daily")}
                      className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${item.durationMode === "daily" ? 'cirrel-btn-primary text-white' : 'text-[var(--muted-ink)] hover:text-[var(--ink)]'}`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => updateDurationMode(item.id, "weekly")}
                      className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${item.durationMode === "weekly" ? 'cirrel-btn-primary text-white' : 'text-[var(--muted-ink)] hover:text-[var(--ink)]'}`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => updateDurationMode(item.id, "monthly")}
                      className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${item.durationMode === "monthly" ? 'cirrel-btn-primary text-white' : 'text-[var(--muted-ink)] hover:text-[var(--ink)]'}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Counter Row: Duration and Quantity */}
                <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
                  <div className="flex-1">
                    <p className="text-[13px] text-[var(--muted-ink)] mb-2">How many {durationLabel.toLowerCase()}?</p>
                    <div className="flex items-center justify-between cirrel-well rounded-full p-1 max-w-[124px]">
                      <button
                        onClick={() => updateDurationCount(item.id, -1)}
                        className="cirrel-ibtn w-7 h-7 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-[14px] w-6 text-center text-[var(--ink)]">{item.durationCount}</span>
                      <button
                        onClick={() => updateDurationCount(item.id, 1)}
                        className="cirrel-btn-primary w-7 h-7 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-[var(--line)]" />

                  <div className="flex-1 flex flex-col items-end">
                    <p className="text-[13px] text-[var(--muted-ink)] mb-2">Scooters</p>
                    <div className="flex items-center justify-between cirrel-well rounded-full p-1 min-w-[124px]">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="cirrel-ibtn w-7 h-7 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-[14px] w-6 text-center text-[var(--ink)]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="cirrel-btn-primary w-7 h-7 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        })
      )}

            {cart.length > 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full cirrel-btn py-3.5 px-4 flex items-center justify-center gap-2 mb-8 text-sm font-semibold cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-[var(--accent-text)]" />
                <span>Add Another Scooter</span>
              </button>
            )}
            </div>

        {/* Right Column */}
        <div className="space-y-8 mt-6 md:mt-0 flex flex-col">
          <div className="space-y-8">
        {/* Rental Period */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <h2 className="text-[18px] font-bold text-[var(--ink)]">Rental Period</h2>
            <span className="cirrel-pill cirrel-pill--info text-[11px]">24-hour cycle</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <label className="block text-[13px] text-[var(--ink-2)] font-semibold mb-1.5 pl-1 truncate">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="cirrel-input w-full min-w-0 h-13 font-semibold rounded-[16px] px-3 sm:px-4 text-[16px] sm:text-sm"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[13px] text-[var(--ink-2)] font-semibold mb-1.5 pl-1 truncate">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="cirrel-input w-full min-w-0 h-13 font-semibold rounded-[16px] px-3 sm:px-4 text-[16px] sm:text-sm"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[13px] text-[var(--ink-2)] font-semibold mb-1.5 pl-1 truncate">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value || "09:00")}
                className="cirrel-input w-full min-w-0 h-13 font-semibold rounded-[16px] px-3 sm:px-4 text-[16px] sm:text-sm"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[13px] text-[var(--ink-2)] font-semibold mb-1.5 pl-1 truncate">
                End Time <span className="text-[11px] font-normal text-[var(--muted-ink)]">(Auto 24h)</span>
              </label>
              <input
                type="time"
                value={startTime}
                readOnly
                disabled
                aria-label="End time matches start time for 24-hour rental"
                className="cirrel-input w-full min-w-0 h-13 font-semibold rounded-[16px] px-3 sm:px-4 text-[16px] sm:text-sm opacity-75 cursor-not-allowed"
              />
            </div>
          </div>
          <p className="text-xs text-[var(--muted-ink)] font-medium mt-2.5 pl-1">
            End time automatically matches your start time ({startTime}) based on 24-hour rental days.
          </p>
        </section>

        {/* Customer Details Form */}
        <section>
          <h2 className="text-[18px] font-bold text-[var(--ink)] mb-4">Customer Details</h2>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[13px] text-[var(--ink-2)] font-semibold mb-1.5 pl-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="cirrel-input w-full h-13 font-semibold rounded-[16px] px-4 text-[16px] sm:text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[13px] text-[var(--ink-2)] font-semibold mb-1.5 pl-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="cirrel-input w-full h-13 font-semibold rounded-[16px] px-4 text-[16px] sm:text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Helmets & Accessories */}
        <section>
          <h2 className="text-[18px] font-bold text-[var(--ink)] mb-4">Accessories</h2>
          <div className="cirrel-glass rounded-[24px] p-5 flex items-center justify-between">
            <div className="relative z-10">
              <p className="font-bold text-[var(--ink)] text-[15px]">Helmets</p>
              <p className="text-[13px] text-[var(--muted-ink)] mt-0.5">Included in rental</p>
            </div>
            <div className="relative z-10 flex items-center justify-between cirrel-well rounded-full p-1 min-w-[112px]">
              <button
                onClick={() => setHelmets(Math.max(1, helmets - 1))}
                className="cirrel-ibtn w-8 h-8 active:scale-95 transition-all cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-[15px] w-6 text-center text-[var(--ink)]">{helmets}</span>
              <button
                onClick={() => setHelmets(helmets + 1)}
                className="cirrel-btn-primary w-8 h-8 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </section>

        {/* Delivery Method */}
        <section>
          <h2 className="text-[18px] font-bold text-[var(--ink)] mb-4">Collection Method</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setDeliveryMethod("pickup")}
              className={`p-3.5 rounded-[20px] flex items-center gap-3 transition-all cursor-pointer ${
                deliveryMethod === "pickup"
                  ? 'cirrel-glass ring-2 ring-[var(--accent-blue)] scale-[1.01]'
                  : 'cirrel-well opacity-80 hover:opacity-100'
              }`}
            >
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${deliveryMethod === "pickup" ? 'cirrel-mark text-white' : 'cirrel-glass text-[var(--ink)]'}`}>
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="relative z-10 font-semibold text-[var(--ink)] text-[14px]">Pick Up</h3>
            </button>
            <button
              onClick={() => setDeliveryMethod("delivery")}
              className={`p-3.5 rounded-[20px] flex items-center gap-3 transition-all cursor-pointer ${
                deliveryMethod === "delivery"
                  ? 'cirrel-glass ring-2 ring-[var(--accent-blue)] scale-[1.01]'
                  : 'cirrel-well opacity-80 hover:opacity-100'
              }`}
            >
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${deliveryMethod === "delivery" ? 'cirrel-mark text-white' : 'cirrel-glass text-[var(--ink)]'}`}>
                <Map className="w-4 h-4" />
              </div>
              <h3 className="relative z-10 font-semibold text-[var(--ink)] text-[14px]">Delivery</h3>
            </button>
          </div>

          {deliveryMethod === "delivery" && (
            <div className="cirrel-glass rounded-[24px] p-5 animate-in fade-in slide-in-from-top-2">
              <label className="relative z-10 block text-[14px] text-[var(--ink-2)] font-semibold mb-2 pl-1">Delivery Address</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your hotel or villa address"
                className="relative z-10 cirrel-input w-full h-13 rounded-[16px] px-4 text-[16px] sm:text-sm mb-4"
              />
              <div className="relative z-10 bg-[var(--warn-soft)] p-4 rounded-[18px] border border-[var(--warn)]/25 mb-1">
                <div className="flex gap-3 items-start mb-3">
                  <Info className="w-5 h-5 text-[var(--warn)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-bold text-[var(--warn)] mb-1">Delivery Fee Policy</p>
                    <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">
                      Delivery is free up to 5km from the vendor&apos;s location. Beyond 5km, a fee of IDR 10,000/km applies (calculated for both delivery and pickup).
                    </p>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="flex items-center justify-center w-5 h-5 mt-0.5 border border-[var(--warn)]/40 rounded bg-white/80 shrink-0">
                    <input
                      type="checkbox"
                      checked={agreedToFee}
                      onChange={(e) => setAgreedToFee(e.target.checked)}
                      className="w-4 h-4 accent-[#0a84ff] cursor-pointer"
                    />
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--ink)] flex-1 leading-snug">
                    I agree to pay the additional delivery and pickup fee if my location is further than 5km.
                  </span>
                </label>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Desktop Confirm Button */}
      <div className="hidden md:block pt-4">
        <div className="cirrel-glass rounded-[26px] p-5 flex flex-col gap-4">
          <div className="relative z-10 flex justify-between items-center px-2">
             <span className="text-[13px] font-bold text-[var(--muted-ink)] uppercase tracking-wider">Total Amount</span>
             <span className="text-2xl font-bold text-[var(--ink)] tracking-tight">
               {isResolvingScooter ? (
                 <span className="text-base text-[var(--muted-ink)] font-semibold animate-pulse">Calculating...</span>
               ) : (
                 `Rp ${getTotalPrice().toLocaleString()}`
               )}
             </span>
          </div>
          <button
            onClick={handleConfirmBooking}
            disabled={isSubmitting || isResolvingScooter || cart.length === 0}
            className="relative z-10 w-full h-14 cirrel-btn-primary text-[16px] font-bold hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Recording Booking...</span>
              </>
            ) : isResolvingScooter ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Loading Scooter...</span>
              </>
            ) : cart.length === 0 ? (
              <span>Select a Scooter</span>
            ) : (
              <span>Confirm via WhatsApp</span>
            )}
          </button>
        </div>
      </div>
      </div>
      </div>
      )}
      </div>

      {/* Bottom Button (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 py-4 pb-7 cirrel-modal z-10 rounded-t-[30px]">
        <div className="relative z-10 flex items-center justify-between mb-3 px-2">
           <span className="text-[12px] font-bold text-[var(--muted-ink)] uppercase tracking-wider">Total</span>
           <span className="text-xl font-bold text-[var(--ink)] tracking-tight">
             {isResolvingScooter ? (
               <span className="text-sm text-[var(--muted-ink)] font-semibold animate-pulse">Calculating...</span>
             ) : (
               `Rp ${getTotalPrice().toLocaleString()}`
             )}
           </span>
        </div>
        <button
          onClick={handleConfirmBooking}
          disabled={isSubmitting || isResolvingScooter || cart.length === 0}
          className="relative z-10 w-full h-13 cirrel-btn-primary text-[16px] font-bold active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Recording Booking...</span>
            </>
          ) : isResolvingScooter ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Loading Scooter...</span>
            </>
          ) : cart.length === 0 ? (
            <span>Select a Scooter</span>
          ) : (
            <span>Confirm via WhatsApp</span>
          )}
        </button>
      </div>

      {/* Modal for Adding Same Vendor Scooters */}
      {showAddModal && (
        <div 
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="cirrel-modal w-full max-w-lg rounded-t-[30px] sm:rounded-[30px] p-6 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 max-h-[85vh] overflow-y-auto text-[var(--ink)]"
          >
            <div className="relative z-10 flex items-start justify-between mb-5 border-b border-[var(--line)] pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[var(--ink)] tracking-tight">Add Another Scooter</h2>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--muted-ink)] font-medium">
                  <Store className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                  <span>Fleet from <strong className="text-[var(--ink)] font-bold">{activeVendor?.name || 'Selected Vendor'}</strong></span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)} 
                className="cirrel-ibtn w-9 h-9 active-press cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {relatedVendorScooters.length === 0 ? (
              <div className="relative z-10 py-8 px-4 text-center cirrel-well rounded-[20px]">
                <p className="text-sm font-bold text-[var(--ink)]">No other models listed by this vendor</p>
                <p className="text-xs text-[var(--muted-ink)] mt-1">You can increase the scooter count of your current selection on the checkout screen.</p>
              </div>
            ) : (
              <div className="relative z-10 space-y-3.5">
                {relatedVendorScooters.map(scooter => {
                  const inCartItem = cart.find(i => i.id === scooter.id);
                  const isAvail = (scooter.available ?? 1) > 0;

                  return (
                    <div key={scooter.id} className="flex gap-4 items-center p-3.5 cirrel-well rounded-[20px] transition-all">
                      <div className="w-20 h-20 bg-white/95 rounded-2xl p-2 shrink-0 flex items-center justify-center shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={scooter.img} alt={scooter.name} className="w-full h-full object-contain drop-shadow-md" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-[var(--ink)] text-[14px] leading-tight truncate">{scooter.name}</h3>
                          <span className={`cirrel-pill text-[10px] ${isAvail ? 'cirrel-pill--good' : ''}`}>
                            {scooter.available} Available
                          </span>
                        </div>
                        <p className="text-[13px] font-bold text-[var(--ink)] mb-2.5">
                          Rp {Number(scooter.daily || 0).toLocaleString()} <span className="text-[var(--muted-ink)] text-xs font-normal">/day</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => addToCart(scooter)}
                          className="cirrel-btn-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {inCartItem ? `Add More (x${inCartItem.quantity} In Cart)` : 'Add to Booking'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
