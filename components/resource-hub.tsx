import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Headphones, Heart, ExternalLink } from "lucide-react"

export function ResourceHub() {
  return (
    <Tabs defaultValue="articles" className="w-full">
      <TabsList className="grid grid-cols-4 max-w-xl mx-auto mb-8">
        <TabsTrigger value="articles">Articles</TabsTrigger>
        <TabsTrigger value="exercises">Exercises</TabsTrigger>
        <TabsTrigger value="crisis">Crisis Support</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
      </TabsList>

      <TabsContent value="articles" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard
          icon={<BookOpen className="h-6 w-6 text-rose-500" />}
          title="Understanding Anxiety"
          description="Learn about the different types of anxiety and how they manifest."
          link="#"
        />
        <ResourceCard
          icon={<BookOpen className="h-6 w-6 text-amber-500" />}
          title="Building Healthy Relationships"
          description="Tips for creating and maintaining supportive connections."
          link="#"
        />
        <ResourceCard
          icon={<BookOpen className="h-6 w-6 text-emerald-500" />}
          title="Self-Compassion Practices"
          description="How to be kinder to yourself during difficult times."
          link="#"
        />
      </TabsContent>

      <TabsContent value="exercises" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard
          icon={<FileText className="h-6 w-6 text-blue-500" />}
          title="5-Minute Breathing Exercise"
          description="A quick breathing technique to help calm anxiety in the moment."
          link="#"
        />
        <ResourceCard
          icon={<Headphones className="h-6 w-6 text-purple-500" />}
          title="Guided Meditation"
          description="10-minute guided meditation for stress reduction."
          link="#"
        />
        <ResourceCard
          icon={<Heart className="h-6 w-6 text-rose-500" />}
          title="Gratitude Journal Prompts"
          description="Daily prompts to help foster a positive mindset."
          link="#"
        />
      </TabsContent>

      <TabsContent value="crisis" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard
          icon={<Heart className="h-6 w-6 text-red-500" />}
          title="Crisis Hotlines"
          description="24/7 support lines for immediate mental health assistance."
          link="#"
          urgent
        />
        <ResourceCard
          icon={<Heart className="h-6 w-6 text-red-500" />}
          title="Text Support Services"
          description="Crisis text lines for those who prefer not to call."
          link="#"
          urgent
        />
        <ResourceCard
          icon={<Heart className="h-6 w-6 text-red-500" />}
          title="Finding Emergency Care"
          description="How to locate and access emergency mental health services."
          link="#"
          urgent
        />
      </TabsContent>

      <TabsContent value="tools" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard
          icon={<FileText className="h-6 w-6 text-slate-500" />}
          title="Mood Tracker Template"
          description="A downloadable template to track your moods and identify patterns."
          link="https://docs.google.com/spreadsheets/d/1sAHl5DXdcQmyqO2tKaqmzTo1UwnGoUbpu7qsDM_QBkc/edit?usp=sharing"
        />
        <ResourceCard
          icon={<FileText className="h-6 w-6 text-slate-500" />}
          title="Therapy Worksheet"
          description="Common CBT worksheets used in therapy sessions."
          link="#"
        />
        <ResourceCard
          icon={<FileText className="h-6 w-6 text-slate-500" />}
          title="Self-Care Checklist"
          description="A customizable checklist to maintain your self-care routine."
          link="#"
        />
      </TabsContent>
    </Tabs>
  )
}

interface ResourceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  link: string
  urgent?: boolean
}

function ResourceCard({ icon, title, description, link, urgent }: ResourceCardProps) {
  return (
    <Card
      className={`border ${urgent ? "border-red-200 dark:border-red-900" : "border-slate-200 dark:border-slate-700"}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {urgent && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
              Urgent
            </span>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" className="w-full">
          View Resource <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
