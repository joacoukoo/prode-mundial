import { NextResponse } from "next/server";
import { MATCHES } from "@/lib/data/matches";
import { API_TEAM_NAMES } from "@/lib/data/apiTeamNames";
import { createAdminClient } from "@/lib/supabase/admin";

// FIFA World Cup 2026 fixture ID on API-Football
// League ID 1 = FIFA World Cup, Season 2026
const LEAGUE_ID = 1;
const SEASON = 2026;
const API_KEY = process.env.API_FOOTBALL_KEY ?? "";

// Simple in-memory cache — avoids hammering the API on every request
let cache: { data: LiveFixture[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute

export interface LiveFixture {
  id: number;          // API-Football fixture ID
  homeTeam: string;    // team name
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "upcoming" | "live" | "finished";
  minute: number | null; // match minute if live
  date: string;          // ISO date string
}

export async function GET() {
  // No API key configured yet — return empty array gracefully
  if (!API_KEY) {
    return NextResponse.json(
      { fixtures: [], configured: false, message: "API_FOOTBALL_KEY not set in .env.local" },
      { status: 200 },
    );
  }

  // Return cached data if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ fixtures: cache.data, configured: true, cached: true });
  }

  try {
    // Fetch today's fixtures for the World Cup
    const today = new Date().toISOString().split("T")[0];
    const url = `https://v3.football.api-sports.io/fixtures?league=${LEAGUE_ID}&season=${SEASON}&date=${today}`;

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`API-Football error: ${res.status}`);

    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fixtures: LiveFixture[] = (json.response ?? []).map((f: any) => ({
      id: f.fixture.id,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      status: mapStatus(f.fixture.status.short),
      minute: f.fixture.status.elapsed ?? null,
      date: f.fixture.date,
    }));

    cache = { data: fixtures, fetchedAt: Date.now() };

    // Persist live/finished results to Supabase so points trigger fires automatically
    await persistToSupabase(fixtures);

    return NextResponse.json({ fixtures, configured: true, cached: false });
  } catch (err) {
    console.error("[/api/live]", err);
    return NextResponse.json({ fixtures: [], configured: true, error: String(err) }, { status: 500 });
  }
}

async function persistToSupabase(fixtures: LiveFixture[]) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const admin = createAdminClient();

  // Load existing results — never overwrite a match already finished in Supabase
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

    // Match fixture to our internal match using English API names
    const match = MATCHES.find(
      (m) =>
        normalize(fixture.homeTeam) === normalize(API_TEAM_NAMES[m.homeTeam.id] ?? m.homeTeam.name) &&
        normalize(fixture.awayTeam) === normalize(API_TEAM_NAMES[m.awayTeam.id] ?? m.awayTeam.name),
    );
    if (!match) continue;

    // Protect results already loaded manually by admin
    if (alreadyFinished.has(match.id)) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from("match_results") as any).upsert(
      {
        match_id: match.id,
        home_score: fixture.homeScore ?? 0,
        away_score: fixture.awayScore ?? 0,
        status: fixture.status,
        minute: fixture.minute,
      },
      { onConflict: "match_id" },
    );
  }
}

function mapStatus(short: string): LiveFixture["status"] {
  if (["TBD", "NS"].includes(short)) return "upcoming";
  if (["FT", "AET", "PEN", "AWD", "WO"].includes(short)) return "finished";
  return "live"; // 1H, HT, 2H, ET, BT, P, INT, SUSP, etc.
}

function normalize(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}
