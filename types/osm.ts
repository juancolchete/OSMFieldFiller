export interface OsmTag {
  k: string // key
  v: string // value
}

export interface OsmNode {
  id: string
  version: string
  lat: string
  lon: string
  tags: OsmTag[]
}
