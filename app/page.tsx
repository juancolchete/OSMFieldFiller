"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OsmForm } from "@/components/osm-form" // Corrected import name: OsmForm
import { OSMPreview } from "@/components/osm-preview"
import { OSMExport } from "@/components/osm-export"
import { XmlUploader } from "@/components/xml-uploader"
import { ImageUploader } from "@/components/image-uploader"
import { GithubIssueForm } from "@/components/github-issue-form"
import { MapPicker } from "@/components/map-picker"
import dynamic from "next/dynamic"

// Dynamically import MapComponent to ensure it's only rendered on the client-side
const MapComponent = dynamic(() => import("@/components/map-component").then((mod) => mod.MapComponent), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-md border">Loading map...</div>
  ),
})

export default function Home() {
  const [osmData, setOsmData] = useState<any>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: string; lon: string } | null>(null)
  const [activeTab, setActiveTab] = useState("form")

  useEffect(() => {
    // Set default location to San Francisco if not already set
    if (!selectedLocation) {
      setSelectedLocation({ lat: "37.7749", lon: "-122.4194" }) // San Francisco coordinates
    }
  }, [selectedLocation])

  const handleOsmDataChange = (data: any) => {
    setOsmData(data)
  }

  const handleLocationSelect = (lat: string, lon: string) => {
    setSelectedLocation({ lat, lon })
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle>OSM Field Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="form">Form</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="export">Export</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="form" className="mt-4">
                  <OsmForm // Corrected component name
                    osmData={osmData}
                    onOsmDataChange={handleOsmDataChange}
                    selectedLocation={selectedLocation}
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <OSMPreview osmData={osmData} />
                </TabsContent>
                <TabsContent value="export" className="mt-4">
                  <OSMExport osmData={osmData} />
                </TabsContent>
                <TabsContent value="upload" className="mt-4 space-y-4">
                  <XmlUploader onXmlUploaded={handleOsmDataChange} />
                  <ImageUploader />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Map Location</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLocation && (
                <MapComponent
                  initialLat={Number.parseFloat(selectedLocation.lat)}
                  initialLon={Number.parseFloat(selectedLocation.lon)}
                  onLocationSelect={handleLocationSelect}
                />
              )}
              {!selectedLocation && (
                <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-md border">
                  Select a location on the map or search.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle>Report an Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <GithubIssueForm />
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Map Picker (Experimental)</CardTitle>
            </CardHeader>
            <CardContent>
              <MapPicker />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
