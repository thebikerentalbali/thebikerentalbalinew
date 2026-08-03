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
  vendors?: { id: number; name: string; lat: number; lng: number; initials?: string; rating?: number; logo?: string }[];
  onVendorClick?: (id: number) => void;
  className?: string;
}

const getVendorIcon = (vendor: { name: string; initials?: string; rating?: number; logo?: string }) => {
  const initials = vendor.initials || vendor.name.substring(0, 2).toUpperCase();
  const ratingHtml = `<div class="flex items-center gap-0.5 mt-0.5 text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><span class="text-[10px] font-bold">5.0</span></div>`;

  const logoHtml = vendor.logo 
    ? `<img src="${vendor.logo}" alt="${vendor.name}" class="w-full h-full object-cover rounded-full" />`
    : `<span class="font-bold text-gray-800 text-[10px]">${initials}</span>`;

  const html = `
    <div class="relative flex items-center gap-2 bg-white rounded-full pr-3 p-1 shadow-xl border border-gray-100 hover:scale-105 transition-transform cursor-pointer" style="width: max-content;">
      <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-[2px] shrink-0 shadow-sm">
        <div class="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
          ${logoHtml}
        </div>
      </div>
      <div class="flex flex-col py-0.5 pr-1">
        <span class="text-[12px] font-extrabold text-gray-900 leading-none tracking-tight">${vendor.name}</span>
        ${ratingHtml}
      </div>
      <div class="absolute -bottom-1.5 left-5 w-3 h-3 bg-white transform rotate-45 border-r border-b border-gray-100 -z-10"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'bg-transparent border-none',
    iconSize: [140, 40],
    iconAnchor: [24, 44],
  });
};

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
            icon={getVendorIcon(v)} 
            eventHandlers={{ 
              click: () => {
                if (onVendorClick) onVendorClick(v.id)
              } 
            }}
          >
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
