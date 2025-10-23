export interface OsmNode {
  id: string
  lat: string
  lon: string
  tags: {
    name?: string
    "addr:housenumber"?: string
    "addr:street"?: string
    "addr:city"?: string
    "addr:state"?: string
    "addr:postcode"?: string
    "addr:country"?: string
    phone?: string
    website?: string
    email?: string
    opening_hours?: string
    cuisine?: string
    shop?: string
    amenity?: string
    "railway:cbtc"?: string
    [key: string]: string | undefined // Allow for other arbitrary tags
  }
}
