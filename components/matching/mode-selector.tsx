"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"

type ConnectionMode = "date" | "connect" | "both"

interface ModeSelectorProps {
  onModeChange?: (mode: ConnectionMode) => void
}

export function ModeSelector({ onModeChange }: ModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<ConnectionMode>("both")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchCurrentMode = async () => {
      if (!user) return

      const { data } = await supabase.from("profiles").select("connection_mode").eq("id", user.id).single()

      if (data?.connection_mode) {
        setSelectedMode(data.connection_mode as ConnectionMode)
      }
    }

    fetchCurrentMode()
  }, [user, supabase])

  const handleModeSelect = async (mode: ConnectionMode) => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from("profiles").update({ connection_mode: mode }).eq("id", user.id)

      if (!error) {
        setSelectedMode(mode)
        onModeChange?.(mode)
      }
    } catch (error) {
      console.error("Error updating connection mode:", error)
    } finally {
      setLoading(false)
    }
  }

  const modes = [
    {
      id: "date" as ConnectionMode,
      title: "Date Mode",
      description: "Find romantic connections with people who understand your mental health journey",
      icon: Heart,
      color: "rose",
      features: ["Romantic matching", "Date-focused conversations", "Relationship goals"],
    },
    {
      id: "connect" as ConnectionMode,
      title: "Connect Mode",
      description: "Build meaningful friendships and support networks",
      icon: Users,
      color: "blue",
      features: ["Friendship matching", "Support groups", "Platonic connections"],
    },
    {
      id: "both" as ConnectionMode,
      title: "Both Modes",
      description: "Open to both romantic and platonic connections",
      icon: Sparkles,
      color: "purple",
      features: ["All connection types", "Flexible matching", "Broader network"],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Connection Mode</h2>
        <p className="text-muted-foreground">Select how you'd like to connect with others on Lumos</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isSelected = selectedMode === mode.id

          return (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? `ring-2 ring-${mode.color}-500 bg-${mode.color}-50 dark:bg-${mode.color}-950/20`
                  : "hover:shadow-md"
              }`}
              onClick={() => handleModeSelect(mode.id)}
            >
              <CardHeader className="text-center">
                <Icon className={`h-12 w-12 mx-auto mb-4 text-${mode.color}-500`} />
                <CardTitle className="flex items-center justify-center gap-2">
                  {mode.title}
                  {isSelected && (
                    <Badge variant="secondary" className={`bg-${mode.color}-100 text-${mode.color}-700`}>
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{mode.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${mode.color}-500`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full mt-4 ${
                    isSelected ? `bg-${mode.color}-500 hover:bg-${mode.color}-600` : "variant-outline"
                  }`}
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleModeSelect(mode.id)
                  }}
                >
                  {isSelected ? "Selected" : "Select Mode"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
