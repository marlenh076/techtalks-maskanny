export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      property_view: {
        Row: { property_view_id: number; property_id: string; visitor_key: string; viewed_at: string };
        Insert: never; Update: never; Relationships: [];
      };
      boost_payment: {
        Row: { payment_id: string; property_boosting_id: string; submitted_by: string; reference: string | null; amount: number; currency: string; status: "pending" | "verified" | "rejected"; submitted_at: string; reviewed_at: string | null; reviewed_by: string | null; rejection_reason: string | null; receipt_path: string | null };
        Insert: never; Update: never; Relationships: [];
      };
      admin_activity: {
        Row: { activity_id: string; actor_id: string; action: string; entity_type: string; entity_id: string; reason: string | null; details: Json; created_at: string };
        Insert: never; Update: never; Relationships: [];
      };
      admin_profile: {
        Row: { user_id: string; avatar_path: string | null };
        Insert: never; Update: never; Relationships: [];
      };
      boosting_plan: {
        Row: {
          currency: string | null;
          boosting_plan_id: string;
          duration_days: number;
          max_images: number;
          name: string;
          price: number;
          top_placement: boolean;
          video_enabled: boolean;
        };
        Insert: {
          currency?: string | null;
          boosting_plan_id?: string;
          duration_days: number;
          max_images: number;
          name: string;
          price: number;
          top_placement?: boolean;
          video_enabled?: boolean;
        };
        Update: {
          currency?: string | null;
          boosting_plan_id?: string;
          duration_days?: number;
          max_images?: number;
          name?: string;
          price?: number;
          top_placement?: boolean;
          video_enabled?: boolean;
        };
        Relationships: [];
      };
      host: {
        Row: {
          created_at: string | null;
          host_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          host_id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          host_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "host_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "user";
            referencedColumns: ["user_id"];
          },
        ];
      };
      media: {
        Row: {
          sort_order: number;
          media_id: string;
          property_id: string;
          type: Database["public"]["Enums"]["media_type"];
          url: string;
        };
        Insert: {
          sort_order?: number;
          media_id?: string;
          property_id: string;
          type: Database["public"]["Enums"]["media_type"];
          url: string;
        };
        Update: {
          sort_order?: number;
          media_id?: string;
          property_id?: string;
          type?: Database["public"]["Enums"]["media_type"];
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "property";
            referencedColumns: ["property_id"];
          },
        ];
      };
      property: {
        Row: {
          address: string;
          archived_at: string | null;
          approval_status: Database["public"]["Enums"]["property_approval_status"];
          bathroom_type: Database["public"]["Enums"]["bathroom_type"];
          bathrooms: number;
          bed_count: number;
          bedrooms: number;
          created_at: string;
          description: string | null;
          electricity_included: boolean;
          furnished: boolean;
          gender: Database["public"]["Enums"]["gender"];
          host_id: string;
          kitchen_type: Database["public"]["Enums"]["kitchen_type"];
          latitude: number;
          longitude: number;
          price: number;
          property_id: string;
          property_type: Database["public"]["Enums"]["property_type"];
          title: string;
        };
        Insert: {
          address: string;
          archived_at?: string | null;
          approval_status?: Database["public"]["Enums"]["property_approval_status"];
          bathroom_type: Database["public"]["Enums"]["bathroom_type"];
          bathrooms: number;
          bed_count: number;
          bedrooms: number;
          created_at?: string;
          description?: string | null;
          electricity_included: boolean;
          furnished: boolean;
          gender: Database["public"]["Enums"]["gender"];
          host_id: string;
          kitchen_type: Database["public"]["Enums"]["kitchen_type"];
          latitude: number;
          longitude: number;
          price: number;
          property_id?: string;
          property_type: Database["public"]["Enums"]["property_type"];
          title: string;
        };
        Update: {
          address?: string;
          archived_at?: string | null;
          approval_status?: Database["public"]["Enums"]["property_approval_status"];
          bathroom_type?: Database["public"]["Enums"]["bathroom_type"];
          bathrooms?: number;
          bed_count?: number;
          bedrooms?: number;
          created_at?: string;
          description?: string | null;
          electricity_included?: boolean;
          furnished?: boolean;
          gender?: Database["public"]["Enums"]["gender"];
          host_id?: string;
          kitchen_type?: Database["public"]["Enums"]["kitchen_type"];
          latitude?: number;
          longitude?: number;
          price?: number;
          property_id?: string;
          property_type?: Database["public"]["Enums"]["property_type"];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "host";
            referencedColumns: ["host_id"];
          },
        ];
      };
      property_boosting: {
        Row: {
          created_at: string | null;
          review_status: "pending" | "approved" | "rejected";
          amount_due: number | null;
          currency: string | null;
          duration_days: number | null;
          legacy_payment: boolean;
          boosting_plan_id: string;
          end_date: string | null;
          is_paid: boolean;
          property_boosting_id: string;
          property_id: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["boosting_status"];
        };
        Insert: {
          created_at?: string | null;
          review_status?: "pending" | "approved" | "rejected";
          amount_due?: number | null;
          currency?: string | null;
          duration_days?: number | null;
          legacy_payment?: boolean;
          boosting_plan_id: string;
          end_date?: string | null;
          is_paid?: boolean;
          property_boosting_id?: string;
          property_id: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["boosting_status"];
        };
        Update: {
          created_at?: string | null;
          review_status?: "pending" | "approved" | "rejected";
          amount_due?: number | null;
          currency?: string | null;
          duration_days?: number | null;
          legacy_payment?: boolean;
          boosting_plan_id?: string;
          end_date?: string | null;
          is_paid?: boolean;
          property_boosting_id?: string;
          property_id?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["boosting_status"];
        };
        Relationships: [
          {
            foreignKeyName: "fk_property_boosting_plan";
            columns: ["boosting_plan_id"];
            isOneToOne: false;
            referencedRelation: "boosting_plan";
            referencedColumns: ["boosting_plan_id"];
          },
          {
            foreignKeyName: "fk_property_boosting_property";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "property";
            referencedColumns: ["property_id"];
          },
        ];
      };
      property_university: {
        Row: {
          property_id: string;
          university_id: string;
        };
        Insert: {
          property_id: string;
          university_id: string;
        };
        Update: {
          property_id?: string;
          university_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_property_university_property";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "property";
            referencedColumns: ["property_id"];
          },
          {
            foreignKeyName: "fk_property_university_university";
            columns: ["university_id"];
            isOneToOne: false;
            referencedRelation: "university";
            referencedColumns: ["university_id"];
          },
        ];
      };
      university: {
        Row: {
          city: string;
          latitude: number;
          longitude: number;
          name: string;
          university_id: string;
        };
        Insert: {
          city: string;
          latitude: number;
          longitude: number;
          name: string;
          university_id?: string;
        };
        Update: {
          city?: string;
          latitude?: number;
          longitude?: number;
          name?: string;
          university_id?: string;
        };
        Relationships: [];
      };
      user: {
        Row: {
          created_at: string;
          email: string;
          firstname: string;
          lastname: string;
          phone: string;
          role: Database["public"]["Enums"]["user_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          firstname: string;
          lastname: string;
          phone: string;
          role?: Database["public"]["Enums"]["user_role"];
          user_id?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          firstname?: string;
          lastname?: string;
          phone?: string;
          role?: Database["public"]["Enums"]["user_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      archive_host_property: {
        Args: { p_property_id: string };
        Returns: Database["public"]["Tables"]["property"]["Row"];
      };
      public_live_boost_activation_times: {
        Args: Record<string, never>;
        Returns: { property_id: string; activated_at: string }[];
      };
      record_property_view: { Args: { p_property_id: string; p_visitor_key: string }; Returns: boolean };
      host_property_view_daily: { Args: { p_from: string | null; p_to: string }; Returns: { day: string; views: number }[] };
      admin_directory_list: { Args: { p_kind: string; p_filters?: Json }; Returns: Json };
      admin_directory_detail: { Args: { p_id: string; p_kind: string }; Returns: Json };
      admin_boost_queue: { Args: { p_filters?: Json }; Returns: Json };
      admin_boost_detail: { Args: { p_id: string }; Returns: Json };
      admin_list: { Args: { p_kind: string; p_filters?: Json }; Returns: Json };
      admin_account_detail: { Args: { p_id: string; p_host?: boolean }; Returns: Json };
      admin_statistics: { Args: { p_from: string; p_to: string }; Returns: Json };
      admin_edit_property: { Args: { p_property_id: string; p_changes: Json; p_reason: string }; Returns: Database["public"]["Tables"]["property"]["Row"] };
      admin_get_profile: { Args: Record<string, never>; Returns: Json };
      admin_update_profile: { Args: { p_changes: Json }; Returns: Json };
      moderate_property: { Args: { p_property_id: string; p_decision: string; p_reason?: string }; Returns: undefined };
      decide_boost: { Args: { p_boost_id: string; p_decision: string; p_reason?: string }; Returns: Json };
      submit_boost_payment: { Args: { p_boost_id: string; p_reference: string; p_amount: number; p_currency: string }; Returns: Json };
      submit_host_boost_payment: { Args: { p_boost_id: string; p_reference: string | null; p_receipt_path: string | null }; Returns: Json };
      get_host_boost_payment_status: { Args: { p_boost_id: string }; Returns: Json };
      admin_decide_boost_payment: { Args: { p_boost_id: string; p_payment_id: string | null; p_reference: string | null; p_decision: string; p_whish_confirmed: boolean; p_reason: string | null }; Returns: Database["public"]["Tables"]["property_boosting"]["Row"] };
      review_boost_payment: { Args: { p_payment_id: string; p_decision: string; p_reason?: string }; Returns: Json };
      activate_property_boost: { Args: { p_boost_id: string }; Returns: Json };
      approve_property: {
        Args: { p_property_id: string };
        Returns: undefined;
      };
      get_current_property_boost: {
        Args: { p_property_id: string };
        Returns: Database["public"]["Tables"]["property_boosting"]["Row"][];
        SetofOptions: {
          from: "*";
          to: "property_boosting";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      get_moderation_property: {
        Args: { p_property_id: string };
        Returns: Json;
      };
      replace_host_property_universities: { Args: { p_property_id: string; p_university_ids: string[] }; Returns: string[] };
      is_property_effectively_live: {
        Args: { p_property_id: string };
        Returns: boolean;
      };
      list_moderation_properties: {
        Args: {
          p_status: Database["public"]["Enums"]["property_approval_status"];
        };
        Returns: Json;
      };
      reject_property: {
        Args: { p_property_id: string };
        Returns: undefined;
      };
      request_property_boost: {
        Args: { p_boosting_plan_id: string; p_property_id: string };
        Returns: Database["public"]["Tables"]["property_boosting"]["Row"];
        SetofOptions: {
          from: "*";
          to: "property_boosting";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      bathroom_type: "private" | "shared";
      boosting_status: "pending" | "active" | "expired" | "rejected";
      gender: "boys" | "girls" | "mixed";
      kitchen_type: "private" | "shared";
      media_type: "image" | "video";
      property_approval_status: "pending" | "approved" | "rejected";
      property_type: "dorm" | "studio" | "apartment";
      user_role: "user" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bathroom_type: ["private", "shared"],
      boosting_status: ["active", "expired", "pending", "rejected"],
      gender: ["boys", "girls", "mixed"],
      kitchen_type: ["private", "shared"],
      media_type: ["image", "video"],
      property_approval_status: ["pending", "approved", "rejected"],
      property_type: ["dorm", "studio", "apartment"],
      user_role: ["user", "admin"],
    },
  },
} as const;
