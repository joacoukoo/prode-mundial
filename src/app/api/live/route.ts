import { NextResponse } from "next/server";
import { MATCHES } from "@/lib/data/matches";
import { API_TEAM_NAMES } from "@/lib/data/apiTeamNames";
import { createAdminClient } from "@/lib/supabase/admin";

// worldcup26.ir — free, no API key required, live scores for 2026.
// It's unreliable (frequent connection resets / 500s, and successful
// responses can take ~15s), so this route needs extra headroom plus
// retries — see fetchGamesWithRetry. Worst case (all attempts time out)
// must stay comfortably under maxDuration.
export const maxDuration = 45;

const WC_API_URL = "https://worldcup26.ir/get/games";
const FETCH_ATTEMPTS = 2;
const FETCH_TIMEOUT_MS = 14_000;
const RETRY_DELAY_MS = 300;

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
    const games = await fetchGamesWithRetry();

    if (!games) {
      console.warn("[/api/live] upstream unavailable after retries, falling back to last known results");
      const fixtures = await loadFixturesFromSupabase();
      return NextResponse.json({ fixtures, configured: true, stale: true });
    }

    const fixtures: LiveFixture[] = games
    .filter((g) => g.home_team_name_en && g.away_team_name_en)
    .map((g) => ({
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

// worldcup26.ir resets connections or 500s on a large fraction of requests.
// Retry a few times with a short per-attempt timeout before giving up.
async function fetchGamesWithRetry(): Promise<Record<string, string>[] | null> {
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const res = await fetch(WC_API_URL, { cache: "no-store", signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return json.games ?? [];
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
