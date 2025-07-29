"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X, Check, AlertTriangle, ImageIcon, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploaderProps {
  value?: string
  onChange?: (value: string) => void
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)
  const [compressionProgress, setCompressionProgress] = useState<number>(0)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number
    compressedSize: number
  } | null>(null)
  const [uploadInfo, setUploadInfo] = useState<{
    source: string
    imgbb_data?: any
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Function to compress an image using canvas
  const compressImage = useCallback(async (file: File, maxSizeMB = 2): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          // Start with original dimensions
          let width = img.width
          let height = img.height
          let quality = 0.9 // Initial quality
          const maxWidth = 1920 // Max width for very large images
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          // Calculate new dimensions if the image is very large
          if (width > maxWidth) {
            const ratio = maxWidth / width
            width = maxWidth
            height = Math.round(height * ratio)
          }

          // Set canvas dimensions
          canvas.width = width
          canvas.height = height

          // Draw image on canvas
          ctx?.drawImage(img, 0, 0, width, height)

          // Function to check file size and reduce quality if needed
          const checkSize = (attempt = 1) => {
            setCompressionProgress(Math.min(90, attempt * 10)) // Update progress

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to compress image"))
                  return
                }

                const sizeInMB = blob.size / (1024 * 1024)

                if (sizeInMB <= maxSizeMB || attempt > 10) {
                  // We've reached our target size or max attempts
                  setCompressionStats({
                    originalSize: Math.round((file.size / (1024 * 1024)) * 100) / 100,
                    compressedSize: Math.round(sizeInMB * 100) / 100,
                  })
                  setCompressionProgress(100)
                  resolve(blob)
                } else {
                  // Reduce quality and try again
                  quality = Math.max(0.1, quality - 0.1)

                  // If we've reduced quality significantly and still too large, reduce dimensions
                  if (quality < 0.5 && width > 1200) {
                    width = Math.round(width * 0.8)
                    height = Math.round(height * 0.8)
                    canvas.width = width
                    canvas.height = height
                    ctx?.drawImage(img, 0, 0, width, height)
                  }

                  // Check size again
                  setTimeout(() => checkSize(attempt + 1), 100)
                }
              },
              file.type,
              quality,
            )
          }

          // Start the compression process
          checkSize()
        }
        img.onerror = () => {
          reject(new Error("Failed to load image for compression"))
        }
        img.src = event.target?.result as string
      }
      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Reset states
    setError(null)
    setWarning(null)
    setSuccess(false)
    setIsUploading(true)
    setCompressionProgress(0)
    setUploadProgress(0)
    setCompressionStats(null)
    setUploadInfo(null)
    setFile(file)

    try {
      // Create a local preview
      const localPreview = URL.createObjectURL(file)
      setPreviewUrl(localPreview)

      let fileToUpload: File | Blob = file

      // Check if the file needs compression
      if (file.size > 2 * 1024 * 1024) {
        setWarning("Image is larger than 2MB. Compressing...")

        // Compress the image
        const compressedBlob = await compressImage(file)
        fileToUpload = new File([compressedBlob], file.name, { type: file.type })

        // Update preview with compressed image
        const compressedPreview = URL.createObjectURL(compressedBlob)
        URL.revokeObjectURL(localPreview)
        setPreviewUrl(compressedPreview)
      } else {
        setCompressionStats({
          originalSize: Math.round((file.size / (1024 * 1024)) * 100) / 100,
          compressedSize: Math.round((file.size / (1024 * 1024)) * 100) / 100,
        })
        setCompressionProgress(100)
      }

      // Upload to server
      setUploadProgress(10)
      const formData = new FormData()
      formData.append("file", fileToUpload)
      formData.append("filename", file.name)

      setUploadProgress(50)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      setUploadProgress(80)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Upload failed")
      }

      setUploadProgress(100)

      // Update with uploaded image URL
      onChange?.(result.url)
      setPreviewUrl(result.url)
      setSuccess(true)
      setUploadInfo({
        source: result.source,
        imgbb_data: result.imgbb_data,
      })

      // Show success message based on upload method
      if (result.source === "imgbb") {
        setWarning(null)
      } else {
        setWarning("Image processed locally (ImgBB API key not configured)")
      }
    } catch (err) {
      console.error("Image processing error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred during image processing")
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearImage = () => {
    onChange?.("")
    setPreviewUrl(null)
    setSuccess(false)
    setWarning(null)
    setCompressionStats(null)
    setUploadInfo(null)
    setFile(null)
    setImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePasteUrl = () => {
    navigator.clipboard.readText().then(
      (text) => {
        if (text.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)/i)) {
          onChange?.(text)
          setPreviewUrl(text)
          setSuccess(true)
          setWarning(null)
          setError(null)
          setUploadInfo({ source: "url" })
          setImageUrl(text)
        } else {
          setError("The clipboard content doesn't appear to be an image URL")
        }
      },
      () => {
        setError("Failed to read from clipboard")
      },
    )
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setImageUrl(data.url)
        onChange?.(data.url)
        toast({
          title: "Upload successful",
          description: "Image uploaded and URL generated.",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload image.")
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred during upload.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="image-url">Image URL</Label>
          <Input
            id="image-url"
            value={previewUrl || ""}
            onChange={(e) => {
              onChange?.(e.target.value)
              if (e.target.value) {
                setPreviewUrl(e.target.value)
                setSuccess(false)
                setWarning(null)
                setError(null)
                setUploadInfo(null)
                setImageUrl(e.target.value)
              } else {
                setPreviewUrl(null)
                setImageUrl(null)
              }
            }}
            placeholder="https://... or data:image/..."
            disabled={isUploading}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleClearImage}
          disabled={!previewUrl}
          className="h-10 w-10 bg-transparent"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear</span>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload to ImgBB
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handlePasteUrl}
            disabled={isUploading}
            className="flex-1 bg-transparent"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Paste Image URL
          </Button>
        </div>

        {isUploading && (
          <div className="space-y-2">
            {compressionProgress > 0 && compressionProgress < 100 && (
              <>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Compressing image...</span>
                  <span>{compressionProgress}%</span>
                </div>
                <Progress value={compressionProgress} className="h-2" />
              </>
            )}

            {uploadProgress > 0 && (
              <>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading to ImgBB...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {warning && (
          <Alert variant="default" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        )}

        {success && !warning && compressionStats && uploadInfo && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="space-y-2">
              <div>
                {compressionStats.originalSize === compressionStats.compressedSize
                  ? `Image uploaded successfully (${compressionStats.compressedSize}MB)`
                  : `Image compressed from ${compressionStats.originalSize}MB to ${compressionStats.compressedSize}MB and uploaded`}
              </div>
              {uploadInfo.source === "imgbb" && uploadInfo.imgbb_data && (
                <div className="flex items-center gap-2 text-sm">
                  <span>Hosted on ImgBB</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1"
                    onClick={() => window.open(uploadInfo.imgbb_data.url_viewer, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {previewUrl && (
          <div className="relative mt-2 rounded-md overflow-hidden border">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              className="max-h-48 max-w-full object-contain mx-auto"
              onError={() => {
                setError("Failed to load image preview. The URL may be invalid.")
                setPreviewUrl(null)
                setImageUrl(null)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
