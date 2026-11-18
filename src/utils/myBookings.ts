export interface SavedBooking {
  id: string
  scooterId: number | string
  scooterName: string
  scooterImg?: string
  vendorName: string
  vendorPhone?: string
  customerName: string
  startDate: string
  endDate: string
  quantity: number
  durationMode: "daily" | "weekly" | "monthly"
  durationCount: number
  totalPrice: number
  deliveryMethod: string
  deliveryAddress?: string
  whatsappUrl?: string
  createdAt: string
}

const BOOKINGS_STORAGE_KEY = "tbrb_my_bookings_v1"

export function getSavedBookings(): SavedBooking[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addSavedBookings(entries: SavedBooking[]): SavedBooking[] {
  if (typeof window === "undefined") return []
  const existing = getSavedBookings()
  const updated = [...entries, ...existing].slice(0, 50)
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event("tbrb_bookings_updated"))
  } catch {}
  return updated
}

export function removeSavedBooking(id: string): SavedBooking[] {
  if (typeof window === "undefined") return []
  const updated = getSavedBookings().filter((b) => b.id !== id)
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event("tbrb_bookings_updated"))
  } catch {}
  return updated
}

export function clearSavedBookings(): SavedBooking[] {
  if (typeof window === "undefined") return []
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([]))
    window.dispatchEvent(new Event("tbrb_bookings_updated"))
  } catch {}
  return []
}

export function subscribeToSavedBookings(callback: (bookings: SavedBooking[]) => void): () => void {
  if (typeof window === "undefined") return () => {}
  const handler = () => callback(getSavedBookings())
  window.addEventListener("tbrb_bookings_updated", handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener("tbrb_bookings_updated", handler)
    window.removeEventListener("storage", handler)
  }
}
