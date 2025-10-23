"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface XmlUploaderProps {
  onFileUpload: (xmlContent: string) => void
}

export function XmlUploader({ onFileUpload }: XmlUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (file.type !== "text/xml" && !file.name.endsWith(".xml")) {
        setErrorMessage("Please upload a valid XML file.")
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
      setErrorMessage(null)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) {
      setErrorMessage("Please select an XML file to upload.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const xmlContent = e.target?.result as string
        onFileUpload(xmlContent)
        setErrorMessage(null)
      } catch (error) {
        console.error("Error reading file:", error)
        setErrorMessage("Failed to read file content.")
      }
    }
    reader.onerror = () => {
      setErrorMessage("Error reading file.")
    }
    reader.readAsText(selectedFile)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload OSM XML</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="xml-upload">Choose XML File</Label>
          <Input id="xml-upload" type="file" accept=".xml,text/xml" onChange={handleFileChange} />
        </div>
        <Button onClick={handleUpload} disabled={!selectedFile}>
          Upload XML
        </Button>
        {errorMessage && <p className="text-red-600 mt-4">Error: {errorMessage}</p>}
      </CardContent>
    </Card>
  )
}
