"use client"

import { useEffect } from "react"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useDebounce } from "use-debounce"

interface MapSearchProps {
  onLocationSelect: (lat: string, lon: string, name?: string) => void
}

export function MapSearch({ onLocationSelect }: MapSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    if (!debouncedSearchTerm.trim()) {
      setSearchResults([])
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedSearchTerm)}&format=json&limit=5`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSearchResults(data)
    } catch (err) {
      console.error("Error fetching search results:", err)
      setError("Failed to fetch search results. Please try again.")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearchTerm])

  // Trigger search when debouncedSearchTerm changes
  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search for a location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
      {isLoading && (
        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 p-2">Loading...</div>
      )}
      {error && (
        <div className="absolute z-10 w-full bg-red-100 text-red-700 border border-red-400 rounded-md shadow-lg mt-1 p-2">
          {error}
        </div>
      )}
      {searchResults.length > 0 && !isLoading && (
        <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
          {searchResults.map((result) => (
            <li
              key={result.place_id}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => {
                onLocationSelect(result.lat, result.lon, result.display_name)
                setSearchResults([]) // Clear results after selection
                setSearchTerm(result.display_name) // Set input to selected name
              }}
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
