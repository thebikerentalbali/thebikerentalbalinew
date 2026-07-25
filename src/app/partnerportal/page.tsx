"use client"

import { useState, useEffect } from "react"
import { Bike, DollarSign, CalendarDays, Settings, Bell, Search, Star, Plus, QrCode, Home, Wallet, User, ChevronRight, TrendingUp, Wrench, MoreVertical, CheckCircle2, Clock, X, ChevronDown } from "lucide-react"
import Link from "next/link"

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("home")
  
  // Fleet State
  const [fleet, setFleet] = useState([
    { id: 1, name: "Vespa Primavera", year: "2023", price: 350000, totalUnits: 3, availableUnits: 2 },
    { id: 2, name: "Honda Scoopy", year: "2022", price: 150000, totalUnits: 4, availableUnits: 4 }, 
    { id: 3, name: "Yamaha NMAX", year: "2021", price: 250000, totalUnits: 2, availableUnits: 2 }, 
  ])
  const [fleetFilter, setFleetFilter] = useState("All")
  const [fleetSearch, setFleetSearch] = useState("")
  const [serviceSearch, setServiceSearch] = useState("")
  const [editingScooter, setEditingScooter] = useState<any>(null)
  const [isAddingScooter, setIsAddingScooter] = useState(false)
  const [newScooter, setNewScooter] = useState({ name: "", brand: "", cc: "", year: "", price: 0, priceWeekly: 0, priceMonthly: 0, totalUnits: 1, availableUnits: 1, photos: [] as string[] })
  return (
    <div className="min-h-screen bg-[#F5F7FA] md:flex pb-28 md:pb-0">
      {/* 
        ========================================================================
        DESKTOP SIDEBAR
        ========================================================================
      */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen z-40 shadow-sm">
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
            <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
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
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 cursor-pointer hover:border-gray-300 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-[2px] shrink-0">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span className="font-bold text-gray-800 text-xs">PR</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">Putu Rentals</p>
              <p className="text-[11px] font-medium text-green-600 truncate">Verified Partner</p>
            </div>
          </div>
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
          <div className="grid grid-cols-2 gap-3 md:hidden">
            <Link href="#" className="bg-black text-white p-4 rounded-[20px] flex flex-col items-center justify-center gap-2 shadow-lg shadow-black/20 active:scale-95 transition-transform">
              <div className="bg-white/20 p-2 rounded-full">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold text-[13px]">Add Scooter</span>
            </Link>
            <Link href="#" className="bg-white text-gray-900 p-4 rounded-[20px] border border-gray-100 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
              <div className="bg-gray-100 p-2 rounded-full">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="font-bold text-[13px]">Scan QR</span>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-gray-200 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-50"></div>
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="text-[13px] md:text-[14px] font-bold text-gray-500 uppercase tracking-wide">Total Earnings</h3>
              </div>
              <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Rp 4.2M</p>
              <div className="flex items-center gap-1.5 mt-2 md:mt-3 bg-green-50 text-green-700 w-fit px-2.5 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[11px] md:text-xs font-bold">+12.5% vs last week</span>
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
                <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">8</p>
                <span className="text-sm md:text-base font-bold text-gray-400">/ 12 fleet</span>
              </div>
              <p className="text-[12px] md:text-[13px] font-semibold text-gray-500 mt-2 md:mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                4 available for booking
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
                <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">4.9</p>
              </div>
              <p className="text-[12px] md:text-[13px] font-semibold text-gray-500 mt-2 md:mt-3">
                Based on <span className="text-black">124 verified reviews</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Active Bookings (App-like List for Mobile, Table-like for Desktop) */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
              <div className="p-5 md:p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Recent Bookings</h3>
                <Link href="#" className="text-[13px] md:text-sm font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="p-2 md:p-4 flex-1">
                <div className="space-y-2">
                  {/* Booking Item 1 */}
                  <div className="bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all p-3 md:p-4 rounded-[20px] flex items-center gap-4 cursor-pointer">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/scooter.png" alt="scooter" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 text-[14px] md:text-[16px] truncate">Yamaha NMAX</h4>
                        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-lg text-[10px] md:text-[11px] font-black uppercase tracking-wide shrink-0">Active</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-[12px] md:text-[13px] font-medium text-gray-500 truncate">Booked by <span className="text-gray-900 font-bold">John Doe</span></p>
                        <p className="text-[12px] md:text-[13px] font-bold text-gray-900 shrink-0">3 Days</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Item 2 */}
                  <div className="bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all p-3 md:p-4 rounded-[20px] flex items-center gap-4 cursor-pointer">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/scooter.png" alt="scooter" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 text-[14px] md:text-[16px] truncate">Honda Scoopy</h4>
                        <span className="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-lg text-[10px] md:text-[11px] font-black uppercase tracking-wide shrink-0">Pending</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-[12px] md:text-[13px] font-medium text-gray-500 truncate">Booked by <span className="text-gray-900 font-bold">Sarah Smith</span></p>
                        <p className="text-[12px] md:text-[13px] font-bold text-gray-900 shrink-0">1 Week</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Item 3 */}
                  <div className="bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all p-3 md:p-4 rounded-[20px] flex items-center gap-4 cursor-pointer">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/scooter.png" alt="scooter" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 text-[14px] md:text-[16px] truncate">Vespa Primavera</h4>
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-lg text-[10px] md:text-[11px] font-black uppercase tracking-wide shrink-0">Done</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-[12px] md:text-[13px] font-medium text-gray-500 truncate">Booked by <span className="text-gray-900 font-bold">Michael T.</span></p>
                        <p className="text-[12px] md:text-[13px] font-bold text-gray-900 shrink-0">Daily</p>
                      </div>
                    </div>
                  </div>
                </div>
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
                <Link href="#" className="w-full bg-white text-black p-4 rounded-2xl flex items-center justify-between font-bold text-[14px] hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Accept 1 Pending Booking
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link href="#" className="w-full bg-white/10 text-white p-4 rounded-2xl flex items-center justify-between font-bold text-[14px] hover:bg-white/20 transition-colors border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Service Due (2 Bikes)
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </Link>
              </div>
            </div>
          </div>

        </div>
        ) : activeTab === 'fleet' ? (
          <div className="p-5 md:px-8 pb-12 animate-in fade-in">
            <div className="mb-6 space-y-4">
              <div className="relative w-max">
                <select 
                  value={fleetFilter}
                  onChange={(e) => setFleetFilter(e.target.value)}
                  className="text-2xl font-black text-gray-900 bg-transparent outline-none cursor-pointer appearance-none pr-8 pl-1"
                  style={{ WebkitAppearance: 'none' }}
                >
                  <option value="All">All Scooters</option>
                  <option value="Available">Available</option>
                  <option value="Rented">Rented</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
              <button onClick={() => setIsAddingScooter(true)} className="w-full bg-black text-white px-4 py-3.5 rounded-[16px] text-[15px] font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform shadow-md shadow-black/10">
                <Plus className="w-5 h-5" /> Add Scooter
              </button>
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
                if (fleetFilter === "Available") return s.availableUnits > 0;
                if (fleetFilter === "Rented") return s.availableUnits < s.totalUnits;
                return true;
              }).map((scooter) => {
                return (
                  <div key={scooter.id} className="bg-white p-5 md:p-6 rounded-[28px] border border-gray-100 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all relative group">
                    <div className="flex items-center gap-5">
                      <div className="w-24 h-24 bg-gray-50 rounded-[20px] p-2 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/scooter.png" alt="Scooter" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-900 text-lg md:text-xl truncate pr-2" title={scooter.name}>{scooter.name}</h3>
                          <button onClick={() => setEditingScooter(scooter)} className="text-gray-400 hover:text-black p-1 shrink-0">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-[13px] font-bold text-gray-900 mb-3">Rp {scooter.price.toLocaleString()} <span className="text-gray-500 font-normal">/day</span> • {scooter.year}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`px-2.5 py-1.5 rounded-[10px] text-[10px] md:text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5 w-fit ${scooter.availableUnits > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {scooter.availableUnits > 0 ? <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> : null}
                            {scooter.availableUnits} / {scooter.totalUnits} Available
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                      <button 
                        disabled={scooter.availableUnits === scooter.totalUnits}
                        onClick={() => setFleet(f => f.map(s => s.id === scooter.id ? { ...s, availableUnits: s.availableUnits + 1 } : s))} 
                        className={`py-3 rounded-[14px] font-bold text-sm transition-all ${scooter.availableUnits < scooter.totalUnits ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed'}`}
                      >
                        Return
                      </button>
                      <button 
                        disabled={scooter.availableUnits === 0}
                        onClick={() => setFleet(f => f.map(s => s.id === scooter.id ? { ...s, availableUnits: s.availableUnits - 1 } : s))} 
                        className={`py-3 rounded-[14px] font-bold text-sm transition-all ${scooter.availableUnits > 0 ? 'bg-black text-white hover:bg-gray-800 hover:scale-[1.02] shadow-md shadow-black/10' : 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed'}`}
                      >
                        Rent Out
                      </button>
                    </div>
                  </div>
                )
              })}
              {fleet.filter(s => {
                const matchesFilter = fleetFilter === "Available" ? s.availableUnits > 0 : fleetFilter === "Rented" ? s.availableUnits < s.totalUnits : true;
                const matchesSearch = s.name.toLowerCase().includes(fleetSearch.toLowerCase());
                return matchesFilter && matchesSearch;
              }).length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 font-bold">No scooters found for this filter.</div>
              )}
            </div>
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="p-5 md:px-8 pb-12 animate-in fade-in">
             <h2 className="text-2xl font-bold text-gray-900 mb-6">All Bookings</h2>
             <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/scooter.png" alt="Scooter" className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 text-[15px]">Honda Scoopy</h4>
                      <span className="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">In Progress</span>
                    </div>
                    <p className="text-[13px] font-medium text-gray-500">Aug 12 - Aug 15 • <span className="text-gray-900 font-bold">Rp 450.000</span></p>
                  </div>
                </div>
              ))}
             </div>
          </div>
        ) : activeTab === 'maintenance' ? (
          <div className="p-5 md:px-8 pb-12 animate-in fade-in">
            <div className="mb-6 space-y-4">
              <h2 className="text-2xl font-black text-gray-900">Maintenance Log</h2>
              <button onClick={() => setIsAddingScooter(true)} className="w-full bg-black text-white px-4 py-3.5 rounded-[16px] text-[15px] font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform shadow-md shadow-black/10">
                <Plus className="w-5 h-5" /> Add Scooter
              </button>
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
              {[
                { name: "Yamaha NMAX", plate: "DK 1823 XA", odo: "12,450 km", oil: "10 Aug 2026", service: "15 Jul 2026" },
                { name: "Honda Vario", plate: "DK 8899 BB", odo: "8,300 km", oil: "05 Aug 2026", service: "20 Jun 2026" }
              ].filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.plate.toLowerCase().includes(serviceSearch.toLowerCase())).map((scooter, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{scooter.name}</h3>
                      <p className="text-xs text-gray-500 font-bold mt-0.5">{scooter.plate}</p>
                    </div>
                    <button className="ml-auto bg-gray-100 hover:bg-gray-200 text-black px-3 py-1.5 rounded-full text-xs font-bold transition-colors">
                      Update Log
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Odometer</p>
                      <p className="text-sm font-bold text-gray-900">{scooter.odo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Last Oil Change</p>
                      <p className="text-sm font-bold text-gray-900">{scooter.oil}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Last Service</p>
                      <p className="text-sm font-bold text-gray-900">{scooter.service}</p>
                    </div>
                  </div>
                </div>
              ))}
              {[
                { name: "Yamaha NMAX", plate: "DK 1823 XA", odo: "12,450 km", oil: "10 Aug 2026", service: "15 Jul 2026" },
                { name: "Honda Vario", plate: "DK 8899 BB", odo: "8,300 km", oil: "05 Aug 2026", service: "20 Jun 2026" }
              ].filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.plate.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && (
                <div className="py-12 text-center text-gray-400 font-bold">No records found.</div>
              )}
            </div>
          </div>
        ) : activeTab === 'profile' || activeTab === 'settings' ? (
          <div className="p-5 md:px-8 pb-12 animate-in fade-in max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor Name</label>
                <input type="text" defaultValue="Putu Rentals" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                <input type="text" defaultValue="+62 851 7411 9423" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location / Address</label>
                <textarea defaultValue="Jl. Monkey Forest No. 12, Ubud, Bali" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all min-h-[100px]"></textarea>
              </div>
              <button className="w-full bg-black text-white rounded-xl py-3.5 font-bold text-sm hover:scale-[1.02] transition-transform">Save Changes</button>
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
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl h-40 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors cursor-pointer bg-gray-50 relative overflow-hidden group">
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wide">Upload Photo 1</span>
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl h-40 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors cursor-pointer bg-gray-50 relative overflow-hidden group">
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wide">Upload Photo 2</span>
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Vehicle Details</h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Model Name</label>
                    <input type="text" placeholder="e.g. Yamaha NMAX" value={newScooter.name} onChange={e => setNewScooter({...newScooter, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Brand</label>
                      <input type="text" placeholder="e.g. Yamaha" value={newScooter.brand} onChange={e => setNewScooter({...newScooter, brand: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Engine (CC)</label>
                      <input type="text" placeholder="e.g. 155cc" value={newScooter.cc} onChange={e => setNewScooter({...newScooter, cc: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Year</label>
                    <input type="text" placeholder="2024" value={newScooter.year} onChange={e => setNewScooter({...newScooter, year: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>

                {/* Pricing & Units Section */}
                <div className="space-y-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Pricing & Units</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Daily (Rp)</label>
                      <input type="number" value={newScooter.price || ''} onChange={e => setNewScooter({...newScooter, price: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Weekly (Rp)</label>
                      <input type="number" value={newScooter.priceWeekly || ''} onChange={e => setNewScooter({...newScooter, priceWeekly: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Monthly (Rp)</label>
                      <input type="number" value={newScooter.priceMonthly || ''} onChange={e => setNewScooter({...newScooter, priceMonthly: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Units</label>
                    <input type="number" min="1" value={newScooter.totalUnits} onChange={e => setNewScooter({...newScooter, totalUnits: parseInt(e.target.value) || 1})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      if(!newScooter.name) return;
                      setFleet([...fleet, { ...newScooter, id: Date.now(), availableUnits: newScooter.totalUnits }]);
                      setIsAddingScooter(false);
                      setNewScooter({ name: "", brand: "", cc: "", year: "", price: 0, priceWeekly: 0, priceMonthly: 0, totalUnits: 1, availableUnits: 1, photos: [] });
                    }} 
                    className="w-full bg-black text-white rounded-[20px] py-4 font-black text-lg hover:scale-[1.01] shadow-xl shadow-black/10 transition-transform">
                    Publish
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingScooter && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black">Edit Scooter</h3>
                <button onClick={() => setEditingScooter(null)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 -mx-1">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
                  <input type="text" value={editingScooter.name} onChange={e => setEditingScooter({...editingScooter, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Brand</label>
                    <input type="text" value={editingScooter.brand || ''} onChange={e => setEditingScooter({...editingScooter, brand: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Engine (CC)</label>
                    <input type="text" value={editingScooter.cc || ''} onChange={e => setEditingScooter({...editingScooter, cc: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Year</label>
                    <input type="text" value={editingScooter.year} onChange={e => setEditingScooter({...editingScooter, year: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Daily (Rp)</label>
                    <input type="number" value={editingScooter.price} onChange={e => setEditingScooter({...editingScooter, price: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Weekly (Rp)</label>
                    <input type="number" value={editingScooter.priceWeekly || ''} onChange={e => setEditingScooter({...editingScooter, priceWeekly: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Monthly (Rp)</label>
                    <input type="number" value={editingScooter.priceMonthly || ''} onChange={e => setEditingScooter({...editingScooter, priceMonthly: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total Units</label>
                  <input type="number" min="1" value={editingScooter.totalUnits} onChange={e => setEditingScooter({...editingScooter, totalUnits: parseInt(e.target.value) || 1})} className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5" />
                </div>
              </div>
              <button 
                onClick={() => {
                  setFleet(f => f.map(s => s.id === editingScooter.id ? editingScooter : s));
                  setEditingScooter(null);
                }} 
                className="w-full mt-8 bg-black text-white rounded-[16px] py-4 font-black text-sm hover:scale-[1.02] shadow-xl shadow-black/10 transition-all">
                Save Changes
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
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
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
