import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"

export default function ThreadPage({ params }: { params: { slug: string; threadId: string } }) {
  // In a real implementation, you would fetch this from the database
  // For now, we'll use static data
  const thread = {
    id: params.threadId,
    title: "Coping with social anxiety at work",
    content:
      "I've been struggling with social anxiety at my new job. The team is great, but I freeze up during meetings. Has anyone found effective strategies for managing this in professional settings?",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    author: {
      id: "user1",
      username: "Alex",
      avatar_url: "/placeholder.svg?height=50&width=50",
    },
    replies: [
      {
        id: "reply1",
        content:
          "I've found that preparation helps a lot. If I know the meeting agenda beforehand, I can prepare my thoughts and even script some responses. It takes the pressure off having to think on the spot.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1 hour ago
        author: {
          id: "user2",
          username: "Jamie",
          avatar_url: "/placeholder.svg?height=50&width=50",
        },
        likes: 12,
      },
      {
        id: "reply2",
        content:
          "Breathing exercises right before meetings help me. I use the 4-7-8 technique: inhale for 4 seconds, hold for 7, exhale for 8. Also, I've been open with my manager about my anxiety, and they've been supportive in creating a more comfortable environment for me.",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        author: {
          id: "user3",
          username: "Taylor",
          avatar_url: "/placeholder.svg?height=50&width=50",
        },
        likes: 8,
      },
    ],
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <Link
          href={`/community/${params.slug}`}
          className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {params.slug.replace(/-/g, " ")}
        </Link>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={thread.author.avatar_url || "/placeholder.svg"} alt={thread.author.username} />
                <AvatarFallback>{thread.author.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{thread.author.username}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl">{thread.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{thread.content}</p>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-4">Replies</h2>
        <div className="space-y-4">
          {thread.replies.map((reply) => (
            <Card key={reply.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={reply.author.avatar_url || "/placeholder.svg"} alt={reply.author.username} />
                    <AvatarFallback>{reply.author.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{reply.author.username}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-line">{reply.content}</p>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Heart className="h-4 w-4" /> {reply.likes}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Add a reply</h2>
          <Card>
            <CardContent className="pt-6">
              <textarea
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-slate-800 dark:border-slate-700"
                rows={5}
                placeholder="Share your thoughts or advice..."
              ></textarea>
              <Button className="mt-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white">Post Reply</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
