import { Users, Bike, DollarSign, Settings, Bell, Search, MapPin, Store } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black text-white border-r border-gray-800 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight">Admin Console</h2>
          <p className="text-xs text-gray-400 mt-1">Platform management</p>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1">
          <Link href="/admin-dashboard" className="flex items-center gap-3 bg-white/10 text-white px-4 py-3 rounded-xl transition-colors">
            <BarChartIcon className="w-5 h-5" />
            <span className="font-semibold text-sm">Overview</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-400 hover:bg-white/5 px-4 py-3 rounded-xl transition-colors">
            <Store className="w-5 h-5" />
            <span className="font-medium text-sm">Vendors</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-400 hover:bg-white/5 px-4 py-3 rounded-xl transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium text-sm">Users</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-400 hover:bg-white/5 px-4 py-3 rounded-xl transition-colors">
            <DollarSign className="w-5 h-5" />
            <span className="font-medium text-sm">Revenue</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 text-gray-400 hover:bg-white/5 px-4 py-3 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Platform Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800 m-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-[2px]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <span className="font-bold text-white text-xs">AD</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Super Admin</p>
              <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">Back to Home</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search across platform..." className="pl-9 pr-4 py-2 bg-gray-50 rounded-full text-sm outline-none w-72 border border-transparent focus:border-gray-200 focus:bg-white transition-all" />
            </div>
            <button className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm relative hover:bg-gray-50">
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 pb-24 overflow-y-auto">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-500">Gross Volume (GMV)</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">Rp 128.5M</p>
              <p className="text-xs font-semibold text-green-500 mt-2">+24% this month</p>
            </div>
            
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-500">Active Vendors</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">42</p>
              <p className="text-xs font-medium text-green-500 mt-2">+3 new vendors</p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-500">Total Fleet</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">356</p>
              <p className="text-xs font-medium text-gray-500 mt-2">Across all vendors</p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">1,248</p>
              <p className="text-xs font-medium text-green-500 mt-2">+124 this month</p>
            </div>
          </div>

          {/* Vendors Table */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Top Performing Vendors</h3>
              <button className="text-sm font-semibold text-blue-600">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold pl-6">Vendor Name</th>
                    <th className="p-4 font-semibold">Location</th>
                    <th className="p-4 font-semibold">Fleet Size</th>
                    <th className="p-4 font-semibold">Total Revenue</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">PR</div>
                      Putu Rentals
                    </td>
                    <td className="p-4 text-gray-600">Ubud</td>
                    <td className="p-4 text-gray-600">12 Scooters</td>
                    <td className="p-4 font-semibold text-gray-900">Rp 12.5M</td>
                    <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Verified</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">WB</div>
                      Wayan Bikes
                    </td>
                    <td className="p-4 text-gray-600">Canggu</td>
                    <td className="p-4 text-gray-600">24 Scooters</td>
                    <td className="p-4 font-semibold text-gray-900">Rp 28.2M</td>
                    <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Verified</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">MS</div>
                      Made Scooter
                    </td>
                    <td className="p-4 text-gray-600">Seminyak</td>
                    <td className="p-4 text-gray-600">8 Scooters</td>
                    <td className="p-4 font-semibold text-gray-900">Rp 8.1M</td>
                    <td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending Review</span></td>
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
