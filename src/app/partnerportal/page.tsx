"use client"

import { useState, useEffect } from "react"
import { Bike, DollarSign, CalendarDays, Settings, Bell, Search, Star, Plus, QrCode, Home, Wallet, User, ChevronRight, ChevronLeft, TrendingUp, Wrench, MoreVertical, CheckCircle2, Clock, X, ChevronDown, List, Calendar as CalendarIcon, Camera, Loader2, LogOut, RotateCcw, Check, XCircle, Store, Calendar, ArrowUpRight } from "lucide-react"
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

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("home")
  const [vendorLocation, setVendorLocation] = useState<[number, number]>([-8.5069, 115.2625])
  const [vendorData, setVendorData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const refreshData = async (vData: any) => {
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
      const today = new Date().toISOString().split('T')[0]
      const toComplete: any[] = []

      const formatted = bookingsData.map((b: any) => {
        let rawStatus = (b.status || 'pending').toLowerCase()

        if (rawStatus === 'confirmed' && b.end_date && b.end_date < today) {
          rawStatus = 'completed'
          toComplete.push(b)
        }

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
          startDate: new Date(b.start_date || b.created_at),
          endDate: new Date(b.end_date || b.created_at),
          price: Number(b.total_price) || 0,
          created_at: b.created_at,
          scooter_obj: b.scooters
        }
      })
      setBookingsList(formatted)

      // Asynchronously complete past bookings in background without blocking render
      if (toComplete.length > 0) {
        (async () => {
          for (const b of toComplete) {
            try {
              await supabase.from('bookings').update({ status: 'completed' }).eq('id', b.id)
              if (b.scooter_id && b.scooters) {
                const currentAvail = b.scooters.available_units ?? 0
                const totalUnits = b.scooters.total_units ?? 1
                const qty = Number(b.quantity) || 1
                const newAvail = Math.min(totalUnits, currentAvail + qty)
                await supabase.from('scooters').update({ available_units: newAvail }).eq('id', b.scooter_id)
              }
            } catch (err) {
              console.warn("Background auto-complete error for partner booking:", b.id, err)
            }
          }
        })()
      }
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
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', booking.id)

      if (!error) {
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
      total_units: newScooter.totalUnits,
      available_units: newScooter.availableUnits,
      image_url: newScooter.photos[0] // Save the first photo
    }).select().single()

    setIsPublishing(false)

    if (!error && data) {
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
    delivery_area: ""
  })
  const [vendorLogo, setVendorLogo] = useState<string | null>(null)
  const [vendorCover, setVendorCover] = useState<string | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Initialize settings when vendorData loads
  useEffect(() => {
    if (vendorData) {
      setSettingsForm({
        name: vendorData.name || "",
        phone: vendorData.phone || "",
        address: vendorData.address || "",
        opening_hours: vendorData.opening_hours || "08:00 AM – 08:00 PM Daily",
        delivery_area: vendorData.delivery_area || ""
      })
      if (vendorData.logo) {
        setVendorLogo(vendorData.logo)
      }
      if (vendorData.image_url) {
        setVendorCover(vendorData.image_url)
      }
    }
  }, [vendorData])

  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    const { error } = await supabase
      .from('vendors')
      .update({
        name: settingsForm.name,
        phone: settingsForm.phone,
        address: settingsForm.address,
        opening_hours: settingsForm.opening_hours,
        delivery_area: settingsForm.delivery_area,
        lat: vendorLocation[0],
        lng: vendorLocation[1],
        logo: vendorLogo,
        image_url: vendorCover
      })
      .eq('id', vendorData.id)
      
    setIsSavingSettings(false)
    if (!error) {
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
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] md:flex md:pl-64 pb-28 md:pb-0">
      {/* 
        ========================================================================
        DESKTOP SIDEBAR
        ========================================================================
      */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 shadow-sm">
        <div className="p-6">
          <Link href="/" className="inline-block">
            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">THE BIKE RENTAL</h2>
            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Partner Portal</p>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2">
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'home' ? 'bg-black text-white shadow-md shadow-black/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
            <Home className="w-5 h-5" />
            <span className="font-bold text-[15px]">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('fleet')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'fleet' ? 'bg-black text-white shadow-md shadow-black/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
            <Bike className="w-5 h-5" />
            <span className="font-semibold text-[15px]">My Fleet</span>
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors relative ${activeTab === 'bookings' ? 'bg-black text-white shadow-md shadow-black/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
            <CalendarDays className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Bookings</span>
            {bookingsList.length > 0 && <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{bookingsList.length}</span>}
          </button>
          <button onClick={() => setActiveTab('earnings')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'earnings' ? 'bg-black text-white shadow-md shadow-black/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
            <Wallet className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Earnings</span>
          </button>
          <button onClick={() => setActiveTab('maintenance')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'maintenance' ? 'bg-black text-white shadow-md shadow-black/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
            <Wrench className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Maintenance</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'settings' ? 'bg-black text-white shadow-md shadow-black/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
            <Settings className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Settings</span>
          </button>
        </nav>

        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-[2px] shrink-0">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span className="font-bold text-gray-800 text-xs">{(vendorData?.name || "V").charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{vendorData?.name || "Vendor"}</p>
              <p className="text-[11px] font-medium text-green-600 truncate">Verified Partner</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-2.5 rounded-xl hover:bg-red-100 transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* 
        ========================================================================
        MAIN CONTENT
        ========================================================================
      */}
      <main className="flex-1 w-full max-w-full md:max-w-4xl lg:max-w-5xl mx-auto flex flex-col min-h-screen pt-4 md:pt-8">

        {/* Dashboard Content */}
        {activeTab === 'home' ? (
          <div className="p-5 md:px-8 md:pb-12 space-y-6 md:space-y-8">

            {/* Quick Actions (App-like) */}
            <div className="flex flex-col gap-3 md:hidden">
              <Link href="#" className="bg-black text-white p-4 rounded-[20px] flex flex-col items-center justify-center gap-2 shadow-lg shadow-black/20 active:scale-95 transition-transform">
                <div className="bg-white/20 p-2 rounded-full">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-bold text-[13px]">Add Scooter</span>
              </Link>
            </div>

            {/* Stats Row */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-200 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-50"></div>
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <h3 className="text-[13px] md:text-[14px] font-bold text-gray-500 uppercase tracking-wide">Net Profit</h3>
                    </div>
                    <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      Rp {totalNetEarnings.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 md:mt-3 bg-gray-50 text-gray-500 w-fit px-2.5 py-1 rounded-full">
                      <span className="text-[11px] md:text-xs font-bold">
                        {confirmedOrCompleted.length} {confirmedOrCompleted.length === 1 ? 'booking' : 'bookings'} total
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-200 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-50"></div>
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Bike className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <h3 className="text-[13px] md:text-[14px] font-bold text-gray-500 uppercase tracking-wide">Active Rentals</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{activeRentalsCount}</p>
                      <span className="text-sm md:text-base font-bold text-gray-400">/ {totalFleetUnits} units</span>
                    </div>
                    <p className="text-[12px] md:text-[13px] font-semibold text-gray-500 mt-2 md:mt-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {availableFleetUnits} available for booking
                    </p>
                  </div>

                  <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-200 transition-colors sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full opacity-50"></div>
                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                        <Star className="w-5 h-5 md:w-6 md:h-6 fill-orange-500" />
                      </div>
                      <h3 className="text-[13px] md:text-[14px] font-bold text-gray-500 uppercase tracking-wide">Avg Rating</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">5.0</p>
                    </div>
                    <p className="text-[12px] md:text-[13px] font-semibold text-gray-500 mt-2 md:mt-3">
                      Based on <span className="text-black">Verified partner reviews</span>
                    </p>
                  </div>
                </div>
              )
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Active Bookings (App-like List for Mobile, Table-like for Desktop) */}
              <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
                <div className="p-5 md:p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-[13px] md:text-sm font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 md:p-4 flex-1">
                  {bookingsList.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-medium text-sm">
                      No recent bookings yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {bookingsList.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="p-3 md:p-4 rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-between gap-4 border border-gray-50">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-11 h-11 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={booking.scooter_img} alt="Scooter" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm truncate">{booking.scooter}</h4>
                              <p className="text-xs text-gray-500 truncate">{booking.customer} {booking.phone ? `• ${booking.phone}` : ''}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-black text-gray-900 text-sm">Rp {booking.price.toLocaleString()}</p>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Desktop / Need Attention */}
              <div className="bg-black rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[250px]">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Need Attention</h3>
                  <p className="text-gray-400 text-sm font-medium">You have tasks that require your immediate action.</p>
                </div>

                <div className="relative z-10 mt-6 space-y-3">
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No pending actions required.
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : activeTab === 'fleet' ? (
          <div className="p-5 md:px-8 pb-12 animate-in fade-in">
            <div className="mb-6 space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div className="relative w-max shrink-0">
                  <select
                    value={fleetFilter}
                    onChange={(e) => setFleetFilter(e.target.value)}
                    className="text-xl md:text-2xl font-black text-gray-900 bg-transparent outline-none cursor-pointer appearance-none pr-8 pl-1"
                    style={{ WebkitAppearance: 'none' }}
                  >
                    <option value="All">All Scooters</option>
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
                <button onClick={() => setIsAddingScooter(true)} className="bg-black text-white px-4 py-2.5 rounded-[14px] text-[13px] font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-md shadow-black/10 shrink-0">
                  <Plus className="w-4 h-4" /> Add Scooter
                </button>
              </div>
              <div className="relative w-full">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fleet..."
                  value={fleetSearch}
                  onChange={(e) => setFleetSearch(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-[16px] pl-12 pr-4 py-4 text-[15px] font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  <div key={scooter.id} className="bg-white p-5 md:p-6 rounded-[28px] border border-gray-100 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all relative group">
                    <div className="flex items-center gap-5">
                      <div className="w-24 h-24 bg-gray-50 rounded-[20px] p-2 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={scooter.image_url || "/images/scooter.png"} alt="Scooter" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-900 text-lg md:text-xl truncate pr-2" title={scooter.name}>{scooter.name}</h3>
                          <button onClick={() => setEditingScooter({
                            ...scooter,
                            price: scooter.price_daily || 0,
                            priceWeekly: scooter.price_weekly || '',
                            priceMonthly: scooter.price_monthly || '',
                            totalUnits: scooter.total_units || 1,
                            cc: scooter.engine || '',
                            fuelCapacity: scooter.fuel_capacity || '',
                            transmission: scooter.transmission || ''
                          })} className="text-gray-400 hover:text-black p-1 shrink-0">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-[13px] font-bold text-gray-900 mb-3">Rp {(scooter.price_daily || scooter.price || 0).toLocaleString()} <span className="text-gray-500 font-normal">/day</span> • {scooter.year || new Date().getFullYear()}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`px-2.5 py-1.5 rounded-[10px] text-[10px] md:text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5 w-fit ${availableUnits > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {availableUnits > 0 ? <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> : null}
                            {availableUnits} / {totalUnits} Available
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                      <button
                        disabled={availableUnits >= totalUnits}
                        onClick={async () => {
                          const newAvail = availableUnits + 1;
                          setFleet(f => f.map(s => s.id === scooter.id ? { ...s, available_units: newAvail } : s));
                          await supabase.from('scooters').update({ available_units: newAvail }).eq('id', scooter.id);
                        }}
                        className={`py-3 rounded-[14px] font-bold text-sm transition-all ${availableUnits < totalUnits ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed'}`}
                      >
                        Return
                      </button>
                      <button
                        disabled={availableUnits === 0}
                        onClick={async () => {
                          const newAvail = Math.max(0, availableUnits - 1);
                          setFleet(f => f.map(s => s.id === scooter.id ? { ...s, available_units: newAvail } : s));
                          await supabase.from('scooters').update({ available_units: newAvail }).eq('id', scooter.id);
                        }}
                        className={`py-3 rounded-[14px] font-bold text-sm transition-all ${availableUnits > 0 ? 'bg-black text-white hover:bg-gray-800 hover:scale-[1.02] shadow-md shadow-black/10' : 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed'}`}
                      >
                        Rent Out
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
                  <div className="col-span-full py-12 text-center text-gray-400 font-bold">No scooters found for this filter.</div>
                )}
            </div>
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="p-5 md:px-8 pb-12 animate-in fade-in space-y-6">
            {/* Top Navigation & Smart Calendar Header */}
            <div className="bg-white rounded-3xl border-2 border-black/80 shadow-sm p-4 md:p-6 space-y-5">
              {/* Month Navigator Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 capitalize tracking-tight">
                      {formatMonthYear(activeMonthDate)}
                    </h2>
                    <p className="text-xs font-bold text-gray-500">
                      Smart Period Bookings & Net Profit Overview
                    </p>
                  </div>
                </div>

                {/* Month Controls */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={handlePrevMonth}
                    title="Previous Month"
                    className="p-2.5 rounded-xl border-2 border-black hover:bg-black hover:text-white transition-colors cursor-pointer text-black"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleThisMonth}
                    className="px-3.5 py-2 rounded-xl text-xs font-black border-2 border-black bg-white hover:bg-black hover:text-white transition-colors cursor-pointer text-black"
                  >
                    This Month
                  </button>
                  <button
                    onClick={handleNextMonth}
                    title="Next Month"
                    className="p-2.5 rounded-xl border-2 border-black hover:bg-black hover:text-white transition-colors cursor-pointer text-black"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 7-Day Quick Strip Navigator with booking count indicator badges */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                      7-Day Strip
                    </span>
                    {selectedCalendarDate && (
                      <span className="text-[11px] font-bold text-gray-500">
                        (Filtered on {formatIndoDate(selectedCalendarDate)})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevWeek}
                      className="p-1.5 rounded-lg border border-gray-300 hover:border-black text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                      title="Previous 7 Days"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleToday}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-black border border-gray-300 hover:border-black text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      onClick={handleNextWeek}
                      className="p-1.5 rounded-lg border border-gray-300 hover:border-black text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                      title="Next 7 Days"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                  {get7Days(calendarStartDate).map((dateObj, idx) => {
                    const year = dateObj.getFullYear()
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
                    const day = String(dateObj.getDate()).padStart(2, '0')
                    const isoDate = `${year}-${month}-${day}`

                    const isSelected = selectedCalendarDate === isoDate
                    const isToday = new Date().toDateString() === dateObj.toDateString()
                    const count = getBookingsCountForDate(dateObj)
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCalendarDate(null)
                          } else {
                            setSelectedCalendarDate(isoDate)
                            if (dateObj.getMonth() !== activeMonthDate.getMonth() || dateObj.getFullYear() !== activeMonthDate.getFullYear()) {
                              setActiveMonthDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1))
                            }
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                            : isToday
                            ? 'bg-gray-100 text-black border-black font-black'
                            : 'bg-white text-gray-800 border-gray-200 hover:border-black'
                        }`}
                      >
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                          {dayName}
                        </span>
                        <span className="text-sm sm:text-base font-black my-0.5">
                          {dateObj.getDate()}
                        </span>

                        {count > 0 ? (
                          <span className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full mt-0.5 ${
                            isSelected
                              ? 'bg-white text-black'
                              : 'bg-black text-white'
                          }`}>
                            {count}
                          </span>
                        ) : (
                          <span className={`text-[9px] sm:text-[10px] font-bold ${isSelected ? 'text-gray-400' : 'text-gray-300'}`}>
                            -
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

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
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        bookingFilter === 'all'
                          ? 'ring-2 ring-black bg-black text-white border-black shadow-md'
                          : 'bg-white border-black/80 text-gray-900 hover:border-black shadow-xs'
                      }`}
                    >
                      <p className={`text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 truncate whitespace-nowrap ${bookingFilter === 'all' ? 'text-gray-300' : 'text-gray-500'}`}>
                        <CalendarDays className="w-3.5 h-3.5 shrink-0" /> Total Bookings
                      </p>
                      <p className="text-xl md:text-2xl font-black mt-1">
                        {periodBookings.length}
                      </p>
                    </div>

                    <div
                      onClick={() => setBookingFilter('pending')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        bookingFilter === 'pending'
                          ? 'ring-2 ring-black bg-black text-white border-black shadow-md'
                          : 'bg-white border-black/80 text-gray-900 hover:border-black shadow-xs'
                      }`}
                    >
                      <p className={`text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 truncate whitespace-nowrap ${bookingFilter === 'pending' ? 'text-gray-300' : 'text-gray-500'}`}>
                        <Clock className="w-3.5 h-3.5 shrink-0" /> Pending Review
                      </p>
                      <p className="text-xl md:text-2xl font-black mt-1">
                        {periodPending.length}
                      </p>
                    </div>

                    <div
                      onClick={() => setBookingFilter('confirmed')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        bookingFilter === 'confirmed'
                          ? 'ring-2 ring-black bg-black text-white border-black shadow-md'
                          : 'bg-white border-black/80 text-gray-900 hover:border-black shadow-xs'
                      }`}
                    >
                      <p className={`text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 truncate whitespace-nowrap ${bookingFilter === 'confirmed' ? 'text-gray-300' : 'text-gray-500'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Confirmed
                      </p>
                      <p className="text-xl md:text-2xl font-black mt-1">
                        {periodConfirmed.length}
                      </p>
                    </div>

                    <div
                      onClick={() => setBookingFilter('completed')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        bookingFilter === 'completed'
                          ? 'ring-2 ring-black bg-black text-white border-black shadow-md'
                          : 'bg-white border-black/80 text-gray-900 hover:border-black shadow-xs'
                      }`}
                    >
                      <p className={`text-[11px] font-bold uppercase tracking-wide flex items-center gap-1 truncate whitespace-nowrap ${bookingFilter === 'completed' ? 'text-gray-300' : 'text-gray-500'}`}>
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" /> Completed
                      </p>
                      <p className="text-xl md:text-2xl font-black mt-1">
                        {periodCompleted.length}
                      </p>
                    </div>
                  </div>

                  {/* Section Header with Search */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm md:text-base font-black text-gray-900">
                        Bookings List
                      </h3>
                      <span className="text-xs font-bold text-gray-500">
                        ({filteredList.length} {filteredList.length === 1 ? 'Booking' : 'Bookings'})
                      </span>

                      {selectedCalendarDate && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-black bg-gray-100 px-2.5 py-1 rounded-xl border border-gray-300 ml-1">
                          <Calendar className="w-3 h-3 text-black" />
                          <span>{formatIndoDate(selectedCalendarDate)}</span>
                          <button
                            onClick={() => setSelectedCalendarDate(null)}
                            className="ml-1 text-black hover:opacity-70 font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="relative flex items-center min-w-[200px] sm:min-w-[260px]">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={bookingSearchQuery}
                        onChange={(e) => setBookingSearchQuery(e.target.value)}
                        placeholder="Search scooter, customer..."
                        className="w-full bg-white border border-gray-300 focus:border-black text-xs font-bold text-black rounded-xl pl-9 pr-3 py-2 outline-none shadow-xs transition-all"
                      />
                      {bookingSearchQuery && (
                        <button
                          onClick={() => setBookingSearchQuery('')}
                          className="absolute right-2.5 text-gray-400 hover:text-black text-xs font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bookings List Cards (100% same card design as admin dashboard) */}
                  <div className="space-y-4">
                    {filteredList.length === 0 ? (
                      <div className="bg-white p-12 text-center text-gray-500 font-bold rounded-3xl border-2 border-gray-200">
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
                            className="bg-white p-4 md:p-5 rounded-3xl border-2 border-black/80 shadow-sm space-y-3.5 hover:border-black transition-all"
                          >
                            {/* Top Row: Scooter, Company Profile, Customer & Status */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3.5 min-w-0">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-200 p-1 flex items-center justify-center">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={booking.scooter_img || "/images/scooter.png"} alt="Scooter" className="w-full h-full object-contain" />
                                </div>
                                <div className="min-w-0 space-y-1.5">
                                  {/* Line 1: Scooter Title & Quantity Badge */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="font-black text-black text-sm md:text-base leading-tight">{booking.scooter}</h5>
                                    <span className="text-[10px] md:text-[11px] font-black bg-black text-white px-2 py-0.5 rounded-full shrink-0">
                                      {booking.quantity} {booking.quantity > 1 ? 'Units' : 'Unit'}
                                    </span>
                                  </div>

                                  {/* Line 2: Company Profile Image and Customer Badge */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-lg w-fit">
                                      <div className="w-4 h-4 rounded-md bg-black text-white text-[8px] font-black flex items-center justify-center shrink-0 overflow-hidden">
                                        {vendorData?.logo_url || vendorData?.logo || vendorData?.image_url ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img src={vendorData?.logo_url || vendorData?.logo || vendorData?.image_url} alt="Vendor" className="w-full h-full object-cover" />
                                        ) : (
                                          <span>{vendorData?.name ? vendorData.name.substring(0, 2).toUpperCase() : 'VN'}</span>
                                        )}
                                      </div>
                                      <span className="text-[10px] md:text-[11px] font-black text-black truncate max-w-[140px] sm:max-w-[200px]">
                                        {vendorData?.name || 'Partner Vendor'}
                                      </span>
                                    </div>

                                    {/* Customer info */}
                                    <p className="text-xs font-medium text-black truncate">
                                      Customer: <strong className="text-black font-black">{booking.customer}</strong> {booking.phone ? `(${booking.phone})` : ''}
                                    </p>
                                  </div>

                                  {/* Line 3: Compact Single-Line Date Section */}
                                  <div className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-gray-700 whitespace-nowrap truncate">
                                    <Calendar className="w-3.5 h-3.5 text-black shrink-0" />
                                    <span>{formatRentalPeriod(booking.startDate, booking.endDate)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge + Rounded Duration Badge */}
                              <div className="flex items-center gap-2 flex-wrap self-start">
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 inline-flex items-center gap-1.5 ${
                                  booking.rawStatus === 'pending'
                                    ? 'bg-white text-black border-black border-dashed'
                                    : booking.rawStatus === 'confirmed'
                                    ? 'bg-black text-white border-black'
                                    : booking.rawStatus === 'completed'
                                    ? 'bg-gray-100 text-black border-gray-300'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                                }`}>
                                  {booking.rawStatus === 'confirmed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                  {booking.rawStatus === 'pending' && <Clock className="w-3 h-3 text-black" />}
                                  {booking.rawStatus === 'completed' && <RotateCcw className="w-3 h-3 text-black" />}
                                  <span>{booking.status}</span>
                                </span>

                                {/* Rounded Rental Duration Badge */}
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-black border border-gray-300 inline-flex items-center gap-1 shrink-0">
                                  <span>{rentalDays} {rentalDays > 1 ? 'Days' : 'Day'}</span>
                                </span>
                              </div>
                            </div>

                            {/* Price and Net Price / Commission Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gray-50 rounded-2xl p-3 md:p-3.5 border border-gray-200">
                              <div>
                                <p className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-wider">Total Customer Price</p>
                                <p className="font-black text-black text-sm md:text-base">Rp {booking.price.toLocaleString()}</p>
                              </div>

                              <div className="flex items-center gap-3 justify-between sm:justify-end">
                                <div className="text-left sm:text-right">
                                  <p className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-wider">Pay Commission</p>
                                  <p className="text-xs md:text-sm font-black text-red-600">-Rp {bookingCommission.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-wider">Your Profit (Net Price)</p>
                                  <div className="mt-0.5">
                                    <span className="bg-black text-white font-black text-xs md:text-sm px-3 py-1 rounded-xl inline-flex items-center gap-1 shadow-xs">
                                      Rp {vendorNetProfit.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Enlarged Half and Half (50% / 50%) Action Buttons */}
                            <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
                              {booking.rawStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleConfirmBooking(booking)}
                                    disabled={processingBookingId === booking.id}
                                    className="w-full bg-black hover:bg-neutral-800 active:scale-95 text-white text-xs md:text-sm font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    {processingBookingId === booking.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : (
                                      <Check className="w-4 h-4 text-white" />
                                    )}
                                    <span>Confirm Booking</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectBooking(booking)}
                                    disabled={processingBookingId === booking.id}
                                    className="w-full bg-white hover:bg-gray-100 active:scale-95 text-black border-2 border-black text-xs md:text-sm font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    <XCircle className="w-4 h-4 text-black" />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {booking.rawStatus === 'confirmed' && (
                                <>
                                  <div className="w-full bg-gray-100 border-2 border-black text-black font-black text-xs md:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide">
                                    <CheckCircle2 className="w-4 h-4 text-black" />
                                    <span>CONFIRMED</span>
                                  </div>
                                  <button
                                    onClick={() => handleCompleteBooking(booking)}
                                    disabled={processingBookingId === booking.id}
                                    className="w-full bg-black hover:bg-neutral-800 active:scale-95 text-white text-xs md:text-sm font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    {processingBookingId === booking.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : (
                                      <RotateCcw className="w-4 h-4 text-white" />
                                    )}
                                    <span>Mark Returned</span>
                                  </button>
                                </>
                              )}

                              {booking.rawStatus === 'completed' && (
                                <div className="col-span-2 w-full bg-gray-100 border border-gray-300 text-gray-500 font-black text-xs md:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide">
                                  <Check className="w-4 h-4 text-gray-500" />
                                  <span>Completed</span>
                                </div>
                              )}

                              {booking.rawStatus === 'rejected' && (
                                <div className="col-span-2 w-full bg-gray-100 border border-gray-300 text-gray-500 font-bold text-xs md:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide">
                                  <XCircle className="w-4 h-4 text-gray-500" />
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
          <div className="p-5 md:px-8 pb-12 animate-in fade-in">
            <div className="mb-6 space-y-4">
              <div className="flex justify-between items-center gap-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900">Maintenance Log</h2>
                <button onClick={() => setIsAddingServiceScooter(true)} className="bg-black text-white px-4 py-2.5 rounded-[14px] text-[13px] font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-md shadow-black/10 shrink-0">
                  <Plus className="w-4 h-4" /> Add Scooter
                </button>
              </div>
              <div className="relative w-full">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by plate or name..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-[16px] pl-12 pr-4 py-4 text-[15px] font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-4">
              {serviceLogs.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.plate.toLowerCase().includes(serviceSearch.toLowerCase())).map((scooter) => (
                <div key={scooter.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{scooter.name}</h3>
                      <p className="text-xs text-gray-500 font-bold mt-0.5">{scooter.plate}</p>
                    </div>
                    <button onClick={() => setEditingServiceLog(scooter)} className="ml-auto bg-gray-100 hover:bg-gray-200 text-black px-3 py-1.5 rounded-full text-xs font-bold transition-colors">
                      Record Service
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-gray-50 pt-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Odometer</p>
                      <p className="text-sm font-bold text-gray-900">{scooter.odo} km</p>
                    </div>
                    <div></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Last Oil</p>
                      <p className="text-sm font-bold text-gray-900">{scooter.oil}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-500 font-semibold uppercase mb-1">Next Oil</p>
                      <p className="text-sm font-bold text-blue-700">{scooter.nextOil || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Last Service</p>
                      <p className="text-sm font-bold text-gray-900">{scooter.service}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-red-500 font-semibold uppercase mb-1">Next Service</p>
                      <p className="text-sm font-bold text-red-700">{scooter.nextService || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
              {serviceLogs.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.plate.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && (
                <div className="py-12 text-center text-gray-400 font-bold">No records found.</div>
              )}
            </div>
          </div>
        ) : activeTab === 'profile' || activeTab === 'settings' ? (
          <div className="p-5 md:px-8 pb-12 animate-in fade-in max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
              {/* Cover Image Upload Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-4 border-b border-gray-50">
                <div className="relative group w-full sm:w-1/3">
                  <div className={`w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 transition-all ${!vendorCover ? 'group-hover:bg-gray-100 group-hover:border-gray-300' : ''}`}>
                    {vendorCover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={vendorCover} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-black text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
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
                  <h3 className="font-bold text-gray-900 text-lg">Cover Image</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload a landscape cover image for your profile header. Recommended size: 1200x600px.</p>
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-4 border-b border-gray-50">
                <div className="relative group">
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden bg-gray-50 transition-all ${!vendorLogo ? 'group-hover:bg-gray-100' : ''}`}>
                    {vendorLogo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={vendorLogo} alt="Vendor Logo" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-black text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform border-2 border-white">
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
                  <h3 className="font-bold text-gray-900 text-lg">Vendor Logo</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload a professional logo to build trust with customers. Recommended size: 500x500px.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor Name</label>
                <input type="text" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                <input type="text" value={settingsForm.phone} onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location / Address</label>
                <textarea value={settingsForm.address} onChange={e => setSettingsForm({...settingsForm, address: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all min-h-[80px] mb-4"></textarea>
                
                <label className="block text-sm font-semibold text-gray-700 mb-2">Opening / Operating Hours</label>
                <input 
                  type="text" 
                  placeholder="e.g. 08:00 AM – 08:00 PM Daily" 
                  value={settingsForm.opening_hours} 
                  onChange={e => setSettingsForm({...settingsForm, opening_hours: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all mb-1" 
                />
                <p className="text-xs text-gray-400 mb-4">Displayed on your profile for customer drop-off & pickup schedule.</p>

                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Coverage Areas</label>
                <textarea 
                  placeholder="e.g. Ubud area only - Central Ubud, Mas, Sayan, Campuhan, Penestanan & Tegallalang (Leave blank to use auto-detected coverage based on your address)" 
                  value={settingsForm.delivery_area} 
                  onChange={e => setSettingsForm({...settingsForm, delivery_area: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all min-h-[80px] mb-1"
                ></textarea>
                <p className="text-xs text-gray-400 mb-4">Specify custom covered zones and areas for hotel/villa delivery.</p>

                <label className="block text-sm font-semibold text-gray-700 mb-2">Pin Location on Map</label>
                <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm relative z-0">
                  <MapPicker position={vendorLocation} onPositionChange={(lat, lng) => setVendorLocation([lat, lng])} className="w-full h-full" />
                </div>
              </div>
              <button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full bg-black text-white rounded-xl py-3.5 font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
                {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 md:px-8 pb-12 flex flex-col items-center justify-center flex-1 min-h-[50vh] text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'earnings' && <Wallet className="w-10 h-10 text-gray-400" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Management</h2>
            <p className="text-gray-500 max-w-sm">This section is currently under development. Check back soon for updates!</p>
          </div>
        )}

        {/* Add Scooter Modal */}
        {isAddingScooter && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
            <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 pb-32">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10">
                <h3 className="text-3xl font-black tracking-tight">Add New Scooter</h3>
                <button onClick={() => setIsAddingScooter(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X className="w-6 h-6 text-black" /></button>
              </div>

              <div className="space-y-8">
                {/* Photo Upload Section */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Scooter Photos (Max 2)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((index) => (
                      <div key={index} className="border-2 border-dashed border-gray-200 rounded-2xl h-40 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors cursor-pointer bg-gray-50 relative overflow-hidden group">
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
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Vehicle Details</h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Model Name</label>
                    <input type="text" placeholder="e.g. Yamaha NMAX" value={newScooter.name} onChange={e => setNewScooter({ ...newScooter, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Brand</label>
                      <input type="text" placeholder="e.g. Yamaha" value={newScooter.brand} onChange={e => setNewScooter({ ...newScooter, brand: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Engine (CC)</label>
                      <input type="text" placeholder="e.g. 155cc" value={newScooter.cc} onChange={e => setNewScooter({ ...newScooter, cc: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Year</label>
                    <input type="text" placeholder="2024" value={newScooter.year} onChange={e => setNewScooter({ ...newScooter, year: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Fuel Capacity (L)</label>
                      <input type="text" placeholder="e.g. 7.1L" value={newScooter.fuelCapacity} onChange={e => setNewScooter({ ...newScooter, fuelCapacity: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Transmission</label>
                      <select value={newScooter.transmission} onChange={e => setNewScooter({ ...newScooter, transmission: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5 appearance-none">
                        <option value="">Select</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing & Units Section */}
                <div className="space-y-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Pricing & Units</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Daily (Rp)</label>
                      <input type="number" value={newScooter.price || ''} onChange={e => setNewScooter({ ...newScooter, price: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Weekly (Rp)</label>
                      <input type="number" value={newScooter.priceWeekly || ''} onChange={e => setNewScooter({ ...newScooter, priceWeekly: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Monthly (Rp)</label>
                      <input type="number" value={newScooter.priceMonthly || ''} onChange={e => setNewScooter({ ...newScooter, priceMonthly: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Units</label>
                    <input type="number" min="1" value={newScooter.totalUnits} onChange={e => setNewScooter({ ...newScooter, totalUnits: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={isPublishing}
                    onClick={handlePublishScooter}
                    className="w-full bg-black text-white rounded-[20px] py-4 font-black text-lg hover:scale-[1.01] shadow-xl shadow-black/10 transition-transform flex items-center justify-center gap-2 disabled:opacity-50">
                    {isPublishing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Publish"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingScooter && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-md max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-2xl font-black">Edit Scooter</h3>
                <button onClick={() => setEditingScooter(null)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <div className="space-y-4 overflow-y-auto px-1 -mx-1 flex-1">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
                  <input type="text" value={editingScooter.name} onChange={e => setEditingScooter({ ...editingScooter, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Brand</label>
                    <input type="text" value={editingScooter.brand || ''} onChange={e => setEditingScooter({ ...editingScooter, brand: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Engine (CC)</label>
                    <input type="text" value={editingScooter.cc || ''} onChange={e => setEditingScooter({ ...editingScooter, cc: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Year</label>
                    <input type="text" value={editingScooter.year} onChange={e => setEditingScooter({ ...editingScooter, year: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Fuel Capacity (L)</label>
                    <input type="text" value={editingScooter.fuelCapacity || ''} onChange={e => setEditingScooter({ ...editingScooter, fuelCapacity: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Transmission</label>
                    <select value={editingScooter.transmission || ''} onChange={e => setEditingScooter({ ...editingScooter, transmission: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5 appearance-none">
                      <option value="">Select</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Daily (Rp)</label>
                    <input type="number" value={editingScooter.price} onChange={e => setEditingScooter({ ...editingScooter, price: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Weekly (Rp)</label>
                    <input type="number" value={editingScooter.priceWeekly || ''} onChange={e => setEditingScooter({ ...editingScooter, priceWeekly: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Monthly (Rp)</label>
                    <input type="number" value={editingScooter.priceMonthly || ''} onChange={e => setEditingScooter({ ...editingScooter, priceMonthly: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Units</label>
                  <input type="number" min="1" value={editingScooter.totalUnits} onChange={e => setEditingScooter({ ...editingScooter, totalUnits: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                </div>
              </div>
              <div className="shrink-0 pt-4">
                <button
                  disabled={isPublishing}
                  onClick={handleUpdateScooter}
                  className="w-full bg-black disabled:bg-gray-400 text-white rounded-[16px] py-4 font-black text-sm hover:scale-[1.02] shadow-xl shadow-black/10 transition-all">
                  {isPublishing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Service Scooter Modal */}
        {isAddingServiceScooter && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black">Add Service Scooter</h3>
                <button onClick={() => setIsAddingServiceScooter(false)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Scooter Name</label>
                  <input type="text" placeholder="e.g. Yamaha NMAX" value={newServiceScooter.name} onChange={e => setNewServiceScooter({ ...newServiceScooter, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Plate Number</label>
                  <input type="text" placeholder="e.g. DK 1823 XA" value={newServiceScooter.plate} onChange={e => setNewServiceScooter({ ...newServiceScooter, plate: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!newServiceScooter.name || !newServiceScooter.plate) return;
                  setServiceLogs([...serviceLogs, { ...newServiceScooter, id: Date.now(), odo: "0", oil: "N/A", service: "N/A", nextOil: "N/A", nextService: "N/A" }]);
                  setIsAddingServiceScooter(false);
                  setNewServiceScooter({ name: "", plate: "", odo: "", oil: "", service: "", nextOil: "", nextService: "" });
                }}
                className="w-full mt-8 bg-black text-white rounded-[16px] py-4 font-black text-sm hover:scale-[1.02] shadow-xl shadow-black/10 transition-all">
                Add to Service Tracker
              </button>
            </div>
          </div>
        )}

        {/* Edit Service Log Modal */}
        {editingServiceLog && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black">Update Log</h3>
                  <p className="text-sm font-bold text-gray-500 mt-1">{editingServiceLog.name} • {editingServiceLog.plate}</p>
                </div>
                <button onClick={() => setEditingServiceLog(null)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Odometer (km)</label>
                  <input type="text" value={editingServiceLog.odo} onChange={e => setEditingServiceLog({ ...editingServiceLog, odo: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Last Oil</label>
                    <input type="text" value={editingServiceLog.oil} onChange={e => setEditingServiceLog({ ...editingServiceLog, oil: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase tracking-wide mb-1.5">Next Oil</label>
                    <input type="text" value={editingServiceLog.nextOil || ''} onChange={e => setEditingServiceLog({ ...editingServiceLog, nextOil: e.target.value })} className="w-full bg-blue-50 border border-blue-100 rounded-[16px] px-4 py-3.5 text-sm font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Last Service</label>
                    <input type="text" value={editingServiceLog.service} onChange={e => setEditingServiceLog({ ...editingServiceLog, service: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-500 uppercase tracking-wide mb-1.5">Next Service</label>
                    <input type="text" value={editingServiceLog.nextService || ''} onChange={e => setEditingServiceLog({ ...editingServiceLog, nextService: e.target.value })} className="w-full bg-red-50 border border-red-100 rounded-[16px] px-4 py-3.5 text-sm font-bold text-red-700 outline-none focus:ring-2 focus:ring-red-500/20" />
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setServiceLogs(logs => logs.map(l => l.id === editingServiceLog.id ? editingServiceLog : l));
                  setEditingServiceLog(null);
                }}
                className="w-full mt-8 bg-black text-white rounded-[16px] py-4 font-black text-sm hover:scale-[1.02] shadow-xl shadow-black/10 transition-all">
                Save Updates
              </button>
            </div>
          </div>
        )}


      </main>

      {/* 
        ========================================================================
        MOBILE BOTTOM NAVBAR
        ========================================================================
      */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center pt-3 pb-8 px-4 sm:px-6">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors flex-1 group ${activeTab === 'home' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'home' ? 'bg-black/5' : 'group-hover:bg-black/5'} p-1.5 rounded-full transition-colors`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button onClick={() => setActiveTab('fleet')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors flex-1 group ${activeTab === 'fleet' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'fleet' ? 'bg-black/5' : 'group-hover:bg-black/5'} p-1.5 rounded-full transition-colors`}>
              <Bike className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Fleet</span>
          </button>

          <button onClick={() => setActiveTab('bookings')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors flex-1 group relative ${activeTab === 'bookings' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'bookings' ? 'bg-black/5' : 'group-hover:bg-black/5'} p-1.5 rounded-full transition-colors relative`}>
              {bookingsList.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Bookings</span>
          </button>

          <button onClick={() => setActiveTab('maintenance')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors flex-1 group ${activeTab === 'maintenance' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'maintenance' ? 'bg-black/5' : 'group-hover:bg-black/5'} p-1.5 rounded-full transition-colors`}>
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold truncate max-w-full">Service</span>
          </button>

          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors flex-1 group ${activeTab === 'profile' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'profile' ? 'bg-black/5' : 'group-hover:bg-black/5'} p-1.5 rounded-full transition-colors`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
