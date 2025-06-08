"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Heart } from "lucide-react"

export function SimpleConversationList() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Simple demo data without complex operations
    const demoMatches = [
      {
        id: "match-1",
        name: "Sarah Chen",
        username: "sarah_mindful",
        age: 28,
        location: "San Francisco, CA",
        journey: "Anxiety & Self-Care",
        matchScore: 94,
        lastActive: "2 hours ago",
        isOnline: true,
      },
      {
        id: "match-2",
        name: "Alex Rivera",
        username: "alex_journey",
        age: 32,
        location: "Austin, TX",
        journey: "Depression Recovery",
        matchScore: 89,
        lastActive: "1 day ago",
        isOnline: false,
      },
      {
        id: "match-3",
        name: "Emma Thompson",
        username: "emma_wellness",
        age: 26,
        location: "Portland, OR",
        journey: "ADHD & Mindfulness",
        matchScore: 92,
        lastActive: "30 minutes ago",
        isOnline: true,
      },
    ]

    setMatches(demoMatches)
    setLoading(false)
  }, [])

  const startConversation = (matchId: string) => {
    window.location.href = `/messages/chat/${matchId}`
  }

  const filteredMatches = matches.filter((match) => match.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold mb-4">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search matches"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Matches List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredMatches.length === 0 ? (
          <div className="text-center text-slate-500 mt-8">
            <Heart className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No matches found</h3>
            <p className="text-sm mb-4">Try adjusting your search</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map((match) => (
              <div key={match.id} className="p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                        {match.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {match.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{match.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {match.matchScore}% Match
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">
                      @{match.username} • {match.age} • {match.location}
                    </p>
                    <Badge variant="secondary" className="text-xs mb-2">
                      {match.journey}
                    </Badge>
                    <p className="text-xs text-slate-400">Active {match.lastActive}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={() => startConversation(match.id)}
                    className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message {match.name.split(" ")[0]}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
