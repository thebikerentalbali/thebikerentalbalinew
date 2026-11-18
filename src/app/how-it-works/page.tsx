import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function HowItWorks() {
  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 md:px-12 md:py-20 text-[var(--ink)]">
      <div className="max-w-3xl mx-auto cirrel-glass rounded-[30px] p-7 md:p-12">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 cirrel-btn px-4 py-2 text-xs font-bold mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--ink)] mb-6">How it Works</h1>
          <div className="space-y-4 mt-8">
            <div className="cirrel-well rounded-[22px] p-5 flex gap-4 items-start">
              <div className="w-10 h-10 shrink-0 rounded-full cirrel-mark font-bold text-sm">1</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[var(--ink)] mb-1.5">Find Your Ride</h3>
                <p className="text-[var(--muted-ink)] text-sm md:text-base">Browse our selection of top-rated scooters from verified local vendors in Bali.</p>
              </div>
            </div>
            <div className="cirrel-well rounded-[22px] p-5 flex gap-4 items-start">
              <div className="w-10 h-10 shrink-0 rounded-full cirrel-mark font-bold text-sm">2</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[var(--ink)] mb-1.5">Book Instantly</h3>
                <p className="text-[var(--muted-ink)] text-sm md:text-base">Choose your dates and complete your booking securely through our platform.</p>
              </div>
            </div>
            <div className="cirrel-well rounded-[22px] p-5 flex gap-4 items-start">
              <div className="w-10 h-10 shrink-0 rounded-full cirrel-mark font-bold text-sm">3</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[var(--ink)] mb-1.5">Ride &amp; Explore</h3>
                <p className="text-[var(--muted-ink)] text-sm md:text-base">Pick up your scooter or have it delivered, and start exploring the beauty of Bali!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
