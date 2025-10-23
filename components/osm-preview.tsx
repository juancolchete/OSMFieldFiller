"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { OsmNode } from "@/types/osm"

interface OSMPreviewProps {
  osmData: OsmNode | null
}

export function OSMPreview({ osmData }: OSMPreviewProps) {
  if (!osmData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OSM Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No OSM data to preview. Upload an XML file or fill the form.</p>
        </CardContent>
      </Card>
    )
  }

  const { id, lat, lon, tags } = osmData

  return (
    <Card>
      <CardHeader>
        <CardTitle>OSM Data Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Node Details</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">ID</TableCell>
                <TableCell>{id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Latitude</TableCell>
                <TableCell>{lat}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Longitude</TableCell>
                <TableCell>{lon}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Tags</h3>
          {Object.keys(tags).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(tags).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No tags available.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
