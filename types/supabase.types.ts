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
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          role: string
          subscription_status: boolean
          last_subscription_date: string | null
          profile_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          role?: string
          subscription_status?: boolean
          last_subscription_date?: string | null
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          role?: string
          subscription_status?: boolean
          last_subscription_date?: string | null
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courts: {
        Row: {
          id: string
          name: string
          description: string | null
          surface: string
          indoor: boolean
          is_active: boolean
          features: Json | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          surface: string
          indoor?: boolean
          is_active?: boolean
          features?: Json | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          surface?: string
          indoor?: boolean
          is_active?: boolean
          features?: Json | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      time_slots: {
        Row: {
          id: number
          court_id: string
          start_time: string
          end_time: string
        }
        Insert: {
          id?: number
          court_id: string
          start_time: string
          end_time: string
        }
        Update: {
          id?: number
          court_id?: string
          start_time?: string
          end_time?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          court_id: string
          start_time: string
          end_time: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          court_id: string
          start_time: string
          end_time: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          court_id?: string
          start_time?: string
          end_time?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_records: {
        Row: {
          id: string
          court_id: string
          start_date: string
          end_date: string
          reason: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          court_id: string
          start_date: string
          end_date: string
          reason: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          court_id?: string
          start_date?: string
          end_date?: string
          reason?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}