"use client"

import React, { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, X, Calendar, Trash2, MessageCircle, ExternalLink, MapPin } from "lucide-react"
import { SavedBooking } from "@/utils/myBookings"

interface HomeBookingsModalProps {
  isOpen: boolean
  onClose: () => void
  bookings: SavedBooking[]
  onRemoveBooking: (id: string) => void
  onClearBookings: () => void
}

function HomeBookingsModalComponent({
  isOpen,
  onClose,
  bookings,
  onRemoveBooking,
  onClearBookings,
}: HomeBookingsModalProps) {
  if (!isOpen) return null

  return (
    <aside
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="My Bookings"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/50 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-lg cirrel-modal rounded-t-[30px] md:rounded-[30px] p-6 pb-10 md:pb-6 animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 relative max-h-[85vh] overflow-y-auto text-[var(--ink)]"
      >
        <div className="flex items-center justify-between mb-6 relative z-10 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="cirrel-mark w-9 h-9 rounded-[11px] shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--ink)] leading-tight">My Bookings</h3>
              <p className="text-xs text-[var(--muted-ink)] font-medium">
                {bookings.length} saved {bookings.length === 1 ? "booking" : "bookings"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {bookings.length > 0 && (
              <button
                type="button"
                onClick={onClearBookings}
                className="text-xs font-semibold text-[var(--muted-ink)] hover:text-[var(--bad)] px-2.5 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close my bookings"
              className="cirrel-ibtn w-9 h-9 active-press cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          {bookings.length === 0 ? (
            <div className="text-center py-12 cirrel-well rounded-[24px]">
              <div className="w-14 h-14 cirrel-glass rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-[var(--muted-ink)]" aria-hidden="true" />
              </div>
              <p className="font-bold text-[var(--ink)]">No bookings saved yet</p>
              <p className="text-sm text-[var(--muted-ink)] mt-1 px-6">
                Once you complete a scooter booking, your receipt and WhatsApp link will automatically appear here.
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const durationLabel =
                booking.durationMode === "weekly"
                  ? booking.durationCount === 1
                    ? "Week"
                    : "Weeks"
                  : booking.durationMode === "monthly"
                  ? booking.durationCount === 1
                    ? "Month"
                    : "Months"
                  : booking.durationCount === 1
                  ? "Day"
                  : "Days"

              return (
                <div
                  key={booking.id}
                  className="cirrel-well p-4 rounded-[22px] space-y-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-16 h-16 bg-white/95 rounded-2xl overflow-hidden shrink-0 shadow-xs p-1">
                      <Image
                        src={booking.scooterImg || "/images/scooter.png"}
                        alt={booking.scooterName || "Scooter"}
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-[var(--ink)] text-sm truncate">
                            {booking.scooterName}
                          </h4>
                          <p className="text-xs font-semibold text-[var(--accent-text)] truncate">
                            {booking.vendorName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveBooking(booking.id)}
                          aria-label={`Remove ${booking.scooterName} booking`}
                          className="p-1.5 rounded-full text-[var(--muted-ink)] hover:text-[var(--bad)] hover:bg-[var(--bad-soft)] transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-medium text-[var(--muted-ink)]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[var(--accent-text)]" />
                          {booking.startDate} &rarr; {booking.endDate}
                        </span>
                        <span>•</span>
                        <span>
                          {booking.quantity} {booking.quantity === 1 ? "Unit" : "Units"} • {booking.durationCount} {durationLabel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2.5 gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted-ink)] font-medium truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="capitalize truncate">{booking.deliveryMethod}</span>
                        </span>
                        <span className="font-bold text-[var(--ink)] text-sm shrink-0">
                          Rp {Number(booking.totalPrice || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--line)]">
                    {booking.whatsappUrl && (
                      <a
                        href={booking.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 cirrel-btn-primary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 active-press"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Open WhatsApp</span>
                      </a>
                    )}
                    <Link
                      href={`/detail/${booking.scooterId}`}
                      onClick={onClose}
                      className="cirrel-btn py-2 px-3.5 text-xs font-bold flex items-center justify-center gap-1 active-press shrink-0"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}

const HomeBookingsModal = memo(HomeBookingsModalComponent)
export default HomeBookingsModal
