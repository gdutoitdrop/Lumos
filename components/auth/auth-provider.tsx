"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]

type AuthContextType = {
  user: User | null
  profile: any | null
  isPremium: boolean
  subscription: Subscription | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isPremium: false,
  subscription: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current auth user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()
        setUser(currentUser)

        if (currentUser) {
          // Get user profile
          const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

          setProfile(userProfile)

          // Get subscription status
          const { data: userSubscription } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", currentUser.id)
            .eq("status", "active")
            .maybeSingle()

          setSubscription(userSubscription)
          setIsPremium(!!userSubscription)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    // Set up auth state change listener
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)

        // Get user profile
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(userProfile)

        // Get subscription status
        const { data: userSubscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .maybeSingle()

        setSubscription(userSubscription)
        setIsPremium(!!userSubscription)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setSubscription(null)
        setIsPremium(false)
      }
    })

    return () => {
      authSubscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSubscription(null)
    setIsPremium(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, isPremium, subscription, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
