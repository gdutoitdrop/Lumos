"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { createThread } from "@/actions/forum"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export function NewThreadForm({ category }: { category: string }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("category", category)

      await createThread(formData)
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the thread")
      toast({
        title: "Error",
        description: err.message || "Failed to create thread. Please try again.",
        variant: "destructive",
      })
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
            <Link href="/login">Log In</Link>
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
