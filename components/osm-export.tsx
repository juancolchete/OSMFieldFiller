// This file was added in a previous turn to implement the OSM export.
// It is included here in full as per instructions.

"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Download } from "lucide-react"
import { useState } from "react"

interface OSMExportProps {
  osmData: any // This should be the raw key=value string
}

export function OSMExport({ osmData }: OSMExportProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(osmData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadText = () => {
    const blob = new Blob([osmData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `osm_tags_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={osmData || "No data to export."}
        readOnly
        rows={15}
        className="font-mono text-sm bg-gray-50"
        placeholder="Generated OSM tags will appear here..."
      />
      <div className="flex gap-2">
        <Button onClick={copyToClipboard} className="flex-1">
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy to Clipboard"}
        </Button>
        <Button onClick={downloadText} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download .txt
        </Button>
      </div>
    </div>
  )
}
