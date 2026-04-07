"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Prediction } from "@/lib/supabase/types";
import { useAuth } from "@/context/AuthContext";

export function usePredictions() {
  const { profile } = useAuth();
  const supabase = createClient();
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [loading, setLoading] = useState(false);

  // Load this user's predictions
  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", profile.id);
      const map: Record<string, Prediction> = {};
      (data as Prediction[] ?? []).forEach((p) => { map[p.match_id] = p; });
      setPredictions(map);
      setLoading(false);
    })();
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const savePrediction = useCallback(
    async (matchId: string, homeScore: number, awayScore: number) => {
      if (!profile) return null;

      const payload = {
        user_id: profile.id,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
      };

      const { data, error } = await supabase
        .from("predictions")
        .upsert(payload, { onConflict: "user_id,match_id" })
        .select()
        .single();

      if (!error && data) {
        setPredictions((prev) => ({ ...prev, [matchId]: data }));
        return data;
      }
      return null;
    },
    [profile, supabase],
  );

  const getPrediction = useCallback(
    (matchId: string) => predictions[matchId] ?? null,
    [predictions],
  );

  return { predictions, loading, savePrediction, getPrediction };
}
