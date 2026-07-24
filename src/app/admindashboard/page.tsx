"use client"

import { useState } from "react"
import { Users, Bike, DollarSign, Settings, Bell, Search, Store, BarChart3, Home, ChevronRight, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("home")
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
          <button onClick={() => setActiveTab('vendors')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'vendors' ? 'bg-white/10 text-white shadow-sm shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Store className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Vendors</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors relative ${activeTab === 'users' ? 'bg-white/10 text-white shadow-sm shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Users className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Users</span>
            <span className="absolute right-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
          </button>
          <button onClick={() => setActiveTab('revenue')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${activeTab === 'revenue' ? 'bg-white/10 text-white shadow-sm shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <DollarSign className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Revenue</span>
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
        <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-5 py-4 border-b border-gray-100 flex items-center justify-between md:py-6 md:px-8 md:bg-transparent md:border-none md:backdrop-blur-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black p-[2px] shrink-0 md:hidden">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-2 border-black">
                <span className="font-bold text-black text-xs">AD</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">Platform Overview</h1>
              <p className="text-xs font-medium text-gray-500 md:text-sm md:mt-1 hidden md:block">System-wide metrics and performance</p>
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
        ) : (
          <div className="p-5 md:px-8 md:pb-12 flex flex-col items-center justify-center flex-1 min-h-[50vh] text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'vendors' && <Store className="w-10 h-10 text-gray-400" />}
              {activeTab === 'users' && <Users className="w-10 h-10 text-gray-400" />}
              {activeTab === 'revenue' && <DollarSign className="w-10 h-10 text-gray-400" />}
              {activeTab === 'settings' && <Settings className="w-10 h-10 text-gray-400" />}
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
        <div className="flex justify-around items-center pt-3 pb-8 px-4">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors w-16 group ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'home' ? 'bg-blue-50' : 'group-hover:bg-gray-50'} p-1.5 rounded-full transition-colors`}>
              <Home className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </button>
          
          <button onClick={() => setActiveTab('vendors')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors w-16 group ${activeTab === 'vendors' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'vendors' ? 'bg-blue-50' : 'group-hover:bg-gray-50'} p-1.5 rounded-full transition-colors`}>
              <Store className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Vendors</span>
          </button>
          
          <button onClick={() => setActiveTab('users')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors w-16 group relative ${activeTab === 'users' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'users' ? 'bg-blue-50' : 'group-hover:bg-gray-50'} p-1.5 rounded-full transition-colors relative`}>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Users</span>
          </button>
          
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1.5 p-2 transition-colors w-16 group ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}>
            <div className={`${activeTab === 'settings' ? 'bg-blue-50' : 'group-hover:bg-gray-50'} p-1.5 rounded-full transition-colors`}>
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
