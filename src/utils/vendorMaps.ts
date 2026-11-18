import { createClient as createBrowserClient } from "@/lib/supabase/client"

/**
 * Normalizes a vendor-submitted Google Maps URL into a safe https URL.
 * Rejects non-HTTP(S) schemes (e.g. javascript:) and empty strings.
 */
export function normalizeGoogleMapsUrl(raw?: string | null): string {
  if (!raw) return ""
  const trimmed = raw.trim()
  if (!trimmed) return ""

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const parsed = new URL(withProtocol)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return ""
    }
    return parsed.toString()
  } catch {
    return ""
  }
}

const FALLBACK_BUCKET = "scooter-image"
const fallbackPath = (vendorId: string | number) => `vendor-maps/${vendorId}.json`

/**
 * Fallback storage persistence for vendor Google Maps links when the
 * `vendors.google_maps_url` column has not yet been added in PostgreSQL.
 */
export async function saveVendorGoogleMapsFallback(vendorId: string | number, url: string): Promise<void> {
  try {
    const supabase = createBrowserClient()
    const payload = JSON.stringify({ google_maps_url: url, updated_at: new Date().toISOString() })
    const blob = new Blob([payload], { type: "application/json" })
    await supabase.storage
      .from(FALLBACK_BUCKET)
      .upload(fallbackPath(vendorId), blob, {
        cacheControl: "60",
        upsert: true,
        contentType: "application/json",
      })
  } catch {
    // Best-effort fallback only
  }
}

export async function fetchVendorGoogleMapsFallback(vendorId: string | number): Promise<string> {
  try {
    const supabase = createBrowserClient()
    const { data } = supabase.storage.from(FALLBACK_BUCKET).getPublicUrl(fallbackPath(vendorId))
    if (!data?.publicUrl) return ""

    const res = await fetch(`${data.publicUrl}?t=${Date.now()}`, { cache: "no-store" })
    if (!res.ok) return ""
    const json = await res.json()
    return normalizeGoogleMapsUrl(json?.google_maps_url)
  } catch {
    return ""
  }
}
