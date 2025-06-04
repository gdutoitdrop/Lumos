import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ConversationList } from "@/components/messaging/conversation-list"
import { MessageThread } from "@/components/messaging/message-thread"

export default function ConversationPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <div className="h-screen flex">
        <div className="hidden md:block w-80 border-r border-slate-200 dark:border-slate-700">
          <ConversationList />
        </div>
        <div className="flex-1">
          <MessageThread conversationId={params.id} />
        </div>
      </div>
    </DashboardLayout>
  )
}
