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
  author_id: string
  author: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
  reply_count: number
  like_count: number
  is_pinned: boolean
}

export function ThreadList({ category }: { category: string }) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        // First, get the threads
        const { data: threadsData, error: threadsError } = await supabase
          .from("forum_threads")
          .select("*")
          .eq("category", category)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })

        if (threadsError) {
          console.error("Error fetching threads:", threadsError)
          return
        }

        if (!threadsData || threadsData.length === 0) {
          setThreads([])
          return
        }

        // Get unique author IDs
        const authorIds = [...new Set(threadsData.map((thread) => thread.author_id))]

        // Fetch author profiles separately
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", authorIds)

        // Create a map of profiles for quick lookup
        const profilesMap = new Map()
        if (profilesData) {
          profilesData.forEach((profile) => {
            profilesMap.set(profile.id, profile)
          })
        }

        // Get reply counts for each thread
        const threadsWithData = await Promise.all(
          threadsData.map(async (thread) => {
            // Get reply count
            const { count: replyCount } = await supabase
              .from("forum_replies")
              .select("*", { count: "exact", head: true })
              .eq("thread_id", thread.id)

            // Get author profile or create fallback
            const authorProfile = profilesMap.get(thread.author_id) || {
              id: thread.author_id,
              username: "Unknown User",
              full_name: "Unknown User",
              avatar_url: null,
            }

            return {
              ...thread,
              reply_count: replyCount || 0,
              like_count: Math.floor(Math.random() * 50), // Demo like count
              author: {
                id: authorProfile.id,
                username: authorProfile.username || "Unknown User",
                full_name: authorProfile.full_name || authorProfile.username || "Unknown User",
                avatar_url: authorProfile.avatar_url,
              },
            }
          }),
        )

        setThreads(threadsWithData)
      } catch (error) {
        console.error("Error fetching threads:", error)
        // Set some fallback data so the page doesn't break
        setThreads([])
      } finally {
        setLoading(false)
      }
    }

    fetchThreads()
  }, [category, supabase])

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
        <Link key={thread.id} href={`/community/${category}/${thread.id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {thread.author.avatar_url ? (
                      <AvatarImage src={thread.author.avatar_url || "/placeholder.svg"} alt={thread.author.full_name} />
                    ) : (
                      <AvatarFallback>{thread.author.full_name.charAt(0).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">{thread.author.full_name}</div>
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
