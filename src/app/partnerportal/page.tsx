import { Bike, DollarSign, CalendarDays, Settings, Bell, Search, Star, Plus, QrCode, Home, Wallet, User, ChevronRight, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] md:flex pb-20 md:pb-0">
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
          <Link href="/partnerportal" className="flex items-center gap-3 bg-black text-white px-4 py-3.5 rounded-2xl transition-colors shadow-md shadow-black/10">
            <Home className="w-5 h-5" />
            <span className="font-bold text-[15px]">Dashboard</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-4 py-3.5 rounded-2xl transition-colors">
            <Bike className="w-5 h-5" />
            <span className="font-semibold text-[15px]">My Fleet</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-4 py-3.5 rounded-2xl transition-colors relative">
            <CalendarDays className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Bookings</span>
            <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-4 py-3.5 rounded-2xl transition-colors">
            <Wallet className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Earnings</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-4 py-3.5 rounded-2xl transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-semibold text-[15px]">Settings</span>
          </Link>
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
      <main className="flex-1 w-full max-w-full md:max-w-4xl lg:max-w-5xl mx-auto flex flex-col min-h-screen">
        
        {/* Mobile App-like Header */}
        <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-5 py-4 border-b border-gray-100 flex items-center justify-between md:py-6 md:px-8 md:bg-transparent md:border-none md:backdrop-blur-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-[2px] shrink-0 md:hidden">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span className="font-bold text-gray-800 text-xs">PR</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">Overview</h1>
              <p className="text-xs font-medium text-gray-500 md:text-sm md:mt-1 hidden md:block">Welcome back, Putu Rentals</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search bookings, scooters..." className="pl-11 pr-4 py-2.5 bg-white rounded-full text-sm font-medium outline-none w-72 shadow-sm border border-gray-100 focus:border-gray-300 focus:ring-4 focus:ring-gray-50 transition-all" />
            </div>
            <Link href="#" className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm relative hover:bg-gray-50 transition-colors">
              <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              <Bell className="w-5 h-5 text-gray-700" />
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
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
      </main>

      {/* 
        ========================================================================
        MOBILE BOTTOM NAVBAR
        ========================================================================
      */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-20 px-4">
          <Link href="/partnerportal" className="flex flex-col items-center gap-1.5 p-2 text-black transition-colors w-16">
            <div className="bg-black/5 p-1.5 rounded-full">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          
          <Link href="#" className="flex flex-col items-center gap-1.5 p-2 text-gray-400 hover:text-black transition-colors w-16 group">
            <div className="group-hover:bg-black/5 p-1.5 rounded-full transition-colors">
              <Bike className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Fleet</span>
          </Link>
          
          <Link href="#" className="flex flex-col items-center gap-1.5 p-2 text-gray-400 hover:text-black transition-colors w-16 group relative">
            <div className="group-hover:bg-black/5 p-1.5 rounded-full transition-colors relative">
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Bookings</span>
          </Link>
          
          <Link href="#" className="flex flex-col items-center gap-1.5 p-2 text-gray-400 hover:text-black transition-colors w-16 group">
            <div className="group-hover:bg-black/5 p-1.5 rounded-full transition-colors">
              <User className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
