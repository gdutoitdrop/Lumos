import { getConversation } from "@/actions/messaging"
import { MessageThread } from "@/components/messaging/message-thread"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft } from "lucide-react"
import { cookies } from "next/headers"
import Link from "next/link"

export default async function ConversationPage({
  params,
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  const { conversation, messages, otherParticipant } = await getConversation(params.id)

  if (!conversation) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center">
        <Link href="/messages" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={otherParticipant.avatar_url || undefined} alt={otherParticipant.full_name} />
          <AvatarFallback>{otherParticipant.full_name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{otherParticipant.full_name}</h2>
        </div>
      </div>
      <MessageThread
        conversationId={conversation.id}
        initialMessages={messages}
        otherParticipant={otherParticipant}
        currentUserId={user.id}
      />
    </div>
  )
}
