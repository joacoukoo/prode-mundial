import { Navbar } from "@/components/Navbar";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { WorldCupTrophy } from "@/components/WorldCupTrophy";
import { RealtimeRefresh } from "@/components/RealtimeRefresh";
import { Trophy, Zap, Star, Users, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MATCHES } from "@/lib/data/matches";

export const dynamic = "force-dynamic";

const ENTRY_FEE = 75;

export default async function HomePage() {
  const supabase = await createClient();

  // Participant count & pot
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_admin", false);
  const pot = (count ?? 0) * ENTRY_FEE;

  // Finished match results
  const { data: finishedResults } = await supabase
    .from("match_results")
    .select("match_id")
    .eq("status", "finished");

  const finishedMatchIds = new Set((finishedResults ?? []).map((r) => r.match_id));

  // Convert a UTC ISO date to Guatemala date string (UTC-6)
  function toGTDate(iso: string) {
    const d = new Date(new Date(iso).getTime() - 6 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  }

  // Find the most recent day (GT) that has at least one finished match
  const dayOf: Record<string, string> = {};
  MATCHES.forEach((m) => { dayOf[m.id] = toGTDate(m.date); });

  const finishedDays = [...finishedMatchIds]
    .map((id) => dayOf[id])
    .filter(Boolean)
    .sort();
  const currentDay = finishedDays.length > 0 ? finishedDays[finishedDays.length - 1] : null;

  // IDs of finished matches on that day
  const currentDayMatchIds = currentDay
    ? MATCHES.filter((m) => dayOf[m.id] === currentDay && finishedMatchIds.has(m.id)).map((m) => m.id)
    : [];

  // Estrella de la Jornada — player with most points in current matchday
  type StarPlayer = { displayName: string; avatarColor: string; avatarUrl: string | null; points: number };
  let star: StarPlayer | null = null;

  if (currentDayMatchIds.length > 0) {
    const { data: preds } = await supabase
      .from("predictions")
      .select("user_id, points, profiles(display_name, avatar_color, avatar_url)")
      .in("match_id", currentDayMatchIds)
      .not("points", "is", null);

    const byUser: Record<string, StarPlayer> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (preds as any[] ?? []).forEach((p) => {
      if (!byUser[p.user_id]) {
        byUser[p.user_id] = {
          displayName: p.profiles?.display_name ?? "?",
          avatarColor: p.profiles?.avatar_color ?? "#888",
          avatarUrl: p.profiles?.avatar_url ?? null,
          points: 0,
        };
      }
      byUser[p.user_id].points += p.points ?? 0;
    });

    const users = Object.values(byUser);
    if (users.length > 0) {
      star = users.reduce((best, u) => (u.points > best.points ? u : best));
    }
  }

  // Global stats from profiles
  const { data: profileStats } = await supabase
    .from("profiles")
    .select("correct_results, correct_winners, matches_played")
    .eq("is_admin", false);

  const totalExactos = (profileStats ?? []).reduce((s, p) => s + p.correct_results, 0);
  const totalGanadores = (profileStats ?? []).reduce((s, p) => s + p.correct_winners, 0);
  const totalPartidosJugados = finishedMatchIds.size;
  const totalPredsScorable = (profileStats ?? []).reduce((s, p) => s + p.matches_played, 0);
  const pctExactos = totalPredsScorable > 0
    ? Math.round((totalExactos / totalPredsScorable) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <RealtimeRefresh />
      <Navbar />

      {/* Hero banner */}
      <section className="relative overflow-hidden border-b border-primary/20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 stripe-accent" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/50 via-transparent to-amber-950/20" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pitch" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pitch)" />
            <circle cx="50%" cy="50%" r="120" fill="none" stroke="white" strokeWidth="0.5" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="0.5" />
          </svg>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full opacity-25 blur-[90px]"
            style={{ background: "radial-gradient(ellipse, #f7c22a 0%, rgba(34,229,114,0.45) 50%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-primary live-dot" />
                Mundial 2026 · 11 Jun – 19 Jul
              </div>
              <h1 className="font-heading font-bold text-5xl sm:text-7xl text-foreground tracking-tight leading-none mb-4">
                EL PRODE<br />
                <span className="text-gold-gradient">MÁS ÉPICO</span><br />
                DEL MUNDIAL
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto lg:mx-0 mb-8">
                {count ?? 0} participantes. 72 partidos. Un solo campeón.
                ¿Sos el que más sabe de fútbol?
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <a
                  href="/partidos"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-lg bg-primary text-primary-foreground hover:bg-gold-dark transition-all shadow-[0_0_30px_rgba(240,180,41,0.3)] hover:shadow-[0_0_40px_rgba(240,180,41,0.5)]"
                >
                  <Zap size={20} />
                  Cargar Pronósticos
                </a>
                <a
                  href="/login"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-lg glass border border-white/20 hover:border-primary/40 transition-all"
                >
                  Ingresar
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <StatPill icon={Users} value={String(count ?? 0)} label="Jugadores" color="text-primary" />
                <StatPill icon={Trophy} value="72" label="Partidos" color="text-accent" />
                <StatPill icon={Zap} value="5pts" label="Por exacto" color="text-blue-400" />
                <StatPill icon={Star} value="3pts" label="Por ganador" color="text-purple-400" />
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center justify-center">
              <WorldCupTrophy />
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LeaderboardTable />
        </div>
        <div className="flex flex-col gap-6">
          <PotCard pot={pot} count={count ?? 0} />
          <BestOfRound star={star} day={currentDay} totalMatches={currentDayMatchIds.length} />
          <QuickStats
            exactos={totalExactos}
            ganadores={totalGanadores}
            partidosJugados={totalPartidosJugados}
            pctExactos={pctExactos}
            puntosEnJuego={(72 - totalPartidosJugados) * 5}
          />
          <ScoringGuide />
        </div>
      </main>
    </div>
  );
}

function StatPill({
  icon: Icon, value, label, color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string; label: string; color: string;
}) {
  return (
    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5 border border-white/10">
      <Icon size={18} className={color} />
      <div className="text-left">
        <p className={`font-heading font-bold text-lg leading-tight ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function PotCard({ pot, count }: { pot: number; count: number }) {
  return (
    <div className="glass rounded-2xl border border-primary/40 bg-primary/5 p-5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top left, #f0b429 0%, transparent 70%)" }}
      />
      <div className="relative flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">💰</span>
          <h3 className="font-heading font-bold text-lg text-primary">El Pozo</h3>
        </div>
        <p className="font-heading font-bold text-5xl text-primary tracking-tight">
          Q{pot.toLocaleString("es-GT")}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {count} {count === 1 ? "participante inscripto" : "participantes inscriptos"} · Q{ENTRY_FEE} c/u
        </p>
      </div>
    </div>
  );
}

function BestOfRound({
  star, day, totalMatches,
}: {
  star: { displayName: string; avatarColor: string; avatarUrl: string | null; points: number } | null;
  day: string | null;
  totalMatches: number;
}) {
  const dayLabel = day
    ? new Date(day + "T12:00:00").toLocaleDateString("es-GT", { weekday: "long", day: "numeric", month: "short" })
    : null;

  return (
    <div className="glass rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⭐</span>
        <h3 className="font-heading font-bold text-lg">Estrella del Día</h3>
      </div>
      {!star ? (
        <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
          <span className="text-3xl">🏆</span>
          <p className="text-sm text-muted-foreground">Disponible cuando terminen los primeros partidos</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground capitalize">
            {dayLabel} · {totalMatches} {totalMatches === 1 ? "partido" : "partidos"}
          </p>
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-xl ring-2 ring-primary overflow-hidden"
              style={{ background: star.avatarUrl ? "transparent" : star.avatarColor }}
            >
              {star.avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={star.avatarUrl} alt={star.displayName} className="w-full h-full object-cover" />
                : star.displayName.slice(0, 2).toUpperCase()
              }
            </div>
            <div className="text-center">
              <p className="font-heading font-bold text-base">{star.displayName}</p>
              <p className="text-primary font-heading font-bold text-2xl">+{star.points} pts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStats({
  exactos, ganadores, partidosJugados, pctExactos, puntosEnJuego,
}: {
  exactos: number; ganadores: number; partidosJugados: number; pctExactos: number; puntosEnJuego: number;
}) {
  if (partidosJugados === 0) {
    return (
      <div className="glass rounded-2xl border border-border p-5">
        <h3 className="font-heading font-bold text-lg mb-4">📊 Stats Globales</h3>
        <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
          <span className="text-3xl">📈</span>
          <p className="text-sm text-muted-foreground">Disponibles cuando terminen los primeros partidos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl border border-border p-5">
      <h3 className="font-heading font-bold text-lg mb-4">📊 Stats Globales</h3>
      <div className="flex flex-col gap-0">
        <StatRow icon="🎯" label="Exactos totales" value={String(exactos)} sub="en todo el prode" />
        <StatRow icon="✅" label="Ganadores totales" value={String(ganadores)} sub="resultado correcto sin exacto" />
        <StatRow icon="⚽" label="Partidos jugados" value={`${partidosJugados}/72`} sub="fase de grupos" />
        <StatRow icon="📈" label="% de exactos" value={`${pctExactos}%`} sub="del total de pronósticos" />
        <StatRow icon="⚡" label="Puntos en juego" value={`${puntosEnJuego}`} sub="máx restantes por partido" />
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
      <span className="font-mono font-bold text-primary text-sm flex-shrink-0">{value}</span>
    </div>
  );
}

function ScoringGuide() {
  return (
    <div className="glass rounded-2xl border border-border p-5">
      <h3 className="font-heading font-bold text-lg mb-4">🏆 Sistema de Puntos</h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <span className="font-heading font-bold text-3xl text-primary w-8 text-center">5</span>
          <div>
            <p className="text-sm font-semibold text-primary">Resultado exacto</p>
            <p className="text-xs text-muted-foreground">Ej: predijiste 2-1 y fue 2-1</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
          <span className="font-heading font-bold text-3xl text-accent w-8 text-center">3</span>
          <div>
            <p className="text-sm font-semibold text-accent">Ganador / Empate</p>
            <p className="text-xs text-muted-foreground">Acertaste quién ganó (o fue X)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="font-heading font-bold text-3xl text-muted-foreground w-8 text-center">0</span>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Sin puntos</p>
            <p className="text-xs text-muted-foreground">Nadie dijo que era fácil</p>
          </div>
        </div>
      </div>
    </div>
  );
}
