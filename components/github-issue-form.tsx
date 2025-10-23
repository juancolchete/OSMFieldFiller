"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GithubIssueFormProps {
  osmData: any
  locationName: string
  onBack: () => void
}

export function GithubIssueForm({ osmData, locationName, onBack }: GithubIssueFormProps) {
  const [title, setTitle] = useState(`OSM Field Update: ${locationName}`)
  const [description, setDescription] = useState(
    `Proposed update for OSM data at ${locationName}:\n\n\`\`\`json\n${JSON.stringify(osmData, null, 2)}\n\`\`\``,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage(null)

    try {
      const response = await fetch("/api/create-github-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body: description }),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setTitle(`OSM Field Update: ${locationName}`) // Reset title
        setDescription(
          `Proposed update for OSM data at ${locationName}:\n\n\`\`\`json\n${JSON.stringify(osmData, null, 2)}\n\`\`\``,
        ) // Reset description
      } else {
        const errorData = await response.json()
        setSubmitStatus("error")
        setErrorMessage(errorData.error || "Failed to create GitHub issue.")
      }
    } catch (error) {
      console.error("Error creating GitHub issue:", error)
      setSubmitStatus("error")
      setErrorMessage("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create GitHub Issue</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="issue-title">Issue Title</Label>
            <Input
              id="issue-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Update shop type for XYZ Cafe"
            />
          </div>
          <div>
            <Label htmlFor="issue-description">Issue Description</Label>
            <Textarea
              id="issue-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              required
              placeholder="Provide details about the OSM field update."
            />
          </div>
          <div className="flex justify-between items-center">
            <Button type="button" variant="outline" onClick={onBack}>
              Back to Form
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Issue..." : "Create Issue"}
            </Button>
          </div>
          {submitStatus === "success" && <p className="text-green-600 mt-2">GitHub issue created successfully!</p>}
          {submitStatus === "error" && <p className="text-red-600 mt-2">Error: {errorMessage}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
