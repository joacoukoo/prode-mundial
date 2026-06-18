"use client";

import Link from "next/link";
import { Clock, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { CountryFlag } from "./CountryFlag";
import { usePredictions } from "@/hooks/usePredictions";
import type { Match } from "@/lib/types";
import type { Prediction } from "@/lib/supabase/types";

export function LiveMatchBar({ matches }: { matches: Match[] }) {
  const { getPrediction } = usePredictions();

  const liveMatches = matches.filter((m) => m.status === "live");
  const nextMatch = matches
    .filter((m) => m.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  if (liveMatches.length === 0 && !nextMatch) return null;

  const userTZ = typeof window !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "America/Guatemala";

  return (
    <div className="glass rounded-2xl border border-border p-4 mb-5 flex flex-col gap-3">
      {liveMatches.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-dot" />
            EN VIVO AHORA
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {liveMatches.map((m) => (
              <LiveChip key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}

      {nextMatch && (
        <NextMatchRow
          match={nextMatch}
          userTZ={userTZ}
          prediction={getPrediction(nextMatch.id)}
          withDivider={liveMatches.length > 0}
        />
      )}
    </div>
  );
}

function LiveChip({ match }: { match: Match }) {
  return (
    <Link
      href={`/partidos?jornada=${match.matchday}`}
      className="flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors"
    >
      <CountryFlag flagCode={match.homeTeam.flagCode} countryName={match.homeTeam.name} size="sm" />
      <span className="font-heading font-bold text-sm tabular-nums whitespace-nowrap">
        {match.homeTeam.shortName} {match.homeScore ?? 0} - {match.awayScore ?? 0} {match.awayTeam.shortName}
      </span>
      <CountryFlag flagCode={match.awayTeam.flagCode} countryName={match.awayTeam.name} size="sm" />
    </Link>
  );
}

function NextMatchRow({
  match, userTZ, prediction, withDivider,
}: {
  match: Match;
  userTZ: string;
  prediction: Prediction | null;
  withDivider: boolean;
}) {
  const matchDate = new Date(match.date);
  const deadlineDate = new Date(matchDate.getTime() - 5 * 60 * 1000);
  const isPastDeadline = new Date() >= deadlineDate;
  const needsPrediction = !prediction && !isPastDeadline;

  const dateStr = formatInTimeZone(matchDate, userTZ, "EEE d 'de' MMM · HH:mm", { locale: es });

  return (
    <div className={withDivider ? "pt-3 border-t border-border/50" : ""}>
      <Link
        href={`/partidos?jornada=${match.matchday}`}
        className={`flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 -mx-1 transition-colors ${
          needsPrediction ? "bg-primary/10 border border-primary/30 hover:bg-primary/15" : "hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Clock size={15} className="text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5 capitalize">Próximo partido · {dateStr}</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold truncate">
              <CountryFlag flagCode={match.homeTeam.flagCode} countryName={match.homeTeam.name} size="xs" />
              {match.homeTeam.shortName} vs {match.awayTeam.shortName}
              <CountryFlag flagCode={match.awayTeam.flagCode} countryName={match.awayTeam.name} size="xs" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {needsPrediction ? (
            <span className="flex items-center gap-1 text-xs font-bold text-primary whitespace-nowrap">
              <AlertCircle size={13} />
              Falta pronóstico
            </span>
          ) : prediction ? (
            <span className="flex items-center gap-1 text-xs text-green-400 whitespace-nowrap">
              <CheckCircle2 size={13} />
              {prediction.home_score}-{prediction.away_score}
            </span>
          ) : null}
          <ChevronRight size={15} className="text-muted-foreground" />
        </div>
      </Link>
    </div>
  );
}
