import type { OsmNode } from "@/types/osm"

export function parseOsmXml(xmlString: string): OsmNode {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, "text/xml")

  // Find the first node element
  const nodeElement = xmlDoc.querySelector("node")

  if (!nodeElement) {
    throw new Error("No node element found in the XML")
  }

  // Extract node attributes
  const id = nodeElement.getAttribute("id") || ""
  const version = nodeElement.getAttribute("version") || ""
  const lat = nodeElement.getAttribute("lat") || ""
  const lon = nodeElement.getAttribute("lon") || ""

  // Extract tags
  const tagElements = nodeElement.querySelectorAll("tag")
  const tags = Array.from(tagElements).map((tagElement) => ({
    k: tagElement.getAttribute("k") || "",
    v: tagElement.getAttribute("v") || "",
  }))

  return {
    id,
    version,
    lat,
    lon,
    tags,
  }
}

export function generateOsmXml(node: OsmNode): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6">
  <node id="${node.id}" visible="true" version="${node.version}" lat="${node.lat}" lon="${node.lon}">
${node.tags.map((tag) => `    <tag k="${tag.k}" v="${tag.v.replace(/"/g, "&quot;")}"/>`).join("\n")}
  </node>
</osm>`
}
