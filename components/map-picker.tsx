// This file was added in a previous turn to implement the map picker.
// It is included here in full as per instructions.

"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"
import L from "leaflet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MapSearch } from "@/components/map-search"

interface MapPickerProps {
  initialLat?: number
  initialLon?: number
  onLocationSelect?: (lat: string, lon: string) => void
}

function DraggableMarker({
  initialLat,
  initialLon,
  onLocationChange,
}: {
  initialLat: number
  initialLon: number
  onLocationChange: (lat: string, lon: string) => void
}) {
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(initialLat, initialLon))
  const markerRef = L.useRef<L.Marker>(null)

  const eventHandlers = L.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const newPos = marker.getLatLng()
          setPosition(newPos)
          onLocationChange(newPos.lat.toFixed(7), newPos.lng.toFixed(7))
        }
      },
    }),
    [onLocationChange],
  )

  // Update marker position if initialLat/Lon props change
  useEffect(() => {
    setPosition(new L.LatLng(initialLat, initialLon))
  }, [initialLat, initialLon])

  return <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef}></Marker>
}

export function MapPicker({ initialLat = -19.8430171, initialLon = -43.9191272, onLocationSelect }: MapPickerProps) {
  const [lat, setLat] = useState(initialLat)
  const [lon, setLon] = useState(initialLon)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)

  useEffect(() => {
    setLat(initialLat)
    setLon(initialLon)
  }, [initialLat, initialLon])

  const handleMarkerLocationChange = (newLat: string, newLon: string) => {
    setLat(Number.parseFloat(newLat))
    setLon(Number.parseFloat(newLon))
    onLocationSelect?.(newLat, newLon)
  }

  const handleSearchSelect = (selectedLat: string, selectedLon: string) => {
    const newLat = Number.parseFloat(selectedLat)
    const newLon = Number.parseFloat(selectedLon)
    setLat(newLat)
    setLon(newLon)
    onLocationSelect?.(selectedLat, selectedLon)
    if (mapInstance) {
      mapInstance.setView([newLat, newLon], 15) // Adjust zoom level as needed
    }
  }

  return (
    <div className="space-y-4">
      <MapSearch onSelectLocation={handleSearchSelect} />
      <div className="h-[400px] w-full rounded-md border overflow-hidden">
        <MapContainer
          center={[lat, lon]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
          whenCreated={setMapInstance}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker initialLat={lat} initialLon={lon} onLocationChange={handleMarkerLocationChange} />
        </MapContainer>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="picker-latitude">Latitude</Label>
          <Input id="picker-latitude" value={lat.toFixed(7)} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="picker-longitude">Longitude</Label>
          <Input id="picker-longitude" value={lon.toFixed(7)} readOnly />
        </div>
      </div>
      {onLocationSelect && (
        <Button onClick={() => onLocationSelect(lat.toFixed(7), lon.toFixed(7))} className="w-full">
          Use This Location
        </Button>
      )}
    </div>
  )
}
