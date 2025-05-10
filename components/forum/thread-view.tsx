"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, Flag, MoreHorizontal, Edit, Trash2, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Thread = {
  id: string
  title: string
  content: string
  created_at: string
  author: {
    id: string
    username: string
    avatar_url: string
    mental_health_badges?: string[]
  }
  reply_count: number
  like_count: number
  is_pinned: boolean
  is_liked_by_user: boolean
}

type Reply = {
  id: string
  content: string
  created_at: string
  author: {
    id: string
    username: string
    avatar_url: string
    mental_health_badges?: string[]
  }
  like_count: number
  is_liked_by_user: boolean
}

export function ThreadView({ category, threadId }: { category: string; threadId: string }) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [newReply, setNewReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: "thread" | "reply"; id: string } | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchThreadAndReplies = async () => {
      try {
        // In a real implementation, you would fetch this from the database
        // For now, we'll use static data
        const threadData: Thread = {
          id: "1",
          title: "Coping with social anxiety at work",
          content:
            "I've been struggling with social anxiety at my new job. The team is great, but I freeze up during meetings. Has anyone found effective strategies for managing this in professional settings?\n\nI've tried deep breathing before meetings, but once I'm in there, my mind goes blank. I'm worried this will affect my performance reviews and career growth. Any advice would be greatly appreciated!",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          author: {
            id: "user1",
            username: "Alex",
            avatar_url: "/placeholder.svg?height=50&width=50",
            mental_health_badges: ["Anxiety Warrior", "Mental Health Advocate"],
          },
          reply_count: 3,
          like_count: 24,
          is_pinned: true,
          is_liked_by_user: false,
        }

        const repliesData: Reply[] = [
          {
            id: "reply1",
            content:
              "I've been there! Something that helped me was preparing talking points before meetings. Even if I don't use them all, having them written down helps me feel more secure. Also, I told my manager about my anxiety, and they've been supportive by checking in with me during meetings in a non-pressuring way.",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
            author: {
              id: "user2",
              username: "Jamie",
              avatar_url: "/placeholder.svg?height=50&width=50",
              mental_health_badges: ["Anxiety Warrior"],
            },
            like_count: 12,
            is_liked_by_user: true,
          },
          {
            id: "reply2",
            content:
              "Cognitive Behavioral Therapy (CBT) techniques have been game-changing for my social anxiety. One exercise is to challenge your negative thoughts - when you think 'I'll mess up this presentation,' counter it with evidence like 'I've successfully shared ideas before.' It takes practice but really helps reframe your thinking.",
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            author: {
              id: "user3",
              username: "Taylor",
              avatar_url: "/placeholder.svg?height=50&width=50",
              mental_health_badges: ["Therapy Believer"],
            },
            like_count: 8,
            is_liked_by_user: false,
          },
          {
            id: "reply3",
            content:
              "Have you tried the 5-4-3-2-1 grounding technique? When you feel anxiety building, identify 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. It helps bring you back to the present moment instead of getting lost in anxious thoughts.",
            created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
            author: {
              id: "user4",
              username: "Jordan",
              avatar_url: "/placeholder.svg?height=50&width=50",
              mental_health_badges: ["Mindfulness Practitioner"],
            },
            like_count: 5,
            is_liked_by_user: false,
          },
        ]

        setThread(threadData)
        setReplies(repliesData)
      } catch (error) {
        console.error("Error fetching thread:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchThreadAndReplies()
  }, [threadId, supabase])

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newReply.trim()) return

    setSubmitting(true)

    try {
      // In a real implementation, you would save this to the database
      const newReplyData: Reply = {
        id: `reply${Date.now()}`,
        content: newReply,
        created_at: new Date().toISOString(),
        author: {
          id: user.id,
          username: user.email?.split("@")[0] || "Anonymous",
          avatar_url: "/placeholder.svg?height=50&width=50",
        },
        like_count: 0,
        is_liked_by_user: false,
      }

      setReplies([...replies, newReplyData])
      setNewReply("")

      // Update thread reply count
      if (thread) {
        setThread({
          ...thread,
          reply_count: thread.reply_count + 1,
        })
      }
    } catch (error) {
      console.error("Error posting reply:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeThread = async () => {
    if (!user || !thread) return

    try {
      const newLikeCount = thread.is_liked_by_user ? thread.like_count - 1 : thread.like_count + 1

      setThread({
        ...thread,
        like_count: newLikeCount,
        is_liked_by_user: !thread.is_liked_by_user,
      })

      // In a real implementation, you would update this in the database
    } catch (error) {
      console.error("Error liking thread:", error)
    }
  }

  const handleLikeReply = async (replyId: string) => {
    if (!user) return

    try {
      const updatedReplies = replies.map((reply) => {
        if (reply.id === replyId) {
          const newLikeCount = reply.is_liked_by_user ? reply.like_count - 1 : reply.like_count + 1

          return {
            ...reply,
            like_count: newLikeCount,
            is_liked_by_user: !reply.is_liked_by_user,
          }
        }
        return reply
      })

      setReplies(updatedReplies)

      // In a real implementation, you would update this in the database
    } catch (error) {
      console.error("Error liking reply:", error)
    }
  }

  const handleDeleteItem = () => {
    if (!itemToDelete) return

    if (itemToDelete.type === "thread") {
      // In a real implementation, you would delete the thread from the database
      router.push(`/community/${category}`)
    } else {
      // Delete reply
      const updatedReplies = replies.filter((reply) => reply.id !== itemToDelete.id)
      setReplies(updatedReplies)

      // Update thread reply count
      if (thread) {
        setThread({
          ...thread,
          reply_count: thread.reply_count - 1,
        })
      }
    }

    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const confirmDelete = (type: "thread" | "reply", id: string) => {
    setItemToDelete({ type, id })
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return <div className="text-center py-12">Loading thread...</div>
  }

  if (!thread) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <p className="text-slate-500 dark:text-slate-400">Thread not found.</p>
        <Link href={`/community/${category}`}>
          <Button variant="link" className="mt-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {category}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link href={`/community/${category}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to{" "}
            {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")}
          </Button>
        </Link>
      </div>

      {/* Thread */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
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
            <div className="flex items-center gap-2">
              {thread.is_pinned && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                >
                  Pinned
                </Badge>
              )}
              {user && thread.author.id === user.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit Thread
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400"
                      onClick={() => confirmDelete("thread", thread.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Thread
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <CardTitle className="text-xl mt-2">{thread.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {thread.author.mental_health_badges?.map((badge) => (
              <Badge
                key={badge}
                variant="outline"
                className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
              >
                {badge}
              </Badge>
            ))}
          </div>
          <div className="text-slate-600 dark:text-slate-300 mb-6 whitespace-pre-line">{thread.content}</div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${
                thread.is_liked_by_user ? "text-rose-500" : "text-slate-500 dark:text-slate-400"
              }`}
              onClick={handleLikeThread}
            >
              <Heart className="h-4 w-4" fill={thread.is_liked_by_user ? "currentColor" : "none"} /> {thread.like_count}
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <MessageCircle className="h-4 w-4" /> {thread.reply_count}
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-slate-500 dark:text-slate-400 ml-auto"
            >
              <Flag className="h-4 w-4" /> Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Replies ({thread.reply_count})</h2>

        {replies.map((reply) => (
          <Card key={reply.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
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
                {user && reply.author.id === user.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit Reply
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400"
                        onClick={() => confirmDelete("reply", reply.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Reply
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {reply.author.mental_health_badges?.map((badge) => (
                  <Badge
                    key={badge}
                    variant="outline"
                    className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>

              <div className="text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-line">{reply.content}</div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${
                    reply.is_liked_by_user ? "text-rose-500" : "text-slate-500 dark:text-slate-400"
                  }`}
                  onClick={() => handleLikeReply(reply.id)}
                >
                  <Heart className="h-4 w-4" fill={reply.is_liked_by_user ? "currentColor" : "none"} />{" "}
                  {reply.like_count}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-slate-500 dark:text-slate-400 ml-auto"
                >
                  <Flag className="h-4 w-4" /> Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Reply form */}
        {user ? (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitReply}>
                <div className="mb-4">
                  <Textarea
                    placeholder="Write your reply..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                  disabled={submitting || !newReply.trim()}
                >
                  {submitting ? "Posting..." : "Post Reply"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="mb-4">You need to be logged in to reply to this thread.</p>
              <Button asChild>
                <Link href="/login">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {itemToDelete?.type}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
