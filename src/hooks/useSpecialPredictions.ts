"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SpecialPrediction } from "@/lib/supabase/types";

// Primer partido: México vs Sudáfrica — 11/06/2026 19:00 UTC
const DEADLINE = new Date("2026-06-11T19:00:00Z");

export function useSpecialPredictions() {
  const supabase = createClient();
  const [all, setAll] = useState<SpecialPrediction[]>([]);
  const [mine, setMine] = useState<SpecialPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isOpen = new Date() < DEADLINE;

  useEffect(() => {
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll() {
    const { data } = await supabase
      .from("special_predictions")
      .select("id, user_id, champion, top_scorer, best_player, best_goalkeeper, created_at, profiles(display_name, avatar_color, avatar_url, username)")
      .order("created_at", { ascending: true });

    const rows = (data as unknown as SpecialPrediction[]) ?? [];
    setAll(rows);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) setMine(rows.find((r) => r.user_id === user.id) ?? null);
    setLoading(false);
  }

  async function save(champion: string, top_scorer: string, best_player: string, best_goalkeeper: string) {
    if (!isOpen) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("special_predictions").upsert({
        user_id: user.id,
        champion,
        top_scorer,
        best_player,
        best_goalkeeper,
      }, { onConflict: "user_id" });
      await fetchAll();
    }
    setSaving(false);
  }

  return { all, mine, loading, saving, isOpen, save };
}
