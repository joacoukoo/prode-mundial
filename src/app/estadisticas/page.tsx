"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useSpecialPredictions } from "@/hooks/useSpecialPredictions";
import { useAuth } from "@/context/AuthContext";
import { TEAMS } from "@/lib/data/teams";
import { CountryFlag } from "@/components/CountryFlag";
import { BarChart3, Lock, Trophy, Star, Shield, Footprints, CheckCircle2, Loader2 } from "lucide-react";

const CATEGORIES = [
  { key: "champion",        label: "Campeón",          icon: Trophy,     placeholder: "Elegí un equipo" },
  { key: "top_scorer",     label: "Goleador",          icon: Footprints, placeholder: "Ej: Messi, Mbappé..." },
  { key: "best_player",    label: "Mejor jugador",     icon: Star,       placeholder: "Ej: Vinícius Jr..." },
  { key: "best_goalkeeper",label: "Mejor portero",     icon: Shield,     placeholder: "Ej: Courtois..." },
] as const;

type CategoryKey = typeof CATEGORIES[number]["key"];

function Avatar({ name, color, photoUrl }: { name: string; color: string; photoUrl?: string | null }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-xs ring-1 ring-white/10 overflow-hidden"
      style={{ background: photoUrl ? "transparent" : color }}
    >
      {photoUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        : name.slice(0, 2).toUpperCase()
      }
    </div>
  );
}

export default function EstadisticasPage() {
  const { profile } = useAuth();
  const { all, mine, loading, saving, isOpen, save } = useSpecialPredictions();
  const [form, setForm] = useState<Record<CategoryKey, string>>({
    champion: "", top_scorer: "", best_player: "", best_goalkeeper: "",
  });
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.champion || !form.top_scorer || !form.best_player || !form.best_goalkeeper) return;
    await save(form.champion, form.top_scorer, form.best_player, form.best_goalkeeper);
    setSubmitted(true);
  }

  const teamByName = (name: string) => TEAMS.find((t) => t.name === name);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <BarChart3 className="text-blue-400" size={20} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl">Predicciones Especiales</h1>
            <p className="text-muted-foreground text-sm">Una sola vez · Sin puntos · Solo por diversión</p>
          </div>
        </div>

        {/* Form — solo si no predijo todavía y el torneo no empezó */}
        {!loading && profile && isOpen && !mine && !submitted && (
          <div className="glass rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-sm font-semibold text-primary">¿Cuáles son tus picks?</span>
              <span className="text-xs text-muted-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                Cierra el 11 Jun antes del primer partido
              </span>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {CATEGORIES.map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Icon size={14} className="text-muted-foreground" />
                    {label}
                  </label>
                  {key === "champion" ? (
                    <select
                      value={form.champion}
                      onChange={(e) => setForm((f) => ({ ...f, champion: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border focus:border-primary focus:outline-none text-sm transition-colors appearance-none"
                    >
                      <option value="">Seleccioná el campeón</option>
                      {TEAMS.map((t) => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      required
                      maxLength={60}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border focus:border-primary focus:outline-none text-sm transition-colors placeholder:text-muted-foreground"
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={saving}
                className="mt-2 w-full py-3 rounded-xl font-heading font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : <><CheckCircle2 size={18} /> Guardar mis picks</>}
              </button>
            </form>
          </div>
        )}

        {/* Confirmación post-envío */}
        {(submitted || mine) && isOpen && (
          <div className="glass rounded-2xl border border-primary/30 bg-primary/5 p-5 flex items-center gap-3">
            <CheckCircle2 className="text-primary flex-shrink-0" size={22} />
            <div>
              <p className="font-semibold text-sm">¡Picks guardados! Ya no se pueden modificar.</p>
              <p className="text-xs text-muted-foreground mt-0.5">El 11 de junio se revelan los de todos.</p>
            </div>
          </div>
        )}

        {/* Torneo ya empezó y no tiene picks */}
        {!loading && profile && !isOpen && !mine && (
          <div className="glass rounded-2xl border border-border p-5 flex items-center gap-3 opacity-60">
            <Lock size={20} className="text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">El plazo para ingresar picks ya cerró.</p>
          </div>
        )}

        {/* Tabla de resultados — visible cuando el torneo empieza o cuando ya hay picks */}
        {!loading && all.length > 0 && (!isOpen || !mine) === false && !isOpen ? (
          <ResultsTable all={all} myUserId={profile?.id} teamByName={teamByName} />
        ) : !loading && all.length > 0 && !isOpen ? (
          <ResultsTable all={all} myUserId={profile?.id} teamByName={teamByName} />
        ) : !loading && all.length > 0 && !isOpen && (
          <ResultsTable all={all} myUserId={profile?.id} teamByName={teamByName} />
        )}

        {/* Si el torneo no empezó, mostrar cuántos ya pusieron sus picks */}
        {isOpen && all.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            {all.length} {all.length === 1 ? "persona ya puso" : "personas ya pusieron"} sus picks · Los resultados se revelan el 11 de junio
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            <span>Cargando...</span>
          </div>
        )}
      </main>
    </div>
  );
}

function ResultsTable({
  all, myUserId, teamByName,
}: {
  all: ReturnType<typeof useSpecialPredictions>["all"];
  myUserId?: string;
  teamByName: (name: string) => typeof TEAMS[number] | undefined;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading font-bold text-xl">Lo que dijo cada uno</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left pb-3 pr-4">Jugador</th>
              <th className="text-left pb-3 pr-4"><span className="flex items-center gap-1"><Trophy size={11} />Campeón</span></th>
              <th className="text-left pb-3 pr-4"><span className="flex items-center gap-1"><Star size={11} />Mejor jugador</span></th>
              <th className="text-left pb-3 pr-4"><span className="flex items-center gap-1 whitespace-nowrap"><Footprints size={11} />Goleador</span></th>
              <th className="text-left pb-3"><span className="flex items-center gap-1"><Shield size={11} />Portero</span></th>
            </tr>
          </thead>
          <tbody>
            {all.map((row) => {
              const team = teamByName(row.champion);
              const isMe = row.user_id === myUserId;
              return (
                <tr
                  key={row.id}
                  className={`border-b border-border/50 hover:bg-white/3 transition-colors ${isMe ? "bg-primary/5" : ""}`}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={row.profiles.display_name}
                        color={row.profiles.avatar_color}
                        photoUrl={row.profiles.avatar_url}
                      />
                      <span className={`font-medium truncate max-w-[100px] ${isMe ? "text-primary" : ""}`}>
                        {row.profiles.display_name}
                        {isMe && <span className="text-xs opacity-60 ml-1">(vos)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {team && <CountryFlag flagCode={team.flagCode} countryName={team.name} size="xs" />}
                      <span className="truncate max-w-[90px]">{row.champion}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground truncate max-w-[100px]">{row.best_player}</td>
                  <td className="py-3 pr-4 text-muted-foreground truncate max-w-[100px]">{row.top_scorer}</td>
                  <td className="py-3 text-muted-foreground truncate max-w-[100px]">{row.best_goalkeeper}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
