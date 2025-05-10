"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"

type Reply = {
  id: string
  content: string
  created_at: string
  author: {
    id: string
    username: string
    avatar_url: string
  }
  like_count: number
  is_liked_by_user: boolean
}

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
  replies: Reply[]
}

export function ThreadView({ category, threadId }: { category: string; threadId: string }) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")

  useEffect(() => {
    const fetchThread = async () => {
      try {
        // In a real implementation, you would fetch this from the database
        // For now, we'll use static data
        const threadData: Thread = {
          id: threadId,
          title: "Coping with social anxiety at work",
          content:
            "I've been struggling with social anxiety at my new job. The team is great, but I freeze up during meetings. Has anyone found effective strategies for managing this in professional settings?",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          author: {
            id: "user1",
            username: "Alex",
            avatar_url: "/placeholder.svg?height=50&width=50",
          },
          replies: [
            {
              id: "reply1",
              content:
                "I've found that preparation helps a lot. If I know the meeting agenda beforehand, I write down my thoughts and potential contributions. Having notes makes me feel more confident.",
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20 hours ago
              author: {
                id: "user2",
                username: "Jamie",
                avatar_url: "/placeholder.svg?height=50&width=50",
              },
              like_count: 12,
              is_liked_by_user: false,
            },
            {
              id: "reply2",
              content:
                "Breathing exercises help me a lot. When I feel anxiety building up, I do the 4-7-8 technique: breathe in for 4 seconds, hold for 7, exhale for 8. It's subtle enough that no one notices.",
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
              author: {
                id: "user3",
                username: "Taylor",
                avatar_url: "/placeholder.svg?height=50&width=50",
              },
              like_count: 8,
              is_liked_by_user: true,
            },
            {
              id: "reply3",
              content:
                "I told my manager about my anxiety in a one-on-one meeting. It was scary, but they were understanding and now occasionally check in with me during meetings to make sure I have a chance to speak. Not all managers will be supportive, but it's worth considering.",
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(), // 15 hours ago
              author: {
                id: "user4",
                username: "Jordan",
                avatar_url: "/placeholder.svg?height=50&width=50",
              },
              like_count: 15,
              is_liked_by_user: false,
            },
          ],
        }

        setThread(threadData)
      } catch (error) {
        console.error("Error fetching thread:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchThread()
  }, [threadId, supabase])

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setSubmitting(true)
    try {
      // In a real implementation, you would submit this to the database
      // For now, we'll just update the local state
      const newReply: Reply = {
        id: `reply${Date.now()}`,
        content: replyContent,
        created_at: new Date().toISOString(),
        author: {
          id: "currentUser",
          username: "You",
          avatar_url: "/placeholder.svg?height=50&width=50",
        },
        like_count: 0,
        is_liked_by_user: false,
      }

      setThread((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          replies: [...prev.replies, newReply],
        }
      })
      setReplyContent("")
    } catch (error) {
      console.error("Error submitting reply:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLike = (replyId: string) => {
    setThread((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        replies: prev.replies.map((reply) => {
          if (reply.id === replyId) {
            const isLiked = !reply.is_liked_by_user
            return {
              ...reply,
              is_liked_by_user: isLiked,
              like_count: isLiked ? reply.like_count + 1 : reply.like_count - 1,
            }
          }
          return reply
        }),
      }
    })
  }

  if (loading) {
    return <div className="text-center py-12">Loading thread...</div>
  }

  if (!thread) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <p className="text-slate-500 dark:text-slate-400">Thread not found.</p>
        <Link
          href={`/community/${category}`}
          className="mt-4 inline-flex items-center text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to {categoryName}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/community/${category}`}
          className="inline-flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to {categoryName}
        </Link>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
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
            <CardTitle className="text-2xl">{thread.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{thread.content}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Replies ({thread.replies.length})</h2>
        <div className="space-y-4">
          {thread.replies.map((reply) => (
            <Card key={reply.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={reply.author.avatar_url || "/placeholder.svg"} alt={reply.author.username} />
                    <AvatarFallback>{reply.author.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{reply.author.username}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-line">{reply.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${
                    reply.is_liked_by_user ? "text-rose-500 dark:text-rose-400" : "text-slate-500 dark:text-slate-400"
                  }`}
                  onClick={() => toggleLike(reply.id)}
                >
                  <Heart className="h-4 w-4" fill={reply.is_liked_by_user ? "currentColor" : "none"} />
                  {reply.like_count}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a reply</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReply}>
            <Textarea
              placeholder="Share your thoughts or advice..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-4 min-h-[120px]"
            />
            <Button type="submit" disabled={submitting || !replyContent.trim()}>
              {submitting ? "Submitting..." : "Post Reply"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
