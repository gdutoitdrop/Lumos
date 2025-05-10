"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createThread } from "@/actions/forum"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function NewThreadForm({ categorySlug }: { categorySlug: string }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createThread({
        title,
        content,
        categorySlug,
      })

      if (result.success) {
        toast({
          title: "Thread created",
          description: "Your thread has been posted successfully.",
        })
        router.push(`/community/${categorySlug}/${result.threadId}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create thread. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating thread:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, questions, or experiences..."
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="resize-y"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Thread"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
