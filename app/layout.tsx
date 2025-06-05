import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OSM Field Filler",
  description: "A tool to help fill in OpenStreetMap fields",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* Portal root for search results and other floating elements */}
        <div id="portal-root" />
      </body>
    </html>
  )
}
