"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NewThreadFormProps {
  category: string
}

export function NewThreadForm({ category }: NewThreadFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in to create a thread")
        return
      }

      // Get user profile for author name
      const { data: profile } = await supabase.from("profiles").select("full_name, username").eq("id", user.id).single()

      const authorName = profile?.full_name || profile?.username || user.email || "Anonymous"

      // Create thread
      const { data: thread, error: threadError } = await supabase
        .from("forum_threads")
        .insert({
          title: title.trim(),
          content: content.trim(),
          category,
          author_id: user.id,
          author_name: authorName,
        })
        .select()
        .single()

      if (threadError) {
        console.error("Thread creation error:", threadError)
        setError("Failed to create thread. Please try again.")
        return
      }

      // Redirect to the new thread
      router.push(`/community/${category}/${thread.id}`)
    } catch (error) {
      console.error("Error creating thread:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
          Create New Thread
        </CardTitle>
        <p className="text-gray-600">Share your thoughts in the {category} community</p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Thread Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, experiences, or questions..."
              disabled={loading}
              className="w-full min-h-[200px] resize-none"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Thread"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
