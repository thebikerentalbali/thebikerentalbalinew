"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Loader2, Store } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function PartnerLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg("")

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setErrorMsg(authError.message)
      setIsSubmitting(false)
      return
    }

    if (authData.user) {
      // Check vendor status
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("status")
        .eq("auth_id", authData.user.id)
        .single()

      if (vendorError || !vendorData) {
        setErrorMsg("Vendor profile not found.")
        await supabase.auth.signOut()
      } else if (vendorData.status === "pending") {
        setErrorMsg("Your account is still pending admin approval. We will notify you once approved.")
        await supabase.auth.signOut()
      } else if (vendorData.status === "approved") {
        router.push("/partnerportal")
      } else {
        setErrorMsg("Your account is inactive.")
        await supabase.auth.signOut()
      }
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-md hover:scale-105 transition-transform">
            <Store className="w-8 h-8 text-white" />
          </div>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-black text-gray-900 tracking-tight">
          Partner Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Sign in to manage your fleet and bookings.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-[32px] sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  placeholder="business@example.com" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-2xl leading-snug">
                {errorMsg}
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-[0_10px_20px_rgba(0,0,0,0.1)] disabled:shadow-none"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/partnersignup" className="text-black font-bold hover:underline">
                Apply now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
