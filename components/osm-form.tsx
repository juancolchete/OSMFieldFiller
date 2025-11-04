"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download, Github, Edit3, RotateCcw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPicker } from "@/components/map-picker"
import { GithubIssueForm } from "@/components/github-issue-form"
import { ShopTypeSelector } from "@/components/shop-type-selector"
import { CbtcSelector } from "@/components/cbtc-selector"
// Import the ImageUploader component at the top of the file
import { ImageUploader } from "@/components/image-uploader"
import CryptoJS from 'crypto-js';

// First, add a helper function to format the current date as YYYY-MM-DD
function getCurrentDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Define shop types and amenities with categories
const shopAndAmenityTypes = [
  // Shop types
  { value: "alcohol", label: "Shop: Alcohol", category: "Shop Types" },
  { value: "bakery", label: "Shop: Bakery", category: "Shop Types" },
  { value: "beverages", label: "Shop: Beverages", category: "Shop Types" },
  { value: "brewing_supplies", label: "Shop: Brewing Supplies", category: "Shop Types" },
  { value: "butcher", label: "Shop: Butcher", category: "Shop Types" },
  { value: "cheese", label: "Shop: Cheese", category: "Shop Types" },
  { value: "chocolate", label: "Shop: Chocolate", category: "Shop Types" },
  { value: "coffee", label: "Shop: Coffee", category: "Shop Types" },
  { value: "confectionery", label: "Shop: Confectionery", category: "Shop Types" },
  { value: "convenience", label: "Shop: Convenience", category: "Shop Types" },
  { value: "dairy", label: "Shop: Dairy", category: "Shop Types" },
  { value: "deli", label: "Shop: Deli", category: "Shop Types" },
  { value: "farm", label: "Shop: Farm", category: "Shop Types" },
  { value: "food", label: "Shop: Food", category: "Shop Types" },
  { value: "frozen_food", label: "Shop: Frozen Food", category: "Shop Types" },
  { value: "greengrocer", label: "Shop: Greengrocer", category: "Shop Types" },
  { value: "health_food", label: "Shop: Health Food", category: "Shop Types" },
  { value: "ice_cream", label: "Shop: Ice Cream", category: "Shop Types" },
  { value: "nuts", label: "Shop: Nuts", category: "Shop Types" },
  { value: "pasta", label: "Shop: Pasta", category: "Shop Types" },
  { value: "pastry", label: "Shop: Pastry", category: "Shop Types" },
  { value: "seafood", label: "Shop: Seafood", category: "Shop Types" },
  { value: "spices", label: "Shop: Spices", category: "Shop Types" },
  { value: "tea", label: "Shop: Tea", category: "Shop Types" },
  { value: "water", label: "Shop: Water", category: "Shop Types" },
  { value: "wine", label: "Shop: Wine", category: "Shop Types" },
  { value: "shoes", label: "Shop: Shoes", category: "Shop Types" },
  { value: "clothes", label: "Shop: Clothes", category: "Shop Types" },
  { value: "electronics", label: "Shop: Electronics", category: "Shop Types" },
  { value: "hardware", label: "Shop: Hardware", category: "Shop Types" },
  { value: "furniture", label: "Shop: Furniture", category: "Shop Types" },
  { value: "supermarket", label: "Shop: Supermarket", category: "Shop Types" },
  { value: "department_store", label: "Shop: Department Store", category: "Shop Types" },
  { value: "mall", label: "Shop: Mall", category: "Shop Types" },
  { value: "beauty", label: "Shop: Beauty", category: "Shop Types" },
  { value: "jewelry", label: "Shop: Jewelry", category: "Shop Types" },
  { value: "gift", label: "Shop: Gift", category: "Shop Types" },
  { value: "books", label: "Shop: Books", category: "Shop Types" },
  { value: "stationery", label: "Shop: Stationery", category: "Shop Types" },
  { value: "music", label: "Shop: Music", category: "Shop Types" },
  { value: "toys", label: "Shop: Toys", category: "Shop Types" },
  { value: "sports", label: "Shop: Sports", category: "Shop Types" },
  { value: "outdoor", label: "Shop: Outdoor", category: "Shop Types" },
  { value: "mobile_phone", label: "Shop: Mobile Phone", category: "Shop Types" },
  { value: "computer", label: "Shop: Computer", category: "Shop Types" },
  { value: "pet", label: "Shop: Pet", category: "Shop Types" },
  { value: "florist", label: "Shop: Florist", category: "Shop Types" },
  { value: "garden_centre", label: "Shop: Garden Centre", category: "Shop Types" },
  { value: "optician", label: "Shop: Optician", category: "Shop Types" },
  { value: "pharmacy", label: "Shop: Pharmacy", category: "Shop Types" },
  { value: "medical_supply", label: "Shop: Medical Supply", category: "Shop Types" },
  { value: "tobacco", label: "Shop: Tobacco", category: "Shop Types" },
  { value: "newsagent", label: "Shop: Newsagent", category: "Shop Types" },
  { value: "car", label: "Shop: Car", category: "Shop Types" },
  { value: "bicycle", label: "Shop: Bicycle", category: "Shop Types" },
  { value: "motorcycle", label: "Shop: Motorcycle", category: "Shop Types" },
  { value: "doityourself", label: "Shop: Do-It-Yourself", category: "Shop Types" },
  { value: "art", label: "Shop: Art", category: "Shop Types" },
  { value: "craft", label: "Shop: Craft", category: "Shop Types" },
  { value: "hairdresser", label: "Shop: Hairdresser", category: "Shop Types" },
  { value: "laundry", label: "Shop: Laundry", category: "Shop Types" },
  { value: "travel_agency", label: "Shop: Travel Agency", category: "Shop Types" },
  { value: "variety_store", label: "Shop: Variety Store", category: "Shop Types" },
  { value: "other", label: "Shop: Other", category: "Shop Types" },

  // Amenities - Sustenance
  { value: "bar", label: "Amenity: Bar", category: "Amenities - Sustenance" },
  { value: "biergarten", label: "Amenity: Biergarten", category: "Amenities - Sustenance" },
  { value: "cafe", label: "Amenity: Cafe", category: "Amenities - Sustenance" },
  { value: "fast_food", label: "Amenity: Fast Food", category: "Amenities - Sustenance" },
  { value: "food_court", label: "Amenity: Food Court", category: "Amenities - Sustenance" },
  { value: "ice_cream", label: "Amenity: Ice Cream", category: "Amenities - Sustenance" },
  { value: "pub", label: "Amenity: Pub", category: "Amenities - Sustenance" },
  { value: "restaurant", label: "Amenity: Restaurant", category: "Amenities - Sustenance" },

  // Amenities - Education
  { value: "college", label: "Amenity: College", category: "Amenities - Education" },
  { value: "dancing_school", label: "Amenity: Dancing School", category: "Amenities - Education" },
  { value: "driving_school", label: "Amenity: Driving School", category: "Amenities - Education" },
  { value: "first_aid_school", label: "Amenity: First Aid School", category: "Amenities - Education" },
  { value: "kindergarten", label: "Amenity: Kindergarten", category: "Amenities - Education" },
  { value: "language_school", label: "Amenity: Language School", category: "Amenities - Education" },
  { value: "library", label: "Amenity: Library", category: "Amenities - Education" },
  { value: "surf_school", label: "Amenity: Surf School", category: "Amenities - Education" },
  { value: "toy_library", label: "Amenity: Toy Library", category: "Amenities - Education" },
  { value: "research_institute", label: "Amenity: Research Institute", category: "Amenities - Education" },
  { value: "training", label: "Amenity: Training", category: "Amenities - Education" },
  { value: "music_school", label: "Amenity: Music School", category: "Amenities - Education" },
  { value: "school", label: "Amenity: School", category: "Amenities - Education" },
  { value: "traffic_park", label: "Amenity: Traffic Park", category: "Amenities - Education" },
  { value: "university", label: "Amenity: University", category: "Amenities - Education" },

  // Amenities - Transportation
  { value: "bicycle_parking", label: "Amenity: Bicycle Parking", category: "Amenities - Transportation" },
  { value: "bicycle_repair_station", label: "Amenity: Bicycle Repair Station", category: "Amenities - Transportation" },
  { value: "bicycle_rental", label: "Amenity: Bicycle Rental", category: "Amenities - Transportation" },
  { value: "bicycle_wash", label: "Amenity: Bicycle Wash", category: "Amenities - Transportation" },
  { value: "boat_rental", label: "Amenity: Boat Rental", category: "Amenities - Transportation" },
  { value: "boat_sharing", label: "Amenity: Boat Sharing", category: "Amenities - Transportation" },
  { value: "bus_station", label: "Amenity: Bus Station", category: "Amenities - Transportation" },
  { value: "car_rental", label: "Amenity: Car Rental", category: "Amenities - Transportation" },
  { value: "car_sharing", label: "Amenity: Car Sharing", category: "Amenities - Transportation" },
  { value: "car_wash", label: "Amenity: Car Wash", category: "Amenities - Transportation" },
  { value: "compressed_air", label: "Amenity: Compressed Air", category: "Amenities - Transportation" },
  { value: "vehicle_inspection", label: "Amenity: Vehicle Inspection", category: "Amenities - Transportation" },
  { value: "charging_station", label: "Amenity: Charging Station", category: "Amenities - Transportation" },
  { value: "driver_training", label: "Amenity: Driver Training", category: "Amenities - Transportation" },
  { value: "ferry_terminal", label: "Amenity: Ferry Terminal", category: "Amenities - Transportation" },
  { value: "fuel", label: "Amenity: Fuel", category: "Amenities - Transportation" },
  { value: "grit_bin", label: "Amenity: Grit Bin", category: "Amenities - Transportation" },
  { value: "motorcycle_parking", label: "Amenity: Motorcycle Parking", category: "Amenities - Transportation" },
  { value: "parking", label: "Amenity: Parking", category: "Amenities - Transportation" },
  { value: "parking_entrance", label: "Amenity: Parking Entrance", category: "Amenities - Transportation" },
  { value: "parking_space", label: "Amenity: Parking Space", category: "Amenities - Transportation" },
  { value: "taxi", label: "Amenity: Taxi", category: "Amenities - Transportation" },
  { value: "weighbridge", label: "Amenity: Weighbridge", category: "Amenities - Transportation" },

  // Amenities - Financial
  { value: "atm", label: "Amenity: ATM", category: "Amenities - Financial" },
  { value: "payment_terminal", label: "Amenity: Payment Terminal", category: "Amenities - Financial" },
  { value: "bank", label: "Amenity: Bank", category: "Amenities - Financial" },
  { value: "bureau_de_change", label: "Amenity: Bureau de Change", category: "Amenities - Financial" },
  { value: "money_transfer", label: "Amenity: Money Transfer", category: "Amenities - Financial" },
  { value: "payment_centre", label: "Amenity: Payment Centre", category: "Amenities - Financial" },

  // Amenities - Healthcare
  { value: "baby_hatch", label: "Amenity: Baby Hatch", category: "Amenities - Healthcare" },
  { value: "clinic", label: "Amenity: Clinic", category: "Amenities - Healthcare" },
  { value: "dentist", label: "Amenity: Dentist", category: "Amenities - Healthcare" },
  { value: "doctors", label: "Amenity: Doctors", category: "Amenities - Healthcare" },
  { value: "hospital", label: "Amenity: Hospital", category: "Amenities - Healthcare" },
  { value: "nursing_home", label: "Amenity: Nursing Home", category: "Amenities - Healthcare" },
  { value: "pharmacy", label: "Amenity: Pharmacy", category: "Amenities - Healthcare" },
  { value: "social_facility", label: "Amenity: Social Facility", category: "Amenities - Healthcare" },
  { value: "veterinary", label: "Amenity: Veterinary", category: "Amenities - Healthcare" },

  // Amenities - Entertainment, Arts & Culture
  { value: "arts_centre", label: "Amenity: Arts Centre", category: "Amenities - Entertainment" },
  { value: "brothel", label: "Amenity: Brothel", category: "Amenities - Entertainment" },
  { value: "casino", label: "Amenity: Casino", category: "Amenities - Entertainment" },
  { value: "cinema", label: "Amenity: Cinema", category: "Amenities - Entertainment" },
  { value: "community_centre", label: "Amenity: Community Centre", category: "Amenities - Entertainment" },
  { value: "conference_centre", label: "Amenity: Conference Centre", category: "Amenities - Entertainment" },
  { value: "events_venue", label: "Amenity: Events Venue", category: "Amenities - Entertainment" },
  { value: "exhibition_centre", label: "Amenity: Exhibition Centre", category: "Amenities - Entertainment" },
  { value: "fountain", label: "Amenity: Fountain", category: "Amenities - Entertainment" },
  { value: "gambling", label: "Amenity: Gambling", category: "Amenities - Entertainment" },
  { value: "love_hotel", label: "Amenity: Love Hotel", category: "Amenities - Entertainment" },
  { value: "music_venue", label: "Amenity: Music Venue", category: "Amenities - Entertainment" },
  { value: "nightclub", label: "Amenity: Nightclub", category: "Amenities - Entertainment" },
  { value: "planetarium", label: "Amenity: Planetarium", category: "Amenities - Entertainment" },
  { value: "public_bookcase", label: "Amenity: Public Bookcase", category: "Amenities - Entertainment" },
  { value: "social_centre", label: "Amenity: Social Centre", category: "Amenities - Entertainment" },
  { value: "stage", label: "Amenity: Stage", category: "Amenities - Entertainment" },
  { value: "stripclub", label: "Amenity: Stripclub", category: "Amenities - Entertainment" },
  { value: "studio", label: "Amenity: Studio", category: "Amenities - Entertainment" },
  { value: "swingerclub", label: "Amenity: Swingerclub", category: "Amenities - Entertainment" },
  { value: "theatre", label: "Amenity: Theatre", category: "Amenities - Entertainment" },

  // Amenities - Public Service
  { value: "courthouse", label: "Amenity: Courthouse", category: "Amenities - Public Service" },
  { value: "fire_station", label: "Amenity: Fire Station", category: "Amenities - Public Service" },
  { value: "police", label: "Amenity: Police", category: "Amenities - Public Service" },
  { value: "post_box", label: "Amenity: Post Box", category: "Amenities - Public Service" },
  { value: "post_depot", label: "Amenity: Post Depot", category: "Amenities - Public Service" },
  { value: "post_office", label: "Amenity: Post Office", category: "Amenities - Public Service" },
  { value: "prison", label: "Amenity: Prison", category: "Amenities - Public Service" },
  { value: "ranger_station", label: "Amenity: Ranger Station", category: "Amenities - Public Service" },
  { value: "townhall", label: "Amenity: Townhall", category: "Amenities - Public Service" },

  // Amenities - Facilities
  { value: "bbq", label: "Amenity: BBQ", category: "Amenities - Facilities" },
  { value: "bench", label: "Amenity: Bench", category: "Amenities - Facilities" },
  { value: "dog_toilet", label: "Amenity: Dog Toilet", category: "Amenities - Facilities" },
  { value: "dressing_room", label: "Amenity: Dressing Room", category: "Amenities - Facilities" },
  { value: "drinking_water", label: "Amenity: Drinking Water", category: "Amenities - Facilities" },
  { value: "give_box", label: "Amenity: Give Box", category: "Amenities - Facilities" },
  { value: "lounge", label: "Amenity: Lounge", category: "Amenities - Facilities" },
  { value: "mailroom", label: "Amenity: Mailroom", category: "Amenities - Facilities" },
  { value: "parcel_locker", label: "Amenity: Parcel Locker", category: "Amenities - Facilities" },
  { value: "shelter", label: "Amenity: Shelter", category: "Amenities - Facilities" },
  { value: "shower", label: "Amenity: Shower", category: "Amenities - Facilities" },
  { value: "telephone", label: "Amenity: Telephone", category: "Amenities - Facilities" },
  { value: "toilets", label: "Amenity: Toilets", category: "Amenities - Facilities" },
  { value: "water_point", label: "Amenity: Water Point", category: "Amenities - Facilities" },
  { value: "watering_place", label: "Amenity: Watering Place", category: "Amenities - Facilities" },

  // Amenities - Waste Management
  { value: "sanitary_dump_station", label: "Amenity: Sanitary Dump Station", category: "Amenities - Waste Management" },
  { value: "recycling", label: "Amenity: Recycling", category: "Amenities - Waste Management" },
  { value: "waste_basket", label: "Amenity: Waste Basket", category: "Amenities - Waste Management" },
  { value: "waste_disposal", label: "Amenity: Waste Disposal", category: "Amenities - Waste Management" },
  {
    value: "waste_transfer_station",
    label: "Amenity: Waste Transfer Station",
    category: "Amenities - Waste Management",
  },

  // Amenities - Others
  { value: "animal_boarding", label: "Amenity: Animal Boarding", category: "Amenities - Others" },
  { value: "animal_breeding", label: "Amenity: Animal Breeding", category: "Amenities - Others" },
  { value: "animal_shelter", label: "Amenity: Animal Shelter", category: "Amenities - Others" },
  { value: "animal_training", label: "Amenity: Animal Training", category: "Amenities - Others" },
  { value: "baking_oven", label: "Amenity: Baking Oven", category: "Amenities - Others" },
  { value: "clock", label: "Amenity: Clock", category: "Amenities - Others" },
  { value: "crematorium", label: "Amenity: Crematorium", category: "Amenities - Others" },
  { value: "dive_centre", label: "Amenity: Dive Centre", category: "Amenities - Others" },
  { value: "funeral_hall", label: "Amenity: Funeral Hall", category: "Amenities - Others" },
  { value: "grave_yard", label: "Amenity: Grave Yard", category: "Amenities - Others" },
  { value: "hunting_stand", label: "Amenity: Hunting Stand", category: "Amenities - Others" },
  { value: "internet_cafe", label: "Amenity: Internet Cafe", category: "Amenities - Others" },
  { value: "kitchen", label: "Amenity: Kitchen", category: "Amenities - Others" },
  { value: "kneipp_water_cure", label: "Amenity: Kneipp Water Cure", category: "Amenities - Others" },
  { value: "lounger", label: "Amenity: Lounger", category: "Amenities - Others" },
  { value: "marketplace", label: "Amenity: Marketplace", category: "Amenities - Others" },
  { value: "monastery", label: "Amenity: Monastery", category: "Amenities - Others" },
  { value: "mortuary", label: "Amenity: Mortuary", category: "Amenities - Others" },
  { value: "photo_booth", label: "Amenity: Photo Booth", category: "Amenities - Others" },
  { value: "place_of_mourning", label: "Amenity: Place of Mourning", category: "Amenities - Others" },
  { value: "place_of_worship", label: "Amenity: Place of Worship", category: "Amenities - Others" },
  { value: "public_bath", label: "Amenity: Public Bath", category: "Amenities - Others" },
  { value: "public_building", label: "Amenity: Public Building", category: "Amenities - Others" },
  { value: "refugee_site", label: "Amenity: Refugee Site", category: "Amenities - Others" },
  { value: "vending_machine", label: "Amenity: Vending Machine", category: "Amenities - Others" },
]

