"use client"

import type { OsmNode } from "@/types/osm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OsmPreviewProps {
  data: OsmNode
}

export function OsmPreview({ data }: OsmPreviewProps) {
  // Find the image tag if it exists
  const imageTag = data.tags.find((tag) => tag.k === "image")
  const nameTag = data.tags.find((tag) => tag.k === "name")
  const descriptionTag = data.tags.find((tag) => tag.k === "description")

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Preview</h2>

      <Card>
        <CardHeader>
          <CardTitle>{nameTag?.v || "Unnamed Location"}</CardTitle>
        </CardHeader>
        <CardContent>
          {imageTag && (
            <div className="mb-4 relative h-48 w-full overflow-hidden rounded-md">
              <img
                src={imageTag.v || "/placeholder.svg"}
                alt={nameTag?.v || "Location image"}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {descriptionTag && <p className="text-sm text-muted-foreground mb-4">{descriptionTag.v}</p>}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Latitude:</div>
            <div>{data.lat}</div>

            <div className="font-medium">Longitude:</div>
            <div>{data.lon}</div>

            {data.tags
              .filter((tag) => tag.k !== "image" && tag.k !== "description")
              .map((tag, index) => (
                <>
                  <div key={`key-${index}`} className="font-medium">
                    {tag.k}:
                  </div>
                  <div key={`value-${index}`}>{tag.v}</div>
                </>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw XML Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <pre className="text-xs font-mono">
              {`<node id="${data.id}" lat="${data.lat}" lon="${data.lon}" version="${data.version}">
${data.tags.map((tag) => `  <tag k="${tag.k}" v="${tag.v.replace(/"/g, "&quot;")}"/>`).join("\n")}
</node>`}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
