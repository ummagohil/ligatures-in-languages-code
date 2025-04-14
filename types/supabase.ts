export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          preferred_source_language: string | null
          preferred_target_language: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          preferred_source_language?: string | null
          preferred_target_language?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          preferred_source_language?: string | null
          preferred_target_language?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      translations: {
        Row: {
          id: string
          user_id: string
          source_text: string
          translated_text: string
          source_language: string
          target_language: string
          is_favorite: boolean
          model_used: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_text: string
          translated_text: string
          source_language: string
          target_language: string
          is_favorite?: boolean
          model_used?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_text?: string
          translated_text?: string
          source_language?: string
          target_language?: string
          is_favorite?: boolean
          model_used?: string | null
          created_at?: string
        }
      }
    }
  }
}
