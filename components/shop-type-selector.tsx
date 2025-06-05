"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface ShopTypeOption {
  value: string
  label: string
  category: string
}

interface ShopTypeSelectorProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: ShopTypeOption[]
}

export function ShopTypeSelector({ id, value, onChange, placeholder, options }: ShopTypeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOptions, setFilteredOptions] = useState<ShopTypeOption[]>(options)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get the selected option label
  const selectedOption = options.find((option) => option.value === value)
  const displayValue = selectedOption ? selectedOption.label : placeholder

  // Filter options based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOptions(options)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = options.filter(
        (option) => option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query),
      )
      setFilteredOptions(filtered)
    }
  }, [searchQuery, options])

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

  // Group options by category
  const groupedOptions: Record<string, ShopTypeOption[]> = {}
  filteredOptions.forEach((option) => {
    if (!groupedOptions[option.category]) {
      groupedOptions[option.category] = []
    }
    groupedOptions[option.category].push(option)
  })

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
        onClick={() => {
          setShowDropdown(!showDropdown)
          if (!showDropdown && inputRef.current) {
            // Focus the search input when opening the dropdown
            setTimeout(() => inputRef.current?.focus(), 0)
          }
        }}
      >
        {displayValue}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          <div className="p-2 border-b sticky top-0 bg-background">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Search shop or amenity type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1">
            {Object.keys(groupedOptions).length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">No results found</div>
            ) : (
              Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                <div key={category} className="mb-2">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{category}</div>
                  {categoryOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                        value === option.value ? "bg-accent text-accent-foreground" : ""
                      }`}
                      onClick={() => {
                        onChange(option.value)
                        setShowDropdown(false)
                        setSearchQuery("")
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hidden select for form submission */}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="sr-only">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
