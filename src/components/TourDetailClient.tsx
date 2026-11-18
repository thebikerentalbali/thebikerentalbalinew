"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
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
  User,
  Phone,
  X,
  AlertCircle,
} from "lucide-react"
import MarketplaceNavbar from "@/components/MarketplaceNavbar"
import TransparentLoader from "@/components/TransparentLoader"
import { addSavedBookings } from "@/utils/myBookings"
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

  // Booking Details State
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [pickupLocation, setPickupLocation] = useState("")
  const [tourDate, setTourDate] = useState<string>(getDefaultTomorrowDate)
  const [pickupTime, setPickupTime] = useState("08:30 AM")
  const [guests, setGuests] = useState<number>(1)
  const [notes, setNotes] = useState("")
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [confirmedWaUrl, setConfirmedWaUrl] = useState<string | null>(null)

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

  const targetWhatsapp = (tour.partner_whatsapp || "6281234567890").replace(/[^0-9]/g, "")
  const buildWhatsappUrl = () => {
    const messageLines = [
      `Hi ${tour.partner_name || "Team"}, I would like to book this Scooter Tour:`,
      `*Tour:* ${tour.title}`,
      `*Name:* ${fullName.trim() || "Guest"}`,
      phone.trim() ? `*WhatsApp / Phone:* ${phone.trim()}` : "",
      `*Pickup Location:* ${pickupLocation.trim() || meetingPoint}`,
      `*Date:* ${tourDate}`,
      `*Pickup Time:* ${pickupTime}`,
      `*Guests / Scooters:* ${guests} (${priceUnit})`,
      unitPrice > 0 ? `*Total Estimate:* Rp ${totalPrice.toLocaleString("id-ID")}` : "",
      notes.trim() ? `*Notes:* ${notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    return `https://api.whatsapp.com/send?phone=${targetWhatsapp}&text=${encodeURIComponent(messageLines)}`
  }

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault()
    setBookingError(null)

    if (!fullName.trim()) {
      setBookingError("Please enter your full name.")
      return
    }
    if (!pickupLocation.trim()) {
      setBookingError("Please enter your pickup location (hotel, villa, or address).")
      return
    }

    const waUrl = buildWhatsappUrl()

    addSavedBookings([
      {
        id: `tour-booking-${Date.now()}`,
        scooterId: tour.id,
        scooterName: tour.title,
        scooterImg: tour.image_url || "/images/scooter.png",
        vendorName: tour.partner_name || "The Bike Rental Bali Tours",
        quantity: guests,
        durationMode: "daily",
        durationCount: 1,
        startDate: `${tourDate} (${pickupTime})`,
        endDate: tourDate,
        totalPrice,
        customerName: fullName.trim(),
        deliveryMethod: "delivery",
        deliveryAddress: pickupLocation.trim(),
        whatsappUrl: waUrl,
        createdAt: new Date().toISOString(),
      },
    ])

    setConfirmedWaUrl(waUrl)
    window.open(waUrl, "_blank", "noopener,noreferrer")
  }

  const renderBookingFormContent = () => {
    if (confirmedWaUrl) {
      return (
        <div className="relative z-10 text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--ink)]">Tour Request Ready!</h3>
            <p className="text-xs sm:text-sm text-[var(--muted-ink)] mt-1 leading-relaxed">
              Your booking summary for <strong>{fullName}</strong> has been saved to My Bookings.
            </p>
          </div>
          <div className="cirrel-well rounded-[18px] p-3.5 text-left text-xs space-y-1">
            <p><span className="text-[var(--muted-ink)]">Date &amp; Time:</span> <strong className="text-[var(--ink)]">{tourDate} · {pickupTime}</strong></p>
            <p><span className="text-[var(--muted-ink)]">Pickup:</span> <strong className="text-[var(--ink)]">{pickupLocation}</strong></p>
            <p><span className="text-[var(--muted-ink)]">Riders:</span> <strong className="text-[var(--ink)]">{guests}</strong></p>
            {unitPrice > 0 && (
              <p><span className="text-[var(--muted-ink)]">Estimated Total:</span> <strong className="text-[var(--ink)]">Rp {totalPrice.toLocaleString("id-ID")}</strong></p>
            )}
          </div>
          <a
            href={confirmedWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold uppercase tracking-wider shadow-md active-press transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Open WhatsApp Confirmation</span>
          </a>
          <button
            type="button"
            onClick={() => setConfirmedWaUrl(null)}
            className="text-xs font-bold text-[var(--accent-text)] hover:underline cursor-pointer"
          >
            Edit Booking Details
          </button>
        </div>
      )
    }

    return (
      <form onSubmit={handleConfirmBooking} noValidate className="relative z-10 space-y-3.5">
        {bookingError && (
          <div className="flex items-start gap-2 p-3 rounded-[14px] bg-[var(--bad-soft)] border border-[var(--bad)]/30 text-[var(--bad)] text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{bookingError}</span>
          </div>
        )}

        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1.5">
            <User className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>Full Name *</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Alex Johnson"
            className="cirrel-input w-full px-4 py-2.5 rounded-[14px] text-sm font-semibold text-[var(--ink)]"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1.5">
            <Phone className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>WhatsApp / Phone Number</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +62 812 3456 7890"
            className="cirrel-input w-full px-4 py-2.5 rounded-[14px] text-sm font-semibold text-[var(--ink)]"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>Pickup Location (Hotel / Villa) *</span>
          </label>
          <input
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            placeholder="e.g. Villa Maya, Canggu / Ubud Center"
            className="cirrel-input w-full px-4 py-2.5 rounded-[14px] text-sm font-semibold text-[var(--ink)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>Tour Date</span>
            </label>
            <input
              type="date"
              value={tourDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setTourDate(e.target.value)}
              className="cirrel-input w-full px-3 py-2.5 rounded-[14px] text-xs sm:text-sm font-semibold text-[var(--ink)]"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>Pickup Time</span>
            </label>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="cirrel-input w-full px-3 py-2.5 rounded-[14px] text-xs sm:text-sm font-semibold text-[var(--ink)]"
            >
              <option value="07:30 AM">07:30 AM</option>
              <option value="08:00 AM">08:00 AM</option>
              <option value="08:30 AM">08:30 AM</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="01:00 PM">01:00 PM</option>
            </select>
          </div>
        </div>

        <div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1.5">
            <Users className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>Riders / Scooters</span>
          </span>
          <div className="cirrel-well rounded-[14px] px-3 py-1.5 flex items-center justify-between">
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

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-ink)] block mb-1.5">
            Notes / Special Requests <span className="normal-case font-medium">(Optional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Helmet sizes, riding skill, extra stops..."
            className="cirrel-input w-full px-4 py-2.5 rounded-[14px] text-xs sm:text-sm font-medium text-[var(--ink)]"
          />
        </div>

        {unitPrice > 0 && (
          <div className="cirrel-well rounded-[16px] p-3.5 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)]">
              Total Tour Rate
            </span>
            <span className="text-lg font-bold text-[var(--ink)]">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold uppercase tracking-wider shadow-md active-press transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Confirm &amp; Book via WhatsApp</span>
          </button>

          {externalBookingLink?.isExternal && (
            <a
              href={externalBookingLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full cirrel-btn-primary py-3 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active-press"
            >
              <span>{tour.cta_text || "Book Online"}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </form>
    )
  }

  return (
    <div className="min-h-screen text-[var(--ink)] antialiased w-full max-w-full overflow-x-hidden pb-32 sm:pb-36">
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
                  Tour Rate
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
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          {index + 1}
                        </div>
                        {index < itinerary.length - 1 && (
                          <div className="w-0.5 flex-1 bg-[var(--line-2)] my-1.5" />
                        )}
                      </div>

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

          {/* Right Column: Booking Details Card */}
          <aside id="tour-booking-form" className="lg:col-span-4 lg:sticky lg:top-24 self-start">
            <div className="cirrel-glass rounded-[28px] p-5 sm:p-6 space-y-4">
              <div className="relative z-10 flex items-baseline justify-between gap-2 pb-3 border-b border-[var(--line)]">
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

              {renderBookingFormContent()}
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Rounded Tour Rate Bar with Book Now Button */}
      <nav
        aria-label="Tour Rate Booking Bar"
        className="fixed bottom-4 inset-x-4 sm:bottom-6 z-40 pointer-events-none"
      >
        <div className="max-w-xl mx-auto cirrel-glass-hi rounded-full px-5 py-3 shadow-[0_14px_38px_rgba(10,22,50,0.24)] border border-white/25 pointer-events-auto flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-[var(--muted-ink)] uppercase tracking-wider leading-none">
              Tour Rate
            </span>
            <div className="flex items-baseline gap-1.5 mt-1 truncate">
              <span className="text-base sm:text-lg font-bold text-[var(--ink)] tracking-tight tabular-nums">
                {unitPrice > 0 ? `Rp ${totalPrice.toLocaleString("id-ID")}` : "Custom Tour"}
              </span>
              {unitPrice > 0 && (
                <span className="text-[11px] text-[var(--muted-ink)] font-semibold">
                  {guests > 1 ? `(${guests} guests)` : priceUnit}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className="cirrel-btn-primary px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider active-press flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <span>Book Now</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </nav>

      {/* Tour Booking Details Modal (triggered from Floating Book Now card) */}
      {isBookingModalOpen && (
        <aside
          onClick={() => setIsBookingModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Tour Booking Details"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 overflow-y-auto animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md cirrel-modal rounded-t-[30px] sm:rounded-[30px] p-6 pb-8 sm:p-7 space-y-4 max-h-[92dvh] overflow-y-auto animate-in slide-in-from-bottom-6 text-[var(--ink)]"
          >
            <div className="relative z-10 flex items-start justify-between gap-3 pb-3 border-b border-[var(--line)]">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-text)] block">
                  Book Scooter Tour
                </span>
                <h2 className="text-lg font-bold text-[var(--ink)] leading-snug truncate">
                  {tour.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                aria-label="Close booking form"
                className="cirrel-ibtn w-9 h-9 shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderBookingFormContent()}
          </div>
        </aside>
      )}
    </div>
  )
}
