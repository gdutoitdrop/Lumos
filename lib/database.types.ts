export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          age: number | null
          location: string | null
          interests: string[] | null
          mode: "dating" | "friendship" | null
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          age?: number | null
          location?: string | null
          interests?: string[] | null
          mode?: "dating" | "friendship" | null
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          age?: number | null
          location?: string | null
          interests?: string[] | null
          mode?: "dating" | "friendship" | null
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participant_1: string
          participant_2: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_1: string
          participant_2: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_1?: string
          participant_2?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          user_1: string
          user_2: string
          status: "pending" | "matched" | "rejected"
          created_at: string
        }
        Insert: {
          id?: string
          user_1: string
          user_2: string
          status?: "pending" | "matched" | "rejected"
          created_at?: string
        }
        Update: {
          id?: string
          user_1?: string
          user_2?: string
          status?: "pending" | "matched" | "rejected"
          created_at?: string
        }
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      forum_replies: {
        Row: {
          id: string
          thread_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          author_id?: string
          content?: string
          created_at?: string
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
