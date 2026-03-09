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
      actions: {
        Row: {
          assigned_to: string
          created_at: string
          due_date: string
          estimated_impact_of_delay: string
          id: string
          name: string
          notes: string
          priority: string
          related_id: string
          related_type: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          assigned_to?: string
          created_at?: string
          due_date?: string
          estimated_impact_of_delay?: string
          id?: string
          name: string
          notes?: string
          priority?: string
          related_id?: string
          related_type?: string
          start_date?: string
          status?: string
          user_id: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          due_date?: string
          estimated_impact_of_delay?: string
          id?: string
          name?: string
          notes?: string
          priority?: string
          related_id?: string
          related_type?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_logs: {
        Row: {
          ai_response: string
          context_module: string | null
          created_at: string | null
          id: string
          user_id: string
          user_message: string
          user_role: string | null
        }
        Insert: {
          ai_response: string
          context_module?: string | null
          created_at?: string | null
          id?: string
          user_id: string
          user_message: string
          user_role?: string | null
        }
        Update: {
          ai_response?: string
          context_module?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
          user_message?: string
          user_role?: string | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          created_at: string
          criticality: string
          department: string
          id: string
          last_audit_date: string | null
          location: string
          name: string
          owner: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          criticality?: string
          department?: string
          id?: string
          last_audit_date?: string | null
          location?: string
          name: string
          owner?: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          criticality?: string
          department?: string
          id?: string
          last_audit_date?: string | null
          location?: string
          name?: string
          owner?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      audits: {
        Row: {
          auditor: string
          created_at: string
          end_date: string
          findings: string
          id: string
          linked_incidents: string[]
          linked_risks: string[]
          name: string
          scope: string
          start_date: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          auditor?: string
          created_at?: string
          end_date?: string
          findings?: string
          id?: string
          linked_incidents?: string[]
          linked_risks?: string[]
          name: string
          scope?: string
          start_date?: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          auditor?: string
          created_at?: string
          end_date?: string
          findings?: string
          id?: string
          linked_incidents?: string[]
          linked_risks?: string[]
          name?: string
          scope?: string
          start_date?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      compliance: {
        Row: {
          consequences: string
          created_at: string
          department: string
          enforcement: string
          id: string
          last_reviewed: string
          name: string
          owner: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          consequences?: string
          created_at?: string
          department?: string
          enforcement?: string
          id?: string
          last_reviewed?: string
          name: string
          owner?: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          consequences?: string
          created_at?: string
          department?: string
          enforcement?: string
          id?: string
          last_reviewed?: string
          name?: string
          owner?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          asset_id: string | null
          assigned_to: string
          created_at: string
          deadline: string
          department: string
          description: string
          id: string
          name: string
          regulatory_impact: string
          reported_by: string
          risk_id: string | null
          severity: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          assigned_to?: string
          created_at?: string
          deadline?: string
          department?: string
          description?: string
          id?: string
          name: string
          regulatory_impact?: string
          reported_by?: string
          risk_id?: string | null
          severity?: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          asset_id?: string | null
          assigned_to?: string
          created_at?: string
          deadline?: string
          department?: string
          description?: string
          id?: string
          name?: string
          regulatory_impact?: string
          reported_by?: string
          risk_id?: string | null
          severity?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risks"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          compliance_reviews: boolean
          created_at: string
          critical_incidents: boolean
          due_soon_days: number
          email_enabled: boolean
          high_risks: boolean
          id: string
          overdue_actions: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          compliance_reviews?: boolean
          created_at?: string
          critical_incidents?: boolean
          due_soon_days?: number
          email_enabled?: boolean
          high_risks?: boolean
          id?: string
          overdue_actions?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          compliance_reviews?: boolean
          created_at?: string
          critical_incidents?: boolean
          due_soon_days?: number
          email_enabled?: boolean
          high_risks?: boolean
          id?: string
          overdue_actions?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      performance: {
        Row: {
          actual: number
          created_at: string
          department: string
          id: string
          linked_risk_ids: string[]
          name: string
          responsible: string
          status: string
          target: number
          unit: string
          user_id: string
        }
        Insert: {
          actual?: number
          created_at?: string
          department?: string
          id?: string
          linked_risk_ids?: string[]
          name: string
          responsible?: string
          status?: string
          target?: number
          unit?: string
          user_id: string
        }
        Update: {
          actual?: number
          created_at?: string
          department?: string
          id?: string
          linked_risk_ids?: string[]
          name?: string
          responsible?: string
          status?: string
          target?: number
          unit?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string
          full_name: string
          id: string
          job_title: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          full_name?: string
          id: string
          job_title?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          full_name?: string
          id?: string
          job_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      risks: {
        Row: {
          asset_id: string | null
          created_at: string
          id: string
          impact: number
          mitigation_strategy: string
          name: string
          owner: string
          probability: number
          regulatory_ref: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          id?: string
          impact?: number
          mitigation_strategy?: string
          name: string
          owner?: string
          probability?: number
          regulatory_ref?: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          id?: string
          impact?: number
          mitigation_strategy?: string
          name?: string
          owner?: string
          probability?: number
          regulatory_ref?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role:
        | "admin"
        | "risk_manager"
        | "audit_manager"
        | "compliance_officer"
        | "user"
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
      app_role: [
        "admin",
        "risk_manager",
        "audit_manager",
        "compliance_officer",
        "user",
      ],
    },
  },
} as const
