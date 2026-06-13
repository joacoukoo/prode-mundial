"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export function useLeaderboard() {
  const supabase = createClient();
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("total_points", { ascending: false })
      .order("correct_results", { ascending: false })
      .order("created_at", { ascending: true });
    setPlayers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchLeaderboard();

    // Listen to match_results (known to work) and refetch after trigger runs
    const channel = supabase
      .channel("leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_results" },
        () => { setTimeout(() => fetchLeaderboard(), 1500); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { players, loading };
}
