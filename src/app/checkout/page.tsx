"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Bell, Star, MapPin, Map, Info, Minus, Plus, PlusCircle, X, Trash2, Loader2, Store } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { fetchCatalogData, fetchScooterDetail } from '@/lib/api/catalogService'
import { clientCache } from '@/lib/cache/clientCache'
import { subscribeToPlatformSettings } from '@/utils/pricing'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      message += `*RENTAL PERIOD:*\n  ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}\n`;
    } else if (startDate) {
      message += `*RENTAL PERIOD:*\n  ${formatDisplayDate(startDate)}\n`;
    } else if (endDate) {
      message += `*RENTAL PERIOD:*\n  ${formatDisplayDate(endDate)}\n`;
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

        const vendorId = item.vendor_id || (item.vendors && (item.vendors as any).id) || null
        const { error } = await supabase.from('bookings').insert({
          scooter_id: item.id,
          vendor_id: vendorId,
          customer_name: `${firstName} ${lastName}`.trim() || 'Guest Customer',
          customer_phone: '',
          customer_email: '',
          start_date: startDate || new Date().toISOString().split('T')[0],
          end_date: endDate || new Date().toISOString().split('T')[0],
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
      window.location.href = waUrl
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-foreground w-full max-w-full overflow-x-hidden md:py-8 touch-pan-y">
      <div className="flex flex-col min-h-screen md:min-h-0 bg-[#F0F2F5] relative p-5 sm:p-6 pb-36 md:max-w-6xl md:mx-auto md:shadow-sm md:rounded-[40px] md:overflow-hidden md:border md:border-gray-200/60 w-full max-w-full overflow-x-hidden">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <button 
            type="button"
            onClick={handleBack} 
            aria-label="Go Back"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm active-press cursor-pointer border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" aria-hidden="true" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight absolute left-1/2 -translate-x-1/2">
            Checkout
          </h1>
          <button 
            type="button" 
            aria-label="Notifications"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm relative active-press border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-800" aria-hidden="true" />
            <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 flex-1 animate-pulse">
            {/* Left Skeleton Column */}
            <div className="flex flex-col gap-6 mb-6">
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl shrink-0"></div>
                  <div className="flex-1 space-y-2.5">
                    <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded-md w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-1/2 mt-2"></div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-md w-1/4"></div>
                  <div className="h-11 bg-gray-100 rounded-xl w-full"></div>
                  <div className="h-12 bg-gray-50 rounded-xl w-full mt-2"></div>
                </div>
              </div>
            </div>

            {/* Right Skeleton Column */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="h-5 bg-gray-200 rounded-lg w-1/3"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 bg-gray-100 rounded-xl"></div>
                  <div className="h-12 bg-gray-100 rounded-xl"></div>
                </div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
                <div className="h-14 bg-gray-200 rounded-2xl w-full mt-4"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 flex-1">
            
            {/* Left Column: Cart Items */}
            <div className="flex flex-col h-full">
              
              {isResolvingScooter ? (
                <div className="bg-white rounded-[24px] p-5 flex flex-col gap-5 shadow-sm relative border border-gray-100 mb-6 animate-pulse">
                  {/* Top Row Skeleton */}
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center p-2 relative shrink-0">
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 bg-gray-100 rounded-md w-12"></div>
                        <div className="h-3.5 bg-gray-100 rounded-md w-16"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded-lg w-1/2 mt-1"></div>
                    </div>
                  </div>

                  {/* Rental Plan Skeleton */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-100 rounded-md w-24"></div>
                      <div className="h-5 bg-gray-100 rounded-full w-28"></div>
                    </div>
                    <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-50 text-xs font-semibold text-gray-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                    <span>Loading your scooter details...</span>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                <div className="bg-white rounded-[28px] p-8 flex flex-col items-center justify-center shadow-sm text-center mb-6 border border-gray-100/80">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4 text-neutral-600">
                    <Store className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No Scooter Selected</h3>
                  <p className="text-xs text-gray-500 max-w-xs mb-5 leading-relaxed">
                    Select a scooter from our verified Bali rental fleet to calculate rates and confirm your booking.
                  </p>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-black text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 active-press transition-all shadow-sm flex items-center gap-2"
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
            <div key={item.id} className="bg-white rounded-[24px] p-5 flex flex-col gap-5 shadow-sm relative border border-transparent mb-6">

              {/* Top Row: Scooter Info & Remove */}
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 bg-[#F8F9FA] rounded-2xl flex items-center justify-center p-2 relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-[17px] leading-tight truncate">{item.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Star className="w-3.5 h-3.5 fill-black text-black" />
                        <span className="text-[13px] font-bold text-gray-900">5.0</span>
                      </div>
                    </div>
                    {cart.length > 1 && (
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-[18px] font-bold text-gray-900">
                      Rp {itemPrice.toLocaleString()}
                    </span>
                    <span className="text-[12px] text-gray-500 font-medium">/{displayLabel}</span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Quantity & Settings */}
              <div className="border-t border-gray-100 pt-5 space-y-5">
                {/* Duration Mode Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[14px] text-gray-700 font-medium">Rental Plan</label>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-black bg-neutral-100 border border-black/10">
                      {item.available} Units Available
                    </span>
                  </div>
                  <div className="flex bg-gray-50 rounded-xl p-1">
                    <button
                      onClick={() => updateDurationMode(item.id, "daily")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${item.durationMode === "daily" ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => updateDurationMode(item.id, "weekly")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${item.durationMode === "weekly" ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => updateDurationMode(item.id, "monthly")}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${item.durationMode === "monthly" ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Counter Row: Duration and Quantity */}
                <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                  {/* Duration Counter */}
                  <div className="flex-1">
                    <p className="text-[13px] text-gray-500 mb-2">How many {durationLabel.toLowerCase()}?</p>
                    <div className="flex items-center justify-between bg-gray-50 rounded-full p-1 border border-gray-100 max-w-[120px]">
                      <button
                        onClick={() => updateDurationCount(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm active:scale-95 transition-transform cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-semibold text-[14px] w-6 text-center">{item.durationCount}</span>
                      <button
                        onClick={() => updateDurationCount(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white shadow-sm hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-[1px] h-10 bg-gray-100"></div>

                  {/* Quantity Counter */}
                  <div className="flex-1 flex flex-col items-end">
                    <p className="text-[13px] text-gray-500 mb-2">Scooters</p>
                    <div className="flex items-center justify-between bg-gray-50 rounded-full p-1 border border-gray-100 max-w-[120px]">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm active:scale-95 transition-transform cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-semibold text-[14px] w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white shadow-sm hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
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
                className="w-full bg-white rounded-3xl p-4 flex items-center justify-center gap-2 mb-8 text-gray-800 font-semibold shadow-sm border border-transparent hover:border-black/20 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-black" />
                Add Another Scooter
              </button>
            )}
            </div>

        {/* Right Column */}
        <div className="space-y-8 mt-10 md:mt-0 flex flex-col">
          <div className="space-y-8">
        {/* Rental Period */}
        <section>
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">Rental Period</h2>
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-[13px] text-gray-700 font-semibold mb-1.5 pl-1 truncate">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full min-w-0 h-14 bg-white text-gray-900 font-semibold border border-gray-200/80 rounded-2xl px-3 sm:px-5 text-[16px] sm:text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition-shadow shadow-xs"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[13px] text-gray-700 font-semibold mb-1.5 pl-1 truncate">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full min-w-0 h-14 bg-white text-gray-900 font-semibold border border-gray-200/80 rounded-2xl px-3 sm:px-5 text-[16px] sm:text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition-shadow shadow-xs"
              />
            </div>
          </div>
        </section>

        {/* Customer Details Form */}
        <section>
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">Customer Details</h2>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[13px] text-gray-700 font-semibold mb-1.5 pl-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full h-14 bg-white text-gray-900 font-semibold border border-gray-200/80 rounded-2xl px-5 text-[16px] sm:text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition-shadow shadow-xs"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[13px] text-gray-700 font-semibold mb-1.5 pl-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full h-14 bg-white text-gray-900 font-semibold border border-gray-200/80 rounded-2xl px-5 text-[16px] sm:text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition-shadow shadow-xs"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Helmets & Accessories */}
        <section>
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">Accessories</h2>
          <div className="bg-white rounded-3xl p-5 flex items-center justify-between border border-gray-100 shadow-sm">
            <div>
              <p className="font-bold text-gray-900 text-[15px]">Helmets</p>
              <p className="text-[13px] text-gray-500 mt-0.5">Included in rental</p>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-full p-1 border border-gray-100 min-w-[110px]">
              <button
                onClick={() => setHelmets(Math.max(1, helmets - 1))}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-xs hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-[15px] w-6 text-center text-gray-900">{helmets}</span>
              <button
                onClick={() => setHelmets(helmets + 1)}
                className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white shadow-sm hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </section>

        {/* Delivery Method */}
        <section>
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">Collection Method</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setDeliveryMethod("pickup")}
              className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${deliveryMethod === "pickup" ? 'border-black bg-white shadow-sm scale-[1.02]' : 'border-transparent bg-white/60 hover:bg-white/80'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${deliveryMethod === "pickup" ? 'bg-black text-white shadow-xs' : 'bg-gray-100 text-gray-900'}`}>
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900 text-[14px]">Pick Up</h3>
            </button>
            <button
              onClick={() => setDeliveryMethod("delivery")}
              className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${deliveryMethod === "delivery" ? 'border-black bg-white shadow-sm scale-[1.02]' : 'border-transparent bg-white/60 hover:bg-white/80'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${deliveryMethod === "delivery" ? 'bg-black text-white shadow-xs' : 'bg-gray-100 text-gray-900'}`}>
                <Map className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900 text-[14px]">Delivery</h3>
            </button>
          </div>

          {deliveryMethod === "delivery" && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
              <label className="block text-[14px] text-gray-700 font-medium mb-2 pl-1">Delivery Address</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your hotel or villa address"
                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 text-[16px] sm:text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-black outline-none text-gray-800 mb-5 transition-shadow"
              />
              <div className="bg-[#FFF4E5] p-4 rounded-2xl border border-[#FFE0B2] mb-1">
                <div className="flex gap-3 items-start mb-3">
                  <Info className="w-5 h-5 text-[#E65100] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold text-[#E65100] mb-1">Delivery Fee Policy</p>
                    <p className="text-[13px] text-[#E65100]/80 leading-relaxed">
                      Delivery is free up to 5km from the vendor&apos;s location. Beyond 5km, a fee of IDR 10,000/km applies (calculated for both delivery and pickup).
                    </p>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="flex items-center justify-center w-5 h-5 mt-0.5 border border-[#E65100]/40 rounded bg-white shrink-0">
                    <input
                      type="checkbox"
                      checked={agreedToFee}
                      onChange={(e) => setAgreedToFee(e.target.checked)}
                      className="w-4 h-4 accent-[#E65100] cursor-pointer"
                    />
                  </div>
                  <span className="text-[13px] font-medium text-[#E65100] flex-1 leading-snug">
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
        <div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
             <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Total Amount</span>
             <span className="text-2xl font-black text-gray-900 tracking-tight">
               {isResolvingScooter ? (
                 <span className="text-base text-gray-400 font-semibold animate-pulse">Calculating...</span>
               ) : (
                 `Rp ${getTotalPrice().toLocaleString()}`
               )}
             </span>
          </div>
          <button
            onClick={handleConfirmBooking}
            disabled={isSubmitting || isResolvingScooter || cart.length === 0}
            className="w-full h-14 bg-black text-white hover:bg-neutral-800 rounded-full text-[17px] font-bold shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 py-5 pb-8 sm:pb-6 bg-white/95 backdrop-blur-xl border-t border-gray-100 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-[32px]">
        <div className="flex items-center justify-between mb-4 px-2">
           <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Total</span>
           <span className="text-xl font-black text-gray-900 tracking-tight">
             {isResolvingScooter ? (
               <span className="text-sm text-gray-400 font-semibold animate-pulse">Calculating...</span>
             ) : (
               `Rp ${getTotalPrice().toLocaleString()}`
             )}
           </span>
        </div>
        <button
          onClick={handleConfirmBooking}
          disabled={isSubmitting || isResolvingScooter || cart.length === 0}
          className="w-full h-14 bg-black text-white hover:bg-neutral-800 rounded-full text-[17px] font-bold shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
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
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-5 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Add Another Scooter</h2>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 font-medium">
                  <Store className="w-3.5 h-3.5 text-gray-400" />
                  <span>Fleet from <strong className="text-gray-900 font-bold">{activeVendor?.name || 'Selected Vendor'}</strong></span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)} 
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors active-press"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {relatedVendorScooters.length === 0 ? (
              <div className="py-8 px-4 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm font-bold text-gray-900">No other models listed by this vendor</p>
                <p className="text-xs text-gray-500 mt-1">You can increase the scooter count of your current selection on the checkout screen.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {relatedVendorScooters.map(scooter => {
                  const inCartItem = cart.find(i => i.id === scooter.id);
                  const isAvail = (scooter.available ?? 1) > 0;

                  return (
                    <div key={scooter.id} className="flex gap-4 items-center p-3.5 border border-gray-100 rounded-2xl bg-white hover:border-gray-200 transition-all shadow-xs">
                      <div className="w-20 h-20 bg-[#F8F9FA] rounded-2xl p-2 shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={scooter.img} alt={scooter.name} className="w-full h-full object-contain drop-shadow-md" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-[14px] leading-tight truncate">{scooter.name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${isAvail ? 'bg-neutral-100 text-black border border-black/10' : 'bg-gray-100 text-gray-500'}`}>
                            {scooter.available} Available
                          </span>
                        </div>
                        <p className="text-[13px] font-black text-gray-900 mb-2.5">
                          Rp {Number(scooter.daily || 0).toLocaleString()} <span className="text-gray-500 text-xs font-normal">/day</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => addToCart(scooter)}
                          className={`text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                            inCartItem 
                              ? 'bg-neutral-800 text-white hover:bg-black' 
                              : 'bg-black text-white hover:bg-neutral-800 shadow-sm'
                          }`}
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
