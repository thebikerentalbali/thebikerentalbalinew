"use client"

import { useState, useEffect } from "react"
import { Users, Bike, DollarSign, Settings, Bell, Search, Store, BarChart3, Home, ChevronRight, ChevronLeft, ChevronDown, Calendar, TrendingUp, CalendarDays, MoreVertical, Filter, ArrowUpRight, CheckCircle2, AlertCircle, Menu, UserCheck, MoreHorizontal, Loader2, XCircle, RotateCcw, Clock, Check } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("home")
  const [expandedVendorId, setExpandedVendorId] = useState<number | null>(null)
  const [expandedVendorDetailsId, setExpandedVendorDetailsId] = useState<number | null>(null)
  const [expandedPendingVendorId, setExpandedPendingVendorId] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'by_vendor'>('all')
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>('all')
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null)
  const [calendarStartDate, setCalendarStartDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 2) // center 7-day strip around today
    return d
  })
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  // Real Data
  const [pendingVendors, setPendingVendors] = useState<any[]>([])
  const [approvedVendors, setApprovedVendors] = useState<any[]>([])
  const [allBookings, setAllBookings] = useState<any[]>([])
  const [totalFleetCount, setTotalFleetCount] = useState(0)
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false)
  const supabase = createClient()

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
      const formatted = await Promise.all(bData.map(async (b: any) => {
        let rawStatus = (b.status || 'pending').toLowerCase()

        // Smart return check: if confirmed and end_date < today, auto-complete and restore availability
        if (rawStatus === 'confirmed' && b.end_date && b.end_date < today) {
          rawStatus = 'completed'
          await supabase.from('bookings').update({ status: 'completed' }).eq('id', b.id)
          if (b.scooter_id && b.scooters) {
            const currentAvail = b.scooters.available_units ?? 0
            const totalUnits = b.scooters.total_units ?? 1
            const qty = Number(b.quantity) || 1
            const newAvail = Math.min(totalUnits, currentAvail + qty)
            await supabase.from('scooters').update({ available_units: newAvail }).eq('id', b.scooter_id)
          }
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
      }))
      setAllBookings(formatted)
    }

    setIsLoadingApprovals(false)
  }

  const formatIndoDate = (dateStr?: string) => {
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

  const getBookingsCountForDate = (dateObj: Date) => {
    const targetDateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
    return allBookings.filter(b => {
      if (!b.startDate || !b.endDate) return false
      const startStr = typeof b.startDate === 'string' ? b.startDate.substring(0, 10) : new Date(b.startDate).toISOString().split('T')[0]
      const endStr = typeof b.endDate === 'string' ? b.endDate.substring(0, 10) : new Date(b.endDate).toISOString().split('T')[0]
      return targetDateStr >= startStr && targetDateStr <= endStr
    }).length
  }

  const handlePrevWeek = () => {
    const next = new Date(calendarStartDate)
    next.setDate(next.getDate() - 7)
    setCalendarStartDate(next)
  }

  const handleNextWeek = () => {
    const next = new Date(calendarStartDate)
    next.setDate(next.getDate() + 7)
    setCalendarStartDate(next)
  }

  const handleToday = () => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    setCalendarStartDate(d)
    const now = new Date()
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    setSelectedCalendarDate(todayIso)
  }

  useEffect(() => {
    fetchVendors()
  }, [])

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

  const mockVendors: any[] = []

  const mockUsers = []

  const mockBookings: any[] = []
  return (
    <div className="min-h-screen bg-[#F5F7FA] md:flex pb-28 md:pb-0">
      {/* 
        ========================================================================
        DESKTOP SIDEBAR
        ========================================================================
      */}
      <aside className="w-64 bg-black border-r border-gray-800 hidden md:flex flex-col sticky top-0 h-screen z-40 shadow-xl">
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

        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-gray-800 cursor-pointer hover:border-gray-700 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white p-[2px] shrink-0">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <span className="font-bold text-white text-xs">AD</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Super Admin</p>
              <p className="text-[11px] font-medium text-blue-400 truncate">System Access</p>
            </div>
          </div>
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
                  <h3 className="text-[12px] md:text-[13px] font-bold text-gray-500 uppercase tracking-wide leading-tight">Gross Volume</h3>
                </div>
                <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  Rp {allBookings.reduce((sum, b) => sum + (b.price || 0), 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 md:mt-3 bg-green-50 text-green-700 w-fit px-2 py-0.5 rounded-full">
                  <span className="text-[10px] md:text-[11px] font-bold">{allBookings.length} Bookings</span>
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
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Contact Phone</p>
                              <p className="font-semibold text-gray-900 text-sm">N/A</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Document Status</p>
                              <p className="font-semibold text-sm text-yellow-600">Pending</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Intended Fleet</p>
                              <p className="font-semibold text-gray-900 text-sm">Unknown</p>
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
                          <div className="space-y-2">
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
            {/* Floating 7-Days Calendar Bar */}
            <div className="bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">Schedule & Availability</h4>
                    <p className="text-sm md:text-base font-black text-gray-900 truncate">
                      {formatMonthYear(calendarStartDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {selectedCalendarDate && (
                    <button
                      onClick={() => setSelectedCalendarDate(null)}
                      className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer mr-1"
                    >
                      Show All Dates
                    </button>
                  )}
                  <button
                    onClick={handlePrevWeek}
                    className="p-1.5 md:p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    title="Previous 7 Days"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-2.5 py-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextWeek}
                    className="p-1.5 md:p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                    title="Next 7 Days"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
                      onClick={() => setSelectedCalendarDate(isSelected ? null : dateStr)}
                      className={`flex flex-col items-center justify-between p-2 md:p-3 rounded-2xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                          : isToday
                          ? 'bg-blue-50/70 text-blue-900 border-blue-200 hover:bg-blue-100'
                          : 'bg-gray-50/70 text-gray-700 border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`text-[9px] md:text-[10px] font-bold uppercase ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                        {dayName}
                      </span>
                      <span className="text-sm md:text-base font-black my-0.5">
                        {String(d.getDate()).padStart(2, '0')}
                      </span>
                      <span className={`text-[9px] font-semibold hidden md:inline ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                        {monthName}
                      </span>

                      {/* Booking Data Badge */}
                      <div className="mt-1 w-full flex justify-center">
                        {count > 0 ? (
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                            isSelected
                              ? 'bg-white text-black'
                              : 'bg-emerald-500 text-white shadow-xs'
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

            {/* Top Summary Banner as Interactive Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div
                onClick={() => setBookingFilter('all')}
                className={`p-4 rounded-2xl border shadow-sm transition-all cursor-pointer ${
                  bookingFilter === 'all'
                    ? 'ring-2 ring-black bg-gray-50/80 border-black'
                    : 'bg-white border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide truncate whitespace-nowrap">Total Bookings</p>
                  {bookingFilter === 'all' && <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded-md">Active</span>}
                </div>
                <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">{allBookings.length}</p>
              </div>

              <div
                onClick={() => setBookingFilter('pending')}
                className={`p-4 rounded-2xl border shadow-sm transition-all cursor-pointer ${
                  bookingFilter === 'pending'
                    ? 'ring-2 ring-amber-500 bg-amber-50 border-amber-300'
                    : allBookings.filter(b => b.rawStatus === 'pending').length > 0
                    ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                    : 'bg-white border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1 truncate whitespace-nowrap">
                    <Clock className="w-3 h-3 shrink-0" /> Pending Review
                  </p>
                  {bookingFilter === 'pending' && <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-md">Active</span>}
                </div>
                <p className="text-xl md:text-2xl font-black text-amber-900 mt-1">{allBookings.filter(b => b.rawStatus === 'pending').length}</p>
              </div>

              <div
                onClick={() => setBookingFilter('confirmed')}
                className={`p-4 rounded-2xl border shadow-sm transition-all cursor-pointer ${
                  bookingFilter === 'confirmed'
                    ? 'ring-2 ring-green-600 bg-green-50 border-green-300'
                    : 'bg-white border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-green-600 uppercase tracking-wide flex items-center gap-1 truncate whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 shrink-0" /> Confirmed
                  </p>
                  {bookingFilter === 'confirmed' && <span className="text-[10px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-md">Active</span>}
                </div>
                <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">{allBookings.filter(b => b.rawStatus === 'confirmed').length}</p>
              </div>

              <div
                onClick={() => setBookingFilter(bookingFilter === 'completed' ? 'all' : 'completed')}
                className={`p-4 rounded-2xl border shadow-sm transition-all cursor-pointer ${
                  bookingFilter === 'completed'
                    ? 'ring-2 ring-blue-600 bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide truncate whitespace-nowrap">Platform Revenue</p>
                  {bookingFilter === 'completed' ? (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-md">Completed</span>
                  ) : (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {allBookings.filter(b => b.rawStatus === 'completed').length} completed
                    </span>
                  )}
                </div>
                <p className="text-sm md:text-base lg:text-lg font-black text-gray-900 mt-1 truncate whitespace-nowrap">
                  Rp {allBookings.reduce((sum, b) => sum + (b.price || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Section Header with Right Vendor Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm md:text-base font-black text-gray-900 capitalize">
                  {bookingFilter === 'all' ? 'All Bookings' : bookingFilter === 'pending' ? 'Pending Reviews' : bookingFilter === 'confirmed' ? 'Confirmed Bookings' : bookingFilter === 'completed' ? 'Completed Bookings' : 'Grouped by Vendor'}
                </h3>
                <span className="text-xs font-bold text-gray-400">
                  ({bookingFilter === 'by_vendor' ? approvedVendors.length : allBookings.filter(b => {
                    if (bookingFilter === 'pending' && b.rawStatus !== 'pending') return false;
                    if (bookingFilter === 'confirmed' && b.rawStatus !== 'confirmed') return false;
                    if (bookingFilter === 'completed' && b.rawStatus !== 'completed') return false;
                    if (selectedVendorFilter !== 'all' && String(b.vendorId) !== String(selectedVendorFilter)) return false;
                    if (selectedCalendarDate) {
                      if (!b.startDate || !b.endDate) return false;
                      const startStr = typeof b.startDate === 'string' ? b.startDate.substring(0, 10) : new Date(b.startDate).toISOString().split('T')[0];
                      const endStr = typeof b.endDate === 'string' ? b.endDate.substring(0, 10) : new Date(b.endDate).toISOString().split('T')[0];
                      if (selectedCalendarDate < startStr || selectedCalendarDate > endStr) return false;
                    }
                    return true;
                  }).length})
                </span>

                {selectedCalendarDate && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100 ml-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatIndoDate(selectedCalendarDate)}</span>
                    <button
                      onClick={() => setSelectedCalendarDate(null)}
                      className="ml-1 text-blue-900 hover:text-blue-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Right Vendor Navigation */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex items-center min-w-[170px]">
                  <Store className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                  <select
                    value={selectedVendorFilter}
                    onChange={(e) => setSelectedVendorFilter(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-xl pl-8 pr-7 py-2 outline-none shadow-xs focus:border-black transition-all cursor-pointer appearance-none"
                  >
                    <option value="all">All Vendors</option>
                    {approvedVendors.map(v => (
                      <option key={v.id} value={String(v.id)}>{v.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 pointer-events-none" />
                </div>

                <button
                  onClick={() => setBookingFilter(bookingFilter === 'by_vendor' ? 'all' : 'by_vendor')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                    bookingFilter === 'by_vendor'
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Group by Vendor</span>
                </button>
              </div>
            </div>

            {/* Content based on Filter */}
            {bookingFilter !== 'by_vendor' ? (
              <div className="space-y-3">
                {allBookings.filter(b => {
                  if (bookingFilter === 'pending') if (b.rawStatus !== 'pending') return false;
                  if (bookingFilter === 'confirmed') if (b.rawStatus !== 'confirmed') return false;
                  if (bookingFilter === 'completed') if (b.rawStatus !== 'completed') return false;
                  if (selectedVendorFilter !== 'all' && String(b.vendorId) !== String(selectedVendorFilter)) return false;

                  if (selectedCalendarDate) {
                    if (!b.startDate || !b.endDate) return false;
                    const startStr = typeof b.startDate === 'string' ? b.startDate.substring(0, 10) : new Date(b.startDate).toISOString().split('T')[0];
                    const endStr = typeof b.endDate === 'string' ? b.endDate.substring(0, 10) : new Date(b.endDate).toISOString().split('T')[0];
                    if (selectedCalendarDate < startStr || selectedCalendarDate > endStr) return false;
                  }
                  return true;
                }).length === 0 ? (
                  <div className="bg-white p-12 text-center text-gray-400 font-medium rounded-3xl border border-gray-100">
                    No bookings found for this filter.
                  </div>
                ) : (
                  allBookings.filter(b => {
                    if (bookingFilter === 'pending') if (b.rawStatus !== 'pending') return false;
                    if (bookingFilter === 'confirmed') if (b.rawStatus !== 'confirmed') return false;
                    if (bookingFilter === 'completed') if (b.rawStatus !== 'completed') return false;
                    if (selectedVendorFilter !== 'all' && String(b.vendorId) !== String(selectedVendorFilter)) return false;

                    if (selectedCalendarDate) {
                      if (!b.startDate || !b.endDate) return false;
                      const startStr = typeof b.startDate === 'string' ? b.startDate.substring(0, 10) : new Date(b.startDate).toISOString().split('T')[0];
                      const endStr = typeof b.endDate === 'string' ? b.endDate.substring(0, 10) : new Date(b.endDate).toISOString().split('T')[0];
                      if (selectedCalendarDate < startStr || selectedCalendarDate > endStr) return false;
                    }
                    return true;
                  }).map(booking => {
                    const vendorMatch = approvedVendors.find(v => String(v.id) === String(booking.vendorId))
                    return (
                      <div key={booking.id} className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-200 transition-all">
                        <div className="flex items-start md:items-center gap-3.5 md:gap-4 min-w-0">
                          <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 p-1 flex items-center justify-center mt-0.5 md:mt-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={booking.scooter_img || "/images/scooter.png"} alt="Scooter" className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-nowrap">
                              <h5 className="font-bold text-gray-900 text-sm md:text-base truncate whitespace-nowrap">{booking.scooter}</h5>
                              <span className="text-[10px] md:text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                                {booking.quantity} {booking.quantity > 1 ? 'Units' : 'Unit'}
                              </span>
                              {vendorMatch && (
                                <span className="text-[10px] md:text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 whitespace-nowrap">
                                  <Store className="w-3 h-3" /> {vendorMatch.name}
                                </span>
                              )}
                            </div>
                            {/* Customer Title */}
                            <p className="text-xs font-medium text-gray-500 truncate">
                              Customer: <strong className="text-gray-800">{booking.customer}</strong> {booking.phone ? `(${booking.phone})` : ''}
                            </p>
                            {/* Date BELLOW Customer Title */}
                            <p className="text-[11px] md:text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{formatRentalPeriod(booking.startDate, booking.endDate)}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 md:gap-4 border-t md:border-none border-gray-50 pt-3 md:pt-0 shrink-0">
                          <div className="text-left md:text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate whitespace-nowrap">Total Price</p>
                            <p className="font-black text-gray-900 text-sm md:text-base whitespace-nowrap">Rp {booking.price.toLocaleString()}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shrink-0 border ${
                              booking.rawStatus === 'pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : booking.rawStatus === 'confirmed'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : booking.rawStatus === 'completed'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {booking.status}
                            </span>

                            {/* Action Buttons for Admin */}
                            {booking.rawStatus === 'pending' && (
                              <div className="flex items-center gap-1.5 ml-1">
                                <button
                                  onClick={() => handleConfirmBooking(booking)}
                                  disabled={processingBookingId === booking.id}
                                  className="bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                >
                                  {processingBookingId === booking.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  <span>Confirm Booking</span>
                                </button>
                                <button
                                  onClick={() => handleRejectBooking(booking)}
                                  disabled={processingBookingId === booking.id}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}

                            {booking.rawStatus === 'confirmed' && (
                              <button
                                onClick={() => handleCompleteBooking(booking)}
                                disabled={processingBookingId === booking.id}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer ml-1 disabled:opacity-50 whitespace-nowrap"
                              >
                                {processingBookingId === booking.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3.5 h-3.5" />
                                )}
                                <span>Mark Returned</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              /* Grouped by Vendor Accordion */
              <div className="space-y-4">
                {approvedVendors.filter(v => selectedVendorFilter === 'all' || String(v.id) === String(selectedVendorFilter)).map(vendor => {
                  const vendorBookings = allBookings.filter(b => {
                    if (String(b.vendorId) !== String(vendor.id)) return false;
                    if (selectedCalendarDate) {
                      if (!b.startDate || !b.endDate) return false;
                      const startStr = typeof b.startDate === 'string' ? b.startDate.substring(0, 10) : new Date(b.startDate).toISOString().split('T')[0];
                      const endStr = typeof b.endDate === 'string' ? b.endDate.substring(0, 10) : new Date(b.endDate).toISOString().split('T')[0];
                      if (selectedCalendarDate < startStr || selectedCalendarDate > endStr) return false;
                    }
                    return true;
                  });
                  const vendorRevenue = vendorBookings.reduce((sum, b) => sum + (b.price || 0), 0);
                  const isExpanded = expandedVendorId === vendor.id;

                  return (
                    <div key={vendor.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                      <div
                        onClick={() => setExpandedVendorId(isExpanded ? null : vendor.id)}
                        className="p-5 md:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-blue-100 text-blue-700 shrink-0 overflow-hidden">
                            {vendor.logo ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                            ) : (
                              (vendor.name || "V").substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-base md:text-lg truncate whitespace-nowrap">{vendor.name}</h4>
                            <p className="text-xs md:text-sm font-medium text-gray-500">{vendorBookings.length} Total Bookings</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="hidden md:block text-right">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide truncate whitespace-nowrap">Vendor Revenue</p>
                            <p className="font-black text-gray-900 text-base">Rp {vendorRevenue.toLocaleString()}</p>
                          </div>
                          <div className={`p-2 rounded-full transition-transform ${isExpanded ? 'rotate-90 bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-50 bg-gray-50/50 p-4 md:p-6 space-y-3">
                          {vendorBookings.length === 0 ? (
                            <div className="text-center py-6 text-gray-400 font-medium bg-white rounded-2xl border border-dashed border-gray-200">
                              No recent bookings for this vendor.
                            </div>
                          ) : (
                            vendorBookings.map(booking => (
                              <div key={booking.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-200 transition-colors">
                                <div className="flex items-start md:items-center gap-3.5 min-w-0">
                                  <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 p-1 flex items-center justify-center mt-0.5 md:mt-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={booking.scooter_img || "/images/scooter.png"} alt="Scooter" className="w-full h-full object-contain" />
                                  </div>
                                  <div className="min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-2 flex-nowrap">
                                      <h5 className="font-bold text-gray-900 text-sm truncate whitespace-nowrap">{booking.scooter}</h5>
                                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                                        {booking.quantity} {booking.quantity > 1 ? 'Units' : 'Unit'}
                                      </span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 truncate">
                                      Customer: <strong className="text-gray-800">{booking.customer}</strong>
                                    </p>
                                    <p className="text-[11px] md:text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                      <span>{formatRentalPeriod(booking.startDate, booking.endDate)}</span>
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 border-t md:border-none border-gray-50 pt-3 md:pt-0 shrink-0">
                                  <div className="text-left md:text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate whitespace-nowrap">Total Price</p>
                                    <p className="font-bold text-gray-900 text-sm md:text-base whitespace-nowrap">Rp {booking.price.toLocaleString()}</p>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide shrink-0 ${
                                    booking.rawStatus === 'pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : booking.rawStatus === 'confirmed'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {booking.status}
                                  </span>

                                  {booking.rawStatus === 'pending' && (
                                    <button
                                      onClick={() => handleConfirmBooking(booking)}
                                      disabled={processingBookingId === booking.id}
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Confirm
                                    </button>
                                  )}
                                  {booking.rawStatus === 'confirmed' && (
                                    <button
                                      onClick={() => handleCompleteBooking(booking)}
                                      disabled={processingBookingId === booking.id}
                                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" /> Return
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
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
          <div className="p-5 md:px-8 md:pb-12 animate-in fade-in max-w-2xl">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-4">Platform Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email Address</label>
                    <input type="email" defaultValue="admin@thebikerental.com" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Global Platform Commission (%)</label>
                    <input type="number" defaultValue="15" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Maintenance Mode</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Disable all new bookings temporarily</p>
                    </div>
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full bg-black text-white rounded-xl py-3.5 font-bold text-sm hover:scale-[1.02] transition-transform">Save Platform Settings</button>
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
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
