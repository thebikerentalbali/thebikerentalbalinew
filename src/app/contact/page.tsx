import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] px-6 py-12 md:px-12 md:py-24">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold text-sm">Back to Home</span>
        </Link>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">Contact Support</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Email Us</h3>
                <p className="text-gray-600 mt-1">support@bikerentalbali.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Call Us</h3>
                <p className="text-gray-600 mt-1">+62 812 3456 7890</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Office</h3>
                <p className="text-gray-600 mt-1">Jl. Raya Ubud No.14<br />Bali, Indonesia</p>
              </div>
            </div>
          </div>

          <form className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-gray-300" />
            <input type="email" placeholder="Your Email" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-gray-300" />
            <textarea placeholder="How can we help?" rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-gray-300"></textarea>
            <button type="button" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  )
}
