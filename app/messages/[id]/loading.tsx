import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function ConversationLoading() {
  return (
    <DashboardLayout>
      <div className="h-screen flex">
        <div className="hidden md:block w-80 border-r border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24 mt-1" />
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <div className={`flex ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"} items-end gap-2 max-w-[80%]`}>
                    {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                    <Skeleton className={`h-20 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-lg`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-end gap-2">
                <Skeleton className="h-20 flex-1 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
