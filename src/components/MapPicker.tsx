"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapPickerProps {
  position?: [number, number];
  onPositionChange?: (lat: number, lng: number) => void;
  vendors?: { id: number; name: string; lat: number; lng: number }[];
  onVendorClick?: (id: number) => void;
  className?: string;
}

function LocationMarker({ position, onPositionChange }: { position: [number, number], onPositionChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return position[0] === 0 ? null : (
    <Marker position={position} icon={icon}></Marker>
  )
}

export default function MapPicker({ position, onPositionChange, vendors, onVendorClick, className }: MapPickerProps) {
  // Center map on Bali roughly
  const defaultCenter: [number, number] = [-8.409518, 115.188919]; 
  const center = position && position[0] !== 0 ? position : defaultCenter;

  return (
    <div className={className || "h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0"}>
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} attributionControl={false} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && onPositionChange && (
          <LocationMarker position={position} onPositionChange={onPositionChange} />
        )}
        {vendors && vendors.map((v) => (
          <Marker 
            key={v.id} 
            position={[v.lat, v.lng]} 
            icon={icon} 
            eventHandlers={{ 
              click: () => {
                if (onVendorClick) onVendorClick(v.id)
              } 
            }}
          >
            <Popup>{v.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
