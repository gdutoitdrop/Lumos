"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface SubscribeButtonProps {
  plan: string
  className?: string
  children: React.ReactNode
}

export function SubscribeButton({ plan, className, children }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          returnUrl: window.location.origin + "/settings",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error: any) {
      console.error("Error subscribing:", error)
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to start subscription process",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className={className} onClick={handleSubscribe} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  )
}
