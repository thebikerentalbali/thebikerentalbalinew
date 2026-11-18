"use client"

import React, { useMemo, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

export interface CalendarBookingItem {
  id: string | number
  startDate?: string | Date
  endDate?: string | Date
  rawStatus?: string
  scooter?: string
  customer?: string
}

interface BookingsCalendarProps {
  bookings: CalendarBookingItem[]
  activeMonthDate: Date
  onActiveMonthChange: (date: Date) => void
  calendarStartDate: Date
  onCalendarStartChange: (date: Date) => void
  selectedDate: string | null
  onSelectDate: (isoDate: string | null) => void
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function parseDateSafe(val?: string | Date): Date | null {
  if (!val) return null
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null
    return new Date(val.getFullYear(), val.getMonth(), val.getDate(), 0, 0, 0, 0)
  }
  const clean = String(val).substring(0, 10)
  const parts = clean.split("-").map(Number)
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0)
  }
  const d = new Date(val)
  if (isNaN(d.getTime())) return null
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

export default function BookingsCalendar({
  bookings,
  activeMonthDate,
  onActiveMonthChange,
  calendarStartDate,
  onCalendarStartChange,
  selectedDate,
  onSelectDate,
}: BookingsCalendarProps) {
  const [viewMode, setViewMode] = useState<"month" | "week">("month")

  const todayIso = useMemo(() => toIsoDate(new Date()), [])

  // Pre-compute normalized booking intervals once per bookings change
  const normalizedBookings = useMemo(() => {
    return (bookings || [])
      .filter((b) => b.rawStatus !== "rejected")
      .map((b) => {
        const start = parseDateSafe(b.startDate)
        const end = parseDateSafe(b.endDate) || start
        return {
          ...b,
          startTs: start ? start.getTime() : null,
          endTs: end ? end.getTime() : null,
        }
      })
      .filter((b) => b.startTs !== null && b.endTs !== null)
  }, [bookings])

  const getStatsForDate = (dateObj: Date) => {
    const ts = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0).getTime()
    let pending = 0
    let confirmed = 0
    let completed = 0
    for (const b of normalizedBookings) {
      if (ts >= (b.startTs as number) && ts <= (b.endTs as number)) {
        if (b.rawStatus === "pending") pending += 1
        else if (b.rawStatus === "confirmed") confirmed += 1
        else if (b.rawStatus === "completed") completed += 1
      }
    }
    return {
      total: pending + confirmed + completed,
      pending,
      confirmed,
      completed,
    }
  }

  const monthCells = useMemo(() => {
    const year = activeMonthDate.getFullYear()
    const month = activeMonthDate.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const lastOfMonth = new Date(year, month + 1, 0)

    // Monday = 0 ... Sunday = 6
    const startOffset = (firstOfMonth.getDay() + 6) % 7
    const totalDaysInMonth = lastOfMonth.getDate()
    const totalCells = Math.ceil((startOffset + totalDaysInMonth) / 7) * 7

    const cells: { date: Date; inCurrentMonth: boolean; iso: string }[] = []
    for (let i = 0; i < totalCells; i++) {
      const cellDate = new Date(year, month, 1 - startOffset + i)
      cells.push({
        date: cellDate,
        inCurrentMonth: cellDate.getMonth() === month,
        iso: toIsoDate(cellDate),
      })
    }
    return cells
  }, [activeMonthDate])

  const weekCells = useMemo(() => {
    const cells: { date: Date; iso: string }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(calendarStartDate)
      d.setDate(d.getDate() + i)
      cells.push({ date: d, iso: toIsoDate(d) })
    }
    return cells
  }, [calendarStartDate])

  const activeMonthLabel = useMemo(() => {
    return activeMonthDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }, [activeMonthDate])

  const monthTotalBookings = useMemo(() => {
    const mStart = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth(), 1, 0, 0, 0, 0).getTime()
    const mEnd = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 0, 23, 59, 59, 999).getTime()
    return normalizedBookings.filter(
      (b) => (b.startTs as number) <= mEnd && (b.endTs as number) >= mStart
    ).length
  }, [activeMonthDate, normalizedBookings])

  const handlePrev = () => {
    if (viewMode === "month") {
      const prev = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() - 1, 1)
      onActiveMonthChange(prev)
      onSelectDate(null)
      const wStart = new Date(prev)
      wStart.setDate(wStart.getDate() - 1)
      onCalendarStartChange(wStart)
    } else {
      const d = new Date(calendarStartDate)
      d.setDate(d.getDate() - 7)
      onCalendarStartChange(d)
    }
  }

  const handleNext = () => {
    if (viewMode === "month") {
      const next = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 1)
      onActiveMonthChange(next)
      onSelectDate(null)
      const wStart = new Date(next)
      wStart.setDate(wStart.getDate() - 1)
      onCalendarStartChange(wStart)
    } else {
      const d = new Date(calendarStartDate)
      d.setDate(d.getDate() + 7)
      onCalendarStartChange(d)
    }
  }

  const handleJumpToday = () => {
    const now = new Date()
    onActiveMonthChange(new Date(now.getFullYear(), now.getMonth(), 1))
    const wStart = new Date(now)
    wStart.setDate(now.getDate() - 2)
    onCalendarStartChange(wStart)
    onSelectDate(toIsoDate(now))
  }

  const handleDayClick = (dateObj: Date, iso: string) => {
    if (selectedDate === iso) {
      onSelectDate(null)
      return
    }
    onSelectDate(iso)
    if (
      dateObj.getMonth() !== activeMonthDate.getMonth() ||
      dateObj.getFullYear() !== activeMonthDate.getFullYear()
    ) {
      onActiveMonthChange(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1))
    }
  }

  return (
    <section
      aria-label="Bookings Calendar"
      className="cirrel-glass rounded-[28px] p-4 sm:p-5 md:p-6 space-y-4"
    >
      {/* Top Toolbar */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-[var(--line)]">
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          <div className="w-10 h-10 rounded-[13px] cirrel-mark shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--ink)] tracking-tight">
                {activeMonthLabel}
              </h2>
              {selectedDate ? (
                <button
                  type="button"
                  onClick={() => onSelectDate(null)}
                  className="cirrel-pill cirrel-pill--info text-[11px] cursor-pointer hover:opacity-80"
                  title="Clear day filter"
                >
                  <span>Day: {selectedDate}</span>
                  <span className="ml-0.5 font-bold">×</span>
                </button>
              ) : (
                <span className="cirrel-pill text-[11px]">
                  {monthTotalBookings} {monthTotalBookings === 1 ? "Booking" : "Bookings"} in Month
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--muted-ink)] font-medium mt-0.5">
              Tap any date to inspect bookings active on that day
            </p>
          </div>
        </div>

        {/* Right Controls: Month/Week Switcher + Navigation */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between lg:justify-end">
          {/* Segmented View Toggle */}
          <div className="cirrel-seg inline-flex items-center shrink-0" role="group" aria-label="Calendar view mode">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === "month"
                  ? "cirrel-btn-primary text-white"
                  : "text-[var(--muted-ink)] hover:text-[var(--ink)]"
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === "week"
                  ? "cirrel-btn-primary text-white"
                  : "text-[var(--muted-ink)] hover:text-[var(--ink)]"
              }`}
            >
              Week
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              aria-label={viewMode === "month" ? "Previous Month" : "Previous Week"}
              className="cirrel-ibtn w-8 h-8 cursor-pointer active-press"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleJumpToday}
              className="cirrel-btn px-3 h-8 text-xs font-bold cursor-pointer active-press"
            >
              Today
            </button>
            {selectedDate && (
              <button
                type="button"
                onClick={() => onSelectDate(null)}
                className="cirrel-btn px-3 h-8 text-xs font-bold text-[var(--accent-text)] cursor-pointer active-press"
              >
                All Month
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              aria-label={viewMode === "month" ? "Next Month" : "Next Week"}
              className="cirrel-ibtn w-8 h-8 cursor-pointer active-press"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MONTH GRID VIEW */}
      {viewMode === "month" ? (
        <div className="relative z-10 space-y-2">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthCells.map(({ date, inCurrentMonth, iso }) => {
              const stats = getStatsForDate(date)
              const isSelected = selectedDate === iso
              const isToday = todayIso === iso

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => handleDayClick(date, iso)}
                  className={`min-h-[54px] sm:min-h-[76px] md:min-h-[84px] p-1.5 sm:p-2 rounded-[14px] sm:rounded-[18px] flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? "cirrel-btn-primary text-white shadow-md scale-[1.01]"
                      : isToday
                      ? "cirrel-well ring-2 ring-[var(--accent-blue)] text-[var(--ink)]"
                      : inCurrentMonth
                      ? "cirrel-well hover:bg-[var(--card-3)] text-[var(--ink)]"
                      : "bg-[var(--card-2)]/45 hover:bg-[var(--card-2)] text-[var(--muted-ink)] opacity-55"
                  }`}
                >
                  {/* Day Number + Total Pill */}
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold leading-none ${
                        isSelected
                          ? "text-white"
                          : isToday
                          ? "text-[var(--accent-text)]"
                          : inCurrentMonth
                          ? "text-[var(--ink)]"
                          : "text-[var(--muted-ink)]"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {stats.total > 0 && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                          isSelected
                            ? "bg-white text-[#005ec4]"
                            : "bg-[var(--accent-soft)] text-[var(--accent-text)]"
                        }`}
                      >
                        {stats.total}
                      </span>
                    )}
                  </div>

                  {/* Mobile Compact Status Dots */}
                  {stats.total > 0 ? (
                    <>
                      <div className="flex sm:hidden items-center gap-1 mt-1">
                        {stats.pending > 0 && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[#ffb340]"}`} />
                        )}
                        {stats.confirmed > 0 && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/90" : "bg-[#30d158]"}`} />
                        )}
                        {stats.completed > 0 && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/75" : "bg-[#0a84ff]"}`} />
                        )}
                      </div>

                      {/* Tablet/Desktop Micro Badges */}
                      <div className="hidden sm:flex flex-col gap-0.5 mt-1 w-full">
                        {stats.confirmed > 0 && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate leading-tight ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-[var(--good-soft)] text-[var(--good)]"
                            }`}
                          >
                            {stats.confirmed} Active
                          </span>
                        )}
                        {stats.pending > 0 && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate leading-tight ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-[var(--warn-soft)] text-[var(--warn)]"
                            }`}
                          >
                            {stats.pending} Pending
                          </span>
                        )}
                        {stats.completed > 0 && stats.confirmed === 0 && stats.pending === 0 && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate leading-tight ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-[var(--info-soft)] text-[var(--info)]"
                            }`}
                          >
                            {stats.completed} Done
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="h-2" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* WEEK STRIP VIEW */
        <div className="relative z-10 grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {weekCells.map(({ date, iso }) => {
            const stats = getStatsForDate(date)
            const isSelected = selectedDate === iso
            const isToday = todayIso === iso
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
            const monthShort = date.toLocaleDateString("en-US", { month: "short" })

            return (
              <button
                key={iso}
                type="button"
                onClick={() => handleDayClick(date, iso)}
                className={`flex flex-col items-center justify-between py-2.5 px-1 sm:py-3.5 sm:px-2 rounded-[18px] transition-all cursor-pointer ${
                  isSelected
                    ? "cirrel-btn-primary text-white scale-[1.02]"
                    : isToday
                    ? "cirrel-well ring-2 ring-[var(--accent-blue)] text-[var(--ink)] font-bold"
                    : "cirrel-well text-[var(--ink-2)] hover:bg-[var(--card-3)]"
                }`}
              >
                <span className={`text-[10px] sm:text-xs font-bold uppercase ${isSelected ? "text-white/80" : "text-[var(--muted-ink)]"}`}>
                  {dayName}
                </span>
                <span className="text-base sm:text-lg font-bold my-0.5">
                  {date.getDate()}
                </span>
                <span className={`text-[9px] hidden sm:inline font-semibold ${isSelected ? "text-white/75" : "text-[var(--muted-ink)]"}`}>
                  {monthShort}
                </span>
                {stats.total > 0 ? (
                  <span
                    className={`mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-white text-[#005ec4]" : "bg-[var(--good-soft)] text-[var(--good)]"
                    }`}
                  >
                    {stats.total}
                  </span>
                ) : (
                  <span className="h-4 mt-1" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Compact Legend Footer */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--line)] text-[11px] font-semibold text-[var(--muted-ink)]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#30d158]" />
            Confirmed / Active
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ffb340]" />
            Pending Review
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0a84ff]" />
            Completed
          </span>
        </div>
        <span>
          {selectedDate ? "Showing single-day filter" : `Showing all ${activeMonthLabel}`}
        </span>
      </div>
    </section>
  )
}
