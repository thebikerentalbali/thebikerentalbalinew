"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Store, User, Mail, Phone, Lock, Bike, MapPin, CheckCircle2 } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import MapPicker to prevent SSR issues with Leaflet
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })

export default function PartnerSignUp() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    fleetIntent: "",
    password: "",
    streetAddress: "",
    lat: 0,
    lng: 0
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleMapPosition = (lat: number, lng: number) => {
    setFormData({ ...formData, lat, lng })
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
  }

  return (
    <div className="min-h-screen bg-white md:flex">
      {/* Left Column: Image & Branding */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative bg-black flex-col justify-between p-12 text-white overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2787&auto=format&fit=crop" 
          alt="Scooters in Bali" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <h2 className="text-2xl font-black text-white tracking-tight leading-none">THE BIKE RENTAL</h2>
            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Partner Portal</p>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Turn your fleet into a <span className="text-yellow-400">thriving business.</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-md">
            Join Bali&apos;s most premium scooter rental network. We connect you with verified renters, handle the bookings, and manage the delivery logistics.
          </p>
        </div>
      </div>

      {/* Right Column: Content Area */}
      <div className="flex-1 flex flex-col justify-center min-h-screen relative bg-[#F8F9FA] md:bg-white">
        <div className="absolute top-6 left-6 md:hidden">
          <Link href="/" className="inline-block">
            <h2 className="text-xl font-black text-black tracking-tight leading-none">THE BIKE RENTAL</h2>
          </Link>
        </div>

        <div className="w-full max-w-xl mx-auto px-4 py-20 md:px-12">
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 bg-white p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Partner Portal</h2>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">
                  Manage your fleet, track bookings, and grow your rental business with ease.
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setStep(1)}
                  className="w-full bg-black text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-between hover:bg-gray-900 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 group"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-yellow-400" />
                    <span>Create New Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <Link 
                  href="/partnerportal"
                  className="w-full bg-white text-gray-900 font-bold py-4 px-6 rounded-2xl flex items-center justify-between border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                    <span>Log In to Existing Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 bg-white p-6 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="mb-8">
                <button onClick={() => setStep(0)} className="text-sm font-bold text-gray-500 hover:text-black mb-6 flex items-center gap-1 transition-colors">
                  &larr; Back
                </button>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Partner Account</h2>
                <p className="text-gray-500">Provide your business details to get started.</p>
              </div>

              <form onSubmit={handleNextStep} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Company Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Store className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        placeholder="e.g. Putu Rentals" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Contact Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="contactName"
                        required
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        placeholder="Owner's full name" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                      placeholder="business@example.com" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Phone Number (WhatsApp)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                      placeholder="+62 812 3456 7890" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Intended Fleet Size</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Bike className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="fleetIntent"
                      required
                      value={formData.fleetIntent}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all appearance-none"
                    >
                      <option value="" disabled>Select estimated fleet size</option>
                      <option value="1-5">1 - 5 Scooters</option>
                      <option value="6-15">6 - 15 Scooters</option>
                      <option value="16-30">16 - 30 Scooters</option>
                      <option value="31+">31+ Scooters</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors mt-4 shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
                >
                  Continue to Next Step <ChevronRight className="w-5 h-5" />
                </button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600 font-medium">
                  Already a partner? <Link href="/partnerportal" className="text-black font-bold hover:underline">Login here</Link>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 bg-white p-6 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="mb-8">
                <button onClick={() => setStep(1)} className="text-sm font-bold text-gray-500 hover:text-black mb-4 flex items-center gap-1">
                  &larr; Back
                </button>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Location & Security</h2>
                <p className="text-gray-500">Pin your exact business location for delivery logistics.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                    Exact Location Pin
                    {formData.lat !== 0 && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Pinned!</span>
                    )}
                  </label>
                  <MapPicker position={[formData.lat, formData.lng]} onPositionChange={handleMapPosition} />
                  <p className="text-xs text-gray-500 font-medium mt-1">Tap on the map to place your business pin.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Street Address</label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-4 flex pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea 
                      name="streetAddress"
                      required
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all h-24 resize-none"
                      placeholder="Enter full street address for delivery drivers..." 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Account Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="password" 
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={formData.lat === 0}
                  className="w-full bg-black disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-900 disabled:hover:bg-gray-300 transition-colors mt-4 shadow-[0_10px_20px_rgba(0,0,0,0.1)] disabled:shadow-none"
                >
                  Submit Application
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center animate-in fade-in zoom-in-95 duration-500 py-12 bg-white p-8 md:p-12 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3">Application Received!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Thank you for applying to join The Bike Rental network, <strong>{formData.companyName}</strong>. Our team is reviewing your application and will contact you via WhatsApp shortly.
              </p>
              
              <Link 
                href="/"
                className="inline-flex bg-gray-100 text-gray-900 font-bold py-3.5 px-8 rounded-2xl hover:bg-gray-200 transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
