"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Heart,
  MessageCircle,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Home,
  Shield,
  Menu,
  X,
  Crown,
  Zap,
} from "lucide-react"

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  // Make these fields optional with undefined to handle missing columns
  connection_mode?: string | null
  subscription_tier?: string | null
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Update the fetchProfile function to handle missing columns
  const fetchProfile = async () => {
    if (!user || profile) return

    try {
      setIsLoading(true)
      // First try to fetch only the columns we know exist
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, bio")
        .eq("id", user.id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // Profile doesn't exist yet, which is fine for new users
          console.log("Profile not found for user:", user.id)
        } else {
          console.error("Error fetching profile:", error)
        }
      } else {
        // Set the basic profile data
        setProfile(data)

        // Try to fetch additional fields separately to handle missing columns
        try {
          const { data: extendedData } = await supabase
            .from("profiles")
            .select("connection_mode, subscription_tier")
            .eq("id", user.id)
            .single()

          if (extendedData) {
            // Update profile with additional fields if they exist
            setProfile((prev) => ({
              ...prev!,
              connection_mode: extendedData.connection_mode,
              subscription_tier: extendedData.subscription_tier,
            }))
          }
        } catch (extendedError) {
          console.log("Some extended profile fields might not exist in the database:", extendedError)
          // Continue without the extended fields
        }
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user, profile])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Matching", href: "/matching", icon: Heart },
    { name: "Messages", href: "/messages", icon: MessageCircle },
    { name: "Community", href: "/community", icon: Users },
    { name: "Resources", href: "/resources", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const isAdmin = user?.email === "admin@lumos.com"
  const isPremium = profile?.subscription_tier === "premium" || profile?.subscription_tier === "premium_plus"

  // Get display name from profile data
  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User"
  const avatarFallback = profile?.full_name?.[0] || profile?.username?.[0] || user?.email?.[0]?.toUpperCase() || "U"

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold">Lumos</span>
              {isPremium && <Crown className="h-4 w-4 text-amber-500" />}
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            {/* Premium/Mode Selection Links */}
            <div className="pt-4 border-t">
              <Link
                href="/mode-selection"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/mode-selection"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Zap className="h-5 w-5" />
                <span>Connection Mode</span>
                {profile?.connection_mode && (
                  <Badge variant="secondary" className="text-xs">
                    {profile.connection_mode}
                  </Badge>
                )}
              </Link>

              <Link
                href="/premium"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/premium"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Crown className="h-5 w-5" />
                <span>Premium</span>
                {isPremium && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                    Active
                  </Badge>
                )}
              </Link>
            </div>

            {isAdmin && (
              <Link
                href="/admin/community"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="h-5 w-5" />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:hidden" /> {/* Spacer for mobile menu button */}
            <div className="flex items-center space-x-4 ml-auto">
              <ModeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                    {isPremium && <Crown className="absolute -top-1 -right-1 h-4 w-4 text-amber-500" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none flex items-center gap-2">
                        {displayName}
                        {isPremium && <Crown className="h-3 w-3 text-amber-500" />}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      {profile?.connection_mode && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {profile.connection_mode} mode
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mode-selection">Connection Mode</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/premium">Premium Features</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
