"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Profile, MatchResult } from "@/lib/supabase/types";
import { COUNTRIES } from "@/lib/data/countries";
import { MATCHES } from "@/lib/data/matches";
import { Shield, Users, Trophy, Star, Target, Zap, CheckCircle2, Circle, Loader2, Save, Radio, Plus, Minus, Flag } from "lucide-react";
import { CountryFlag } from "@/components/CountryFlag";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const MATCHDAYS = [1, 2, 3];

export default function AdminPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult>>({});
  const [resultsMatchday, setResultsMatchday] = useState(1);
  const [savingMatch, setSavingMatch] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push("/login"); return; }
    if (!profile.is_admin) { router.push("/"); return; }
    fetchPlayers();
    fetchResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, profile]);

  async function fetchPlayers() {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    setPlayers(data ?? []);
    setLoading(false);
  }

  async function fetchResults() {
    const supabase = createClient();
    const { data } = await supabase.from("match_results").select("*");
    const map: Record<string, MatchResult> = {};
    (data ?? []).forEach((r) => { map[r.match_id] = r; });
    setMatchResults(map);
  }

  async function togglePaid(playerId: string, currentPaid: boolean) {
    const newPaid = !currentPaid;
    const res = await fetch("/api/admin/toggle-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, paid: newPaid }),
    });
    if (res.ok) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, paid: newPaid } : p))
      );
    }
  }

  async function handleSaveResult(
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: "upcoming" | "live" | "finished",
  ) {
    setSavingMatch(matchId);
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId, home_score: homeScore, away_score: awayScore, status }),
      });
      if (res.ok) await fetchResults();
    } finally {
      setSavingMatch(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  const countryName = (code: string | null) =>
    COUNTRIES.find((c) => c.code === code)?.name ?? "—";

  const totalPoints = players.reduce((s, p) => s + p.total_points, 0);
  const matchesForDay = MATCHES.filter((m) => m.matchday === resultsMatchday);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
            <Shield className="text-red-400" size={20} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl">Panel de Admin</h1>
            <p className="text-muted-foreground text-sm">Solo visible para vos</p>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Participantes" value={players.length} color="text-blue-400" />
          <StatCard icon={CheckCircle2} label="Pagaron" value={players.filter(p => p.paid).length} color="text-green-400" />
          <StatCard icon={Star} label="Exactos totales" value={players.reduce((s, p) => s + p.correct_results, 0)} color="text-yellow-400" />
          <StatCard icon={Zap} label="Puntos en juego" value={totalPoints} color="text-accent" />
        </div>

        {/* ── Partido en vivo ── */}
        <LiveSection matchResults={matchResults} savingMatch={savingMatch} onSave={handleSaveResult} />

        {/* ── Carga de resultados ── */}
        <div className="glass rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Trophy size={16} className="text-primary" />
            <span className="font-semibold text-sm">Cargar resultados de partidos</span>
          </div>

          {/* Jornada tabs */}
          <div className="px-6 pt-4 flex gap-2">
            {MATCHDAYS.map((md) => (
              <button
                key={md}
                onClick={() => setResultsMatchday(md)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                  resultsMatchday === md
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "glass text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                Jornada {md}
              </button>
            ))}
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {matchesForDay.map((match) => (
              <MatchResultRow
                key={match.id}
                match={match}
                existing={matchResults[match.id] ?? null}
                saving={savingMatch === match.id}
                onSave={handleSaveResult}
              />
            ))}
          </div>
        </div>

        {/* Tabla de participantes */}
        <div className="glass rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            <span className="font-semibold text-sm">{players.length} participantes registrados</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-6 py-3">#</th>
                  <th className="text-left px-4 py-3">Nombre</th>
                  <th className="text-left px-4 py-3">Usuario</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">País</th>
                  <th className="text-center px-4 py-3 hidden sm:table-cell">PJ</th>
                  <th className="text-center px-4 py-3 hidden sm:table-cell"><Star size={11} className="inline mr-1" />Exactos</th>
                  <th className="text-center px-4 py-3 hidden sm:table-cell"><Target size={11} className="inline mr-1" />Ganadores</th>
                  <th className="text-center px-4 py-3 hidden sm:table-cell">Pts</th>
                  <th className="text-center px-4 py-3">Pagó</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Registro</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-border/50 hover:bg-white/3 transition-colors ${p.is_admin ? "bg-red-900/10" : ""}`}
                  >
                    <td className="px-6 py-3 text-muted-foreground font-mono">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: p.avatar_color }}
                        >
                          {p.display_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium truncate max-w-[120px]">{p.display_name}</span>
                        {p.is_admin && <span className="text-xs text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded-full border border-red-800/30">admin</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">@{p.username}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{countryName(p.country)}</td>
                    <td className="px-4 py-3 text-center font-mono hidden sm:table-cell">{p.matches_played}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-primary font-mono">{p.correct_results}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-accent font-mono">{p.correct_winners}</td>
                    <td className="px-4 py-3 text-center font-heading font-bold hidden sm:table-cell">{p.total_points}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePaid(p.id, p.paid)}
                        title={p.paid ? "Marcar como no pagado" : "Marcar como pagado"}
                        className="transition-colors hover:scale-110 active:scale-95"
                      >
                        {p.paid
                          ? <CheckCircle2 size={20} className="text-green-400" />
                          : <Circle size={20} className="text-muted-foreground/40 hover:text-green-400/60" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

// ── Match result row ──────────────────────────────────────────────────────────

function MatchResultRow({
  match,
  existing,
  saving,
  onSave,
}: {
  match: (typeof MATCHES)[number];
  existing: MatchResult | null;
  saving: boolean;
  onSave: (matchId: string, home: number, away: number, status: "upcoming" | "live" | "finished") => void;
}) {
  const [home, setHome] = useState(existing?.home_score ?? 0);
  const [away, setAway] = useState(existing?.away_score ?? 0);
  const [status, setStatus] = useState<"upcoming" | "live" | "finished">(existing?.status ?? "finished");

  // Sync if existing loads after mount
  useEffect(() => {
    if (existing) {
      setHome(existing.home_score ?? 0);
      setAway(existing.away_score ?? 0);
      setStatus(existing.status);
    }
  }, [existing]);

  const statusColor =
    existing?.status === "finished" ? "text-primary" :
    existing?.status === "live" ? "text-green-400" :
    "text-muted-foreground";

  return (
    <div className="glass rounded-xl border border-border p-4 flex flex-col gap-3">
      {/* Match header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-primary/70 bg-primary/8 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest">
          G{match.group}
        </span>
        {existing && (
          <span className={`text-[10px] font-bold uppercase ${statusColor}`}>
            {existing.status === "finished" ? "Cargado ✓" : existing.status === "live" ? "En vivo" : "Próximo"}
          </span>
        )}
      </div>

      {/* Teams + score inputs */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <CountryFlag flagCode={match.homeTeam.flagCode} countryName={match.homeTeam.name} size="md" />
          <span className="text-xs font-bold truncate">{match.homeTeam.shortName}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <input
            type="number"
            min={0}
            max={20}
            value={home}
            onChange={(e) => setHome(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-10 h-10 text-center font-mono font-bold text-xl bg-white/5 border-2 border-white/20 rounded-lg focus:border-primary outline-none"
          />
          <span className="text-muted-foreground font-bold">-</span>
          <input
            type="number"
            min={0}
            max={20}
            value={away}
            onChange={(e) => setAway(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-10 h-10 text-center font-mono font-bold text-xl bg-white/5 border-2 border-white/20 rounded-lg focus:border-primary outline-none"
          />
        </div>

        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <CountryFlag flagCode={match.awayTeam.flagCode} countryName={match.awayTeam.name} size="md" />
          <span className="text-xs font-bold truncate">{match.awayTeam.shortName}</span>
        </div>
      </div>

      {/* Status + save */}
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 border border-border text-xs font-medium focus:border-primary outline-none appearance-none"
        >
          <option value="upcoming">Próximo</option>
          <option value="live">En vivo</option>
          <option value="finished">Finalizado</option>
        </select>

        <button
          onClick={() => onSave(match.id, home, away, status)}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/80 disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Guardar
        </button>
      </div>
    </div>
  );
}

// ── Live section ─────────────────────────────────────────────────────────────

function LiveSection({
  matchResults,
  savingMatch,
  onSave,
}: {
  matchResults: Record<string, MatchResult>;
  savingMatch: string | null;
  onSave: (matchId: string, home: number, away: number, status: "upcoming" | "live" | "finished") => void;
}) {
  // Matches happening today (Guatemala = UTC-6) that aren't finished yet
  const nowGT = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const todayGT = nowGT.toISOString().split("T")[0];

  const activeMatches = MATCHES.filter((m) => {
    const matchDayGT = new Date(new Date(m.date).getTime() - 6 * 60 * 60 * 1000)
      .toISOString().split("T")[0];
    const isToday = matchDayGT === todayGT;
    const isLive = matchResults[m.id]?.status === "live";
    const isFinished = matchResults[m.id]?.status === "finished";
    return (isToday || isLive) && !isFinished;
  });

  if (activeMatches.length === 0) return null;

  return (
    <div className="glass rounded-2xl border border-green-500/30 overflow-hidden">
      <div className="px-6 py-4 border-b border-green-500/20 flex items-center gap-2 bg-green-500/5">
        <Radio size={16} className="text-green-400 animate-pulse" />
        <span className="font-semibold text-sm text-green-400">Partidos de hoy</span>
      </div>
      <div className="p-6 flex flex-col gap-4">
        {activeMatches.map((match) => (
          <LiveMatchControl
            key={match.id}
            match={match}
            existing={matchResults[match.id] ?? null}
            saving={savingMatch === match.id}
            onSave={onSave}
          />
        ))}
      </div>
    </div>
  );
}

function LiveMatchControl({
  match,
  existing,
  saving,
  onSave,
}: {
  match: (typeof MATCHES)[number];
  existing: MatchResult | null;
  saving: boolean;
  onSave: (matchId: string, home: number, away: number, status: "upcoming" | "live" | "finished") => void;
}) {
  const [home, setHome] = useState(existing?.home_score ?? 0);
  const [away, setAway] = useState(existing?.away_score ?? 0);

  useEffect(() => {
    if (existing) {
      setHome(existing.home_score ?? 0);
      setAway(existing.away_score ?? 0);
    }
  }, [existing]);

  const isLive = existing?.status === "live";

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-white/3 border border-white/8">
      {/* Teams + score controls */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <CountryFlag flagCode={match.homeTeam.flagCode} countryName={match.homeTeam.name} size="lg" />
          <span className="text-sm font-bold text-center leading-tight">{match.homeTeam.shortName}</span>
        </div>

        {/* Score controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex flex-col items-center gap-1">
            <button onClick={() => setHome((v) => Math.max(0, v - 1))}
              className="w-9 h-9 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors active:scale-95">
              <Minus size={16} />
            </button>
            <span className="font-heading font-bold text-4xl tabular-nums w-10 text-center">{home}</span>
            <button onClick={() => setHome((v) => v + 1)}
              className="w-9 h-9 rounded-lg bg-primary/20 hover:bg-primary/35 text-primary flex items-center justify-center transition-colors active:scale-95">
              <Plus size={16} />
            </button>
          </div>

          <span className="text-muted-foreground font-bold text-2xl pb-1">–</span>

          <div className="flex flex-col items-center gap-1">
            <button onClick={() => setAway((v) => Math.max(0, v - 1))}
              className="w-9 h-9 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors active:scale-95">
              <Minus size={16} />
            </button>
            <span className="font-heading font-bold text-4xl tabular-nums w-10 text-center">{away}</span>
            <button onClick={() => setAway((v) => v + 1)}
              className="w-9 h-9 rounded-lg bg-primary/20 hover:bg-primary/35 text-primary flex items-center justify-center transition-colors active:scale-95">
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <CountryFlag flagCode={match.awayTeam.flagCode} countryName={match.awayTeam.name} size="lg" />
          <span className="text-sm font-bold text-center leading-tight">{match.awayTeam.shortName}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onSave(match.id, home, away, "live")}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold text-sm transition-all disabled:opacity-50 active:scale-95"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Radio size={14} />}
          Actualizar
        </button>
        <button
          onClick={() => onSave(match.id, home, away, "finished")}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-semibold text-sm transition-all disabled:opacity-50 active:scale-95"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
          Finalizar
        </button>
      </div>

      {isLive && (
        <p className="text-center text-xs text-green-400/70">
          Score actual guardado: {existing?.home_score} – {existing?.away_score}
        </p>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="glass rounded-xl border border-border p-4 flex flex-col items-center gap-2">
      <Icon size={18} className={color} />
      <span className={`font-heading font-bold text-2xl ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}
