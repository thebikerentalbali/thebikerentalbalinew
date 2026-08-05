"use client"

import React, { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { getNormalizedVendorCoordinates } from '@/lib/api/catalogService'

// Fix for default marker icons in React-Leaflet
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export interface MapVendorItem {
  id: number | string
  name: string
  lat?: number | string
  lng?: number | string
  initials?: string
  rating?: number | string
  review_count?: number | string
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

const extractLocationTitle = (vendor: MapVendorItem): string => {
  const addr = (vendor.location || vendor.address || '').toLowerCase()
  if (addr.includes('canggu') || addr.includes('berawa') || addr.includes('pererenan') || addr.includes('batu bolong')) return 'Canggu'
  if (addr.includes('seminyak') || addr.includes('petitenget') || addr.includes('kerobokan') || addr.includes('umalas')) return 'Seminyak'
  if (addr.includes('ubud') || addr.includes('sayan') || addr.includes('mas') || addr.includes('tegallalang')) return 'Ubud'
  if (addr.includes('sanur')) return 'Sanur'
  if (addr.includes('kuta') || addr.includes('legian') || addr.includes('tuban')) return 'Kuta'
  if (addr.includes('uluwatu') || addr.includes('pecatu') || addr.includes('bingin')) return 'Uluwatu'
  if (addr.includes('nusa dua') || addr.includes('benoa')) return 'Nusa Dua'
  if (addr.includes('jimbaran')) return 'Jimbaran'
  if (addr.includes('denpasar')) return 'Denpasar'
  return vendor.address ? vendor.address.split(',')[0].slice(0, 14) : 'Bali'
}

const getVendorIcon = (
  vendor: MapVendorItem,
  isSelected: boolean = false
) => {
  const name = vendor.name || 'Vendor'
  const initials = vendor.initials || name.substring(0, 2).toUpperCase()
  const logo = vendor.logo || vendor.logo_url || vendor.image_url
  const rating = vendor.rating ? Number(vendor.rating).toFixed(1) : '5.0'
  const locTitle = extractLocationTitle(vendor)

  const logoHtml = logo
    ? `<img src="${logo}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:9999px;" onerror="this.style.display='none'" />`
    : `<span style="font-weight:900;color:${isSelected ? '#000000' : '#ffffff'};font-size:10px;">${initials}</span>`

  const bgStyle = isSelected 
    ? 'background:#000000;color:#ffffff;border:2px solid #000000;box-shadow:0 12px 28px -4px rgba(0,0,0,0.5);transform:scale(1.08);' 
    : 'background:#ffffff;color:#000000;border:1.5px solid #000000;box-shadow:0 6px 18px -3px rgba(0,0,0,0.18);'

  const nameColor = isSelected ? '#ffffff' : '#000000'
  const subtitleColor = isSelected ? '#d4d4d8' : '#52525b'
  const starColor = isSelected ? '#fbbf24' : '#eab308'
  const arrowBg = isSelected ? '#000000' : '#ffffff'
  const arrowBorder = isSelected ? 'none' : '1.5px solid #000000'
  const logoBg = isSelected ? '#ffffff' : '#000000'

  const html = `
    <div style="position:absolute;bottom:0;left:50%;transform:translate(-50%, -10px);pointer-events:auto;">
      <div style="position:relative;display:inline-flex;align-items:center;gap:7px;padding:5px 12px 5px 5px;border-radius:9999px;cursor:pointer;white-space:nowrap;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);${bgStyle}">
        <div style="width:28px;height:28px;border-radius:9999px;background:${logoBg};flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:1px;box-shadow:0 1px 3px rgba(0,0,0,0.2);">
          <div style="width:100%;height:100%;border-radius:9999px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
            ${logoHtml}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;line-height:1.2;padding-right:2px;">
          <span style="font-size:12px;font-weight:800;letter-spacing:-0.01em;color:${nameColor};white-space:nowrap;">${name}</span>
          <div style="display:flex;align-items:center;gap:4px;margin-top:1px;">
            <span style="font-size:9.5px;font-weight:700;color:${subtitleColor};">${locTitle}</span>
            <span style="font-size:8px;opacity:0.6;">•</span>
            <div style="display:inline-flex;align-items:center;gap:2px;">
              <svg style="width:9px;height:9px;fill:${starColor};color:${starColor};" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span style="font-size:9.5px;font-weight:800;color:${nameColor};">${rating}</span>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:-4px;left:50%;margin-left:-4px;width:8px;height:8px;background:${arrowBg};border-right:${arrowBorder};border-bottom:${arrowBorder};transform:rotate(45deg);z-index:0;"></div>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'leaflet-vendor-custom-pin',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -45],
  })
}

function LocationMarker({ position, onPositionChange }: { position: [number, number], onPositionChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return position[0] === 0 ? null : (
    <Marker position={position} icon={defaultIcon}></Marker>
  )
}

function MapViewController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom || map.getZoom(), { animate: true })
  }, [center, zoom, map])
  return null
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
  // Center map on Bali central coordinates
  const defaultCenter: [number, number] = useMemo(() => [-8.5069, 115.2625], []) 
  
  // Validated & normalized vendor coordinates based on vendor location title
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
      const selected = validVendors.find(v => String(v.id) === String(selectedVendorId))
      if (selected) return [selected.lat, selected.lng]
    }
    if (validVendors.length === 1) {
      return [validVendors[0].lat, validVendors[0].lng]
    }
    return defaultCenter
  }, [position, selectedVendorId, validVendors, defaultCenter])

  return (
    <div className={className || "h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0"}>
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        scrollWheelZoom={interactive} 
        dragging={interactive}
        touchZoom={interactive}
        attributionControl={false} 
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        <MapViewController center={mapCenter} zoom={validVendors.length === 1 ? 14 : zoom} />

        {position && onPositionChange && (
          <LocationMarker position={position} onPositionChange={onPositionChange} />
        )}

        {validVendors.map((v) => {
          const isSelected = selectedVendorId != null && String(selectedVendorId) === String(v.id)

          return (
            <Marker 
              key={v.id} 
              position={[v.lat, v.lng]} 
              icon={getVendorIcon(v, isSelected)} 
              eventHandlers={{ 
                click: (e) => {
                  L.DomEvent.stopPropagation(e as any)
                  if (onVendorClick) {
                    onVendorClick(v.id)
                  }
                },
              }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
