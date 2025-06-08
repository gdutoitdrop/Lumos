"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Heart } from "lucide-react"

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const matches = [
    {
      id: "1",
      name: "Sarah Chen",
      username: "sarah_mindful",
      journey: "Anxiety & Self-Care",
      matchScore: 94,
      isOnline: true,
    },
    {
      id: "2",
      name: "Alex Rivera",
      username: "alex_journey",
      journey: "Depression Recovery",
      matchScore: 89,
      isOnline: false,
    },
    {
      id: "3",
      name: "Emma Thompson",
      username: "emma_wellness",
      journey: "ADHD & Mindfulness",
      matchScore: 92,
      isOnline: true,
    },
  ]

  const filteredMatches = matches.filter((match) => match.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const startChat = (matchId: string, name: string) => {
    window.location.href = `/messages/chat/${matchId}`
  }

  return (
    <DashboardLayout>
      <div className="h-screen flex">
        <div className="w-full md:w-96 border-r border-slate-200 dark:border-slate-700">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
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
                <div className="text-center text-slate-500 dark:text-slate-400 mt-8">
                  <Heart className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No matches found</h3>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                    Your Matches ({filteredMatches.length})
                  </h2>
                  {filteredMatches.map((match) => (
                    <div
                      key={match.id}
                      className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                              {match.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {match.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium truncate">{match.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {match.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">@{match.username}</p>
                          <Badge variant="secondary" className="text-xs">
                            {match.journey}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button
                          size="sm"
                          onClick={() => startChat(match.id, match.name)}
                          className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white"
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
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <MessageCircle className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-slate-700 dark:text-slate-300">Select a conversation</h2>
            <p className="text-slate-500 dark:text-slate-400">Choose someone from your matches to start chatting</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
