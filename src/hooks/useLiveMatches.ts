"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Match } from "@/lib/types";
import type { LiveFixture } from "@/app/api/live/route";
import { API_TEAM_NAMES } from "@/lib/data/apiTeamNames";
import { createClient } from "@/lib/supabase/client";

const POLL_LIVE_MS = 60_000;  // 1 min when live
const POLL_IDLE_MS = 300_000; // 5 min when not live

export function useLiveMatches(baseMatches: Match[]) {
  const [matches, setMatches] = useState<Match[]>(baseMatches);
  const [isLiveNow, setIsLiveNow] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load finished/live results from Supabase on mount
  useEffect(() => {
    const supabase = createClient();

    async function loadDbResults() {
      const { data } = await supabase.from("match_results").select("*");
      if (!data || data.length === 0) return;
      applyResults(data);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function applyResults(rows: any[]) {
      setMatches((prev) =>
        prev.map((m) => {
          const r = rows.find((row) => row.match_id === m.id);
          if (!r) return m;
          return {
            ...m,
            status: r.status,
            homeScore: r.home_score ?? undefined,
            awayScore: r.away_score ?? undefined,
          };
        }),
      );
    }

    loadDbResults();

    // Real-time: update match cards instantly when admin saves a result
    const channel = supabase
      .channel("match-results-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_results" },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          applyResults([payload.new as any]);
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch("/api/live");
      if (!res.ok) return;
      const { fixtures, configured }: { fixtures: LiveFixture[]; configured: boolean } = await res.json();

      setApiConfigured(configured);
      if (!configured || fixtures.length === 0) return;

      const hasLive = fixtures.some((f) => f.status === "live");
      setIsLiveNow(hasLive);
      setLastUpdate(new Date());

      // Merge live API data using English team name mapping
      setMatches((prev) =>
        prev.map((m) => {
          const fixture = fixtures.find(
            (f) =>
              normalize(f.homeTeam) === normalize(API_TEAM_NAMES[m.homeTeam.id] ?? m.homeTeam.name) &&
              normalize(f.awayTeam) === normalize(API_TEAM_NAMES[m.awayTeam.id] ?? m.awayTeam.name),
          );
          if (!fixture) return m;
          return {
            ...m,
            status: fixture.status,
            homeScore: fixture.homeScore ?? undefined,
            awayScore: fixture.awayScore ?? undefined,
          };
        }),
      );
    } catch (err) {
      console.error("[useLiveMatches]", err);
    }
  }, []);

  // Adaptive polling
  useEffect(() => {
    let active = true;

    async function poll() {
      if (!active) return;
      await fetchLive();
      const delay = isLiveNow ? POLL_LIVE_MS : POLL_IDLE_MS;
      timerRef.current = setTimeout(poll, delay);
    }

    poll();
    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchLive, isLiveNow]);

  return { matches, isLiveNow, apiConfigured, lastUpdate };
}

function normalize(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
