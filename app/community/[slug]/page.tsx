import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ThreadList } from "@/components/forum/thread-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const categoryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1).replace(/-/g, " ")

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{categoryName}</h1>
            <p className="text-slate-600 dark:text-slate-300">Discussions related to {categoryName.toLowerCase()}</p>
          </div>
          <Button className="bg-gradient-to-r from-rose-500 to-amber-500 text-white" asChild>
            <Link href={`/community/${params.slug}/new`}>
              <Plus className="mr-2 h-4 w-4" /> New Thread
            </Link>
          </Button>
        </div>
        <ThreadList category={params.slug} />
      </div>
    </DashboardLayout>
  )
}
