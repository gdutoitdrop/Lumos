"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

interface NewThreadFormProps {
  category: string
}

export function NewThreadForm({ category }: NewThreadFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (content.trim().length < 10) {
      setError("Content must be at least 10 characters long")
      return
    }

    setError(null)
    setSuccess(null)
    setSubmitting(true)

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("You must be logged in to create a thread")
        return
      }

      // Get user's profile for author name
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Profile fetch error:", profileError)
        // Continue with anonymous user if profile fetch fails
      }

      const authorName = profile?.full_name || profile?.username || "Anonymous User"

      const threadData = {
        title: title.trim(),
        content: content.trim(),
        category,
        author_id: user.id,
        author_name: authorName,
      }

      console.log("Creating thread with data:", threadData)

      const { data: thread, error: threadError } = await supabase
        .from("forum_threads")
        .insert(threadData)
        .select()
        .single()

      if (threadError) {
        console.error("Thread creation error:", threadError)
        throw new Error(`Failed to create thread: ${threadError.message}`)
      }

      console.log("Thread created successfully:", thread)

      setSuccess("Thread created successfully! Redirecting...")

      // Small delay to show success message
      setTimeout(() => {
        router.push(`/community/${category}/${thread.id}`)
      }, 1500)
    } catch (err: any) {
      console.error("Final error:", err)
      setError(err.message || "An error occurred while creating the thread. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
            Create New Thread in {category.charAt(0).toUpperCase() + category.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
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
                maxLength={255}
                disabled={submitting}
                className="w-full"
              />
              <p className="text-xs text-slate-500">{title.length}/255 characters</p>
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
                minLength={10}
                disabled={submitting}
                className="w-full resize-none"
              />
              <p className="text-xs text-slate-500">{content.length} characters (minimum 10 required)</p>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600 transition-all duration-200"
              disabled={submitting || !title.trim() || !content.trim() || content.trim().length < 10}
            >
              {submitting ? "Creating Thread..." : "Create Thread"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
