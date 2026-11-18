import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import MarketplaceNavbar from "@/components/MarketplaceNavbar"

export default function FAQ() {
  return (
    <div className="min-h-screen pb-12 md:pb-20 text-[var(--ink)]">
      <MarketplaceNavbar compactSpacing />
      <div className="px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto cirrel-glass rounded-[30px] p-7 md:p-12">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 cirrel-btn px-4 py-2 text-xs font-bold mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--ink)] mb-8">Frequently Asked Questions</h1>

          <div className="space-y-4">
            <div className="cirrel-well rounded-[22px] p-5">
              <h3 className="text-base md:text-lg font-bold text-[var(--ink)] mb-2">Do I need an international license?</h3>
              <p className="text-[var(--muted-ink)] text-sm md:text-base">Yes, you need an International Driving Permit (IDP) with motorcycle endorsement to legally ride in Bali.</p>
            </div>
            <div className="cirrel-well rounded-[22px] p-5">
              <h3 className="text-base md:text-lg font-bold text-[var(--ink)] mb-2">Is insurance included?</h3>
              <p className="text-[var(--muted-ink)] text-sm md:text-base">Basic insurance is included with all rentals. Premium coverage can be added during the booking process.</p>
            </div>
            <div className="cirrel-well rounded-[22px] p-5">
              <h3 className="text-base md:text-lg font-bold text-[var(--ink)] mb-2">Do you deliver to hotels?</h3>
              <p className="text-[var(--muted-ink)] text-sm md:text-base">Yes, most of our vendors offer delivery and pickup services to hotels in major tourist areas like Ubud, Seminyak, and Canggu.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
