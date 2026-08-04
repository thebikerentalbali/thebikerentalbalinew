"use client"

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export interface MapVendorItem {
  id: number | string;
  name: string;
  lat: number | string;
  lng: number | string;
  initials?: string;
  rating?: number | string;
  logo?: string;
  logo_url?: string;
  image_url?: string;
  address?: string;
  phone?: string;
  delivery_area?: string;
}

interface MapPickerProps {
  position?: [number, number];
  onPositionChange?: (lat: number, lng: number) => void;
  vendors?: MapVendorItem[];
  selectedVendorId?: number | string | null;
  onVendorClick?: (id: number | string) => void;
  className?: string;
  zoom?: number;
  interactive?: boolean;
}

const getVendorIcon = (
  vendor: MapVendorItem,
  isSelected: boolean = false
) => {
  const name = vendor.name || 'Vendor';
  const initials = vendor.initials || name.substring(0, 2).toUpperCase();
  const logo = vendor.logo || vendor.logo_url || vendor.image_url;
  const rating = vendor.rating ? Number(vendor.rating).toFixed(1) : '5.0';

  const ratingHtml = `
    <div style="display:flex;align-items:center;gap:2px;margin-top:1px;">
      <svg style="width:10px;height:10px;fill:#FBBF24;color:#FBBF24;" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span style="font-size:10px;font-weight:800;color:#111827;">${rating}</span>
    </div>
  `;

  const logoHtml = logo
    ? `<img src="${logo}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:9999px;" onerror="this.style.display='none'" />`
    : `<span style="font-weight:900;color:#111827;font-size:10px;">${initials}</span>`;

  const borderClass = isSelected 
    ? 'background:#000000;color:#ffffff;border:2px solid #000000;transform:scale(1.1);box-shadow:0 10px 25px -5px rgba(0,0,0,0.4);' 
    : 'background:#ffffff;color:#111827;border:1.5px solid #e5e7eb;box-shadow:0 8px 20px -4px rgba(0,0,0,0.15);';

  const nameColor = isSelected ? '#ffffff' : '#111827';
  const arrowBg = isSelected ? '#000000' : '#ffffff';

  const html = `
    <div style="position:relative;display:flex;align-items:center;gap:8px;padding:3px 10px 3px 4px;border-radius:9999px;cursor:pointer;white-space:nowrap;transition:all 0.2s ease;${borderClass}">
      <div style="width:30px;height:30px;border-radius:9999px;background:linear-gradient(135deg, #FBBF24, #F97316);padding:2px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        <div style="width:100%;height:100%;background:#ffffff;border-radius:9999px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          ${logoHtml}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;line-height:1.1;padding-right:2px;">
        <span style="font-size:11px;font-weight:900;color:${nameColor};max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
        ${ratingHtml}
      </div>
      <div style="position:absolute;bottom:-5px;left:18px;width:10px;height:10px;background:${arrowBg};transform:rotate(45deg);z-index:-1;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'leaflet-vendor-custom-pin',
    iconSize: [140, 38],
    iconAnchor: [24, 42],
    popupAnchor: [45, -38],
  });
};

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
  const defaultCenter: [number, number] = useMemo(() => [-8.5069, 115.2625], []); 
  
  // Validated vendor list
  const validVendors = useMemo(() => {
    if (!vendors || !Array.isArray(vendors)) return [];
    return vendors
      .map(v => ({
        ...v,
        lat: Number(v.lat),
        lng: Number(v.lng),
      }))
      .filter(v => !isNaN(v.lat) && !isNaN(v.lng) && v.lat !== 0 && v.lng !== 0);
  }, [vendors]);

  const mapCenter: [number, number] = useMemo(() => {
    if (position && position[0] !== 0 && position[1] !== 0 && !isNaN(position[0]) && !isNaN(position[1])) {
      return [Number(position[0]), Number(position[1])];
    }
    if (selectedVendorId && validVendors.length > 0) {
      const selected = validVendors.find(v => String(v.id) === String(selectedVendorId));
      if (selected) return [selected.lat, selected.lng];
    }
    if (validVendors.length === 1) {
      return [validVendors[0].lat, validVendors[0].lng];
    }
    return defaultCenter;
  }, [position, selectedVendorId, validVendors, defaultCenter]);

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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController center={mapCenter} zoom={validVendors.length === 1 ? 14 : zoom} />

        {position && onPositionChange && (
          <LocationMarker position={position} onPositionChange={onPositionChange} />
        )}

        {validVendors.map((v) => {
          const isSelected = selectedVendorId != null && String(selectedVendorId) === String(v.id);
          const logo = v.logo || v.logo_url || v.image_url;

          return (
            <Marker 
              key={v.id} 
              position={[v.lat, v.lng]} 
              icon={getVendorIcon(v, isSelected)} 
              eventHandlers={{ 
                click: (e) => {
                  L.DomEvent.stopPropagation(e as any);
                  if (onVendorClick) {
                    onVendorClick(v.id);
                  }
                },
              }}
            >
              <Popup className="custom-vendor-popup" closeButton={false}>
                <div className="p-3 min-w-[200px] max-w-[240px] font-sans">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt={v.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{v.initials || 'VN'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-gray-900 leading-tight truncate">
                        {v.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium truncate">
                        {v.address || 'Bali Partner'}
                      </p>
                    </div>
                  </div>

                  {v.delivery_area && (
                    <p className="text-[10px] text-gray-600 font-medium mb-2.5 bg-gray-50 p-1.5 rounded-lg line-clamp-2 border border-gray-100">
                      🚚 {v.delivery_area}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (onVendorClick) onVendorClick(v.id);
                    }}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>View Profile & Scooters</span>
                    <span>→</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  )
}
