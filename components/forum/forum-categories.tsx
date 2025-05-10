"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { MessageCircle, Users, Heart, Sparkles, Brain, Lightbulb } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Category = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  thread_count: number
  reply_count: number
}

const iconMap: Record<string, React.ReactNode> = {
  brain: <Brain className="h-8 w-8 text-amber-500" />,
  heart: <Heart className="h-8 w-8 text-blue-500" />,
  users: <Users className="h-8 w-8 text-rose-500" />,
  sparkles: <Sparkles className="h-8 w-8 text-purple-500" />,
  lightbulb: <Lightbulb className="h-8 w-8 text-yellow-500" />,
  "message-circle": <MessageCircle className="h-8 w-8 text-green-500" />,
}

export function ForumCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories from the database
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("forum_categories")
          .select("*")
          .order("name")

        if (categoriesError) throw categoriesError

        // Fetch stats for each category
        const { data: statsData, error: statsError } = await supabase.from("forum_category_stats").select("*")

        if (statsError) throw statsError

        // Combine the data
        const categoriesWithStats = categoriesData.map((category) => {
          const stats = statsData.find((stat) => stat.category_id === category.id)
          return {
            ...category,
            thread_count: stats?.thread_count || 0,
            reply_count: stats?.reply_count || 0,
          }
        })

        setCategories(categoriesWithStats)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/community/${category.slug}`}>
          <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {iconMap[category.icon] || <MessageCircle className="h-8 w-8 text-slate-500" />}
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
                {category.reply_count} posts
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
