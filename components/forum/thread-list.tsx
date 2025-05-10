"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Heart } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

type Thread = {
  id: string
  title: string
  content: string
  created_at: string
  author: {
    id: string
    username: string
    avatar_url: string
  }
  reply_count: number
  like_count: number
  is_pinned: boolean
}

export function ThreadList({ category: slug }: { category: string }) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        // In a real implementation, you would fetch this from the database
        // For now, we'll use static data
        const threadsData = [
          {
            id: "1",
            title: "Coping with social anxiety at work",
            content:
              "I've been struggling with social anxiety at my new job. The team is great, but I freeze up during meetings. Has anyone found effective strategies for managing this in professional settings?",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            author: {
              id: "user1",
              username: "Alex",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
            reply_count: 8,
            like_count: 24,
            is_pinned: true,
          },
          {
            id: "2",
            title: "Anxiety management techniques that actually work",
            content:
              "After years of trial and error, I've found some techniques that help me manage my anxiety. Sharing in case they help others: 1) Box breathing 2) Grounding exercises 3) Regular exercise...",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            author: {
              id: "user2",
              username: "Jamie",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
            reply_count: 17,
            like_count: 56,
            is_pinned: false,
          },
          {
            id: "3",
            title: "How to explain anxiety to a new partner",
            content:
              "I've started dating someone new and want to open up about my anxiety, but I'm not sure how to approach it. Any advice on timing and what to say?",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
            author: {
              id: "user3",
              username: "Taylor",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
            reply_count: 14,
            like_count: 32,
            is_pinned: false,
          },
          {
            id: "4",
            title: "Small wins celebration thread!",
            content:
              "Let's celebrate our small victories! I'll start: I made it through a work presentation today without a panic attack for the first time in months. What's your win?",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            author: {
              id: "user4",
              username: "Jordan",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
            reply_count: 42,
            like_count: 78,
            is_pinned: false,
          },
        ]

        setThreads(threadsData)
      } catch (error) {
        console.error("Error fetching threads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchThreads()
  }, [slug, supabase])

  if (loading) {
    return <div className="text-center py-12">Loading threads...</div>
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <p className="text-slate-500 dark:text-slate-400">No threads found in this category.</p>
        <p className="mt-2">Be the first to start a discussion!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <Link key={thread.id} href={`/community/${slug}/${thread.id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={thread.author.avatar_url || "/placeholder.svg"} alt={thread.author.username} />
                    <AvatarFallback>{thread.author.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{thread.author.username}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                {thread.is_pinned && (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                  >
                    Pinned
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg mt-2">{thread.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{thread.content}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <MessageCircle className="h-4 w-4" /> {thread.reply_count}
                </div>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Heart className="h-4 w-4" /> {thread.like_count}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
