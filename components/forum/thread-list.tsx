"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Eye, Pin, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Thread {
  id: string
  title: string
  content: string
  category: string
  author_id: string
  author_name: string | null
  is_pinned: boolean
  view_count: number
  reply_count: number
  created_at: string
  updated_at: string
}

interface ThreadListProps {
  category: string
}

export function ThreadList({ category }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchThreads = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("Fetching threads for category:", category)

        const { data: threadsData, error: threadsError } = await supabase
          .from("forum_threads")
          .select("*")
          .eq("category", category)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })

        if (threadsError) {
          console.error("Error fetching threads:", threadsError)
          setError("Could not load threads.")
          return
        }

        console.log("Threads loaded:", threadsData)
        setThreads(threadsData || [])
      } catch (error) {
        console.error("Error in fetchThreads:", error)
        setError("An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }

    fetchThreads()
  }, [category, supabase])

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const openThread = (threadId: string) => {
    window.location.href = `/community/${category}/${threadId}`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (threads.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No threads yet</h3>
          <p className="text-slate-500">Be the first to start a discussion in this category!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <Card
          key={thread.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => openThread(thread.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                  {(thread.author_name || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {thread.is_pinned && <Pin className="h-4 w-4 text-amber-500" />}
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate">{thread.title}</h3>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">{thread.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimeAgo(thread.created_at)}
                    </span>
                    <span>by {thread.author_name || "Anonymous"}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {thread.view_count}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {thread.reply_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
