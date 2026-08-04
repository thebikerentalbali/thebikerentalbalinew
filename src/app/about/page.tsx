import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white px-6 py-12 md:px-12 md:py-24 selection:bg-white selection:text-black">
      <div className="max-w-3xl mx-auto bg-white text-black rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold text-sm">Back to Home</span>
        </Link>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">About Us</h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          The Bike Rental Bali is your premium partner for exploring the Island of the Gods. We connect you with the most reliable, top-rated scooter vendors across Bali to ensure a seamless and safe riding experience.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed">
          Whether you are cruising through the rice terraces of Ubud or heading to a sunset session in Uluwatu, we provide the perfect ride for your journey.
        </p>
      </div>
    </div>
  )
}
