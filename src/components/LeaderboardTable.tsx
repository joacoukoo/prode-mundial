"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Target, Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { PlayerAvatar } from "./PlayerAvatar";
import { DonkeyFace } from "./DonkeyFace";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/context/AuthContext";
import type { Profile } from "@/lib/supabase/types";

const TOTAL_MATCHES = 72;
const POINTS_PER_EXACT = 5;

function isEliminated(player: Profile, leaderPoints: number): boolean {
  const remaining = TOTAL_MATCHES - player.matches_played;
  return player.total_points + remaining * POINTS_PER_EXACT < leaderPoints;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const AVATAR_SIZE = 44;

export function LeaderboardTable() {
  const { players, loading } = useLeaderboard();
  const { profile: me } = useAuth();
  const [showElimInfo, setShowElimInfo] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span>Cargando tabla...</span>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Trophy size={40} className="opacity-30" />
        <p className="text-lg font-heading">Nadie registrado todavía</p>
        <p className="text-sm">¡Sé el primero en unirte al prode!</p>
      </div>
    );
  }

  const leaderPoints = players[0]?.total_points ?? 0;
  const lastIndex = players.length - 1;
  const eliminatedCount = players.filter((p) => isEliminated(p, leaderPoints)).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <Trophy className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl">Tabla de Posiciones</h2>
            <p className="text-muted-foreground text-sm">
              Fase de grupos · {players.length} participantes
            </p>
          </div>
        </div>
        {eliminatedCount > 0 && (
          <button
            onClick={() => setShowElimInfo(!showElimInfo)}
            className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-900/20 border border-orange-800/30 px-3 py-1.5 rounded-full hover:bg-orange-900/30 transition-colors"
          >
            <Info size={12} />
            {eliminatedCount} sin chances
          </button>
        )}
      </div>

      {showElimInfo && (
        <div className="mb-4 glass rounded-xl border border-orange-800/30 bg-orange-900/10 px-4 py-3 text-sm text-orange-200">
          <strong className="text-orange-400">Sin chances matemáticas:</strong> ya no pueden
          alcanzar al líder aunque acertaran todos los partidos restantes perfectamente.
        </div>
      )}

      {/* Column headers */}
      <div className="grid grid-cols-[44px_1fr_60px_72px_72px_72px] gap-2 px-3 pb-2 text-xs text-muted-foreground font-medium uppercase tracking-wider border-b border-border">
        <span className="text-center">#</span>
        <span>Jugador</span>
        <span className="text-center hidden sm:block">PJ</span>
        <span className="hidden sm:flex items-center justify-center gap-1"><Star size={11} />Exactos</span>
        <span className="hidden sm:flex items-center justify-center gap-1"><Target size={11} />Ganados</span>
        <span className="text-center font-bold">Pts</span>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-0.5 mt-1">
        {players.map((player, i) => {
          const rank = i + 1;
          const isLast = i === lastIndex && players.length > 1;
          const isTop3 = rank <= 3;
          const elim = isEliminated(player, leaderPoints);
          const isMe = player.id === me?.id;
          const maxPossible = player.total_points + (TOTAL_MATCHES - player.matches_played) * POINTS_PER_EXACT;

          const rowBg =
            rank === 1 ? "leaderboard-row-1" :
            rank === 2 ? "leaderboard-row-2" :
            rank === 3 ? "leaderboard-row-3" :
            isLast     ? "bg-amber-950/20" :
            elim       ? "opacity-60" : "";

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.6), duration: 0.25 }}
              className={`grid grid-cols-[44px_1fr_60px_72px_72px_72px] gap-2 items-center px-3 py-2.5 rounded-xl border glass-hover cursor-pointer
                ${rowBg}
                ${isMe ? "ring-1 ring-primary/50 border-primary/20" : isLast ? "border-amber-700/30" : "border-transparent hover:border-white/10"}
              `}
            >
              {/* Rank */}
              <div className="flex items-center justify-center h-8">
                {isTop3 ? (
                  <span className="text-xl">{MEDAL[rank - 1]}</span>
                ) : (
                  <span className={`text-sm font-mono font-semibold ${isLast ? "text-amber-500" : elim ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                    {rank}
                  </span>
                )}
              </div>

              {/* Player */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="relative flex-shrink-0"
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, marginTop: rank === 1 ? 12 : 0 }}
                >
                  {rank === 1 && (
                    <motion.span
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl pointer-events-none z-10"
                      animate={{ rotate: [-6, 6, -6], y: [0, -2, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      👑
                    </motion.span>
                  )}

                  <PlayerAvatar
                    userId={player.id}
                    displayName={player.display_name}
                    avatarColor={player.avatar_color}
                    photoUrl={player.avatar_url ?? undefined}
                    size={AVATAR_SIZE}
                    editable={isMe}
                  />

                  {elim && !isLast && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center z-10">
                      <span className="text-orange-400 font-bold text-xs">✕</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {player.country && (
                      <span className={`fi fi-${player.country} flex-shrink-0`} style={{ fontSize: 14, borderRadius: 2, display: "inline-block", verticalAlign: "middle", lineHeight: 1 }} />
                    )}
                    <p className={`font-semibold text-sm truncate leading-tight ${elim && !isLast ? "line-through decoration-orange-500/50 text-muted-foreground/60" : ""}`}>
                      {player.display_name}
                      {isMe && <span className="ml-1 text-primary opacity-70">(vos)</span>}
                    </p>
                    {player.is_admin && (
                      <span className="text-xs text-amber-300 bg-amber-900/30 px-1.5 py-0.5 rounded-full border border-amber-700/40 hidden sm:inline whitespace-nowrap flex-shrink-0">Admin</span>
                    )}
                    {rank === 1 && (
                      <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20 hidden sm:inline whitespace-nowrap">líder</span>
                    )}
                    {isLast && <DonkeyFace size={44} />}
                    {elim && !isLast && (
                      <span className="text-xs text-orange-400/70 bg-orange-900/10 px-1.5 py-0.5 rounded-full border border-orange-800/20 hidden sm:inline whitespace-nowrap" title={`Máximo posible: ${maxPossible} pts`}>
                        sin chances
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">@{player.username}</p>
                </div>
              </div>

              <div className="text-center hidden sm:block text-xs text-muted-foreground font-mono">{player.matches_played}</div>
              <div className="text-center hidden sm:block">
                <span className={`text-sm font-mono font-semibold ${elim ? "text-primary/40" : "text-primary"}`}>{player.correct_results}</span>
              </div>
              <div className="text-center hidden sm:block">
                <span className={`text-sm font-mono ${elim ? "text-accent/40" : "text-accent"}`}>{player.correct_winners}</span>
              </div>
              <div className="text-center">
                <span className={`font-heading font-bold text-base ${rank === 1 ? "text-gold-gradient" : isLast ? "text-amber-500" : elim ? "text-muted-foreground/40" : ""}`}>
                  {player.total_points}
                </span>
                {elim && !isLast && (
                  <p className="text-[10px] text-orange-400/50 leading-none">máx {maxPossible}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-muted-foreground/50 px-1">
        <span>👑 Líder actual</span>
        {eliminatedCount > 0 && <span className="text-orange-400/50">{eliminatedCount} sin chances matemáticas</span>}
      </div>
    </div>
  );
}
