"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ShopTypeSelectorProps {
  value: string
  onValueChange: (value: string) => void
  isAmenity?: boolean
}

const shopTypes = [
  { value: "bakery", label: "Bakery" },
  { value: "cafe", label: "Cafe" },
  { value: "supermarket", label: "Supermarket" },
  { value: "clothes", label: "Clothes Shop" },
  { value: "electronics", label: "Electronics Store" },
  { value: "hairdresser", label: "Hairdresser" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "florist", label: "Florist" },
  { value: "bookshop", label: "Bookshop" },
  { value: "car_repair", label: "Car Repair" },
  { value: "convenience", label: "Convenience Store" },
  { value: "kiosk", label: "Kiosk" },
  { value: "laundry", label: "Laundry" },
  { value: "newsagent", label: "Newsagent" },
  { value: "pet_shop", label: "Pet Shop" },
  { value: "travel_agency", label: "Travel Agency" },
  { value: "tyres", label: "Tyres" },
  { value: "variety_store", label: "Variety Store" },
  { value: "wholesale", label: "Wholesale" },
]

const amenityTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Cafe" },
  { value: "bar", label: "Bar" },
  { value: "pub", label: "Pub" },
  { value: "fast_food", label: "Fast Food" },
  { value: "bank", label: "Bank" },
  { value: "atm", label: "ATM" },
  { value: "post_office", label: "Post Office" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "school", label: "School" },
  { value: "university", label: "University" },
  { value: "library", label: "Library" },
  { value: "parking", label: "Parking" },
  { value: "toilet", label: "Toilet" },
  { value: "fountain", label: "Fountain" },
  { value: "recycling", label: "Recycling" },
  { value: "waste_basket", label: "Waste Basket" },
  { value: "bench", label: "Bench" },
  { value: "shelter", label: "Shelter" },
  { value: "bus_station", label: "Bus Station" },
  { value: "taxi", label: "Taxi Stand" },
  { value: "charging_station", label: "Charging Station" },
  { value: "bicycle_parking", label: "Bicycle Parking" },
  { value: "car_wash", label: "Car Wash" },
  { value: "fuel", label: "Fuel Station" },
  { value: "kindergarten", label: "Kindergarten" },
  { value: "marketplace", label: "Marketplace" },
  { value: "place_of_worship", label: "Place of Worship" },
  { value: "police", label: "Police Station" },
  { value: "fire_station", label: "Fire Station" },
  { value: "town_hall", label: "Town Hall" },
  { value: "community_centre", label: "Community Centre" },
  { value: "arts_centre", label: "Arts Centre" },
  { value: "theatre", label: "Theatre" },
  { value: "cinema", label: "Cinema" },
  { value: "nightclub", label: "Nightclub" },
  { value: "casino", label: "Casino" },
  { value: "brothel", label: "Brothel" },
  { value: "stripclub", label: "Stripclub" },
  { value: "swimming_pool", label: "Swimming Pool" },
  { value: "gym", label: "Gym" },
  { value: "sauna", label: "Sauna" },
  { value: "spa", label: "Spa" },
  { value: "public_bath", label: "Public Bath" },
  { value: "dojo", label: "Dojo" },
  { value: "social_facility", label: "Social Facility" },
  { value: "childcare", label: "Childcare" },
  { value: "nursing_home", label: "Nursing Home" },
  { value: "veterinary", label: "Veterinary" },
  { value: "animal_boarding", label: "Animal Boarding" },
  { value: "animal_shelter", label: "Animal Shelter" },
  { value: "grave_yard", label: "Grave Yard" },
  { value: "crematorium", label: "Crematorium" },
  { value: "funeral_hall", label: "Funeral Hall" },
  { value: "hunting_stand", label: "Hunting Stand" },
  { value: "ranger_station", label: "Ranger Station" },
  { value: "research_institute", label: "Research Institute" },
  { value: "embassy", label: "Embassy" },
  { value: "consulate", label: "Consulate" },
  { value: "courthouse", label: "Courthouse" },
  { value: "prison", label: "Prison" },
  { value: "marketplace", label: "Marketplace" },
  { value: "vending_machine", label: "Vending Machine" },
  { value: "car_sharing", label: "Car Sharing" },
  { value: "bicycle_rental", label: "Bicycle Rental" },
  { value: "boat_rental", label: "Boat Rental" },
  { value: "car_rental", label: "Car Rental" },
  { value: "motorcycle_parking", label: "Motorcycle Parking" },
  { value: "truck_parking", label: "Truck Parking" },
  { value: "ferry_terminal", label: "Ferry Terminal" },
  { value: "bus_stop", label: "Bus Stop" },
  { value: "tram_stop", label: "Tram Stop" },
  { value: "subway_entrance", label: "Subway Entrance" },
  { value: "train_station", label: "Train Station" },
  { value: "airport", label: "Airport" },
  { value: "heliport", label: "Heliport" },
  { value: "aerodrome", label: "Aerodrome" },
  { value: "bureau_de_change", label: "Bureau de Change" },
  { value: "dentist", label: "Dentist" },
  { value: "doctors", label: "Doctors" },
  { value: "hospital", label: "Hospital" },
  { value: "nursing_home", label: "Nursing Home" },
  { value: "social_facility", label: "Social Facility" },
  { value: "veterinary", label: "Veterinary" },
  { value: "kindergarten", label: "Kindergarten" },
  { value: "school", label: "School" },
  { value: "university", label: "University" },
  { value: "college", label: "College" },
  { value: "research_institute", label: "Research Institute" },
  { value: "library", label: "Library" },
  { value: "arts_centre", label: "Arts Centre" },
  { value: "community_centre", label: "Community Centre" },
  { value: "theatre", label: "Theatre" },
  { value: "cinema", label: "Cinema" },
  { value: "nightclub", label: "Nightclub" },
  { value: "casino", label: "Casino" },
  { value: "brothel", label: "Brothel" },
  { value: "stripclub", label: "Stripclub" },
  { value: "swimming_pool", label: "Swimming Pool" },
  { value: "gym", label: "Gym" },
  { value: "sauna", label: "Sauna" },
  { value: "spa", label: "Spa" },
  { value: "public_bath", label: "Public Bath" },
  { value: "dojo", label: "Dojo" },
  { value: "hunting_stand", label: "Hunting Stand" },
  { value: "ranger_station", label: "Ranger Station" },
  { value: "embassy", label: "Embassy" },
  { value: "consulate", label: "Consulate" },
  { value: "courthouse", label: "Courthouse" },
  { value: "prison", label: "Prison" },
  { value: "marketplace", label: "Marketplace" },
  { value: "vending_machine", label: "Vending Machine" },
  { value: "car_sharing", label: "Car Sharing" },
  { value: "bicycle_rental", label: "Bicycle Rental" },
  { value: "boat_rental", label: "Boat Rental" },
  { value: "car_rental", label: "Car Rental" },
  { value: "motorcycle_parking", label: "Motorcycle Parking" },
  { value: "truck_parking", label: "Truck Parking" },
  { value: "ferry_terminal", label: "Ferry Terminal" },
  { value: "bus_stop", label: "Bus Stop" },
  { value: "tram_stop", label: "Tram Stop" },
  { value: "subway_entrance", label: "Subway Entrance" },
  { value: "train_station", label: "Train Station" },
  { value: "airport", label: "Airport" },
  { value: "heliport", label: "Heliport" },
  { value: "aerodrome", label: "Aerodrome" },
  { value: "bureau_de_change", label: "Bureau de Change" },
]

export function ShopTypeSelector({ value, onValueChange, isAmenity = false }: ShopTypeSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const types = isAmenity ? amenityTypes : shopTypes
  const placeholder = isAmenity ? "Select an amenity type (Optional)" : "Select a shop type (Optional)"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
        >
          {value ? types.find((type) => type.value === value)?.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={`Search ${isAmenity ? "amenity" : "shop"} types...`} />
          <CommandList>
            <CommandEmpty>No {isAmenity ? "amenity" : "shop"} type found.</CommandEmpty>
            <CommandGroup>
              {types.map((type) => (
                <CommandItem
                  key={type.value}
                  value={type.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === type.value ? "opacity-100" : "opacity-0")} />
                  {type.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
