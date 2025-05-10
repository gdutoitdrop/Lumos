"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MessageCircle, Users, Heart, Sparkles, Brain, Lightbulb } from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
  description: string
  icon: React.ReactNode
  thread_count: number
  post_count: number
}

export function ForumCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // In a real implementation, you would fetch this from the database
        // For now, we'll use static data
        const categoriesData = [
          {
            id: "1",
            name: "Anxiety Support",
            slug: "anxiety",
            description: "Discuss anxiety symptoms, coping strategies, and share your experiences",
            icon: <Brain className="h-8 w-8 text-amber-500" />,
            thread_count: 24,
            post_count: 142,
          },
          {
            id: "2",
            name: "Depression",
            slug: "depression",
            description: "A supportive space to talk about depression and recovery journeys",
            icon: <Heart className="h-8 w-8 text-blue-500" />,
            thread_count: 18,
            post_count: 97,
          },
          {
            id: "3",
            name: "Relationships",
            slug: "relationships",
            description: "Navigate relationships while managing mental health challenges",
            icon: <Users className="h-8 w-8 text-rose-500" />,
            thread_count: 15,
            post_count: 83,
          },
          {
            id: "4",
            name: "Mindfulness & Meditation",
            slug: "mindfulness",
            description: "Share techniques and experiences with mindfulness practices",
            icon: <Sparkles className="h-8 w-8 text-purple-500" />,
            thread_count: 12,
            post_count: 64,
          },
          {
            id: "5",
            name: "Positivity Corner",
            slug: "positivity",
            description: "Share wins, positive affirmations, and uplifting content",
            icon: <Lightbulb className="h-8 w-8 text-yellow-500" />,
            thread_count: 20,
            post_count: 118,
          },
          {
            id: "6",
            name: "General Discussion",
            slug: "general",
            description: "Open discussions about mental health and wellbeing",
            icon: <MessageCircle className="h-8 w-8 text-green-500" />,
            thread_count: 30,
            post_count: 175,
          },
        ]

        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [supabase])

  if (loading) {
    return <div className="text-center py-12">Loading categories...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/community/${category.slug}`}>
          <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {category.icon}
                  <CardTitle>{category.name}</CardTitle>
                </div>
                <Badge variant="outline" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {category.thread_count} threads
                </Badge>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <MessageCircle className="mr-2 h-4 w-4" />
                {category.post_count} posts
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
