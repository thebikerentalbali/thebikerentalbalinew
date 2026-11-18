"use client"

import { useState, useEffect } from "react"
import { Bike, DollarSign, CalendarDays, Settings, Bell, Search, Plus, QrCode, Home, Wallet, User, ChevronRight, ChevronLeft, TrendingUp, Wrench, MoreVertical, CheckCircle2, Clock, X, ChevronDown, List, Calendar as CalendarIcon, Camera, Loader2, LogOut, RotateCcw, Check, XCircle, Store, Calendar, ArrowUpRight, Download, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import { 
  PlatformSettings, 
  DEFAULT_PLATFORM_SETTINGS, 
  fetchPlatformSettings, 
  subscribeToPlatformSettings, 
  calculateBookingCommission, 
  calculateRentalDays 
} from "@/utils/pricing"
import { invalidateAllCatalogCaches } from "@/lib/api/catalogService"
import { normalizeGoogleMapsUrl, saveVendorGoogleMapsFallback, fetchVendorGoogleMapsFallback } from "@/utils/vendorMaps"
import { parseBookingDateTime, reconcileExpiredBookings, formatBookingDateTimeDisplay } from "@/utils/rentalTime"
import ThemeToggle from "@/components/ThemeToggle"
import BookingsCalendar from "@/components/BookingsCalendar"
import RentalCountdownBadge from "@/components/RentalCountdownBadge"

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("home")
  const [vendorLocation, setVendorLocation] = useState<[number, number]>([-8.5069, 115.2625])
  const [vendorData, setVendorData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isAppInstalled, setIsAppInstalled] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const refreshData = async (vData: any) => {
    // Auto-complete any expired confirmed rentals down to exact date & time before fetching
    const reconciled = await reconcileExpiredBookings(supabase, vData.id)
    if (reconciled) {
      invalidateAllCatalogCaches()
    }

    // Fetch Fleet
    const { data: scootersData } = await supabase.from('scooters').select('*').eq('vendor_id', vData.id)
    if (scootersData) {
      setFleet(scootersData)
    }

    // Fetch Bookings
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, scooters(*)')
      .eq('vendor_id', vData.id)
      .order('created_at', { ascending: false })

    if (bookingsData) {
      const formatted = bookingsData.map((b: any) => {
        const rawStatus = (b.status || 'pending').toLowerCase()
        const parsedStart = parseBookingDateTime(b.start_date || b.created_at, false) || new Date(b.created_at)
        const parsedEnd = parseBookingDateTime(b.end_date || b.created_at, true) || parsedStart

        return {
          id: b.id,
          scooterId: b.scooter_id,
          scooter: b.scooters?.name || 'Scooter Rental',
          scooter_img: b.scooters?.image_url || '/images/scooter.png',
          customer: b.customer_name || 'Guest Customer',
          phone: b.customer_phone || '',
          email: b.customer_email || '',
          quantity: Number(b.quantity) || 1,
          status: rawStatus === 'confirmed' ? 'Confirmed' : rawStatus === 'completed' ? 'Completed' : rawStatus === 'rejected' ? 'Rejected' : 'Pending',
          rawStatus: rawStatus,
          startDateRaw: b.start_date || '',
          endDateRaw: b.end_date || '',
          startDate: parsedStart,
          endDate: parsedEnd,
          price: Number(b.total_price) || 0,
          created_at: b.created_at,
          scooter_obj: b.scooters
        }
      })
      setBookingsList(formatted)
    }
  }

  useEffect(() => {
    let bookingsSubscription: any;
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/partnerportal/login')
        return
      }
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('auth_id', session.user.id)
        .single()
        
      if (error || !data || data.status !== 'approved') {
        await supabase.auth.signOut()
        router.push('/partnerportal/login')
        return
      }
      
      setVendorData(data)
      await refreshData(data)
      setIsLoading(false)

      bookingsSubscription = supabase
        .channel('partner-bookings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `vendor_id=eq.${data.id}` },
          () => refreshData(data)
        )
        .subscribe()
    }
    checkAuth()

    return () => {
      if (bookingsSubscription) {
        supabase.removeChannel(bookingsSubscription)
      }
    }
  }, [router, supabase])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
      if (isStandalone) setIsAppInstalled(true)

      const handleBeforeInstall = (e: any) => {
        e.preventDefault()
        setDeferredPrompt(e)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstall)
      window.addEventListener('appinstalled', () => {
        setIsAppInstalled(true)
        setDeferredPrompt(null)
      })

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      }
    }
  }, [])

  const handleDownloadApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice?.outcome === 'accepted') {
        setIsAppInstalled(true)
        setDeferredPrompt(null)
      }
    } else {
      const isAndroid = /android/i.test(navigator.userAgent || '')
      if (isAndroid) {
        alert("To install on your Android: Open Chrome menu (⋮) and tap 'Install app'")
      } else {
        alert("To install on your device: Use your browser's 'Install app' option")
      }
    }
  }

  const handleConfirmBooking = async (booking: any) => {
    setProcessingBookingId(booking.id)
    try {
      const { error: bErr } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id)

      if (bErr) {
        alert("Error confirming booking: " + bErr.message)
        return
      }

      if (booking.scooterId) {
        const { data: sData } = await supabase
          .from('scooters')
          .select('available_units, total_units')
          .eq('id', booking.scooterId)
          .single()

        if (sData) {
          const currentAvail = sData.available_units ?? 1
          const qty = booking.quantity || 1
          const newAvail = Math.max(0, currentAvail - qty)
          await supabase.from('scooters').update({ available_units: newAvail }).eq('id', booking.scooterId)
        }
      }

      if (vendorData) {
        await refreshData(vendorData)
      }
    } catch (err) {
      console.error("Confirm error:", err)
    } finally {
      setProcessingBookingId(null)
    }
  }

  const handleRejectBooking = async (booking: any) => {
    setProcessingBookingId(booking.id)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', booking.id)

      if (!error) {
        if (booking.rawStatus === 'confirmed' && booking.scooterId) {
          const { data: sData } = await supabase
            .from('scooters')
            .select('available_units, total_units')
            .eq('id', booking.scooterId)
            .single()

          if (sData) {
            const currentAvail = sData.available_units ?? 0
            const totalUnits = sData.total_units ?? 1
            const qty = booking.quantity || 1
            const newAvail = Math.min(totalUnits, currentAvail + qty)
            await supabase.from('scooters').update({ available_units: newAvail }).eq('id', booking.scooterId)
          }
        }
        if (vendorData) {
          await refreshData(vendorData)
        }
      } else {
        alert("Error rejecting booking: " + error.message)
      }
    } finally {
      setProcessingBookingId(null)
    }
  }

  const handleCompleteBooking = async (booking: any) => {
    setProcessingBookingId(booking.id)
    try {
      const { data: claimed, error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', booking.id)
        .eq('status', 'confirmed')
        .select('id')

      if (!error && claimed && claimed.length > 0) {
        if (booking.scooterId) {
          const { data: sData } = await supabase
            .from('scooters')
            .select('available_units, total_units')
            .eq('id', booking.scooterId)
            .single()

          if (sData) {
            const currentAvail = sData.available_units ?? 0
            const totalUnits = sData.total_units ?? 1
            const qty = booking.quantity || 1
            const newAvail = Math.min(totalUnits, currentAvail + qty)
            await supabase.from('scooters').update({ available_units: newAvail }).eq('id', booking.scooterId)
          }
        }
        invalidateAllCatalogCaches()
        if (vendorData) {
          await refreshData(vendorData)
        }
      }
    } finally {
      setProcessingBookingId(null)
    }
  }

  const formatIndoDate = (dateStr?: string | Date): string => {
    if (!dateStr) return ''
    if (typeof dateStr === 'string' && (dateStr.includes(' to ') || dateStr.includes(' - '))) {
      const parts = dateStr.includes(' to ') ? dateStr.split(' to ') : dateStr.split(' - ')
      return `${formatIndoDate(parts[0])} – ${formatIndoDate(parts[1])}`
    }
    if (typeof dateStr === 'string') {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const year = parts[0]
        const monthIndex = parseInt(parts[1], 10) - 1
        const day = parts[2].padStart(2, '0')
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]
        if (isNaN(monthIndex)) {
          return `${day} ${parts[1]} ${year}`
        }
        const monthName = monthNames[monthIndex] || parts[1]
        return `${day} ${monthName} ${year}`
      }
    }
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return String(dateStr)
      const day = String(d.getDate()).padStart(2, '0')
      const year = d.getFullYear()
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ]
      return `${day} ${monthNames[d.getMonth()]} ${year}`
    } catch {
      return String(dateStr)
    }
  }

  const formatRentalPeriod = (startStr?: string | Date, endStr?: string | Date) => {
    if (!startStr && !endStr) return 'N/A'
    if (startStr && !endStr) return formatIndoDate(startStr)
    if (!startStr && endStr) return formatIndoDate(endStr)
    return `${formatIndoDate(startStr)} – ${formatIndoDate(endStr)}`
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/partnerportal/login')
  }

  // Fleet State
  const [fleet, setFleet] = useState<any[]>([])
  const [fleetFilter, setFleetFilter] = useState("All")
  const [fleetSearch, setFleetSearch] = useState("")
  const [serviceSearch, setServiceSearch] = useState("")
  const [editingScooter, setEditingScooter] = useState<any>(null)
  const [isAddingScooter, setIsAddingScooter] = useState(false)
  const [newScooter, setNewScooter] = useState({ name: "", brand: "", cc: "", year: "", fuelCapacity: "", transmission: "", price: 0, priceWeekly: 0, priceMonthly: 0, totalUnits: 1, availableUnits: 1, photos: [] as string[] })
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublishScooter = async () => {
    if (!newScooter.name || newScooter.photos.length === 0) {
      alert("Please provide a name and at least 1 photo.")
      return;
    }
    
    setIsPublishing(true)
    const totalUnits = Math.max(1, Number(newScooter.totalUnits) || 1);
    const availableUnits = totalUnits; // All units automatically set as available on new listing

    const { data, error } = await supabase.from('scooters').insert({
      vendor_id: vendorData.id,
      name: newScooter.name,
      brand: newScooter.brand,
      engine: newScooter.cc || null,
      year: newScooter.year ? parseInt(newScooter.year) : null,
      fuel_capacity: newScooter.fuelCapacity || null,
      transmission: newScooter.transmission || null,
      price_daily: newScooter.price,
      price_weekly: newScooter.priceWeekly || null,
      price_monthly: newScooter.priceMonthly || null,
      total_units: totalUnits,
      available_units: availableUnits,
      image_url: newScooter.photos[0] // Save the first photo
    }).select().single()

    setIsPublishing(false)

    if (!error && data) {
      invalidateAllCatalogCaches()
      setFleet([data, ...fleet])
      setIsAddingScooter(false)
      setNewScooter({ name: "", brand: "", cc: "", year: "", fuelCapacity: "", transmission: "", price: 0, priceWeekly: 0, priceMonthly: 0, totalUnits: 1, availableUnits: 1, photos: [] })
    } else {
      alert("Failed to publish: " + (error?.message || 'Unknown error'))
    }
  }

  const handleUpdateScooter = async () => {
    if (!editingScooter) return;
    setIsPublishing(true);

    const oldTotal = editingScooter.total_units || 1;
    const oldAvailable = editingScooter.available_units ?? 1;
    const newTotal = editingScooter.totalUnits;
    const newAvailable = Math.max(0, oldAvailable + (newTotal - oldTotal));

    const { data, error } = await supabase.from('scooters').update({
      name: editingScooter.name,
      brand: editingScooter.brand,
      engine: editingScooter.cc || null,
      year: editingScooter.year ? parseInt(editingScooter.year) : null,
      fuel_capacity: editingScooter.fuelCapacity || null,
      transmission: editingScooter.transmission || null,
      price_daily: editingScooter.price,
      price_weekly: editingScooter.priceWeekly || null,
      price_monthly: editingScooter.priceMonthly || null,
      total_units: newTotal,
      available_units: newAvailable,
    }).eq('id', editingScooter.id).select().single()

    setIsPublishing(false)
    if (!error && data) {
      invalidateAllCatalogCaches()
      setFleet(f => f.map(s => s.id === data.id ? data : s));
      setEditingScooter(null);
    } else {
      alert("Failed to update: " + (error?.message || 'Unknown error'))
    }
  }

  // Service State
  const [serviceLogs, setServiceLogs] = useState<any[]>([])
  const [isAddingServiceScooter, setIsAddingServiceScooter] = useState(false)
  const [newServiceScooter, setNewServiceScooter] = useState({ name: "", plate: "", odo: "", oil: "", service: "", nextOil: "", nextService: "" })
  const [editingServiceLog, setEditingServiceLog] = useState<any>(null)
  
  // Settings State
  const [settingsForm, setSettingsForm] = useState({ 
    name: "", 
    phone: "", 
    address: "",
    opening_hours: "",
    delivery_area: "",
    google_maps_url: ""
  })
  const [vendorLogo, setVendorLogo] = useState<string | null>(null)
  const [vendorCover, setVendorCover] = useState<string | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Initialize settings when vendorData loads
  useEffect(() => {
    if (vendorData) {
      const dbMapsUrl = vendorData.google_maps_url || ""
      setSettingsForm({
        name: vendorData.name || "",
        phone: vendorData.phone || "",
        address: vendorData.address || "",
        opening_hours: vendorData.opening_hours || "08:00 AM – 08:00 PM Daily",
        delivery_area: vendorData.delivery_area || "",
        google_maps_url: dbMapsUrl
      })
      if (!dbMapsUrl && vendorData.id) {
        fetchVendorGoogleMapsFallback(vendorData.id).then((fallbackUrl) => {
          if (fallbackUrl) {
            setSettingsForm((prev) => prev.google_maps_url ? prev : { ...prev, google_maps_url: fallbackUrl })
          }
        })
      }
      if (vendorData.lat && vendorData.lng && Number(vendorData.lat) !== 0 && !isNaN(Number(vendorData.lat)) && !isNaN(Number(vendorData.lng))) {
        setVendorLocation([Number(vendorData.lat), Number(vendorData.lng)])
      }
      if (vendorData.logo) {
        setVendorLogo(vendorData.logo)
      }
      if (vendorData.image_url) {
        setVendorCover(vendorData.image_url)
      }
    }
  }, [vendorData])

  const handleSaveSettings = async () => {
    const rawMaps = settingsForm.google_maps_url.trim()
    const normalizedMapsUrl = normalizeGoogleMapsUrl(rawMaps)
    if (rawMaps && !normalizedMapsUrl) {
      alert("Please enter a valid Google Maps link (e.g. https://maps.app.goo.gl/...).")
      return
    }

    setIsSavingSettings(true)
    const basePayload = {
      name: settingsForm.name,
      phone: settingsForm.phone,
      address: settingsForm.address,
      opening_hours: settingsForm.opening_hours,
      delivery_area: settingsForm.delivery_area,
      lat: vendorLocation[0],
      lng: vendorLocation[1],
      logo: vendorLogo,
      image_url: vendorCover
    }

    let { error } = await supabase
      .from('vendors')
      .update({
        ...basePayload,
        google_maps_url: normalizedMapsUrl || null,
      })
      .eq('id', vendorData.id)

    if (error && error.message?.toLowerCase().includes('google_maps_url')) {
      const retry = await supabase
        .from('vendors')
        .update(basePayload)
        .eq('id', vendorData.id)
      error = retry.error
      if (!error) {
        await saveVendorGoogleMapsFallback(vendorData.id, normalizedMapsUrl)
      }
    } else if (!error) {
      // Keep fallback in sync when column exists too
      setSettingsForm((prev) => ({ ...prev, google_maps_url: normalizedMapsUrl }))
    }
      
    setIsSavingSettings(false)
    if (!error) {
      setVendorData((prev: any) => prev ? { ...prev, ...basePayload, google_maps_url: normalizedMapsUrl || null } : prev)
      invalidateAllCatalogCaches()
      alert("Settings saved successfully!")
    } else {
      alert("Error saving settings: " + error.message)
    }
  }

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS)

  // Bookings & Smart Month Navigation State
  const [bookingsList, setBookingsList] = useState<any[]>([])
  const [activeMonthDate, setActiveMonthDate] = useState<Date>(new Date())
  const [calendarStartDate, setCalendarStartDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    return d
  })
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')
  const [bookingSearchQuery, setBookingSearchQuery] = useState('')

  useEffect(() => {
    fetchPlatformSettings().then(updated => {
      setPlatformSettings(updated)
    })
    const unsubscribe = subscribeToPlatformSettings((updated) => {
      setPlatformSettings(updated)
    })
    return () => unsubscribe()
  }, [])

  const handlePrevMonth = () => {
    const prevMonth = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() - 1, 1)
    setActiveMonthDate(prevMonth)
    setSelectedCalendarDate(null)
    const newCalStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1)
    newCalStart.setDate(newCalStart.getDate() - 1)
    setCalendarStartDate(newCalStart)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 1)
    setActiveMonthDate(nextMonth)
    setSelectedCalendarDate(null)
    const newCalStart = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)
    newCalStart.setDate(newCalStart.getDate() - 1)
    setCalendarStartDate(newCalStart)
  }

  const handleThisMonth = () => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    setActiveMonthDate(thisMonth)
    setSelectedCalendarDate(null)
    const d = new Date()
    d.setDate(d.getDate() - 2)
    setCalendarStartDate(d)
  }

  const handlePrevWeek = () => {
    const d = new Date(calendarStartDate)
    d.setDate(d.getDate() - 7)
    setCalendarStartDate(d)
  }

  const handleNextWeek = () => {
    const d = new Date(calendarStartDate)
    d.setDate(d.getDate() + 7)
    setCalendarStartDate(d)
  }

  const handleToday = () => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    setCalendarStartDate(d)
    const now = new Date()
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    setSelectedCalendarDate(todayIso)
  }

  const get7Days = (start: Date) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      days.push(d)
    }
    return days
  }

  const formatMonthYear = (date: Date): string => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }

  const isBookingInActivePeriod = (b: any) => {
    const monthStart = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth(), 1, 0, 0, 0, 0)
    const monthEnd = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 0, 23, 59, 59, 999)

    let bStart = new Date(b.startDate)
    let bEnd = new Date(b.endDate)

    if (isNaN(bStart.getTime())) bStart = new Date()
    if (isNaN(bEnd.getTime())) bEnd = bStart

    bStart.setHours(0, 0, 0, 0)
    bEnd.setHours(23, 59, 59, 999)

    if (selectedCalendarDate) {
      const [sy, sm, sd] = selectedCalendarDate.split('-').map(Number)
      const targetDate = new Date(sy, sm - 1, sd, 0, 0, 0, 0)
      return targetDate >= bStart && targetDate <= bEnd
    }

    return bStart <= monthEnd && bEnd >= monthStart
  }

  const getBookingsCountForDate = (d: Date) => {
    const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
    return bookingsList.filter(b => {
      const bStart = new Date(b.startDate)
      const bEnd = new Date(b.endDate)
      bStart.setHours(0, 0, 0, 0)
      bEnd.setHours(23, 59, 59, 999)
      return targetDate >= bStart && targetDate <= bEnd
    }).length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cirrel-glass p-6 rounded-[24px] flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-blue)]" />
          <span className="text-sm font-semibold text-[var(--ink)]">Loading Partner Portal...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full text-[var(--ink)] md:flex md:pl-[284px] pb-28 md:pb-8">
      {/* 
        ========================================================================
        CIRREL FLOATING LIQUID GLASS SIDEBAR
        ========================================================================
      */}
      <aside className="w-64 cirrel-glass-hi rounded-[26px] hidden md:flex flex-col fixed top-4 bottom-4 left-4 z-40">
        <div className="relative z-10 p-5 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="cirrel-mark w-9 h-9 rounded-[12px] shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[var(--ink)] tracking-tight leading-none truncate">THE BIKE RENTAL</h2>
              <p className="text-[10px] font-bold text-[var(--muted-ink)] mt-1 uppercase tracking-wider">Partner Portal</p>
            </div>
          </Link>
          <ThemeToggle className="w-8 h-8" />
        </div>

        <nav className="relative z-10 flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-sm cursor-pointer ${activeTab === 'home' ? 'cirrel-btn-primary text-white font-semibold' : 'text-[var(--ink-2)] hover:bg-[var(--card-2)] font-semibold'}`}>
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('fleet')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-sm cursor-pointer ${activeTab === 'fleet' ? 'cirrel-btn-primary text-white font-semibold' : 'text-[var(--ink-2)] hover:bg-[var(--card-2)] font-semibold'}`}>
            <Bike className="w-4 h-4" />
            <span>My Fleet</span>
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-sm relative cursor-pointer ${activeTab === 'bookings' ? 'cirrel-btn-primary text-white font-semibold' : 'text-[var(--ink-2)] hover:bg-[var(--card-2)] font-semibold'}`}>
            <CalendarDays className="w-4 h-4" />
            <span>Bookings</span>
            {bookingsList.length > 0 && <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'bookings' ? 'bg-white/25 text-white' : 'bg-[var(--accent-soft)] text-[var(--accent-text)]'}`}>{bookingsList.length}</span>}
          </button>
          <button onClick={() => setActiveTab('earnings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-sm cursor-pointer ${activeTab === 'earnings' ? 'cirrel-btn-primary text-white font-semibold' : 'text-[var(--ink-2)] hover:bg-[var(--card-2)] font-semibold'}`}>
            <Wallet className="w-4 h-4" />
            <span>Earnings</span>
          </button>
          <button onClick={() => setActiveTab('maintenance')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-sm cursor-pointer ${activeTab === 'maintenance' ? 'cirrel-btn-primary text-white font-semibold' : 'text-[var(--ink-2)] hover:bg-[var(--card-2)] font-semibold'}`}>
            <Wrench className="w-4 h-4" />
            <span>Maintenance</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all text-sm cursor-pointer ${activeTab === 'settings' ? 'cirrel-btn-primary text-white font-semibold' : 'text-[var(--ink-2)] hover:bg-[var(--card-2)] font-semibold'}`}>
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        <div className="relative z-10 p-4 border-t border-[var(--line)]">
          <div className="flex items-center gap-3 cirrel-well p-2.5 rounded-[16px] mb-2.5">
            <div className="w-9 h-9 rounded-full cirrel-mark shrink-0">
              <span className="font-bold text-white text-xs">{(vendorData?.name || "V").charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--ink)] truncate">{vendorData?.name || "Vendor"}</p>
              <p className="text-[10px] font-semibold text-[var(--good)] truncate">Verified Partner</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-[var(--bad-soft)] text-[var(--bad)] font-bold py-2 rounded-full hover:opacity-90 transition-opacity text-xs cursor-pointer">
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* 
        ========================================================================
        MAIN CONTENT (Full Width on Desktop & Responsive Mobile)
        ========================================================================
      */}
      <main className="flex-1 w-full min-w-0 flex flex-col min-h-screen pt-4 md:pt-5 md:pr-4">

        {/* Dashboard Content */}
        {activeTab === 'home' ? (
          <div className="p-4 sm:p-5 md:px-6 md:pb-12 space-y-6">

            {/* Mobile Top Header */}
            <div className="flex items-center justify-between md:hidden">
              <div className="flex items-center gap-2.5">
                <div className="cirrel-mark w-9 h-9 rounded-[11px]">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-[var(--ink)] leading-none">{vendorData?.name || "Partner Portal"}</h1>
                  <p className="text-[10px] font-semibold text-[var(--muted-ink)] mt-0.5">Shop Desk</p>
                </div>
              </div>
              <ThemeToggle className="w-9 h-9" />
            </div>

            {/* Quick Actions (App-like) */}
            <div className="flex flex-col gap-3 md:hidden">
              <button type="button" onClick={() => setIsAddingScooter(true)} className="cirrel-btn-primary p-4 rounded-[22px] flex items-center justify-center gap-2.5 active:scale-95 transition-transform cursor-pointer">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Add Scooter</span>
              </button>
            </div>

            {/* Cirrel Tinted KPI Stats Row */}
            {(() => {
              const confirmedOrCompleted = bookingsList.filter(b => b.rawStatus === 'confirmed' || b.rawStatus === 'completed')
              const totalNetEarnings = confirmedOrCompleted.reduce((sum, b) => {
                const comm = calculateBookingCommission(b.startDate, b.endDate, b.quantity, b.price, platformSettings)
                return sum + Math.max(0, b.price - comm)
              }, 0)
              const activeRentalsCount = bookingsList.filter(b => b.rawStatus === 'confirmed').length
              const totalFleetUnits = fleet.reduce((sum, s) => sum + (Number(s.total_units) || 1), 0)
              const availableFleetUnits = fleet.reduce((sum, s) => sum + (Number(s.available_units) ?? 1), 0)

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  <div className="cirrel-kpi cirrel-kpi--3 p-5 md:p-6">
                    <div className="relative z-10 flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--good-soft)] text-[var(--good)] flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-[var(--tile-muted)] uppercase tracking-wider">Net Profit</h3>
                    </div>
                    <p className="relative z-10 text-2xl md:text-3xl font-bold text-[var(--tile-ink)] tracking-tight">
                      Rp {totalNetEarnings.toLocaleString()}
                    </p>
                    <div className="relative z-10 mt-3 cirrel-pill w-fit text-[11px]">
                      <span>
                        {confirmedOrCompleted.length} {confirmedOrCompleted.length === 1 ? 'booking' : 'bookings'} total
                      </span>
                    </div>
                  </div>

                  <div className="cirrel-kpi cirrel-kpi--1 p-5 md:p-6">
                    <div className="relative z-10 flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--info-soft)] text-[var(--info)] flex items-center justify-center">
                        <Bike className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-[var(--tile-muted)] uppercase tracking-wider">Active Rentals</h3>
                    </div>
                    <div className="relative z-10 flex items-baseline gap-2">
                      <p className="text-2xl md:text-3xl font-bold text-[var(--tile-ink)] tracking-tight">{activeRentalsCount}</p>
                      <span className="text-sm font-bold text-[var(--tile-muted)]">/ {totalFleetUnits} units</span>
                    </div>
                    <p className="relative z-10 text-xs font-semibold text-[var(--tile-muted)] mt-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--good)]" />
                      {availableFleetUnits} available for booking
                    </p>
                  </div>

                  <div className="cirrel-kpi cirrel-kpi--2 p-5 md:p-6 sm:col-span-2 lg:col-span-1">
                    <div className="relative z-10 flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--warn-soft)] text-[var(--warn)] flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-[var(--tile-muted)] uppercase tracking-wider">Google Reviews</h3>
                    </div>
                    <div className="relative z-10 flex items-baseline gap-2">
                      <p className="text-2xl md:text-3xl font-bold text-[var(--tile-ink)] tracking-tight">
                        {normalizeGoogleMapsUrl(settingsForm.google_maps_url || vendorData?.google_maps_url) ? "Connected" : "Not Set"}
                      </p>
                    </div>
                    <div className="relative z-10 text-xs font-semibold text-[var(--tile-muted)] mt-3">
                      {normalizeGoogleMapsUrl(settingsForm.google_maps_url || vendorData?.google_maps_url) ? (
                        <a
                          href={normalizeGoogleMapsUrl(settingsForm.google_maps_url || vendorData?.google_maps_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--accent-text)] font-bold hover:underline"
                        >
                          <span>View Google Reviews</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveTab('profile')}
                          className="text-[var(--accent-text)] font-bold hover:underline cursor-pointer"
                        >
                          Add your Google Maps link →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
              {/* Recent Bookings */}
              <div className="cirrel-glass rounded-[26px] overflow-hidden lg:col-span-2 flex flex-col">
                <div className="relative z-10 p-5 md:p-6 border-b border-[var(--line)] flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[var(--ink)]">Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-[var(--accent-text)] hover:underline transition-colors flex items-center gap-1 cursor-pointer">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative z-10 p-3 md:p-4 flex-1">
                  {bookingsList.length === 0 ? (
                    <div className="text-center py-10 text-[var(--muted-ink)] font-medium text-sm">
                      No recent bookings yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {bookingsList.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="p-3 md:p-3.5 rounded-[18px] cirrel-well flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-11 h-11 bg-white/95 rounded-xl overflow-hidden shrink-0 p-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={booking.scooter_img} alt="Scooter" className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-[var(--ink)] text-sm truncate">{booking.scooter}</h4>
                              <p className="text-xs text-[var(--muted-ink)] truncate">{booking.customer} {booking.phone ? `• ${booking.phone}` : ''}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-[var(--ink)] text-sm">Rp {booking.price.toLocaleString()}</p>
                            <span className={`cirrel-pill text-[10px] uppercase tracking-wider mt-0.5 ${booking.status === 'Confirmed' ? 'cirrel-pill--good' : 'cirrel-pill--info'}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions / Need Attention */}
              <div className="cirrel-kpi cirrel-kpi--4 rounded-[26px] p-6 flex flex-col justify-between min-h-[240px]">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-[var(--tile-ink)] mb-1.5">Need Attention</h3>
                  <p className="text-[var(--tile-muted)] text-xs font-medium">You have tasks that require your immediate action.</p>
                </div>

                <div className="relative z-10 mt-6 space-y-3">
                  <div className="text-center py-4 text-[var(--tile-muted)] text-xs font-semibold cirrel-well rounded-[18px]">
                    No pending actions required.
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : activeTab === 'fleet' ? (
          <div className="p-4 sm:p-5 md:px-6 pb-12 animate-in fade-in">
            <div className="mb-6 space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div className="relative w-max shrink-0">
                  <select
                    value={fleetFilter}
                    onChange={(e) => setFleetFilter(e.target.value)}
                    className="text-xl md:text-2xl font-bold text-[var(--ink)] bg-transparent outline-none cursor-pointer appearance-none pr-8 pl-1"
                    style={{ WebkitAppearance: 'none' }}
                  >
                    <option value="All" className="text-black">All Scooters</option>
                    <option value="Available" className="text-black">Available</option>
                    <option value="Rented" className="text-black">Rented</option>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted-ink)]" />
                </div>
                <button onClick={() => setIsAddingScooter(true)} className="cirrel-btn-primary px-4 py-2.5 text-[13px] font-bold flex items-center gap-2 hover:scale-[1.02] shrink-0 cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Scooter
                </button>
              </div>
              <div className="relative w-full">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-ink)]" />
                <input
                  type="text"
                  placeholder="Search fleet..."
                  value={fleetSearch}
                  onChange={(e) => setFleetSearch(e.target.value)}
                  className="cirrel-input w-full rounded-[16px] pl-12 pr-4 py-3.5 text-[15px] font-medium"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {fleet.filter(s => {
                const avail = s.available_units ?? 1;
                const tot = s.total_units ?? 1;
                if (fleetFilter === "Available") return avail > 0;
                if (fleetFilter === "Rented") return avail < tot;
                return true;
              }).map((scooter) => {
                const totalUnits = scooter.total_units ?? 1;
                const availableUnits = scooter.available_units ?? 1;
                
                return (
                  <div key={scooter.id} className="cirrel-glass p-5 md:p-6 rounded-[26px] flex flex-col gap-4 transition-all relative group">
                    <div className="relative z-10 flex items-center gap-5">
                      <div className="w-24 h-24 bg-gradient-to-b from-white/95 to-[#eaf0f8]/95 rounded-[18px] p-2 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={scooter.image_url || "/images/scooter.png"} alt="Scooter" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-[var(--ink)] text-lg md:text-xl truncate pr-2" title={scooter.name}>{scooter.name}</h3>
                          <button onClick={() => setEditingScooter({
                            ...scooter,
                            price: scooter.price_daily || 0,
                            priceWeekly: scooter.price_weekly || '',
                            priceMonthly: scooter.price_monthly || '',
                            totalUnits: scooter.total_units || 1,
                            cc: scooter.engine || '',
                            fuelCapacity: scooter.fuel_capacity || '',
                            transmission: scooter.transmission || ''
                          })} className="text-[var(--muted-ink)] hover:text-[var(--ink)] p-1 shrink-0 cursor-pointer">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-[13px] font-bold text-[var(--ink)] mb-3">Rp {(scooter.price_daily || scooter.price || 0).toLocaleString()} <span className="text-[var(--muted-ink)] font-normal">/day</span> • {scooter.year || new Date().getFullYear()}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`cirrel-pill text-[10px] md:text-[11px] uppercase tracking-wide ${availableUnits > 0 ? 'cirrel-pill--good' : ''}`}>
                            {availableUnits > 0 ? <span className="w-1.5 h-1.5 rounded-full bg-current" /> : null}
                            {availableUnits} / {totalUnits} Available
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons Row */}
                    <div className="relative z-10 grid grid-cols-2 gap-3 pt-3 border-t border-[var(--line)]">
                      <button
                        type="button"
                        disabled={availableUnits >= totalUnits}
                        onClick={async () => {
                          const newAvail = Math.min(totalUnits, availableUnits + 1);
                          setFleet(f => f.map(s => s.id === scooter.id ? { ...s, available_units: newAvail } : s));
                          await supabase.from('scooters').update({ available_units: newAvail }).eq('id', scooter.id);
                          invalidateAllCatalogCaches();
                        }}
                        className={`py-2.5 px-3 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                          availableUnits < totalUnits 
                            ? 'cirrel-btn cursor-pointer' 
                            : 'cirrel-well text-[var(--muted-ink)] opacity-40 cursor-not-allowed'
                        }`}
                        title={availableUnits >= totalUnits ? 'All units are currently in stock' : 'Record returned scooter (+1 available)'}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return (+1)</span>
                      </button>
                      <button
                        type="button"
                        disabled={availableUnits === 0}
                        onClick={async () => {
                          const newAvail = Math.max(0, availableUnits - 1);
                          setFleet(f => f.map(s => s.id === scooter.id ? { ...s, available_units: newAvail } : s));
                          await supabase.from('scooters').update({ available_units: newAvail }).eq('id', scooter.id);
                          invalidateAllCatalogCaches();
                        }}
                        className={`py-2.5 px-3 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                          availableUnits > 0 
                            ? 'cirrel-btn-primary cursor-pointer' 
                            : 'cirrel-well text-[var(--muted-ink)] opacity-40 cursor-not-allowed'
                        }`}
                        title={availableUnits === 0 ? 'All units are currently rented out' : 'Record rented scooter (-1 available)'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Rent Out (-1)</span>
                      </button>
                    </div>
                  </div>
                )
              })}
              {fleet.filter(s => {
                const avail = s.available_units ?? 1;
                const tot = s.total_units ?? 1;
                const matchesFilter = fleetFilter === "Available" ? avail > 0 : fleetFilter === "Rented" ? avail < tot : true;
                const matchesSearch = s.name.toLowerCase().includes(fleetSearch.toLowerCase());
                return matchesFilter && matchesSearch;
              }).length === 0 && (
                  <div className="col-span-full py-12 text-center text-[var(--muted-ink)] font-bold">No scooters found for this filter.</div>
                )}
            </div>
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="p-4 md:p-6 lg:p-8 pb-12 animate-in fade-in space-y-6">
            {/* Interactive Month / Week Calendar Overview */}
            <BookingsCalendar
              bookings={bookingsList}
              activeMonthDate={activeMonthDate}
              onActiveMonthChange={setActiveMonthDate}
              calendarStartDate={calendarStartDate}
              onCalendarStartChange={setCalendarStartDate}
              selectedDate={selectedCalendarDate}
              onSelectDate={setSelectedCalendarDate}
            />

            {/* Smart Active Period Analytics & Filter Banners */}
            {(() => {
              const periodBookings = bookingsList.filter(isBookingInActivePeriod)
              const periodPending = periodBookings.filter(b => b.rawStatus === 'pending')
              const periodConfirmed = periodBookings.filter(b => b.rawStatus === 'confirmed')
              const periodCompleted = periodBookings.filter(b => b.rawStatus === 'completed')

              const periodTotalCustomerPrice = periodBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0)
              const periodCommission = periodBookings
                .filter(b => b.rawStatus === 'completed' || b.rawStatus === 'confirmed')
                .reduce((sum, b) => sum + calculateBookingCommission(b.startDate, b.endDate, b.quantity, b.price, platformSettings), 0)

              const periodNetProfit = periodBookings
                .filter(b => b.rawStatus === 'completed' || b.rawStatus === 'confirmed')
                .reduce((sum, b) => {
                  const comm = calculateBookingCommission(b.startDate, b.endDate, b.quantity, b.price, platformSettings)
                  return sum + Math.max(0, b.price - comm)
                }, 0)

              const filteredList = periodBookings.filter(b => {
                if (bookingFilter === 'pending' && b.rawStatus !== 'pending') return false
                if (bookingFilter === 'confirmed' && b.rawStatus !== 'confirmed') return false
                if (bookingFilter === 'completed' && b.rawStatus !== 'completed') return false
                
                if (bookingSearchQuery) {
                  const q = bookingSearchQuery.toLowerCase()
                  const matchCustomer = b.customer?.toLowerCase().includes(q)
                  const matchScooter = b.scooter?.toLowerCase().includes(q)
                  const matchPhone = b.phone?.toLowerCase().includes(q)
                  if (!matchCustomer && !matchScooter && !matchPhone) return false
                }
                return true
              })

              return (
                <div className="space-y-6">
                  {/* Top 4 Summary Cards (Interactive Filters) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div
                      onClick={() => setBookingFilter('all')}
                      className={`p-4 rounded-[22px] transition-all cursor-pointer ${
                        bookingFilter === 'all'
                          ? 'cirrel-btn-primary text-white'
                          : 'cirrel-glass text-[var(--ink)] hover:opacity-95'
                      }`}
                    >
                      <p className={`relative z-10 text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 truncate whitespace-nowrap ${bookingFilter === 'all' ? 'text-white/80' : 'text-[var(--muted-ink)]'}`}>
                        <CalendarDays className="w-3.5 h-3.5 shrink-0" /> Total Bookings
                      </p>
                      <p className="relative z-10 text-xl md:text-2xl font-bold mt-1">
                        {periodBookings.length}
                      </p>
                    </div>

                    <div
                      onClick={() => setBookingFilter('pending')}
                      className={`p-4 rounded-[22px] transition-all cursor-pointer ${
                        bookingFilter === 'pending'
                          ? 'cirrel-btn-primary text-white'
                          : 'cirrel-kpi cirrel-kpi--2'
                      }`}
                    >
                      <p className={`relative z-10 text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 truncate whitespace-nowrap ${bookingFilter === 'pending' ? 'text-white/80' : 'text-[var(--tile-muted)]'}`}>
                        <Clock className="w-3.5 h-3.5 shrink-0" /> Pending Review
                      </p>
                      <p className="relative z-10 text-xl md:text-2xl font-bold mt-1">
                        {periodPending.length}
                      </p>
                    </div>

                    <div
                      onClick={() => setBookingFilter('confirmed')}
                      className={`p-4 rounded-[22px] transition-all cursor-pointer ${
                        bookingFilter === 'confirmed'
                          ? 'cirrel-btn-primary text-white'
                          : 'cirrel-kpi cirrel-kpi--3'
                      }`}
                    >
                      <p className={`relative z-10 text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 truncate whitespace-nowrap ${bookingFilter === 'confirmed' ? 'text-white/80' : 'text-[var(--tile-muted)]'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Confirmed
                      </p>
                      <p className="relative z-10 text-xl md:text-2xl font-bold mt-1">
                        {periodConfirmed.length}
                      </p>
                    </div>

                    <div
                      onClick={() => setBookingFilter('completed')}
                      className={`p-4 rounded-[22px] transition-all cursor-pointer ${
                        bookingFilter === 'completed'
                          ? 'cirrel-btn-primary text-white'
                          : 'cirrel-kpi cirrel-kpi--1'
                      }`}
                    >
                      <p className={`relative z-10 text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 truncate whitespace-nowrap ${bookingFilter === 'completed' ? 'text-white/80' : 'text-[var(--tile-muted)]'}`}>
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" /> Completed
                      </p>
                      <p className="relative z-10 text-xl md:text-2xl font-bold mt-1">
                        {periodCompleted.length}
                      </p>
                    </div>
                  </div>

                  {/* Period Financial Summary Bar */}
                  <div className="cirrel-glass rounded-[22px] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="relative z-10 cirrel-well rounded-[16px] p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-ink)]">Gross Booking Value</p>
                      <p className="text-base sm:text-lg font-bold text-[var(--ink)] mt-0.5">Rp {periodTotalCustomerPrice.toLocaleString()}</p>
                    </div>
                    <div className="relative z-10 cirrel-well rounded-[16px] p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-ink)]">Platform Commission (Confirmed)</p>
                      <p className="text-base sm:text-lg font-bold text-[var(--bad)] mt-0.5">-Rp {periodCommission.toLocaleString()}</p>
                    </div>
                    <div className="relative z-10 cirrel-well rounded-[16px] p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-ink)]">Your Net Earnings</p>
                      <p className="text-base sm:text-lg font-bold text-[var(--good)] mt-0.5">Rp {periodNetProfit.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Section Header with Search */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm md:text-base font-bold text-[var(--ink)]">
                        Bookings List
                      </h3>
                      <span className="text-xs font-bold text-[var(--muted-ink)]">
                        ({filteredList.length} {filteredList.length === 1 ? 'Booking' : 'Bookings'})
                      </span>

                      {selectedCalendarDate && (
                        <div className="cirrel-pill cirrel-pill--info text-xs ml-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatIndoDate(selectedCalendarDate)}</span>
                          <button
                            onClick={() => setSelectedCalendarDate(null)}
                            className="ml-1 hover:opacity-70 font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="relative flex items-center min-w-[200px] sm:min-w-[260px]">
                      <Search className="w-3.5 h-3.5 text-[var(--muted-ink)] absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={bookingSearchQuery}
                        onChange={(e) => setBookingSearchQuery(e.target.value)}
                        placeholder="Search scooter, customer..."
                        className="cirrel-input w-full text-xs font-semibold rounded-full pl-9 pr-3 py-2.5"
                      />
                      {bookingSearchQuery && (
                        <button
                          onClick={() => setBookingSearchQuery('')}
                          className="absolute right-3 text-[var(--muted-ink)] hover:text-[var(--ink)] text-xs font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bookings List Cards */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredList.length === 0 ? (
                      <div className="xl:col-span-2 cirrel-glass p-12 text-center text-[var(--muted-ink)] font-bold rounded-[26px]">
                        No bookings found for this filter in the active period.
                      </div>
                    ) : (
                      filteredList.map((booking) => {
                        const bookingCommission = calculateBookingCommission(booking.startDate, booking.endDate, booking.quantity, booking.price, platformSettings)
                        const vendorNetProfit = Math.max(0, booking.price - bookingCommission)
                        const rentalDays = calculateRentalDays(booking.startDate, booking.endDate)

                        return (
                          <div
                            key={booking.id}
                            className="cirrel-glass p-4 md:p-5 rounded-[26px] space-y-3.5 transition-all"
                          >
                            {/* Top Row */}
                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3.5 min-w-0">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/95 rounded-2xl overflow-hidden shrink-0 p-1 flex items-center justify-center">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={booking.scooter_img || "/images/scooter.png"} alt="Scooter" className="w-full h-full object-contain" />
                                </div>
                                <div className="min-w-0 space-y-1.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-bold text-[var(--ink)] text-sm md:text-base leading-tight">{booking.scooter}</h5>
                                    <span className="cirrel-pill cirrel-pill--info text-[10px] md:text-[11px] shrink-0">
                                      {booking.quantity} {booking.quantity > 1 ? 'Units' : 'Unit'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 cirrel-well px-2 py-0.5 rounded-lg w-fit">
                                      <div className="w-4 h-4 rounded-md cirrel-mark text-white text-[8px] font-bold flex items-center justify-center shrink-0 overflow-hidden">
                                        {vendorData?.logo_url || vendorData?.logo || vendorData?.image_url ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img src={vendorData?.logo_url || vendorData?.logo || vendorData?.image_url} alt="Vendor" className="w-full h-full object-cover" />
                                        ) : (
                                          <span>{vendorData?.name ? vendorData.name.substring(0, 2).toUpperCase() : 'VN'}</span>
                                        )}
                                      </div>
                                      <span className="text-[10px] md:text-[11px] font-bold text-[var(--ink)] truncate max-w-[140px] sm:max-w-[200px]">
                                        {vendorData?.name || 'Partner Vendor'}
                                      </span>
                                    </div>

                                    <p className="text-xs font-medium text-[var(--ink-2)] truncate">
                                      Customer: <strong className="text-[var(--ink)] font-bold">{booking.customer}</strong> {booking.phone ? `(${booking.phone})` : ''}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-[var(--muted-ink)] flex-wrap">
                                    <Calendar className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
                                    <span>
                                      {formatBookingDateTimeDisplay(booking.startDateRaw || booking.startDate)} – {formatBookingDateTimeDisplay(booking.endDateRaw || booking.endDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap self-start">
                                <span className={`cirrel-pill text-xs uppercase tracking-wider ${
                                  booking.rawStatus === 'pending'
                                    ? 'cirrel-pill--warn'
                                    : booking.rawStatus === 'confirmed'
                                    ? 'cirrel-pill--good'
                                    : booking.rawStatus === 'completed'
                                    ? 'cirrel-pill--info'
                                    : 'cirrel-pill--bad line-through'
                                }`}>
                                  {booking.rawStatus === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                                  {booking.rawStatus === 'pending' && <Clock className="w-3 h-3" />}
                                  {booking.rawStatus === 'completed' && <RotateCcw className="w-3 h-3" />}
                                  <span>{booking.status}</span>
                                </span>

                                <span className="cirrel-pill text-xs shrink-0">
                                  <span>{rentalDays} {rentalDays > 1 ? 'Days' : 'Day'}</span>
                                </span>

                                {booking.rawStatus === 'confirmed' && (
                                  <RentalCountdownBadge
                                    endDate={booking.endDateRaw || booking.endDate}
                                    onExpire={() => {
                                      if (vendorData) refreshData(vendorData)
                                    }}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Price and Net Price / Commission Row */}
                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cirrel-well rounded-[18px] p-3 md:p-3.5">
                              <div>
                                <p className="text-[10px] md:text-[11px] font-bold text-[var(--muted-ink)] uppercase tracking-wider">Total Customer Price</p>
                                <p className="font-bold text-[var(--ink)] text-sm md:text-base">Rp {booking.price.toLocaleString()}</p>
                              </div>

                              <div className="flex items-center gap-3 justify-between sm:justify-end">
                                <div className="text-left sm:text-right">
                                  <p className="text-[10px] md:text-[11px] font-bold text-[var(--muted-ink)] uppercase tracking-wider">Pay Commission</p>
                                  <p className="text-xs md:text-sm font-bold text-[var(--bad)]">-Rp {bookingCommission.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] md:text-[11px] font-bold text-[var(--muted-ink)] uppercase tracking-wider">Your Profit (Net)</p>
                                  <div className="mt-0.5">
                                    <span className="cirrel-pill cirrel-pill--good font-bold text-xs md:text-sm px-3 py-1">
                                      Rp {vendorNetProfit.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="relative z-10 grid grid-cols-2 gap-2.5 w-full pt-1">
                              {booking.rawStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleConfirmBooking(booking)}
                                    disabled={processingBookingId === booking.id}
                                    className="w-full cirrel-btn-primary active:scale-95 text-xs md:text-sm font-bold py-3 px-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                  >
                                    {processingBookingId === booking.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                    <span>Confirm Booking</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectBooking(booking)}
                                    disabled={processingBookingId === booking.id}
                                    className="w-full cirrel-btn text-[var(--bad)] active:scale-95 text-xs md:text-sm font-bold py-3 px-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {booking.rawStatus === 'confirmed' && (
                                <>
                                  <div className="w-full cirrel-well text-[var(--good)] font-bold text-xs md:text-sm py-3 px-4 rounded-full flex items-center justify-center gap-2 uppercase tracking-wide">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>CONFIRMED</span>
                                  </div>
                                  <button
                                    onClick={() => handleCompleteBooking(booking)}
                                    disabled={processingBookingId === booking.id}
                                    className="w-full cirrel-btn-primary active:scale-95 text-xs md:text-sm font-bold py-3 px-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                  >
                                    {processingBookingId === booking.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="w-4 h-4" />
                                    )}
                                    <span>Mark Returned</span>
                                  </button>
                                </>
                              )}

                              {booking.rawStatus === 'completed' && (
                                <div className="col-span-2 w-full cirrel-well text-[var(--muted-ink)] font-bold text-xs md:text-sm py-3 px-4 rounded-full flex items-center justify-center gap-2 uppercase tracking-wide">
                                  <Check className="w-4 h-4" />
                                  <span>Completed</span>
                                </div>
                              )}

                              {booking.rawStatus === 'rejected' && (
                                <div className="col-span-2 w-full cirrel-well text-[var(--bad)] font-bold text-xs md:text-sm py-3 px-4 rounded-full flex items-center justify-center gap-2 uppercase tracking-wide">
                                  <XCircle className="w-4 h-4" />
                                  <span>Rejected Booking</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        ) : activeTab === 'maintenance' ? (
          <div className="p-4 sm:p-5 md:px-6 pb-12 animate-in fade-in">
            <div className="mb-6 space-y-4">
              <div className="flex justify-between items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-[var(--ink)]">Maintenance Log</h2>
                <button onClick={() => setIsAddingServiceScooter(true)} className="cirrel-btn-primary px-4 py-2.5 text-[13px] font-bold flex items-center gap-2 hover:scale-[1.02] shrink-0 cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Scooter
                </button>
              </div>
              <div className="relative w-full">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-ink)]" />
                <input
                  type="text"
                  placeholder="Search by plate or name..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="cirrel-input w-full rounded-[16px] pl-12 pr-4 py-3.5 text-[15px] font-medium"
                />
              </div>
            </div>
            <div className="space-y-4">
              {serviceLogs.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.plate.toLowerCase().includes(serviceSearch.toLowerCase())).map((scooter) => (
                <div key={scooter.id} className="cirrel-glass p-5 rounded-[26px]">
                  <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-[var(--ink)]">{scooter.name}</h3>
                      <p className="text-xs text-[var(--muted-ink)] font-bold mt-0.5">{scooter.plate}</p>
                    </div>
                    <button onClick={() => setEditingServiceLog(scooter)} className="ml-auto cirrel-btn px-3.5 py-1.5 text-xs font-bold cursor-pointer">
                      Record Service
                    </button>
                  </div>
                  <div className="relative z-10 grid grid-cols-2 gap-y-4 gap-x-2 border-t border-[var(--line)] pt-4">
                    <div>
                      <p className="text-[10px] text-[var(--muted-ink)] font-semibold uppercase mb-1">Odometer</p>
                      <p className="text-sm font-bold text-[var(--ink)]">{scooter.odo} km</p>
                    </div>
                    <div />
                    <div>
                      <p className="text-[10px] text-[var(--muted-ink)] font-semibold uppercase mb-1">Last Oil</p>
                      <p className="text-sm font-bold text-[var(--ink)]">{scooter.oil}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--accent-text)] font-semibold uppercase mb-1">Next Oil</p>
                      <p className="text-sm font-bold text-[var(--accent-text)]">{scooter.nextOil || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted-ink)] font-semibold uppercase mb-1">Last Service</p>
                      <p className="text-sm font-bold text-[var(--ink)]">{scooter.service}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--bad)] font-semibold uppercase mb-1">Next Service</p>
                      <p className="text-sm font-bold text-[var(--bad)]">{scooter.nextService || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
              {serviceLogs.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.plate.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && (
                <div className="py-12 text-center text-[var(--muted-ink)] font-bold">No records found.</div>
              )}
            </div>
          </div>
        ) : activeTab === 'profile' || activeTab === 'settings' ? (
          <div className="p-4 sm:p-5 md:px-6 pb-12 animate-in fade-in w-full">
            <h2 className="text-2xl font-bold text-[var(--ink)] mb-6">Profile Settings</h2>
            <div className="cirrel-glass rounded-[28px] p-6 space-y-5">
              {/* Cover Image Upload Section */}
              <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-4 border-b border-[var(--line)]">
                <div className="relative group w-full sm:w-1/3">
                  <div className="w-full h-32 rounded-xl border-2 border-dashed border-[var(--line-2)] flex items-center justify-center overflow-hidden cirrel-well">
                    {vendorCover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={vendorCover} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-[var(--muted-ink)] group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 cirrel-btn-primary p-2 rounded-full cursor-pointer hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0]
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setVendorCover(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left flex-1 pt-2">
                  <h3 className="font-bold text-[var(--ink)] text-lg">Cover Image</h3>
                  <p className="text-sm text-[var(--muted-ink)] mt-1">Upload a landscape cover image for your profile header. Recommended size: 1200x600px.</p>
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-4 border-b border-[var(--line)]">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[var(--edge)] shadow-md flex items-center justify-center overflow-hidden cirrel-well">
                    {vendorLogo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={vendorLogo} alt="Vendor Logo" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-[var(--muted-ink)] group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 cirrel-btn-primary p-2.5 rounded-full cursor-pointer hover:scale-110 transition-transform border-2 border-[var(--bg)]">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0]
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setVendorLogo(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left flex-1 pt-2">
                  <h3 className="font-bold text-[var(--ink)] text-lg">Vendor Logo</h3>
                  <p className="text-sm text-[var(--muted-ink)] mt-1">Upload a professional logo to build trust with customers. Recommended size: 500x500px.</p>
                </div>
              </div>

              <div className="relative z-10">
                <label className="block text-sm font-semibold text-[var(--ink-2)] mb-2">Vendor Name</label>
                <input type="text" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} className="cirrel-input w-full rounded-[14px] px-4 py-3 text-sm font-medium" />
              </div>
              <div className="relative z-10">
                <label className="block text-sm font-semibold text-[var(--ink-2)] mb-2">WhatsApp Number</label>
                <input type="text" value={settingsForm.phone} onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})} className="cirrel-input w-full rounded-[14px] px-4 py-3 text-sm font-medium" />
              </div>
              <div className="relative z-10">
                <label className="block text-sm font-semibold text-[var(--ink-2)] mb-2">Location / Address</label>
                <textarea value={settingsForm.address} onChange={e => setSettingsForm({...settingsForm, address: e.target.value})} className="cirrel-input w-full rounded-[16px] px-4 py-3 text-sm font-medium min-h-[80px] mb-4" />
                
                <label className="block text-sm font-semibold text-[var(--ink-2)] mb-2">Opening / Operating Hours</label>
                <input 
                  type="text" 
                  placeholder="e.g. 08:00 AM – 08:00 PM Daily" 
                  value={settingsForm.opening_hours} 
                  onChange={e => setSettingsForm({...settingsForm, opening_hours: e.target.value})} 
                  className="cirrel-input w-full rounded-[14px] px-4 py-3 text-sm font-medium mb-1" 
                />
                <p className="text-xs text-[var(--muted-ink)] mb-4">Displayed on your profile for customer drop-off &amp; pickup schedule.</p>

                <label className="block text-sm font-semibold text-[var(--ink-2)] mb-2">Delivery Coverage Areas</label>
                <textarea 
                  placeholder="e.g. Ubud area only - Central Ubud, Mas, Sayan, Campuhan, Penestanan & Tegallalang (Leave blank to use auto-detected coverage based on your address)" 
                  value={settingsForm.delivery_area} 
                  onChange={e => setSettingsForm({...settingsForm, delivery_area: e.target.value})} 
                  className="cirrel-input w-full rounded-[16px] px-4 py-3 text-sm font-medium min-h-[80px] mb-1"
                />
                <p className="text-xs text-[var(--muted-ink)] mb-4">Specify custom covered zones and areas for hotel/villa delivery.</p>

                <label className="block text-sm font-semibold text-[var(--ink-2)] mb-2">
                  Google Maps Link (Google Reviews)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/place/..."
                  value={settingsForm.google_maps_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, google_maps_url: e.target.value })}
                  className="cirrel-input w-full rounded-[14px] px-4 py-3 text-sm font-medium mb-1.5"
                />
                <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                  <p className="text-xs text-[var(--muted-ink)]">
                    Paste your Google Maps share URL. A Google Reviews button will appear on your public profile.
                  </p>
                  {normalizeGoogleMapsUrl(settingsForm.google_maps_url) && (
                    <a
                      href={normalizeGoogleMapsUrl(settingsForm.google_maps_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[var(--accent-text)] hover:underline inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <label className="block text-sm font-semibold text-[var(--ink-2)] mb-2">Pin Location on Map</label>
                <div className="h-[300px] w-full rounded-[20px] overflow-hidden border border-[var(--line)] shadow-sm relative z-0">
                  <MapPicker position={vendorLocation} onPositionChange={(lat, lng) => setVendorLocation([lat, lng])} className="w-full h-full" />
                </div>
              </div>
              <button onClick={handleSaveSettings} disabled={isSavingSettings} className="relative z-10 w-full cirrel-btn-primary py-3.5 font-bold text-sm hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </button>

              <div className="relative z-10 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={handleDownloadApp}
                  className="w-full cirrel-btn active:scale-[0.99] py-3.5 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[var(--accent-text)]" />
                  <span>{isAppInstalled ? "App Installed" : "Download App"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 md:px-8 pb-12 flex flex-col items-center justify-center flex-1 min-h-[50vh] text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="cirrel-glass rounded-[30px] p-10 max-w-sm">
              <div className="relative z-10 w-16 h-16 cirrel-mark rounded-[20px] mx-auto mb-4">
                {activeTab === 'earnings' && <Wallet className="w-8 h-8 text-white" />}
              </div>
              <h2 className="relative z-10 text-2xl font-bold text-[var(--ink)] mb-2 capitalize">{activeTab} Management</h2>
              <p className="relative z-10 text-[var(--muted-ink)] text-sm">This section is currently under development. Check back soon for updates!</p>
            </div>
          </div>
        )}

        {/* Add Scooter Modal */}
        {isAddingScooter && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 overflow-y-auto animate-in slide-in-from-bottom-full duration-300 flex items-start justify-center p-0 sm:p-6">
            <div className="cirrel-modal w-full max-w-3xl sm:rounded-[30px] mx-auto px-5 py-6 md:p-8 pb-24 sm:pb-8 text-[var(--ink)]">
              <div className="relative z-10 flex justify-between items-center mb-6 pb-4 border-b border-[var(--line)]">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Add New Scooter</h3>
                <button onClick={() => setIsAddingScooter(false)} className="cirrel-ibtn w-10 h-10 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <div className="relative z-10 space-y-8">
                {/* Photo Upload Section */}
                <div>
                  <h4 className="text-base font-bold text-[var(--ink)] mb-3">Scooter Photos (Max 2)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((index) => (
                      <div key={index} className="border-2 border-dashed border-[var(--line-2)] rounded-[20px] h-40 flex flex-col items-center justify-center text-[var(--muted-ink)] hover:text-[var(--ink)] hover:border-[var(--accent-blue)] transition-colors cursor-pointer cirrel-well relative overflow-hidden group">
                        {newScooter.photos[index] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={newScooter.photos[index]} alt="Upload preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wide">Upload Photo {index + 1}</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                const newPhotos = [...newScooter.photos]
                                newPhotos[index] = reader.result as string
                                setNewScooter({ ...newScooter, photos: newPhotos })
                              }
                              reader.readAsDataURL(e.target.files[0])
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-5">
                  <h4 className="text-base font-bold text-[var(--ink)] mb-3">Vehicle Details</h4>
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Model Name</label>
                    <input type="text" placeholder="e.g. Yamaha NMAX" value={newScooter.name} onChange={e => setNewScooter({ ...newScooter, name: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Brand</label>
                      <input type="text" placeholder="e.g. Yamaha" value={newScooter.brand} onChange={e => setNewScooter({ ...newScooter, brand: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Engine (CC)</label>
                      <input type="text" placeholder="e.g. 155cc" value={newScooter.cc} onChange={e => setNewScooter({ ...newScooter, cc: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Year</label>
                    <input type="text" placeholder="2024" value={newScooter.year} onChange={e => setNewScooter({ ...newScooter, year: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Fuel Capacity (L)</label>
                      <input type="text" placeholder="e.g. 7.1L" value={newScooter.fuelCapacity} onChange={e => setNewScooter({ ...newScooter, fuelCapacity: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Transmission</label>
                      <select value={newScooter.transmission} onChange={e => setNewScooter({ ...newScooter, transmission: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold appearance-none">
                        <option value="" className="text-black">Select</option>
                        <option value="Automatic" className="text-black">Automatic</option>
                        <option value="Manual" className="text-black">Manual</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing & Units Section */}
                <div className="space-y-5">
                  <h4 className="text-base font-bold text-[var(--ink)] mb-3">Pricing &amp; Units</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Daily (Rp)</label>
                      <input type="number" value={newScooter.price || ''} onChange={e => setNewScooter({ ...newScooter, price: parseInt(e.target.value) || 0 })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Weekly (Rp)</label>
                      <input type="number" value={newScooter.priceWeekly || ''} onChange={e => setNewScooter({ ...newScooter, priceWeekly: parseInt(e.target.value) || 0 })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Monthly (Rp)</label>
                      <input type="number" value={newScooter.priceMonthly || ''} onChange={e => setNewScooter({ ...newScooter, priceMonthly: parseInt(e.target.value) || 0 })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">How Many Units In Your Fleet? (Total Units)</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={newScooter.totalUnits} 
                      onChange={e => {
                        const val = e.target.value === '' ? ('' as any) : Math.max(1, parseInt(e.target.value) || 1);
                        setNewScooter({ 
                          ...newScooter, 
                          totalUnits: val,
                          availableUnits: typeof val === 'number' ? val : 1
                        });
                      }} 
                      className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" 
                    />
                    <p className="text-xs text-[var(--muted-ink)] mt-1.5">All {newScooter.totalUnits || 1} units will automatically be set as available for rent. You can adjust availability later using the Return &amp; Rent Out buttons.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={isPublishing}
                    onClick={handlePublishScooter}
                    className="w-full cirrel-btn-primary py-4 font-bold text-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                    {isPublishing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Publish"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingScooter && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="cirrel-modal rounded-[30px] p-6 md:p-8 w-full max-w-md max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 text-[var(--ink)]">
              <div className="relative z-10 flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-2xl font-bold">Edit Scooter</h3>
                <button onClick={() => setEditingScooter(null)} className="cirrel-ibtn w-9 h-9 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="relative z-10 space-y-4 overflow-y-auto px-1 -mx-1 flex-1">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Name</label>
                  <input type="text" value={editingScooter.name} onChange={e => setEditingScooter({ ...editingScooter, name: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Brand</label>
                    <input type="text" value={editingScooter.brand || ''} onChange={e => setEditingScooter({ ...editingScooter, brand: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Engine (CC)</label>
                    <input type="text" value={editingScooter.cc || ''} onChange={e => setEditingScooter({ ...editingScooter, cc: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Year</label>
                    <input type="text" value={editingScooter.year} onChange={e => setEditingScooter({ ...editingScooter, year: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Fuel Capacity (L)</label>
                    <input type="text" value={editingScooter.fuelCapacity || ''} onChange={e => setEditingScooter({ ...editingScooter, fuelCapacity: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Transmission</label>
                    <select value={editingScooter.transmission || ''} onChange={e => setEditingScooter({ ...editingScooter, transmission: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold appearance-none">
                      <option value="" className="text-black">Select</option>
                      <option value="Automatic" className="text-black">Automatic</option>
                      <option value="Manual" className="text-black">Manual</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Daily (Rp)</label>
                    <input type="number" value={editingScooter.price} onChange={e => setEditingScooter({ ...editingScooter, price: parseInt(e.target.value) || 0 })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Weekly (Rp)</label>
                    <input type="number" value={editingScooter.priceWeekly || ''} onChange={e => setEditingScooter({ ...editingScooter, priceWeekly: parseInt(e.target.value) || 0 })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Monthly (Rp)</label>
                    <input type="number" value={editingScooter.priceMonthly || ''} onChange={e => setEditingScooter({ ...editingScooter, priceMonthly: parseInt(e.target.value) || 0 })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Total Units</label>
                  <input type="number" min="1" value={editingScooter.totalUnits} onChange={e => setEditingScooter({ ...editingScooter, totalUnits: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                </div>
              </div>
              <div className="relative z-10 shrink-0 pt-4">
                <button
                  disabled={isPublishing}
                  onClick={handleUpdateScooter}
                  className="w-full cirrel-btn-primary disabled:opacity-50 py-4 font-bold text-sm hover:scale-[1.01] transition-all cursor-pointer">
                  {isPublishing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Service Scooter Modal */}
        {isAddingServiceScooter && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="cirrel-modal rounded-[30px] p-6 md:p-8 w-full max-w-md animate-in zoom-in-95 duration-200 text-[var(--ink)]">
              <div className="relative z-10 flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Add Service Scooter</h3>
                <button onClick={() => setIsAddingServiceScooter(false)} className="cirrel-ibtn w-9 h-9 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="relative z-10 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Scooter Name</label>
                  <input type="text" placeholder="e.g. Yamaha NMAX" value={newServiceScooter.name} onChange={e => setNewServiceScooter({ ...newServiceScooter, name: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Plate Number</label>
                  <input type="text" placeholder="e.g. DK 1823 XA" value={newServiceScooter.plate} onChange={e => setNewServiceScooter({ ...newServiceScooter, plate: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!newServiceScooter.name || !newServiceScooter.plate) return;
                  setServiceLogs([...serviceLogs, { ...newServiceScooter, id: Date.now(), odo: "0", oil: "N/A", service: "N/A", nextOil: "N/A", nextService: "N/A" }]);
                  setIsAddingServiceScooter(false);
                  setNewServiceScooter({ name: "", plate: "", odo: "", oil: "", service: "", nextOil: "", nextService: "" });
                }}
                className="relative z-10 w-full mt-8 cirrel-btn-primary py-4 font-bold text-sm hover:scale-[1.01] transition-all cursor-pointer">
                Add to Service Tracker
              </button>
            </div>
          </div>
        )}

        {/* Edit Service Log Modal */}
        {editingServiceLog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="cirrel-modal rounded-[30px] p-6 md:p-8 w-full max-w-md animate-in zoom-in-95 duration-200 text-[var(--ink)]">
              <div className="relative z-10 flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Update Log</h3>
                  <p className="text-sm font-bold text-[var(--muted-ink)] mt-1">{editingServiceLog.name} • {editingServiceLog.plate}</p>
                </div>
                <button onClick={() => setEditingServiceLog(null)} className="cirrel-ibtn w-9 h-9 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="relative z-10 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Odometer (km)</label>
                  <input type="text" value={editingServiceLog.odo} onChange={e => setEditingServiceLog({ ...editingServiceLog, odo: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Last Oil</label>
                    <input type="text" value={editingServiceLog.oil} onChange={e => setEditingServiceLog({ ...editingServiceLog, oil: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--accent-text)] uppercase tracking-wide mb-1.5">Next Oil</label>
                    <input type="text" value={editingServiceLog.nextOil || ''} onChange={e => setEditingServiceLog({ ...editingServiceLog, nextOil: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold text-[var(--accent-text)]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide mb-1.5">Last Service</label>
                    <input type="text" value={editingServiceLog.service} onChange={e => setEditingServiceLog({ ...editingServiceLog, service: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--bad)] uppercase tracking-wide mb-1.5">Next Service</label>
                    <input type="text" value={editingServiceLog.nextService || ''} onChange={e => setEditingServiceLog({ ...editingServiceLog, nextService: e.target.value })} className="cirrel-input w-full rounded-[14px] px-4 py-3.5 text-sm font-bold text-[var(--bad)]" />
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setServiceLogs(logs => logs.map(l => l.id === editingServiceLog.id ? editingServiceLog : l));
                  setEditingServiceLog(null);
                }}
                className="relative z-10 w-full mt-8 cirrel-btn-primary py-4 font-bold text-sm hover:scale-[1.01] transition-all cursor-pointer">
                Save Updates
              </button>
            </div>
          </div>
        )}


      </main>

      {/* 
        ========================================================================
        CIRREL FLOATING MOBILE PILL TABBAR
        ========================================================================
      */}
      <nav className="md:hidden fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 cirrel-modal z-50 rounded-full p-1.5 shadow-lg">
        <div className="relative z-10 flex justify-between items-center gap-1">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 py-2 px-1 rounded-full transition-all flex-1 cursor-pointer ${activeTab === 'home' ? 'cirrel-btn-primary text-white' : 'text-[var(--muted-ink)] hover:text-[var(--ink)]'}`}>
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button onClick={() => setActiveTab('fleet')} className={`flex flex-col items-center gap-1 py-2 px-1 rounded-full transition-all flex-1 cursor-pointer ${activeTab === 'fleet' ? 'cirrel-btn-primary text-white' : 'text-[var(--muted-ink)] hover:text-[var(--ink)]'}`}>
            <Bike className="w-4 h-4" />
            <span className="text-[10px] font-bold">Fleet</span>
          </button>

          <button onClick={() => setActiveTab('bookings')} className={`flex flex-col items-center gap-1 py-2 px-1 rounded-full transition-all flex-1 relative cursor-pointer ${activeTab === 'bookings' ? 'cirrel-btn-primary text-white' : 'text-[var(--muted-ink)] hover:text-[var(--ink)]'}`}>
            <div className="relative">
              {bookingsList.length > 0 && <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-[#ff6f66] rounded-full" />}
              <CalendarDays className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold">Bookings</span>
          </button>

          <button onClick={() => setActiveTab('maintenance')} className={`flex flex-col items-center gap-1 py-2 px-1 rounded-full transition-all flex-1 cursor-pointer ${activeTab === 'maintenance' ? 'cirrel-btn-primary text-white' : 'text-[var(--muted-ink)] hover:text-[var(--ink)]'}`}>
            <Wrench className="w-4 h-4" />
            <span className="text-[10px] font-bold truncate max-w-full">Service</span>
          </button>

          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 py-2 px-1 rounded-full transition-all flex-1 cursor-pointer ${activeTab === 'profile' || activeTab === 'settings' ? 'cirrel-btn-primary text-white' : 'text-[var(--muted-ink)] hover:text-[var(--ink)]'}`}>
            <User className="w-4 h-4" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
