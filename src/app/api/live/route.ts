import { NextResponse } from "next/server";
import { MATCHES } from "@/lib/data/matches";
import { API_TEAM_NAMES } from "@/lib/data/apiTeamNames";
import { createAdminClient } from "@/lib/supabase/admin";

// football-data.org — free tier includes the World Cup (10 req/min).
// `next.revalidate` dedupes concurrent polls across users/instances so we
// stay well under that limit regardless of how many people are online.
export const maxDuration = 20;

const FD_API_URL = "https://api.football-data.org/v4/competitions/WC/matches";
const FETCH_ATTEMPTS = 2;
const FETCH_TIMEOUT_MS = 8_000;
const RETRY_DELAY_MS = 300;
const REVALIDATE_SECONDS = 20;

// football-data.org team codes (tla) match our internal team ids 1:1 in
// uppercase, except Curaçao (CUW, not "CUR").
const TLA_OVERRIDES: Record<string, string> = { cur: "CUW" };
function tlaFor(teamId: string) {
  return TLA_OVERRIDES[teamId] ?? teamId.toUpperCase();
}

interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { tla: string; name: string };
  awayTeam: { tla: string; name: string };
  score: { fullTime: { home: number | null; away: number | null } };
}

export interface LiveFixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "upcoming" | "live" | "finished";
  minute: number | null;
  date: string;
}

export async function GET() {
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    return NextResponse.json({ fixtures: [], configured: false, error: "FOOTBALL_DATA_API_KEY no configurada" });
  }

  try {
    const apiMatches = await fetchMatchesWithRetry();

    if (!apiMatches) {
      console.warn("[/api/live] upstream unavailable after retries, falling back to last known results");
      const fixtures = await loadFixturesFromSupabase();
      return NextResponse.json({ fixtures, configured: true, stale: true });
    }

    const fixtures = buildFixtures(apiMatches);

    const liveCount = fixtures.filter((f) => f.status === "live").length;
    const finishedCount = fixtures.filter((f) => f.status === "finished").length;
    console.log(`[/api/live] ${fixtures.length} fixtures — ${liveCount} live, ${finishedCount} finished`);

    await persistToSupabase(fixtures);

    return NextResponse.json({ fixtures, configured: true });
  } catch (err) {
    console.error("[/api/live]", err);
    return NextResponse.json({ fixtures: [], configured: true, error: String(err) }, { status: 500 });
  }
}

// football-data.org is a professional service, but retry anyway in case of
// a transient blip — same pattern as the Supabase fallback below.
async function fetchMatchesWithRetry(): Promise<FDMatch[] | null> {
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const res = await fetch(FD_API_URL, {
          headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! },
          signal: controller.signal,
          next: { revalidate: REVALIDATE_SECONDS },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return json.matches ?? [];
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      console.warn(`[/api/live] attempt ${attempt}/${FETCH_ATTEMPTS} failed: ${String(err)}`);
      if (attempt < FETCH_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }
  return null;
}

// Match by team code (tla), not by display name — football-data.org's
// names ("Czechia", "Bosnia-Herzegovina", "Cape Verde Islands"...) don't
// line up with ours, but the FIFA-style codes do (except Curaçao).
// A few fixtures come back with home/away swapped relative to our fixture
// list (neutral-venue tournament, so "home" is just a data-entry choice) —
// match either orientation and swap the score back if needed.
function buildFixtures(apiMatches: FDMatch[]): LiveFixture[] {
  const fixtures: LiveFixture[] = [];

  for (const match of MATCHES) {
    const homeTla = tlaFor(match.homeTeam.id);
    const awayTla = tlaFor(match.awayTeam.id);

    const direct = apiMatches.find((m) => m.homeTeam.tla === homeTla && m.awayTeam.tla === awayTla);
    const reversed = direct
      ? null
      : apiMatches.find((m) => m.homeTeam.tla === awayTla && m.awayTeam.tla === homeTla);
    const apiMatch = direct ?? reversed;
    if (!apiMatch) continue;

    fixtures.push({
      id: apiMatch.id,
      homeTeam: API_TEAM_NAMES[match.homeTeam.id] ?? match.homeTeam.name,
      awayTeam: API_TEAM_NAMES[match.awayTeam.id] ?? match.awayTeam.name,
      homeScore: reversed ? apiMatch.score.fullTime.away : apiMatch.score.fullTime.home,
      awayScore: reversed ? apiMatch.score.fullTime.home : apiMatch.score.fullTime.away,
      status: mapStatus(apiMatch.status),
      minute: estimateMinute(apiMatch),
      date: apiMatch.utcDate,
    });
  }

  return fixtures;
}

function mapStatus(status: string): LiveFixture["status"] {
  if (status === "FINISHED" || status === "AWARDED") return "finished";
  if (status === "IN_PLAY" || status === "PAUSED") return "live";
  return "upcoming";
}

// football-data.org doesn't expose a minute counter, so this is a rough
// estimate from kickoff time — good enough since the UI doesn't show it yet.
function estimateMinute(match: FDMatch): number | null {
  if (mapStatus(match.status) !== "live") return null;
  const elapsedMin = Math.floor((Date.now() - new Date(match.utcDate).getTime()) / 60_000);
  return Math.max(0, Math.min(elapsedMin, 120));
}

// Fallback when the upstream API is down: serve whatever we last persisted
// so the frontend doesn't go blank, instead reflecting the last known state.
async function loadFixturesFromSupabase(): Promise<LiveFixture[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  const admin = createAdminClient();
  const { data } = await admin.from("match_results").select("*");
  if (!data) return [];

  const fixtures: LiveFixture[] = [];
  for (const row of data) {
    const match = MATCHES.find((m) => m.id === row.match_id);
    if (!match) continue;

    fixtures.push({
      id:        parseInt(match.id.replace("m", ""), 10),
      homeTeam:  API_TEAM_NAMES[match.homeTeam.id] ?? match.homeTeam.name,
      awayTeam:  API_TEAM_NAMES[match.awayTeam.id] ?? match.awayTeam.name,
      homeScore: row.home_score,
      awayScore: row.away_score,
      status:    row.status,
      minute:    row.minute,
      date:      match.date,
    });
  }
  return fixtures;
}

async function persistToSupabase(fixtures: LiveFixture[]) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const admin = createAdminClient();

  const { data: existingResults } = await admin
    .from("match_results")
    .select("match_id, status");

  const alreadyFinished = new Set(
    (existingResults ?? [])
      .filter((r) => r.status === "finished")
      .map((r) => r.match_id),
  );

  for (const fixture of fixtures) {
    if (fixture.status === "upcoming") continue;

    const match = MATCHES.find(
      (m) =>
        normalize(fixture.homeTeam) === normalize(API_TEAM_NAMES[m.homeTeam.id] ?? m.homeTeam.name) &&
        normalize(fixture.awayTeam) === normalize(API_TEAM_NAMES[m.awayTeam.id] ?? m.awayTeam.name),
    );

    if (!match) {
      console.warn(`[/api/live] No match found for: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
      continue;
    }

    if (alreadyFinished.has(match.id)) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from("match_results") as any).upsert(
      {
        match_id:   match.id,
        home_score: fixture.homeScore ?? 0,
        away_score: fixture.awayScore ?? 0,
        status:     fixture.status,
        minute:     fixture.minute,
      },
      { onConflict: "match_id" },
    );
  }
}

function normalize(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
