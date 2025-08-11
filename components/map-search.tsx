"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, X, Building, Home, MapIcon, Navigation } from "lucide-react"
import { Card } from "@/components/ui/card"

interface SearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  boundingbox?: string[]
  importance?: number
  type?: string
  class?: string
  address?: {
    house_number?: string
    road?: string
    suburb?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
    [key: string]: string | undefined
  }
}

interface MapSearchProps {
  onLocationSelect: (lat: string, lon: string, name?: string) => void
}

export function MapSearch({ onLocationSelect }: MapSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Auto search effect with debounce
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!searchQuery.trim()) {
      setResults([])
      setError(null)
      setShowResults(false)
      return
    }

    // Set a new timeout to perform the search after 500ms of no typing
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      setError(null)
      setShowResults(true)

      try {
        console.log("Searching for:", searchQuery) // Debug log

        // Use Nominatim API for geocoding (same as OpenStreetMap)
        const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5`
        console.log("Search URL:", searchUrl) // Debug log

        const response = await fetch(searchUrl, {
          headers: {
            "Accept-Language": "en", // Prefer English results
            "User-Agent": "OSM Field Filler", // Identify our application
          },
        })

        console.log("Response status:", response.status) // Debug log

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Search results:", data) // Debug log

        if (Array.isArray(data) && data.length > 0) {
          setResults(data)
          setError(null)
        } else {
          setResults([])
          setError("No results found. Try a different search term.")
        }
      } catch (err) {
        console.error("Search error:", err)
        setError(err instanceof Error ? err.message : "Search failed. Please try again.")
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500) // 500ms debounce

    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleResultClick = (result: SearchResult) => {
    console.log("Selected result:", result) // Debug log
    onLocationSelect(result.lat, result.lon, result.display_name)
    setShowResults(false)
    setSearchQuery("") // Clear search after selection
  }

  const clearSearch = () => {
    setSearchQuery("")
    setResults([])
    setShowResults(false)
    setError(null)
  }

  // Get icon based on result type
  const getResultIcon = (result: SearchResult) => {
    // Check for house number in address to prioritize showing as an address
    if (result.address?.house_number) {
      return <Home className="h-4 w-4 flex-shrink-0 text-blue-500" />
    }

    if (result.class === "building" || result.type === "building") {
      return <Building className="h-4 w-4 flex-shrink-0 text-blue-500" />
    } else if (result.class === "highway" || result.type?.includes("road")) {
      return <Navigation className="h-4 w-4 flex-shrink-0 text-green-500" />
    } else if (result.class === "place" && (result.type === "city" || result.type === "town")) {
      return <MapIcon className="h-4 w-4 flex-shrink-0 text-purple-500" />
    } else if (result.class === "place" && (result.type === "suburb" || result.type === "neighbourhood")) {
      return <Home className="h-4 w-4 flex-shrink-0 text-orange-500" />
    } else {
      return <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    }
  }

  // Format address for display
  const formatAddress = (result: SearchResult) => {
    if (result.address) {
      const addr = result.address
      const parts = []

      // Format with house number if available
      if (addr.house_number && addr.road) {
        parts.push(`${addr.house_number} ${addr.road}`)
      } else if (addr.road) {
        parts.push(addr.road)
      }

      // Add suburb/neighborhood if available
      if (addr.suburb) {
        parts.push(addr.suburb)
      }

      // Add city, state, country
      if (addr.city) {
        parts.push(addr.city)
      }
      if (addr.state) {
        parts.push(addr.state)
      }
      if (addr.country) {
        parts.push(addr.country)
      }

      if (parts.length > 0) {
        return {
          primary: parts[0],
          secondary: parts.slice(1).join(", "),
        }
      }
    }

    // Fallback to default display name splitting
    const nameParts = result.display_name.split(", ")
    return {
      primary: nameParts.slice(0, 2).join(", "),
      secondary: nameParts.slice(2).join(", "),
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a location..."
          className="pl-9 pr-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || error) {
              setShowResults(true)
            }
          }}
          onClick={() => {
            if (results.length > 0 || error) {
              setShowResults(true)
            }
          }}
        />
        {isSearching ? (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
        ) : searchQuery ? (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {showResults && (results.length > 0 || error) && (
        <div ref={resultsRef} className="absolute top-full left-0 right-0 z-[9999] mt-1" style={{ zIndex: 9999 }}>
          <Card className="w-full max-h-[300px] overflow-y-auto shadow-xl border-2 bg-white">
            {error ? (
              <div className="p-4 text-sm text-muted-foreground">
                <p>{error}</p>
                <p className="mt-2 text-xs">
                  Try different formats like "123 Main St" or "Main St 123" or just the street name.
                </p>
              </div>
            ) : (
              <ul className="py-1 divide-y divide-gray-100">
                {results.map((result) => {
                  const address = formatAddress(result)
                  return (
                    <li
                      key={result.place_id}
                      className="px-3 py-3 hover:bg-gray-50 cursor-pointer text-sm transition-colors"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start gap-3">
                        {getResultIcon(result)}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900">{address.primary}</div>
                          <div className="text-xs text-gray-500 truncate mt-1">{address.secondary}</div>
                          {result.address?.house_number && (
                            <div className="text-xs text-blue-600 mt-1 font-medium">
                              House Number: {result.address.house_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