export function OsmForm() {
  // Predefined OSM tag keys
  const tagGroups = {
    basic: [
      { key: "name", label: "Name", placeholder: "e.g., LG calçados" },
      { key: "shop_amenity", label: "Shop/Amenity Type", placeholder: "e.g., shoes", isShopType: true },
      { key: "description", label: "Description", placeholder: "Describe the place...", multiline: true },
      { key: "opening_hours", label: "Opening Hours", placeholder: "e.g., Mo-Su 08:00-19:00" },
      { key: "check_date", label: "Check Date", placeholder: "e.g., 2025-04-17" },
      { key: "survey:date", label: "Survey Date", placeholder: "e.g., 2025-04-17" },
      { key: "access", label: "Public Access", isCheckbox: true },
      { key: "website", label: "Website", placeholder: "e.g., https://example.com" },
      {
        key: "contact:instagram",
        label: "Instagram",
        placeholder: "e.g., https://instagram.com/username",
      },
    ],
    address: [
      { key: "addr:street", label: "Street", placeholder: "e.g., Avenida Saramenha" },
      { key: "addr:housenumber", label: "House Number", placeholder: "e.g., 123" },
      { key: "addr:suburb", label: "Suburb/Neighborhood", placeholder: "e.g., Pampulha" },
      { key: "addr:city", label: "City", placeholder: "e.g., Belo Horizonte" },
      { key: "addr:postcode", label: "Postal Code", placeholder: "e.g., 30000-000" },
      { key: "phone", label: "Phone", placeholder: "e.g., +55 31 99258 7346" },
    ],
    payment: [
      { key: "payment:credit_cards", label: "Credit Cards", isCheckbox: true },
      { key: "payment:apple_pay", label: "Apple Pay", isCheckbox: true },
      { key: "payment:google_pay", label: "Google Pay", isCheckbox: true },
      { key: "payment:lightning_contactless", label: "Lightning Contactless", isCheckbox: true },
      { key: "payment:lightning", label: "Lightning", isCheckbox: true },
      { key: "payment:onchain", label: "Bitcoin On-chain", isCheckbox: true },
    ],
    currency: [
      { key: "currency:BRL", label: "Brazilian Real (BRL)", isCheckbox: true },
      { key: "currency:XBT", label: "Bitcoin (XBT)", isCheckbox: true },
    ],
    custom: [
      { key: "CBTC", label: "Community (CBTC)", placeholder: "Select a community...", isCbtcSelector: true },
      { key: "OBTC", label: "OBTC", placeholder: "e.g., UAIBIT" },
      { key: "PBTC", label: "Image URL (PBTC)", placeholder: "https://..." },
    ],
  }

  // State for coordinates
  const [latitude, setLatitude] = useState("-19.8430171")
  const [longitude, setLongitude] = useState("-43.9191272")

  // State for tag values - Set OBTC default to "UAIBIT"
  const [tagValues, setTagValues] = useState<Record<string, string>>({
    check_date: getCurrentDate(),
    "survey:date": getCurrentDate(),
    OBTC: "UAIBIT", // Default value for OBTC
  })

  // State for manual editing
  const [isManualEdit, setIsManualEdit] = useState(false)
  const [manualTags, setManualTags] = useState("")
  const [manualEditApplied, setManualEditApplied] = useState(false)

  // State for copy button
  const [copied, setCopied] = useState(false)

  // State for active tab
  const [activeTab, setActiveTab] = useState("form")

  // Effect to parse manual tags when switching back to form mode
  useEffect(() => {
    if (manualEditApplied && !isManualEdit) {
      parseManualTagsToForm()
      setManualEditApplied(false)
    }
  }, [isManualEdit, manualEditApplied])

  // Update a tag value
  const updateTagValue = (key: string, value: string) => {
    setTagValues((prev) => ({ ...prev, [key]: value }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (key: string, checked: boolean) => {
    setTagValues((prev) => ({ ...prev, [key]: checked ? "yes" : "no" }))
  }

  // Handle shop/amenity selection
  const handleShopAmenitySelect = (value: string) => {
    // Find the selected option to determine if it's a shop or amenity
    const selectedOption = shopAndAmenityTypes.find((option) => option.value === value)

    if (selectedOption) {
      // Clear both shop and amenity values first
      const newTagValues = { ...tagValues }
      delete newTagValues.shop
      delete newTagValues.amenity

      // Set the value in the appropriate field based on the category
      if (selectedOption.category === "Shop Types") {
        newTagValues.shop = value
      } else {
        newTagValues.amenity = value
      }

      setTagValues(newTagValues)
    }
  }

  // Handle map location selection
  const handleLocationSelect = (lat: string, lon: string) => {
    setLatitude(lat)
    setLongitude(lon)
  }

  // Generate key=value format
  const generateKeyValueFormat = () => {
    // Filter out empty values and the shop_amenity field (which is just for UI)
    const filledTags = Object.entries(tagValues).filter(([key, value]) => value.trim() !== "" && key !== "shop_amenity")

    // Add coordinates
    const output = [`lat=${latitude}`, `lon=${longitude}`, ...filledTags.map(([key, value]) => `${key}=${value}`)]
    const rawOutput =  output.join(`\n${CryptoJS.SHA256(output).toString()}`)
    return 
  }

  // Get the final tags (either generated or manual)
  const getFinalTags = () => {
    return isManualEdit ? manualTags : generateKeyValueFormat()
  }

  // Toggle manual edit mode
  const toggleManualEdit = () => {
    if (!isManualEdit) {
      // Switching to manual edit - populate with current generated tags
      setManualTags(generateKeyValueFormat())
    } else {
      // Switching back to form mode - mark that we need to parse manual tags
      setManualEditApplied(true)
    }
    setIsManualEdit(!isManualEdit)
  }

  // Parse manual tags back to form fields
  const parseManualTagsToForm = () => {
    const lines = manualTags.split("\n").filter((line) => line.trim() !== "")
    const newTagValues: Record<string, string> = {}

    lines.forEach((line) => {
      const [key, ...valueParts] = line.split("=")
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=") // In case the value contains '='

        if (key === "lat") {
          setLatitude(value)
        } else if (key === "lon") {
          setLongitude(value)
        } else {
          newTagValues[key] = value
        }
      }
    })

    setTagValues(newTagValues)
  }

  // Reset to form-generated tags
  const resetToFormTags = () => {
    setManualTags(generateKeyValueFormat())
  }

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFinalTags())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download as text file
  const downloadText = () => {
    const blob = new Blob([getFinalTags()], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `osm_tags.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Get the current selected value for the shop/amenity dropdown
  const getShopAmenityValue = () => {
    if (tagValues.shop) {
      return tagValues.shop
    } else if (tagValues.amenity) {
      return tagValues.amenity
    }
    return ""
  }

  // Update address fields when a search result is selected
  const updateAddressFromSearch = (displayName: string) => {
    // This is a simple implementation - in a real app, you might want to parse the address more carefully
    const parts = displayName.split(", ")

    if (parts.length >= 3) {
      // Try to extract some address components
      // This is a very simplified approach and might need adjustment based on the actual format of results
      updateTagValue("addr:city", parts[parts.length - 3] || "")

      // If there's a postal code in the format "12345" or similar at the end
      const postalCodeMatch = displayName.match(/\b\d{5,}\b/)
      if (postalCodeMatch) {
        updateTagValue("addr:postcode", postalCodeMatch[0])
      }

      // Try to get the street name - this is very approximate
      if (parts.length > 3) {
        updateTagValue("addr:street", parts[0])
      }
    }
  }

  // Render form field based on tag definition
  const renderField = (tag: {
    key: string
    label: string
    placeholder?: string
    multiline?: boolean
    isShopType?: boolean
    isCheckbox?: boolean
    isCbtcSelector?: boolean
  }) => {
    // Special case for PBTC (image upload)
    if (tag.key === "PBTC") {
      return (
        <div className="space-y-2" key={tag.key}>
          <Label htmlFor={tag.key}>{tag.label}</Label>
          <ImageUploader value={tagValues[tag.key] || ""} onChange={(value) => updateTagValue(tag.key, value)} />
        </div>
      )
    }

    // Special case for CBTC community selector
    if (tag.isCbtcSelector) {
      return (
        <div className="space-y-2" key={tag.key}>
          <Label htmlFor={tag.key}>{tag.label}</Label>
          <CbtcSelector
            id={tag.key}
            value={tagValues[tag.key] || ""}
            onChange={(value) => updateTagValue(tag.key, value)}
            placeholder={tag.placeholder || "Select a community..."}
          />
          <div className="text-xs text-muted-foreground">
            Will be saved as: CBTC={tagValues[tag.key] || "(not selected)"}
          </div>
        </div>
      )
    }

    // Special case for shop/amenity type dropdown with search
    if (tag.isShopType) {
      return (
        <div className="space-y-2" key={tag.key}>
          <Label htmlFor={tag.key}>{tag.label}</Label>
          <ShopTypeSelector
            id={tag.key}
            value={getShopAmenityValue()}
            onChange={handleShopAmenitySelect}
            placeholder={tag.placeholder || "Select type..."}
            options={shopAndAmenityTypes}
          />
          <div className="text-xs text-muted-foreground">
            {tagValues.shop && <span>Will be saved as: shop={tagValues.shop}</span>}
            {tagValues.amenity && <span>Will be saved as: amenity={tagValues.amenity}</span>}
          </div>
        </div>
      )
    }

    // Checkbox for yes/no fields
    if (tag.isCheckbox) {
      const isChecked = tagValues[tag.key] === "yes"
      return (
        <div className="flex items-center space-x-2" key={tag.key}>
          <Checkbox
            id={tag.key}
            checked={isChecked}
            onCheckedChange={(checked) => handleCheckboxChange(tag.key, checked as boolean)}
          />
          <Label
            htmlFor={tag.key}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {tag.label}
          </Label>
        </div>
      )
    }

    // Multiline text area
    if (tag.multiline) {
      return (
        <div className="space-y-2" key={tag.key}>
          <Label htmlFor={tag.key}>{tag.label}</Label>
          <Textarea
            id={tag.key}
            placeholder={tag.placeholder}
            value={tagValues[tag.key] || ""}
            onChange={(e) => updateTagValue(tag.key, e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      )
    }

    // Default input
    return (
      <div className="space-y-2" key={tag.key}>
        <Label htmlFor={tag.key}>{tag.label}</Label>
        <Input
          id={tag.key}
          placeholder={tag.placeholder}
          value={tagValues[tag.key] || ""}
          onChange={(e) => updateTagValue(tag.key, e.target.value)}
        />
      </div>
    )
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">OSM Tag Form</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="github">Create GitHub Issue</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <MapPicker
                      initialLat={Number.parseFloat(latitude)}
                      initialLon={Number.parseFloat(longitude)}
                      onLocationSelect={handleLocationSelect}
                    />

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input id="latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input id="longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isManualEdit && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tag Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="basic">
                      <TabsList className="grid grid-cols-5 mb-4">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="address">Address</TabsTrigger>
                        <TabsTrigger value="payment">Payment</TabsTrigger>
                        <TabsTrigger value="currency">Currency</TabsTrigger>
                        <TabsTrigger value="custom">Custom</TabsTrigger>
                      </TabsList>

                      {Object.entries(tagGroups).map(([group, tags]) => (
                        <TabsContent key={group} value={group} className="space-y-4">
                          {tags.map(renderField)}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated OSM Tags</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleManualEdit}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Edit3 className="h-4 w-4" />
                      {isManualEdit ? "Form Mode" : "Manual Edit"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isManualEdit ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="manual-tags">Edit Tags Manually</Label>
                        <Button variant="ghost" size="sm" onClick={resetToFormTags} className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          Reset to Form
                        </Button>
                      </div>
                      <Textarea
                        id="manual-tags"
                        value={manualTags}
                        onChange={(e) => setManualTags(e.target.value)}
                        className="min-h-[500px] font-mono text-sm"
                        placeholder="lat=-19.8430171
lon=-43.9191272
name=Example Location
shop=convenience
..."
                      />
                      <div className="text-xs text-muted-foreground">
                        Format: key=value (one per line). Changes will be reflected when you switch back to Form Mode.
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] w-full rounded-md border p-4 mb-4">
                      <pre className="text-sm font-mono whitespace-pre-wrap">{generateKeyValueFormat()}</pre>
                    </ScrollArea>
                  )}

                  <div className="flex gap-4 mt-4">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={copyToClipboard}>
                      <Copy className="mr-2 h-4 w-4" />
                      {copied ? "Copied!" : "Copy Tags"}
                    </Button>
                    <Button className="flex-1" onClick={downloadText}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Tags
                    </Button>
                    <Button variant="secondary" className="flex-1" onClick={() => setActiveTab("github")}>
                      <Github className="mr-2 h-4 w-4" />
                      Create Issue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="github" className="mt-6">
          <GithubIssueForm
            osmData={getFinalTags()}
            locationName={tagValues["name"] || "New Location"}
            onBack={() => setActiveTab("form")}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
