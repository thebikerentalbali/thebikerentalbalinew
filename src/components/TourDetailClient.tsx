"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  Share,
  Check,
  MapPin,
  Clock,
  Route,
  Calendar,
  Users,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Minus,
  Plus,
} from "lucide-react"
import MarketplaceNavbar from "@/components/MarketplaceNavbar"
import TransparentLoader from "@/components/TransparentLoader"
import {
  Campaign,
  getCampaigns,
  fetchCampaigns,
  resolveCampaignLink,
} from "@/utils/campaigns"

interface TourDetailClientProps {
  id: string
  initialTour: Campaign | null
}

function getDefaultTomorrowDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
}

export default function TourDetailClient({ id, initialTour }: TourDetailClientProps) {
  const router = useRouter()
  const [tour, setTour] = useState<Campaign | null>(initialTour)
  const [loading, setLoading] = useState<boolean>(!initialTour)
  const [copiedLink, setCopiedLink] = useState(false)
  const [tourDate, setTourDate] = useState<string>(getDefaultTomorrowDate)
  const [guests, setGuests] = useState<number>(1)

  useEffect(() => {
    if (!initialTour && id) {
      const localMatch = getCampaigns(true).find((c) => String(c.id) === String(id))
      if (localMatch) {
        setTour(localMatch)
        setLoading(false)
      }
      fetchCampaigns(true)
        .then((list) => {
          const match = list.find((c) => String(c.id) === String(id))
          if (match) setTour(match)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [id, initialTour])

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back()
    } else {
      router.push("/")
    }
  }

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (typeof navigator !== "undefined" && navigator.share && tour) {
      navigator.share({ title: tour.title, url }).catch(() => {})
    } else if (url) {
      navigator.clipboard?.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  if (loading) {
    return <TransparentLoader />
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col text-[var(--ink)]">
        <MarketplaceNavbar compactSpacing />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="cirrel-glass rounded-[30px] p-8 text-center max-w-sm">
            <h1 className="text-xl font-bold text-[var(--ink)] mb-2">Tour Not Found</h1>
            <p className="text-[var(--muted-ink)] text-sm mb-5">
              This scooter tour is currently unavailable or has ended.
            </p>
            <Link href="/" prefetch={true} className="inline-block cirrel-btn-primary px-6 py-2.5 text-xs font-bold">
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const td = tour.tour_details
  const unitPrice = td?.price || 0
  const priceUnit = td?.price_unit || "per rider"
  const totalPrice = unitPrice * guests
  const itinerary = td?.itinerary || []
  const includes = td?.includes || []
  const duration = td?.duration || "Full Day"
  const meetingPoint = td?.meeting_point || tour.partner_location || "Hotel / Villa Pickup"
  const externalBookingLink = resolveCampaignLink(tour.cta_link)

  const whatsappNumber = (tour.partner_whatsapp || "").replace(/[^0-9]/g, "")
  const formattedWaMessage = [
    `Hi ${tour.partner_name || "Team"}, I would like to book the scooter tour:`,
    `Tour: ${tour.title}`,
    `Preferred Date: ${tourDate}`,
    `Guests / Scooters: ${guests} (${priceUnit})`,
    unitPrice > 0 ? `Estimated Total: Rp ${totalPrice.toLocaleString("id-ID")}` : "",
    meetingPoint ? `Meeting Point: ${meetingPoint}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedWaMessage)}`
    : ""

  return (
    <div className="min-h-screen text-[var(--ink)] antialiased w-full max-w-full overflow-x-hidden pb-16">
      <MarketplaceNavbar compactSpacing />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Breadcrumb & Share Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go Back"
              className="cirrel-ibtn w-10 h-10 shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <nav className="cirrel-glass px-4 py-2 rounded-full flex items-center gap-2 text-xs sm:text-sm text-[var(--muted-ink)] font-medium min-w-0">
              <Link href="/" className="relative z-10 hover:text-[var(--ink)] transition-colors shrink-0">
                Home
              </Link>
              <span className="relative z-10">/</span>
              <span className="relative z-10 text-[var(--ink)] font-bold truncate">
                {tour.title}
              </span>
            </nav>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="cirrel-btn px-3.5 sm:px-4 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer active-press"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-[var(--good)]" />
            ) : (
              <Share className="w-4 h-4 text-[var(--accent-text)]" />
            )}
            <span className="hidden sm:inline">{copiedLink ? "Link Copied!" : "Share Tour"}</span>
          </button>
        </div>

        {/* Hero Tour Card */}
        <div className="cirrel-glass rounded-[28px] md:rounded-[32px] overflow-hidden">
          <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-[#070d18] overflow-hidden">
            {tour.image_url ? (
              <Image
                src={tour.image_url}
                alt={tour.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1152px"
                className="object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f2544] via-[#101c31] to-[#080d17]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/25" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                {tour.badge || "GUIDED SCOOTER TOUR"}
              </span>

              {unitPrice > 0 && (
                <span className="px-4 py-1.5 rounded-full bg-[var(--accent-blue)] text-white text-xs font-bold shadow-md">
                  Rp {unitPrice.toLocaleString("id-ID")} {priceUnit}
                </span>
              )}
            </div>

            {/* Partner Logo, Operator Name & Location Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden shrink-0 border border-white/40">
                {tour.partner_logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tour.partner_logo_url}
                    alt={tour.partner_name || "Tour Operator"}
                    className="w-full h-full object-contain p-0.5"
                  />
                ) : (
                  <span className="text-xs font-bold text-[#0b1220]">
                    {tour.partner_name ? tour.partner_name.slice(0, 2).toUpperCase() : "TB"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm sm:text-base font-bold text-white leading-tight truncate drop-shadow-sm">
                  {tour.partner_name || "The Bike Rental Bali Tours"}
                </span>
                {tour.partner_location && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-white/90 font-medium mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{tour.partner_location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 p-5 sm:p-7 space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight leading-tight">
                {tour.title}
              </h1>
              {tour.subtitle && (
                <p className="text-sm sm:text-base text-[var(--muted-ink)] font-medium leading-relaxed mt-2">
                  {tour.subtitle}
                </p>
              )}
            </div>

            {/* Key Tour Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[var(--line)]">
              <div className="cirrel-well rounded-[18px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-ink)] block mb-1">
                  Tour Price
                </span>
                <span className="text-sm sm:text-base font-bold text-[var(--ink)] block">
                  {unitPrice > 0 ? `Rp ${unitPrice.toLocaleString("id-ID")}` : "Custom Quote"}
                </span>
                {unitPrice > 0 && (
                  <span className="text-[11px] font-medium text-[var(--muted-ink)]">{priceUnit}</span>
                )}
              </div>

              <div className="cirrel-well rounded-[18px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-ink)] block mb-1">
                  Duration
                </span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--ink)]">
                  <Clock className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                  <span>{duration}</span>
                </div>
              </div>

              <div className="cirrel-well rounded-[18px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-ink)] block mb-1">
                  Itinerary Stops
                </span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--ink)]">
                  <Route className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                  <span>{itinerary.length} {itinerary.length === 1 ? "Stop" : "Stops"}</span>
                </div>
              </div>

              <div className="cirrel-well rounded-[18px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-ink)] block mb-1">
                  Meeting Point
                </span>
                <div className="flex items-start gap-1.5 text-xs sm:text-sm font-bold text-[var(--ink)] leading-snug">
                  <MapPin className="w-4 h-4 text-[var(--accent-text)] shrink-0 mt-0.5" />
                  <span>{meetingPoint}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Itinerary Timeline & Inclusions */}
          <div className="lg:col-span-8 space-y-6">
            {/* Timed Itinerary Section */}
            <section aria-labelledby="tour-itinerary-heading" className="cirrel-glass rounded-[28px] p-5 sm:p-7 space-y-5">
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <h2 id="tour-itinerary-heading" className="text-xl font-bold text-[var(--ink)] tracking-tight">
                    Tour Itinerary
                  </h2>
                  <p className="text-xs text-[var(--muted-ink)] font-medium mt-0.5">
                    Step-by-step schedule from pickup to drop-off
                  </p>
                </div>
                {itinerary.length > 0 && (
                  <span className="cirrel-pill text-xs font-bold shrink-0">
                    {itinerary.length} {itinerary.length === 1 ? "stop" : "stops"}
                  </span>
                )}
              </div>

              {itinerary.length === 0 ? (
                <div className="relative z-10 cirrel-well rounded-[20px] p-6 text-center text-sm text-[var(--muted-ink)] font-medium">
                  Flexible route tailored with your local guide on arrival.
                </div>
              ) : (
                <div className="relative z-10 space-y-4">
                  {itinerary.map((stop, index) => (
                    <div key={index} className="relative flex gap-4">
                      {/* Vertical Line Connector */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          {index + 1}
                        </div>
                        {index < itinerary.length - 1 && (
                          <div className="w-0.5 flex-1 bg-[var(--line-2)] my-1.5" />
                        )}
                      </div>

                      {/* Stop Card */}
                      <div className="flex-1 cirrel-well rounded-[20px] p-4 sm:p-5 mb-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                          {stop.time && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--card-2)] border border-[var(--line)] text-[11px] font-bold text-[var(--accent-text)]">
                              <Clock className="w-3 h-3" />
                              <span>{stop.time}</span>
                            </span>
                          )}
                          {stop.location && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--muted-ink)]">
                              <MapPin className="w-3 h-3 text-[var(--accent-text)]" />
                              <span>{stop.location}</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-[var(--ink)] leading-snug">
                          {stop.title || `Stop ${index + 1}`}
                        </h3>
                        {stop.description && (
                          <p className="text-xs sm:text-sm text-[var(--muted-ink)] font-medium leading-relaxed mt-1.5">
                            {stop.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* What's Included & Important Notes */}
            {(includes.length > 0 || tour.voucher_terms) && (
              <div className="cirrel-glass rounded-[28px] p-5 sm:p-7 space-y-5">
                {includes.length > 0 && (
                  <div className="relative z-10 space-y-3">
                    <h2 className="text-lg font-bold text-[var(--ink)] tracking-tight">
                      What&apos;s Included
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {includes.map((item, idx) => (
                        <div
                          key={idx}
                          className="cirrel-well rounded-[16px] px-4 py-3 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[var(--ink)]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[var(--good)] shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tour.voucher_terms && (
                  <div className="relative z-10 pt-3 border-t border-[var(--line)] flex items-start gap-2.5 text-xs sm:text-sm text-[var(--muted-ink)]">
                    <ShieldCheck className="w-4 h-4 text-[var(--accent-text)] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[var(--ink)] block mb-0.5">Important Notes</span>
                      <span className="font-medium leading-relaxed">{tour.voucher_terms}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking Card */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start">
            <div className="cirrel-glass rounded-[28px] p-5 sm:p-6 space-y-5">
              <div className="relative z-10 flex items-baseline justify-between gap-2 pb-4 border-b border-[var(--line)]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-ink)] block">
                    Tour Rate
                  </span>
                  <span className="text-2xl font-bold text-[var(--ink)] tracking-tight">
                    {unitPrice > 0 ? `Rp ${unitPrice.toLocaleString("id-ID")}` : "Inquire Price"}
                  </span>
                </div>
                {unitPrice > 0 && (
                  <span className="text-xs font-semibold text-[var(--muted-ink)]">{priceUnit}</span>
                )}
              </div>

              <div className="relative z-10 space-y-4">
                <div>
                  <label
                    htmlFor="tour-booking-date"
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                    <span>Preferred Tour Date</span>
                  </label>
                  <input
                    id="tour-booking-date"
                    type="date"
                    value={tourDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="cirrel-input w-full px-4 py-2.5 rounded-[16px] text-sm font-semibold text-[var(--ink)]"
                  />
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1.5">
                    <Users className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                    <span>Riders / Scooters</span>
                  </span>
                  <div className="cirrel-well rounded-[16px] px-3 py-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      aria-label="Decrease riders"
                      className="cirrel-ibtn w-8 h-8 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-[var(--ink)]">
                      {guests} {guests === 1 ? "Guest" : "Guests"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(15, g + 1))}
                      aria-label="Increase riders"
                      className="cirrel-ibtn w-8 h-8 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {unitPrice > 0 && (
                  <div className="cirrel-well rounded-[18px] p-3.5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)]">
                      Estimated Total
                    </span>
                    <span className="text-lg font-bold text-[var(--ink)]">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                <div className="space-y-2.5 pt-1">
                  {externalBookingLink?.isExternal && (
                    <a
                      href={externalBookingLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full cirrel-btn-primary py-3.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active-press"
                    >
                      <span>{tour.cta_text || "Book Tour Online"}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3.5 px-5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md active-press transition-all flex items-center justify-center gap-2 ${
                        externalBookingLink?.isExternal
                          ? "bg-[#25D366] hover:bg-[#20ba5a] text-white"
                          : "bg-[#25D366] hover:bg-[#20ba5a] text-white"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Book Tour via WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
