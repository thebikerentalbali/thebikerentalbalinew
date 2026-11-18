"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Store, User, Mail, Phone, Lock, Bike, MapPin, CheckCircle2, Loader2, Camera } from "lucide-react"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"

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
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [coverPreview, setCoverPreview] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  
  const supabase = createClient()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg("")
    
    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      setErrorMsg(authError.message)
      setIsSubmitting(false)
      return
    }

    if (authData.user) {
      let logoUrl = ""
      let coverUrl = ""

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `vendors/${authData.user.id}/logo-${fileName}`
        
        const { error: uploadError } = await supabase.storage.from('scooter-image').upload(filePath, logoFile)
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('scooter-image').getPublicUrl(filePath)
          logoUrl = publicUrl
        }
      }

      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `vendors/${authData.user.id}/cover-${fileName}`
        
        const { error: uploadError } = await supabase.storage.from('scooter-image').upload(filePath, coverFile)
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('scooter-image').getPublicUrl(filePath)
          coverUrl = publicUrl
        }
      }

      // 2. Insert vendor profile
      const { error: insertError } = await supabase.from('vendors').insert({
        auth_id: authData.user.id,
        name: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        address: formData.streetAddress,
        lat: formData.lat,
        lng: formData.lng,
        logo: logoUrl || null,
        image_url: coverUrl || null,
        status: 'pending'
      })

      if (insertError) {
        setErrorMsg("Error creating profile: " + insertError.message)
        setIsSubmitting(false)
        return
      }
      
      setStep(3)
    } else {
      setErrorMsg("Failed to create account")
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen md:flex text-[var(--ink)]">
      {/* Left Column: Image & Branding */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative bg-[#04070d] flex-col justify-between p-12 text-white overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2787&auto=format&fit=crop" 
          alt="Scooters in Bali" 
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04070d] via-[#04070d]/55 to-[#0a3f9e]/30" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="cirrel-mark w-10 h-10 rounded-[13px]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-none">THE BIKE RENTAL</h2>
              <p className="text-[11px] font-bold text-[#6cb4ff] mt-1 uppercase tracking-wider">Partner Portal</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Turn your fleet into a <span className="text-[#64d2ff]">thriving business.</span>
          </h1>
          <p className="text-lg text-white/75 max-w-md">
            Join Bali&apos;s premier scooter rental network. We connect you with verified renters, handle the bookings, and manage the delivery logistics.
          </p>
        </div>
      </div>

      {/* Right Column: Content Area */}
      <div className="flex-1 flex flex-col justify-center min-h-screen relative">
        <div className="absolute top-6 left-6 md:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="cirrel-mark w-8 h-8 rounded-[10px]">
              <Store className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[var(--ink)] tracking-tight leading-none">THE BIKE RENTAL</h2>
          </Link>
        </div>

        <div className="w-full max-w-xl mx-auto px-4 py-20 md:px-12">
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 cirrel-glass p-8 md:p-10 rounded-[30px]">
              <div className="relative z-10 mb-10 text-center">
                <div className="w-16 h-16 cirrel-mark rounded-[20px] mx-auto mb-6">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--ink)] mb-3 tracking-tight">Partner Portal</h2>
                <p className="text-[var(--muted-ink)] font-medium max-w-sm mx-auto">
                  Manage your fleet, track bookings, and grow your rental business with ease.
                </p>
              </div>

              <div className="relative z-10 space-y-6">
                <button 
                  onClick={() => setStep(1)}
                  className="w-full cirrel-btn-primary font-bold py-4 px-6 flex items-center justify-between hover:-translate-y-0.5 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-white" />
                    <span>Create New Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <div className="text-center">
                  <p className="text-[15px] text-[var(--muted-ink)] font-medium">
                    Already a partner? <Link href="/partnerportal" className="text-[var(--accent-text)] font-bold hover:underline ml-1">Log In</Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 cirrel-glass p-6 md:p-10 rounded-[30px]">
              <div className="relative z-10 mb-8">
                <button onClick={() => setStep(0)} className="text-sm font-bold text-[var(--muted-ink)] hover:text-[var(--ink)] mb-6 flex items-center gap-1 transition-colors cursor-pointer">
                  &larr; Back
                </button>
                <h2 className="text-3xl font-bold text-[var(--ink)] mb-2">Create Partner Account</h2>
                <p className="text-[var(--muted-ink)]">Provide your business details to get started.</p>
              </div>

              <form onSubmit={handleNextStep} className="relative z-10 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[var(--ink-2)]">Company Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Store className="h-5 w-5 text-[var(--muted-ink)]" />
                      </div>
                      <input 
                        type="text" 
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="cirrel-input w-full pl-11 pr-4 py-3.5 rounded-[14px] text-sm font-medium"
                        placeholder="e.g. Putu Rentals" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[var(--ink-2)]">Contact Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-[var(--muted-ink)]" />
                      </div>
                      <input 
                        type="text" 
                        name="contactName"
                        required
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="cirrel-input w-full pl-11 pr-4 py-3.5 rounded-[14px] text-sm font-medium"
                        placeholder="Owner's full name" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--ink-2)]">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[var(--muted-ink)]" />
                    </div>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="cirrel-input w-full pl-11 pr-4 py-3.5 rounded-[14px] text-sm font-medium"
                      placeholder="business@example.com" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--ink-2)]">Phone Number (WhatsApp)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-[var(--muted-ink)]" />
                    </div>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="cirrel-input w-full pl-11 pr-4 py-3.5 rounded-[14px] text-sm font-medium"
                      placeholder="+62 812 3456 7890" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--ink-2)]">Intended Fleet Size</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Bike className="h-5 w-5 text-[var(--muted-ink)]" />
                    </div>
                    <select
                      name="fleetIntent"
                      required
                      value={formData.fleetIntent}
                      onChange={handleInputChange}
                      className="cirrel-input w-full pl-11 pr-4 py-3.5 rounded-[14px] text-sm font-medium appearance-none"
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
                  className="w-full cirrel-btn-primary font-bold py-4 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  Continue to Next Step <ChevronRight className="w-5 h-5" />
                </button>
              </form>

              <div className="relative z-10 mt-8 text-center pt-6 border-t border-[var(--line)]">
                <p className="text-sm text-[var(--muted-ink)] font-medium">
                  Already a partner? <Link href="/partnerportal" className="text-[var(--accent-text)] font-bold hover:underline">Login here</Link>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 cirrel-glass p-6 md:p-10 rounded-[30px]">
              <div className="relative z-10 mb-8">
                <button onClick={() => setStep(1)} className="text-sm font-bold text-[var(--muted-ink)] hover:text-[var(--ink)] mb-4 flex items-center gap-1 cursor-pointer">
                  &larr; Back
                </button>
                <h2 className="text-3xl font-bold text-[var(--ink)] mb-2">Location &amp; Branding</h2>
                <p className="text-[var(--muted-ink)]">Pin your exact business location and upload your branding.</p>
              </div>

              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                {/* Branding Section */}
                <div className="space-y-4 pb-4 border-b border-[var(--line)]">
                  <h3 className="text-sm font-bold text-[var(--ink-2)]">Branding Images</h3>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide">Vendor Logo</label>
                      <div className="relative group w-24 h-24 rounded-full border-2 border-dashed border-[var(--line-2)] flex items-center justify-center overflow-hidden cirrel-well">
                        {logoPreview ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-[var(--muted-ink)] group-hover:scale-110 transition-transform" />
                        )}
                        <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                          <span className="text-white text-[10px] font-bold">Upload</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setLogoFile(e.target.files[0])
                                const reader = new FileReader()
                                reader.onloadend = () => setLogoPreview(reader.result as string)
                                reader.readAsDataURL(e.target.files[0])
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex-[2] space-y-2">
                      <label className="text-xs font-bold text-[var(--muted-ink)] uppercase tracking-wide">Cover Image</label>
                      <div className="relative group w-full h-24 rounded-xl border-2 border-dashed border-[var(--line-2)] flex items-center justify-center overflow-hidden cirrel-well">
                        {coverPreview ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-[var(--muted-ink)] group-hover:scale-110 transition-transform" />
                        )}
                        <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                          <span className="text-white text-xs font-bold">Upload Cover</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setCoverFile(e.target.files[0])
                                const reader = new FileReader()
                                reader.onloadend = () => setCoverPreview(reader.result as string)
                                reader.readAsDataURL(e.target.files[0])
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--ink-2)] flex items-center justify-between">
                    Exact Location Pin
                    {formData.lat !== 0 && (
                      <span className="cirrel-pill cirrel-pill--good text-[10px]">Pinned!</span>
                    )}
                  </label>
                  <MapPicker position={[formData.lat, formData.lng]} onPositionChange={handleMapPosition} />
                  <p className="text-xs text-[var(--muted-ink)] font-medium mt-1">Tap on the map to place your business pin.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--ink-2)]">Street Address</label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-4 flex pointer-events-none">
                      <MapPin className="h-5 w-5 text-[var(--muted-ink)]" />
                    </div>
                    <textarea 
                      name="streetAddress"
                      required
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                      className="cirrel-input w-full pl-11 pr-4 py-3.5 rounded-[16px] text-sm font-medium h-24 resize-none"
                      placeholder="Enter full street address for delivery drivers..." 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--ink-2)]">Account Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[var(--muted-ink)]" />
                    </div>
                    <input 
                      type="password" 
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="cirrel-input w-full pl-11 pr-4 py-3.5 rounded-[14px] text-sm font-medium"
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-[var(--bad-soft)] border border-[var(--bad)]/25 text-[var(--bad)] text-sm font-medium rounded-[14px]">
                    {typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={formData.lat === 0 || isSubmitting}
                  className="w-full cirrel-btn-primary disabled:opacity-45 font-bold py-4 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application"}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center animate-in fade-in zoom-in-95 duration-500 py-12 cirrel-glass p-8 md:p-12 rounded-[30px]">
              <div className="relative z-10 w-24 h-24 bg-[var(--good-soft)] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-[var(--good)]" />
              </div>
              <h2 className="relative z-10 text-3xl font-bold text-[var(--ink)] mb-3">Application Received!</h2>
              <p className="relative z-10 text-[var(--muted-ink)] mb-8 max-w-md mx-auto">
                Thank you for applying to join The Bike Rental network, <strong className="text-[var(--ink)]">{formData.companyName}</strong>. Our team is reviewing your application and will contact you via WhatsApp shortly.
              </p>
              
              <Link 
                href="/"
                className="relative z-10 inline-flex cirrel-btn-primary font-bold py-3.5 px-8"
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
