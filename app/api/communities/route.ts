import { NextResponse } from "next/server"

interface Community {
  id: string
  name: string
  country_code: string
  bbox: [number, number, number, number] // [min_lon, min_lat, max_lon, max_lat]
}

let cachedCommunities: Community[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION_SECONDS = 60 * 60 // Cache for 1 hour

export async function GET() {
  const now = Date.now()
  // Check if cache is valid
  if (cachedCommunities && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION_SECONDS * 1000) {
    console.log("Serving communities from cache.")
    return NextResponse.json(cachedCommunities)
  }

  console.log("Fetching communities from GitHub...")
  try {
    const response = await fetch("https://raw.githubusercontent.com/UAIBIT/OBTC/main/communities.json", {
      next: { revalidate: CACHE_DURATION_SECONDS }, // Revalidate after cache duration
    })

    if (!response.ok) {
      // If GitHub returns 429 or other error, try to serve stale cache if available
      if (response.status === 429 && cachedCommunities) {
        console.warn("GitHub rate limit hit, serving stale cache.")
        return NextResponse.json(cachedCommunities, {
          status: 200,
          headers: { "X-Cache-Status": "STALE" },
        })
      }
      throw new Error(`Failed to fetch communities: ${response.status} ${response.statusText}`)
    }

    const data: Community[] = await response.json()
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format: expected an array from communities.json")
    }

    cachedCommunities = data
    cacheTimestamp = now
    console.log("Communities fetched and cached successfully.")
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in /api/communities:", error)
    // If there's an error and no cache, return a server error
    if (!cachedCommunities) {
      // Placeholder for fetching community data in case of error
      const communities = [
        {
          id: "san_francisco",
          name: "San Francisco",
          country_code: "US",
          bbox: [-122.4194, 37.7749, -122.0574, 37.8326],
        },
        { id: "new_york", name: "New York", country_code: "US", bbox: [-74.25909, 40.477399, -73.700272, 40.917577] },
        { id: "london", name: "London", country_code: "GB", bbox: [-0.52, 51.3, 0.3, 51.9] },
        { id: "tokyo", name: "Tokyo", country_code: "JP", bbox: [139.4395, 35.6528, 139.7031, 35.8625] },
      ]
      return NextResponse.json(communities, { status: 500 })
    }
    // If there's an error but stale cache is available, serve stale cache
    console.warn("Error fetching new data, serving stale cache due to error.")
    return NextResponse.json(cachedCommunities, {
      status: 200,
      headers: { "X-Cache-Status": "STALE_ON_ERROR" },
    })
  }
}
