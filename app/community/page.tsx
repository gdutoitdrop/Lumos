import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ForumCategories } from "@/components/forum/forum-categories"

export default function CommunityPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Community Forums</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-3xl">
          A safe, moderated space where you can share stories, ask for advice, post uplifting content, or simply connect
          with others who understand your journey.
        </p>
        <ForumCategories />
      </div>
    </DashboardLayout>
  )
}
