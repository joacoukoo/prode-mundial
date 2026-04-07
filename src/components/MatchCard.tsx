"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Clock, CheckCircle2, Edit2 } from "lucide-react";
import { useState } from "react";
import type { Match } from "@/lib/types";
import type { Prediction } from "@/lib/supabase/types";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { CountryFlag } from "./CountryFlag";

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  onPredict?: (matchId: string, homeScore: number, awayScore: number) => void;
  index?: number;
}

export function MatchCard({ match, prediction, onPredict, index = 0 }: MatchCardProps) {
  const matchDate = new Date(match.date);
  const now = new Date();
  const deadlineDate = new Date(matchDate.getTime() - 30 * 60 * 1000);
  const isPastDeadline = now >= deadlineDate;
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";
  const canPredict = !isPastDeadline && !isFinished && !isLive;

  const userTZ = typeof window !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "America/Guatemala";

  const dateStr = formatInTimeZone(matchDate, userTZ, "EEE d 'de' MMM", { locale: es });
  const timeStr = formatInTimeZone(matchDate, userTZ, "HH:mm", { locale: es });

  const cardBorder =
    isLive      ? "border-accent/60 shadow-[0_0_24px_rgba(34,229,114,0.18)]" :
    prediction  ? "border-primary/45 shadow-[0_0_12px_rgba(247,194,42,0.08)]" :
    canPredict  ? "border-white/10 hover:border-white/20" :
    "border-white/8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`glass rounded-2xl border p-4 transition-all ${cardBorder}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-primary/80 bg-primary/8 px-2.5 py-1 rounded border border-primary/20 uppercase tracking-widest">
            G {match.group}
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground bg-white/5 px-2 py-1 rounded border border-white/8 tracking-wide">
            J{match.matchday}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-dot" />
              EN VIVO
            </div>
          )}
          {isFinished && (
            <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-full border border-white/10">
              Finalizado
            </span>
          )}
          {!isFinished && !isLive && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isPastDeadline ? <Lock size={11} /> : <Clock size={11} />}
              <span>{isPastDeadline ? "Cerrado" : `${timeStr} hs`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Teams row */}
      <div className="flex items-center justify-between gap-2">
        {/* Home */}
        <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
          <CountryFlag flagCode={match.homeTeam.flagCode} countryName={match.homeTeam.name} size="xl" />
          <div className="text-center">
            <p className="font-heading font-bold text-base leading-tight">{match.homeTeam.shortName}</p>
            <p className="text-xs text-muted-foreground leading-tight truncate max-w-[90px]">{match.homeTeam.name}</p>
          </div>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 px-1">
          {isFinished || isLive ? (
            <div className={`flex items-center gap-1.5 font-heading text-5xl leading-none ${isLive ? "text-accent" : "text-foreground"}`}>
              <span className="tabular-nums">{match.homeScore ?? 0}</span>
              <span className={`text-2xl pb-1 ${isLive ? "text-accent/40 live-dot" : "text-border"}`}>–</span>
              <span className="tabular-nums">{match.awayScore ?? 0}</span>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-heading text-2xl text-muted-foreground/40 tracking-[0.3em] mb-0.5">VS</p>
              <p className="text-xs text-muted-foreground capitalize">{dateStr}</p>
            </div>
          )}

          {/* Prediction display or input */}
          {canPredict && (
            <PredictionForm matchId={match.id} prediction={prediction} onPredict={onPredict} />
          )}

          {!canPredict && prediction && (
            <PredictionResult prediction={prediction} />
          )}

          {!canPredict && !prediction && (
            <span className="text-xs text-muted-foreground/50 italic mt-1">Sin pronóstico</span>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2.5 flex-1 min-w-0">
          <CountryFlag flagCode={match.awayTeam.flagCode} countryName={match.awayTeam.name} size="xl" />
          <div className="text-center">
            <p className="font-heading font-bold text-base leading-tight">{match.awayTeam.shortName}</p>
            <p className="text-xs text-muted-foreground leading-tight truncate max-w-[90px]">{match.awayTeam.name}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground capitalize">{dateStr} · {timeStr} hs</span>
        <span className="text-xs text-muted-foreground truncate max-w-[130px] text-right">{match.city}</span>
      </div>
    </motion.div>
  );
}

// ── Prediction form ───────────────────────────────────────────────────────────

function PredictionForm({
  matchId,
  prediction,
  onPredict,
}: {
  matchId: string;
  prediction?: Prediction;
  onPredict?: (matchId: string, homeScore: number, awayScore: number) => void;
}) {
  const [editing, setEditing] = useState(!prediction);
  const [saved, setSaved] = useState(false);

  // If already predicted, show summary with Edit button
  if (!editing && prediction) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="summary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-1.5 mt-1"
        >
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-3 py-1.5">
            <CheckCircle2 size={14} className="text-primary flex-shrink-0" />
            <span className="font-mono font-bold text-primary text-lg">
              {prediction.home_score} - {prediction.away_score}
            </span>
          </div>
          <button
            onClick={() => { setEditing(true); setSaved(false); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit2 size={11} />
            Modificar
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.form
      key="form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const home = Math.max(0, parseInt(data.get("home") as string) || 0);
        const away = Math.max(0, parseInt(data.get("away") as string) || 0);
        onPredict?.(matchId, home, away);
        setSaved(true);
        setEditing(false);
      }}
      className="flex flex-col items-center gap-2 mt-1 w-full"
    >
      {/* Score inputs */}
      <div className="flex items-center gap-2">
        <ScoreInput name="home" defaultValue={prediction?.home_score} />
        <span className="text-muted-foreground font-bold text-xl">-</span>
        <ScoreInput name="away" defaultValue={prediction?.away_score} />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-heading text-base tracking-wider hover:bg-gold-dark transition-all shadow-[0_0_16px_rgba(247,194,42,0.25)] hover:shadow-[0_0_24px_rgba(247,194,42,0.4)] active:scale-95"
      >
        <CheckCircle2 size={15} />
        {prediction ? "Actualizar pronóstico" : "Guardar pronóstico"}
      </button>

      {prediction && (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
      )}
    </motion.form>
  );
}

function ScoreInput({ name, defaultValue }: { name: string; defaultValue?: number }) {
  return (
    <input
      name={name}
      type="number"
      min="0"
      max="20"
      defaultValue={defaultValue ?? ""}
      placeholder="0"
      className="w-12 h-12 text-center font-mono font-bold text-2xl bg-white/5 border-2 border-white/20 rounded-xl focus:border-primary focus:bg-primary/5 outline-none transition-colors"
    />
  );
}

// ── Prediction result (after deadline) ───────────────────────────────────────

function PredictionResult({ prediction }: { prediction: Prediction }) {
  const config =
    prediction.points === 5
      ? { label: "¡Exacto!", cls: "bg-primary/15 border-primary/40 text-primary" }
      : prediction.points === 3
      ? { label: "Ganador ✓", cls: "bg-accent/15 border-accent/40 text-accent" }
      : prediction.points === 0
      ? { label: "Sin puntos", cls: "bg-white/5 border-white/10 text-muted-foreground" }
      : null;

  return (
    <div className="flex flex-col items-center gap-1.5 mt-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Tu pronóstico:</span>
        <span className="font-mono font-bold text-primary">
          {prediction.home_score} - {prediction.away_score}
        </span>
      </div>
      {config && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${config.cls}`}>
          {prediction.points !== undefined && `+${prediction.points} · `}{config.label}
        </span>
      )}
    </div>
  );
}
