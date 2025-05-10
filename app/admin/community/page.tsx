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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Shield, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

type ReportedItem = {
  id: string
  type: "thread" | "reply"
  content: string
  reason: string
  reported_at: string
  reported_by: {
    id: string
    username: string
    avatar_url: string
  }
  author: {
    id: string
    username: string
    avatar_url: string
  }
  status: "pending" | "resolved" | "dismissed"
  category?: string
  thread_id?: string
}

export default function CommunityModeration() {
  const [searchQuery, setSearchQuery] = useState("")
  const [reportedItems, setReportedItems] = useState<ReportedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ReportedItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchReportedItems = async () => {
      try {
        // In a real implementation, you would fetch this from the database
        // For now, we'll use static data
        const reportedItemsData: ReportedItem[] = [
          {
            id: "report1",
            type: "thread",
            content:
              "Has anyone tried this new medication? It's not FDA approved but my friend said it works great for anxiety.",
            reason: "Potentially harmful medical advice",
            reported_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
            reported_by: {
              id: "user5",
              username: "Morgan",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
            author: {
              id: "user6",
              username: "Casey",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
            status: "pending",
            category: "anxiety",
            thread_id: "thread123",
          },
          {
            id: "report2",
            type: "reply",
            content: "You're just being dramatic. Everyone gets sad sometimes, just get over it.",
            reason: "Insensitive content",
            reported_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            reported_by: {
              id: "user7",
              username: "Riley",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
            author: {
              id: "user8",
              username: "Jordan",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
            status: "pending",
            category: "depression",
            thread_id: "thread456",
          },
          {
            id: "report3",
            type: "thread",
            content: "Looking to meet others with similar issues. DM me on Instagram @user123",
            reason: "External contact information",
            reported_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
            reported_by: {
              id: "user9",
              username: "Taylor",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
            author: {
              id: "user10",
              username: "Alex",
              avatar_url: "/placeholder.svg?height=50&width=50",
            },
            status: "pending",
            category: "general",
            thread_id: "thread789",
          },
        ]

        setReportedItems(reportedItemsData)
      } catch (error) {
        console.error("Error fetching reported items:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportedItems()
  }, [supabase])

  const handleResolve = (id: string) => {
    setReportedItems(reportedItems.map((item) => (item.id === id ? { ...item, status: "resolved" } : item)))
  }

  const handleDismiss = (id: string) => {
    setReportedItems(reportedItems.map((item) => (item.id === id ? { ...item, status: "dismissed" } : item)))
  }

  const confirmDelete = (item: ReportedItem) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (!selectedItem) return

    // In a real implementation, you would delete the item from the database
    setReportedItems(reportedItems.filter((item) => item.id !== selectedItem.id))
    setDeleteDialogOpen(false)
    setSelectedItem(null)
  }

  const filteredItems = reportedItems.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.content.toLowerCase().includes(searchLower) ||
      item.author.username.toLowerCase().includes(searchLower) ||
      item.reported_by.username.toLowerCase().includes(searchLower) ||
      item.reason.toLowerCase().includes(searchLower)
    )
  })

  const pendingItems = filteredItems.filter((item) => item.status === "pending")
  const resolvedItems = filteredItems.filter((item) => item.status === "resolved")
  const dismissedItems = filteredItems.filter((item) => item.status === "dismissed")

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Community Moderation</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage reported content and maintain community guidelines
            </p>
          </div>
          <Badge className="bg-rose-500 text-white">
            <Shield className="mr-1 h-4 w-4" /> Moderator
          </Badge>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search reported content..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white">
                  {pendingItems.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reports</CardTitle>
                <CardDescription>Reports that need your attention</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">Loading reports...</div>
                ) : pendingItems.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No pending reports found.</p>
                    {searchQuery && <p className="mt-2">Try adjusting your search query.</p>}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reported</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.type === "thread"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                  : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                              }
                            >
                              {item.type === "thread" ? "Thread" : "Reply"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={item.author.avatar_url || "/placeholder.svg"}
                                  alt={item.author.username}
                                />
                                <AvatarFallback>{item.author.username.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{item.author.username}</p>
                                <p className="text-sm line-clamp-2">{item.content}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{item.reason}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDistanceToNow(new Date(item.reported_at), { addSuffix: true })}
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                by {item.reported_by.username}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="View Content">
                                <Link
                                  href={
                                    item.type === "thread"
                                      ? `/community/${item.category}/${item.thread_id}`
                                      : `/community/${item.category}/${item.thread_id}#${item.id}`
                                  }
                                  target="_blank"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                                onClick={() => handleResolve(item.id)}
                                title="Resolve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600"
                                onClick={() => handleDismiss(item.id)}
                                title="Dismiss"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => confirmDelete(item)}
                                title="Delete Content"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved">
            <Card>
              <CardHeader>
                <CardTitle>Resolved Reports</CardTitle>
                <CardDescription>Reports that have been addressed</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">Loading reports...</div>
                ) : resolvedItems.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No resolved reports found.</p>
                    {searchQuery && <p className="mt-2">Try adjusting your search query.</p>}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reported</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resolvedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.type === "thread"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                  : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                              }
                            >
                              {item.type === "thread" ? "Thread" : "Reply"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={item.author.avatar_url || "/placeholder.svg"}
                                  alt={item.author.username}
                                />
                                <AvatarFallback>{item.author.username.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{item.author.username}</p>
                                <p className="text-sm line-clamp-2">{item.content}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{item.reason}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDistanceToNow(new Date(item.reported_at), { addSuffix: true })}
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                by {item.reported_by.username}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="View Content">
                                <Link
                                  href={
                                    item.type === "thread"
                                      ? `/community/${item.category}/${item.thread_id}`
                                      : `/community/${item.category}/${item.thread_id}#${item.id}`
                                  }
                                  target="_blank"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dismissed">
            <Card>
              <CardHeader>
                <CardTitle>Dismissed Reports</CardTitle>
                <CardDescription>Reports that were dismissed</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">Loading reports...</div>
                ) : dismissedItems.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No dismissed reports found.</p>
                    {searchQuery && <p className="mt-2">Try adjusting your search query.</p>}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reported</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dismissedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.type === "thread"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                  : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                              }
                            >
                              {item.type === "thread" ? "Thread" : "Reply"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={item.author.avatar_url || "/placeholder.svg"}
                                  alt={item.author.username}
                                />
                                <AvatarFallback>{item.author.username.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{item.author.username}</p>
                                <p className="text-sm line-clamp-2">{item.content}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{item.reason}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDistanceToNow(new Date(item.reported_at), { addSuffix: true })}
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                by {item.reported_by.username}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" asChild className="h-8 w-8" title="View Content">
                                <Link
                                  href={
                                    item.type === "thread"
                                      ? `/community/${item.category}/${item.thread_id}`
                                      : `/community/${item.category}/${item.thread_id}#${item.id}`
                                  }
                                  target="_blank"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {selectedItem?.type}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
