"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, MapPin, Star, Share, Loader2, X } from "lucide-react"
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
      
      const { data: vData } = await supabase.from('vendors').select('*').eq('id', id).single()
      if (vData) {
        setVendor(vData)
        
        const { data: sData } = await supabase.from('scooters').select('*').eq('vendor_id', id)
        setScooters(sData || [])

        const { data: rData } = await supabase.from('reviews').select('*').eq('vendor_id', id)
        let loadedReviews = rData || [];
        
        // Smart algorithm to auto-generate 40-70 reviews if none exist
        if (loadedReviews.length === 0) {
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
          
          const numReviews = Math.floor(Math.random() * 31) + 40; // 40 to 70
          const generatedReviews = [];
          for (let i = 0; i < numReviews; i++) {
            const randomName = firstNames[Math.floor(Math.random() * firstNames.length)] + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".";
            const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
            generatedReviews.push({
              vendor_id: id,
              user_name: randomName,
              rating: 5,
              comment: randomComment
            });
          }
          
          const { data: insertedReviews, error } = await supabase.from('reviews').insert(generatedReviews).select();
          if (insertedReviews) {
            loadedReviews = insertedReviews;
          } else {
            // Fallback: show in UI even if DB insert fails
            console.error("Auto-generate reviews failed:", error);
            loadedReviews = generatedReviews.map((r, idx) => ({ ...r, id: `generated-${idx}` }));
          }
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
        // If the user came directly from an external link (like WhatsApp), send them to home
        router.push('/');
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
                const vendorSlug = vendor?.name ? vendor.name.toLowerCase().replace(/[^a-z0-9]+/g, '') : 'vendor';
                const url = `${window.location.origin}/${vendorSlug}`;
                if (navigator.share) {
                  navigator.share({ title: vendor.name, url });
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
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm shrink-0 flex items-center justify-center">
              {vendor.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-gray-400">{(vendor.name || "V").substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">{vendor.name}</h2>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => setIsReviewModalOpen(true)} className="flex items-center gap-1.5 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100 w-fit hover:bg-yellow-100 transition-colors">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-700">5.0</span>
                  <span className="text-sm text-yellow-600/80 font-medium">({reviews.length} reviews)</span>
                </button>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate">{vendor.address || 'Bali'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Swipeable Reviews directly under vendor info */}
          <div className="mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6">
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
              {reviews.slice(0, 5).map(review => (
                <div key={review.id} className="snap-start shrink-0 w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col justify-between">
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
                className="flex-1 bg-black text-white font-bold py-2.5 rounded-xl text-sm hover:bg-gray-800 transition-colors shadow-sm"
              >
                Write a Review
              </button>
              {reviews.length > 0 && (
                <button 
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex-1 bg-white border border-gray-200 text-black font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  See More
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Desktop Reviews Section */}
        <div className="hidden md:block bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Recent Reviews</h3>
            <div className="flex items-center gap-4">
              <button className="text-[13px] font-semibold bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors shadow-sm">Write Review</button>
              <span className="text-[13px] font-medium text-blue-600 cursor-pointer hover:underline">See all</span>
            </div>
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
