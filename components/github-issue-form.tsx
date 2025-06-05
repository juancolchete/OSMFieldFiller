"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Github, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface GithubIssueFormProps {
  osmData: string
  locationName: string
  onBack: () => void
}

interface ResultState {
  success: boolean
  message: string
  fallback?: {
    title: string
    body: string
    url: string
  }
}

export function GithubIssueForm({ osmData, locationName, onBack }: GithubIssueFormProps) {
  const [title, setTitle] = useState(`New OSM location: ${locationName}`)
  const [description, setDescription] = useState("")
  const [submitterName, setSubmitterName] = useState("")
  const [submitterEmail, setSubmitterEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      // Call our internal API route that uses a service account
      const response = await fetch("/api/create-github-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          osmData,
          submitter: {
            name: submitterName,
            email: submitterEmail,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `Issue created successfully! View it at: ${data.issueUrl}`,
        })
      } else if (data.fallback) {
        // Handle fallback for manual submission
        setResult({
          success: false,
          message: `${data.error}. You can manually create the issue:`,
          fallback: {
            title: data.issueTitle,
            body: data.issueBody,
            url: data.repoUrl,
          },
        })
      } else {
        setResult({
          success: false,
          message: `Error: ${data.error || "Failed to create issue"}`,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewIssueBody = `## OSM Location Data
${description ? `\n${description}\n` : ""}
\`\`\`
${osmData}
\`\`\`

${submitterName ? `Submitted by: ${submitterName}` : ""}
${submitterEmail ? `Contact: ${submitterEmail}` : ""}
*Submitted via OSM Field Filler*`

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Create GitHub Issue</CardTitle>
            <CardDescription>Submit this OSM data as an issue to the UAIBIT/data repository</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional information about this location..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submitterName">Your Name (optional)</Label>
                  <Input
                    id="submitterName"
                    placeholder="John Doe"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitterEmail">Your Email (optional)</Label>
                  <Input
                    id="submitterEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                  />
                </div>
              </div>

              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription className="space-y-4">
                    <p>{result.message}</p>

                    {result.fallback && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            // Open GitHub issue creation page with prefilled data
                            const params = new URLSearchParams({
                              title: result.fallback.title,
                              body: result.fallback.body,
                            })
                            window.open(`${result.fallback.url}?${params.toString()}`, "_blank")
                          }}
                        >
                          <Github className="mr-2 h-4 w-4" />
                          Create Issue Manually
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          This will open GitHub's issue creation page with the data pre-filled. You'll need to be logged
                          in to GitHub to submit the issue.
                        </p>
                      </div>
                    )}

                    {result.success && result.message.includes("View it at:") && (
                      <a
                        href={result.message.split("View it at: ")[1]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        <Github className="mr-1 h-4 w-4" />
                        View Issue
                      </a>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Form
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Issue...
                    </>
                  ) : (
                    <>
                      <Github className="mr-2 h-4 w-4" />
                      Create GitHub Issue
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Issue Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{previewIssueBody}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
