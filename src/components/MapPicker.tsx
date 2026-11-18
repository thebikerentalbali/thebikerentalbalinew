"use client"

import React, { useEffect, useMemo, useRef } from "react"
import { Map as MapLibreMap, Marker, type StyleSpecification, type MapMouseEvent } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { getNormalizedVendorCoordinates } from "@/lib/api/catalogService"

export interface MapVendorItem {
  id: number | string
  name: string
  lat?: number | string
  lng?: number | string
  initials?: string
  logo?: string
  logo_url?: string
  image_url?: string
  address?: string
  location?: string
  phone?: string
  delivery_area?: string
}

interface MapPickerProps {
  position?: [number, number]
  onPositionChange?: (lat: number, lng: number) => void
  vendors?: MapVendorItem[]
  selectedVendorId?: number | string | null
  onVendorClick?: (id: number | string) => void
  className?: string
  zoom?: number
  interactive?: boolean
}

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/positron"

const OSM_FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

const extractLocationTitle = (vendor: MapVendorItem): string => {
  const addr = (vendor.location || vendor.address || "").toLowerCase()
  if (addr.includes("canggu") || addr.includes("berawa") || addr.includes("pererenan") || addr.includes("batu bolong")) return "Canggu"
  if (addr.includes("seminyak") || addr.includes("petitenget") || addr.includes("kerobokan") || addr.includes("umalas")) return "Seminyak"
  if (addr.includes("ubud") || addr.includes("sayan") || addr.includes("mas") || addr.includes("tegallalang")) return "Ubud"
  if (addr.includes("sanur")) return "Sanur"
  if (addr.includes("kuta") || addr.includes("legian") || addr.includes("tuban")) return "Kuta"
  if (addr.includes("uluwatu") || addr.includes("pecatu") || addr.includes("bingin")) return "Uluwatu"
  if (addr.includes("nusa dua") || addr.includes("benoa")) return "Nusa Dua"
  if (addr.includes("jimbaran")) return "Jimbaran"
  if (addr.includes("denpasar")) return "Denpasar"
  return vendor.address ? vendor.address.split(",")[0].slice(0, 14) : "Bali"
}

