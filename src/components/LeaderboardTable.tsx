"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Target, Info } from "lucide-react";
import type { User } from "@/lib/types";
import { PlayerAvatar } from "./PlayerAvatar";
import { DonkeyEars } from "./DonkeyEars";
import { useAllProfilePhotos } from "@/hooks/useProfilePhoto";
import { useState } from "react";

const TOTAL_MATCHES = 72; // group stage
const POINTS_PER_EXACT = 5;

const COLORS = [
  "#f0b429","#22c55e","#3b82f6","#a855f7","#ec4899",
  "#f97316","#06b6d4","#84cc16","#f43f5e","#8b5cf6",
  "#14b8a6","#eab308","#ef4444","#0ea5e9","#d946ef",
  "#10b981","#f59e0b","#6366f1","#e11d48","#0891b2",
  "#65a30d","#dc2626","#7c3aed","#0284c7","#d97706",
  "#16a34a","#db2777","#2563eb","#9333ea","#c2410c",
  "#0d9488","#ca8a04","#be123c","#4338ca","#0369a1",
  "#15803d","#9d174d","#1d4ed8","#7e22ce","#b45309",
  "#047857","#831843","#1e40af","#6b21a8","#92400e",
  "#065f46","#500724","#1e3a8a","#4c1d95","#78350f",
];

