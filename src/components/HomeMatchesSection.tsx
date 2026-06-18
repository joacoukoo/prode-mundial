"use client";

import { useLiveMatches } from "@/hooks/useLiveMatches";
import { MATCHES } from "@/lib/data/matches";
import { LiveMatchBar } from "./LiveMatchBar";
import { LeaderboardTable } from "./LeaderboardTable";

export function HomeMatchesSection() {
  const { matches } = useLiveMatches(MATCHES);

  return (
    <div className="w-full">
      <LiveMatchBar matches={matches} />
      <LeaderboardTable matches={matches} />
    </div>
  );
}
