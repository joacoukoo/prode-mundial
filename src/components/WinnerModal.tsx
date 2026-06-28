"use client";

import { useEffect, useRef, useState } from "react";
import { X, Trophy } from "lucide-react";

interface WinnerModalProps {
  winner: {
    displayName: string;
    avatarColor: string;
    avatarUrl: string | null;
    totalPoints: number;
  };
}

const STORAGE_KEY = "prode2026-winner-dismissed";

const COLORS = [
  "#f0b429", "#22e572", "#ff4455", "#4488ff",
  "#ff44ff", "#44ffff", "#ffaa00", "#ffffff",
];

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  life: number; maxLife: number;
  size: number;
};

export function WinnerModal({ winner }: WinnerModalProps) {
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function burst(x?: number, y?: number) {
      const bx = x ?? Math.random() * canvas!.width;
      const by = y ?? 80 + Math.random() * (canvas!.height * 0.55);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const count = 70 + Math.floor(Math.random() * 50);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 1.5 + Math.random() * 5;
        particlesRef.current.push({
          x: bx, y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          color,
          life: 1,
          maxLife: 55 + Math.random() * 55,
          size: 2 + Math.random() * 3,
        });
      }
    }

    // Initial triple burst
    burst(canvas.width * 0.25, canvas.height * 0.3);
    burst(canvas.width * 0.75, canvas.height * 0.25);
    burst(canvas.width * 0.5, canvas.height * 0.2);

    function animate() {
      ctx!.fillStyle = "rgba(0,0,0,0.18)";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      timerRef.current++;
      if (timerRef.current % 45 === 0) burst();

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0.02);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.98;
        p.life -= 1 / p.maxLife;
        ctx!.globalAlpha = Math.max(0, p.life);
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * Math.max(0.3, p.life), 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [visible]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    cancelAnimationFrame(animRef.current);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md glass rounded-3xl border border-primary/50 p-8 flex flex-col items-center gap-6 shadow-[0_0_80px_rgba(240,180,41,0.25)]">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={18} className="text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center">
          <p className="text-5xl mb-2 animate-bounce">🎉</p>
          <h2 className="font-heading font-bold text-4xl text-primary tracking-tight">¡FELICIDADES!</h2>
          <p className="text-muted-foreground text-sm mt-1">Campeón del Prode Mundial 2026</p>
        </div>

        {/* Winner avatar + name */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-white text-3xl ring-4 ring-primary overflow-hidden shadow-[0_0_40px_rgba(240,180,41,0.5)]"
            style={{ background: winner.avatarUrl ? "transparent" : winner.avatarColor }}
          >
            {winner.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={winner.avatarUrl} alt={winner.displayName} className="w-full h-full object-cover" />
              : winner.displayName.slice(0, 2).toUpperCase()
            }
          </div>
          <div className="text-center">
            <p className="font-heading font-bold text-2xl">{winner.displayName}</p>
            <p className="text-primary font-heading font-bold text-xl">{winner.totalPoints} puntos 🏆</p>
          </div>
        </div>

        {/* Cheque simbólico */}
        <Cheque name={winner.displayName} />
      </div>
    </div>
  );
}

function Cheque({ name }: { name: string }) {
  const today = new Date().toLocaleDateString("es-GT", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <div className="relative w-full bg-gradient-to-br from-green-950/70 to-emerald-900/50 rounded-2xl border-2 border-green-700/40 p-5 overflow-hidden font-mono shadow-inner">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <Trophy size={180} className="text-green-200" />
      </div>

      {/* Header del cheque */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-heading font-bold text-green-300 text-sm tracking-wider">PRODE MUNDIAL 2026</p>
          <p className="text-green-600 text-[10px]">Banco de los Pronósticos S.A.</p>
        </div>
        <div className="text-right">
          <p className="text-green-600 text-[10px] uppercase tracking-wider">Fecha</p>
          <p className="text-green-300 text-xs">{today}</p>
        </div>
      </div>

      {/* Páguese a */}
      <div className="mb-3">
        <p className="text-green-600 text-[9px] uppercase tracking-widest mb-0.5">Páguese a la orden de</p>
        <div className="border-b border-dashed border-green-700/60 pb-1">
          <p className="text-green-100 font-bold text-base">{name}</p>
        </div>
      </div>

      {/* Monto */}
      <div className="flex items-end justify-between gap-4 mb-4">
        <div className="flex-1">
          <p className="text-green-600 text-[9px] uppercase tracking-widest mb-0.5">La suma de</p>
          <div className="border-b border-dashed border-green-700/60 pb-1">
            <p className="text-green-300 text-[11px]">Un mil quinientos quetzales 00/100</p>
          </div>
        </div>
        <div className="bg-green-900/60 border-2 border-green-600/50 rounded-xl px-4 py-2 flex-shrink-0">
          <p className="text-green-200 font-heading font-bold text-2xl tracking-tight">Q1,500.00</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end pt-3 border-t border-green-800/40">
        <div>
          <p className="text-green-600 text-[9px] uppercase tracking-widest">Concepto</p>
          <p className="text-green-400 text-xs">Premio 1er Lugar 🏆</p>
        </div>
        <div className="text-right">
          <div className="border-b border-green-700/50 pb-0.5 w-28">
            <p className="text-green-500 text-[10px] italic text-right">El Organizador</p>
          </div>
          <p className="text-green-700 text-[9px] uppercase tracking-widest mt-0.5">Firma autorizada</p>
        </div>
      </div>

      {/* Línea MICR decorativa */}
      <p className="text-center text-green-900 text-[9px] mt-3 tracking-[0.25em] select-none">
        ⑆ 2026 0001 ⑆ 0000150000 ⑈
      </p>
    </div>
  );
}
