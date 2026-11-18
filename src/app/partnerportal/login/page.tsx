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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[var(--ink)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <div className="w-16 h-16 cirrel-mark rounded-[20px] hover:scale-105 transition-transform">
            <Store className="w-8 h-8 text-white" />
          </div>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-bold text-[var(--ink)] tracking-tight">
          Partner Login
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--muted-ink)] font-medium">
          Sign in to manage your fleet and bookings.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="cirrel-glass py-8 px-6 sm:rounded-[30px] rounded-[26px] sm:px-10">
          <form className="relative z-10 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[var(--ink-2)]">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--muted-ink)]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cirrel-input w-full pl-11 pr-4 py-3.5 rounded-[14px] text-sm font-medium"
                  placeholder="business@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[var(--ink-2)]">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--muted-ink)]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cirrel-input w-full pl-11 pr-4 py-3.5 rounded-[14px] text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-[var(--bad-soft)] border border-[var(--bad)]/25 text-[var(--bad)] text-sm font-medium rounded-[16px] leading-snug">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cirrel-btn-primary disabled:opacity-50 font-bold py-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="relative z-10 mt-8 pt-6 border-t border-[var(--line)] text-center">
            <p className="text-sm text-[var(--muted-ink)] font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/partnersignup" className="text-[var(--accent-text)] font-bold hover:underline">
                Apply now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
