import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ConversationList } from "@/components/messaging/conversation-list"

export default function MessagesPage() {
  return (
    <DashboardLayout>
      <div className="h-screen flex">
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-700">
          <ConversationList />
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Select a conversation</h2>
            <p className="text-slate-500 dark:text-slate-400">Choose a conversation from the list or start a new one</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
