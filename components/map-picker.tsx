"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import the map components with no SSR
const MapComponent = dynamic(() => import("@/components/map-component").then((mod) => mod.MapComponent), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-md border">
      <Skeleton className="h-full w-full rounded-md" />
    </div>
  ),
})

interface MapPickerProps {
  initialLat: number
  initialLon: number
  onLocationSelect: (lat: string, lon: string) => void
}

export function MapPicker({ initialLat, initialLon, onLocationSelect }: MapPickerProps) {
  return <MapComponent initialLat={initialLat} initialLon={initialLon} onLocationSelect={onLocationSelect} />
}
