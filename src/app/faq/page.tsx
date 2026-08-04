import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white px-6 py-12 md:px-12 md:py-24 selection:bg-white selection:text-black">
      <div className="max-w-3xl mx-auto bg-white text-black rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold text-sm">Back to Home</span>
        </Link>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          <div className="pb-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Do I need an international license?</h3>
            <p className="text-gray-600">Yes, you need an International Driving Permit (IDP) with motorcycle endorsement to legally ride in Bali.</p>
          </div>
          <div className="pb-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Is insurance included?</h3>
            <p className="text-gray-600">Basic insurance is included with all rentals. Premium coverage can be added during the booking process.</p>
          </div>
          <div className="pb-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Do you deliver to hotels?</h3>
            <p className="text-gray-600">Yes, most of our vendors offer delivery and pickup services to hotels in major tourist areas like Ubud, Seminyak, and Canggu.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