const MOCK_USERS: User[] = [
  { id: "1",  username: "mati_goat",    displayName: "Mati",    avatarColor: COLORS[0],  totalPoints: 187, correctResults: 18, correctWinners: 24, matchesPlayed: 42 },
  { id: "2",  username: "sofi_crack",   displayName: "Sofi",    avatarColor: COLORS[1],  totalPoints: 174, correctResults: 14, correctWinners: 28, matchesPlayed: 42 },
  { id: "3",  username: "juancho23",    displayName: "Juancho", avatarColor: COLORS[2],  totalPoints: 168, correctResults: 13, correctWinners: 27, matchesPlayed: 42 },
  { id: "4",  username: "caro_prode",   displayName: "Caro",    avatarColor: COLORS[3],  totalPoints: 155, correctResults: 11, correctWinners: 26, matchesPlayed: 42 },
  { id: "5",  username: "nico_fut",     displayName: "Nico",    avatarColor: COLORS[4],  totalPoints: 149, correctResults: 10, correctWinners: 23, matchesPlayed: 42 },
  { id: "6",  username: "fer_world",    displayName: "Fer",     avatarColor: COLORS[5],  totalPoints: 143, correctResults:  9, correctWinners: 24, matchesPlayed: 42 },
  { id: "7",  username: "romi_gol",     displayName: "Romi",    avatarColor: COLORS[6],  totalPoints: 138, correctResults:  8, correctWinners: 24, matchesPlayed: 42 },
  { id: "8",  username: "pato_tactic",  displayName: "Pato",    avatarColor: COLORS[7],  totalPoints: 131, correctResults:  7, correctWinners: 25, matchesPlayed: 42 },
  { id: "9",  username: "vale_prode",   displayName: "Vale",    avatarColor: COLORS[8],  totalPoints: 124, correctResults:  6, correctWinners: 22, matchesPlayed: 42 },
  { id: "10", username: "lucas_10",     displayName: "Lucas",   avatarColor: COLORS[9],  totalPoints: 117, correctResults:  5, correctWinners: 24, matchesPlayed: 42 },
  { id: "11", username: "manu_ball",    displayName: "Manu",    avatarColor: COLORS[10], totalPoints: 114, correctResults:  5, correctWinners: 21, matchesPlayed: 42 },
  { id: "12", username: "juli_goles",   displayName: "Juli",    avatarColor: COLORS[11], totalPoints: 110, correctResults:  4, correctWinners: 22, matchesPlayed: 42 },
  { id: "13", username: "santi_pro",    displayName: "Santi",   avatarColor: COLORS[12], totalPoints: 107, correctResults:  4, correctWinners: 21, matchesPlayed: 42 },
  { id: "14", username: "lali_fut",     displayName: "Lali",    avatarColor: COLORS[13], totalPoints: 103, correctResults:  3, correctWinners: 23, matchesPlayed: 42 },
  { id: "15", username: "tomi_world",   displayName: "Tomi",    avatarColor: COLORS[14], totalPoints:  99, correctResults:  3, correctWinners: 22, matchesPlayed: 42 },
  { id: "16", username: "belu_crack",   displayName: "Belu",    avatarColor: COLORS[15], totalPoints:  96, correctResults:  3, correctWinners: 21, matchesPlayed: 42 },
  { id: "17", username: "gonza_gol",    displayName: "Gonza",   avatarColor: COLORS[16], totalPoints:  93, correctResults:  2, correctWinners: 23, matchesPlayed: 42 },
  { id: "18", username: "ceci_prode",   displayName: "Ceci",    avatarColor: COLORS[17], totalPoints:  90, correctResults:  2, correctWinners: 22, matchesPlayed: 42 },
  { id: "19", username: "nacho_fut",    displayName: "Nacho",   avatarColor: COLORS[18], totalPoints:  87, correctResults:  2, correctWinners: 21, matchesPlayed: 42 },
  { id: "20", username: "flor_kick",    displayName: "Flor",    avatarColor: COLORS[19], totalPoints:  84, correctResults:  2, correctWinners: 20, matchesPlayed: 42 },
  { id: "21", username: "pedro_bola",   displayName: "Pedro",   avatarColor: COLORS[20], totalPoints:  81, correctResults:  1, correctWinners: 21, matchesPlayed: 42 },
  { id: "22", username: "vicky_goal",   displayName: "Vicky",   avatarColor: COLORS[21], totalPoints:  79, correctResults:  1, correctWinners: 20, matchesPlayed: 41 },
  { id: "23", username: "leo_mundial",  displayName: "Leo",     avatarColor: COLORS[22], totalPoints:  76, correctResults:  1, correctWinners: 19, matchesPlayed: 41 },
  { id: "24", username: "mari_prode",   displayName: "Mari",    avatarColor: COLORS[23], totalPoints:  74, correctResults:  1, correctWinners: 19, matchesPlayed: 41 },
  { id: "25", username: "fede_tiro",    displayName: "Fede",    avatarColor: COLORS[24], totalPoints:  72, correctResults:  1, correctWinners: 18, matchesPlayed: 41 },
  { id: "26", username: "cla_2026",     displayName: "Cla",     avatarColor: COLORS[25], totalPoints:  70, correctResults:  1, correctWinners: 18, matchesPlayed: 41 },
  { id: "27", username: "dani_kick",    displayName: "Dani",    avatarColor: COLORS[26], totalPoints:  68, correctResults:  0, correctWinners: 20, matchesPlayed: 41 },
  { id: "28", username: "pau_goles",    displayName: "Pau",     avatarColor: COLORS[27], totalPoints:  66, correctResults:  0, correctWinners: 20, matchesPlayed: 41 },
  { id: "29", username: "rafa_fut",     displayName: "Rafa",    avatarColor: COLORS[28], totalPoints:  63, correctResults:  0, correctWinners: 19, matchesPlayed: 41 },
  { id: "30", username: "anita_prode",  displayName: "Anita",   avatarColor: COLORS[29], totalPoints:  61, correctResults:  0, correctWinners: 19, matchesPlayed: 40 },
  { id: "31", username: "ivan_world",   displayName: "Ivan",    avatarColor: COLORS[30], totalPoints:  59, correctResults:  0, correctWinners: 18, matchesPlayed: 40 },
  { id: "32", username: "sol_goal",     displayName: "Sol",     avatarColor: COLORS[31], totalPoints:  57, correctResults:  0, correctWinners: 17, matchesPlayed: 40 },
  { id: "33", username: "beto_tackle",  displayName: "Beto",    avatarColor: COLORS[32], totalPoints:  55, correctResults:  0, correctWinners: 17, matchesPlayed: 40 },
  { id: "34", username: "luce_fut",     displayName: "Luce",    avatarColor: COLORS[33], totalPoints:  52, correctResults:  0, correctWinners: 16, matchesPlayed: 40 },
  { id: "35", username: "agus_bola",    displayName: "Agus",    avatarColor: COLORS[34], totalPoints:  50, correctResults:  0, correctWinners: 16, matchesPlayed: 40 },
  { id: "36", username: "nati_prode",   displayName: "Nati",    avatarColor: COLORS[35], totalPoints:  48, correctResults:  0, correctWinners: 15, matchesPlayed: 40 },
  { id: "37", username: "alan_kick",    displayName: "Alan",    avatarColor: COLORS[36], totalPoints:  46, correctResults:  0, correctWinners: 14, matchesPlayed: 39 },
  { id: "38", username: "mag_world",    displayName: "Mag",     avatarColor: COLORS[37], totalPoints:  44, correctResults:  0, correctWinners: 14, matchesPlayed: 39 },
  { id: "39", username: "eze_tiro",     displayName: "Eze",     avatarColor: COLORS[38], totalPoints:  42, correctResults:  0, correctWinners: 13, matchesPlayed: 39 },
  { id: "40", username: "ines_fut",     displayName: "Inés",    avatarColor: COLORS[39], totalPoints:  40, correctResults:  0, correctWinners: 13, matchesPlayed: 39 },
  { id: "41", username: "sergio_gol",   displayName: "Sergio",  avatarColor: COLORS[40], totalPoints:  38, correctResults:  0, correctWinners: 12, matchesPlayed: 39 },
  { id: "42", username: "clau_prode",   displayName: "Clau",    avatarColor: COLORS[41], totalPoints:  36, correctResults:  0, correctWinners: 11, matchesPlayed: 39 },
  { id: "43", username: "rulo_fut",     displayName: "Rulo",    avatarColor: COLORS[42], totalPoints:  33, correctResults:  0, correctWinners: 11, matchesPlayed: 38 },
  { id: "44", username: "lena_kick",    displayName: "Lena",    avatarColor: COLORS[43], totalPoints:  31, correctResults:  0, correctWinners: 10, matchesPlayed: 38 },
  { id: "45", username: "oscar_world",  displayName: "Oscar",   avatarColor: COLORS[44], totalPoints:  28, correctResults:  0, correctWinners:  9, matchesPlayed: 38 },
  { id: "46", username: "cata_bola",    displayName: "Cata",    avatarColor: COLORS[45], totalPoints:  25, correctResults:  0, correctWinners:  8, matchesPlayed: 38 },
  { id: "47", username: "hugo_prode",   displayName: "Hugo",    avatarColor: COLORS[46], totalPoints:  21, correctResults:  0, correctWinners:  7, matchesPlayed: 37 },
  { id: "48", username: "dolo_fut",     displayName: "Dolo",    avatarColor: COLORS[47], totalPoints:  17, correctResults:  0, correctWinners:  5, matchesPlayed: 37 },
  { id: "49", username: "willy_goal",   displayName: "Willy",   avatarColor: COLORS[48], totalPoints:  12, correctResults:  0, correctWinners:  4, matchesPlayed: 36 },
  { id: "50", username: "berni_nogoal", displayName: "Berni",   avatarColor: COLORS[49], totalPoints:   6, correctResults:  0, correctWinners:  2, matchesPlayed: 35 },
];

