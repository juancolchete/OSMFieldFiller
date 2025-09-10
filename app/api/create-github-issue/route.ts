import { NextResponse } from "next/server"
import CryptoJS from 'crypto-js';

// This would be set as an environment variable in a real application
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""
const REPO_OWNER = "UAIBIT"
const REPO_NAME = "data"

export async function POST(request: Request) {
  try {
    const { title, description, osmData, submitter } = await request.json()

    // Validate required fields
    if (!title || !osmData) {
      return NextResponse.json({ error: "Title and OSM data are required" }, { status: 400 })
    }

    // Extract coordinates from osmData for the OpenStreetMap link
    const lines = osmData.split("\n")
    const latLine = lines.find((line: string) => line.startsWith("lat="))
    const lonLine = lines.find((line: string) => line.startsWith("lon="))

    const lat = latLine ? latLine.split("=")[1] : ""
    const lon = lonLine ? lonLine.split("=")[1] : ""

    // Create OpenStreetMap link if coordinates are available
    const osmLink =
      lat && lon
        ? `**OpenStreetMap Link:** [View on OpenStreetMap](https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=21/${lat}/${lon})\n\n`
        : ""

    // Prepare the issue body
    const osmHash = `HBTC=${CryptoJS.SHA256(osmData).toString()}`
    const issueBody = `## OSM Location Data
${osmLink}${description ? `${description}\n\n` : ""}
\`\`\`
${osmData}
${osmHash}
\`\`\`

${submitter?.name ? `Submitted by: ${submitter.name}` : ""}
${submitter?.email ? `Contact: ${submitter.email}` : ""}
*Submitted via OSM Field Filler*`

    // Check if we have a token
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        {
          error: "GitHub token is not configured",
          fallback: true,
          issueTitle: title,
          issueBody: issueBody,
          repoUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new`,
        },
        { status: 401 },
      )
    }

    // Create the issue using GitHub API
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title: title,
        body: issueBody,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("GitHub API error:", data)

      // Return a fallback option for manual submission
      return NextResponse.json(
        {
          error: data.message || "Failed to create issue",
          fallback: true,
          issueTitle: title,
          issueBody: issueBody,
          repoUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new`,
        },
        { status: response.status },
      )
    }

    // Return success with the issue URL
    return NextResponse.json({
      success: true,
      issueUrl: data.html_url,
      issueNumber: data.number,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
