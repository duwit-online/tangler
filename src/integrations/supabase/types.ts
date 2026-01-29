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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string
          currency: string
          id: string
          is_active: boolean
          routing_number: string | null
          swift_code: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          matched_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          id?: string
          matched_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          id?: string
          matched_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          read_at: string | null
          sender_id: string
          status: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          read_at?: string | null
          sender_id: string
          status?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          read_at?: string | null
          sender_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          display_name: string | null
          gender: string | null
          id: string
          interests: string[] | null
          last_seen: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          looking_for: string | null
          onboarding_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          last_seen?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          looking_for?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          last_seen?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          looking_for?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          duration_days: number | null
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price: number
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string
          direction: string
          id: string
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          swiped_id: string
          swiper_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          id: string
          is_typing: boolean | null
          match_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_typing?: boolean | null
          match_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_typing?: boolean | null
          match_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          banned_at: string
          banned_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          reason: string
          user_id: string
        }
        Insert: {
          banned_at?: string
          banned_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason: string
          user_id: string
        }
        Update: {
          banned_at?: string
          banned_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_photos: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_primary: boolean | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          action_taken: string | null
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_content_id: string | null
          reported_content_type: string
          reported_user_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_content_id?: string | null
          reported_content_type: string
          reported_user_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_content_id?: string | null
          reported_content_type?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_subscriptions: {
        Row: {
          amount_paid: number | null
          bank_account_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          payment_proof_url: string | null
          payment_reference: string | null
          plan_id: string
          starts_at: string | null
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount_paid?: number | null
          bank_account_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_proof_url?: string | null
          payment_reference?: string | null
          plan_id: string
          starts_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount_paid?: number | null
          bank_account_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_proof_url?: string | null
          payment_reference?: string | null
          plan_id?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      are_users_matched: {
        Args: { user1: string; user2: string }
        Returns: boolean
      }
      has_premium: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_match_participant: { Args: { match_id: string }; Returns: boolean }
      is_user_banned: { Args: { _user_id: string }; Returns: boolean }
      is_user_online: { Args: { target_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
