"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, MapPin, Star, Share, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from '@/lib/supabase/client'

export default function VendorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()

  const [vendor, setVendor] = useState<any>(null)
  const [scooters, setScooters] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      
      const { data: vData } = await supabase.from('vendors').select('*').eq('id', id).single()
      if (vData) {
        setVendor(vData)
        
        const { data: sData } = await supabase.from('scooters').select('*').eq('vendor_id', id)
        setScooters(sData || [])

        const { data: rData } = await supabase.from('reviews').select('*').eq('vendor_id', id)
        setReviews(rData || [])
      }
      setLoading(false)
    }
    loadData()
  }, [id])

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

  if (loading) {
    return <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Vendor not found</h2>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-black text-white rounded-full">Go Back Home</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] w-full md:py-8">
      <div className="flex flex-col md:grid md:grid-cols-[350px_1fr] lg:grid-cols-[400px_1fr] md:gap-8 lg:gap-12 min-h-screen md:min-h-0 bg-[#F0F2F5] relative pb-24 md:pb-8 md:max-w-5xl md:mx-auto md:shadow-2xl md:rounded-[40px] md:overflow-hidden md:border md:border-gray-200 md:p-8">
      {/* Left Column: Vendor Info & Reviews */}
      <div className="flex flex-col gap-6">
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
              <img src={vendor.image_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop"} alt={vendor.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">{vendor.name}</h2>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">{vendor.rating}</span>
                  <span className="text-sm text-gray-400">({vendor.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate">{vendor.address || 'Bali'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Reviews Section */}
        <div className="hidden md:block bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Recent Reviews</h3>
            <span className="text-sm font-medium text-blue-600 cursor-pointer">See all</span>
          </div>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-gray-900">{review.author_name}</span>
                    <span className="text-xs text-gray-400">{review.review_date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{review.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Available Scooters */}
      <div className="px-6 mt-8 md:mt-0 md:px-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
          <span>Available Scooters</span>
          <span className="text-xs font-medium text-[#00A86B] bg-[#00A86B]/10 px-2.5 py-1.5 rounded-full">{scooters.length} Live Now</span>
        </h3>
        
        <div className="space-y-4">
          {scooters.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No scooters available right now</p>
            </div>
          ) : (
            scooters.map((scooter) => (
              <Link key={scooter.id} href={`/detail/${scooter.id}`} className="bg-white rounded-3xl p-4 flex gap-4 shadow-sm items-center border border-transparent hover:border-gray-100 transition-colors">
                <div className="w-24 h-24 rounded-2xl bg-[#F8F9FA] flex items-center justify-center p-2 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={scooter.image_url || "/images/scooter.png"} alt={scooter.name} className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{scooter.brand}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-600">4.9</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-[15px] mb-1 truncate">{scooter.name}</h4>
                  <div className="flex items-end mt-2">
                    <span className="text-lg font-bold text-gray-900 leading-none">${scooter.price_daily}</span>
                    <span className="text-xs text-gray-500 font-medium ml-1 mb-0.5">/Day</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
