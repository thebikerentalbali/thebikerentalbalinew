"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Users, Bike, DollarSign, Settings, Bell, Search, Store, BarChart3, Home, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Calendar, TrendingUp, CalendarDays, MoreVertical, Filter, ArrowUpRight, CheckCircle2, AlertCircle, Menu, UserCheck, MoreHorizontal, Loader2, XCircle, RotateCcw, Clock, Check, Calculator, Sparkles, Coins, LogOut, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getPlatformSettings, savePlatformSettings, calculateBookingCommission, calculateRentalDays, fetchPlatformSettings, subscribeToPlatformSettings, PlatformSettings, DEFAULT_PLATFORM_SETTINGS } from "@/utils/pricing"

export default function AdminDashboard() {
  // Admin Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [activeTab, setActiveTab] = useState("home")
  const [expandedVendorId, setExpandedVendorId] = useState<number | null>(null)
  const [expandedVendorDetailsId, setExpandedVendorDetailsId] = useState<number | null>(null)
  const [expandedPendingVendorId, setExpandedPendingVendorId] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>('all')
  const [expandedVendorBookingIds, setExpandedVendorBookingIds] = useState<Record<string, boolean>>({})
  const [vendorSearchQuery, setVendorSearchQuery] = useState<string>('')
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null)
  const [activeMonthDate, setActiveMonthDate] = useState<Date>(() => new Date())
  const [calendarStartDate, setCalendarStartDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 2) // center 7-day strip around today
    return d
  })
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  // Platform Commission & Markup Settings State (Independent Per Day Rates)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS)
  const [settingDailyMarkup, setSettingDailyMarkup] = useState<number>(25000)
  const [settingWeeklyMarkupPerDay, setSettingWeeklyMarkupPerDay] = useState<number>(20000)
  const [settingMonthlyMarkupPerDay, setSettingMonthlyMarkupPerDay] = useState<number>(15000)
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false)

  // Interactive Live Calculator Sandbox State
  const [calcRentalDays, setCalcRentalDays] = useState<number>(7)
  const [calcVendorDailyRate, setCalcVendorDailyRate] = useState<number>(100000)

  // Real Data
  const [pendingVendors, setPendingVendors] = useState<any[]>([])
  const [approvedVendors, setApprovedVendors] = useState<any[]>([])
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [totalFleetCount, setTotalFleetCount] = useState(0)
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false)
  const supabase = createClient()

  // Verify Admin Session on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tbrb_admin_session")
      if (token === "auth_granted_thebikerentalbali") {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    }
  }, [])

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setIsLoggingIn(true)

    const email = loginEmail.trim().toLowerCase()
    const password = loginPassword.trim()

    if (email === "thebikerentalbali@gmail.com" && password === "Putu3d0santika!?") {
      if (typeof window !== "undefined") {
        localStorage.setItem("tbrb_admin_session", "auth_granted_thebikerentalbali")
      }
      setIsAuthenticated(true)
      setLoginError("")
    } else {
      setLoginError("Invalid credentials. Please enter the correct admin email and password.")
    }
    setIsLoggingIn(false)
  }

  const handleAdminLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tbrb_admin_session")
    }
    setIsAuthenticated(false)
    setLoginEmail("")
    setLoginPassword("")
  }

  const fetchVendors = async () => {
    setIsLoadingApprovals(true)
    const { data, error } = await supabase
      .from('vendors')
      .select('*, scooters(*)')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPendingVendors(data.filter((v: any) => v.status === 'pending'))
      setApprovedVendors(data.filter((v: any) => v.status === 'approved'))
      
      let fleetSum = 0
      data.forEach((v: any) => {
        if (v.scooters) {
          fleetSum += v.scooters.length
        }
      })
      setTotalFleetCount(fleetSum)
    }

    // Fetch All Bookings safely
    const { data: bData, error: bErr } = await supabase
      .from('bookings')
      .select('*, scooters(*)')
      .order('created_at', { ascending: false })

    if (bErr) {
      console.error("Supabase bookings fetch error:", bErr)
    }

    if (bData) {
      const today = new Date().toISOString().split('T')[0]
      const toComplete: any[] = []

      const formatted = bData.map((b: any) => {
        let rawStatus = (b.status || 'pending').toLowerCase()

        if (rawStatus === 'confirmed' && b.end_date && b.end_date < today) {
          rawStatus = 'completed'
          toComplete.push(b)
        }

        return {
          id: b.id,
          vendorId: b.vendor_id,
          scooterId: b.scooter_id,
          scooter: b.scooters?.name || 'Scooter Rental',
          scooter_img: b.scooters?.image_url || '/images/scooter.png',
          customer: b.customer_name || 'Guest Customer',
          phone: b.customer_phone || '',
          startDate: b.start_date || '',
          endDate: b.end_date || '',
          dates: `${b.start_date || ''} to ${b.end_date || ''}`,
          price: Number(b.total_price) || 0,
          quantity: Number(b.quantity) || 1,
          status: rawStatus === 'confirmed' ? 'Confirmed' : rawStatus === 'completed' ? 'Completed' : rawStatus === 'rejected' ? 'Rejected' : 'Pending',
          rawStatus: rawStatus,
          scooter_obj: b.scooters
        }
      })
      setAllBookings(formatted)

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
              console.warn("Background auto-complete error for booking:", b.id, err)
            }
          }
        })()
      }
    }

    setIsLoadingApprovals(false)
  }

  const formatIndoDate = (dateStr?: string): string => {
    if (!dateStr) return ''
    if (dateStr.includes(' to ') || dateStr.includes(' - ')) {
      const parts = dateStr.includes(' to ') ? dateStr.split(' to ') : dateStr.split(' - ')
      return `${formatIndoDate(parts[0])} – ${formatIndoDate(parts[1])}`
    }
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
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const day = String(d.getDate()).padStart(2, '0')
      const year = d.getFullYear()
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ]
      return `${day} ${monthNames[d.getMonth()]} ${year}`
    } catch {
      return dateStr
    }
  }

  const formatRentalPeriod = (startStr?: string, endStr?: string) => {
    if (!startStr && !endStr) return 'N/A'
    if (startStr && !endStr) return formatIndoDate(startStr)
    if (!startStr && endStr) return formatIndoDate(endStr)
    return `${formatIndoDate(startStr)} – ${formatIndoDate(endStr)}`
  }

  const formatMonthYear = (d: Date) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`
  }

  const get7Days = (baseDate: Date) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate)
      d.setDate(baseDate.getDate() + i)
      days.push(d)
    }
    return days
  }

  // Memoized date strings for active month
  const activeMonthRange = useMemo(() => {
    const year = activeMonthDate.getFullYear()
    const month = activeMonthDate.getMonth()
    const monthStartStr = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDayNum = new Date(year, month + 1, 0).getDate()
    const monthEndStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`
    return { monthStartStr, monthEndStr }
  }, [activeMonthDate])

  // Fast string-based period check
  const isBookingInActivePeriod = useCallback((b: { startDate?: string; endDate?: string }): boolean => {
    if (!b.startDate || !b.endDate) return false
    const startStr = typeof b.startDate === 'string' ? b.startDate.substring(0, 10) : ''
    const endStr = typeof b.endDate === 'string' ? b.endDate.substring(0, 10) : ''
    if (!startStr || !endStr) return false

    if (selectedCalendarDate) {
      return selectedCalendarDate >= startStr && selectedCalendarDate <= endStr
    }
    return startStr <= activeMonthRange.monthEndStr && endStr >= activeMonthRange.monthStartStr
  }, [selectedCalendarDate, activeMonthRange])

  // Top-level memoized computations
  const totalPlatformProfit = useMemo(() => {
    return allBookings
      .filter(b => b.rawStatus === 'confirmed' || b.rawStatus === 'completed')
      .reduce((sum, b) => sum + calculateBookingCommission(b.startDate, b.endDate, b.quantity, b.price, platformSettings), 0)
  }, [allBookings, platformSettings])

  const totalConfirmedCompletedCount = useMemo(() => {
    return allBookings.filter(b => b.rawStatus === 'confirmed' || b.rawStatus === 'completed').length
  }, [allBookings])

  const periodBookings = useMemo(() => {
    return allBookings.filter(b => isBookingInActivePeriod(b))
  }, [allBookings, isBookingInActivePeriod])

  const periodPending = useMemo(() => periodBookings.filter(b => b.rawStatus === 'pending'), [periodBookings])
  const periodConfirmed = useMemo(() => periodBookings.filter(b => b.rawStatus === 'confirmed'), [periodBookings])
  const periodCompleted = useMemo(() => periodBookings.filter(b => b.rawStatus === 'completed'), [periodBookings])

  const periodCommission = useMemo(() => {
    return periodBookings
      .filter(b => b.rawStatus === 'completed' || b.rawStatus === 'confirmed')
      .reduce((sum, b) => sum + calculateBookingCommission(b.startDate, b.endDate, b.quantity, b.price, platformSettings), 0)
  }, [periodBookings, platformSettings])

  // Pre-indexed map of vendor bookings for instantaneous tab switches
  const vendorBookingsMap = useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const b of periodBookings) {
      const key = b.vendorId ? String(b.vendorId) : 'unassigned'
      if (!map[key]) map[key] = []
      map[key].push(b)
    }
    return map
  }, [periodBookings])

  const filteredApprovedVendors = useMemo(() => {
    if (!vendorSearchQuery) return approvedVendors
    const q = vendorSearchQuery.toLowerCase()
    return approvedVendors.filter(v =>
      v.name?.toLowerCase().includes(q) ||
      v.address?.toLowerCase().includes(q)
    )
  }, [approvedVendors, vendorSearchQuery])

  const unassignedBookings = useMemo(() => {
    return vendorBookingsMap['unassigned'] || periodBookings.filter(b =>
      !approvedVendors.some(v => String(v.id) === String(b.vendorId))
    )
  }, [vendorBookingsMap, periodBookings, approvedVendors])

  const getBookingsCountForDate = useCallback((dateObj: Date) => {
    const targetDateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
    return allBookings.filter(b => {
      if (!b.startDate || !b.endDate) return false
      const startStr = typeof b.startDate === 'string' ? b.startDate.substring(0, 10) : ''
      const endStr = typeof b.endDate === 'string' ? b.endDate.substring(0, 10) : ''
      return targetDateStr >= startStr && targetDateStr <= endStr
    }).length
  }, [allBookings])

  const handlePrevMonth = useCallback(() => {
    setActiveMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedCalendarDate(null)
  }, [])

  const handleNextMonth = useCallback(() => {
    setActiveMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedCalendarDate(null)
  }, [])

  const handleThisMonth = useCallback(() => {
    const now = new Date()
    setActiveMonthDate(now)
    setSelectedCalendarDate(null)
    const d = new Date(now)
    d.setDate(d.getDate() - 2)
    setCalendarStartDate(d)
  }, [])

  const handlePrevWeek = useCallback(() => {
    setCalendarStartDate(prev => {
      const next = new Date(prev)
      next.setDate(next.getDate() - 7)
      return next
    })
  }, [])

  const handleNextWeek = useCallback(() => {
    setCalendarStartDate(prev => {
      const next = new Date(prev)
      next.setDate(next.getDate() + 7)
      return next
    })
  }, [])

  const handleToday = useCallback(() => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    setCalendarStartDate(d)
    const now = new Date()
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    setSelectedCalendarDate(todayIso)
  }, [])

  const toggleVendorBookings = useCallback((vendorId: string | number) => {
    const key = String(vendorId)
    setExpandedVendorBookingIds(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }, [])

  const expandAllVendors = useCallback(() => {
    const all: Record<string, boolean> = {}
    approvedVendors.forEach(v => {
      all[String(v.id)] = true
    })
    all['unassigned'] = true
    setExpandedVendorBookingIds(all)
  }, [approvedVendors])

  const collapseAllVendors = useCallback(() => {
    setExpandedVendorBookingIds({})
  }, [])

  useEffect(() => {
    fetchVendors()
    fetchPlatformSettings().then(updated => {
      setPlatformSettings(updated)
      setSettingDailyMarkup(updated.markup_daily)
      setSettingWeeklyMarkupPerDay(updated.markup_weekly_per_day)
      setSettingMonthlyMarkupPerDay(updated.markup_monthly_per_day)
    })

    const unsubscribeSettings = subscribeToPlatformSettings((updated) => {
      setPlatformSettings(updated)
      setSettingDailyMarkup(updated.markup_daily)
      setSettingWeeklyMarkupPerDay(updated.markup_weekly_per_day)
      setSettingMonthlyMarkupPerDay(updated.markup_monthly_per_day)
    })

    const bookingsSubscription = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchVendors()
      )
      .subscribe()

    return () => {
      unsubscribeSettings()
      supabase.removeChannel(bookingsSubscription)
    }
  }, [])

  const handleSavePlatformSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const newSettings: PlatformSettings = {
      markup_daily: Math.max(0, Number(settingDailyMarkup) || 0),
      markup_weekly_per_day: Math.max(0, Number(settingWeeklyMarkupPerDay) || 0),
      markup_monthly_per_day: Math.max(0, Number(settingMonthlyMarkupPerDay) || 0),
    }
    savePlatformSettings(newSettings)
    setPlatformSettings(newSettings)
    setSettingsSaveSuccess(true)
    setTimeout(() => setSettingsSaveSuccess(false), 3500)
  }

  const handleConfirmBooking = async (booking: any) => {
    setProcessingBookingId(booking.id)
    try {
      // 1. Update booking status to confirmed
      const { error: bErr } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id)

      if (bErr) {
        alert("Error confirming booking: " + bErr.message)
        return
      }

      // 2. Reduce scooter available_units by booking.quantity
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

      await fetchVendors()
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
        await fetchVendors()
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
        // Restore scooter available units if it was confirmed
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
        await fetchVendors()
      }
    } finally {
      setProcessingBookingId(null)
    }
  }

  const handleApprove = async (id: number) => {
    const { error } = await supabase
      .from('vendors')
      .update({ status: 'approved' })
      .eq('id', id)

    if (!error) {
      fetchVendors()
    } else {
      alert("Error approving vendor: " + error.message)
    }
  }

  const handleSuspendVendor = async (id: number) => {
    if (!confirm("Are you sure you want to suspend this vendor? They will no longer appear on the main website.")) return
    const { error } = await supabase
      .from('vendors')
      .update({ status: 'suspended' })
      .eq('id', id)

    if (!error) {
      fetchVendors()
    } else {
      alert("Error suspending vendor: " + error.message)
    }
  }

  const handleRemoveVendor = async (id: number) => {
    if (!confirm("Are you sure you want to remove this vendor permanently?")) return
    const { error } = await supabase
      .from('vendors')
      .update({ status: 'removed' })
      .eq('id', id)

    if (!error) {
      fetchVendors()
    } else {
      alert("Error removing vendor: " + error.message)
    }
  }

  // Show loader while checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  // Show Admin Login Gate if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0E0E10] text-white flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-white selection:text-black">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md bg-black rounded-[32px] p-7 sm:p-9 border border-neutral-800 shadow-2xl relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-neutral-900 border border-neutral-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">
              The Bike Rental Bali
            </h1>
            <p className="text-xs font-semibold text-neutral-400 mt-1 uppercase tracking-widest">
              Admin Console Gateway
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium p-3.5 rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <p className="leading-snug">{loginError}</p>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="thebikerentalbali@gmail.com"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-2xl pl-11 pr-11 py-3.5 text-sm text-white placeholder-neutral-600 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full mt-2 bg-white text-black hover:bg-neutral-200 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Return link */}
          <div className="mt-6 pt-6 border-t border-neutral-900 text-center">
            <Link 
              href="/"
              className="text-xs text-neutral-500 hover:text-white transition-colors inline-flex items-center gap-1 font-medium"
            >
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const mockVendors: any[] = []
  const mockUsers = []
  const mockBookings: any[] = []

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white md:flex md:pl-64 pb-28 md:pb-0 selection:bg-white selection:text-black">
      {/* 
        ========================================================================
        DESKTOP SIDEBAR
        ========================================================================
      */}
      <aside className="w-64 bg-black border-r border-gray-800 hidden md:flex flex-col fixed top-0 left-0 h-screen z-40 shadow-xl">
        <div className="p-6">
          <Link href="/" className="inline-block">
            <h2 className="text-xl font-black text-white tracking-tight leading-none">THE BIKE RENTAL</h2>
            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Admin Console</p>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2">
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'home' ? 'bg-white/10 text-white shadow-sm shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <BarChart3 className="w-5 h-5" />
            <span className="font-bold text-[15px]">Overview</span>
          </button>
          <button onClick={() => setActiveTab('approvals')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors relative ${activeTab === 'approvals' ? 'bg-white/10 text-white shadow-sm shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <UserCheck className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Approvals</span>
            <span className="absolute right-4 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingVendors.length}</span>
          </button>
          <button onClick={() => setActiveTab('vendors')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'vendors' ? 'bg-white/10 text-white shadow-sm shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Store className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Vendors</span>
          </button>

          <button onClick={() => setActiveTab('revenue')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'revenue' ? 'bg-white/10 text-white shadow-sm shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <DollarSign className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Revenue</span>
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'bookings' ? 'bg-white/10 text-white shadow-sm shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <CalendarDays className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Bookings</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white shadow-sm shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Settings className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Platform Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-gray-800">
            <div className="w-9 h-9 rounded-full bg-white p-[2px] shrink-0">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <span className="font-bold text-white text-xs">AD</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Super Admin</p>
              <p className="text-[10px] font-medium text-neutral-400 truncate">thebikerentalbali@gmail.com</p>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 
        ========================================================================
        MAIN CONTENT
        ========================================================================
      */}
      <main className="flex-1 w-full max-w-full md:max-w-4xl lg:max-w-5xl mx-auto flex flex-col min-h-screen">

        {/* Mobile App-like Header */}
        <header className="hidden md:flex bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-5 py-4 border-b border-gray-100 items-center justify-between md:py-6 md:px-8 md:bg-transparent md:border-none md:backdrop-blur-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black p-[2px] shrink-0 md:hidden">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-black">
                <span className="font-bold text-black text-xs">AD</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">
                {activeTab === 'home' ? 'Platform Overview' :
                  activeTab === 'approvals' ? 'Pending Approvals' :
                    activeTab === 'vendors' ? 'Vendors Management' :
                      activeTab === 'users' ? 'Users Management' :
                        activeTab === 'bookings' ? 'Platform Bookings' :
                          activeTab === 'revenue' ? 'Revenue Analytics' : 'Platform Settings'}
              </h1>
              <p className="text-xs font-medium text-gray-500 md:text-sm md:mt-1 hidden md:block">
                {activeTab === 'home' ? 'System-wide metrics and performance' :
                  activeTab === 'approvals' ? 'Review and manage vendor sign-up applications' :
                    activeTab === 'vendors' ? 'Manage and monitor all platform vendors' :
                      activeTab === 'users' ? 'Manage platform users and roles' :
                        activeTab === 'bookings' ? 'Global overview of all active and past bookings' : 'Configure system settings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search vendors, users..." className="pl-11 pr-4 py-2.5 bg-white rounded-full text-sm font-medium outline-none w-72 shadow-sm border border-gray-100 focus:border-gray-300 focus:ring-4 focus:ring-gray-50 transition-all" />
            </div>
            <Link href="#" className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm relative hover:bg-gray-50 transition-colors">
              <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
              <Bell className="w-5 h-5 text-gray-700" />
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeTab === 'home' ? (
          <div className="p-5 md:px-8 md:pb-12 space-y-6 md:space-y-8">

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-200 transition-colors col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-80"></div>
                <div className="flex items-center gap-3 mb-2 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h3 className="text-[12px] md:text-[13px] font-bold text-gray-500 uppercase tracking-wide leading-tight">Platform Profit</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Your net commission</p>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  Rp {totalPlatformProfit.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 md:mt-3 bg-green-50 text-green-700 w-fit px-2.5 py-0.5 rounded-full">
                  <span className="text-[10px] md:text-[11px] font-bold">
                    {totalConfirmedCompletedCount} Confirmed / Completed
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-200 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-50 to-transparent rounded-bl-full opacity-80"></div>
                <div className="flex items-center gap-3 mb-2 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-[12px] md:text-[13px] font-bold text-gray-500 uppercase tracking-wide leading-tight hidden md:block">Active Vendors</h3>
                </div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide md:hidden mb-1">Vendors</p>
                <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{approvedVendors.length}</p>
                <p className="text-[10px] md:text-[11px] font-bold text-gray-400 mt-2 md:mt-3">Total approved</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-200 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full opacity-80"></div>
                <div className="flex items-center gap-3 mb-2 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5 md:w-6 md:h-6 fill-orange-500" />
                  </div>
                  <h3 className="text-[12px] md:text-[13px] font-bold text-gray-500 uppercase tracking-wide leading-tight hidden md:block">Total Fleet</h3>
                </div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide md:hidden mb-1">Fleet</p>
                <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{totalFleetCount}</p>
                <p className="text-[10px] md:text-[11px] font-bold text-gray-400 mt-2 md:mt-3">Across Bali</p>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-200 transition-colors col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-80"></div>
                <div className="flex items-center gap-3 mb-2 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-[12px] md:text-[13px] font-bold text-gray-500 uppercase tracking-wide leading-tight">Total Users</h3>
                </div>
                <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">0</p>
                <div className="flex items-center gap-1 mt-2 md:mt-3 bg-gray-50 text-gray-500 w-fit px-2 py-0.5 rounded-full">
                  <span className="text-[10px] md:text-[11px] font-bold">No data yet</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Top Vendors (App-like List for Mobile) */}
              <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
                <div className="p-5 md:p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Top Performing Vendors</h3>
                  <Link href="#" className="text-[13px] md:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="p-2 md:p-4 flex-1">
                  <div className="space-y-2">
                    <div className="text-center py-10 text-gray-400 font-medium text-sm">
                      No top performing vendors yet.
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Desktop / System Alerts */}
              <div className="bg-blue-600 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[250px]">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-black/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">System Alerts</h3>
                  <p className="text-blue-100 text-sm font-medium">Pending approvals and system notifications.</p>
                </div>

                <div className="relative z-10 mt-6 space-y-3">
                  <Link href="#" onClick={() => setActiveTab('approvals')} className="w-full bg-white text-blue-900 p-4 rounded-2xl flex items-center justify-between font-bold text-[14px] hover:bg-gray-50 transition-colors shadow-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${pendingVendors.length > 0 ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                      Approve {pendingVendors.length} Vendors
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-400" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        ) : activeTab === 'approvals' ? (
          <div className="p-5 md:px-8 md:pb-12 animate-in fade-in">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {isLoadingApprovals ? (
                  <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                ) : pendingVendors.length === 0 ? (
                  <div className="bg-white rounded-[24px] border border-gray-100 p-10 text-center">
                    <p className="text-gray-500 font-medium">No pending approvals.</p>
                  </div>
                ) : pendingVendors.map(vendor => {
                  const isExpanded = expandedPendingVendorId === vendor.id;
                  return (
                    <div key={vendor.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:border-gray-200">
                      <div className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div className="flex gap-4 items-center cursor-pointer flex-1 min-w-0" onClick={() => setExpandedPendingVendorId(isExpanded ? null : vendor.id)}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-blue-100 text-blue-700 shrink-0 overflow-hidden`}>
                            {vendor.logo ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                            ) : (
                              (vendor.name || "V").substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-gray-900 text-base truncate">{vendor.name}</h4>
                              <div className={`p-1.5 rounded-full transition-transform xl:hidden ${isExpanded ? 'rotate-90 bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 text-xs font-medium text-gray-500 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 shrink-0"><Store className="w-3 h-3" /> {vendor.address || "Unknown"}</span>
                              <span className="hidden lg:inline text-gray-300 shrink-0">•</span>
                              <span className="truncate">{vendor.email}</span>
                              <span className="hidden lg:inline text-gray-300 shrink-0">•</span>
                              <span className="shrink-0">Applied {new Date(vendor.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className={`hidden xl:flex p-1.5 rounded-full transition-transform shrink-0 ${isExpanded ? 'rotate-90 bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex flex-row items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0 pt-3 xl:pt-0 border-t border-gray-100 xl:border-none shrink-0">
                          <button onClick={() => handleApprove(vendor.id)} className="flex-1 xl:flex-none bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm">Approve</button>
                          <button className="flex-1 xl:flex-none bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Reject</button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-gray-50/50 p-5 border-t border-gray-100 animate-in slide-in-from-top-2">
                          <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">Vendor Details</h5>
                          
                          {vendor.image_url && (
                            <div className="mb-6 rounded-xl overflow-hidden h-32 md:h-40 relative border border-gray-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={vendor.image_url} alt="Cover" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/20 flex items-end p-3">
                                <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-md">Cover Image</span>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Contact Phone</p>
                              <p className="font-semibold text-gray-900 text-sm">{vendor.phone || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Document Status</p>
                              <p className="font-semibold text-sm text-yellow-600">Pending Review</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Address Details</p>
                              <p className="font-semibold text-gray-900 text-sm">{vendor.address || "Unknown"}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : activeTab === 'vendors' ? (
          <div className="p-5 md:px-8 md:pb-12 animate-in fade-in">
            {/* Active Vendors Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                Active Vendors
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full ml-2">{approvedVendors.length}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedVendors.map(vendor => {
                  const isExpanded = expandedVendorDetailsId === vendor.id;

                  return (
                    <div key={vendor.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:border-gray-200">
                      <div
                        onClick={() => setExpandedVendorDetailsId(isExpanded ? null : vendor.id)}
                        className="p-5 flex flex-col gap-4 cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-blue-100 text-blue-700 shrink-0 overflow-hidden`}>
                              {vendor.logo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                              ) : (
                                (vendor.name || "V").substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg leading-tight">{vendor.name}</h3>
                              <p className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-0.5"><Store className="w-3.5 h-3.5" /> {vendor.address || "Unknown Location"}</p>
                            </div>
                          </div>
                          <div className={`p-1.5 rounded-full transition-transform ${isExpanded ? 'rotate-90 bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50">
                          <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Scooters</p>
                            <p className="font-black text-gray-900 text-lg">{vendor.scooters?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Revenue</p>
                            <p className="font-black text-gray-900 text-lg">Rp 0</p>
                          </div>
                        </div>
                      </div>

                      {/* Published Scooters Accordion */}
                      {isExpanded && (
                        <div className="bg-gray-50/50 p-5 border-t border-gray-100 animate-in slide-in-from-top-2">
                          <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Bike className="w-4 h-4 text-gray-400" /> Published Fleet
                          </h5>
                          <div className="space-y-2 mb-6">
                            {vendor.scooters?.map((scooter: any) => (
                              <div key={scooter.id} className="bg-white border border-gray-100 p-3 rounded-xl flex items-center justify-between shadow-sm hover:border-gray-200 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-50 flex items-center justify-center">
                                    <Bike className="w-5 h-5 text-gray-300" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm leading-tight">{scooter.name}</p>
                                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">{scooter.available_units ?? 1} / {scooter.total_units ?? 1} units available</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900 text-sm">Rp {(scooter.price_daily || 0).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                            {(!vendor.scooters || vendor.scooters.length === 0) && (
                              <p className="text-sm text-gray-500">No scooters published yet.</p>
                            )}
                          </div>
                          
                          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                            <button 
                              onClick={() => handleSuspendVendor(vendor.id)}
                              className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors text-center"
                            >
                              Suspend Vendor
                            </button>
                            <button 
                              onClick={() => handleRemoveVendor(vendor.id)}
                              className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-2.5 px-4 rounded-xl text-sm transition-colors text-center"
                            >
                              Remove Vendor
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="p-4 md:p-8 md:pb-12 animate-in fade-in space-y-5">
            {/* Floating Calendar & Smart Month Navigator */}
            <div className="bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-3xl border-2 border-black/80 shadow-sm space-y-3.5">
                    {/* Month Navigator Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                      {/* Left: Active Month Selector */}
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handlePrevMonth}
                            className="p-1.5 rounded-xl hover:bg-gray-100 text-black font-black transition-colors cursor-pointer border border-gray-200"
                            title="Previous Month"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <div className="px-2 text-left">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Month</h4>
                            <p className="text-sm md:text-base font-black text-black leading-tight">
                              {formatMonthYear(activeMonthDate)}
                            </p>
                          </div>
                          <button
                            onClick={handleNextMonth}
                            className="p-1.5 rounded-xl hover:bg-gray-100 text-black font-black transition-colors cursor-pointer border border-gray-200"
                            title="Next Month"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={handleThisMonth}
                          className="text-[11px] font-bold bg-black text-white hover:bg-neutral-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ml-1 shadow-xs"
                        >
                          This Month
                        </button>
                      </div>

                      {/* Right: Date Filter Status & Week Controls */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-between sm:justify-end">
                        {selectedCalendarDate ? (
                          <div className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                            <span>Day: {formatIndoDate(selectedCalendarDate)}</span>
                            <button
                              onClick={() => setSelectedCalendarDate(null)}
                              className="text-white hover:text-gray-300 font-black ml-1 cursor-pointer"
                              title="Clear single day filter"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-xl border border-gray-200">
                            Showing All {formatMonthYear(activeMonthDate)} (Active & Overlaps Kept)
                          </span>
                        )}

                        <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
                          <button
                            onClick={handlePrevWeek}
                            className="p-1.5 rounded-xl hover:bg-gray-100 text-black transition-colors cursor-pointer"
                            title="Previous 7 Days"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleToday}
                            className="px-2.5 py-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-black rounded-xl transition-colors cursor-pointer border border-gray-200"
                          >
                            Today
                          </button>
                          <button
                            onClick={handleNextWeek}
                            className="p-1.5 rounded-xl hover:bg-gray-100 text-black transition-colors cursor-pointer"
                            title="Next 7 Days"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 7-Days Strip */}
                    <div className="grid grid-cols-7 gap-1.5 md:gap-3">
                      {get7Days(calendarStartDate).map((d) => {
                        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                        const isSelected = selectedCalendarDate === dateStr
                        const now = new Date()
                        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                        const isToday = dateStr === todayStr
                        const count = getBookingsCountForDate(d)
                        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
                        const dayName = dayNames[d.getDay()]
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
                        const monthName = monthNames[d.getMonth()]

                        return (
                          <button
                            key={dateStr}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCalendarDate(null)
                              } else {
                                setSelectedCalendarDate(dateStr)
                                setActiveMonthDate(new Date(d.getFullYear(), d.getMonth(), 1))
                              }
                            }}
                            className={`flex flex-col items-center justify-between p-2 md:p-3 rounded-2xl transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                                : isToday
                                ? 'bg-gray-100 text-black border-black font-black'
                                : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <span className={`text-[9px] md:text-[10px] font-bold uppercase ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                              {dayName}
                            </span>
                            <span className="text-sm md:text-base font-black my-0.5">
                              {String(d.getDate()).padStart(2, '0')}
                            </span>
                            <span className={`text-[9px] font-semibold hidden md:inline ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                              {monthName}
                            </span>

                            {/* Booking Data Badge */}
                            <div className="mt-1 w-full flex justify-center">
                              {count > 0 ? (
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                                  isSelected
                                    ? 'bg-white text-black'
                                    : 'bg-black text-white shadow-xs'
                                }`}>
                                  {count} {count > 1 ? 'B' : 'B'}
                                </span>
                              ) : (
                                <span className={`text-[9px] font-bold ${isSelected ? 'text-gray-400' : 'text-gray-300'}`}>
                                  -
                                </span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Top Summary Banner as Interactive Filters (Period-Scoped) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div
                      onClick={() => setBookingFilter('all')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        bookingFilter === 'all'
                          ? 'ring-2 ring-black bg-black text-white border-black shadow-md'
                          : 'bg-white border-black/80 text-gray-900 hover:border-black shadow-xs'
                      }`}
                    >
                      <p className={`text-[11px] font-bold uppercase tracking-wide truncate whitespace-nowrap ${bookingFilter === 'all' ? 'text-gray-300' : 'text-gray-500'}`}>Total Bookings</p>
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

                  {/* Section Header with Vendor Search & Accordion Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm md:text-base font-black text-gray-900">
                        Partner Vendors & Bookings
                      </h3>
                      <span className="text-xs font-bold text-gray-500">
                        ({approvedVendors.length} Vendors)
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

                    {/* Vendor Search and Expand / Collapse Controls */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <div className="relative flex items-center min-w-[180px] md:min-w-[220px]">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={vendorSearchQuery}
                          onChange={(e) => setVendorSearchQuery(e.target.value)}
                          placeholder="Search vendor..."
                          className="w-full bg-white border border-gray-300 focus:border-black text-xs font-bold text-black rounded-xl pl-9 pr-3 py-2 outline-none shadow-xs transition-all"
                        />
                        {vendorSearchQuery && (
                          <button
                            onClick={() => setVendorSearchQuery('')}
                            className="absolute right-2.5 text-gray-400 hover:text-black text-xs font-bold"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={expandAllVendors}
                          className="text-xs font-bold px-3 py-2 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                        >
                          Expand All
                        </button>
                        <button
                          onClick={collapseAllVendors}
                          className="text-xs font-bold px-3 py-2 bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-xl transition-colors shadow-xs cursor-pointer"
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Cards First with Dropdown Logic to view bookings */}
                  <div className="space-y-4">
                    {filteredApprovedVendors.length === 0 && unassignedBookings.length === 0 ? (
                      <div className="bg-white p-12 text-center text-gray-500 font-bold rounded-3xl border-2 border-gray-200">
                        No vendors or bookings found for this period.
                      </div>
                    ) : (
                      <>
                        {filteredApprovedVendors.map(vendor => {
                          const vendorIdStr = String(vendor.id)
                          const isExpanded = !!expandedVendorBookingIds[vendorIdStr]
                          const vendorPeriodBookings = vendorBookingsMap[vendorIdStr] || []

                          const filteredBookings = vendorPeriodBookings.filter(b => {
                            if (bookingFilter === 'pending' && b.rawStatus !== 'pending') return false
                            if (bookingFilter === 'confirmed' && b.rawStatus !== 'confirmed') return false
                            if (bookingFilter === 'completed' && b.rawStatus !== 'completed') return false
                            return true
                          })

                          const pendingCount = vendorPeriodBookings.filter(b => b.rawStatus === 'pending').length
                          const confirmedCount = vendorPeriodBookings.filter(b => b.rawStatus === 'confirmed').length
                          const vendorCommission = vendorPeriodBookings
                            .filter(b => b.rawStatus === 'completed' || b.rawStatus === 'confirmed')
                            .reduce((sum, b) => sum + calculateBookingCommission(b.startDate, b.endDate, b.quantity, b.price, platformSettings), 0)

                            return (
                              <div
                                key={vendor.id}
                                className="bg-white rounded-3xl border-2 border-black/80 overflow-hidden shadow-sm transition-all hover:border-black"
                              >
                                {/* Vendor Card Header (Click to toggle dropdown) */}
                                <div
                                  onClick={() => toggleVendorBookings(vendor.id)}
                                  className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/80 transition-colors select-none"
                                >
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    {/* Vendor Avatar / Initials */}
                                    <div className="w-12 h-12 rounded-2xl bg-black text-white font-black text-sm flex items-center justify-center shrink-0 border border-black overflow-hidden shadow-xs">
                                      {vendor.logo_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={vendor.logo_url} alt={vendor.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <span>{vendor.name ? vendor.name.substring(0, 2).toUpperCase() : 'VN'}</span>
                                      )}
                                    </div>

                                    <div className="min-w-0 space-y-0.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-base md:text-lg font-black text-black leading-tight truncate">
                                          {vendor.name}
                                        </h4>
                                        {vendor.phone && (
                                          <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200">
                                            {vendor.phone}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 font-medium truncate flex items-center gap-1.5">
                                        <Store className="w-3 h-3 text-black shrink-0" />
                                        <span>{vendor.address || vendor.delivery_area || 'Bali Partner'}</span>
                                      </p>
                                    </div>
                                  </div>

                                  {/* Vendor Badges and Dropdown Button */}
                                  <div className="flex items-center justify-between md:justify-end gap-2.5 flex-wrap shrink-0">
                                    {/* Total Bookings Count in Active Period */}
                                    <span className="text-xs font-black bg-gray-100 text-black border border-gray-300 px-3 py-1.5 rounded-xl">
                                      {vendorPeriodBookings.length} {vendorPeriodBookings.length === 1 ? 'Booking' : 'Bookings'}
                                    </span>

                                    {/* Pending Badges if any */}
                                    {pendingCount > 0 && (
                                      <span className="bg-black text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{pendingCount} Pending</span>
                                      </span>
                                    )}

                                    {/* Active/Confirmed Badge */}
                                    {confirmedCount > 0 && (
                                      <span className="bg-white border-2 border-black text-black text-xs font-black px-3 py-1 rounded-xl flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                                        <span>{confirmedCount} Active</span>
                                      </span>
                                    )}

                                    {/* Commission Earned from Vendor in Active Period */}
                                    <span className="bg-black text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-xs">
                                      +Rp {vendorCommission.toLocaleString()}
                                    </span>

                                    {/* Dropdown Toggle Action Button */}
                                    <button
                                      type="button"
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-black hover:text-white text-black font-black text-xs transition-colors shrink-0 ml-1 cursor-pointer"
                                    >
                                      <span>{isExpanded ? 'Hide' : 'View'}</span>
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Expanded Dropdown Area with Booking Cards */}
                                {isExpanded && (
                                  <div className="border-t-2 border-black/80 bg-gray-50/70 p-4 md:p-6 space-y-4">
                                    {filteredBookings.length === 0 ? (
                                      <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-300 text-center text-gray-500 font-bold text-xs md:text-sm">
                                        No bookings found for <strong className="text-black">{vendor.name}</strong> under the current period filter.
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        {filteredBookings.map(booking => {
                                          const bookingCommission = calculateBookingCommission(booking.startDate, booking.endDate, booking.quantity, booking.price, platformSettings)
                                          const rentalDays = calculateRentalDays(booking.startDate, booking.endDate)

                                          return (
                                            <div
                                              key={booking.id}
                                              className="bg-white p-4 md:p-5 rounded-2xl border-2 border-black/80 shadow-xs space-y-3.5 hover:border-black transition-all"
                                            >
                                              {/* Top Row: Scooter, Company Profile, Customer & Status */}
                                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="flex items-start gap-3.5 min-w-0">
                                                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-200 p-1 flex items-center justify-center">
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

                                                    {/* Line 2: Company Profile Image and Name Badge */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                      <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-lg w-fit">
                                                        <div className="w-4 h-4 rounded-md bg-black text-white text-[8px] font-black flex items-center justify-center shrink-0 overflow-hidden">
                                                          {vendor.logo_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={vendor.logo_url} alt={vendor.name} className="w-full h-full object-cover" />
                                                          ) : (
                                                            <span>{vendor.name ? vendor.name.substring(0, 2).toUpperCase() : 'CO'}</span>
                                                          )}
                                                        </div>
                                                        <span className="text-[10px] md:text-[11px] font-black text-black truncate max-w-[140px] sm:max-w-[200px]">
                                                          {vendor.name}
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

                                              {/* Price and Commission Row */}
                                              <div className="flex flex-row items-center justify-between gap-3 bg-gray-50 rounded-xl p-3 md:p-3.5 border border-gray-200">
                                                <div>
                                                  <p className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-wider">Total Customer Price</p>
                                                  <p className="font-black text-black text-sm md:text-base">Rp {booking.price.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-wider">Your Commission</p>
                                                  <div className="mt-0.5">
                                                    <span className="bg-black text-white font-black text-xs md:text-sm px-3 py-1 rounded-xl inline-flex items-center gap-1 shadow-xs">
                                                      +Rp {bookingCommission.toLocaleString()}
                                                    </span>
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
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}

                          {/* Unassigned / Direct Bookings Card */}
                          {unassignedBookings.length > 0 && (
                            <div className="bg-white rounded-3xl border-2 border-black/80 overflow-hidden shadow-sm transition-all hover:border-black">
                              <div
                                onClick={() => toggleVendorBookings('unassigned')}
                                className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/80 transition-colors select-none"
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <div className="w-12 h-12 rounded-2xl bg-black text-white font-black text-sm flex items-center justify-center shrink-0 border border-black shadow-xs">
                                    <Store className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-base md:text-lg font-black text-black leading-tight">
                                      Direct & Unassigned Bookings
                                    </h4>
                                    <p className="text-xs text-gray-500 font-medium">Platform Direct Bookings</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-2.5 flex-wrap shrink-0">
                                  <span className="text-xs font-black bg-gray-100 text-black border border-gray-300 px-3 py-1.5 rounded-xl">
                                    {unassignedBookings.length} Bookings
                                  </span>
                                  <button
                                    type="button"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-black hover:text-white text-black font-black text-xs transition-colors shrink-0 ml-1 cursor-pointer"
                                  >
                                    <span>{expandedVendorBookingIds['unassigned'] ? 'Hide' : 'View'}</span>
                                    {expandedVendorBookingIds['unassigned'] ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {expandedVendorBookingIds['unassigned'] && (
                                <div className="border-t-2 border-black/80 bg-gray-50/70 p-4 md:p-6 space-y-4">
                                  <div className="space-y-4">
                                    {unassignedBookings.map(booking => {
                                      const bookingCommission = calculateBookingCommission(booking.startDate, booking.endDate, booking.quantity, booking.price, platformSettings)
                                      const rentalDays = calculateRentalDays(booking.startDate, booking.endDate)

                                      return (
                                        <div
                                          key={booking.id}
                                          className="bg-white p-4 md:p-5 rounded-2xl border-2 border-black/80 shadow-xs space-y-3.5 hover:border-black transition-all"
                                        >
                                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                            <div className="flex items-start gap-3.5 min-w-0">
                                              <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-200 p-1 flex items-center justify-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={booking.scooter_img || "/images/scooter.png"} alt="Scooter" className="w-full h-full object-contain" />
                                              </div>
                                              <div className="min-w-0 space-y-1.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <h5 className="font-black text-black text-sm md:text-base leading-tight">{booking.scooter}</h5>
                                                  <span className="text-[10px] md:text-[11px] font-black bg-black text-white px-2 py-0.5 rounded-full shrink-0">
                                                    {booking.quantity} {booking.quantity > 1 ? 'Units' : 'Unit'}
                                                  </span>
                                                </div>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-lg w-fit">
                                                    <div className="w-4 h-4 rounded-md bg-black text-white text-[8px] font-black flex items-center justify-center shrink-0">
                                                      <span>TB</span>
                                                    </div>
                                                    <span className="text-[10px] md:text-[11px] font-black text-black">
                                                      The Bike Rental Bali
                                                    </span>
                                                  </div>
                                                  <p className="text-xs font-medium text-black">
                                                    Customer: <strong className="text-black font-black">{booking.customer}</strong> {booking.phone ? `(${booking.phone})` : ''}
                                                  </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-gray-700 whitespace-nowrap truncate">
                                                  <Calendar className="w-3.5 h-3.5 text-black shrink-0" />
                                                  <span>{formatRentalPeriod(booking.startDate, booking.endDate)}</span>
                                                </div>
                                              </div>
                                            </div>

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
                                                <span>{booking.status}</span>
                                              </span>
                                              <span className="px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-black border border-gray-300 inline-flex items-center gap-1 shrink-0">
                                                <span>{rentalDays} {rentalDays > 1 ? 'Days' : 'Day'}</span>
                                              </span>
                                            </div>
                                          </div>

                                          <div className="flex flex-row items-center justify-between gap-3 bg-gray-50 rounded-xl p-3 md:p-3.5 border border-gray-200">
                                            <div>
                                              <p className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-wider">Total Customer Price</p>
                                              <p className="font-black text-black text-sm md:text-base">Rp {booking.price.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-wider">Your Commission</p>
                                              <div className="mt-0.5">
                                                <span className="bg-black text-white font-black text-xs md:text-sm px-3 py-1 rounded-xl inline-flex items-center gap-1 shadow-xs">
                                                  +Rp {bookingCommission.toLocaleString()}
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
                                            {booking.rawStatus === 'pending' && (
                                              <>
                                                <button
                                                  onClick={() => handleConfirmBooking(booking)}
                                                  disabled={processingBookingId === booking.id}
                                                  className="w-full bg-black hover:bg-neutral-800 active:scale-95 text-white text-xs md:text-sm font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                                >
                                                  <span>Confirm Booking</span>
                                                </button>
                                                <button
                                                  onClick={() => handleRejectBooking(booking)}
                                                  disabled={processingBookingId === booking.id}
                                                  className="w-full bg-white hover:bg-gray-100 active:scale-95 text-black border-2 border-black text-xs md:text-sm font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                                >
                                                  <span>Reject</span>
                                                </button>
                                              </>
                                            )}
                                            {booking.rawStatus === 'confirmed' && (
                                              <>
                                                <div className="w-full bg-gray-100 border-2 border-black text-black font-black text-xs md:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide">
                                                  <span>CONFIRMED</span>
                                                </div>
                                                <button
                                                  onClick={() => handleCompleteBooking(booking)}
                                                  disabled={processingBookingId === booking.id}
                                                  className="w-full bg-black hover:bg-neutral-800 active:scale-95 text-white text-xs md:text-sm font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                                >
                                                  <span>Mark Returned</span>
                                                </button>
                                              </>
                                            )}
                                            {booking.rawStatus === 'completed' && (
                                              <div className="col-span-2 w-full bg-gray-100 border border-gray-300 text-gray-500 font-black text-xs md:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide">
                                                <span>Completed</span>
                                              </div>
                                            )}
                                            {booking.rawStatus === 'rejected' && (
                                              <div className="col-span-2 w-full bg-gray-100 border border-gray-300 text-gray-500 font-bold text-xs md:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wide">
                                                <span>Rejected Booking</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                  </div>
          </div>
        ) : activeTab === 'revenue' ? (
          <div className="p-5 md:px-8 md:pb-12 flex flex-col items-center justify-center flex-1 min-h-[50vh] text-center animate-in fade-in">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Revenue Analytics</h2>
            <p className="text-gray-500 max-w-sm mb-6">Detailed revenue reports, platform commissions, and payout schedules are being processed.</p>
            <button className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-md">
              Download CSV Report
            </button>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="p-4 sm:p-6 md:p-8 animate-in fade-in max-w-3xl mx-auto">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/10 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black text-white text-[11px] font-bold uppercase tracking-wider mb-2">
                      <Settings className="w-3.5 h-3.5" />
                      Platform Settings
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-black">Commission & Markup</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                      Set your markup per day independently for each rental period. The main website displays vendor net rate + your markup.
                    </p>
                  </div>
                </div>

                {settingsSaveSuccess && (
                  <div className="mt-4 p-3.5 bg-black text-white rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>Platform commission settings saved successfully.</span>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSavePlatformSettings} className="space-y-5">
                
                {/* 1. Daily Markup */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">1</span>
                        <h4 className="text-base sm:text-lg font-black text-black">Daily Markup</h4>
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-black text-[11px] font-bold">1–6 Days</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Applied per day for short-term rentals</p>
                    </div>
                    <span className="text-xs font-bold text-gray-400 hidden sm:block">Per Day</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={settingDailyMarkup}
                        onChange={(e) => setSettingDailyMarkup(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-20 py-3 text-base sm:text-lg font-black text-black outline-none focus:bg-white focus:border-black transition-all"
                        placeholder="25000"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-500">
                        / day
                      </span>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Presets:</span>
                      {[15000, 20000, 25000, 35000, 50000].map(val => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => setSettingDailyMarkup(val)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            settingDailyMarkup === val
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Rp {val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculator */}
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-black" />
                      Daily Earnings
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-500">1 Day</div>
                        <div className="text-xs sm:text-sm font-black text-black mt-0.5">Rp {Number(settingDailyMarkup || 0).toLocaleString()}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-500">3 Days</div>
                        <div className="text-xs sm:text-sm font-black text-black mt-0.5">Rp {(3 * Number(settingDailyMarkup || 0)).toLocaleString()}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-500">5 Days</div>
                        <div className="text-xs sm:text-sm font-black text-black mt-0.5">Rp {(5 * Number(settingDailyMarkup || 0)).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Weekly Markup */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">2</span>
                        <h4 className="text-base sm:text-lg font-black text-black">Weekly Markup</h4>
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-black text-[11px] font-bold">7–29 Days</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Applied per day for weekly rentals</p>
                    </div>
                    <span className="text-xs font-bold text-gray-400 hidden sm:block">Per Day (x7 / Wk)</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={settingWeeklyMarkupPerDay}
                        onChange={(e) => setSettingWeeklyMarkupPerDay(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-20 py-3 text-base sm:text-lg font-black text-black outline-none focus:bg-white focus:border-black transition-all"
                        placeholder="20000"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-500">
                        / day
                      </span>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Presets:</span>
                      {[10000, 15000, 20000, 25000, 30000].map(val => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => setSettingWeeklyMarkupPerDay(val)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            settingWeeklyMarkupPerDay === val
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Rp {val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculator */}
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-black" />
                        Weekly Earnings
                      </div>
                      <span className="text-[11px] font-black text-black">
                        1 Wk (7 Days) = Rp {(7 * Number(settingWeeklyMarkupPerDay || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-500">1 Week (7d)</div>
                        <div className="text-xs sm:text-sm font-black text-black mt-0.5">Rp {(7 * Number(settingWeeklyMarkupPerDay || 0)).toLocaleString()}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-500">2 Weeks (14d)</div>
                        <div className="text-xs sm:text-sm font-black text-black mt-0.5">Rp {(14 * Number(settingWeeklyMarkupPerDay || 0)).toLocaleString()}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-500">3 Weeks (21d)</div>
                        <div className="text-xs sm:text-sm font-black text-black mt-0.5">Rp {(21 * Number(settingWeeklyMarkupPerDay || 0)).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Monthly Markup */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">3</span>
                        <h4 className="text-base sm:text-lg font-black text-black">Monthly Markup</h4>
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-black text-[11px] font-bold">30+ Days</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Applied per day for monthly rentals</p>
                    </div>
                    <span className="text-xs font-bold text-gray-400 hidden sm:block">Per Day (x30 / Mo)</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={settingMonthlyMarkupPerDay}
                        onChange={(e) => setSettingMonthlyMarkupPerDay(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-20 py-3 text-base sm:text-lg font-black text-black outline-none focus:bg-white focus:border-black transition-all"
                        placeholder="15000"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-500">
                        / day
                      </span>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Presets:</span>
                      {[5000, 10000, 15000, 20000, 25000].map(val => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => setSettingMonthlyMarkupPerDay(val)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            settingMonthlyMarkupPerDay === val
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Rp {val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculator */}
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-black" />
                        Monthly Earnings
                      </div>
                      <span className="text-[11px] font-black text-black">
                        1 Mo (30 Days) = Rp {(30 * Number(settingMonthlyMarkupPerDay || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-500">1 Month (30d)</div>
                        <div className="text-xs sm:text-sm font-black text-black mt-0.5">Rp {(30 * Number(settingMonthlyMarkupPerDay || 0)).toLocaleString()}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-500">2 Months (60d)</div>
                        <div className="text-xs sm:text-sm font-black text-black mt-0.5">Rp {(60 * Number(settingMonthlyMarkupPerDay || 0)).toLocaleString()}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-500">3 Months (90d)</div>
                        <div className="text-xs sm:text-sm font-black text-black mt-0.5">Rp {(90 * Number(settingMonthlyMarkupPerDay || 0)).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Live Profit Simulator (Pure Black & White) */}
                <div className="bg-black text-white rounded-2xl p-5 sm:p-6 border border-black shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-white" />
                      <h4 className="text-sm sm:text-base font-black text-white">Profit Simulator</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/10 rounded text-gray-300">
                      Live Preview
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Duration (Days)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={calcRentalDays}
                          onChange={(e) => setCalcRentalDays(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none focus:bg-white/20 focus:border-white transition-all"
                        />
                        <span className="text-xs font-bold text-gray-400">Days</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        {[1, 3, 7, 14, 30, 60].map(d => (
                          <button
                            type="button"
                            key={d}
                            onClick={() => setCalcRentalDays(d)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              calcRentalDays === d
                                ? 'bg-white text-black font-black'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                          >
                            {d}d
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Vendor Rate (Rp / Day)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">Rp</span>
                        <input
                          type="number"
                          min="10000"
                          step="10000"
                          value={calcVendorDailyRate}
                          onChange={(e) => setCalcVendorDailyRate(Number(e.target.value) || 0)}
                          className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-white outline-none focus:bg-white/20 focus:border-white transition-all"
                          placeholder="100000"
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">Default: Rp 100,000 / day</span>
                    </div>
                  </div>

                  {/* Output */}
                  {(() => {
                    const days = Math.max(1, Number(calcRentalDays) || 1);
                    const vendorDaily = Math.max(0, Number(calcVendorDailyRate) || 0);
                    const appliedDailyMarkup = days >= 30
                      ? Number(settingMonthlyMarkupPerDay || 0)
                      : days >= 7
                        ? Number(settingWeeklyMarkupPerDay || 0)
                        : Number(settingDailyMarkup || 0);

                    const tierName = days >= 30 ? 'Monthly Tier' : days >= 7 ? 'Weekly Tier' : 'Daily Tier';
                    const totalPlatformCommission = days * appliedDailyMarkup;
                    const totalVendorPayout = days * vendorDaily;
                    const totalCustomerPays = totalVendorPayout + totalPlatformCommission;

                    return (
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>Applied: <strong>{tierName} (Rp {appliedDailyMarkup.toLocaleString()}/day)</strong></span>
                          <span>{days} Days</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                            <span className="text-[10px] font-bold text-gray-400 block">Customer Pays</span>
                            <span className="text-sm sm:text-base font-black text-white mt-0.5 block">Rp {totalCustomerPays.toLocaleString()}</span>
                          </div>
                          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                            <span className="text-[10px] font-bold text-gray-400 block">Vendor Receives</span>
                            <span className="text-sm sm:text-base font-black text-gray-300 mt-0.5 block">Rp {totalVendorPayout.toLocaleString()}</span>
                          </div>
                          <div className="p-2.5 bg-white text-black rounded-xl border border-white">
                            <span className="text-[10px] font-black text-gray-600 block uppercase">Your Profit</span>
                            <span className="text-sm sm:text-base font-black text-black mt-0.5 block">Rp {totalPlatformCommission.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-neutral-800 rounded-xl py-4 font-black text-base active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 border border-black shadow-sm"
                >
                  <Check className="w-5 h-5" />
                  Save Platform Settings
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-5 md:px-8 md:pb-12 flex flex-col items-center justify-center flex-1 min-h-[50vh] text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Management</h2>
            <p className="text-gray-500 max-w-sm">This section is currently under development. Check back soon for updates!</p>
          </div>
        )}
      </main>

      {/* 
        ========================================================================
        MOBILE BOTTOM NAVBAR
        ========================================================================
      */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center pt-3 pb-8 px-4 relative">
          <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1.5 p-2 transition-colors w-16 group ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'home' ? 'bg-blue-50' : 'group-hover:bg-gray-50'} p-1.5 rounded-full transition-colors`}>
              <Home className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button onClick={() => { setActiveTab('approvals'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1.5 p-2 transition-colors w-16 group relative ${activeTab === 'approvals' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'approvals' ? 'bg-blue-50' : 'group-hover:bg-gray-50'} p-1.5 rounded-full transition-colors`}>
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Approvals</span>
            {pendingVendors.length > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-yellow-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {pendingVendors.length}
              </span>
            )}
          </button>

          <button onClick={() => { setActiveTab('vendors'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1.5 p-2 transition-colors w-16 group ${activeTab === 'vendors' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'vendors' ? 'bg-blue-50' : 'group-hover:bg-gray-50'} p-1.5 rounded-full transition-colors`}>
              <Store className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Vendors</span>
          </button>

          <button onClick={() => { setActiveTab('bookings'); setIsMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1.5 p-2 transition-colors w-16 group ${activeTab === 'bookings' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'bookings' ? 'bg-blue-50' : 'group-hover:bg-gray-50'} p-1.5 rounded-full transition-colors`}>
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Bookings</span>
          </button>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`flex flex-col items-center gap-1.5 p-2 transition-colors w-16 group ${isMobileMenuOpen ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${isMobileMenuOpen ? 'bg-blue-50' : 'group-hover:bg-gray-50'} p-1.5 rounded-full transition-colors`}>
              <Menu className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">More</span>
          </button>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="absolute bottom-full right-4 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-48 animate-in slide-in-from-bottom-2 fade-in">
              <div className="flex flex-col">
                <button
                  onClick={() => { setActiveTab('revenue'); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'revenue' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <DollarSign className="w-4 h-4" /> Revenue
                </button>
                <button
                  onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors border-t border-gray-50 ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleAdminLogout(); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 border-t border-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
