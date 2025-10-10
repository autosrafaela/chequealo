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
      availability_slots: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          max_bookings_per_slot: number
          professional_id: string
          slot_duration_minutes: number
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          max_bookings_per_slot?: number
          professional_id: string
          slot_duration_minutes?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          max_bookings_per_slot?: number
          professional_id?: string
          slot_duration_minutes?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          points: number
          rarity: string
          updated_at: string
        }
        Insert: {
          category: string
          condition_type: string
          condition_value: number
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          points?: number
          rarity?: string
          updated_at?: string
        }
        Update: {
          category?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          points?: number
          rarity?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_reference: string | null
          cancellation_reason: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          currency: string | null
          duration_minutes: number
          id: string
          notes: string | null
          professional_id: string
          reminder_sent: boolean | null
          rescheduled_from: string | null
          service_id: string | null
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_reference?: string | null
          cancellation_reason?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          currency?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          professional_id: string
          reminder_sent?: boolean | null
          rescheduled_from?: string | null
          service_id?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_reference?: string | null
          cancellation_reason?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          currency?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          professional_id?: string
          reminder_sent?: boolean | null
          rescheduled_from?: string | null
          service_id?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
            isOneToOne: false
            referencedRelation: "bookings_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "professional_services"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          certificate_name: string
          certificate_url: string
          created_at: string
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_organization: string
          professional_id: string
          updated_at: string
          verification_status: string | null
        }
        Insert: {
          certificate_name: string
          certificate_url: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization: string
          professional_id: string
          updated_at?: string
          verification_status?: string | null
        }
        Update: {
          certificate_name?: string
          certificate_url?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string
          professional_id?: string
          updated_at?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      contact_access_logs: {
        Row: {
          access_type: string
          accessed_by: string | null
          action_result: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          professional_id: string
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_by?: string | null
          action_result?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          professional_id: string
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_by?: string | null
          action_result?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          professional_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
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
      conversations: {
        Row: {
          contact_request_id: string | null
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          professional_id: string
          status: string
          unread_count_professional: number | null
          unread_count_user: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_request_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          professional_id: string
          status?: string
          unread_count_professional?: number | null
          unread_count_user?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_request_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          professional_id?: string
          status?: string
          unread_count_professional?: number | null
          unread_count_user?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_contact_request_id_fkey"
            columns: ["contact_request_id"]
            isOneToOne: false
            referencedRelation: "contact_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public_safe"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "favorites_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_read: boolean
          message_type: string
          read_at: string | null
          sender_id: string
          sender_type: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_read?: boolean
          message_type?: string
          read_at?: string | null
          sender_id: string
          sender_type: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_read?: boolean
          message_type?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
          updated_at?: string
        }
        Relationships: []
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
      payment_methods: {
        Row: {
          card_brand: string | null
          card_last_four: string | null
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          mercadopago_payment_method_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          mercadopago_payment_method_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          mercadopago_payment_method_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          mercadopago_payment_id: string | null
          mercadopago_preference_id: string | null
          payment_date: string | null
          status: string
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          payment_date?: string | null
          status?: string
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          payment_date?: string | null
          status?: string
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profession_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      professional_rankings: {
        Row: {
          category: string
          created_at: string
          id: string
          period_end: string | null
          period_start: string | null
          professional_id: string
          rank_position: number
          score: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          professional_id: string
          rank_position: number
          score?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          professional_id?: string
          rank_position?: number
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_rankings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_rankings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_rankings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public_safe"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "professional_services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          availability: string | null
          created_at: string
          description: string | null
          dni: string | null
          email: string
          full_name: string
          has_free_access: boolean
          id: string
          image_url: string | null
          is_blocked: boolean
          is_verified: boolean
          latitude: number | null
          location: string | null
          location_updated_at: string | null
          location_verified: boolean | null
          longitude: number | null
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
          dni?: string | null
          email: string
          full_name: string
          has_free_access?: boolean
          id?: string
          image_url?: string | null
          is_blocked?: boolean
          is_verified?: boolean
          latitude?: number | null
          location?: string | null
          location_updated_at?: string | null
          location_verified?: boolean | null
          longitude?: number | null
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
          dni?: string | null
          email?: string
          full_name?: string
          has_free_access?: boolean
          id?: string
          image_url?: string | null
          is_blocked?: boolean
          is_verified?: boolean
          latitude?: number | null
          location?: string | null
          location_updated_at?: string | null
          location_verified?: boolean | null
          longitude?: number | null
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
          is_blocked: boolean
          location: string | null
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
          is_blocked?: boolean
          location?: string | null
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
          is_blocked?: boolean
          location?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          last_used_at: string | null
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      review_likes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
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
            foreignKeyName: "review_responses_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public_safe"
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
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          profession_category_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          profession_category_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          profession_category_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_profession_category_id_fkey"
            columns: ["profession_category_id"]
            isOneToOne: false
            referencedRelation: "profession_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          advanced_analytics: boolean | null
          billing_interval: string
          calendar_integration: boolean | null
          can_receive_messages: boolean | null
          can_send_files: boolean | null
          created_at: string
          currency: string
          featured_listing: boolean | null
          features: Json | null
          grace_period_days: number
          id: string
          is_active: boolean
          max_contact_requests: number | null
          max_monthly_bookings: number | null
          max_work_photos: number | null
          name: string
          price: number
          priority_support: boolean | null
          updated_at: string
        }
        Insert: {
          advanced_analytics?: boolean | null
          billing_interval?: string
          calendar_integration?: boolean | null
          can_receive_messages?: boolean | null
          can_send_files?: boolean | null
          created_at?: string
          currency?: string
          featured_listing?: boolean | null
          features?: Json | null
          grace_period_days?: number
          id?: string
          is_active?: boolean
          max_contact_requests?: number | null
          max_monthly_bookings?: number | null
          max_work_photos?: number | null
          name: string
          price: number
          priority_support?: boolean | null
          updated_at?: string
        }
        Update: {
          advanced_analytics?: boolean | null
          billing_interval?: string
          calendar_integration?: boolean | null
          can_receive_messages?: boolean | null
          can_send_files?: boolean | null
          created_at?: string
          currency?: string
          featured_listing?: boolean | null
          features?: Json | null
          grace_period_days?: number
          id?: string
          is_active?: boolean
          max_contact_requests?: number | null
          max_monthly_bookings?: number | null
          max_work_photos?: number | null
          name?: string
          price?: number
          priority_support?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          mercadopago_subscription_id: string | null
          next_billing_date: string | null
          payment_data_required_date: string
          payment_reminder_sent: boolean
          plan_id: string
          plan_selection_deadline: string | null
          professional_id: string
          selected_plan_id: string | null
          status: string
          trial_end_date: string
          trial_start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mercadopago_subscription_id?: string | null
          next_billing_date?: string | null
          payment_data_required_date?: string
          payment_reminder_sent?: boolean
          plan_id: string
          plan_selection_deadline?: string | null
          professional_id: string
          selected_plan_id?: string | null
          status?: string
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mercadopago_subscription_id?: string | null
          next_billing_date?: string | null
          payment_data_required_date?: string
          payment_reminder_sent?: boolean
          plan_id?: string
          plan_selection_deadline?: string | null
          professional_id?: string
          selected_plan_id?: string | null
          status?: string
          trial_end_date?: string
          trial_start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_selected_plan_id_fkey"
            columns: ["selected_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
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
      user_achievements: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          is_displayed: boolean
          progress: number | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          is_displayed?: boolean
          progress?: number | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          is_displayed?: boolean
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
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
      user_stats: {
        Row: {
          badges_count: number
          created_at: string
          experience_points: number
          id: string
          level: number
          ranking_position: number | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          badges_count?: number
          created_at?: string
          experience_points?: number
          id?: string
          level?: number
          ranking_position?: number | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          badges_count?: number
          created_at?: string
          experience_points?: number
          id?: string
          level?: number
          ranking_position?: number | null
          total_points?: number
          updated_at?: string
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
          after_image_url: string | null
          before_image_url: string | null
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_before_after: boolean | null
          is_featured: boolean
          media_type: string | null
          professional_id: string
          uploaded_by: string
          video_url: string | null
          work_type: string | null
        }
        Insert: {
          after_image_url?: string | null
          before_image_url?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_before_after?: boolean | null
          is_featured?: boolean
          media_type?: string | null
          professional_id: string
          uploaded_by?: string
          video_url?: string | null
          work_type?: string | null
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_before_after?: boolean | null
          is_featured?: boolean
          media_type?: string | null
          professional_id?: string
          uploaded_by?: string
          video_url?: string | null
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
          {
            foreignKeyName: "work_photos_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_photos_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public_safe"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      bookings_public: {
        Row: {
          booking_date: string | null
          client_email_masked: string | null
          client_name_masked: string | null
          client_phone_masked: string | null
          created_at: string | null
          currency: string | null
          duration_minutes: number | null
          id: string | null
          professional_id: string | null
          service_id: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_date?: string | null
          client_email_masked?: never
          client_name_masked?: never
          client_phone_masked?: never
          created_at?: string | null
          currency?: string | null
          duration_minutes?: number | null
          id?: string | null
          professional_id?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_date?: string | null
          client_email_masked?: never
          client_name_masked?: never
          client_phone_masked?: never
          created_at?: string | null
          currency?: string | null
          duration_minutes?: number | null
          id?: string | null
          professional_id?: string | null
          service_id?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "professional_services"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals_public: {
        Row: {
          availability: string | null
          created_at: string | null
          description: string | null
          full_name: string | null
          id: string | null
          image_url: string | null
          is_blocked: boolean | null
          is_verified: boolean | null
          location: string | null
          profession: string | null
          rating: number | null
          review_count: number | null
          updated_at: string | null
          verification_date: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          description?: string | null
          full_name?: string | null
          id?: string | null
          image_url?: string | null
          is_blocked?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          profession?: string | null
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
          verification_date?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          description?: string | null
          full_name?: string | null
          id?: string | null
          image_url?: string | null
          is_blocked?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          profession?: string | null
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
          verification_date?: string | null
        }
        Relationships: []
      }
      professionals_public_safe: {
        Row: {
          availability: string | null
          created_at: string | null
          description: string | null
          full_name: string | null
          id: string | null
          image_url: string | null
          is_verified: boolean | null
          location: string | null
          profession: string | null
          rating: number | null
          review_count: number | null
          updated_at: string | null
          user_id: string | null
          verification_date: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          description?: string | null
          full_name?: string | null
          id?: string | null
          image_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          profession?: string | null
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_date?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          description?: string | null
          full_name?: string | null
          id?: string | null
          image_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          profession?: string | null
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_date?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_admin_role: {
        Args: { _email: string }
        Returns: undefined
      }
      check_and_award_badges: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      check_subscription_status: {
        Args: { professional_user_id: string }
        Returns: string
      }
      get_professional_contact: {
        Args: { prof_id: string }
        Returns: {
          email: string
          phone: string
        }[]
      }
      get_public_professional_profile: {
        Args: { prof_id: string }
        Returns: {
          availability: string
          description: string
          full_name: string
          id: string
          image_url: string
          is_verified: boolean
          location: string
          profession: string
          rating: number
          review_count: number
          verification_date: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_contact_access: {
        Args: { access_type: string; prof_id: string }
        Returns: undefined
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
