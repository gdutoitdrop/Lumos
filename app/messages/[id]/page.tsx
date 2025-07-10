import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ConversationList } from "@/components/messaging/conversation-list"
import { EnhancedMessageThread } from "@/components/messaging/enhanced-message-thread"

export default function ConversationPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <div className="h-screen flex">
        <div className="hidden md:block w-96 border-r border-slate-200 dark:border-slate-700">
          <ConversationList />
        </div>
        <div className="flex-1">
          <EnhancedMessageThread conversationId={params.id} />
        </div>
      </div>
    </DashboardLayout>
  )
}
