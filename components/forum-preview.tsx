import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MessageCircle, Share2 } from "lucide-react"

export function ForumPreview() {
  return (
    <Tabs defaultValue="anxiety" className="w-full">
      <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8">
        <TabsTrigger value="anxiety">Anxiety</TabsTrigger>
        <TabsTrigger value="relationships">Relationships</TabsTrigger>
        <TabsTrigger value="positivity">Positivity</TabsTrigger>
      </TabsList>

      <TabsContent value="anxiety" className="space-y-4">
        <ForumPost
          avatar="/placeholder.svg?height=50&width=50"
          name="Alex"
          time="2 hours ago"
          title="Coping with social anxiety at work"
          content="I've been struggling with social anxiety at my new job. The team is great, but I freeze up during meetings. Has anyone found effective strategies for managing this in professional settings?"
          likes={24}
          comments={8}
        />
        <ForumPost
          avatar="/placeholder.svg?height=50&width=50"
          name="Jamie"
          time="Yesterday"
          title="Anxiety management techniques that actually work"
          content="After years of trial and error, I've found some techniques that help me manage my anxiety. Sharing in case they help others: 1) Box breathing 2) Grounding exercises 3) Regular exercise..."
          likes={56}
          comments={17}
        />
      </TabsContent>

      <TabsContent value="relationships" className="space-y-4">
        <ForumPost
          avatar="/placeholder.svg?height=50&width=50"
          name="Taylor"
          time="3 hours ago"
          title="How to explain anxiety to a new partner"
          content="I've started dating someone new and want to open up about my anxiety, but I'm not sure how to approach it. Any advice on timing and what to say?"
          likes={32}
          comments={14}
        />
      </TabsContent>

      <TabsContent value="positivity" className="space-y-4">
        <ForumPost
          avatar="/placeholder.svg?height=50&width=50"
          name="Jordan"
          time="1 day ago"
          title="Small wins celebration thread!"
          content="Let's celebrate our small victories! I'll start: I made it through a work presentation today without a panic attack for the first time in months. What's your win?"
          likes={78}
          comments={42}
        />
      </TabsContent>
    </Tabs>
  )
}

interface ForumPostProps {
  avatar: string
  name: string
  time: string
  title: string
  content: string
  likes: number
  comments: number
}

function ForumPost({ avatar, name, time, title, content, likes, comments }: ForumPostProps) {
  return (
    <Card className="border border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{time}</div>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            Community Support
          </Badge>
        </div>
        <CardTitle className="text-lg mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 dark:text-slate-300 mb-4">{content}</p>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Heart className="h-4 w-4" /> {likes}
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" /> {comments}
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