function isEliminated(user: User, leaderPoints: number): boolean {
  const remaining = TOTAL_MATCHES - user.matchesPlayed;
  const maxPossible = user.totalPoints + remaining * POINTS_PER_EXACT;
  return maxPossible < leaderPoints;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const AVATAR_SIZE = 36;

export function LeaderboardTable() {
  const photos = useAllProfilePhotos();
  const [showElimInfo, setShowElimInfo] = useState(false);

  const leaderPoints = MOCK_USERS[0].totalPoints;
  const lastIndex = MOCK_USERS.length - 1;
  const eliminatedCount = MOCK_USERS.filter((u) => isEliminated(u, leaderPoints)).length;

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
            <p className="text-muted-foreground text-sm">Fase de grupos · 50 participantes</p>
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

      {/* Eliminated info */}
      {showElimInfo && (
        <div className="mb-4 glass rounded-xl border border-orange-800/30 bg-orange-900/10 px-4 py-3 text-sm text-orange-200">
          <strong className="text-orange-400">Sin chances matemáticas:</strong> estos jugadores ya no pueden alcanzar
          al líder ({leaderPoints} pts) aunque acertaran todos los partidos restantes perfectamente.
          Con {TOTAL_MATCHES} partidos totales y 5 pts por exacto, su máximo posible está por debajo del líder.
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
        {MOCK_USERS.map((user, i) => {
          const rank = i + 1;
          const isLast = i === lastIndex;
          const isTop3 = rank <= 3;
          const elim = isEliminated(user, leaderPoints);
          const remaining = TOTAL_MATCHES - user.matchesPlayed;
          const maxPossible = user.totalPoints + remaining * POINTS_PER_EXACT;

          const rowBg =
            rank === 1 ? "leaderboard-row-1" :
            rank === 2 ? "leaderboard-row-2" :
            rank === 3 ? "leaderboard-row-3" :
            isLast     ? "bg-amber-950/20" :
            elim       ? "opacity-60" : "";

          const borderCls =
            isLast ? "border-amber-700/30" :
            elim   ? "border-transparent" :
            "border-transparent hover:border-white/10";

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.7), duration: 0.25 }}
              className={`grid grid-cols-[44px_1fr_60px_72px_72px_72px] gap-2 items-center px-3 py-2.5 rounded-xl border glass-hover cursor-pointer ${rowBg} ${borderCls}`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center h-8">
                {isTop3 ? (
                  <span className="text-xl leading-none">{MEDAL[rank - 1]}</span>
                ) : (
                  <span className={`text-sm font-mono font-semibold ${isLast ? "text-amber-500" : elim ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                    {rank}
                  </span>
                )}
              </div>

              {/* Player */}
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Avatar wrapper — extra top padding for crown/ears */}
                <div
                  className="relative flex-shrink-0"
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, marginTop: isLast ? 10 : rank === 1 ? 12 : 0 }}
                >
                  {/* Crown on leader */}
                  {rank === 1 && (
                    <motion.span
                      className="absolute -top-4 left-1/2 -translate-x-1/2 text-lg leading-none z-10 pointer-events-none"
                      animate={{ rotate: [-6, 6, -6], y: [0, -2, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      👑
                    </motion.span>
                  )}

                  {/* Donkey ears on last */}
                  {isLast && <DonkeyEars avatarSize={AVATAR_SIZE} />}

                  <PlayerAvatar
                    userId={user.id}
                    displayName={user.displayName}
                    avatarColor={user.avatarColor}
                    size={AVATAR_SIZE}
                    photoOverride={photos[user.id]}
                  />

                  {/* Eliminated X overlay */}
                  {elim && !isLast && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center z-10">
                      <span className="text-orange-400 font-bold text-xs">✕</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className={`font-semibold text-sm truncate leading-tight ${elim && !isLast ? "text-muted-foreground/60 line-through decoration-orange-500/50" : ""}`}>
                      {user.displayName}
                    </p>
                    {rank === 1 && (
                      <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20 whitespace-nowrap hidden sm:inline">
                        líder
                      </span>
                    )}
                    {isLast && (
                      <span className="text-xs text-amber-500 bg-amber-900/20 px-1.5 py-0.5 rounded-full border border-amber-700/30 whitespace-nowrap hidden sm:inline">
                        orejas de burro
                      </span>
                    )}
                    {elim && !isLast && (
                      <span
                        className="text-xs text-orange-400/70 bg-orange-900/10 px-1.5 py-0.5 rounded-full border border-orange-800/20 whitespace-nowrap hidden sm:inline"
                        title={`Máximo posible: ${maxPossible} pts`}
                      >
                        sin chances
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-tight">@{user.username}</p>
                </div>
              </div>

              {/* PJ */}
              <div className="text-center hidden sm:block text-xs text-muted-foreground font-mono">
                {user.matchesPlayed}
              </div>

              {/* Exactos */}
              <div className="text-center hidden sm:block">
                <span className={`text-sm font-mono font-semibold ${elim ? "text-primary/40" : "text-primary"}`}>
                  {user.correctResults}
                </span>
              </div>

              {/* Ganadores */}
              <div className="text-center hidden sm:block">
                <span className={`text-sm font-mono ${elim ? "text-accent/40" : "text-accent"}`}>
                  {user.correctWinners}
                </span>
              </div>

              {/* Puntos */}
              <div className="text-center">
                <span className={`font-heading font-bold text-base ${
                  rank === 1 ? "text-gold-gradient" :
                  isLast     ? "text-amber-500" :
                  elim       ? "text-muted-foreground/40" :
                  "text-foreground"
                }`}>
                  {user.totalPoints}
                </span>
                {elim && !isLast && (
                  <p className="text-[10px] text-orange-400/50 leading-none">
                    máx {maxPossible}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-muted-foreground/50 px-1">
        <span>👑 Corona al líder actual · 🫏 Orejas de burro al último</span>
        {eliminatedCount > 0 && (
          <span className="text-orange-400/50">{eliminatedCount} jugadores sin chances matemáticas</span>
        )}
      </div>
    </div>
  );
}
