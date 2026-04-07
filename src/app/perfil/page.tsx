"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES } from "@/lib/data/countries";
import { Trophy, Star, Target, Zap, Camera, Check } from "lucide-react";

export default function PerfilPage() {
  const { profile } = useAuth();
  const { players } = useLeaderboard();
  const [selectedCountry, setSelectedCountry] = useState(profile?.country ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const rank = players.findIndex((p) => p.id === profile.id) + 1;
  const total = players.length;

  async function saveCountry() {
    if (!selectedCountry) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ country: selectedCountry }).eq("id", profile!.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Profile card */}
        <div className="glass rounded-2xl border border-border p-8 flex flex-col items-center gap-4 mb-8">
          {/* Avatar editable */}
          <div className="relative group">
            <PlayerAvatar
              userId={profile.id}
              displayName={profile.display_name}
              avatarColor={profile.avatar_color}
              photoUrl={profile.avatar_url ?? undefined}
              size={96}
              editable
            />
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 pointer-events-none">
              <Camera size={14} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">Hacé click en la foto para cambiarla</p>

          <div className="text-center">
            <h1 className="font-heading font-bold text-3xl">{profile.display_name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>

          {rank > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-border">
              <span className="font-heading font-bold text-2xl text-primary">{rank}°</span>
              <span className="text-muted-foreground text-sm">de {total} jugadores</span>
            </div>
          )}

          {/* Country picker */}
          <div className="w-full max-w-xs flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground text-center">¿De qué país sos?</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                {selectedCountry && (
                  <span className={`fi fi-${selectedCountry} absolute left-3 top-1/2 -translate-y-1/2`} style={{ fontSize: 18 }} />
                )}
                <select
                  value={selectedCountry}
                  onChange={(e) => { setSelectedCountry(e.target.value); setSaved(false); }}
                  className={`w-full py-2.5 pr-3 rounded-xl bg-white/5 border border-border focus:border-primary focus:outline-none text-sm transition-colors appearance-none ${selectedCountry ? "pl-9" : "pl-3"}`}
                >
                  <option value="">Seleccioná un país</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={saveCountry}
                disabled={!selectedCountry || saving || selectedCountry === profile.country}
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/80 transition-all flex items-center gap-1.5"
              >
                {saved ? <><Check size={15} /> Guardado</> : saving ? "..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Trophy} label="Puntos" value={profile.total_points} color="text-primary" />
          <StatCard icon={Star} label="Exactos" value={profile.correct_results} color="text-yellow-400" />
          <StatCard icon={Target} label="Ganadores" value={profile.correct_winners} color="text-accent" />
          <StatCard icon={Zap} label="Partidos" value={profile.matches_played} color="text-blue-400" />
        </div>

        {/* Points breakdown */}
        <div className="mt-6 glass rounded-2xl border border-border p-5">
          <h3 className="font-heading font-bold text-lg mb-4">Desglose de puntos</h3>
          <div className="space-y-3">
            <PointRow label="Resultados exactos (×5)" value={profile.correct_results * 5} color="text-primary" />
            <PointRow label="Ganadores acertados (×3)" value={profile.correct_winners * 3} color="text-accent" />
            <div className="border-t border-border pt-3">
              <PointRow label="Total" value={profile.total_points} color="text-primary" bold />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: number; color: string }) {
  return (
    <div className="glass rounded-xl border border-border p-4 flex flex-col items-center gap-2">
      <Icon size={20} className={color} />
      <span className={`font-heading font-bold text-2xl ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function PointRow({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-bold text-foreground" : "text-muted-foreground"}`}>{label}</span>
      <span className={`font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}
