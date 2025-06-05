import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, LineChart, BookOpen, MessageCircle, Shield } from "lucide-react"

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Heart":
        return <Heart className="h-8 w-8 text-rose-500" />
      case "Users":
        return <Users className="h-8 w-8 text-blue-500" />
      case "LineChart":
        return <LineChart className="h-8 w-8 text-green-500" />
      case "BookOpen":
        return <BookOpen className="h-8 w-8 text-purple-500" />
      case "MessageCircle":
        return <MessageCircle className="h-8 w-8 text-amber-500" />
      case "Shield":
        return <Shield className="h-8 w-8 text-slate-500" />
      default:
        return <Heart className="h-8 w-8 text-rose-500" />
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">{getIcon(icon)}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
