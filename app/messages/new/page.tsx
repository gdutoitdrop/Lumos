"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NewConversation } from "@/components/messaging/new-conversation"

export default function NewConversationPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <NewConversation />
      </div>
    </DashboardLayout>
  )
}
