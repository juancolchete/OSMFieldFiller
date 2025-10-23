"use client"

import { useEffect, useState, useCallback } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import { MapSearch } from "@/components/map-search"
import { Maximize2, Minimize2, Map, Satellite, Layers } from "lucide-react"
import { createPortal } from "react-dom"
import type { LatLngExpression, Icon, PointExpression } from "leaflet"

interface MapComponentProps {
  initialLat: number
  initialLon: number
  onLocationSelect: (lat: string, lon: string) => void
  markerLat?: number
  markerLon?: number
}

// Custom hook for handling map clicks and updating marker position
function LocationMarker({
  onLocationSelect,
  markerPosition,
  customIcon,
}: {
  onLocationSelect: (lat: string, lon: string) => void
  markerPosition: LatLngExpression | null
  customIcon: Icon | null
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat.toString(), e.latlng.lng.toString())
    },
  })

  return markerPosition && customIcon ? <Marker position={markerPosition} icon={customIcon} /> : null
}

export function MapComponent({ initialLat, initialLon, onLocationSelect, markerLat, markerLon }: MapComponentProps) {
  const [mounted, setMounted] = useState(false)
  const [center, setCenter] = useState<LatLngExpression>([initialLat, initialLon])
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>(
    markerLat && markerLon ? [markerLat, markerLon] : null,
  )
  const [customIcon, setCustomIcon] = useState<Icon | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [resizeTrigger, setResizeTrigger] = useState(0)
  const [mapType, setMapType] = useState<"street" | "satellite" | "hybrid">("hybrid")
  const [leafletReady, setLeafletReady] = useState(false)

  useEffect(() => {
    // Update center if initialLat/Lon change
    setCenter([initialLat, initialLon])
  }, [initialLat, initialLon])

  useEffect(() => {
    // Update marker position if markerLat/Lon change
    if (markerLat !== undefined && markerLon !== undefined) {
      setMarkerPosition([markerLat, markerLon])
    } else {
      setMarkerPosition(null)
    }
  }, [markerLat, markerLon])

  useEffect(() => {
    // Dynamically import Leaflet's L object and set up the default icon
    // This ensures L is available only on the client side.
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
        setLeafletReady(true) // Set leafletReady to true once L and icon are ready
      })
      .catch((error) => console.error("Error loading Leaflet L object:", error))
  }, [])

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const newState = !prev
      // Trigger a resize after state change
      setTimeout(() => {
        setResizeTrigger((prev) => prev + 1)
      }, 100)
      return newState
    })
  }, [])

  // Handle map type cycling
  const cycleMapType = useCallback(() => {
    setMapType((prev) => {
      if (prev === "hybrid") return "street"
      if (prev === "street") return "satellite"
      return "hybrid"
    })
    setResizeTrigger((prev) => prev + 1)
  }, [])

  // Handle escape key to exit fullscreen
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

  // Get map type icon and title
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

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !leafletReady) {
    return (
      <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-md border">Loading map...</div>
    )
  }

  const mapTypeInfo = getMapTypeInfo()

  // Normal map view
  const normalMapView = (
    <div className="space-y-2">
      <div className="mb-3">
        <MapSearch onLocationSelect={onLocationSelect} />
      </div>

      <div className="h-[350px] rounded-md overflow-hidden border relative">
        {/* Map controls */}
        <div className="absolute top-2 right-2 z-[1000] flex gap-2">
          {/* Map type toggle button */}
          <button
            onClick={cycleMapType}
            className="bg-white/90 hover:bg-white border border-gray-300 rounded-md p-2 shadow-sm transition-colors"
            title={mapTypeInfo.title}
          >
            {mapTypeInfo.icon}
          </button>

          {/* Fullscreen toggle button */}
          <button
            onClick={toggleFullscreen}
            className="bg-white/90 hover:bg-white border border-gray-300 rounded-md p-2 shadow-sm transition-colors"
            title="Enter fullscreen"
          >
            <Maximize2 className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        {/* Map type indicator */}
        <div className="absolute bottom-2 left-2 z-[1000] bg-black/70 text-white text-xs px-2 py-1 rounded">
          {mapType === "street" && "Street Map"}
          {mapType === "satellite" && "Satellite"}
          {mapType === "hybrid" && "Satellite + Streets"}
        </div>

        <MapContainer
          center={center}
          zoom={13}
          style={{
            height: "100%",
            width: "100%",
          }}
          key={`map-${isFullscreen ? "fullscreen" : "normal"}-${resizeTrigger}-${mapType}`}
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
              {/* Hybrid view: Satellite imagery with street labels */}
              <TileLayer
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              {/* Street labels and numbers overlay */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={0.6}
                maxZoom={19}
              />
            </>
          )}
          {customIcon && (
            <LocationMarker
              onLocationSelect={onLocationSelect}
              markerPosition={markerPosition}
              customIcon={customIcon}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )

  // Fullscreen map view
  const fullscreenMapView = (
    <div className="fixed inset-0 z-[9999] bg-white">
      {/* Search bar in fullscreen mode */}
      <div className="absolute top-4 left-4 z-[1000] w-80">
        <MapSearch onLocationSelect={onLocationSelect} />
      </div>

      {/* Map controls in fullscreen */}
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        {/* Map type toggle button */}
        <button
          onClick={cycleMapType}
          className="bg-white/90 hover:bg-white border border-gray-300 rounded-md p-2 shadow-sm transition-colors"
          title={mapTypeInfo.title}
        >
          {mapTypeInfo.icon}
        </button>

        {/* Exit fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="bg-white/90 hover:bg-white border border-gray-300 rounded-md p-2 shadow-sm transition-colors"
          title="Exit fullscreen (Esc)"
        >
          <Minimize2 className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      {/* Map type indicator in fullscreen */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/70 text-white text-sm px-3 py-2 rounded">
        {mapType === "street" && "Street Map"}
        {mapType === "satellite" && "Satellite"}
        {mapType === "hybrid" && "Satellite + Streets"}
      </div>

      {/* Fullscreen map */}
      <div className="w-full h-full">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
          key={`map-${isFullscreen ? "fullscreen" : "normal"}-${resizeTrigger}-${mapType}`}
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
              {/* Hybrid view: Satellite imagery with street labels */}
              <TileLayer
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              {/* Street labels and numbers overlay */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={0.6}
                maxZoom={19}
              />
            </>
          )}
          {customIcon && (
            <LocationMarker
              onLocationSelect={onLocationSelect}
              markerPosition={markerPosition}
              customIcon={customIcon}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )

  return (
    <>
      {normalMapView}
      {isFullscreen && typeof document !== "undefined" && createPortal(fullscreenMapView, document.body)}
    </>
  )
}
