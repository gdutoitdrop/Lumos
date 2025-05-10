import { NewMessageButton } from "@/components/messaging/new-message-button"
import { ConversationList } from "@/components/messaging/conversation-list"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function MessagesPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <NewMessageButton />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <ConversationList />
      </div>
    </div>
  )
}
