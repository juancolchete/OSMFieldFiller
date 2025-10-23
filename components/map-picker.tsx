"use client"

import { useState, useEffect, useCallback } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Maximize2, Minimize2, Map, Satellite, Layers } from "lucide-react"
import { createPortal } from "react-dom"
import type { LatLngExpression, Icon, PointExpression } from "leaflet"

interface MapPickerProps {
  initialLat?: number
  initialLon?: number
  onLocationSelect?: (lat: string, lon: string) => void
}

// Custom hook for handling map clicks and updating marker position
function LocationMarker({
  onLocationSelect,
  markerPosition,
  customIcon,
}: {
  onLocationSelect?: (lat: string, lon: string) => void
  markerPosition: LatLngExpression | null
  customIcon: Icon | null
}) {
  useMapEvents({
    click(e) {
      onLocationSelect?.(e.latlng.lat.toString(), e.latlng.lng.toString())
    },
  })

  return markerPosition && customIcon ? <Marker position={markerPosition} icon={customIcon} /> : null
}

export function MapPicker({ initialLat = 37.7749, initialLon = -122.4194, onLocationSelect }: MapPickerProps) {
  const [mounted, setMounted] = useState(false)
  const [center, setCenter] = useState<LatLngExpression>([initialLat, initialLon])
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>([initialLat, initialLon])
  const [customIcon, setCustomIcon] = useState<Icon | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [resizeTrigger, setResizeTrigger] = useState(0)
  const [mapType, setMapType] = useState<"street" | "satellite" | "hybrid">("hybrid")

  useEffect(() => {
    // Dynamically import Leaflet's L object and set up the default icon
    import("leaflet")
      .then((L) => {
        // Move CSS imports here to ensure they are only loaded client-side
        import("leaflet/dist/leaflet.css")
        import("leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css")
        import("leaflet-defaulticon-compatibility")

        const defaultIcon = new L.Icon({
          iconUrl: "/marker-icon.png",
          iconRetinaUrl: "/marker-icon-2x.png",
          shadowUrl: "/marker-shadow.png",
          iconSize: [25, 41] as PointExpression,
          iconAnchor: [12, 41] as PointExpression,
          popupAnchor: [1, -34] as PointExpression,
          shadowSize: [41, 41] as PointExpression,
        })
        setCustomIcon(defaultIcon)
      })
      .catch((error) => console.error("Error loading Leaflet L object:", error))
  }, [])

  useEffect(() => {
    setCenter([initialLat, initialLon])
    setMarkerPosition([initialLat, initialLon])
  }, [initialLat, initialLon])

  const handleMapClick = useCallback(
    (lat: string, lon: string) => {
      const newLat = Number.parseFloat(lat)
      const newLon = Number.parseFloat(lon)
      if (!isNaN(newLat) && !isNaN(newLon)) {
        setMarkerPosition([newLat, newLon])
        setCenter([newLat, newLon])
        onLocationSelect?.(lat, lon)
      }
    },
    [onLocationSelect],
  )

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const newState = !prev
      setTimeout(() => {
        setResizeTrigger((prev) => prev + 1)
      }, 100)
      return newState
    })
  }, [])

  const cycleMapType = useCallback(() => {
    setMapType((prev) => {
      if (prev === "hybrid") return "street"
      if (prev === "street") return "satellite"
      return "hybrid"
    })
    setResizeTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
        setTimeout(() => {
          setResizeTrigger((prev) => prev + 1)
        }, 100)
      }
    }

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isFullscreen])

  const getMapTypeInfo = () => {
    switch (mapType) {
      case "street":
        return { icon: <Map className="h-4 w-4 text-gray-700" />, title: "Street view - Click for satellite" }
      case "satellite":
        return { icon: <Satellite className="h-4 w-4 text-gray-700" />, title: "Satellite view - Click for hybrid" }
      case "hybrid":
        return { icon: <Layers className="h-4 w-4 text-gray-700" />, title: "Hybrid view - Click for street" }
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-md border">Loading map...</div>
    )
  }

  const mapTypeInfo = getMapTypeInfo()

  const renderMapContent = (isFull: boolean) => (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full w-full"
      key={`map-picker-${isFull ? "fullscreen" : "normal"}-${resizeTrigger}-${mapType}`}
    >
      {mapType === "street" ? (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
      ) : mapType === "satellite" ? (
        <TileLayer
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />
      ) : (
        <>
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            opacity={0.6}
            maxZoom={19}
          />
        </>
      )}
      {customIcon && (
        <LocationMarker onLocationSelect={handleMapClick} markerPosition={markerPosition} customIcon={customIcon} />
      )}
    </MapContainer>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Location on Map</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" value={markerPosition ? markerPosition[0].toFixed(7) : ""} readOnly className="mt-1" />
          </div>
          <div className="flex-1">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              value={markerPosition ? markerPosition[1].toFixed(7) : ""}
              readOnly
              className="mt-1"
            />
          </div>
        </div>
        <div className="h-[300px] rounded-md overflow-hidden border relative">
          <div className="absolute top-2 right-2 z-[1000] flex gap-2">
            <button
              onClick={cycleMapType}
              className="bg-white/90 hover:bg-white border border-gray-300 rounded-md p-2 shadow-sm transition-colors"
              title={mapTypeInfo.title}
            >
              {mapTypeInfo.icon}
            </button>
            <button
              onClick={toggleFullscreen}
              className="bg-white/90 hover:bg-white border border-gray-300 rounded-md p-2 shadow-sm transition-colors"
              title="Enter fullscreen"
            >
              <Maximize2 className="h-4 w-4 text-gray-700" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 z-[1000] bg-black/70 text-white text-xs px-2 py-1 rounded">
            {mapType === "street" && "Street Map"}
            {mapType === "satellite" && "Satellite"}
            {mapType === "hybrid" && "Satellite + Streets"}
          </div>
          {renderMapContent(false)}
        </div>
        {isFullscreen &&
          typeof document !== "undefined" &&
          createPortal(
            <div className="fixed inset-0 z-[9999] bg-white">
              <div className="absolute top-4 right-4 z-[1000] flex gap-2">
                <button
                  onClick={cycleMapType}
                  className="bg-white/90 hover:bg-white border border-gray-300 rounded-md p-2 shadow-sm transition-colors"
                  title={mapTypeInfo.title}
                >
                  {mapTypeInfo.icon}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="bg-white/90 hover:bg-white border border-gray-300 rounded-md p-2 shadow-sm transition-colors"
                  title="Exit fullscreen (Esc)"
                >
                  <Minimize2 className="h-4 w-4 text-gray-700" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 z-[1000] bg-black/70 text-white text-sm px-3 py-2 rounded">
                {mapType === "street" && "Street Map"}
                {mapType === "satellite" && "Satellite"}
                {mapType === "hybrid" && "Satellite + Streets"}
              </div>
              {renderMapContent(true)}
            </div>,
            document.body,
          )}
      </CardContent>
    </Card>
  )
}
