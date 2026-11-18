import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 md:px-12 md:py-20 text-[var(--ink)]">
      <div className="max-w-3xl mx-auto cirrel-glass rounded-[30px] p-7 md:p-12">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 cirrel-btn px-4 py-2 text-xs font-bold mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--ink)] mb-6">About Us</h1>
          <p className="text-[var(--ink-2)] text-base md:text-lg leading-relaxed mb-6">
            The Bike Rental Bali is your trusted partner for exploring the Island of the Gods. We connect you with reliable, verified scooter vendors across Bali to ensure a seamless and safe riding experience.
          </p>
          <p className="text-[var(--ink-2)] text-base md:text-lg leading-relaxed">
            Whether you are cruising through the rice terraces of Ubud or heading to a sunset session in Uluwatu, we provide the perfect ride for your journey.
          </p>
        </div>
      </div>
    </div>
  )
}
