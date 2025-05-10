"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquarePlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

export function NewMessageButton() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      // Search for users by username or full name
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(5)

      if (error) throw error

      setSearchResults(data || [])
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Search failed",
        description: "Failed to search for users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const startConversation = async (profileId: string) => {
    try {
      // Check if a conversation already exists
      const { data: existingConversations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", profileId)
        .in(
          "conversation_id",
          supabase.from("conversation_participants").select("conversation_id").eq("profile_id", profileId),
        )

      if (existingConversations && existingConversations.length > 0) {
        // Conversation exists, navigate to it
        router.push(`/messages/${existingConversations[0].conversation_id}`)
        setOpen(false)
        return
      }

      // Create a new conversation
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (conversationError || !conversation) throw conversationError

      // Add participants
      const { error: participantsError } = await supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) throw new Error("Not authenticated")

        return await supabase.from("conversation_participants").insert([
          { conversation_id: conversation.id, profile_id: user.id },
          { conversation_id: conversation.id, profile_id: profileId },
        ])
      })

      if (participantsError) throw participantsError

      // Navigate to the new conversation
      router.push(`/messages/${conversation.id}`)
      setOpen(false)
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Failed to start conversation",
        description: "There was a problem creating the conversation. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-rose-500 to-amber-500 text-white">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>Search for a user to start a conversation with.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="username" className="sr-only">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Search by username or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Results</h3>
              <ul className="space-y-2">
                {searchResults.map((user) => (
                  <li key={user.id}>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => startConversation(user.id)}
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                        <AvatarFallback>{user.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="font-medium">{user.username}</div>
                        {user.full_name && <div className="text-xs text-muted-foreground">{user.full_name}</div>}
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : searchQuery && !loading ? (
            <p className="text-sm text-center text-muted-foreground">No users found. Try a different search term.</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
