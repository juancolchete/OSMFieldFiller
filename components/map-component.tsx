"use client"

import { useEffect, useState, useCallback } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import { MapSearch } from "@/components/map-search"
import { Maximize2, Minimize2, Map, Satellite, Layers } from "lucide-react"
import { createPortal } from "react-dom"

let L: any = null

interface MapComponentProps {
  initialLat: number
  initialLon: number
  onLocationSelect: (lat: string, lon: string) => void
}

// Component to handle map click events
function LocationMarker({
  onLocationSelect,
  currentPosition,
  leafletIcon,
}: {
  onLocationSelect: (lat: number, lng: number) => void
  currentPosition: [number, number]
  leafletIcon: any
}) {
  const [position, setPosition] = useState<any | null>(null)

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  // Update position when currentPosition changes
  useEffect(() => {
    if (currentPosition && L) {
      setPosition(new L.LatLng(currentPosition[0], currentPosition[1]))
    }
  }, [currentPosition])

  return position === null ? null : <Marker position={position} icon={leafletIcon} />
}

// Component to update map view when search result is selected
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng], 16)
  }, [map, lat, lng])

  return null
}

// Component to handle map resize
function MapResizer({ trigger }: { trigger: number }) {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize(true)
      map.getContainer().focus()
    }, 150)

    return () => clearTimeout(timer)
  }, [trigger, map])

  return null
}

// Map content component that can be rendered in different containers
function MapContent({
  mapCenter,
  onLocationUpdate,
  onSearchResultSelect,
  isFullscreen,
  resizeTrigger,
  mapType,
  leafletIcon,
}: {
  mapCenter: [number, number]
  onLocationUpdate: (lat: number, lng: number) => void
  onSearchResultSelect: (lat: string, lon: string, name?: string) => void
  isFullscreen: boolean
  resizeTrigger: number
  mapType: "street" | "satellite" | "hybrid"
  leafletIcon: any
}) {
  return (
    <MapContainer
      center={mapCenter}
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
      <Marker position={mapCenter} icon={leafletIcon} />
      <LocationMarker onLocationSelect={onLocationUpdate} currentPosition={mapCenter} leafletIcon={leafletIcon} />
      <MapUpdater lat={mapCenter[0]} lng={mapCenter[1]} />
      <MapResizer trigger={resizeTrigger} />
    </MapContainer>
  )
}

export function MapComponent({ initialLat, initialLon, onLocationSelect }: MapComponentProps) {
  const [mounted, setMounted] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [leafletIcon, setLeafletIcon] = useState<any>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([initialLat, initialLon])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [resizeTrigger, setResizeTrigger] = useState(0)
  const [mapType, setMapType] = useState<"street" | "satellite" | "hybrid">("hybrid")

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined") {
        // Import Leaflet CSS
        const leafletCSS = document.createElement("link")
        leafletCSS.rel = "stylesheet"
        leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(leafletCSS)

        // Import Leaflet JS
        const leafletModule = await import("leaflet")
        L = leafletModule.default

        // Fix Leaflet marker icon issue in Next.js
        const icon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })

        setLeafletIcon(icon)
        setLeafletLoaded(true)
      }
    }

    loadLeaflet()
    setMounted(true)
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

  useEffect(() => {
    // Update map center when initialLat or initialLon props change
    const newLat = Number.parseFloat(initialLat.toString())
    const newLon = Number.parseFloat(initialLon.toString())

    if (!isNaN(newLat) && !isNaN(newLon)) {
      const newCenter: [number, number] = [newLat, newLon]
      setMapCenter(newCenter)
    }
  }, [initialLat, initialLon])

  // Handle marker position updates
  const handleLocationUpdate = useCallback(
    (lat: number, lng: number) => {
      const newCenter: [number, number] = [lat, lng]
      setMapCenter(newCenter)
      onLocationSelect(lat.toFixed(7), lng.toFixed(7))
    },
    [onLocationSelect],
  )

  // Handle search result selection
  const handleSearchResultSelect = useCallback(
    (lat: string, lon: string, name?: string) => {
      console.log("Search result selected:", { lat, lon, name })
      const latNum = Number.parseFloat(lat)
      const lonNum = Number.parseFloat(lon)

      if (!isNaN(latNum) && !isNaN(lonNum)) {
        const newCenter: [number, number] = [latNum, lonNum]
        setMapCenter(newCenter)
        onLocationSelect(lat, lon)
      }
    },
    [onLocationSelect],
  )

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

  if (!mounted || !leafletLoaded || !leafletIcon) {
    return (
      <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-md border">Loading map...</div>
    )
  }

  const mapTypeInfo = getMapTypeInfo()

  // Normal map view
  const normalMapView = (
    <div className="space-y-2">
      <div className="mb-3">
        <MapSearch onLocationSelect={handleSearchResultSelect} />
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

        <MapContent
          mapCenter={mapCenter}
          onLocationUpdate={handleLocationUpdate}
          onSearchResultSelect={handleSearchResultSelect}
          isFullscreen={false}
          resizeTrigger={resizeTrigger}
          mapType={mapType}
          leafletIcon={leafletIcon}
        />
      </div>
    </div>
  )

  // Fullscreen map view
  const fullscreenMapView = (
    <div className="fixed inset-0 z-[9999] bg-white">
      {/* Search bar in fullscreen mode */}
      <div className="absolute top-4 left-4 z-[1000] w-80">
        <MapSearch onLocationSelect={handleSearchResultSelect} />
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
        <MapContent
          mapCenter={mapCenter}
          onLocationUpdate={handleLocationUpdate}
          onSearchResultSelect={handleSearchResultSelect}
          isFullscreen={true}
          resizeTrigger={resizeTrigger}
          mapType={mapType}
          leafletIcon={leafletIcon}
        />
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
