"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"

interface OSMExportProps {
  osmData: any
}

export function OSMExport({ osmData }: OSMExportProps) {
  const generateXml = (data: any) => {
    if (!data) return ""

    const { lat, lon, tags } = data
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<osm version="0.6" generator="OSM Field Filler">\n`
    xml += `  <node id="-1" lat="${lat}" lon="${lon}" changeset="-1" uid="-1" user="v0_user" visible="true" version="1">\n`

    for (const key in tags) {
      if (tags.hasOwnProperty(key) && tags[key]) {
        xml += `    <tag k="${key}" v="${tags[key]}"/>\n`
      }
    }

    xml += `  </node>\n`
    xml += `</osm>`
    return xml
  }

  const xmlContent = generateXml(osmData)

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "osm_data.xml"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export OSM XML</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={xmlContent}
          readOnly
          rows={15}
          className="font-mono text-sm bg-gray-50 p-4 rounded-md"
          placeholder="Generated OSM XML will appear here..."
        />
        <Button onClick={handleDownload} disabled={!osmData}>
          <Download className="mr-2 h-4 w-4" />
          Download XML
        </Button>
      </CardContent>
    </Card>
  )
}
