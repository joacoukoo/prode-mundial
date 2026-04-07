"use client";

import { Navbar } from "@/components/Navbar";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Trophy, Star, Target, Zap, Camera } from "lucide-react";

export default function PerfilPage() {
  const { profile } = useAuth();
  const { players } = useLeaderboard();

  if (!profile) return null;

  const rank = players.findIndex((p) => p.id === profile.id) + 1;
  const total = players.length;

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
