import type React from "react"
import { ConversationList } from "@/components/messaging/conversation-list"

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex">
      <div className="w-80 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <ConversationList />
      </div>
      <div className="flex-1 bg-slate-50 dark:bg-slate-900">{children}</div>
    </div>
  )
}
