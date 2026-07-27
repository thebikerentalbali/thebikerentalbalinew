"use client"

import { useMemo, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

interface MapPickerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

export default function MapPicker({ position, onPositionChange }: MapPickerProps) {
  // Center map on Bali roughly
  const defaultCenter = useMemo(() => ({ lat: -8.409518, lng: 115.188919 }), []);
  
  const center = useMemo(() => (
    position[0] !== 0 ? { lat: position[0], lng: position[1] } : defaultCenter
  ), [position, defaultCenter]);

  // Using the API key from environment variable
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places']
  })

  const onClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onPositionChange(e.latLng.lat(), e.latLng.lng())
    }
  }, [onPositionChange]);

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={11}
          onClick={onClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            scrollwheel: false,
          }}
        >
          {position[0] !== 0 && (
            <Marker position={{ lat: position[0], lng: position[1] }} />
          )}
        </GoogleMap>
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-500">
          Loading Map...
        </div>
      )}
    </div>
  )
}
