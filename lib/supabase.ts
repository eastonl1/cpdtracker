import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cpd_logs: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          category: string
          created_at: string
          date: string
          description: string
          hours: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          category: string
          date: string
          description: string
          hours: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string
          hours?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cpd_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cpd_goal: number
          created_at: string
          email: string
          email_notifications: boolean
          first_name: string | null
          id: string
          last_name: string | null
          peo_number: string | null
          updated_at: string
        }
        Insert: {
          cpd_goal?: number
          created_at?: string
          email: string
          email_notifications?: boolean
          first_name?: string | null
          id: string
          last_name?: string | null
          peo_number?: string | null
          updated_at?: string
        }
        Update: {
          cpd_goal?: number
          created_at?: string
          email?: string
          email_notifications?: boolean
          first_name?: string | null
          id?: string
          last_name?: string | null
          peo_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type SupabaseClient = ReturnType<typeof createClient>

function createStub(): SupabaseClient {
  const handler = {
    get() {
      return () => {
        console.warn(
          "[Supabase] Environment variables are missing or this is SSR. Supabase features disabled."
        )
        return Promise.reject(new Error("Supabase environment unavailable."))
      }
    },
  }
  return new Proxy({} as SupabaseClient, handler)
}

export const supabase: SupabaseClient =
  typeof window !== "undefined" && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: localStorage,
        },
      })
    : createStub()

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)
