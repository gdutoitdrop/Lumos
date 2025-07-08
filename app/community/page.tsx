"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MessageCircle, Heart, Users, Plus } from "lucide-react"
import Link from "next/link"

const categories = [
  { id: "general", name: "General Discussion", icon: MessageCircle, color: "bg-blue-500" },
  { id: "dating", name: "Dating Advice", icon: Heart, color: "bg-pink-500" },
  { id: "friendship", name: "Making Friends", icon: Users, color: "bg-green-500" },
  { id: "events", name: "Local Events", icon: Plus, color: "bg-purple-500" },
]

const demoThreads = [
  {
    id: "1",
    title: "Tips for great first dates?",
    category: "dating",
    author: "Sarah M.",
    replies: 23,
    lastActivity: "2 hours ago",
    preview: "Looking for creative first date ideas that aren't too expensive...",
  },
  {
    id: "2",
    title: "How to make friends as an adult?",
    category: "friendship",
    author: "Mike R.",
    replies: 45,
    lastActivity: "4 hours ago",
    preview: "Just moved to a new city and finding it hard to meet people...",
  },
  {
    id: "3",
    title: "Coffee meetup this Saturday!",
    category: "events",
    author: "Alex J.",
    replies: 12,
    lastActivity: "1 day ago",
    preview: "Organizing a casual coffee meetup downtown. All welcome!",
  },
]

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredThreads = demoThreads.filter((thread) => {
    const matchesSearch =
      thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.preview.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || thread.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Community</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Thread
        </Button>
      </div>

      {/* Search and Categories */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              <category.icon className="w-4 h-4 mr-1" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {demoThreads.filter((t) => t.category === category.id).length} threads
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Threads */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Discussions</h2>
        <div className="space-y-4">
          {filteredThreads.map((thread) => {
            const category = categories.find((c) => c.id === thread.category)
            return (
              <Card key={thread.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{thread.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link href={`/community/${thread.category}/${thread.id}`}>
                          <h3 className="font-semibold hover:text-purple-600 cursor-pointer">{thread.title}</h3>
                        </Link>
                        {category && (
                          <Badge variant="secondary" className="text-xs">
                            {category.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{thread.preview}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>by {thread.author}</span>
                        <div className="flex items-center space-x-4">
                          <span>{thread.replies} replies</span>
                          <span>{thread.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredThreads.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory
                  ? "Try adjusting your search or category filter"
                  : "Be the first to start a discussion!"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
