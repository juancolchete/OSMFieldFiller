// This file was added in a previous turn to implement the OSM preview.
// It is included here in full as per instructions.

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OSMPreviewProps {
  osmData: string // Expecting the key=value string
}

export function OSMPreview({ osmData }: OSMPreviewProps) {
  // Simple parsing for display - this is not a full OSM XML parser
  const parseTagsForDisplay = (data: string) => {
    if (!data) return []
    return data.split("\n").map((line) => {
      const [key, value] = line.split("=")
      return { key, value }
    })
  }

  const tags = parseTagsForDisplay(osmData)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Preview OSM Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          {tags.length > 0 ? (
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 font-semibold text-gray-700">Key</th>
                  <th className="py-2 px-4 font-semibold text-gray-700">Value</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag, index) => (
                  <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-2 px-4 font-mono text-sm text-gray-800">{tag.key}</td>
                    <td className="py-2 px-4 font-mono text-sm text-gray-600 break-all">{tag.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-muted-foreground">No OSM data to preview. Fill out the form.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
