"use client"

import { useState } from "react"
import type { OsmNode } from "@/types/osm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Copy, Download } from "lucide-react"

interface OsmExportProps {
  data: OsmNode
}

export function OsmExport({ data }: OsmExportProps) {
  const [copied, setCopied] = useState(false)

  const generateXml = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6">
  <node id="${data.id}" visible="true" version="${data.version}" lat="${data.lat}" lon="${data.lon}">
${data.tags.map((tag) => `    <tag k="${tag.k}" v="${tag.v.replace(/"/g, "&quot;")}"/>`).join("\n")}
  </node>
</osm>`
  }

  const generateJson = () => {
    const jsonData = {
      id: data.id,
      version: data.version,
      lat: data.lat,
      lon: data.lon,
      tags: Object.fromEntries(data.tags.map((tag) => [tag.k, tag.v])),
    }
    return JSON.stringify(jsonData, null, 2)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export OSM Data</CardTitle>
          <CardDescription>Export your OSM data in different formats</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="xml">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="xml">XML</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="xml">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4 mb-4">
                <pre className="text-xs font-mono whitespace-pre-wrap">{generateXml()}</pre>
              </ScrollArea>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => handleCopy(generateXml())}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy XML
                    </>
                  )}
                </Button>
                <Button className="flex-1" onClick={() => handleDownload(generateXml(), `osm_node_${data.id}.xml`)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download XML
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="json">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4 mb-4">
                <pre className="text-xs font-mono whitespace-pre-wrap">{generateJson()}</pre>
              </ScrollArea>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => handleCopy(generateJson())}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy JSON
                    </>
                  )}
                </Button>
                <Button className="flex-1" onClick={() => handleDownload(generateJson(), `osm_node_${data.id}.json`)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
