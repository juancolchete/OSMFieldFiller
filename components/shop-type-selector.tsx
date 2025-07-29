// This file was added in a previous turn to implement the shop type selector.
// It is included here in full as per instructions.

"use client"

import { CommandList } from "@/components/ui/command"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ShopTypeOption {
  value: string
  label: string
  category: string
}

interface ShopTypeSelectorProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  options: ShopTypeOption[]
}

export function ShopTypeSelector({ id, value, onChange, placeholder, options }: ShopTypeSelectorProps) {
  const [open, setOpen] = React.useState(false)

  // Group options by category
  const groupedOptions = options.reduce(
    (acc, option) => {
      if (!acc[option.category]) {
        acc[option.category] = []
      }
      acc[option.category].push(option)
      return acc
    },
    {} as Record<string, ShopTypeOption[]>,
  )

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
          {value ? options.find((option) => option.value === value)?.label : placeholder || "Select type..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search type..." />
          <CommandList>
            <CommandEmpty>No type found.</CommandEmpty>
            <ScrollArea className="h-[300px]">
              {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                <CommandGroup key={category} heading={category}>
                  {categoryOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        onChange(currentValue === value ? "" : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
