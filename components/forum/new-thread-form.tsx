"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"

export function NewThreadForm({ category }: { category: string }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setSubmitting(true)

    try {
      // In a real implementation, you would save this to the database
      // For now, we'll just simulate a successful submission

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to the category page
      router.push(`/community/${category}`)
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the thread")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="mb-4">You need to be logged in to create a new thread.</p>
          <Button asChild>
            <a href="/login">Log In</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your thread"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or experiences..."
              rows={8}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
            disabled={submitting || !title.trim() || !content.trim()}
          >
            {submitting ? "Creating Thread..." : "Create Thread"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
