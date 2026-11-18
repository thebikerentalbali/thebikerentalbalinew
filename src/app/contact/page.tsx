import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"

export default function Contact() {
  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 md:px-12 md:py-20 text-[var(--ink)]">
      <div className="max-w-3xl mx-auto cirrel-glass rounded-[30px] p-7 md:p-12">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 cirrel-btn px-4 py-2 text-xs font-bold mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--ink)] mb-8">Contact Support</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="cirrel-well rounded-[20px] p-4 flex items-start gap-4">
                <div className="cirrel-mark w-10 h-10 rounded-[12px] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--ink)] text-sm">Email Us</h3>
                  <p className="text-[var(--muted-ink)] text-sm mt-0.5">support@bikerentalbali.com</p>
                </div>
              </div>
              <div className="cirrel-well rounded-[20px] p-4 flex items-start gap-4">
                <div className="cirrel-mark w-10 h-10 rounded-[12px] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--ink)] text-sm">Call Us</h3>
                  <p className="text-[var(--muted-ink)] text-sm mt-0.5">+62 812 3456 7890</p>
                </div>
              </div>
              <div className="cirrel-well rounded-[20px] p-4 flex items-start gap-4">
                <div className="cirrel-mark w-10 h-10 rounded-[12px] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--ink)] text-sm">Office</h3>
                  <p className="text-[var(--muted-ink)] text-sm mt-0.5">Jl. Raya Ubud No.14<br />Bali, Indonesia</p>
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="cirrel-input w-full px-4 py-3 rounded-[14px] text-sm" />
              <input type="email" placeholder="Your Email" className="cirrel-input w-full px-4 py-3 rounded-[14px] text-sm" />
              <textarea placeholder="How can we help?" rows={4} className="cirrel-input w-full px-4 py-3 rounded-[16px] text-sm resize-none" />
              <button type="button" className="w-full cirrel-btn-primary font-bold py-3.5 text-sm cursor-pointer">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
