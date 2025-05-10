import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Bookmark } from "lucide-react"

export function ProfileDemo() {
  return (
    <Card className="border border-slate-200 dark:border-slate-700 shadow-lg max-w-md mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-rose-200">
              <AvatarImage src="/placeholder.svg?height=100&width=100" alt="Sarah" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">Sarah, 28</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                  Anxiety Warrior
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  Mental Health Advocate
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
              <Heart className="h-5 w-5" />
            </button>
            <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <MessageCircle className="h-5 w-5" />
            </button>
            <button className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">About me</h4>
            <p className="mt-1">
              Artist, dog mom, and mental health advocate navigating life with anxiety. Looking for authentic
              connections with people who understand the ups and downs. I value honesty, creativity, and compassion.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">My mental health journey</h4>
            <p className="mt-1">
              Diagnosed with anxiety 5 years ago. I've learned to manage through therapy, art, and building a supportive
              community. Some days are harder than others, but I'm proud of how far I've come.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Current mood</h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-green-400"></span>
              <span>Feeling balanced today</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Looking for</h4>
            <p className="mt-1">
              Friends who understand mental health struggles and can share experiences. Open to dating someone patient
              and empathetic.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
