"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MessageSquare, Users, Plus, Heart, Brain, Coffee, BookOpen } from "lucide-react"

interface ForumThread {
  id: string
  title: string
  content: string
  category: string
  author: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
  replies_count: number
  likes_count: number
  created_at: string
  is_pinned: boolean
  tags: string[]
}

interface ForumCategory {
  id: string
  name: string
  description: string
  icon: any
  color: string
  thread_count: number
  latest_activity: string
}

export default function CommunityPage() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        // Demo categories
        const demoCategories: ForumCategory[] = [
          {
            id: "mental-health",
            name: "Mental Health Support",
            description: "Share experiences, seek advice, and support each other",
            icon: Brain,
            color: "from-blue-500 to-purple-500",
            thread_count: 156,
            latest_activity: "2 minutes ago",
          },
          {
            id: "relationships",
            name: "Relationships & Dating",
            description: "Discuss dating, relationships, and connections",
            icon: Heart,
            color: "from-rose-500 to-pink-500",
            thread_count: 89,
            latest_activity: "5 minutes ago",
          },
          {
            id: "wellness",
            name: "Wellness & Self-Care",
            description: "Tips and discussions about self-care and wellness",
            icon: Coffee,
            color: "from-green-500 to-teal-500",
            thread_count: 124,
            latest_activity: "10 minutes ago",
          },
          {
            id: "resources",
            name: "Resources & Education",
            description: "Share helpful resources, books, and educational content",
            icon: BookOpen,
            color: "from-amber-500 to-orange-500",
            thread_count: 67,
            latest_activity: "15 minutes ago",
          },
        ]

        // Demo threads
        const demoThreads: ForumThread[] = [
          {
            id: "thread-1",
            title: "How do you deal with anxiety in social situations?",
            content:
              "I've been struggling with social anxiety lately, especially in group settings. I'd love to hear your strategies and experiences...",
            category: "mental-health",
            author: {
              id: "user-1",
              username: "anxious_but_trying",
              full_name: "Sarah M.",
              avatar_url: "/placeholder.svg?height=40&width=40",
            },
            replies_count: 23,
            likes_count: 45,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_pinned: true,
            tags: ["anxiety", "social", "coping"],
          },
          {
            id: "thread-2",
            title: "First date tips for introverts?",
            content:
              "I have a first date coming up and I'm pretty introverted. Any advice on how to make a good impression while staying true to myself?",
            category: "relationships",
            author: {
              id: "user-2",
              username: "quiet_romantic",
              full_name: "Mike C.",
              avatar_url: "/placeholder.svg?height=40&width=40",
            },
            replies_count: 18,
            likes_count: 32,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            is_pinned: false,
            tags: ["dating", "introvert", "advice"],
          },
          {
            id: "thread-3",
            title: "Morning routine that changed my life",
            content:
              "I wanted to share my morning routine that has really helped with my mental health and overall well-being. Maybe it can help someone else too!",
            category: "wellness",
            author: {
              id: "user-3",
              username: "morning_person",
              full_name: "Emma D.",
              avatar_url: "/placeholder.svg?height=40&width=40",
            },
            replies_count: 31,
            likes_count: 67,
            created_at: new Date(Date.now() - 10800000).toISOString(),
            is_pinned: false,
            tags: ["routine", "wellness", "self-care"],
          },
          {
            id: "thread-4",
            title: "Book recommendations for understanding depression",
            content:
              "I'm looking for books that help understand depression better, both for myself and to support a friend. Any recommendations?",
            category: "resources",
            author: {
              id: "user-4",
              username: "book_lover",
              full_name: "Alex R.",
              avatar_url: "/placeholder.svg?height=40&width=40",
            },
            replies_count: 15,
            likes_count: 28,
            created_at: new Date(Date.now() - 14400000).toISOString(),
            is_pinned: false,
            tags: ["books", "depression", "resources"],
          },
          {
            id: "thread-5",
            title: "Success story: How I overcame my fear of dating",
            content:
              "A year ago, I was terrified of dating. Today, I'm in a wonderful relationship. Here's my journey and what helped me...",
            category: "relationships",
            author: {
              id: "user-5",
              username: "brave_heart",
              full_name: "Jordan K.",
              avatar_url: "/placeholder.svg?height=40&width=40",
            },
            replies_count: 42,
            likes_count: 89,
            created_at: new Date(Date.now() - 18000000).toISOString(),
            is_pinned: false,
            tags: ["success", "dating", "fear", "growth"],
          },
        ]

        setCategories(demoCategories)
        setThreads(demoThreads)
      } catch (error) {
        console.error("Error fetching community data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch =
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = activeTab === "all" || thread.category === activeTab

    return matchesSearch && matchesCategory
  })

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const handleThreadClick = (threadId: string, category: string) => {
    window.location.href = `/community/${category}/${threadId}`
  }

  const handleCategoryClick = (categoryId: string) => {
    window.location.href = `/community/${categoryId}`
  }

  const handleCreateThread = () => {
    if (!user) {
      window.location.href = "/login"
      return
    }
    window.location.href = "/community/general/new"
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
                </CardTitle>
                <Button
                  onClick={handleCreateThread}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Thread
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`bg-gradient-to-r ${category.color} rounded-lg p-2`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{category.name}</h3>
                        <p className="text-xs text-slate-500">{category.thread_count} threads</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{category.description}</p>
                    <p className="text-xs text-slate-500">Latest: {category.latest_activity}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search threads, topics, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="mental-health">Mental Health</TabsTrigger>
                    <TabsTrigger value="relationships">Relationships</TabsTrigger>
                    <TabsTrigger value="wellness">Wellness</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Threads */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading community threads...</p>
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
                    {searchQuery ? "Try adjusting your search terms" : "Be the first to start a conversation!"}
                  </p>
                  <Button
                    onClick={handleCreateThread}
                    className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Thread
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleThreadClick(thread.id, thread.category)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          {thread.author.avatar_url ? (
                            <AvatarImage
                              src={thread.author.avatar_url || "/placeholder.svg"}
                              alt={thread.author.full_name}
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                              {thread.author.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {thread.is_pinned && (
                              <Badge className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs">
                                Pinned
                              </Badge>
                            )}
                            <h3 className="font-medium text-slate-800 truncate">{thread.title}</h3>
                          </div>

                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{thread.content}</p>

                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                            <span>by {thread.author.full_name}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(thread.created_at)}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {thread.replies_count}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {thread.likes_count}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {thread.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
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
