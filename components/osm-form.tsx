"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShopTypeSelector } from "@/components/shop-type-selector"
import { CbtcSelector } from "@/components/cbtc-selector"
import type { OsmNode } from "@/types/osm"

interface OsmFormProps {
  osmData: OsmNode | null
  onOsmDataChange: (data: OsmNode) => void
  selectedLocation: { lat: string; lon: string } | null
}

export function OsmForm({ osmData, onOsmDataChange, selectedLocation }: OsmFormProps) {
  const [formData, setFormData] = useState<OsmNode>({
    id: "-1",
    lat: selectedLocation?.lat || "",
    lon: selectedLocation?.lon || "",
    tags: {
      name: "",
      "addr:housenumber": "",
      "addr:street": "",
      "addr:city": "",
      "addr:state": "",
      "addr:postcode": "",
      "addr:country": "",
      phone: "",
      website: "",
      email: "",
      opening_hours: "",
      cuisine: "",
      shop: "",
      amenity: "",
      "railway:cbtc": "",
    },
  })

  useEffect(() => {
    if (osmData) {
      setFormData(osmData)
    } else if (selectedLocation) {
      setFormData((prev) => ({
        ...prev,
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
      }))
    }
  }, [osmData, selectedLocation])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "lat" || name === "lon") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        tags: {
          ...prev.tags,
          [name]: value,
        },
      }))
    }
  }

  const handleShopTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: {
        ...prev.tags,
        shop: value,
        amenity: "",
      },
    }))
  }

  const handleAmenityTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: {
        ...prev.tags,
        amenity: value,
        shop: "",
      },
    }))
  }

  const handleCbtcChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: {
        ...prev.tags,
        "railway:cbtc": value,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onOsmDataChange(formData)
    console.log("Form Data Submitted:", formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit OSM Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Details</h3>
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                name="lat"
                value={formData.lat}
                onChange={handleInputChange}
                type="number"
                step="any"
                placeholder="e.g., 37.7749"
                required
              />
            </div>
            <div>
              <Label htmlFor="lon">Longitude</Label>
              <Input
                id="lon"
                name="lon"
                value={formData.lon}
                onChange={handleInputChange}
                type="number"
                step="any"
                placeholder="e.g., -122.4194"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.tags.name || ""}
                onChange={handleInputChange}
                placeholder="e.g., My Awesome Shop"
              />
            </div>
            <div>
              <Label htmlFor="shop">Shop Type</Label>
              <ShopTypeSelector value={formData.tags.shop || ""} onValueChange={handleShopTypeChange} />
            </div>
            <div>
              <Label htmlFor="amenity">Amenity Type</Label>
              <ShopTypeSelector
                value={formData.tags.amenity || ""}
                onValueChange={handleAmenityTypeChange}
                isAmenity={true}
              />
            </div>
            <div>
              <Label htmlFor="cbtc">Railway CBTC</Label>
              <CbtcSelector value={formData.tags["railway:cbtc"] || ""} onValueChange={handleCbtcChange} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Details</h3>
            <div>
              <Label htmlFor="addr:housenumber">House Number</Label>
              <Input
                id="addr:housenumber"
                name="addr:housenumber"
                value={formData.tags["addr:housenumber"] || ""}
                onChange={handleInputChange}
                placeholder="e.g., 123"
              />
            </div>
            <div>
              <Label htmlFor="addr:street">Street</Label>
              <Input
                id="addr:street"
                name="addr:street"
                value={formData.tags["addr:street"] || ""}
                onChange={handleInputChange}
                placeholder="e.g., Main St"
              />
            </div>
            <div>
              <Label htmlFor="addr:city">City</Label>
              <Input
                id="addr:city"
                name="addr:city"
                value={formData.tags["addr:city"] || ""}
                onChange={handleInputChange}
                placeholder="e.g., San Francisco"
              />
            </div>
            <div>
              <Label htmlFor="addr:state">State/Province</Label>
              <Input
                id="addr:state"
                name="addr:state"
                value={formData.tags["addr:state"] || ""}
                onChange={handleInputChange}
                placeholder="e.g., California or CA"
              />
            </div>
            <div>
              <Label htmlFor="addr:postcode">Postcode</Label>
              <Input
                id="addr:postcode"
                name="addr:postcode"
                value={formData.tags["addr:postcode"] || ""}
                onChange={handleInputChange}
                placeholder="e.g., 94105"
              />
            </div>
            <div>
              <Label htmlFor="addr:country">Country</Label>
              <Input
                id="addr:country"
                name="addr:country"
                value={formData.tags["addr:country"] || ""}
                onChange={handleInputChange}
                placeholder="e.g., USA"
              />
            </div>

            <h3 className="text-lg font-semibold mt-6">Contact & Hours</h3>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.tags.phone || ""}
                onChange={handleInputChange}
                placeholder="e.g., +1 555 123 4567"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.tags.website || ""}
                onChange={handleInputChange}
                placeholder="e.g., https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.tags.email || ""}
                onChange={handleInputChange}
                type="email"
                placeholder="e.g., info@example.com"
              />
            </div>
            <div>
              <Label htmlFor="opening_hours">Opening Hours</Label>
              <Input
                id="opening_hours"
                name="opening_hours"
                value={formData.tags.opening_hours || ""}
                onChange={handleInputChange}
                placeholder="e.g., Mo-Fr 09:00-17:00"
              />
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input
                id="cuisine"
                name="cuisine"
                value={formData.tags.cuisine || ""}
                onChange={handleInputChange}
                placeholder="e.g., Italian, Pizza"
              />
            </div>
          </div>
          <div className="col-span-full flex justify-end">
            <Button type="submit">Update OSM Data</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
