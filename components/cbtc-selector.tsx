"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Community {
  name: string
  url: string
  tags: string[]
  location: {
    lat: number
    lon: number
  }
}

interface CbtcSelectorProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CbtcSelector({ id, value, onChange, placeholder }: CbtcSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [communities, setCommunities] = React.useState<Community[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true)
        setError(null)
        // Fetch from our new API route
        const response = await fetch("/api/communities")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Community[] = await response.json()
        setCommunities(data)
      } catch (e: any) {
        setError(e.message || "Failed to fetch communities")
        console.error("Error fetching communities:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunities()
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
          id={id}
        >
          {value
            ? communities.find((community) => community.name === value)?.name
            : placeholder || "Select community..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search community..." />
          <CommandList>
            {loading && <CommandEmpty>Loading communities...</CommandEmpty>}
            {error && <CommandEmpty className="text-red-500">Error: {error}</CommandEmpty>}
            {!loading && !error && communities.length === 0 && <CommandEmpty>No communities found.</CommandEmpty>}
            <ScrollArea className="h-[200px]">
              <CommandGroup>
                {communities.map((community) => (
                  <CommandItem
                    key={community.name}
                    value={community.name}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === community.name ? "opacity-100" : "opacity-0")} />
                    {community.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
