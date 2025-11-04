"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown } from "lucide-react"

interface Community {
  name: string
  slug: string
  description?: string
}

interface CbtcSelectorProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function CbtcSelector({ id, value, onChange, placeholder }: CbtcSelectorProps) {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch communities data on component mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://raw.githubusercontent.com/UAIBIT/OBTC/main/communities.json")

        if (!response.ok) {
          throw new Error(`Failed to fetch communities: ${response.status}`)
        }

        const data = await response.json()

        // Ensure data is an array
        if (Array.isArray(data)) {
          setCommunities(data)
          setFilteredCommunities(data)
        } else {
          throw new Error("Invalid data format: expected an array")
        }
      } catch (err) {
        console.error("Error fetching communities:", err)
        setError(err instanceof Error ? err.message : "Failed to load communities")
        // Fallback data
        setCommunities([])
        setFilteredCommunities([])
      } finally {
        setLoading(false)
      }
    }

    fetchCommunities()
  }, [])

  // Filter communities based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCommunities(communities)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = communities.filter(
        (community) => community.name.toLowerCase().includes(query) || community.slug.toLowerCase().includes(query),
      )
      setFilteredCommunities(filtered)
    }
  }, [searchQuery, communities])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get the selected community
  const selectedCommunity = communities.find((community) => community.slug === value)
  const displayValue = selectedCommunity ? selectedCommunity.name : value || placeholder

  if (loading) {
    return (
      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        Loading communities...
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
          Failed to load communities
        </div>
        <div className="text-xs text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer items-center justify-between"
        onClick={() => {
          setShowDropdown(!showDropdown)
          if (!showDropdown && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 0)
          }
        }}
      >
        <span className={value ? "" : "text-muted-foreground"}>{displayValue}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <div className="p-2 border-b sticky top-0 bg-background">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredCommunities.length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">No communities found</div>
            ) : (
              filteredCommunities.map((community) => (
                <div
                  key={community.slug}
                  className={`px-2 py-2 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                    value === community.slug ? "bg-accent text-accent-foreground" : ""
                  }`}
                  onClick={() => {
                    onChange(community.slug)
                    setShowDropdown(false)
                    setSearchQuery("")
                  }}
                >
                  <div className="font-medium">{community.name}</div>
                  {community.description && (
                    <div className="text-xs text-muted-foreground mt-1">{community.description}</div>
                  )}
                  <div className="text-xs text-blue-600 mt-1">Slug: {community.slug}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hidden select for form submission */}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="sr-only">
        <option value="">{placeholder}</option>
        {communities.map((community) => (
          <option key={community.slug} value={community.slug}>
            {community.name}
          </option>
        ))}
      </select>
    </div>
  )
}
