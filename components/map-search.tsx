"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2, Search } from "lucide-react"
import { useDebounce } from "use-debounce"

interface MapSearchProps {
  onSelectLocation: (lat: string, lon: string, displayName?: string) => void
}

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

export function MapSearch({ onSelectLocation }: MapSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebounce(searchTerm, 500)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchLocations = async () => {
      if (debouncedSearchTerm.length < 3) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            debouncedSearchTerm,
          )}&format=json&limit=10`,
        )
        const data: NominatimResult[] = await response.json()
        setResults(data)
        setOpen(true) // Open popover when results are available
      } catch (error) {
        console.error("Error fetching location data:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [debouncedSearchTerm])

  const handleSelect = (result: NominatimResult) => {
    onSelectLocation(result.lat, result.lon, result.display_name)
    setSearchTerm(result.display_name) // Set input to selected display name
    setOpen(false) // Close popover
    setResults([]) // Clear results
    if (inputRef.current) {
      inputRef.current.blur() // Remove focus from input
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Search for a location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-1"
            onClick={() => {
              if (searchTerm.length >= 3) {
                // Trigger search immediately if button is clicked and term is long enough
                setDebouncedSearchTerm(searchTerm)
              }
            }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandList>
            {loading && <CommandEmpty>Searching...</CommandEmpty>}
            {!loading && results.length === 0 && debouncedSearchTerm.length >= 3 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            <CommandGroup>
              {results.map((result) => (
                <CommandItem key={result.lat + result.lon} onSelect={() => handleSelect(result)}>
                  {result.display_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
