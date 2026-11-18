import Link from "next/link"
import { MapPin, Phone, Mail, Bike } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative z-10 mt-16 px-4 md:px-8 pb-8">
      <div className="max-w-7xl mx-auto cirrel-glass rounded-[30px] p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="cirrel-mark w-10 h-10 rounded-[13px]">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-[var(--ink)] block leading-none">
                  THE BIKE RENTAL
                </span>
                <span className="text-[11px] text-[var(--muted-ink)] font-semibold uppercase tracking-widest mt-1 block">
                  Bali
                </span>
              </div>
            </Link>
            <p className="text-[var(--muted-ink)] text-sm leading-relaxed">
              Verified scooter rental marketplace in Bali. Transparent rates, trusted local garages, and fast islandwide delivery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--muted-ink)] mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-[var(--ink-2)]">
              <li>
                <Link href="/about" className="hover:text-[var(--accent-text)] transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[var(--accent-text)] transition-colors">How it Works</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[var(--accent-text)] transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--accent-text)] transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--muted-ink)] mb-4">Partners</h3>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-[var(--ink-2)]">
              <li>
                <Link href="/partnersignup" className="hover:text-[var(--accent-text)] transition-colors">Become a Partner</Link>
              </li>
              <li>
                <Link href="/partnerportal/login" className="hover:text-[var(--accent-text)] transition-colors">Partner Login</Link>
              </li>
              <li>
                <Link href="/partnerportal" className="hover:text-[var(--accent-text)] transition-colors">Partner Portal</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--muted-ink)] mb-4">Contact Us</h3>
            <ul className="flex flex-col gap-3 text-sm text-[var(--ink-2)]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[var(--accent-text)] shrink-0 mt-0.5" />
                <span>Jl. Raya Canggu No.88, Canggu, Bali 80361</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                <span>hello@thebikerentalbali.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--line)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--muted-ink)] font-medium">
          <p>&copy; {new Date().getFullYear()} THE BIKE RENTAL BALI. All rights reserved.</p>
          <span>Curated Liquid Glass Experience</span>
        </div>
      </div>
    </footer>
  )
}
