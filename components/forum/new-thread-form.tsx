"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  const [profileId, setProfileId] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get the user's profile ID
    const getProfileId = async () => {
      if (!user) return

      try {
        // Try to get profile by auth_id first
        let { data, error } = await supabase.from("profiles").select("id").eq("auth_id", user.id).single()

        if (error || !data) {
          // If that fails, try by id directly
          const { data: directData, error: directError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single()

          if (directError) {
            console.error("Error fetching profile:", directError)
            return
          }

          data = directData
        }

        if (data) {
          setProfileId(data.id)
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
    }

    getProfileId()
  }, [user, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError("You must be logged in to create a thread")
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      console.log("Creating thread with user ID:", user.id, "profile ID:", profileId)

      // Create the thread with both author_id and profile_id for maximum compatibility
      const threadData: any = {
        title: title.trim(),
        content: content.trim(),
        category,
        author_id: user.id,
      }

      // Add profile_id if we have it
      if (profileId) {
        threadData.profile_id = profileId
      }

      const { data: thread, error: threadError } = await supabase
        .from("forum_threads")
        .insert(threadData)
        .select()
        .single()

      if (threadError) {
        console.error("Thread creation error:", threadError)
        throw threadError
      }

      console.log("Thread created successfully:", thread)

      // Redirect to the new thread
      router.push(`/community/${category}/${thread.id}`)
    } catch (err: any) {
      console.error("Final error:", err)
      setError(err.message || "An error occurred while creating the thread. Please try again.")
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
              maxLength={255}
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
              minLength={10}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
            disabled={submitting || !title.trim() || !content.trim() || content.trim().length < 10}
          >
            {submitting ? "Creating Thread..." : "Create Thread"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
