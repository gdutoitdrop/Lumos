import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PreferencesForm } from "@/components/matching/preferences-form"
import { MatchList } from "@/components/matching/match-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MatchingPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Find Your Match</h1>

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <MatchList />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
