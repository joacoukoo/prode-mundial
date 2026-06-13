import { NextResponse } from "next/server";
import { MATCHES } from "@/lib/data/matches";
import { API_TEAM_NAMES } from "@/lib/data/apiTeamNames";
import { createAdminClient } from "@/lib/supabase/admin";

// worldcup26.ir — free, no API key required, live scores for 2026
const WC_API_URL = "https://worldcup26.ir/get/games";

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
  try {
    const res = await fetch(WC_API_URL, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        { fixtures: [], configured: true, error: `HTTP ${res.status}` },
        { status: 500 },
      );
    }

    const json = await res.json();
    const games: Record<string, string>[] = json.games ?? [];

    const fixtures: LiveFixture[] = games.map((g) => ({
      id:        parseInt(g.id, 10),
      homeTeam:  g.home_team_name_en,
      awayTeam:  g.away_team_name_en,
      homeScore: g.home_score && g.home_score !== "null" ? parseInt(g.home_score, 10) : null,
      awayScore: g.away_score && g.away_score !== "null" ? parseInt(g.away_score, 10) : null,
      status:    mapStatus(g.finished, g.time_elapsed),
      minute:    parseMinute(g.time_elapsed),
      date:      localDateToISO(g.local_date),
    }));

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

function mapStatus(finished: string, timeElapsed: string): LiveFixture["status"] {
  if (finished === "TRUE") return "finished";
  if (timeElapsed === "notstarted") return "upcoming";
  return "live";
}

function parseMinute(timeElapsed: string): number | null {
  if (!timeElapsed || timeElapsed === "notstarted" || timeElapsed === "finished") return null;
  const n = parseInt(timeElapsed, 10);
  return isNaN(n) ? null : n;
}

// "MM/DD/YYYY HH:MM" → "YYYY-MM-DDTHH:MM:00"
function localDateToISO(localDate: string): string {
  const [datePart, timePart] = localDate.split(" ");
  const [month, day, year] = datePart.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart ?? "00:00"}:00`;
}

function normalize(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
