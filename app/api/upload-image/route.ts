import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Log information about the request for debugging
    console.log("File upload request received:")
    console.log(`File name: ${file.name}`)
    console.log(`File type: ${file.type}`)
    console.log(`File size: ${file.size} bytes`)

    // Check if ImgBB API key is available
    const imgbbApiKey = process.env.IMGBB_API_KEY

    if (!imgbbApiKey) {
      console.log("ImgBB API key not found, falling back to data URL")

      // Fallback to data URL if no API key
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64Image = buffer.toString("base64")
      const dataUrl = `data:${file.type};base64,${base64Image}`

      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename: file.name,
        timestamp: new Date().getTime(),
        type: file.type,
        size: file.size,
        source: "data_url",
      })
    }

    // Convert file to base64 for ImgBB upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString("base64")

    // Create form data for ImgBB API
    const imgbbFormData = new FormData()
    imgbbFormData.append("image", base64Image)
    imgbbFormData.append("name", file.name.split(".")[0])

    console.log("Uploading to ImgBB...")

    // Upload to ImgBB
    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: "POST",
      body: imgbbFormData,
    })

    if (!imgbbResponse.ok) {
      const errorText = await imgbbResponse.text()
      console.error("ImgBB upload failed:", errorText)
      throw new Error(`ImgBB upload failed: ${imgbbResponse.status}`)
    }

    const imgbbResult = await imgbbResponse.json()

    if (!imgbbResult.success) {
      console.error("ImgBB API returned error:", imgbbResult)
      throw new Error("ImgBB API returned an error")
    }

    console.log("ImgBB upload successful:", imgbbResult.data.url)

    // Return the ImgBB URL
    return NextResponse.json({
      success: true,
      url: imgbbResult.data.url,
      filename: file.name,
      timestamp: new Date().getTime(),
      type: file.type,
      size: file.size,
      source: "imgbb",
      imgbb_data: {
        id: imgbbResult.data.id,
        title: imgbbResult.data.title,
        url_viewer: imgbbResult.data.url_viewer,
        url: imgbbResult.data.url,
        display_url: imgbbResult.data.display_url,
        thumb: imgbbResult.data.thumb,
        medium: imgbbResult.data.medium,
        delete_url: imgbbResult.data.delete_url,
      },
    })
  } catch (error) {
    console.error("Server error:", error)

    // Return error response
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: "There was an error processing your request.",
      },
      { status: 500 },
    )
  }
}