function createVendorMarkerElement(vendor: MapVendorItem, isSelected: boolean): HTMLDivElement {
  const name = vendor.name || "Vendor"
  const initials = vendor.initials || name.substring(0, 2).toUpperCase()
  const logo = vendor.logo || vendor.logo_url || vendor.image_url
  const locTitle = extractLocationTitle(vendor)

  const wrapper = document.createElement("div")
  wrapper.style.position = "relative"
  wrapper.style.transform = "translateY(-10px)"
  wrapper.style.cursor = "pointer"
  wrapper.style.userSelect = "none"

  const pill = document.createElement("div")
  pill.style.display = "inline-flex"
  pill.style.alignItems = "center"
  pill.style.gap = "8px"
  pill.style.padding = "5px 12px 5px 5px"
  pill.style.borderRadius = "9999px"
  pill.style.whiteSpace = "nowrap"
  pill.style.transition = "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)"
  pill.style.fontFamily = "var(--font-sans), system-ui, sans-serif"

  if (isSelected) {
    pill.style.background = "linear-gradient(180deg, #1c87ff, #0062d6)"
    pill.style.color = "#ffffff"
    pill.style.border = "1.5px solid rgba(255,255,255,0.45)"
    pill.style.boxShadow = "0 14px 28px -6px rgba(0, 122, 255, 0.45)"
    pill.style.transform = "scale(1.06)"
  } else {
    pill.style.background = "rgba(255, 255, 255, 0.96)"
    pill.style.color = "#0b1220"
    pill.style.border = "1px solid rgba(15, 25, 45, 0.14)"
    pill.style.boxShadow = "0 8px 20px -6px rgba(15, 30, 60, 0.25)"
  }

  const avatar = document.createElement("div")
  avatar.style.width = "28px"
  avatar.style.height = "28px"
  avatar.style.borderRadius = "9999px"
  avatar.style.flexShrink = "0"
  avatar.style.display = "flex"
  avatar.style.alignItems = "center"
  avatar.style.justifyContent = "center"
  avatar.style.overflow = "hidden"
  avatar.style.background = isSelected ? "rgba(255,255,255,0.95)" : "#0b1220"

  if (logo) {
    const img = document.createElement("img")
    img.src = logo
    img.alt = name
    img.style.width = "100%"
    img.style.height = "100%"
    img.style.objectFit = "cover"
    img.onerror = () => {
      img.style.display = "none"
      const fallback = document.createElement("span")
      fallback.textContent = initials
      fallback.style.fontWeight = "800"
      fallback.style.fontSize = "10px"
      fallback.style.color = isSelected ? "#0062d6" : "#ffffff"
      avatar.appendChild(fallback)
    }
    avatar.appendChild(img)
  } else {
    const span = document.createElement("span")
    span.textContent = initials
    span.style.fontWeight = "800"
    span.style.fontSize = "10px"
    span.style.color = isSelected ? "#0062d6" : "#ffffff"
    avatar.appendChild(span)
  }

  const textCol = document.createElement("div")
  textCol.style.display = "flex"
  textCol.style.flexDirection = "column"
  textCol.style.lineHeight = "1.2"
  textCol.style.paddingRight = "2px"

  const titleEl = document.createElement("span")
  titleEl.textContent = name
  titleEl.style.fontSize = "12px"
  titleEl.style.fontWeight = "700"
  titleEl.style.letterSpacing = "-0.01em"
  titleEl.style.color = isSelected ? "#ffffff" : "#0b1220"

  const locEl = document.createElement("span")
  locEl.textContent = locTitle
  locEl.style.fontSize = "10px"
  locEl.style.fontWeight = "600"
  locEl.style.color = isSelected ? "rgba(255,255,255,0.85)" : "#4c5566"

  textCol.appendChild(titleEl)
  textCol.appendChild(locEl)

  const arrow = document.createElement("div")
  arrow.style.position = "absolute"
  arrow.style.bottom = "-4px"
  arrow.style.left = "50%"
  arrow.style.marginLeft = "-4px"
  arrow.style.width = "8px"
  arrow.style.height = "8px"
  arrow.style.transform = "rotate(45deg)"
  arrow.style.background = isSelected ? "#0062d6" : "#ffffff"
  if (!isSelected) {
    arrow.style.borderRight = "1px solid rgba(15, 25, 45, 0.14)"
    arrow.style.borderBottom = "1px solid rgba(15, 25, 45, 0.14)"
  }

  pill.appendChild(avatar)
  pill.appendChild(textCol)
  pill.appendChild(arrow)
  wrapper.appendChild(pill)

  return wrapper
}

function createPinMarkerElement(): HTMLDivElement {
  const el = document.createElement("div")
  el.style.width = "32px"
  el.style.height = "32px"
  el.style.borderRadius = "9999px"
  el.style.background = "linear-gradient(180deg, #1c87ff, #0062d6)"
  el.style.border = "3px solid #ffffff"
  el.style.boxShadow = "0 8px 20px rgba(0, 122, 255, 0.45)"
  el.style.display = "flex"
  el.style.alignItems = "center"
  el.style.justifyContent = "center"
  el.style.cursor = "grab"

  const innerDot = document.createElement("div")
  innerDot.style.width = "10px"
  innerDot.style.height = "10px"
  innerDot.style.borderRadius = "9999px"
  innerDot.style.background = "#ffffff"
  el.appendChild(innerDot)
  return el
}

