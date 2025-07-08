export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          mental_health_badges: string[] | null
          current_mood: string | null
          looking_for: string | null
          mental_health_journey: string | null
          gender: string | null
          age: number | null
          location: string | null
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          mental_health_badges?: string[] | null
          current_mood?: string | null
          looking_for?: string | null
          mental_health_journey?: string | null
          gender?: string | null
          age?: number | null
          location?: string | null
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          mental_health_badges?: string[] | null
          current_mood?: string | null
          looking_for?: string | null
          mental_health_journey?: string | null
          gender?: string | null
          age?: number | null
          location?: string | null
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          message_type?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          message_type?: string
          is_read?: boolean
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          profile_id_1: string
          profile_id_2: string
          match_score: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id_1: string
          profile_id_2: string
          match_score?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id_1?: string
          profile_id_2?: string
          match_score?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          author_id: string
          author_name: string
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          reply_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          author_id: string
          author_name: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          reply_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          author_id?: string
          author_name?: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          reply_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_replies: {
        Row: {
          id: string
          thread_id: string
          content: string
          author_id: string
          author_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          content: string
          author_id: string
          author_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          content?: string
          author_id?: string
          author_name?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
