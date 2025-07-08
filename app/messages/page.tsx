"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SimpleMessageThread } from "@/components/messaging/simple-message-thread"
import { SimpleConversationList } from "@/components/messaging/simple-conversation-list"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    const conversationId = searchParams.get("conversation")
    if (conversationId) {
      setSelectedConversationId(conversationId)
    }
  }, [searchParams])

  const getUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error("Error getting user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    const url = new URL(window.location.href)
    url.searchParams.set("conversation", conversationId)
    window.history.pushState({}, "", url.toString())
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
              <p className="text-gray-600 mb-6">You need to be logged in to access messages.</p>
              <Button asChild className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                <a href="/login">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-full md:w-96 border-r">
          <SimpleConversationList
            userId={user.id}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversationId}
          />
        </div>

        {/* Right Side */}
        <div className="hidden md:flex flex-1">
          {selectedConversationId ? (
            <SimpleMessageThread conversationId={selectedConversationId} userId={user.id} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md">
                <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-700">Select a conversation</h2>
                <p className="text-gray-500">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