export default function MapPicker({
  position,
  onPositionChange,
  vendors,
  selectedVendorId,
  onVendorClick,
  className,
  zoom = 11,
  interactive = true,
}: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const vendorMarkersRef = useRef<Marker[]>([])
  const pinMarkerRef = useRef<Marker | null>(null)
  const usedFallbackRef = useRef(false)
  const lastCenterKeyRef = useRef<string>("")

  const onPositionChangeRef = useRef(onPositionChange)
  const onVendorClickRef = useRef(onVendorClick)

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange
  }, [onPositionChange])

  useEffect(() => {
    onVendorClickRef.current = onVendorClick
  }, [onVendorClick])

  const defaultCenter: [number, number] = useMemo(() => [-8.5069, 115.2625], [])

  const validVendors = useMemo(() => {
    if (!vendors || !Array.isArray(vendors)) return []
    return vendors.map((v) => {
      const coords = getNormalizedVendorCoordinates(v)
      return {
        ...v,
        lat: coords.lat,
        lng: coords.lng,
      }
    })
  }, [vendors])

  const mapCenter: [number, number] = useMemo(() => {
    if (position && position[0] !== 0 && position[1] !== 0 && !isNaN(position[0]) && !isNaN(position[1])) {
      return [Number(position[0]), Number(position[1])]
    }
    if (selectedVendorId && validVendors.length > 0) {
      const selected = validVendors.find((v) => String(v.id) === String(selectedVendorId))
      if (selected) return [selected.lat, selected.lng]
    }
    if (validVendors.length === 1) {
      return [validVendors[0].lat, validVendors[0].lng]
    }
    return defaultCenter
  }, [position, selectedVendorId, validVendors, defaultCenter])

  // Initialize MapLibre GL map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const initialZoom = validVendors.length === 1 ? 14 : zoom
    const map = new MapLibreMap({
      container: containerRef.current,
      style: OPENFREEMAP_STYLE,
      center: [mapCenter[1], mapCenter[0]],
      zoom: initialZoom,
      interactive,
      attributionControl: { compact: true },
    })

    mapRef.current = map

    map.on("error", () => {
      if (!usedFallbackRef.current && !map.isStyleLoaded()) {
        usedFallbackRef.current = true
        try {
          map.setStyle(OSM_FALLBACK_STYLE)
        } catch {}
      }
    })

    map.on("click", (e: MapMouseEvent) => {
      if (onPositionChangeRef.current) {
        onPositionChangeRef.current(e.lngLat.lat, e.lngLat.lng)
      }
    })

    const ro = new ResizeObserver(() => {
      map.resize()
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      vendorMarkersRef.current.forEach((m) => m.remove())
      vendorMarkersRef.current = []
      if (pinMarkerRef.current) {
        pinMarkerRef.current.remove()
        pinMarkerRef.current = null
      }
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Smoothly pan/zoom only when target coordinates genuinely change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const key = `${mapCenter[0].toFixed(5)},${mapCenter[1].toFixed(5)},${validVendors.length === 1 ? 14 : zoom}`
    if (lastCenterKeyRef.current === key) return
    const isInitial = lastCenterKeyRef.current === ""
    lastCenterKeyRef.current = key
    if (isInitial) return

    const targetZoom = validVendors.length === 1 ? 14 : zoom
    map.easeTo({
      center: [mapCenter[1], mapCenter[0]],
      zoom: Math.max(map.getZoom(), targetZoom),
      duration: 500,
    })
  }, [mapCenter, zoom, validVendors.length])

  // Sync single-pin location picker marker
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (pinMarkerRef.current) {
      pinMarkerRef.current.remove()
      pinMarkerRef.current = null
    }

    if (position && position[0] !== 0 && position[1] !== 0 && !isNaN(position[0]) && !isNaN(position[1])) {
      const el = createPinMarkerElement()
      const marker = new Marker({
        element: el,
        draggable: Boolean(onPositionChange),
      })
        .setLngLat([Number(position[1]), Number(position[0])])
        .addTo(map)

      if (onPositionChange) {
        marker.on("dragend", () => {
          const lngLat = marker.getLngLat()
          onPositionChangeRef.current?.(lngLat.lat, lngLat.lng)
        })
      }

      pinMarkerRef.current = marker
    }
  }, [position, onPositionChange])

  // Sync vendor markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    vendorMarkersRef.current.forEach((m) => m.remove())
    vendorMarkersRef.current = []

    validVendors.forEach((v) => {
      const isSelected = selectedVendorId != null && String(selectedVendorId) === String(v.id)
      const el = createVendorMarkerElement(v, isSelected)
      el.style.zIndex = isSelected ? "20" : "10"

      el.addEventListener("click", (evt) => {
        evt.stopPropagation()
        onVendorClickRef.current?.(v.id)
      })

      const marker = new Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([v.lng, v.lat])
        .addTo(map)

      if (isSelected) {
        marker.getElement().style.zIndex = "30"
      }

      vendorMarkersRef.current.push(marker)
    })
  }, [validVendors, selectedVendorId])

  return (
    <div
      className={
        className ||
        "h-[300px] w-full rounded-2xl overflow-hidden border border-[var(--line)] shadow-sm relative z-0 bg-[#eef3f8]"
      }
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
