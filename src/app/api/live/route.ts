import { NextResponse } from "next/server";
import { MATCHES } from "@/lib/data/matches";
import { API_TEAM_NAMES } from "@/lib/data/apiTeamNames";
import { createAdminClient } from "@/lib/supabase/admin";

// API-Football / API-Sports World Cup 2026
// League 1 = FIFA World Cup, works on both api-football.com and RapidAPI
const LEAGUE_ID = 1;
const SEASON    = 2026;
const API_KEY   = process.env.API_FOOTBALL_KEY ?? "";

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
  if (!API_KEY) {
    return NextResponse.json(
      { fixtures: [], configured: false, message: "API_FOOTBALL_KEY not set" },
      { status: 200 },
    );
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const url   = `https://v3.football.api-sports.io/fixtures?league=${LEAGUE_ID}&season=${SEASON}&date=${today}`;

    const res = await fetch(url, {
      headers: {
        // Support both api-football.com direct keys and RapidAPI keys
        "x-apisports-key": API_KEY,
        "x-rapidapi-key":  API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { fixtures: [], configured: true, error: `HTTP ${res.status}` },
        { status: 500 },
      );
    }

    const json = await res.json();

    // API-Football returns errors in the response body even on HTTP 200
    if (json.errors && Object.keys(json.errors).length > 0) {
      console.error("[/api/live] API error:", json.errors);
      return NextResponse.json(
        { fixtures: [], configured: true, error: JSON.stringify(json.errors) },
        { status: 500 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fixtures: LiveFixture[] = (json.response ?? []).map((f: any) => ({
      id:        f.fixture.id,
      homeTeam:  f.teams.home.name,
      awayTeam:  f.teams.away.name,
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      status:    mapStatus(f.fixture.status.short),
      minute:    f.fixture.status.elapsed ?? null,
      date:      f.fixture.date,
    }));

    console.log(`[/api/live] ${fixtures.length} fixtures for ${today}:`, fixtures.map(f => `${f.homeTeam} vs ${f.awayTeam} (${f.status})`));

    await persistToSupabase(fixtures);

    return NextResponse.json({ fixtures, configured: true });
  } catch (err) {
    console.error("[/api/live]", err);
    return NextResponse.json({ fixtures: [], configured: true, error: String(err) }, { status: 500 });
  }
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

function mapStatus(short: string): LiveFixture["status"] {
  if (["TBD", "NS"].includes(short)) return "upcoming";
  if (["FT", "AET", "PEN", "AWD", "WO"].includes(short)) return "finished";
  return "live";
}

function normalize(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
