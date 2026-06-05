"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import { COUNTRIES } from "@/lib/data/countries";
import { Shield, Users, Trophy, Star, Target, Zap, CheckCircle2, Circle } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push("/login"); return; }
    if (!profile.is_admin) { router.push("/"); return; }
    fetchPlayers();
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

  async function togglePaid(playerId: string, currentPaid: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ paid: !currentPaid })
      .eq("id", playerId);
    if (!error) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, paid: !currentPaid } : p))
      );
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
