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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      authorities: {
        Row: {
          active: boolean
          building_name_number: string | null
          city_town_village: string | null
          council_name: string
          county: string | null
          created_at: string
          id: string
          phone_number: string | null
          postcode: string | null
          street_name: string | null
          three_letter_code: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          building_name_number?: string | null
          city_town_village?: string | null
          council_name: string
          county?: string | null
          created_at?: string
          id?: string
          phone_number?: string | null
          postcode?: string | null
          street_name?: string | null
          three_letter_code: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          building_name_number?: string | null
          city_town_village?: string | null
          council_name?: string
          county?: string | null
          created_at?: string
          id?: string
          phone_number?: string | null
          postcode?: string | null
          street_name?: string | null
          three_letter_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: string
          placement_id: string | null
          property_id: string | null
          time: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          id?: string
          placement_id?: string | null
          property_id?: string | null
          time?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          placement_id?: string | null
          property_id?: string | null
          time?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_tenant_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_url: string
          id: string
          name: string
          placement_id: string | null
          property_id: string | null
          type: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          name: string
          placement_id?: string | null
          property_id?: string | null
          type: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          name?: string
          placement_id?: string | null
          property_id?: string | null
          type?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          company_details: Json | null
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          item_description: string
          payment_instructions: string | null
          placement_id: string
          property_id: string | null
          room_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          company_details?: Json | null
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          item_description: string
          payment_instructions?: string | null
          placement_id: string
          property_id?: string | null
          room_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_details?: Json | null
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          item_description?: string
          payment_instructions?: string | null
          placement_id?: string
          property_id?: string | null
          room_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoices_placement_id"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_property_id"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          completed_date: string | null
          created_at: string
          description: string
          estimated_cost: number | null
          id: string
          notes: string | null
          placement_id: string | null
          priority: Database["public"]["Enums"]["maintenance_priority"]
          property_id: string | null
          room_id: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          description: string
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          placement_id?: string | null
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          property_id?: string | null
          room_id?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          placement_id?: string | null
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          property_id?: string | null
          room_id?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          property_id: string | null
          read: boolean
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          property_id?: string | null
          read?: boolean
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          property_id?: string | null
          read?: boolean
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string
          id: string
          paid_date: string | null
          payment_method: string | null
          placement_id: string | null
          property_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          paid_date?: string | null
          payment_method?: string | null
          placement_id?: string | null
          property_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          paid_date?: string | null
          payment_method?: string | null
          placement_id?: string | null
          property_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_data: Json | null
          event_description: string
          event_type: string
          id: string
          placement_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_data?: Json | null
          event_description: string
          event_type: string
          id?: string
          placement_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_data?: Json | null
          event_description?: string
          event_type?: string
          id?: string
          placement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_events_tenant_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
        ]
      }
      placements: {
        Row: {
          booking_closed: string | null
          booking_open: string | null
          check_in_date: string | null
          check_out_date: string | null
          created_at: string
          deposit_amount: number | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          move_in_date: string | null
          property_id: string | null
          rent_amount: number | null
          room_id: string | null
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_closed?: string | null
          booking_open?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string
          deposit_amount?: number | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          move_in_date?: string | null
          property_id?: string | null
          rent_amount?: number | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_closed?: string | null
          booking_open?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string
          deposit_amount?: number | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          move_in_date?: string | null
          property_id?: string | null
          rent_amount?: number | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_placements_property_id"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_placements_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_placements_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          view_preferences: Json | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          view_preferences?: Json | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          view_preferences?: Json | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          city: string
          council_id: string | null
          created_at: string
          deposit_amount: number | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          postal_code: string | null
          rent_amount: number
          square_feet: number | null
          status: Database["public"]["Enums"]["property_status"]
          type: string
          updated_at: string
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          council_id?: string | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          postal_code?: string | null
          rent_amount: number
          square_feet?: number | null
          status?: Database["public"]["Enums"]["property_status"]
          type: string
          updated_at?: string
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          council_id?: string | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          postal_code?: string | null
          rent_amount?: number
          square_feet?: number | null
          status?: Database["public"]["Enums"]["property_status"]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_landlord_id_fkey"
            columns: ["council_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_bookings: {
        Row: {
          attendees: number
          created_at: string
          date: string
          end_time: string
          id: string
          purpose: string | null
          room_id: string | null
          start_time: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attendees?: number
          created_at?: string
          date: string
          end_time: string
          id?: string
          purpose?: string | null
          room_id?: string | null
          start_time: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attendees?: number
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          purpose?: string | null
          room_id?: string | null
          start_time?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          category: string | null
          created_at: string
          deposit_amount: number | null
          id: string
          image_url: string | null
          name: string
          occupancy: number
          property_id: string | null
          rent_amount: number | null
          status: Database["public"]["Enums"]["room_availability_status"]
          subtype: string | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number
          category?: string | null
          created_at?: string
          deposit_amount?: number | null
          id?: string
          image_url?: string | null
          name: string
          occupancy?: number
          property_id?: string | null
          rent_amount?: number | null
          status?: Database["public"]["Enums"]["room_availability_status"]
          subtype?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          category?: string | null
          created_at?: string
          deposit_amount?: number | null
          id?: string
          image_url?: string | null
          name?: string
          occupancy?: number
          property_id?: string | null
          rent_amount?: number | null
          status?: Database["public"]["Enums"]["room_availability_status"]
          subtype?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      maintenance_priority: "low" | "medium" | "high" | "urgent"
      maintenance_status: "pending" | "in_progress" | "completed" | "cancelled"
      payment_status: "paid" | "pending" | "overdue" | "failed"
      property_status: "available" | "occupied" | "available_with_maintenance"
      room_availability_status:
        | "available"
        | "occupied"
        | "maintenance"
        | "decommissioned"
      tenant_status: "active" | "inactive" | "pending"
      user_role: "admin" | "council" | "tenant"
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
      maintenance_priority: ["low", "medium", "high", "urgent"],
      maintenance_status: ["pending", "in_progress", "completed", "cancelled"],
      payment_status: ["paid", "pending", "overdue", "failed"],
      property_status: ["available", "occupied", "available_with_maintenance"],
      room_availability_status: [
        "available",
        "occupied",
        "maintenance",
        "decommissioned",
      ],
      tenant_status: ["active", "inactive", "pending"],
      user_role: ["admin", "council", "tenant"],
    },
  },
} as const
