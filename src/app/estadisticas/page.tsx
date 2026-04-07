import { Navbar } from "@/components/Navbar";
import { BarChart3 } from "lucide-react";

export default function EstadisticasPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <BarChart3 className="text-blue-400" size={20} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl">Estadísticas</h1>
            <p className="text-muted-foreground text-sm">Análisis del prode — próximamente</p>
          </div>
        </div>

        {/* Coming soon cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { emoji: "🎯", title: "Exactos por jugador", desc: "¿Quién tiene el ojo más fino?" },
            { emoji: "📈", title: "Evolución de puntos", desc: "Gráfico jornada a jornada" },
            { emoji: "🔥", title: "Rachas", desc: "Mejor racha consecutiva de aciertos" },
            { emoji: "⚽", title: "Partido más acertado", desc: "El resultado que todos vieron venir" },
            { emoji: "😱", title: "La sorpresa", desc: "El resultado que nadie predijo" },
            { emoji: "👑", title: "Campeón por jornada", desc: "Ganador de cada jornada" },
          ].map((card) => (
            <div key={card.title} className="glass rounded-2xl border border-border p-6 flex flex-col gap-3 opacity-70">
              <span className="text-4xl">{card.emoji}</span>
              <h3 className="font-heading font-bold text-lg">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.desc}</p>
              <span className="text-xs text-primary font-medium mt-auto">Disponible al cierre de la jornada 1</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
