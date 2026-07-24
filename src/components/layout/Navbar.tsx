"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Globe, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Scooters", href: "/scooters" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading font-bold text-xl tracking-tight">
              THE BIKE RENTAL
              <span className="text-gray-500 font-medium text-sm ml-1">BALI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium hover:text-gray-500 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-500 transition-colors">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">EN / USD</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            <Button className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all">
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 glass-card m-4 rounded-2xl p-6 md:hidden flex flex-col gap-4 shadow-2xl border border-gray-100"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-medium py-2 border-b border-gray-100 last:border-0"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center justify-between py-4 border-t border-gray-100 mt-2">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span className="font-medium">EN / USD</span>
              </div>
            </div>
            <Button className="w-full rounded-xl py-6 text-lg font-semibold mt-2">
              Book Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
