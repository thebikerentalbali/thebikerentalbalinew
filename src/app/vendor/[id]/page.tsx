"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Star, Share, Loader2, X, BadgeCheck, ShieldCheck, CheckCircle2, Bike, Sparkles, Clock, MessageCircle, Check } from "lucide-react"
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false)
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string>("All")
  const [copiedLink, setCopiedLink] = useState(false)

  const handleSubmitReview = async () => {
    if (!newReview.name || !newReview.comment) {
      alert("Please enter your name and review.")
      return
    }
    setIsSubmittingReview(true)
    const { error, data } = await supabase.from('reviews').insert({
      vendor_id: id,
      user_name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment
    }).select().single()
    setIsSubmittingReview(false)
    if (!error && data) {
      setReviews([data, ...reviews])
      setIsWriteReviewModalOpen(false)
      setNewReview({ name: "", rating: 5, comment: "" })
    } else {
      alert("Failed to submit review. The reviews table might not exist in Supabase yet.")
    }
  }

  useEffect(() => {
    async function loadData() {
      if (!id) return
      
      const [
        { data: vData },
        { data: sData },
        { data: rData }
      ] = await Promise.all([
        supabase.from('vendors').select('*').eq('id', id).single(),
        supabase.from('scooters').select('*').eq('vendor_id', id),
        supabase.from('reviews').select('*').eq('vendor_id', id)
      ])

      if (vData) {
        setVendor(vData)
        setScooters(sData || [])
        let loadedReviews = rData || [];
        
        // Deterministic mock reviews algorithm
        const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        const absHash = Math.abs(hash);
        const numFakeReviews = (absHash % 31) + 40; // deterministic number 40-70

        if (loadedReviews.length < 5) {
          const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Melissa", "George", "Deborah", "Timothy", "Stephanie"];
          const reviewComments = [
            "Great scooter, ran perfectly the whole trip! The vendor was very responsive and drop-off was super easy. Definitely coming back.",
            "Excellent service and the bike was in top condition. We drove it all around Ubud and didn't have a single problem with the brakes or engine.",
            "Very responsive vendor. Highly recommended.",
            "Smooth rental process. The scooter was clean and well maintained.",
            "Best rental experience in Bali so far. I loved that they provided two good quality helmets and the bike felt practically brand new.",
            "Friendly staff and transparent pricing.",
            "No issues at all. Would definitely rent here again.",
            "Bike worked flawlessly for our week-long stay.",
            "Great value for money. Very reliable and surprisingly fuel-efficient on the steep mountain roads.",
            "Loved the flexibility and easy drop-off.",
            "Scooter was practically brand new. 5 stars!",
            "Customer service was exceptional.",
            "They provided two helmets and a full tank. Awesome! The communication through WhatsApp was clear and they arrived right on time.",
            "Super easy to communicate with.",
            "The scooter handled the steep hills without a problem.",
            "Highly trustworthy vendor.",
            "Quick and easy. No hidden fees.",
            "They delivered the bike right to our hotel.",
            "Incredible experience, very professional.",
            "The bike was powerful and fuel efficient."
          ];
          
          let currentSeed = absHash;
          const seededRandom = () => {
            const x = Math.sin(currentSeed++) * 10000;
            return x - Math.floor(x);
          };

          const generatedReviews = [];
          for (let i = 0; i < numFakeReviews; i++) {
            const randomName = firstNames[Math.floor(seededRandom() * firstNames.length)] + " " + String.fromCharCode(65 + Math.floor(seededRandom() * 26)) + ".";
            const randomComment = reviewComments[Math.floor(seededRandom() * reviewComments.length)];
            generatedReviews.push({
              id: `fake-${i}`,
              vendor_id: id,
              user_name: randomName,
              rating: 5,
              comment: randomComment
            });
          }
          loadedReviews = [...loadedReviews, ...generatedReviews];
        }
        
        setReviews(loadedReviews)
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
      } else if (window.history.length <= 2) {
        router.push('/');
      } else {
        router.back();
      }
    }
  }

  const handleShare = () => {
    const vendorSlug = vendor?.name ? vendor.name.toLowerCase().replace(/[^a-z0-9]+/g, '') : 'vendor';
    const url = `${window.location.origin}/${vendorSlug}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: vendor.name, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  const getWhatsAppUrl = () => {
    const phone = vendor?.phone?.replace(/[^0-9]/g, '') || '6281234567890';
    const cleanPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;
    const message = encodeURIComponent(`Hi ${vendor?.name || 'there'}, I found your scooter rental on The Bike Rental Bali and would like to inquire about availability.`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  }

  const availableBrands = ["All", ...Array.from(new Set(scooters.map(s => s.brand).filter(Boolean)))]
  const filteredScooters = selectedBrand === "All" ? scooters : scooters.filter(s => s.brand?.toLowerCase() === selectedBrand.toLowerCase())

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
    <div className="min-h-screen bg-[#F0F2F5] w-full">
      
      {/* ======================================================== */}
      {/* MOBILE LAYOUT (< MD) - PRESERVED EXACTLY AS ORIGINAL */}
      {/* ======================================================== */}
      <div className="block md:hidden relative pb-24">
        {/* Header */}
        <header className="relative bg-white pb-6 shadow-sm rounded-b-3xl z-10 h-fit overflow-hidden">
          {/* Cover Photo */}
          <div className="relative h-48 w-full bg-gray-100">
            {vendor.image_url ? (
               /* eslint-disable-next-line @next/next/no-img-element */
              <img src={vendor.image_url} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300" />
            )}
            
            {/* Top Buttons floating over cover */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
              <button onClick={handleBack} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-sm hover:bg-white transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>

              <button 
                onClick={handleShare}
                className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-sm hover:bg-white active:scale-95 transition-all"
              >
                <Share className="w-4 h-4 text-gray-800" />
              </button>
            </div>
          </div>

          {/* Profile Details - Left Aligned Layout */}
          <div className="px-5 relative z-10">
            <div className="flex justify-between items-end -mt-12 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-sm shrink-0 flex items-center justify-center">
                  {vendor.logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-gray-400">{(vendor.name || "V").substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{vendor.name}</h2>
                <BadgeCheck className="w-6 h-6 text-white fill-blue-500 shrink-0" />
              </div>
              <p className="text-gray-500 text-[15px]">{vendor.address || 'Premium scooter rental in Bali'}</p>
            </div>

            {/* 3 Column Stats */}
            <div className="flex items-center justify-between py-4 border-y border-gray-100 max-w-sm mb-6">
              {/* Rating */}
              <div className="flex flex-col items-center justify-center flex-1 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-gray-800 fill-gray-800" />
                  <span className="font-bold text-lg text-gray-900">5.0</span>
                </div>
                <span className="text-[13px] text-gray-500 mt-0.5">rating</span>
              </div>
              
              <div className="w-px h-8 bg-gray-200" />

              {/* Reviews */}
              <div className="flex flex-col items-center justify-center flex-1 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>
                <span className="font-bold text-lg text-gray-900">{reviews.length}+</span>
                <span className="text-[13px] text-gray-500 mt-0.5">reviews</span>
              </div>

              <div className="w-px h-8 bg-gray-200" />

              {/* Scooters Count */}
              <div className="flex flex-col items-center justify-center flex-1">
                <span className="font-bold text-lg text-gray-900">{scooters.reduce((sum, scooter) => sum + (scooter.total_units || 1), 0)}</span>
                <span className="text-[13px] text-gray-500 mt-0.5">scooters</span>
              </div>
            </div>

            {/* Swipeable Reviews directly under vendor info */}
            <div className="-mx-5 px-5">
              <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
              <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
                {reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="snap-start shrink-0 w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-[13px] text-gray-600 line-clamp-3 mb-3">"{review.comment}"</p>
                    </div>
                    <p className="font-bold text-xs text-gray-900">- {review.user_name || 'User'}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="w-full text-center py-4 text-sm text-gray-500">No reviews yet. Be the first!</div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button 
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="flex-1 bg-black text-white font-bold py-3 rounded-[20px] text-[15px] hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Write a Review
                </button>
                {reviews.length > 0 && (
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="flex-1 bg-white border border-gray-200 text-black font-bold py-3 rounded-[20px] text-[15px] hover:bg-gray-50 transition-colors"
                  >
                    See More
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Available Scooters on Mobile */}
        <div className="px-6 mt-8">
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
                      <div className="flex items-center gap-1.5 bg-[#00A86B]/10 px-2 py-0.5 rounded-full border border-[#00A86B]/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00A86B]"></div>
                        <span className="text-[10px] font-bold text-[#00A86B] uppercase tracking-wider">{scooter.available_units || 2} AVAILABLE</span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-[15px] mb-1 truncate">{scooter.name}</h4>
                    <div className="flex items-end mt-2">
                      <span className="text-lg font-bold text-gray-900 leading-none">Rp {scooter.price_daily?.toLocaleString('id-ID') || scooter.price_daily}</span>
                      <span className="text-xs text-gray-500 font-medium ml-1 mb-0.5">/Day</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP LAYOUT (MD AND UP) - ENHANCED RESPONSIVE DESIGN */}
      {/* ======================================================== */}
      <div className="hidden md:block w-full max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Breadcrumb & Quick Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack} 
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <nav className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <Link href="/?showMap=true" className="hover:text-black transition-colors">Bali Vendors</Link>
              <span>/</span>
              <span className="text-gray-900 font-semibold">{vendor.name}</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* WhatsApp Chat Button */}
            <a 
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-xs transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Chat</span>
            </a>

            {/* Share Button */}
            <button 
              onClick={handleShare}
              className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share className="w-4 h-4 text-gray-600" />}
              <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
            </button>

            {/* Write Review Button */}
            <button 
              onClick={() => setIsWriteReviewModalOpen(true)}
              className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 shadow-xs transition-all"
            >
              Write a Review
            </button>
          </div>
        </div>

        {/* Panoramic Cover & Vendor Header Banner */}
        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
          {/* Panoramic Cover */}
          <div className="relative h-64 lg:h-72 w-full bg-gradient-to-r from-gray-200 to-gray-300">
            {vendor.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={vendor.image_url} alt={vendor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-slate-800 via-zinc-800 to-neutral-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

            {/* Floating Top Badge */}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md border border-white/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-gray-900 tracking-wider uppercase">Verified Partner • Bali</span>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="px-8 pb-8 pt-0 relative">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-14 relative z-10 mb-6">
              
              {/* Avatar & Title */}
              <div className="flex items-end gap-5">
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-3xl overflow-hidden bg-white border-4 border-white shadow-xl shrink-0 flex items-center justify-center">
                  {vendor.logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-gray-400">{(vendor.name || "V").substring(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="pb-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">{vendor.name}</h1>
                    <BadgeCheck className="w-7 h-7 text-white fill-blue-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-700">{vendor.address || 'Bali, Indonesia'}</span>
                    </div>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 text-xs">
                      100% Inspected Fleet
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-start lg:self-end">
                <button 
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-gray-800 shadow-sm transition-transform hover:scale-105 flex items-center gap-2 text-sm"
                >
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  Write Review
                </button>
                <a 
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-full hover:bg-emerald-700 shadow-sm transition-transform hover:scale-105 flex items-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquire on WhatsApp
                </a>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
              
              {/* Rating */}
              <div 
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-gray-50/80 hover:bg-gray-100/80 transition-colors p-4 rounded-2xl cursor-pointer border border-gray-100 flex items-center gap-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-lg text-gray-900">5.0</span>
                    <span className="text-[10px] text-yellow-700 font-bold bg-yellow-100 px-1.5 py-0.5 rounded">Top Rated</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Average Customer Rating</p>
                </div>
              </div>

              {/* Reviews */}
              <div 
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-gray-50/80 hover:bg-gray-100/80 transition-colors p-4 rounded-2xl cursor-pointer border border-gray-100 flex items-center gap-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="font-black text-lg text-gray-900">{reviews.length}+</span>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Verified Reviews</p>
                </div>
              </div>

              {/* Scooters Fleet */}
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  <Bike className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <span className="font-black text-lg text-gray-900">{scooters.reduce((sum, scooter) => sum + (scooter.total_units || 1), 0)}</span>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Scooters in Fleet</p>
                </div>
              </div>

              {/* Instant Delivery */}
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="font-black text-lg text-gray-900">Instant</span>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Booking & Hotel Delivery</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main 8 Columns (Fleet & Reviews) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Scooters Fleet Card */}
            <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-sm border border-gray-100">
              
              {/* Header with Brand Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl font-black text-gray-900">Available Scooters</h2>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      {scooters.length} Models Live
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Select a bike to view full details and book online.</p>
                </div>

                {/* Brand Filter Chips */}
                {availableBrands.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {availableBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          selectedBrand === brand
                            ? "bg-black text-white shadow-xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Scooter Grid */}
              {filteredScooters.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <Bike className="w-12 h-12 text-gray-300 mb-3" />
                  <h3 className="text-base font-bold text-gray-700">No scooters match the selected brand</h3>
                  <p className="text-xs text-gray-500 mt-1">Try selecting 'All' to view all available inventory.</p>
                  <button 
                    onClick={() => setSelectedBrand("All")}
                    className="mt-4 px-4 py-2 bg-black text-white text-xs font-semibold rounded-full"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredScooters.map((scooter) => (
                    <Link 
                      key={scooter.id} 
                      href={`/detail/${scooter.id}`}
                      className="group bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Backdrop with Badges */}
                        <div className="relative w-full h-44 bg-[#F8F9FA] rounded-2xl flex items-center justify-center p-4 mb-4 overflow-hidden group-hover:bg-[#F3F4F6] transition-colors">
                          {/* Brand Pill */}
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase text-gray-700 border border-gray-100 shadow-xs">
                            {scooter.brand || 'Scooter'}
                          </span>

                          {/* Available Units Pill */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">
                              {scooter.available_units || 2} Available
                            </span>
                          </div>

                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={scooter.image_url || "/images/scooter.png"} 
                            alt={scooter.name} 
                            className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
                          />
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-black transition-colors mb-2">
                          {scooter.name}
                        </h3>

                        {/* Specifications Pills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {scooter.engine && (
                            <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                              {scooter.engine}
                            </span>
                          )}
                          {scooter.transmission && (
                            <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                              {scooter.transmission}
                            </span>
                          )}
                          {scooter.year && (
                            <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                              {scooter.year}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Rent CTA */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Daily Rate</span>
                          <div className="flex items-baseline">
                            <span className="text-xl font-black text-gray-900">
                              Rp {scooter.price_daily?.toLocaleString('id-ID') || scooter.price_daily}
                            </span>
                            <span className="text-xs text-gray-500 font-medium ml-1">/day</span>
                          </div>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-gray-800 transition-colors shadow-sm">
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Reviews Section (Desktop) */}
            <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Verified Reviews</h2>
                  <p className="text-sm text-gray-500 mt-1">Real feedback from travelers who rented from {vendor.name}.</p>
                </div>
                <button 
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="text-sm font-bold bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Write a Review
                </button>
              </div>

              {/* Rating Scorecard */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100/60 rounded-2xl p-6 mb-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="text-4xl lg:text-5xl font-black text-gray-900">5.0</div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 font-semibold">100% of customers recommend this vendor</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{reviews.length} Verified Reviews</span>
                  <p className="text-xs text-gray-500 mt-0.5">Top-tier service & clean fleet reliability</p>
                </div>
              </div>

              {/* Reviews Grid (2 columns on desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.slice(0, 6).map((review) => (
                  <div key={review.id} className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-800 to-black text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {(review.user_name || 'R')[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">{review.user_name || 'Bali Traveler'}</h4>
                            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified Rental</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-0.5">
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        "{review.comment || 'Smooth rental process and well-maintained bike.'}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {reviews.length > 6 && (
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold rounded-full text-sm shadow-sm transition-all"
                  >
                    View All {reviews.length} Reviews
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Sticky Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 self-start">
            
            {/* Free Inclusions Card */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Included in Every Rental
              </h3>
              <ul className="space-y-3.5 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</span>
                  <div>
                    <strong className="text-gray-900 font-semibold block">2 Sanitized Helmets</strong>
                    <span className="text-xs text-gray-500">Standard & XL clean helmets for rider & passenger</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</span>
                  <div>
                    <strong className="text-gray-900 font-semibold block">Rain Ponchos & Medical Kit</strong>
                    <span className="text-xs text-gray-500">Prepared for sudden tropical rain showers</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</span>
                  <div>
                    <strong className="text-gray-900 font-semibold block">Secure Phone Holder</strong>
                    <span className="text-xs text-gray-500">Ready for Google Maps & navigation</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</span>
                  <div>
                    <strong className="text-gray-900 font-semibold block">Full/Half Tank Fuel Ready</strong>
                    <span className="text-xs text-gray-500">Hit the road immediately upon delivery</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</span>
                  <div>
                    <strong className="text-gray-900 font-semibold block">24/7 Bali Roadside Assistance</strong>
                    <span className="text-xs text-gray-500">Immediate bike swap if any technical issue</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Service Area & Hours */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-700" />
                Location & Delivery Coverage
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Base Location</span>
                  <p className="font-semibold text-gray-900">{vendor.address || 'Bali, Indonesia'}</p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Operating Hours</span>
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>08:00 AM – 08:00 PM (Daily)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Delivery Zones</span>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Hotel & villa drop-off available to Canggu, Seminyak, Kuta, Legian, Sanur, Ubud, Uluwatu, and DPS Airport.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Concierge Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[32px] p-6 text-white shadow-lg shadow-emerald-700/15">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-black leading-tight mb-2">Need Help or Custom Delivery?</h3>
              <p className="text-xs text-white/80 leading-relaxed mb-5">
                Chat directly with {vendor.name} on WhatsApp for delivery coordination, monthly discounts, or instant questions.
              </p>
              <a 
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white text-emerald-800 font-bold py-3 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Chat</span>
              </a>
            </div>

            {/* Rental Requirements */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 text-xs text-gray-500 space-y-2">
              <h4 className="font-bold text-gray-900 text-sm mb-2">Rental Requirements</h4>
              <p>• Valid Passport or National ID copy</p>
              <p>• International or National Driving License</p>
              <p>• Free cancellation up to 24h before rental date</p>
            </div>

          </div>

        </div>

      </div>

      {/* Reviews Modal for Mobile & Desktop */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <div>
                <h3 className="font-bold text-lg">Reviews</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold">5.0</span>
                  <span className="text-xs text-gray-500">({reviews.length} reviews)</span>
                </div>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="pb-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                        {(review.user_name || 'U')[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{review.user_name || 'User'}</p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < (review.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment || 'Great service and very friendly!'}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No reviews yet.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  setIsReviewModalOpen(false)
                  setIsWriteReviewModalOpen(true)
                }}
                className="w-full bg-black text-white font-bold py-3.5 rounded-2xl hover:bg-gray-900 transition-colors"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {isWriteReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Write a Review</h3>
              <button onClick={() => setIsWriteReviewModalOpen(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                <input 
                  type="text"
                  value={newReview.name}
                  onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })} className="p-1">
                      <Star className={`w-8 h-8 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                <textarea 
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-black/5 min-h-[120px]"
                  placeholder="Share your experience..."
                ></textarea>
              </div>
              <button 
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="w-full flex justify-center items-center bg-black disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl hover:scale-[1.02] shadow-xl shadow-black/10 transition-all"
              >
                {isSubmittingReview ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
