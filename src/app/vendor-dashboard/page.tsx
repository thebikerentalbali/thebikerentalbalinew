import { Bike, DollarSign, CalendarDays, Settings, Bell, Search, Star, MapPin } from "lucide-react"
import Link from "next/link"

export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Vendor Portal</h2>
          <p className="text-xs text-gray-500 mt-1">Manage your fleet</p>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1">
          <Link href="/vendor-dashboard" className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded-xl transition-colors">
            <BarChartIcon className="w-5 h-5" />
            <span className="font-semibold text-sm">Dashboard</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors">
            <Bike className="w-5 h-5" />
            <span className="font-medium text-sm">My Fleet</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors">
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium text-sm">Bookings</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors">
            <DollarSign className="w-5 h-5" />
            <span className="font-medium text-sm">Earnings</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 m-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-[2px]">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span className="font-bold text-gray-800 text-xs">PR</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Putu Rentals</p>
              <Link href="/" className="text-xs text-gray-500 hover:text-black">Back to Home</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search bookings..." className="pl-9 pr-4 py-2 bg-gray-50 rounded-full text-sm outline-none w-64 border border-transparent focus:border-gray-200 focus:bg-white transition-all" />
            </div>
            <button className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm relative hover:bg-gray-50">
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 pb-24 overflow-y-auto">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">Rp 4.250.000</p>
              <p className="text-xs font-semibold text-green-500 mt-2">+12% this week</p>
            </div>
            
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-500">Active Rentals</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">8 <span className="text-sm font-medium text-gray-400">/ 12 total</span></p>
              <p className="text-xs font-medium text-gray-500 mt-2">4 scooters available now</p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">4.9</p>
              <p className="text-xs font-medium text-gray-500 mt-2">Based on 124 reviews</p>
            </div>
          </div>

          {/* Active Bookings Table */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
              <button className="text-sm font-semibold text-blue-600">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold pl-6">Customer</th>
                    <th className="p-4 font-semibold">Scooter</th>
                    <th className="p-4 font-semibold">Duration</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900">John Doe</td>
                    <td className="p-4 text-gray-600">Yamaha NMAX</td>
                    <td className="p-4 text-gray-600">3 Days</td>
                    <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Active</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900">Sarah Smith</td>
                    <td className="p-4 text-gray-600">Honda Scoopy</td>
                    <td className="p-4 text-gray-600">1 Week</td>
                    <td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900">Michael T.</td>
                    <td className="p-4 text-gray-600">Vespa Primavera</td>
                    <td className="p-4 text-gray-600">Daily</td>
                    <td className="p-4"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Completed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

function BarChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  )
}
