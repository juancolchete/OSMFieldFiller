// This file was added in a previous turn to implement the GitHub issue form.
// It is included here in full as per instructions.

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface GithubIssueFormProps {
  osmData?: string
  locationName?: string
  onBack?: () => void
}

export function GithubIssueForm({ osmData = "", locationName = "New Location", onBack }: GithubIssueFormProps) {
  const [title, setTitle] = useState(`OSM Update: ${locationName}`)
  const [body, setBody] = useState(`Please update the following OSM tags:\n\n\`\`\`\n${osmData}\n\`\`\``)
  const [repoOwner, setRepoOwner] = useState("osm-community") // Default owner
  const [repoName, setRepoName] = useState("osm-communities") // Default repo
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/create-github-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ owner: repoOwner, repo: repoName, title, body }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Issue Created!",
          description: `GitHub issue #${data.number} created successfully.`,
          action: (
            <a href={data.html_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">View Issue</Button>
            </a>
          ),
        })
        setTitle(`OSM Update: ${locationName}`) // Reset title
        setBody(`Please update the following OSM tags:\n\n\`\`\`\n${osmData}\n\`\`\``) // Reset body
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create GitHub issue.")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="repo-owner">Repository Owner</Label>
          <Input
            id="repo-owner"
            value={repoOwner}
            onChange={(e) => setRepoOwner(e.target.value)}
            placeholder="e.g., octocat"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="repo-name">Repository Name</Label>
          <Input
            id="repo-name"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="e.g., Spoon-Knife"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Issue Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Add new shop in downtown"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Issue Body (OSM Tags)</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter OSM tags here..."
          rows={10}
          required
          className="font-mono text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
            Back to Form
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create GitHub Issue
        </Button>
      </div>
    </form>
  )
}
