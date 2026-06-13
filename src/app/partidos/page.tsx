"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { MatchCard } from "@/components/MatchCard";
import { MATCHES } from "@/lib/data/matches";
import { GROUPS, getTeamsByGroup } from "@/lib/data/teams";
import { CalendarDays, Clock, Filter, Globe } from "lucide-react";
import { CountryFlag } from "@/components/CountryFlag";
import { usePredictions } from "@/hooks/usePredictions";
import { useLiveMatches } from "@/hooks/useLiveMatches";

const MATCHDAYS = [1, 2, 3];

function GroupTab({ group, active, onClick }: { group: string; active: boolean; onClick: () => void }) {
  const teams = getTeamsByGroup(group);
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all text-sm font-bold ${
        active
          ? "bg-primary/20 text-primary border-primary/40"
          : "glass text-muted-foreground border-border hover:text-foreground hover:border-white/20"
      }`}
    >
      <span>G {group}</span>
      <div className="flex gap-0.5">
        {teams.slice(0, 4).map((t) => (
          <CountryFlag key={t.id} flagCode={t.flagCode} countryName={t.shortName} size="sm" />
        ))}
      </div>
    </button>
  );
}

function useUserTimezone() {
  const [tz, setTz] = useState<string>("");
  useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);
  return tz;
}

export default function PartidosPage() {
  const [activeFilter, setActiveFilter] = useState<"jornada" | "grupo">("jornada");
  const [selectedMatchday, setSelectedMatchday] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState("A");
  const { savePrediction, getPrediction } = usePredictions();
  const { matches: liveMatches, isLiveNow, apiConfigured, lastUpdate } = useLiveMatches(MATCHES);
  const userTZ = useUserTimezone();

  const filteredMatches = (
    activeFilter === "jornada"
      ? liveMatches.filter((m) => m.matchday === selectedMatchday)
      : liveMatches.filter((m) => m.group === selectedGroup)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const groupTeams = getTeamsByGroup(selectedGroup);

  function handlePredict(matchId: string, homeScore: number, awayScore: number) {
    const match = MATCHES.find((m) => m.id === matchId);
    if (!match) return;
    savePrediction(matchId, homeScore, awayScore);
    toast.success("¡Pronóstico guardado!", {
      description: `${match.homeTeam.shortName} ${homeScore} - ${awayScore} ${match.awayTeam.shortName}`,
      icon: "⚽",
      duration: 3000,
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/20 border border-accent/30">
              <CalendarDays className="text-accent" size={22} />
            </div>
            <div>
              <h1 className="font-heading font-bold text-3xl">Partidos</h1>
              <p className="text-muted-foreground text-sm">Fase de grupos · {MATCHES.length} partidos totales</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {/* Live API status */}
            {apiConfigured ? (
              isLiveNow ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/30 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-dot" />
                  Actualizando en vivo
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  API conectada
                  {lastUpdate && <span className="opacity-60">· {lastUpdate.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</span>}
                </div>
              )
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-orange-400/70 bg-orange-900/10 border border-orange-800/20 px-3 py-1.5 rounded-full" title="Configurá API_FOOTBALL_KEY en .env.local">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400/50" />
                Sin API de resultados
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-xl">
              <Clock size={14} />
              Cierre 5 min antes (hora GT)
            </div>
          </div>
        </div>

        {/* Timezone badge */}
        {userTZ && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 border border-white/10 px-3 py-2 rounded-xl mb-5 w-fit">
            <Globe size={13} />
            Horarios en tu zona: <span className="font-medium text-foreground/80">{userTZ.replace(/_/g, " ")}</span>
          </div>
        )}

        {/* Filter type toggle */}
        <div className="flex items-center gap-2 mb-5">
          <Filter size={16} className="text-muted-foreground" />
          <div className="flex rounded-xl border border-border overflow-hidden glass">
            <button
              onClick={() => setActiveFilter("jornada")}
              className={`px-5 py-2 text-sm font-semibold transition-colors ${
                activeFilter === "jornada" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Por Jornada
            </button>
            <button
              onClick={() => setActiveFilter("grupo")}
              className={`px-5 py-2 text-sm font-semibold transition-colors ${
                activeFilter === "grupo" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Por Grupo
            </button>
          </div>
        </div>

        {/* Sub-filters */}
        <AnimatePresence mode="wait">
          {activeFilter === "jornada" ? (
            <motion.div
              key="jornada"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex gap-3 mb-6 flex-wrap"
            >
              {MATCHDAYS.map((md) => (
                <button
                  key={md}
                  onClick={() => setSelectedMatchday(md)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    selectedMatchday === md
                      ? "bg-primary/20 text-primary border-primary/40 shadow-[0_0_12px_rgba(240,180,41,0.15)]"
                      : "glass text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  Jornada {md}
                  <span className="ml-2 text-xs opacity-60 font-normal">
                    {md === 1 ? "11-16 Jun" : md === 2 ? "17-21 Jun" : "25-29 Jun"}
                  </span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="grupo"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {GROUPS.map((g) => (
                  <GroupTab key={g} group={g} active={selectedGroup === g} onClick={() => setSelectedGroup(g)} />
                ))}
              </div>
              {selectedGroup && (
                <div className="glass rounded-xl border border-border px-4 py-3 flex items-center gap-4 flex-wrap">
                  <span className="text-sm text-muted-foreground font-medium">Grupo {selectedGroup}:</span>
                  {groupTeams.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <CountryFlag flagCode={t.flagCode} countryName={t.name} size="md" />
                      <span className="text-sm font-semibold">{t.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile deadline reminder */}
        <div className="sm:hidden flex items-center gap-2 text-xs text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 px-3 py-2 rounded-xl mb-4">
          <Clock size={14} />
          Cierre 5 min antes de cada partido (hora Guatemala)
        </div>

        {/* Matches grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeFilter}-${selectedMatchday}-${selectedGroup}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredMatches.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                index={i}
                prediction={getPrediction(match.id)}
                onPredict={handlePredict}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredMatches.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No hay partidos disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
}
