import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white px-6 py-12 md:px-12 md:py-24 selection:bg-white selection:text-black">
      <div className="max-w-3xl mx-auto bg-white text-black rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold text-sm">Back to Home</span>
        </Link>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">How it Works</h1>
        <div className="space-y-8 mt-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-bold">1</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Find Your Ride</h3>
              <p className="text-gray-600">Browse our selection of top-rated scooters from verified local vendors in Bali.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-bold">2</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Book Instantly</h3>
              <p className="text-gray-600">Choose your dates and complete your booking securely through our platform.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-black text-white flex items-center justify-center font-bold">3</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ride & Explore</h3>
              <p className="text-gray-600">Pick up your scooter or have it delivered, and start exploring the beauty of Bali!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
