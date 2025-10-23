"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
      setUploadStatus("idle")
      setErrorMessage(null)
      setUploadedImageUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select an image file to upload.")
      return
    }

    setUploadStatus("uploading")
    setErrorMessage(null)

    const formData = new FormData()
    formData.append("image", selectedFile)

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedImageUrl(data.url)
        setUploadStatus("success")
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.error || "Failed to upload image.")
        setUploadStatus("error")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setErrorMessage("An unexpected error occurred during upload.")
      setUploadStatus("error")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="image-upload">Choose Image</Label>
          <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <Button onClick={handleUpload} disabled={!selectedFile || uploadStatus === "uploading"}>
          {uploadStatus === "uploading" ? "Uploading..." : "Upload Image"}
        </Button>
        {uploadStatus === "success" && uploadedImageUrl && (
          <div className="mt-4">
            <p className="text-green-600">Image uploaded successfully!</p>
            <p className="text-sm text-gray-500">
              URL:{" "}
              <a
                href={uploadedImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {uploadedImageUrl}
              </a>
            </p>
            <img
              src={uploadedImageUrl || "/placeholder.svg"}
              alt="Uploaded preview"
              className="mt-2 max-w-full h-auto rounded-md"
            />
          </div>
        )}
        {uploadStatus === "error" && errorMessage && <p className="text-red-600 mt-4">Error: {errorMessage}</p>}
      </CardContent>
    </Card>
  )
}
