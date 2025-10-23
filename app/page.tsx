"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parseOsmXml } from "@/lib/osm-parser"

// Dynamically import client-side components to prevent SSR issues
const DynamicMapComponent = dynamic(() => import("@/components/map-component").then((mod) => mod.MapComponent), {
  ssr: false,
})
const DynamicOsmForm = dynamic(() => import("@/components/osm-form").then((mod) => mod.OsmForm), { ssr: false })
const DynamicOsmPreview = dynamic(() => import("@/components/osm-preview").then((mod) => mod.OSMPreview), {
  ssr: false,
})
const DynamicGithubIssueForm = dynamic(
  () => import("@/components/github-issue-form").then((mod) => mod.GithubIssueForm),
  { ssr: false },
)
const DynamicXmlUploader = dynamic(() => import("@/components/xml-uploader").then((mod) => mod.XmlUploader), {
  ssr: false,
})

export default function Home() {
  const [osmData, setOsmData] = useState<any>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: string; lon: string } | null>(null)
  const [activeTab, setActiveTab] = useState("form")

  const handleXmlUpload = (xmlContent: string) => {
    try {
      const parsedData = parseOsmXml(xmlContent)
      setOsmData(parsedData)
      setSelectedLocation({ lat: parsedData.lat, lon: parsedData.lon })
      console.log("Parsed OSM Data:", parsedData)
    } catch (error) {
      console.error("Error parsing XML:", error)
      alert("Failed to parse XML. Please ensure it's a valid OSM XML format.")
    }
  }

  const handleLocationSelect = (lat: string, lon: string) => {
    setSelectedLocation({ lat, lon })
    // Also update the osmData if it exists, to reflect the new coordinates
    setOsmData((prev: any) => ({
      ...prev,
      lat,
      lon,
    }))
  }

  const handleOsmDataChange = (updatedData: any) => {
    setOsmData(updatedData)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">OSM Field Filler</h1>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload OSM XML</CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicXmlUploader onFileUpload={handleXmlUpload} />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="github">Create GitHub Issue</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <DynamicOsmForm osmData={osmData} onOsmDataChange={handleOsmDataChange} selectedLocation={selectedLocation} />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>OSM Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicOsmPreview osmData={osmData} />
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Map Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full rounded-md overflow-hidden">
                <DynamicMapComponent
                  initialLat={Number.parseFloat(selectedLocation?.lat || "0")}
                  initialLon={Number.parseFloat(selectedLocation?.lon || "0")}
                  onLocationSelect={handleLocationSelect}
                  markerLat={selectedLocation?.lat ? Number.parseFloat(selectedLocation.lat) : undefined}
                  markerLon={selectedLocation?.lon ? Number.parseFloat(selectedLocation.lon) : undefined}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="github" className="mt-6">
          <DynamicGithubIssueForm
            osmData={osmData}
            locationName={osmData?.tags?.name || "New Location"}
            onBack={() => setActiveTab("form")}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
