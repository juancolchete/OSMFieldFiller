"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface XmlUploaderProps {
  onXmlUploaded: (xml: string) => void
}

export function XmlUploader({ onXmlUploaded }: XmlUploaderProps) {
  const [xmlContent, setXmlContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".xml") && file.type !== "application/xml" && file.type !== "text/xml") {
      setError("Please upload an XML file")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setXmlContent(content)
    }
    reader.readAsText(file)
  }

  const handleSubmit = () => {
    if (!xmlContent.trim()) {
      setError("Please enter or upload XML content")
      return
    }

    if (!xmlContent.includes("<osm") || !xmlContent.includes("</osm>")) {
      setError("Invalid OSM XML format")
      return
    }

    onXmlUploaded(xmlContent)
  }

  const handlePasteExample = () => {
    const exampleXml = `<osm version="0.6" generator="openstreetmap-cgimap 2.0.1 (1080964 spike-07.openstreetmap.org)" copyright="OpenStreetMap and contributors" attribution="http://www.openstreetmap.org/copyright" license="http://opendatacommons.org/licenses/odbl/1-0/">
<node id="12618816495" visible="true" version="8" changeset="166072955" timestamp="2025-05-10T14:49:36Z" user="mueschel" uid="616774" lat="-19.8430171" lon="-43.9191272">
<tag k="addr:city" v="Belo Horizonte"/>
<tag k="addr:street" v="Avenida Saramenha"/>
<tag k="CBTC" v="BitcoinBH"/>
<tag k="check_date" v="2025-04-17"/>
<tag k="currency:BRL" v="yes"/>
<tag k="currency:XBT" v="yes"/>
<tag k="description" v="LG Calçados, oferece uma seleção premium de tênis, sandálias, botas e sapatos sociais para todos os estilos e ocasiões. Nosso foco é unir conforto e durabilidade, garantindo que você caminhe sempre com segurança e estilo."/>
<tag k="image" v="https://raw.githubusercontent.com/UAIBIT/PBTC/refs/heads/main/LGCalcados.jpg"/>
<tag k="name" v="LG calçados"/>
<tag k="OBTC" v="UAIBIT"/>
<tag k="opening_hours" v="Mo-Su 08:00-19:00"/>
<tag k="payment:apple_pay" v="yes"/>
<tag k="payment:credit_cards" v="yes"/>
<tag k="payment:google_pay" v="yes"/>
<tag k="phone" v="+55 31 99258 7346"/>
<tag k="shop" v="shoes"/>
</node>
</osm>`
    setXmlContent(exampleXml)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload OSM XML</CardTitle>
          <CardDescription>Upload an OpenStreetMap XML file or paste the XML content below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="xml-file" className="text-sm font-medium">
                Upload XML File
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="xml-file"
                  type="file"
                  accept=".xml,application/xml,text/xml"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button variant="outline" onClick={() => document.getElementById("xml-file")?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <Button variant="secondary" onClick={handlePasteExample}>
                  Use Example
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="xml-content" className="text-sm font-medium">
                Or Paste XML Content
              </label>
              <Textarea
                id="xml-content"
                placeholder="Paste your OSM XML content here..."
                className="min-h-[200px] font-mono text-sm"
                value={xmlContent}
                onChange={(e) => {
                  setXmlContent(e.target.value)
                  setError(null)
                }}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full" onClick={handleSubmit}>
              Process XML
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
