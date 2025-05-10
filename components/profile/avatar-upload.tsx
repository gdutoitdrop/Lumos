"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"

interface AvatarUploadProps {
  userId: string
  avatarUrl: string | null
  username?: string
  onUploadComplete: (url: string) => void
}

export function AvatarUpload({ userId, avatarUrl, username, onUploadComplete }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setUploading(true)

    try {
      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${uuidv4()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath)

      if (data?.publicUrl) {
        onUploadComplete(data.publicUrl)
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your avatar.",
        variant: "destructive",
      })
      console.error("Error uploading avatar:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={username || "User avatar"} />
          ) : (
            <AvatarFallback className="bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
              {username?.charAt(0) || <User className="h-12 w-12" />}
            </AvatarFallback>
          )}
          <div className="absolute bottom-0 right-0 bg-rose-500 text-white rounded-full p-1 shadow-md">
            <Camera className="h-4 w-4" />
          </div>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAvatarClick}
        disabled={uploading}
        className="text-xs"
      >
        {uploading ? "Uploading..." : avatarUrl ? "Change Photo" : "Upload Photo"}
      </Button>
    </div>
  )
}
