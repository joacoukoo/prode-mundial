"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Match } from "@/lib/types";
import type { LiveFixture } from "@/app/api/live/route";

// Polls /api/live every 60s while there are live matches,
// every 5 minutes otherwise, and stops completely when no matches today.
const POLL_LIVE_MS   = 60_000;   // 1 min when live
const POLL_IDLE_MS   = 300_000;  // 5 min when not live

export function useLiveMatches(baseMatches: Match[]) {
  const [matches, setMatches] = useState<Match[]>(baseMatches);
  const [isLiveNow, setIsLiveNow] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      // Merge live API data into our match list by matching team names
      setMatches((prev) =>
        prev.map((m) => {
          const fixture = fixtures.find(
            (f) =>
              normalize(f.homeTeam) === normalize(m.homeTeam.name) &&
              normalize(f.awayTeam) === normalize(m.awayTeam.name),
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
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
