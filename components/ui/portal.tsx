"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface PortalProps {
  children: React.ReactNode
}

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Create portal root if it doesn't exist
  useEffect(() => {
    if (typeof document !== "undefined") {
      let portalRoot = document.getElementById("portal-root")
      if (!portalRoot) {
        portalRoot = document.createElement("div")
        portalRoot.id = "portal-root"
        document.body.appendChild(portalRoot)
      }
    }
  }, [])

  if (!mounted || typeof document === "undefined") return null

  const portalRoot = document.getElementById("portal-root") || document.body

  return createPortal(children, portalRoot)
}
