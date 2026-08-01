"use client"

import { ChevronLeft, MapPin, Star, Share } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function VendorPage() {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('fromMap') === 'true') {
        router.push('/?showMap=true');
      } else {
        router.back();
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] w-full md:py-8">
      <div className="flex flex-col md:grid md:grid-cols-[350px_1fr] lg:grid-cols-[400px_1fr] md:gap-8 lg:gap-12 min-h-screen md:min-h-0 bg-[#F0F2F5] relative pb-24 md:pb-8 md:max-w-5xl md:mx-auto md:shadow-2xl md:rounded-[40px] md:overflow-hidden md:border md:border-gray-200 md:p-8">
      {/* Header */}
      <header className="relative bg-white pt-8 pb-6 px-6 shadow-sm rounded-b-3xl md:rounded-3xl z-10 h-fit">
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleBack} className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <button 
            onClick={() => {
              const url = `${window.location.origin}/puturentals`;
              if (navigator.share) {
                navigator.share({ title: 'Putu Rentals', url });
              } else {
                navigator.clipboard.writeText(url);
                alert('Link copied to clipboard!');
              }
            }}
            className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 active:scale-95 transition-transform"
          >
            <Share className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop" alt="Vendor" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Putu Rentals</h2>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-700">4.9</span>
                <span className="text-sm text-gray-400">(128 reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate">Jl. Monkey Forest No. 12, Ubud</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Available Scooters */}
      <div className="px-6 mt-8 md:mt-0 md:px-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
          <span>Available Scooters</span>
          <span className="text-xs font-medium text-[#00A86B] bg-[#00A86B]/10 px-2.5 py-1.5 rounded-full">3 Live Now</span>
        </h3>
        
        <div className="space-y-4">
          {[
            { id: 1, name: "Vespa Primavera", price: 25, img: "/images/scooter.png", rating: 4.9, brand: "Vespa" },
            { id: 2, name: "Honda Scoopy", price: 15, img: "/images/scooter.png", rating: 4.8, brand: "Honda" },
            { id: 3, name: "Yamaha NMAX", price: 20, img: "/images/scooter.png", rating: 4.7, brand: "Yamaha" },
          ].map((scooter) => (
            <Link key={scooter.id} href={`/detail/${scooter.id}`} className="bg-white rounded-3xl p-4 flex gap-4 shadow-sm items-center border border-transparent hover:border-gray-100 transition-colors">
              <div className="w-24 h-24 rounded-2xl bg-[#F8F9FA] flex items-center justify-center p-2 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={scooter.img} alt={scooter.name} className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{scooter.brand}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-gray-600">{scooter.rating}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 text-[15px] mb-1 truncate">{scooter.name}</h4>
                <div className="flex items-end mt-2">
                  <span className="text-lg font-bold text-gray-900 leading-none">${scooter.price}</span>
                  <span className="text-xs text-gray-500 font-medium ml-1 mb-0.5">/Day</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}
