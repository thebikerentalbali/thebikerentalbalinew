"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Star, Share, Loader2, X, BadgeCheck, MessageCircle, Check, Clock } from "lucide-react"
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
  const [activeInfoModal, setActiveInfoModal] = useState<'hours' | 'delivery' | 'requirements' | null>(null)

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

  const getDeliveryArea = (address?: string) => {
    const addr = (address || '').toLowerCase()
    if (
      addr.includes('ubud') || 
      addr.includes('mas') || 
      addr.includes('sayan') || 
      addr.includes('gianyar') || 
      addr.includes('tegallalang') || 
      addr.includes('campuhan') || 
      addr.includes('penestanan') ||
      addr.includes('lodtunduh') ||
      addr.includes('pengosekan')
    ) {
      return "Ubud area only - Central Ubud, Mas, Sayan, Campuhan, Penestanan & Tegallalang"
    }
    if (
      addr.includes('canggu') || 
      addr.includes('pererenan') || 
      addr.includes('berawa') || 
      addr.includes('tibubeneng') || 
      addr.includes('umalas')
    ) {
      return "Canggu, Berawa, Pererenan, Umalas & Kerobokan"
    }
    if (
      addr.includes('seminyak') || 
      addr.includes('legian') || 
      addr.includes('kuta') || 
      addr.includes('petitenget')
    ) {
      return "Seminyak, Kuta, Legian, Kerobokan & DPS Airport"
    }
    if (
      addr.includes('uluwatu') || 
      addr.includes('jimbaran') || 
      addr.includes('ungasan') || 
      addr.includes('pecatu') || 
      addr.includes('bingin') ||
      addr.includes('padang padang')
    ) {
      return "Uluwatu, Pecatu, Bingin, Padang Padang, Ungasan & Jimbaran"
    }
    if (
      addr.includes('sanur') || 
      addr.includes('denpasar') || 
      addr.includes('renon')
    ) {
      return "Sanur, Denpasar, Renon & DPS Airport"
    }
    if (
      addr.includes('nusa dua') || 
      addr.includes('benoa')
    ) {
      return "Nusa Dua, Tanjung Benoa & Jimbaran"
    }
    if (
      addr.includes('amed') || 
      addr.includes('candidasa') || 
      addr.includes('tulamben')
    ) {
      return "Amed, Candidasa, Tulamben & East Bali"
    }
    return "Local area hotel & villa delivery"
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

            {/* 3 Column Stats (No border lines when swiping) */}
            <div className="flex items-center justify-between py-3 max-w-sm mb-3">
              {/* Rating */}
              <div className="flex flex-col items-center justify-center flex-1 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-gray-800 fill-gray-800" />
                  <span className="font-bold text-lg text-gray-900">5.0</span>
                </div>
                <span className="text-[13px] text-gray-500 mt-0.5">rating</span>
              </div>
              
              <div className="w-px h-7 bg-gray-200" />

              {/* Reviews */}
              <div className="flex flex-col items-center justify-center flex-1 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>
                <span className="font-bold text-lg text-gray-900">{reviews.length}+</span>
                <span className="text-[13px] text-gray-500 mt-0.5">reviews</span>
              </div>

              <div className="w-px h-7 bg-gray-200" />

              {/* Scooters Count */}
              <div className="flex flex-col items-center justify-center flex-1">
                <span className="font-bold text-lg text-gray-900">{scooters.reduce((sum, scooter) => sum + (scooter.total_units || 1), 0)}</span>
                <span className="text-[13px] text-gray-500 mt-0.5">scooters</span>
              </div>
            </div>

            {/* Quick Info Pill Buttons (Black background, white title) */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar -mx-5 px-5">
              <button 
                onClick={() => setActiveInfoModal('hours')}
                className="bg-black hover:bg-neutral-800 active:scale-95 transition-all text-white text-xs font-semibold px-4 py-2.5 rounded-full shrink-0 flex items-center gap-2 shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-white" />
                <span>Operating Hours</span>
              </button>

              <button 
                onClick={() => setActiveInfoModal('delivery')}
                className="bg-black hover:bg-neutral-800 active:scale-95 transition-all text-white text-xs font-semibold px-4 py-2.5 rounded-full shrink-0 flex items-center gap-2 shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>Delivery Areas</span>
              </button>

              <button 
                onClick={() => setActiveInfoModal('requirements')}
                className="bg-black hover:bg-neutral-800 active:scale-95 transition-all text-white text-xs font-semibold px-4 py-2.5 rounded-full shrink-0 flex items-center gap-2 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Rental Requirements</span>
              </button>
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
      {/* DESKTOP LAYOUT (MD AND UP) - CLEAN & SIMPLE LIKE MOBILE */}
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
            <button 
              onClick={handleShare}
              className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share className="w-4 h-4 text-gray-600" />}
              <span>{copiedLink ? "Link Copied!" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Vendor Header Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          {/* Cover Photo */}
          <div className="relative h-60 lg:h-72 w-full bg-gray-100">
            {vendor.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={vendor.image_url} alt={vendor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300" />
            )}
          </div>

          {/* Profile Details */}
          <div className="px-8 pb-8 pt-0">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-14 relative z-10 mb-6">
              
              {/* Avatar & Title */}
              <div className="flex items-end gap-5">
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-md shrink-0 flex items-center justify-center">
                  {vendor.logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-400">{(vendor.name || "V").substring(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{vendor.name}</h1>
                    <BadgeCheck className="w-6 h-6 text-white fill-blue-500 shrink-0" />
                  </div>
                  <p className="text-gray-500 text-sm">{vendor.address || 'Premium scooter rental in Bali'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-gray-800 shadow-sm transition-colors text-sm"
                >
                  Write a Review
                </button>
                <a 
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white font-bold px-6 py-3 rounded-full hover:bg-[#20bd5a] shadow-sm transition-colors flex items-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquire on WhatsApp
                </a>
              </div>
            </div>

            {/* 3 Column Stats - Simple & Clean just like Mobile */}
            <div className="flex items-center gap-8 py-4 border-t border-gray-100 max-w-md">
              {/* Rating */}
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-gray-800 fill-gray-800" />
                  <span className="font-bold text-lg text-gray-900">5.0</span>
                </div>
                <span className="text-sm text-gray-500">rating</span>
              </div>
              
              <div className="w-px h-6 bg-gray-200" />

              {/* Reviews */}
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setIsReviewModalOpen(true)}>
                <span className="font-bold text-lg text-gray-900">{reviews.length}+</span>
                <span className="text-sm text-gray-500">reviews</span>
              </div>

              <div className="w-px h-6 bg-gray-200" />

              {/* Scooters Count */}
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-lg text-gray-900">{scooters.reduce((sum, scooter) => sum + (scooter.total_units || 1), 0)}</span>
                <span className="text-sm text-gray-500">scooters</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main 8 Columns (Fleet & Reviews) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Scooters Fleet */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
              
              {/* Header with Brand Filter */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Available Scooters</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{scooters.length} bikes available</p>
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
                            ? "bg-black text-white"
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
                  <p className="text-sm font-semibold text-gray-700">No scooters match the selected brand</p>
                  <button 
                    onClick={() => setSelectedBrand("All")}
                    className="mt-3 px-4 py-2 bg-black text-white text-xs font-semibold rounded-full"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredScooters.map((scooter) => (
                    <Link 
                      key={scooter.id} 
                      href={`/detail/${scooter.id}`}
                      className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Backdrop */}
                        <div className="relative w-full h-44 bg-[#F8F9FA] rounded-2xl flex items-center justify-center p-3 mb-3">
                          <span className="absolute top-3 left-3 text-[10px] font-semibold tracking-wider uppercase text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                            {scooter.brand || 'Scooter'}
                          </span>
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#00A86B]/10 px-2 py-0.5 rounded-full border border-[#00A86B]/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00A86B]"></div>
                            <span className="text-[10px] font-bold text-[#00A86B] uppercase tracking-wider">
                              {scooter.available_units || 2} AVAILABLE
                            </span>
                          </div>

                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={scooter.image_url || "/images/scooter.png"} 
                            alt={scooter.name} 
                            className="w-full h-full object-contain drop-shadow-md" 
                          />
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-gray-900 text-base mb-1">
                          {scooter.name}
                        </h3>
                      </div>

                      {/* Price & CTA */}
                      <div className="pt-3 border-t border-gray-50 flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-bold text-gray-900 leading-none">
                            Rp {scooter.price_daily?.toLocaleString('id-ID') || scooter.price_daily}
                          </span>
                          <span className="text-xs text-gray-500 font-medium ml-1">/day</span>
                        </div>
                        <span className="text-xs font-semibold bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
                          Book
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reviews ({reviews.length})</h2>
                </div>
                <button 
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="text-xs font-bold bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Write a Review
                </button>
              </div>

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.slice(0, 6).map((review) => (
                  <div key={review.id} className="bg-[#F8F9FA] rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-0.5 mb-2">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">"{review.comment || 'Smooth rental process and well-maintained bike.'}"</p>
                    </div>
                    <p className="font-bold text-xs text-gray-900">- {review.user_name || 'User'}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-sm text-gray-500">No reviews yet. Be the first!</div>
                )}
              </div>

              {reviews.length > 6 && (
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold rounded-full text-xs transition-all"
                  >
                    See All Reviews
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Sticky Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 self-start">
            
            {/* Hours & Delivery */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base mb-4">Hours & Delivery</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Operating Hours</span>
                  <p className="font-medium text-gray-800">{vendor.opening_hours || '08:00 AM – 08:00 PM Daily'}</p>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium block">Delivery Areas</span>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {vendor.delivery_area || getDeliveryArea(vendor.address)}
                  </p>
                </div>
              </div>
            </div>

            {/* Rental Requirements */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-xs text-gray-500 space-y-2">
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

      {/* Details Pop-up Modal for Hours, Delivery, and Requirements */}
      {activeInfoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setActiveInfoModal(null)}
        >
          <div 
            className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-bold">
                  {activeInfoModal === 'hours' && <Clock className="w-4 h-4" />}
                  {activeInfoModal === 'delivery' && <MapPin className="w-4 h-4" />}
                  {activeInfoModal === 'requirements' && <Check className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  {activeInfoModal === 'hours' && 'Operating Hours'}
                  {activeInfoModal === 'delivery' && 'Delivery Areas'}
                  {activeInfoModal === 'requirements' && 'Rental Requirements'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveInfoModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {activeInfoModal === 'hours' && (
              <div className="space-y-4">
                <div className="bg-neutral-900 text-white rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Working Schedule</span>
                    <span className="text-[11px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">Open Daily</span>
                  </div>
                  <p className="font-bold text-xl text-white">{vendor.opening_hours || '08:00 AM – 08:00 PM'}</p>
                  <p className="text-xs text-gray-300 mt-1">Monday through Sunday (WITA Bali Time)</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Service Details</h4>
                  <div className="space-y-2.5 text-xs text-gray-600">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>
                      <p><strong className="text-gray-900">Instant Delivery:</strong> Drop-off directly to your hotel or villa during open hours.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-[10px] font-bold">2</div>
                      <p><strong className="text-gray-900">Direct Shop Pickup:</strong> Free collection and return at the vendor location.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 text-[10px] font-bold">3</div>
                      <p><strong className="text-gray-900">Continuous Support:</strong> Responsive customer service & assistance throughout the day.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeInfoModal === 'delivery' && (
              <div className="space-y-4">
                <div className="bg-neutral-900 text-white rounded-2xl p-4">
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Delivery Coverage</span>
                  <p className="font-bold text-base text-white leading-snug">{vendor.delivery_area || getDeliveryArea(vendor.address)}</p>
                  <p className="text-xs text-gray-300 mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>Dispatched from: {vendor.address || 'Bali, Indonesia'}</span>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Delivery Policy</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">To Your Accommodation:</strong> Delivered straight to your hotel, villa, or Airbnb.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">Free Delivery Radius:</strong> Free delivery within 5km from shop location.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">Included Equipment:</strong> 2 sanitized helmets & phone holder.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeInfoModal === 'requirements' && (
              <div className="space-y-4">
                <div className="bg-neutral-900 text-white rounded-2xl p-4">
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Required Documents</span>
                  <div className="space-y-2 text-xs text-gray-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="font-semibold text-white">Valid Passport or National ID copy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="font-semibold text-white">International or National Driving License</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">What's Included & Policies</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">Free Cancellation:</strong> 100% free cancellation up to 24h before rental date.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">2 Sanitized Helmets:</strong> Clean and sanitized before every handover.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p><strong className="text-gray-900">Safety Inspected:</strong> Fully inspected for tires, brakes, and lights prior to delivery.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button 
                onClick={() => setActiveInfoModal(null)}
                className="w-full bg-black text-white font-bold py-3.5 rounded-2xl hover:bg-gray-800 transition-colors text-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
