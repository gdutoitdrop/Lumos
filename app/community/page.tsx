"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Plus, Users, Clock, Eye } from "lucide-react"

interface ForumThread {
  id: string
  title: string
  content: string
  category: string
  author_id: string
  author_name: string
  is_pinned: boolean
  view_count: number
  reply_count: number
  created_at: string
  updated_at: string
}

const categories = [
  { id: "all", name: "All Categories", icon: Users },
  { id: "anxiety", name: "Anxiety Support", icon: MessageSquare },
  { id: "depression", name: "Depression Support", icon: MessageSquare },
  { id: "therapy", name: "Therapy & Treatment", icon: MessageSquare },
  { id: "wellness", name: "Wellness & Self-Care", icon: MessageSquare },
  { id: "relationships", name: "Relationships", icon: MessageSquare },
  { id: "general", name: "General Discussion", icon: MessageSquare },
]

export default function CommunityPage() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const supabase = createClient()

  useEffect(() => {
    const fetchThreads = async () => {
      setLoading(true)

      try {
        let query = supabase
          .from("forum_threads")
          .select("*")
          .order("is_pinned", { ascending: false })
          .order("updated_at", { ascending: false })

        if (activeCategory !== "all") {
          query = query.eq("category", activeCategory)
        }

        const { data: threadsData, error } = await query

        if (error) {
          console.error("Error fetching threads:", error)
          setThreads(getDemoThreads())
        } else {
          setThreads(threadsData || getDemoThreads())
        }
      } catch (error) {
        console.error("Error in fetchThreads:", error)
        setThreads(getDemoThreads())
      } finally {
        setLoading(false)
      }
    }

    fetchThreads()
  }, [activeCategory, supabase])

  const getDemoThreads = (): ForumThread[] => [
    {
      id: "demo-thread-1",
      title: "Welcome to Lumos Community!",
      content:
        "Welcome to our supportive community! This is a safe space to share, learn, and grow together on our mental health journeys. Please be kind and respectful to everyone.",
      category: "general",
      author_id: "demo-user-1",
      author_name: "Sarah Johnson",
      is_pinned: true,
      view_count: 156,
      reply_count: 23,
      created_at: new Date(Date.now() - 604800000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "demo-thread-2",
      title: "Coping with social anxiety at work",
      content:
        "I've been struggling with social anxiety at my new job. The team is great, but I freeze up during meetings. Has anyone found effective strategies for managing this in professional settings?",
      category: "anxiety",
      author_id: "demo-user-2",
      author_name: "Mike Chen",
      is_pinned: false,
      view_count: 45,
      reply_count: 8,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "demo-thread-3",
      title: "Morning routines that help with depression",
      content:
        "What morning routines have helped you manage depression? I'm looking for simple, achievable habits to start my day better.",
      category: "depression",
      author_id: "demo-user-3",
      author_name: "Alex Rivera",
      is_pinned: false,
      view_count: 67,
      reply_count: 12,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: "demo-thread-4",
      title: "Finding the right therapist",
      content:
        "How do you know when you've found the right therapist? I've tried a few but haven't felt that connection yet. Any advice?",
      category: "therapy",
      author_id: "demo-user-4",
      author_name: "Emma Davis",
      is_pinned: false,
      view_count: 89,
      reply_count: 15,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 14400000).toISOString(),
    },
  ]

  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.author_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : categoryId
  }

  const handleThreadClick = (thread: ForumThread) => {
    window.location.href = `/community/${thread.category}/${thread.id}`
  }

  const handleNewThread = () => {
    if (!user) {
      window.location.href = "/login"
      return
    }
    window.location.href = `/community/${activeCategory === "all" ? "general" : activeCategory}/new`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-rose-500" />
                  Community Forum
                  {threads.length > 0 && <Badge variant="secondary">{threads.length} threads</Badge>}
                </CardTitle>
                <Button
                  onClick={handleNewThread}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Thread
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Search and Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Search */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search threads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                          activeCategory === category.id
                            ? "bg-rose-50 text-rose-600 border-r-2 border-rose-500"
                            : "text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {category.name}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Threads */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading threads...</p>
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-slate-600 mb-2">
                    {searchQuery ? "No threads found" : "No threads yet"}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Be the first to start a conversation in this category!"}
                  </p>
                  <Button
                    onClick={handleNewThread}
                    className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Thread
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleThreadClick(thread)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 mt-1">
                          <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                            {thread.author_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {thread.is_pinned && <Badge className="bg-amber-100 text-amber-800 text-xs">Pinned</Badge>}
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryName(thread.category)}
                            </Badge>
                          </div>

                          <h3 className="font-medium text-slate-800 mb-1 line-clamp-1">{thread.title}</h3>

                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{thread.content}</p>

                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-4">
                              <span>by {thread.author_name}</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(thread.created_at)}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {thread.view_count}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {thread.reply_count}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
