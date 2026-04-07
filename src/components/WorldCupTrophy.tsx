"use client";

import { motion } from "framer-motion";

interface TrophyProps {
  className?: string;
}

export function WorldCupTrophy({ className = "" }: TrophyProps) {
  return (
    <motion.div
      className={`relative flex items-center justify-center select-none ${className}`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Golden glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 80%, rgba(240,180,41,0.45) 0%, rgba(240,180,41,0.15) 45%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Emblem — save the image as /public/emblem.png */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/emblem.png"
        alt="Copa del Mundo FIFA 2026"
        className="relative z-10 w-44 sm:w-52 md:w-60 drop-shadow-[0_4px_32px_rgba(240,180,41,0.6)]"
        loading="eager"
      />

      {/* Sparkles */}
      {[
        { left: "5%",  top: "10%", delay: 0 },
        { left: "88%", top: "8%",  delay: 0.7 },
        { left: "92%", top: "55%", delay: 1.4 },
        { left: "2%",  top: "60%", delay: 2.1 },
        { left: "50%", top: "0%",  delay: 1.0 },
      ].map((s, i) => (
        <motion.span
          key={i}
          className="absolute text-yellow-300 text-base pointer-events-none z-20"
          style={{ left: s.left, top: s.top }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
      ))}
    </motion.div>
  );
}
