import { Navbar } from "@/components/Navbar";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { WorldCupTrophy } from "@/components/WorldCupTrophy";
import { Trophy, Zap, Star, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero banner */}
      <section className="relative overflow-hidden border-b border-primary/20">
        {/* Multi-layer background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Diagonal stripes — ultra/scarf energy */}
          <div className="absolute inset-0 stripe-accent" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/50 via-transparent to-amber-950/20" />
          {/* Pitch lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pitch" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pitch)" />
            <circle cx="50%" cy="50%" r="120" fill="none" stroke="white" strokeWidth="0.5" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="0.5" />
          </svg>
          {/* Glow — greener, more vivid */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full opacity-25 blur-[90px]"
            style={{ background: "radial-gradient(ellipse, #f7c22a 0%, rgba(34,229,114,0.45) 50%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

            {/* Text content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-primary live-dot" />
                Mundial 2026 · 11 Jun – 19 Jul
              </div>

              <h1 className="font-heading font-bold text-5xl sm:text-7xl text-foreground tracking-tight leading-none mb-4">
                EL PRODE<br />
                <span className="text-gold-gradient">MÁS ÉPICO</span><br />
                DEL MUNDIAL
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto lg:mx-0 mb-8">
                50 amigos. 72 partidos. Un solo campeón.
                ¿Sos el que más sabe de fútbol?
              </p>

              {/* CTA */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <a
                  href="/partidos"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-lg bg-primary text-primary-foreground hover:bg-gold-dark transition-all shadow-[0_0_30px_rgba(240,180,41,0.3)] hover:shadow-[0_0_40px_rgba(240,180,41,0.5)]"
                >
                  <Zap size={20} />
                  Cargar Pronósticos
                </a>
                <a
                  href="/login"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-lg glass border border-white/20 hover:border-primary/40 transition-all"
                >
                  Ingresar
                </a>
              </div>

              {/* Stats pills */}
              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <StatPill icon={Users} value="50" label="Jugadores" color="text-primary" />
                <StatPill icon={Trophy} value="72" label="Partidos" color="text-accent" />
                <StatPill icon={Zap} value="5pts" label="Por exacto" color="text-blue-400" />
                <StatPill icon={Star} value="3pts" label="Por ganador" color="text-purple-400" />
              </div>
            </div>

            {/* Trophy */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <WorldCupTrophy />
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LeaderboardTable />
        </div>
        <div className="flex flex-col gap-6">
          <BestOfRound />
          <QuickStats />
          <ScoringGuide />
        </div>
      </main>
    </div>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5 border border-white/10">
      <Icon size={18} className={color} />
      <div className="text-left">
        <p className={`font-heading font-bold text-lg leading-tight ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function BestOfRound() {
  return (
    <div className="glass rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⭐</span>
        <h3 className="font-heading font-bold text-lg">Estrella de la Jornada</h3>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
          style={{ background: "#f0b429" }}
        >
          MA
        </div>
        <div>
          <p className="font-semibold">Mati</p>
          <p className="text-sm text-muted-foreground">Jornada 1</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-heading font-bold text-2xl text-primary">45</p>
          <p className="text-xs text-muted-foreground">pts en J1</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2 text-xs">
        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">3 exactos</span>
        <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20">4 ganadores</span>
      </div>
    </div>
  );
}

function QuickStats() {
  return (
    <div className="glass rounded-2xl border border-border p-5">
      <h3 className="font-heading font-bold text-lg mb-4">📊 Stats Globales</h3>
      <div className="flex flex-col gap-3">
        <StatRow label="Partido más acertado" value="ARG 2-0 ALG" sub="38 acertaron" />
        <StatRow label="Resultado más difícil" value="JPN 2-1 NED" sub="Solo 2 lo tenían" />
        <StatRow label="Promedio de pts" value="141" sub="de 50 jugadores" />
        <StatRow label="Predicciones cargadas" value="2.184" sub="de 2.500 posibles" />
      </div>
    </div>
  );
}

function StatRow({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <span className="font-mono font-bold text-primary text-sm flex-shrink-0">{value}</span>
    </div>
  );
}

function ScoringGuide() {
  return (
    <div className="glass rounded-2xl border border-border p-5">
      <h3 className="font-heading font-bold text-lg mb-4">🏆 Sistema de Puntos</h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <span className="font-heading font-bold text-3xl text-primary w-8 text-center">5</span>
          <div>
            <p className="text-sm font-semibold text-primary">Resultado exacto</p>
            <p className="text-xs text-muted-foreground">Ej: predijiste 2-1 y fue 2-1</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
          <span className="font-heading font-bold text-3xl text-accent w-8 text-center">3</span>
          <div>
            <p className="text-sm font-semibold text-accent">Ganador / Empate</p>
            <p className="text-xs text-muted-foreground">Acertaste quién ganó (o fue X)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="font-heading font-bold text-3xl text-muted-foreground w-8 text-center">0</span>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Sin puntos</p>
            <p className="text-xs text-muted-foreground">Nadie dijo que era fácil</p>
          </div>
        </div>
      </div>
    </div>
  );
}
