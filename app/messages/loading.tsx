import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesLoading() {
  return (
    <DashboardLayout>
      <div className="h-screen flex">
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-700">
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
        <div className="hidden md:flex flex-1 items-center justify-center">
          <Skeleton className="h-20 w-80 rounded-lg" />
        </div>
      </div>
    </DashboardLayout>
  )
}
