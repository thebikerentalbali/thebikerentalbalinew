"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Bell, Star, MapPin, Map, Info, Minus, Plus, PlusCircle, X, Trash2, Loader2 } from "lucide-react"
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup")
  const [helmets, setHelmets] = useState<number>(1)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [agreedToFee, setAgreedToFee] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [cart, setCart] = useState<any[]>([])
  const [vendorScooters, setVendorScooters] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('scooters').select('*')
      if (data) {
        const formatted = data.map((s: any) => ({
          ...s,
          img: s.image_url || "/images/scooter.png",
          rating: 5.0,
          available: s.available_units,
          daily: s.price_daily || 0,
          weekly: s.price_weekly || (s.price_daily || 0) * 6,
          monthly: s.price_monthly || (s.price_daily || 0) * 20
        }))
        setVendorScooters(formatted)

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          const sId = params.get("scooterId")
          if (sId) {
            const selected = formatted.find((s: any) => s.id.toString() === sId)
            if (selected) {
              setCart([{ ...selected, quantity: 1, durationMode: "daily", durationCount: 1 }])
            }
          }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta
        return { ...item, quantity: Math.max(1, Math.min(newQ, item.available)) } // prevent going below 1 or above available
      }
      return item
    }))
  }

  const updateDurationMode = (id: number, mode: "daily" | "weekly" | "monthly") => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, durationMode: mode, durationCount: 1 } : item
    ))
  }

  const updateDurationCount = (id: number, delta: number) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, durationCount: Math.max(1, item.durationCount + delta) } : item
    ))
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const addToCart = (scooter: any) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === scooter.id)
      if (exists) {
        return prev.map(i => i.id === scooter.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...scooter, quantity: 1, durationMode: "daily", durationCount: 1 }]
    })
    setShowAddModal(false)
  }

  const getTotalPrice = () => {
    let total = 0
    cart.forEach(item => {
      let base = item.daily
      if (item.durationMode === "weekly") base = item.weekly
      if (item.durationMode === "monthly") base = item.monthly
      total += base * item.quantity * item.durationCount
    })
    return total
  }

  const getWhatsAppLink = () => {
    let message = `*NEW BOOKING REQUEST*\n\n`;
    message += `*VENDOR:* Putu Rentals\n`;
    message += `*CUSTOMER:* ${firstName || "Not provided"} ${lastName || ""}\n`;
    if (startDate && endDate) {
      message += `*RENTAL PERIOD:* ${startDate} to ${endDate}\n`;
    } else if (startDate) {
      message += `*RENTAL START:* ${startDate}\n`;
    } else if (endDate) {
      message += `*RENTAL END:* ${endDate}\n`;
    }
    message += `*HELMETS:* ${helmets}\n`;
    message += `*METHOD:* ${deliveryMethod === 'delivery' ? 'Delivery' : 'Pick Up'}\n`;
    if (deliveryMethod === 'delivery') {
      message += `*ADDRESS:* ${deliveryAddress || "Not provided"}\n`;
      message += `*DELIVERY FEE AGREEMENT:* ${agreedToFee ? 'Yes' : 'No'}\n`;
    }
    message += `\n*FLEET BOOKED:*\n`;
    cart.forEach(item => {
      const durationLabel = item.durationMode === "daily" ? "Days" : item.durationMode === "weekly" ? "Weeks" : "Months";
      message += `- Quantity: ${item.quantity} | Vehicle: ${item.name} | Duration: ${item.durationCount} ${durationLabel}\n`;
    });
    message += `\n*TOTAL PRICE:* Rp ${getTotalPrice().toLocaleString()}`;

    return `https://wa.me/6285174119423?text=${encodeURIComponent(message)}`;
  }

  return (
    <div className="min-h-screen bg-[#EBECEF] w-full md:py-8">
      <div className="flex flex-col min-h-screen md:min-h-0 bg-[#EBECEF] relative p-6 pb-36 md:max-w-6xl md:mx-auto md:shadow-2xl md:rounded-[40px] md:overflow-hidden md:border md:border-gray-200">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </Link>
          <h1 className="text-xl font-medium text-gray-900 absolute left-1/2 -translate-x-1/2">
            Checkout
          </h1>
          <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm relative">
            <Bell className="w-5 h-5 text-gray-800" />
            <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 flex-1">
            
            {/* Left Column: Cart Items */}
            <div className="flex flex-col h-full">
              
              {cart.length === 0 ? (
                <div className="flex-1 bg-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm text-center mb-6">
                  <p className="text-gray-500 mb-4">Your cart is empty.</p>
                  <button onClick={() => setShowAddModal(true)} className="px-6 py-2 bg-black text-white rounded-full font-medium">Add Scooters</button>
                </div>
              ) : (
                cart.map(item => {
          const itemPrice = item.durationMode === "daily" ? item.daily : item.durationMode === "weekly" ? item.weekly : item.monthly
          const durationLabel = item.durationMode === "daily" ? "Days" : item.durationMode === "weekly" ? "Weeks" : "Months"
          const displayLabel = item.durationMode === "daily" ? "Day" : item.durationMode === "weekly" ? "Week" : "Month"

          return (
            <div key={item.id} className="bg-white rounded-[24px] p-5 flex flex-col gap-5 shadow-sm relative border border-transparent mb-6">

              {/* Top Section: Scooter Info */}
              <div className="flex gap-4 pr-8 relative">
                {/* Remove Icon */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="w-24 h-24 bg-[#F8F9FA] rounded-2xl flex items-center justify-center p-2 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <div className="flex flex-col flex-1 py-1">
                  <h3 className="font-semibold text-gray-900 text-[15px] leading-tight mb-1">{item.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 mb-2">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                    <span className="text-[12px] font-medium">{item.rating}</span>
                    <span className="mx-1">•</span>
                    <span className="text-[12px] font-medium">{item.brand}</span>
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <div className="text-gray-900 text-[16px] font-bold">
                      Rp {itemPrice.toLocaleString()} <span className="text-gray-500 text-[13px] font-medium normal-case tracking-normal">/{displayLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section: Quantity & Settings */}
              <div className="border-t border-gray-100 pt-5 space-y-5">
                {/* Duration Mode Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[14px] text-gray-700 font-medium">Rental Plan</label>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-black shadow-sm">
                      {item.available} Units Available
                    </span>
                  </div>
                  <div className="flex bg-gray-50 rounded-xl p-1">
                    <button
                      onClick={() => updateDurationMode(item.id, "daily")}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${item.durationMode === "daily" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => updateDurationMode(item.id, "weekly")}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${item.durationMode === "weekly" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => updateDurationMode(item.id, "monthly")}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${item.durationMode === "monthly" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Counter Row: Duration and Quantity */}
                <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                  {/* Duration Counter */}
                  <div className="flex-1">
                    <p className="text-[13px] text-gray-500 mb-2">How many {durationLabel.toLowerCase()}?</p>
                    <div className="flex items-center justify-between bg-gray-50 rounded-full p-1 border border-gray-100 max-w-[120px]">
                      <button
                        onClick={() => updateDurationCount(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm active:scale-95 transition-transform"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-semibold text-[14px] w-6 text-center">{item.durationCount}</span>
                      <button
                        onClick={() => updateDurationCount(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-[1px] h-10 bg-gray-100"></div>

                  {/* Quantity Counter */}
                  <div className="flex-1 flex flex-col items-end">
                    <p className="text-[13px] text-gray-500 mb-2">Scooters</p>
                    <div className="flex items-center justify-between bg-gray-50 rounded-full p-1 border border-gray-100 max-w-[120px]">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm active:scale-95 transition-transform"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-semibold text-[14px] w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        })
      )}

            {cart.length > 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full bg-white rounded-3xl p-4 flex items-center justify-center gap-2 mb-8 text-gray-800 font-semibold shadow-sm border border-transparent hover:border-gray-100 transition-colors"
              >
                <PlusCircle className="w-5 h-5 text-gray-400" />
                Add Another Scooter
              </button>
            )}
            </div>

        {/* Right Column */}
        <div className="space-y-8 mt-10 md:mt-0 flex flex-col">
          <div className="space-y-8">
        {/* Rental Period */}
        <section>
          <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Rental Period</h2>
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-[14px] text-gray-700 font-medium mb-1.5 pl-1 truncate">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full min-w-0 h-14 bg-white/60 border-none rounded-2xl px-3 sm:px-5 text-[13px] sm:text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-black outline-none text-gray-800 transition-shadow"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[14px] text-gray-700 font-medium mb-1.5 pl-1 truncate">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full min-w-0 h-14 bg-white/60 border-none rounded-2xl px-3 sm:px-5 text-[13px] sm:text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-black outline-none text-gray-800 transition-shadow"
              />
            </div>
          </div>
        </section>

        {/* Customer Details Form */}
        <section>
          <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Customer Details</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[14px] text-gray-700 font-medium mb-1.5 pl-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full h-14 bg-white/60 border-none rounded-2xl px-5 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-black outline-none text-gray-800 transition-shadow"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[14px] text-gray-700 font-medium mb-1.5 pl-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full h-14 bg-white/60 border-none rounded-2xl px-5 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-black outline-none text-gray-800 transition-shadow"
              />
            </div>
          </div>
        </section>

        {/* Helmets & Accessories */}
        <section>
          <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Accessories</h2>
          <div className="bg-white/60 rounded-3xl p-5 flex items-center justify-between border border-transparent hover:border-gray-100 transition-colors">
            <div>
              <p className="font-medium text-gray-900 text-[15px]">Helmets</p>
              <p className="text-[13px] text-gray-500 mt-0.5">Included in rental</p>
            </div>
            <div className="flex items-center justify-between bg-white rounded-full p-1 shadow-sm border border-gray-100 min-w-[110px]">
              <button
                onClick={() => setHelmets(Math.max(1, helmets - 1))}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold text-[15px] w-6 text-center">{helmets}</span>
              <button
                onClick={() => setHelmets(helmets + 1)}
                className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white shadow-sm hover:bg-gray-800 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Delivery Method */}
        <section>
          <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Collection Method</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setDeliveryMethod("pickup")}
              className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${deliveryMethod === "pickup" ? 'border-black bg-white shadow-sm scale-[1.02]' : 'border-transparent bg-white/60 hover:bg-white/80'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${deliveryMethod === "pickup" ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900 text-[14px]">Pick Up</h3>
            </button>
            <button
              onClick={() => setDeliveryMethod("delivery")}
              className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${deliveryMethod === "delivery" ? 'border-black bg-white shadow-sm scale-[1.02]' : 'border-transparent bg-white/60 hover:bg-white/80'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${deliveryMethod === "delivery" ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
                <Map className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900 text-[14px]">Delivery</h3>
            </button>
          </div>

          {deliveryMethod === "delivery" && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
              <label className="block text-[14px] text-gray-700 font-medium mb-2 pl-1">Delivery Address</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your hotel or villa address"
                className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-black outline-none text-gray-800 mb-5 transition-shadow"
              />
              <div className="bg-[#FFF4E5] p-4 rounded-2xl border border-[#FFE0B2] mb-1">
                <div className="flex gap-3 items-start mb-3">
                  <Info className="w-5 h-5 text-[#E65100] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold text-[#E65100] mb-1">Delivery Fee Policy</p>
                    <p className="text-[13px] text-[#E65100]/80 leading-relaxed">
                      Delivery is free up to 5km from the vendor&apos;s location. Beyond 5km, a fee of IDR 10,000/km applies (calculated for both delivery and pickup).
                    </p>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="flex items-center justify-center w-5 h-5 mt-0.5 border border-[#E65100]/40 rounded bg-white shrink-0">
                    <input
                      type="checkbox"
                      checked={agreedToFee}
                      onChange={(e) => setAgreedToFee(e.target.checked)}
                      className="w-4 h-4 accent-[#E65100] cursor-pointer"
                    />
                  </div>
                  <span className="text-[13px] font-medium text-[#E65100] flex-1 leading-snug">
                    I agree to pay the additional delivery and pickup fee if my location is further than 5km.
                  </span>
                </label>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Desktop Confirm Button */}
      <div className="hidden md:block pt-4">
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-14 bg-black text-white rounded-full text-[17px] font-semibold shadow-xl shadow-black/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
        >
          Confirm via WhatsApp
        </a>
      </div>
      </div>
      </div>
      )}
      </div>

      {/* Bottom Button (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 py-6 pb-8 sm:pb-6 bg-[#EBECEF]/90 backdrop-blur-xl border-t border-white/50 z-10">
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-14 bg-black text-white rounded-full text-[17px] font-semibold shadow-xl shadow-black/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
        >
          Confirm via WhatsApp
        </a>
      </div>

      {/* Modal for Adding Vendor Scooters */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Vendor Fleet</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="space-y-4">
              {vendorScooters.map(scooter => (
                <div key={scooter.id} className="flex gap-4 items-center p-3 border border-gray-100 rounded-2xl">
                  <div className="w-20 h-20 bg-[#F8F9FA] rounded-xl p-2 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={scooter.img} alt={scooter.name} className="w-full h-full object-contain drop-shadow-md" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="font-semibold text-gray-900 text-[14px] leading-tight">{scooter.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-black shadow-sm whitespace-nowrap">
                        {scooter.available} Available
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 mb-3">Rp {scooter.daily.toLocaleString()}/Day</p>
                    <button
                      onClick={() => addToCart(scooter)}
                      className="text-xs font-semibold bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Add to Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
