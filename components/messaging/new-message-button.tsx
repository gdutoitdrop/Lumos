"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, MessageSquarePlus, Search, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function NewMessageButton() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults([])

    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(10)

      if (error) throw error

      // Get current user to filter out from results
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setSearchResults(profiles.filter((profile) => profile.id !== user.id))
      } else {
        setSearchResults(profiles)
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const startConversation = async (profileId: string) => {
    setIsCreating(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to start a conversation")
      }

      // First, get all conversations where the current user is a participant
      const { data: userConversations, error: conversationsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", user.id)

      if (conversationsError) throw conversationsError

      // Extract conversation IDs
      const conversationIds = userConversations.map((c) => c.conversation_id)

      // If there are existing conversations, check if the other user is in any of them
      if (conversationIds.length > 0) {
        const { data: existingConversation, error: existingError } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("profile_id", profileId)
          .in("conversation_id", conversationIds)
          .limit(1)

        if (existingError) throw existingError

        // If a conversation already exists, navigate to it
        if (existingConversation && existingConversation.length > 0) {
          setOpen(false)
          router.push(`/messages/${existingConversation[0].conversation_id}`)
          return
        }
      }

      // Create a new conversation
      const { data: newConversation, error: newConversationError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (newConversationError) throw newConversationError

      // Add participants
      const { error: participantsError } = await supabase.from("conversation_participants").insert([
        { conversation_id: newConversation.id, profile_id: user.id },
        { conversation_id: newConversation.id, profile_id: profileId },
      ])

      if (participantsError) throw participantsError

      // Navigate to the new conversation
      setOpen(false)
      router.push(`/messages/${newConversation.id}`)
    } catch (error: any) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Failed to start conversation",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Search for a user to start a conversation with.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search by username or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
            />
          </div>
          <Button type="button" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <div className="mt-4 max-h-60 overflow-y-auto">
          {searchResults.length === 0 && !isSearching && (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery ? "No users found" : "Search for users to start a conversation"}
            </div>
          )}

          {isSearching && (
            <div className="text-center py-4 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          )}

          {searchResults.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-3 hover:bg-muted rounded-md cursor-pointer"
              onClick={() => startConversation(profile.id)}
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={isCreating}
                onClick={(e) => {
                  e.stopPropagation()
                  startConversation(profile.id)
                }}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Message"}
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
