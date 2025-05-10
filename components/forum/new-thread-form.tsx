"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

export function NewThreadForm({ category }: { category: string }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSubmitting(true)
    try {
      // In a real implementation, you would submit this to the database
      // For now, we'll just redirect back to the category page
      setTimeout(() => {
        router.push(`/community/${category}`)
      }, 1000)
    } catch (error) {
      console.error("Error creating thread:", error)
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Content
            </label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, questions, or experiences..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || !title.trim() || !content.trim()}>
              {submitting ? "Creating..." : "Create Thread"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
