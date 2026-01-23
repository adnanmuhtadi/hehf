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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      booking_hosts: {
        Row: {
          assigned_at: string | null
          booking_id: string
          created_at: string | null
          host_id: string
          id: string
          responded_at: string | null
          response: Database["public"]["Enums"]["booking_response"] | null
          students_assigned: number | null
        }
        Insert: {
          assigned_at?: string | null
          booking_id: string
          created_at?: string | null
          host_id: string
          id?: string
          responded_at?: string | null
          response?: Database["public"]["Enums"]["booking_response"] | null
          students_assigned?: number | null
        }
        Update: {
          assigned_at?: string | null
          booking_id?: string
          created_at?: string | null
          host_id?: string
          id?: string
          responded_at?: string | null
          response?: Database["public"]["Enums"]["booking_response"] | null
          students_assigned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_hosts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_hosts_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      bookings: {
        Row: {
          arrival_date: string
          bed_type: Database["public"]["Enums"]["bed_type"] | null
          booking_reference: string
          country_of_students: string
          created_at: string | null
          created_by: string
          departure_date: string
          id: string
          location: string
          notes: string | null
          number_of_nights: number | null
          number_of_students: number | null
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string | null
        }
        Insert: {
          arrival_date: string
          bed_type?: Database["public"]["Enums"]["bed_type"] | null
          booking_reference: string
          country_of_students: string
          created_at?: string | null
          created_by: string
          departure_date: string
          id?: string
          location: string
          notes?: string | null
          number_of_nights?: number | null
          number_of_students?: number | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
        }
        Update: {
          arrival_date?: string
          bed_type?: Database["public"]["Enums"]["bed_type"] | null
          booking_reference?: string
          country_of_students?: string
          created_at?: string | null
          created_by?: string
          departure_date?: string
          id?: string
          location?: string
          notes?: string | null
          number_of_nights?: number | null
          number_of_students?: number | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      host_location_bonuses: {
        Row: {
          bonus_per_night: number
          created_at: string | null
          host_id: string
          id: string
          location: string
          updated_at: string | null
        }
        Insert: {
          bonus_per_night?: number
          created_at?: string | null
          host_id: string
          id?: string
          location: string
          updated_at?: string | null
        }
        Update: {
          bonus_per_night?: number
          created_at?: string | null
          host_id?: string
          id?: string
          location?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "host_location_bonuses_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          full_name: string
          handbook_downloaded: boolean | null
          has_completed_tour: boolean | null
          id: string
          is_active: boolean | null
          max_students_capacity: number | null
          must_reset_password: boolean | null
          pets: string | null
          phone: string | null
          preferred_locations: string[] | null
          rate_per_student_per_night: number | null
          role: Database["public"]["Enums"]["user_role"]
          shared_bed_capacity: number | null
          single_bed_capacity: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          full_name: string
          handbook_downloaded?: boolean | null
          has_completed_tour?: boolean | null
          id?: string
          is_active?: boolean | null
          max_students_capacity?: number | null
          must_reset_password?: boolean | null
          pets?: string | null
          phone?: string | null
          preferred_locations?: string[] | null
          rate_per_student_per_night?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          shared_bed_capacity?: number | null
          single_bed_capacity?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          handbook_downloaded?: boolean | null
          has_completed_tour?: boolean | null
          id?: string
          is_active?: boolean | null
          max_students_capacity?: number | null
          must_reset_password?: boolean | null
          pets?: string | null
          phone?: string | null
          preferred_locations?: string[] | null
          rate_per_student_per_night?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          shared_bed_capacity?: number | null
          single_bed_capacity?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "host"
      bed_type: "single_beds_only" | "shared_beds"
      booking_response: "pending" | "accepted" | "declined"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      user_role: "admin" | "host"
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
      app_role: ["admin", "host"],
      bed_type: ["single_beds_only", "shared_beds"],
      booking_response: ["pending", "accepted", "declined"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      user_role: ["admin", "host"],
    },
  },
} as const
