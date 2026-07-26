"use client"

import { useState } from "react"
import { Users, Bike, DollarSign, Settings, Bell, Search, Store, BarChart3, Home, ChevronRight, TrendingUp, CalendarDays, MoreVertical, Filter, ArrowUpRight, CheckCircle2, AlertCircle, Menu, UserCheck, MoreHorizontal } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("home")
  const [expandedVendorId, setExpandedVendorId] = useState<number | null>(null)
  const [expandedVendorDetailsId, setExpandedVendorDetailsId] = useState<number | null>(null)
  const [expandedPendingVendorId, setExpandedPendingVendorId] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mock Data
  const mockPendingVendors = [
    { id: 101, name: "Bagus Rentals", initials: "BR", location: "Jimbaran", email: "bagus@example.com", phone: "+62 812-3456-7890", appliedDate: "Aug 22, 2026", color: "rose", documents: "Verified (ID, License)", fleetIntent: "10x Honda Scoopy, 5x Yamaha NMAX" },
    { id: 102, name: "Bali Wheels", initials: "BW", location: "Uluwatu", email: "wheels@bali.com", phone: "+62 813-9876-5432", appliedDate: "Aug 20, 2026", color: "teal", documents: "Pending (Missing Business License)", fleetIntent: "20x Custom Vespa" },
  ]

  const mockVendors = [
    { id: 1, name: "Putu Rentals", initials: "PR", verified: true, location: "Ubud", scooters: 12, revenue: "Rp 12.5M", color: "blue",
      scootersList: [
        { id: "S1", model: "Honda Scoopy", quantity: 5, price: "Rp 75.000/day" },
        { id: "S2", model: "Vespa Primavera", quantity: 3, price: "Rp 150.000/day" },
        { id: "S3", model: "Yamaha NMAX", quantity: 4, price: "Rp 120.000/day" },
      ]
    },
    { id: 2, name: "Wayan Bikes", initials: "WB", verified: true, location: "Canggu", scooters: 24, revenue: "Rp 28.2M", color: "purple",
      scootersList: [
        { id: "S4", model: "Yamaha NMAX", quantity: 14, price: "Rp 120.000/day" },
        { id: "S5", model: "Honda PCX", quantity: 10, price: "Rp 135.000/day" },
      ]
    },
    { id: 3, name: "Made Scooter", initials: "MS", verified: false, location: "Seminyak", scooters: 8, revenue: "Rp 8.1M", color: "orange",
      scootersList: [
        { id: "S6", model: "Honda Vario", quantity: 8, price: "Rp 70.000/day" },
      ]
    },
    { id: 4, name: "Ketut Rides", initials: "KR", verified: true, location: "Kuta", scooters: 15, revenue: "Rp 15.4M", color: "green",
      scootersList: [
        { id: "S7", model: "Honda Scoopy", quantity: 10, price: "Rp 75.000/day" },
        { id: "S8", model: "Yamaha Lexi", quantity: 5, price: "Rp 90.000/day" },
      ]
    },
  ]

  const mockUsers = []

  const mockBookings = [
    { id: "B-1042", vendorId: 1, customer: "Alex Johnson", scooter: "Honda Scoopy", dates: "Aug 12 - Aug 15", price: 450000, status: "Active" },
    { id: "B-1043", vendorId: 1, customer: "John Doe", scooter: "Vespa Primavera", dates: "Aug 14 - Aug 16", price: 700000, status: "Upcoming" },
    { id: "B-1044", vendorId: 2, customer: "Sarah Williams", scooter: "Yamaha NMAX", dates: "Aug 10 - Aug 12", price: 500000, status: "Completed" },
    { id: "B-1045", vendorId: 3, customer: "Emma Davis", scooter: "Honda Vario", dates: "Aug 15 - Aug 20", price: 750000, status: "Upcoming" },
  ]
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
            <span className="absolute right-4 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{mockPendingVendors.length}</span>
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
              <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Rp 128M</p>
              <div className="flex items-center gap-1 mt-2 md:mt-3 bg-green-50 text-green-700 w-fit px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[10px] md:text-[11px] font-bold">+24% vs last mo</span>
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
              <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">42</p>
              <p className="text-[10px] md:text-[11px] font-bold text-green-600 mt-2 md:mt-3">+3 new</p>
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
              <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">356</p>
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
              <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">1,248</p>
              <div className="flex items-center gap-1 mt-2 md:mt-3 bg-blue-50 text-blue-700 w-fit px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[10px] md:text-[11px] font-bold">+124 this month</span>
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
                  {/* Vendor Item 1 */}
                  <Link href="#" className="block bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all p-3 md:p-4 rounded-[20px] cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-100 text-blue-700 font-black text-lg flex items-center justify-center shrink-0">
                        PR
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 text-[14px] md:text-[16px] truncate">Putu Rentals</h4>
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide shrink-0">Verified</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-[12px] md:text-[13px] font-medium text-gray-500 truncate">12 Scooters • Ubud</p>
                          <p className="text-[12px] md:text-[13px] font-black text-gray-900 shrink-0">Rp 12.5M</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Vendor Item 2 */}
                  <Link href="#" className="block bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all p-3 md:p-4 rounded-[20px] cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-100 text-purple-700 font-black text-lg flex items-center justify-center shrink-0">
                        WB
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 text-[14px] md:text-[16px] truncate">Wayan Bikes</h4>
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide shrink-0">Verified</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-[12px] md:text-[13px] font-medium text-gray-500 truncate">24 Scooters • Canggu</p>
                          <p className="text-[12px] md:text-[13px] font-black text-gray-900 shrink-0">Rp 28.2M</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Vendor Item 3 */}
                  <Link href="#" className="block bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all p-3 md:p-4 rounded-[20px] cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-100 text-orange-700 font-black text-lg flex items-center justify-center shrink-0">
                        MS
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 text-[14px] md:text-[16px] truncate">Made Scooter</h4>
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide shrink-0">Pending</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-[12px] md:text-[13px] font-medium text-gray-500 truncate">8 Scooters • Seminyak</p>
                          <p className="text-[12px] md:text-[13px] font-black text-gray-900 shrink-0">Rp 8.1M</p>
                        </div>
                      </div>
                    </div>
                  </Link>
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
                <Link href="#" className="w-full bg-white text-blue-900 p-4 rounded-2xl flex items-center justify-between font-bold text-[14px] hover:bg-gray-50 transition-colors shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Approve 3 Vendors
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                </Link>
                <Link href="#" className="w-full bg-black/20 text-white p-4 rounded-2xl flex items-center justify-between font-bold text-[14px] hover:bg-black/30 transition-colors border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    Review 12 Reports
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </Link>
              </div>
            </div>
          </div>

        </div>
        ) : activeTab === 'approvals' ? (
          <div className="p-5 md:px-8 md:pb-12 animate-in fade-in">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {mockPendingVendors.map(vendor => {
                  const isExpanded = expandedPendingVendorId === vendor.id;
                  return (
                    <div key={vendor.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:border-gray-200">
                      <div className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div className="flex gap-4 items-center cursor-pointer flex-1 min-w-0" onClick={() => setExpandedPendingVendorId(isExpanded ? null : vendor.id)}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-${vendor.color}-100 text-${vendor.color}-700 shrink-0`}>
                            {vendor.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-gray-900 text-base truncate">{vendor.name}</h4>
                              <div className={`p-1.5 rounded-full transition-transform xl:hidden ${isExpanded ? 'rotate-90 bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 text-xs font-medium text-gray-500 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 shrink-0"><Store className="w-3 h-3" /> {vendor.location}</span>
                              <span className="hidden lg:inline text-gray-300 shrink-0">•</span>
                              <span className="truncate">{vendor.email}</span>
                              <span className="hidden lg:inline text-gray-300 shrink-0">•</span>
                              <span className="shrink-0">Applied {vendor.appliedDate}</span>
                            </div>
                          </div>
                          <div className={`hidden xl:flex p-1.5 rounded-full transition-transform shrink-0 ${isExpanded ? 'rotate-90 bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex flex-row items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0 pt-3 xl:pt-0 border-t border-gray-100 xl:border-none shrink-0">
                          <button className="flex-1 xl:flex-none bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm">Approve</button>
                          <button className="flex-1 xl:flex-none bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Reject</button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="bg-gray-50/50 p-5 border-t border-gray-100 animate-in slide-in-from-top-2">
                          <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">Vendor Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Contact Phone</p>
                              <p className="font-semibold text-gray-900 text-sm">{vendor.phone}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Document Status</p>
                              <p className={`font-semibold text-sm ${vendor.documents.includes('Pending') ? 'text-yellow-600' : 'text-green-600'}`}>{vendor.documents}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Intended Fleet</p>
                              <p className="font-semibold text-gray-900 text-sm">{vendor.fleetIntent}</p>
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
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full ml-2">{mockVendors.length}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockVendors.map(vendor => {
                  const isExpanded = expandedVendorDetailsId === vendor.id;
                  
                  return (
                    <div key={vendor.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:border-gray-200">
                      <div 
                        onClick={() => setExpandedVendorDetailsId(isExpanded ? null : vendor.id)}
                        className="p-5 flex flex-col gap-4 cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-${vendor.color}-100 text-${vendor.color}-700 shrink-0`}>
                              {vendor.initials}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg leading-tight">{vendor.name}</h3>
                              <p className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-0.5"><Store className="w-3.5 h-3.5" /> {vendor.location}</p>
                            </div>
                          </div>
                          <div className={`p-1.5 rounded-full transition-transform ${isExpanded ? 'rotate-90 bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50">
                          <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Scooters</p>
                            <p className="font-black text-gray-900 text-lg">{vendor.scooters}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Revenue</p>
                            <p className="font-black text-gray-900 text-lg">{vendor.revenue}</p>
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
                            {vendor.scootersList.map(scooter => (
                              <div key={scooter.id} className="bg-white border border-gray-100 p-3 rounded-xl flex items-center justify-between shadow-sm hover:border-gray-200 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-50 flex items-center justify-center">
                                    <Bike className="w-5 h-5 text-gray-300" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm leading-tight">{scooter.model}</p>
                                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">{scooter.quantity} units available</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900 text-sm">{scooter.price}</p>
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
          <div className="p-5 md:px-8 md:pb-12 animate-in fade-in space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-900">Vendor Bookings Dashboard</h3>
               <button className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors">
                 <Filter className="w-4 h-4" /> Filter
               </button>
            </div>
            
            <div className="space-y-4">
              {mockVendors.map(vendor => {
                const vendorBookings = mockBookings.filter(b => b.vendorId === vendor.id);
                const isExpanded = expandedVendorId === vendor.id;
                
                return (
                  <div key={vendor.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                    <div 
                      onClick={() => setExpandedVendorId(isExpanded ? null : vendor.id)}
                      className="p-5 md:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg bg-${vendor.color}-100 text-${vendor.color}-700 shrink-0`}>
                          {vendor.initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg md:text-xl">{vendor.name}</h4>
                          <p className="text-sm font-medium text-gray-500">{vendorBookings.length} Total Bookings</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Vendor Revenue</p>
                          <p className="font-black text-gray-900 text-lg">{vendor.revenue}</p>
                        </div>
                        <div className={`p-2 rounded-full transition-transform ${isExpanded ? 'rotate-90 bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t border-gray-50 bg-gray-50/50 p-5 md:p-6 space-y-3">
                        {vendorBookings.length === 0 ? (
                          <div className="text-center py-6 text-gray-400 font-medium bg-white rounded-2xl border border-dashed border-gray-200">
                            No recent bookings for this vendor.
                          </div>
                        ) : (
                          vendorBookings.map(booking => (
                            <div key={booking.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-200 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src="/images/scooter.png" alt="Scooter" className="w-full h-full object-cover opacity-80" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-bold text-gray-900">{booking.scooter}</h5>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{booking.id}</span>
                                  </div>
                                  <p className="text-xs font-medium text-gray-500">{booking.customer} • {booking.dates}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none border-gray-50 pt-3 md:pt-0">
                                <div className="text-left md:text-right">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Price</p>
                                  <p className="font-bold text-gray-900">Rp {booking.price.toLocaleString()}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide shrink-0 ${booking.status === 'Active' || booking.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : booking.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {booking.status}
                                </span>
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
            {mockPendingVendors.length > 0 && (
              <span className="absolute top-1 right-2 bg-yellow-500 text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                {mockPendingVendors.length}
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
