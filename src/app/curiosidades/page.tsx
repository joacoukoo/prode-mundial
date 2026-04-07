import { Navbar } from "@/components/Navbar";
import { Lightbulb } from "lucide-react";

const CURIOSIDADES = [
  {
    emoji: "🇧🇷",
    titulo: "El rey del torneo",
    texto: "Brasil es el único país que ha participado en todos los Mundiales de la historia — 22 ediciones — y el único en ganar 5 veces.",
  },
  {
    emoji: "⚽",
    titulo: "El gol más rápido",
    texto: "Hakan Şükür (Turquía) anotó el gol más rápido en la historia de los Mundiales: a los 11 segundos de comenzado el partido por el tercer puesto ante Corea del Sur en 2002.",
  },
  {
    emoji: "🇫🇷",
    titulo: "Campeón con rivales del futuro",
    texto: "Cuando Francia ganó el Mundial 2018, la edad promedio de los jugadores de Croacia era 26 años. Muchos de ellos todavía están en actividad.",
  },
  {
    emoji: "🥅",
    titulo: "El arquero goleador",
    texto: "El colombiano René Higuita anotó un gol en el Mundial 1990. Era arquero. Solo atajó 3 partidos pero marcó desde su propio arco con un tiro libre.",
  },
  {
    emoji: "🌍",
    titulo: "El Mundial más caluroso",
    texto: "Qatar 2022 fue el primer Mundial jugado en invierno (noviembre-diciembre) para evitar temperaturas que superan los 45°C en verano.",
  },
  {
    emoji: "🎯",
    titulo: "La mano de Dios",
    texto: "El gol de Diego Maradona con la mano en el Mundial 1986 fue validado por el árbitro tunecino Ali Bin Nasser. Él se enteró de que fue con la mano recién años después.",
  },
  {
    emoji: "🏆",
    titulo: "La copa que fue robada",
    texto: "La Copa Jules Rimet fue robada en 1966 antes del Mundial de Inglaterra. La encontró un perro llamado Pickles en un arbusto de Londres una semana después.",
  },
  {
    emoji: "🇩🇪",
    titulo: "El más consistente",
    texto: "Alemania es el país con más finales de Copa del Mundo: 8. Ganó 4 y perdió 4.",
  },
  {
    emoji: "📺",
    titulo: "La final más vista",
    texto: "La final de 2022 entre Argentina y Francia fue la más vista de la historia con más de 1.500 millones de personas frente a la pantalla.",
  },
  {
    emoji: "🇺🇾",
    titulo: "El primer campeón",
    texto: "Uruguay ganó el primer Mundial en 1930, jugado en su propio país. Argentina llegó a la final pero perdió 4-2.",
  },
  {
    emoji: "👟",
    titulo: "La noche de los pies de Dios",
    texto: "Maradona recorrió 60 metros en 10 segundos tocando el balón 11 veces antes de anotar el 'Gol del Siglo' ante Inglaterra en 1986. Fue elegido el mejor gol de la historia del Mundial.",
  },
  {
    emoji: "🤝",
    titulo: "El partido de la paz",
    texto: "En el Mundial 1954, Hungría goleó a Alemania Occidental 8-3 en la fase de grupos. En la final se revancharon: Alemania ganó 3-2 en lo que se conoce como el 'Milagro de Berna'.",
  },
  {
    emoji: "🇮🇹",
    titulo: "Campeón dos veces seguidas",
    texto: "Italia es el único país que ganó dos Mundiales consecutivos: 1934 y 1938. Ambos bajo el régimen de Mussolini, lo que enturbia esas victorias históricamente.",
  },
  {
    emoji: "😢",
    titulo: "El Maracanazo",
    texto: "Brasil necesitaba solo un empate para ser campeón en 1950 ante Uruguay. Perdió 2-1 ante 200.000 espectadores. Es considerado el resultado más traumático de la historia del fútbol.",
  },
  {
    emoji: "⭐",
    titulo: "El máximo goleador",
    texto: "Miroslav Klose (Alemania) es el máximo goleador de la historia de los Mundiales con 16 goles en cuatro torneos (2002, 2006, 2010 y 2014).",
  },
  {
    emoji: "🃏",
    titulo: "El Mundial más extraño",
    texto: "En el Mundial de 1930 no hubo fase eliminatoria clásica: se jugó en grupos y los primeros de cada grupo más el mejor segundo pasaban directamente a semifinales.",
  },
  {
    emoji: "🧤",
    titulo: "La atajada del siglo",
    texto: "Gordon Banks (Inglaterra) realizó en 1970 lo que se considera la mejor atajada de la historia: le sacó un cabezazo a quemarropa de Pelé que ya cantaba el gol.",
  },
  {
    emoji: "🇸🇳",
    titulo: "La sorpresa del siglo",
    texto: "Senegal eliminó al campeón defensor Francia en el grupo del Mundial 2002. Era su debut en un Mundial. Llegaron hasta cuartos de final.",
  },
  {
    emoji: "🌐",
    titulo: "El primer Mundial con 48 equipos",
    texto: "El Mundial 2026, que se jugará en Estados Unidos, México y Canadá, será el primero en la historia con 48 selecciones participantes. ¡El formato más grande de la historia!",
  },
  {
    emoji: "🎂",
    titulo: "El jugador más joven",
    texto: "Norman Whiteside (Irlanda del Norte) debutó en un Mundial en 1982 con 17 años y 41 días, superando el récord de Pelé.",
  },
];

export default function CuriosidadesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <Lightbulb className="text-yellow-400" size={20} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl">Curiosidades Mundialistas</h1>
            <p className="text-muted-foreground text-sm">{CURIOSIDADES.length} datos que quizás no sabías</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CURIOSIDADES.map((c) => (
            <div
              key={c.titulo}
              className="glass rounded-2xl border border-border p-5 flex flex-col gap-3 hover:border-white/20 transition-colors"
            >
              <span className="text-4xl">{c.emoji}</span>
              <h3 className="font-heading font-bold text-lg leading-tight">{c.titulo}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.texto}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
