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
      design_photos: {
        Row: {
          created_at: string
          floral_item_design_id: string
          id: string
          photo_url: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          floral_item_design_id: string
          id?: string
          photo_url: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          floral_item_design_id?: string
          id?: string
          photo_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "design_photos_floral_item_design_id_fkey"
            columns: ["floral_item_design_id"]
            isOneToOne: false
            referencedRelation: "floral_item_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      design_revisions: {
        Row: {
          admin_note: string | null
          created_at: string
          floral_item_design_id: string
          id: string
          note: string | null
          photo_url: string
          status: Database["public"]["Enums"]["design_status"]
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          floral_item_design_id: string
          id?: string
          note?: string | null
          photo_url: string
          status?: Database["public"]["Enums"]["design_status"]
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          floral_item_design_id?: string
          id?: string
          note?: string | null
          photo_url?: string
          status?: Database["public"]["Enums"]["design_status"]
        }
        Relationships: [
          {
            foreignKeyName: "design_revisions_floral_item_design_id_fkey"
            columns: ["floral_item_design_id"]
            isOneToOne: false
            referencedRelation: "floral_item_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      floral_item_designs: {
        Row: {
          admin_note: string | null
          created_at: string
          design_status: Database["public"]["Enums"]["design_status"]
          floral_item_id: string
          freelancer_note: string | null
          id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          design_status?: Database["public"]["Enums"]["design_status"]
          floral_item_id: string
          freelancer_note?: string | null
          id?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          design_status?: Database["public"]["Enums"]["design_status"]
          floral_item_id?: string
          freelancer_note?: string | null
          id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "floral_item_designs_floral_item_id_fkey"
            columns: ["floral_item_id"]
            isOneToOne: false
            referencedRelation: "floral_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floral_item_designs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      floral_items: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          quantity: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          quantity?: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          quantity?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "floral_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      flower_inventory: {
        Row: {
          color: string
          created_at: string
          extras: number
          flower: string
          id: string
          photo_url: string | null
          project_id: string
          quality_notes: string | null
          sort_order: number
          status: Database["public"]["Enums"]["inventory_item_status"] | null
          stems_in_recipe: number
          total_ordered: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          extras?: number
          flower: string
          id?: string
          photo_url?: string | null
          project_id: string
          quality_notes?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["inventory_item_status"] | null
          stems_in_recipe?: number
          total_ordered?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          extras?: number
          flower?: string
          id?: string
          photo_url?: string | null
          project_id?: string
          quality_notes?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["inventory_item_status"] | null
          stems_in_recipe?: number
          total_ordered?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flower_inventory_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_responses: {
        Row: {
          created_at: string
          id: string
          note: string | null
          project_id: string
          status: Database["public"]["Enums"]["freelancer_response_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["freelancer_response_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["freelancer_response_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hard_good_inventory: {
        Row: {
          created_at: string
          id: string
          item: string
          notes: string | null
          photo_url: string | null
          project_id: string
          quantity: number
          sort_order: number
          status: Database["public"]["Enums"]["inventory_item_status"] | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item: string
          notes?: string | null
          photo_url?: string | null
          project_id: string
          quantity?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["inventory_item_status"] | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item?: string
          notes?: string | null
          photo_url?: string | null
          project_id?: string
          quantity?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["inventory_item_status"] | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hard_good_inventory_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_photos: {
        Row: {
          created_at: string
          id: string
          photo_url: string
          project_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          photo_url: string
          project_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          photo_url?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          context_preview: string | null
          created_at: string
          id: string
          message: string
          project_id: string | null
          project_name: string | null
          read: boolean
          target_item_id: string | null
          target_tab:
            | Database["public"]["Enums"]["notification_target_tab"]
            | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          context_preview?: string | null
          created_at?: string
          id?: string
          message: string
          project_id?: string | null
          project_name?: string | null
          read?: boolean
          target_item_id?: string | null
          target_tab?:
            | Database["public"]["Enums"]["notification_target_tab"]
            | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          context_preview?: string | null
          created_at?: string
          id?: string
          message?: string
          project_id?: string | null
          project_name?: string | null
          read?: boolean
          target_item_id?: string | null
          target_tab?:
            | Database["public"]["Enums"]["notification_target_tab"]
            | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          instagram: string | null
          last_name: string
          phone: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          instagram?: string | null
          last_name?: string
          phone?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          instagram?: string | null
          last_name?: string
          phone?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      project_assignments: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string
          date_end: string
          date_start: string
          day_of_contact: string
          description: string
          design_guide: string
          designers_needed: number
          event_name: string
          field_visibility: Json
          flowers_confirmed: boolean
          hard_goods_confirmed: boolean
          id: string
          inventory_confirmed: boolean
          location: string
          pay: number
          quality_note: string | null
          quality_status: Database["public"]["Enums"]["quality_status"] | null
          service_level: Database["public"]["Enums"]["service_level"][]
          status: Database["public"]["Enums"]["project_status"]
          timeline: string
          total_hours: number
          transport_method: Database["public"]["Enums"]["transport_method"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          date_end: string
          date_start: string
          day_of_contact?: string
          description?: string
          design_guide?: string
          designers_needed?: number
          event_name: string
          field_visibility?: Json
          flowers_confirmed?: boolean
          hard_goods_confirmed?: boolean
          id?: string
          inventory_confirmed?: boolean
          location?: string
          pay?: number
          quality_note?: string | null
          quality_status?: Database["public"]["Enums"]["quality_status"] | null
          service_level?: Database["public"]["Enums"]["service_level"][]
          status?: Database["public"]["Enums"]["project_status"]
          timeline?: string
          total_hours?: number
          transport_method?: Database["public"]["Enums"]["transport_method"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date_end?: string
          date_start?: string
          day_of_contact?: string
          description?: string
          design_guide?: string
          designers_needed?: number
          event_name?: string
          field_visibility?: Json
          flowers_confirmed?: boolean
          hard_goods_confirmed?: boolean
          id?: string
          inventory_confirmed?: boolean
          location?: string
          pay?: number
          quality_note?: string | null
          quality_status?: Database["public"]["Enums"]["quality_status"] | null
          service_level?: Database["public"]["Enums"]["service_level"][]
          status?: Database["public"]["Enums"]["project_status"]
          timeline?: string
          total_hours?: number
          transport_method?: Database["public"]["Enums"]["transport_method"]
          updated_at?: string
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
      app_role: "admin" | "freelancer"
      design_status: "in_review" | "needs_revision" | "approved"
      freelancer_response_status: "available" | "unavailable"
      inventory_item_status: "approved" | "flagged"
      notification_target_tab:
        | "overview"
        | "designs"
        | "inventory"
        | "assignment"
      notification_type:
        | "project"
        | "approval"
        | "inventory"
        | "design"
        | "comment"
      project_status: "unassigned" | "assigned" | "completed"
      quality_status: "good" | "issue"
      service_level: "design" | "delivery" | "setup" | "flip" | "strike"
      transport_method: "personal_vehicle" | "uhaul_rental"
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
      app_role: ["admin", "freelancer"],
      design_status: ["in_review", "needs_revision", "approved"],
      freelancer_response_status: ["available", "unavailable"],
      inventory_item_status: ["approved", "flagged"],
      notification_target_tab: [
        "overview",
        "designs",
        "inventory",
        "assignment",
      ],
      notification_type: [
        "project",
        "approval",
        "inventory",
        "design",
        "comment",
      ],
      project_status: ["unassigned", "assigned", "completed"],
      quality_status: ["good", "issue"],
      service_level: ["design", "delivery", "setup", "flip", "strike"],
      transport_method: ["personal_vehicle", "uhaul_rental"],
    },
  },
} as const
