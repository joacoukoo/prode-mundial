export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_color: string;
          avatar_url: string | null;
          country: string | null;
          total_points: number;
          correct_results: number;
          correct_winners: number;
          matches_played: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: never[];
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          home_score: number;
          away_score: number;
          points: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["predictions"]["Row"], "id" | "created_at" | "updated_at" | "points"> & { points?: number | null };
        Update: Partial<Database["public"]["Tables"]["predictions"]["Insert"]>;
        Relationships: never[];
      };
      messages: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: { user_id: string; content: string };
        Update: never;
        Relationships: never[];
      };
      match_results: {
        Row: {
          match_id: string;
          home_score: number | null;
          away_score: number | null;
          status: "upcoming" | "live" | "finished";
          minute: number | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["match_results"]["Row"], "updated_at">;
        Update: Partial<Database["public"]["Tables"]["match_results"]["Insert"]>;
        Relationships: never[];
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Prediction = Database["public"]["Tables"]["predictions"]["Row"];
export type MatchResult = Database["public"]["Tables"]["match_results"]["Row"];

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Pick<Profile, "display_name" | "avatar_color" | "avatar_url">;
}
