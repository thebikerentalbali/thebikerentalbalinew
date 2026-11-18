import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Extracts `HH:mm` from an ISO-like date/datetime string (e.g. `2026-11-19T10:00`).
 */
export function extractTimePart(value?: string | Date | null): string | null {
  if (!value) return null
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null
    return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
  }
  const match = String(value).match(/[T ](\d{2}:\d{2})/)
  return match ? match[1] : null
}

/**
 * Parses `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm` in local browser/server wall time
 * so 24-hour pickup/return comparisons stay aligned without UTC off-by-one shifts.
 */
export function parseBookingDateTime(
  value?: string | Date | null,
  isEndBoundary = false
): Date | null {
  if (!value) return null
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : new Date(value.getTime())
  }

  const raw = String(value).trim()
  if (!raw) return null

  const dtMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/)
  if (dtMatch) {
    const year = Number(dtMatch[1])
    const month = Number(dtMatch[2]) - 1
    const day = Number(dtMatch[3])
    const hasTime = dtMatch[4] !== undefined && dtMatch[5] !== undefined
    const hour = hasTime ? Number(dtMatch[4]) : isEndBoundary ? 23 : 9
    const minute = hasTime ? Number(dtMatch[5]) : isEndBoundary ? 59 : 0
    const second = hasTime ? Number(dtMatch[6] || 0) : isEndBoundary ? 59 : 0
    const parsed = new Date(year, month, day, hour, minute, second, 0)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  const fallback = new Date(raw)
  return isNaN(fallback.getTime()) ? null : fallback
}

export function isBookingFinished(
  endDate?: string | Date | null,
  nowMs: number = Date.now()
): boolean {
  const parsedEnd = parseBookingDateTime(endDate, true)
  if (!parsedEnd) return false
  return nowMs >= parsedEnd.getTime()
}

export function formatTimeRemaining(
  endDate?: string | Date | null,
  nowMs: number = Date.now()
): { isFinished: boolean; label: string; tone: "good" | "warn" | "info" } {
  const parsedEnd = parseBookingDateTime(endDate, true)
  if (!parsedEnd) {
    return { isFinished: false, label: "Active", tone: "good" }
  }

  const diffMs = parsedEnd.getTime() - nowMs
  if (diffMs <= 0) {
    return { isFinished: true, label: "Time Finished", tone: "info" }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days >= 1) {
    return {
      isFinished: false,
      label: `${days}d ${hours}h ${minutes}m left`,
      tone: days === 1 && hours < 6 ? "warn" : "good",
    }
  }

  const hh = String(hours).padStart(2, "0")
  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")
  return {
    isFinished: false,
    label: `${hh}:${mm}:${ss} left`,
    tone: "warn",
  }
}

export function formatBookingDateTimeDisplay(
  value?: string | Date | null,
  fallbackDateOnly?: string
): string {
  const rawStr = typeof value === "string" ? value : ""
  const parsed = parseBookingDateTime(value || fallbackDateOnly, false)
  if (!parsed) return rawStr || fallbackDateOnly || "N/A"

  const datePart = parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const timePart = extractTimePart(value)
  return timePart ? `${datePart} (${timePart})` : datePart
}

/**
 * Atomically completes expired `confirmed` bookings whose end date & time has passed,
 * restoring `scooters.available_units` (capped at `total_units`) without double-counting.
 */
export async function reconcileExpiredBookings(
  supabase: SupabaseClient<any>,
  vendorId?: string | number
): Promise<boolean> {
  try {
    let query = supabase
      .from("bookings")
      .select("id, scooter_id, quantity, end_date, status")
      .eq("status", "confirmed")

    if (vendorId !== undefined && vendorId !== null) {
      query = query.eq("vendor_id", vendorId)
    }

    const { data: activeBookings, error } = await query
    if (error || !activeBookings || activeBookings.length === 0) {
      return false
    }

    const nowMs = Date.now()
    const expired = activeBookings.filter((b: any) => isBookingFinished(b.end_date, nowMs))
    if (expired.length === 0) return false

    let anyUpdated = false

    for (const b of expired) {
      // Claim atomic transition from confirmed -> completed before touching unit counts
      const { data: claimed, error: claimErr } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", b.id)
        .eq("status", "confirmed")
        .select("id")

      if (claimErr || !claimed || claimed.length === 0) {
        continue
      }

      anyUpdated = true

      if (b.scooter_id) {
        const { data: sData } = await supabase
          .from("scooters")
          .select("available_units, total_units")
          .eq("id", b.scooter_id)
          .single()

        if (sData) {
          const currentAvail = Number(sData.available_units ?? 0)
          const totalUnits = Number(sData.total_units ?? 1)
          const qty = Math.max(1, Number(b.quantity) || 1)
          const newAvail = Math.min(totalUnits, currentAvail + qty)
          await supabase
            .from("scooters")
            .update({ available_units: newAvail })
            .eq("id", b.scooter_id)
        }
      }
    }

    return anyUpdated
  } catch (err) {
    console.warn("[rentalTime] reconcileExpiredBookings failed:", err)
    return false
  }
}
