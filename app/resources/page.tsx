import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ResourceHub } from "@/components/resource-hub"

export default function ResourcesPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Resource Hub</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-3xl">
          Access curated mental health content, coping tools, breathing exercises, journaling prompts, and links to
          crisis resources.
        </p>
        <ResourceHub />
      </div>
    </DashboardLayout>
  )
}
