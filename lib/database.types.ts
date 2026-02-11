export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          role: "user" | "admin"
          points: number
          created_at: string
        }
        Insert: {
          id: string
          username: string
          role?: "user" | "admin"
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          role?: "user" | "admin"
          points?: number
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: number
          title: string
          description: string
          category_id: number | null
          points: number
          flag: string
          file_url: string | null
          difficulty: "fácil" | "medio" | "difícil" | null
          created_at: string
          created_by: string | null
          challenge_type: "flag" | "quiz" | null
          quiz_data: Json | null
        }
        Insert: {
          id?: number
          title: string
          description: string
          category_id?: number | null
          points: number
          flag: string
          file_url?: string | null
          difficulty?: "fácil" | "medio" | "difícil" | null
          created_at?: string
          created_by?: string | null
          challenge_type?: "flag" | "quiz" | null
          quiz_data?: Json | null
        }
        Update: {
          id?: number
          title?: string
          description?: string
          category_id?: number | null
          points?: number
          flag?: string
          file_url?: string | null
          difficulty?: "fácil" | "medio" | "difícil" | null
          created_at?: string
          created_by?: string | null
          challenge_type?: "flag" | "quiz" | null
          quiz_data?: Json | null
        }
      }
      rooms: {
        Row: {
          id: number
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          created_by?: string | null
        }
      }
      room_challenges: {
        Row: {
          room_id: number
          challenge_id: number
        }
        Insert: {
          room_id: number
          challenge_id: number
        }
        Update: {
          room_id?: number
          challenge_id?: number
        }
      }
      solved_challenges: {
        Row: {
          profile_id: string
          challenge_id: number
          solved_at: string
          quiz_score: number | null
        }
        Insert: {
          profile_id: string
          challenge_id: number
          solved_at?: string
          quiz_score?: number | null
        }
        Update: {
          profile_id?: string
          challenge_id?: number
          solved_at?: string
          quiz_score?: number | null
        }
      }
    }
  }
}
