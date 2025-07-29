// This file was added in a previous turn to implement API caching.
// It is included here in full as per instructions.

import { NextResponse } from "next/server"

// Simple in-memory cache
let cachedCommunities: any[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION_SECONDS = 60 * 60 // 1 hour

export async function GET() {
  const now = Date.now()

  // Check if cache is valid
  if (cachedCommunities && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION_SECONDS * 1000) {
    console.log("Serving communities from cache.")
    return NextResponse.json(cachedCommunities)
  }

  console.log("Fetching communities from GitHub...")
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/osm-community/osm-communities/main/communities.json",
      {
        next: { revalidate: CACHE_DURATION_SECONDS }, // Revalidate after cache duration
      },
    )

    if (!response.ok) {
      // If GitHub returns 429 or other error, try to serve stale cache if available
      if (response.status === 429 && cachedCommunities) {
        console.warn("GitHub returned 429, serving stale cache.")
        return NextResponse.json(cachedCommunities)
      }
      throw new Error(`Failed to fetch communities: ${response.statusText}`)
    }

    const data = await response.json()
    cachedCommunities = data
    cacheTimestamp = now
    console.log("Communities fetched and cached successfully.")
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching communities:", error)
    // If an error occurs and we have stale data, serve it
    if (cachedCommunities) {
      console.warn("Error fetching new data, serving stale cache.")
      return NextResponse.json(cachedCommunities, { status: 200 }) // Still return 200 if serving stale
    }
    return NextResponse.json({ error: "Failed to load communities" }, { status: 500 })
  }
}
