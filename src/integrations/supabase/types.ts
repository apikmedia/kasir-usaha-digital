export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"]
          created_at: string
          event_data: Json
          event_type: string
          id: string
          revenue_amount: number | null
          user_id: string
        }
        Insert: {
          business_type: Database["public"]["Enums"]["business_type"]
          created_at?: string
          event_data: Json
          event_type: string
          id?: string
          revenue_amount?: number | null
          user_id: string
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"]
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          revenue_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      backup_history: {
        Row: {
          backup_schedule_id: string | null
          backup_size: number | null
          backup_type: string
          backup_url: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          status: string
          user_id: string
        }
        Insert: {
          backup_schedule_id?: string | null
          backup_size?: number | null
          backup_type: string
          backup_url?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          status: string
          user_id: string
        }
        Update: {
          backup_schedule_id?: string | null
          backup_size?: number | null
          backup_type?: string
          backup_url?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backup_history_backup_schedule_id_fkey"
            columns: ["backup_schedule_id"]
            isOneToOne: false
            referencedRelation: "backup_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_schedules: {
        Row: {
          backup_settings: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          last_backup_at: string | null
          next_backup_at: string | null
          schedule_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_settings?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_backup_at?: string | null
          next_backup_at?: string | null
          schedule_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_settings?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_backup_at?: string | null
          next_backup_at?: string | null
          schedule_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          business_type: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          business_type?: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          business_type?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          name: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
          service_id: string | null
          subtotal: number
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_id: string
          price: number
          product_id?: string | null
          quantity: number
          service_id?: string | null
          subtotal: number
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
          service_id?: string | null
          subtotal?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"]
          created_at: string
          customer_id: string | null
          estimated_finish: string | null
          finished_at: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: boolean | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          business_type: Database["public"]["Enums"]["business_type"]
          created_at?: string
          customer_id?: string | null
          estimated_finish?: string | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: boolean | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"]
          created_at?: string
          customer_id?: string | null
          estimated_finish?: string | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: boolean | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          bank: string | null
          bill_key: string | null
          biller_code: string | null
          created_at: string
          finish_redirect_url: string | null
          fraud_status: string | null
          gross_amount: number
          id: string
          metadata: Json | null
          order_id: string
          order_id_midtrans: string
          payment_method: string | null
          payment_type: string
          pdf_url: string | null
          settlement_time: string | null
          transaction_id: string
          transaction_status: string
          updated_at: string
          user_id: string
          va_number: string | null
        }
        Insert: {
          bank?: string | null
          bill_key?: string | null
          biller_code?: string | null
          created_at?: string
          finish_redirect_url?: string | null
          fraud_status?: string | null
          gross_amount: number
          id?: string
          metadata?: Json | null
          order_id: string
          order_id_midtrans: string
          payment_method?: string | null
          payment_type: string
          pdf_url?: string | null
          settlement_time?: string | null
          transaction_id: string
          transaction_status: string
          updated_at?: string
          user_id: string
          va_number?: string | null
        }
        Update: {
          bank?: string | null
          bill_key?: string | null
          biller_code?: string | null
          created_at?: string
          finish_redirect_url?: string | null
          fraud_status?: string | null
          gross_amount?: number
          id?: string
          metadata?: Json | null
          order_id?: string
          order_id_midtrans?: string
          payment_method?: string | null
          payment_type?: string
          pdf_url?: string | null
          settlement_time?: string | null
          transaction_id?: string
          transaction_status?: string
          updated_at?: string
          user_id?: string
          va_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_features_usage: {
        Row: {
          created_at: string
          feature_name: string
          id: string
          last_used_at: string
          usage_count: number | null
          usage_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_name: string
          id?: string
          last_used_at?: string
          usage_count?: number | null
          usage_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feature_name?: string
          id?: string
          last_used_at?: string
          usage_count?: number | null
          usage_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          sku: string | null
          stock: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          sku?: string | null
          stock?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          sku?: string | null
          stock?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_type: string | null
          created_at: string
          full_name: string | null
          id: string
          subscription_plan: string | null
          updated_at: string
        }
        Insert: {
          business_type?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          subscription_plan?: string | null
          updated_at?: string
        }
        Update: {
          business_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          subscription_plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports_cache: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"]
          expires_at: string
          generated_at: string
          id: string
          report_data: Json
          report_period: string
          report_type: string
          user_id: string
        }
        Insert: {
          business_type: Database["public"]["Enums"]["business_type"]
          expires_at: string
          generated_at?: string
          id?: string
          report_data: Json
          report_period: string
          report_type: string
          user_id: string
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"]
          expires_at?: string
          generated_at?: string
          id?: string
          report_data?: Json
          report_period?: string
          report_type?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"]
          created_at: string
          description: string | null
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_type: Database["public"]["Enums"]["business_type"]
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_type?: Database["public"]["Enums"]["business_type"]
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          is_trial: boolean
          subscription_end_date: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan_type"]
          subscription_start_date: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          is_trial?: boolean
          subscription_end_date?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan_type"]
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          is_trial?: boolean
          subscription_end_date?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan_type"]
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string
          date: string
          id: string
          transaction_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          transaction_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          transaction_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_analytics: {
        Row: {
          business_type: Database["public"]["Enums"]["business_type"] | null
          date: string | null
          orders_completed: number | null
          orders_created: number | null
          payments_received: number | null
          total_events: number | null
          total_revenue: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_daily_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_premium_access: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_premium_feature_access: {
        Args: { feature_name: string }
        Returns: boolean
      }
      create_analytics_event: {
        Args: {
          p_business_type: Database["public"]["Enums"]["business_type"]
          p_event_type: string
          p_event_data: Json
          p_revenue_amount?: number
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_title: string
          p_message: string
          p_type?: string
          p_data?: Json
        }
        Returns: string
      }
      generate_detailed_report: {
        Args: {
          p_business_type: Database["public"]["Enums"]["business_type"]
          p_report_type: string
          p_start_date: string
          p_end_date: string
        }
        Returns: Json
      }
      generate_order_number: {
        Args: { business_prefix: string }
        Returns: string
      }
      get_daily_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      increment_daily_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      revert_to_basic: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      start_premium_trial: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      business_type: "laundry" | "warung" | "cuci_motor"
      order_status:
        | "antrian"
        | "siap_ambil"
        | "belum_bayar"
        | "proses"
        | "selesai"
      payment_method: "cash" | "transfer"
      subscription_plan: "basic" | "premium"
      subscription_plan_type: "basic" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      business_type: ["laundry", "warung", "cuci_motor"],
      order_status: [
        "antrian",
        "siap_ambil",
        "belum_bayar",
        "proses",
        "selesai",
      ],
      payment_method: ["cash", "transfer"],
      subscription_plan: ["basic", "premium"],
      subscription_plan_type: ["basic", "premium"],
    },
  },
} as const
