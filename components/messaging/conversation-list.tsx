"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export function ConversationList() {
  const { user } = useAuth()
  const pathname = usePathname()

  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchConversations = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simple query to check if tables exist
        const { data, error: queryError } = await supabase.from("conversations").select("id, created_at").limit(1)

        if (queryError) {
          console.log("Conversations table not available:", queryError.message)
          setConversations([])
          return
        }

        // If we get here, the table exists but might be empty
        setConversations([])
      } catch (error) {
        console.error("Error in fetchConversations:", error)
        setError("Unable to load conversations")
        setConversations([])
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading conversations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search conversations"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-sm">Start connecting with other users to begin messaging</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
          onClick={() => {
            // Navigate to matching page to find people to message
            window.location.href = "/matching"
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Find People to Message
        </Button>
      </div>
    </div>
  )
}
