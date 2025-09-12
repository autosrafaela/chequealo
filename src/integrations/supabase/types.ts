export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contact_requests: {
        Row: {
          budget_range: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          professional_id: string
          service_type: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          professional_id: string
          service_type?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          professional_id?: string
          service_type?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          professional_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          professional_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          professional_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      professional_services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          price_from: number | null
          price_to: number | null
          price_unit: string | null
          professional_id: string
          service_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          price_from?: number | null
          price_to?: number | null
          price_unit?: string | null
          professional_id: string
          service_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          price_from?: number | null
          price_to?: number | null
          price_unit?: string | null
          professional_id?: string
          service_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          availability: string | null
          created_at: string
          description: string | null
          email: string
          full_name: string
          id: string
          image_url: string | null
          is_verified: boolean
          location: string | null
          phone: string | null
          profession: string
          rating: number | null
          review_count: number | null
          updated_at: string
          user_id: string
          verification_date: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string
          description?: string | null
          email: string
          full_name: string
          id?: string
          image_url?: string | null
          is_verified?: boolean
          location?: string | null
          phone?: string | null
          profession: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string
          user_id: string
          verification_date?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string
          description?: string | null
          email?: string
          full_name?: string
          id?: string
          image_url?: string | null
          is_verified?: boolean
          location?: string | null
          phone?: string | null
          profession?: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string
          user_id?: string
          verification_date?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      review_responses: {
        Row: {
          created_at: string
          id: string
          professional_id: string
          response: string
          review_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          professional_id: string
          response: string
          review_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          professional_id?: string
          response?: string
          review_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_transaction_verified: boolean
          is_verified: boolean
          professional_id: string
          rating: number
          service_provided: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string
          verification_token: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_transaction_verified?: boolean
          is_verified?: boolean
          professional_id: string
          rating: number
          service_provided?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id: string
          verification_token?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_transaction_verified?: boolean
          is_verified?: boolean
          professional_id?: string
          rating?: number
          service_provided?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          completed_at: string | null
          contact_request_id: string | null
          created_at: string
          id: string
          professional_id: string
          service_type: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          completed_at?: string | null
          contact_request_id?: string | null
          created_at?: string
          id?: string
          professional_id: string
          service_type?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          completed_at?: string | null
          contact_request_id?: string | null
          created_at?: string
          id?: string
          professional_id?: string
          service_type?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_ratings: {
        Row: {
          comment: string | null
          communication_rating: number
          created_at: string
          id: string
          overall_rating: number
          payment_rating: number
          professional_id: string
          punctuality_rating: number
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          communication_rating: number
          created_at?: string
          id?: string
          overall_rating: number
          payment_rating: number
          professional_id: string
          punctuality_rating: number
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          communication_rating?: number
          created_at?: string
          id?: string
          overall_rating?: number
          payment_rating?: number
          professional_id?: string
          punctuality_rating?: number
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          certifications: string[] | null
          created_at: string
          document_urls: string[] | null
          education: string | null
          email: string
          full_name: string
          id: string
          license_number: string | null
          phone: string | null
          profession: string
          professional_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          admin_notes?: string | null
          certifications?: string[] | null
          created_at?: string
          document_urls?: string[] | null
          education?: string | null
          email: string
          full_name: string
          id?: string
          license_number?: string | null
          phone?: string | null
          profession: string
          professional_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          admin_notes?: string | null
          certifications?: string[] | null
          created_at?: string
          document_urls?: string[] | null
          education?: string | null
          email?: string
          full_name?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          profession?: string
          professional_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      work_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          professional_id: string
          uploaded_by: string
          work_type: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_featured?: boolean
          professional_id: string
          uploaded_by?: string
          work_type?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_featured?: boolean
          professional_id?: string
          uploaded_by?: string
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_photos_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "professional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "professional"],
    },
  },
} as const
