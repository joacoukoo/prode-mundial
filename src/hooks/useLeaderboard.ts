"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculatePoints } from "@/lib/scoring";
import type { Profile } from "@/lib/supabase/types";
import type { Match } from "@/lib/types";

export function useLeaderboard(liveMatches: Match[] = []) {
  const supabase = createClient();
  const [players, setPlayers] = useState<Profile[]>([]);
  const [liveBonuses, setLiveBonuses] = useState<Record<string, number>>({});
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

  // Recalcular puntos proyectados cada vez que cambian los marcadores en vivo
  useEffect(() => {
    const scored = liveMatches.filter(
      (m) => m.status === "live" && m.homeScore != null && m.awayScore != null
    );

    if (scored.length === 0) {
      setLiveBonuses({});
      return;
    }

    async function calcBonuses() {
      const matchIds = scored.map((m) => m.id);
      const { data } = await supabase
        .from("predictions")
        .select("user_id, match_id, home_score, away_score")
        .in("match_id", matchIds);

      if (!data) return;

      const bonuses: Record<string, number> = {};
      for (const pred of data) {
        const match = scored.find((m) => m.id === pred.match_id);
        if (!match || match.homeScore == null || match.awayScore == null) continue;
        const { points } = calculatePoints(
          pred.home_score, pred.away_score,
          match.homeScore, match.awayScore
        );
        bonuses[pred.user_id] = (bonuses[pred.user_id] ?? 0) + points;
      }
      setLiveBonuses(bonuses);
    }

    calcBonuses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMatches]);

  const hasLive = liveMatches.some((m) => m.status === "live");

  // Reordenar en tiempo real sumando puntos proyectados
  const playersWithLive = useMemo(() =>
    [...players]
      .map((p) => ({ ...p, livePoints: liveBonuses[p.id] ?? 0 }))
      .sort((a, b) => {
        const aTotal = a.total_points + a.livePoints;
        const bTotal = b.total_points + b.livePoints;
        if (bTotal !== aTotal) return bTotal - aTotal;
        if (b.correct_results !== a.correct_results) return b.correct_results - a.correct_results;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }),
    [players, liveBonuses]
  );

  return { players: playersWithLive, loading, hasLive };
}
