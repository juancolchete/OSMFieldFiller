import type { OsmNode } from "@/types/osm"

export function parseOsmXml(xmlString: string): OsmNode {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, "text/xml")

  const nodeElement = xmlDoc.querySelector("node")
  if (!nodeElement) {
    throw new Error("No <node> element found in the XML.")
  }

  const id = nodeElement.getAttribute("id") || "-1"
  const lat = nodeElement.getAttribute("lat") || ""
  const lon = nodeElement.getAttribute("lon") || ""

  const tags: { [key: string]: string } = {}
  nodeElement.querySelectorAll("tag").forEach((tagElement) => {
    const k = tagElement.getAttribute("k")
    const v = tagElement.getAttribute("v")
    if (k && v) {
      tags[k] = v
    }
  })

  return {
    id,
    lat,
    lon,
    tags,
  }
}
