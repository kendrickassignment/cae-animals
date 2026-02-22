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
      analysis_results: {
        Row: {
          analyzed_at: string | null
          binding_language_count: number | null
          company_name: string | null
          cost_estimate_usd: number | null
          created_at: string
          findings: Json | null
          global_claim: string | null
          hedging_language_count: number | null
          id: string
          indonesia_mentioned: boolean | null
          indonesia_status: string | null
          input_tokens: number | null
          llm_model: string | null
          llm_provider: string | null
          output_tokens: number | null
          overall_risk_level: string | null
          overall_risk_score: number | null
          report_id: string
          report_year: number | null
          sea_countries_excluded: Json | null
          sea_countries_mentioned: Json | null
          summary: string | null
          user_id: string | null
        }
        Insert: {
          analyzed_at?: string | null
          binding_language_count?: number | null
          company_name?: string | null
          cost_estimate_usd?: number | null
          created_at?: string
          findings?: Json | null
          global_claim?: string | null
          hedging_language_count?: number | null
          id?: string
          indonesia_mentioned?: boolean | null
          indonesia_status?: string | null
          input_tokens?: number | null
          llm_model?: string | null
          llm_provider?: string | null
          output_tokens?: number | null
          overall_risk_level?: string | null
          overall_risk_score?: number | null
          report_id: string
          report_year?: number | null
          sea_countries_excluded?: Json | null
          sea_countries_mentioned?: Json | null
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          analyzed_at?: string | null
          binding_language_count?: number | null
          company_name?: string | null
          cost_estimate_usd?: number | null
          created_at?: string
          findings?: Json | null
          global_claim?: string | null
          hedging_language_count?: number | null
          id?: string
          indonesia_mentioned?: boolean | null
          indonesia_status?: string | null
          input_tokens?: number | null
          llm_model?: string | null
          llm_provider?: string | null
          output_tokens?: number | null
          overall_risk_level?: string | null
          overall_risk_score?: number | null
          report_id?: string
          report_year?: number | null
          sea_countries_excluded?: Json | null
          sea_countries_mentioned?: Json | null
          summary?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          first_audited_at: string | null
          headquarters_country: string | null
          id: string
          industry: string
          last_audited_at: string | null
          latest_risk_level: string | null
          latest_risk_score: number | null
          name: string
          total_reports_analyzed: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          first_audited_at?: string | null
          headquarters_country?: string | null
          id?: string
          industry?: string
          last_audited_at?: string | null
          latest_risk_level?: string | null
          latest_risk_score?: number | null
          name: string
          total_reports_analyzed?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          first_audited_at?: string | null
          headquarters_country?: string | null
          id?: string
          industry?: string
          last_audited_at?: string | null
          latest_risk_level?: string | null
          latest_risk_score?: number | null
          name?: string
          total_reports_analyzed?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_rate_limits: {
        Row: {
          id: string
          ip_address: string
          submitted_at: string
        }
        Insert: {
          id?: string
          ip_address: string
          submitted_at?: string
        }
        Update: {
          id?: string
          ip_address?: string
          submitted_at?: string
        }
        Relationships: []
      }
      findings: {
        Row: {
          analysis_id: string
          country_affected: string | null
          created_at: string
          description: string | null
          exact_quote: string | null
          finding_type: string
          id: string
          page_number: number | null
          paragraph: string | null
          report_id: string
          section: string | null
          severity: string
          title: string
        }
        Insert: {
          analysis_id: string
          country_affected?: string | null
          created_at?: string
          description?: string | null
          exact_quote?: string | null
          finding_type: string
          id?: string
          page_number?: number | null
          paragraph?: string | null
          report_id: string
          section?: string | null
          severity: string
          title: string
        }
        Update: {
          analysis_id?: string
          country_affected?: string | null
          created_at?: string
          description?: string | null
          exact_quote?: string | null
          finding_type?: string
          id?: string
          page_number?: number | null
          paragraph?: string | null
          report_id?: string
          section?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "findings_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analysis_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          organization: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          organization?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          organization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          analysis_id: string | null
          company_name: string | null
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string | null
          id: string
          page_count: number | null
          processing_completed_at: string | null
          processing_started_at: string | null
          report_type: string | null
          report_year: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          company_name?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          page_count?: number | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          report_type?: string | null
          report_year?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          company_name?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          page_count?: number | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          report_type?: string | null
          report_year?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "researcher"
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
      app_role: ["admin", "researcher"],
    },
  },
} as const
