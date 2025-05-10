"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, MessageSquare, Heart, CreditCard, Search, Shield, UserCheck, UserX, Mail, Loader2 } from "lucide-react"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalMatches: 0,
    totalMessages: 0,
    totalThreads: 0,
    totalReplies: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (error) throw error

        if (data.role !== "admin") {
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)
        fetchDashboardData()
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/dashboard")
      }
    }

    checkAdmin()
  }, [user, router, supabase])

  const fetchDashboardData = async () => {
    try {
      // In a real implementation, you would fetch this data from the database
      // For now, we'll use static data

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStats({
        totalUsers: 1245,
        activeUsers: 876,
        premiumUsers: 342,
        totalMatches: 5678,
        totalMessages: 24567,
        totalThreads: 876,
        totalReplies: 3456,
      })

      setRecentUsers([
        {
          id: "user1",
          email: "user1@example.com",
          username: "Alex",
          full_name: "Alex Johnson",
          avatar_url: "/placeholder.svg?height=50&width=50",
          created_at: "2023-05-15T10:30:00Z",
          role: "user",
        },
        {
          id: "user2",
          email: "user2@example.com",
          username: "Jamie",
          full_name: "Jamie Smith",
          avatar_url: "/placeholder.svg?height=50&width=50",
          created_at: "2023-05-14T14:20:00Z",
          role: "user",
        },
        {
          id: "user3",
          email: "user3@example.com",
          username: "Taylor",
          full_name: "Taylor Brown",
          avatar_url: "/placeholder.svg?height=50&width=50",
          created_at: "2023-05-13T09:15:00Z",
          role: "user",
        },
        {
          id: "user4",
          email: "user4@example.com",
          username: "Jordan",
          full_name: "Jordan Wilson",
          avatar_url: "/placeholder.svg?height=50&width=50",
          created_at: "2023-05-12T16:45:00Z",
          role: "user",
        },
        {
          id: "user5",
          email: "user5@example.com",
          username: "Morgan",
          full_name: "Morgan Davis",
          avatar_url: "/placeholder.svg?height=50&width=50",
          created_at: "2023-05-11T11:30:00Z",
          role: "admin",
        },
      ])

      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  const userGrowthData = [
    { name: "Jan", users: 450 },
    { name: "Feb", users: 550 },
    { name: "Mar", users: 620 },
    { name: "Apr", users: 750 },
    { name: "May", users: 890 },
    { name: "Jun", users: 1050 },
    { name: "Jul", users: 1245 },
  ]

  const matchesData = [
    { name: "Jan", matches: 1200 },
    { name: "Feb", matches: 1800 },
    { name: "Mar", matches: 2400 },
    { name: "Apr", matches: 3100 },
    { name: "May", matches: 3800 },
    { name: "Jun", matches: 4500 },
    { name: "Jul", matches: 5678 },
  ]

  const userTypeData = [
    { name: "Free Users", value: stats.totalUsers - stats.premiumUsers },
    { name: "Premium Users", value: stats.premiumUsers },
  ]

  const COLORS = ["#94a3b8", "#e11d48"]

  const filteredUsers = recentUsers.filter((user) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.full_name.toLowerCase().includes(searchLower)
    )
  })

  if (!isAdmin || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300">Platform overview and management</p>
          </div>
          <Badge className="bg-rose-500 text-white">
            <Shield className="mr-1 h-4 w-4" /> Admin
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
                  <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900/20">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-green-600 dark:text-green-400">+12% from last month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Matches</p>
                  <h3 className="text-2xl font-bold">{stats.totalMatches}</h3>
                </div>
                <div className="p-2 bg-rose-100 rounded-full dark:bg-rose-900/20">
                  <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-green-600 dark:text-green-400">+18% from last month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Messages</p>
                  <h3 className="text-2xl font-bold">{stats.totalMessages}</h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900/20">
                  <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-green-600 dark:text-green-400">+24% from last month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Premium Users</p>
                  <h3 className="text-2xl font-bold">{stats.premiumUsers}</h3>
                </div>
                <div className="p-2 bg-amber-100 rounded-full dark:bg-amber-900/20">
                  <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-green-600 dark:text-green-400">+8% from last month</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#e11d48" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matches Created</CardTitle>
              <CardDescription>Monthly match creation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={matchesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="matches" stroke="#e11d48" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>User Types</CardTitle>
              <CardDescription>Free vs Premium users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>Recent activity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Active Users (24h)</p>
                    <p className="text-sm font-bold">{stats.activeUsers}</p>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div
                      className="bg-rose-500 h-2.5 rounded-full"
                      style={{ width: `${(stats.activeUsers / stats.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Premium Conversion</p>
                    <p className="text-sm font-bold">{((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full"
                      style={{ width: `${(stats.premiumUsers / stats.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Forum Threads</p>
                    <p className="text-sm font-bold">{stats.totalThreads}</p>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Forum Replies</p>
                    <p className="text-sm font-bold">{stats.totalReplies}</p>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="emails">Email Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage platform users</CardDescription>
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                              <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.role === "admin"
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600">
                              <UserCheck className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600">
                              <UserX className="h-4 w-4 mr-1" /> Ban
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
                <CardDescription>Manage reported content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending reports</h3>
                  <p className="text-slate-500 dark:text-slate-400">All reports have been handled.</p>
                  <Button variant="outline" className="mt-4">
                    View Resolved Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Manage email notification queue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Email queue is empty</h3>
                  <p className="text-slate-500 dark:text-slate-400">All emails have been processed.</p>
                  <Button variant="outline" className="mt-4">
                    View Sent Emails
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
