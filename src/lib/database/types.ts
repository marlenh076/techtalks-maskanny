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
      boosting_plan: {
        Row: {
          boosting_plan_id: string;
          duration_days: number;
          max_images: number;
          name: string;
          price: number;
          top_placement: boolean;
          video_enabled: boolean;
        };
        Insert: {
          boosting_plan_id?: string;
          duration_days: number;
          max_images: number;
          name: string;
          price: number;
          top_placement?: boolean;
          video_enabled?: boolean;
        };
        Update: {
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
          host_id: string;
          user_id: string;
        };
        Insert: {
          host_id?: string;
          user_id: string;
        };
        Update: {
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
          media_id: string;
          property_id: string;
          type: Database["public"]["Enums"]["media_type"];
          url: string;
        };
        Insert: {
          media_id?: string;
          property_id: string;
          type: Database["public"]["Enums"]["media_type"];
          url: string;
        };
        Update: {
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
          boosting_plan_id: string;
          end_date: string | null;
          is_paid: boolean;
          property_boosting_id: string;
          property_id: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["boosting_status"];
        };
        Insert: {
          boosting_plan_id: string;
          end_date?: string | null;
          is_paid?: boolean;
          property_boosting_id?: string;
          property_id: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["boosting_status"];
        };
        Update: {
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
      boosting_status: "pending" | "active" | "expired";
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
      boosting_status: ["active", "expired", "pending"],
      gender: ["boys", "girls", "mixed"],
      kitchen_type: ["private", "shared"],
      media_type: ["image", "video"],
      property_approval_status: ["pending", "approved", "rejected"],
      property_type: ["dorm", "studio", "apartment"],
      user_role: ["user", "admin"],
    },
  },
} as const;
