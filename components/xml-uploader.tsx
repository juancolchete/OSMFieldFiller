// This file was added in a previous turn to implement the XML uploader.
// It is included here in full as per instructions.

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import { parseOsmXml } from "@/lib/osm-parser" // Assuming this utility exists

interface XmlUploaderProps {
  onXmlUploaded: (data: any) => void
}

export function XmlUploader({ onXmlUploaded }: XmlUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an XML file to upload.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const xmlString = e.target?.result as string
        // Assuming parseOsmXml is a utility function that converts XML string to a usable data structure
        const parsedData = parseOsmXml(xmlString)
        onXmlUploaded(parsedData)
        toast({
          title: "Upload successful",
          description: "XML file parsed and loaded.",
        })
      } catch (error: any) {
        toast({
          title: "Upload failed",
          description: error.message || "Failed to parse XML file. Please ensure it's a valid OSM XML.",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
      }
    }

    reader.onerror = () => {
      setUploading(false)
      toast({
        title: "File read error",
        description: "Failed to read the selected file.",
        variant: "destructive",
      })
    }

    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="xml-upload">Upload OSM XML File</Label>
        <div className="flex items-center space-x-2">
          <Input id="xml-upload" type="file" accept=".xml" onChange={handleFileChange} />
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload XML
              </>
            )}
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Upload an existing OSM XML file to pre-fill the form fields.</p>
    </div>
  )
}
