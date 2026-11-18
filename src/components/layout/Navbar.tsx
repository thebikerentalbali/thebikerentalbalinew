"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Globe, ChevronDown, Bike } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ThemeToggle"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 ${
        isScrolled ? "pt-3" : "pt-5"
      }`}
    >
      <div className="max-w-7xl mx-auto cirrel-glass-hi rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="cirrel-mark w-9 h-9 rounded-[12px]">
            <Bike className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight text-[var(--ink)] leading-none">
              THE BIKE RENTAL
            </span>
            <span className="text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-widest mt-0.5">
              Bali Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cirrel-well text-xs font-semibold text-[var(--ink-2)]">
            <Globe className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>EN / IDR</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <ThemeToggle className="w-9 h-9" />
          <Link href="/#all-scooters">
            <Button className="cirrel-btn-primary px-5 h-9 text-xs font-bold">
              Book Now
            </Button>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle className="w-9 h-9" />
          <button
            className="cirrel-ibtn w-9 h-9"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-7xl mx-auto mt-3 cirrel-modal rounded-[26px] p-5 md:hidden flex flex-col gap-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-[var(--ink)] py-2.5 px-3 rounded-2xl hover:bg-[var(--card-2)] transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/#all-scooters" onClick={() => setIsMobileMenuOpen(false)} className="mt-2">
              <Button className="w-full cirrel-btn-primary py-5 text-sm font-bold">
                Book Now
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
