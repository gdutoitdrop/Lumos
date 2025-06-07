import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ConversationList } from "@/components/messaging/conversation-list"

export default function MessagesPage() {
  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-slate-500 dark:text-slate-400">Connect with your matches and friends</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationList />
        </div>
      </div>
    </DashboardLayout>
  )
}
