import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 32, title: "text-lg", sub: "text-[10px]" },
    md: { icon: 44, title: "text-2xl", sub: "text-xs" },
    lg: { icon: 64, title: "text-4xl", sub: "text-sm" },
  };
  const s = sizes[size];

  return (
    <Link href="/" className="flex items-center gap-3 select-none group">
      {/* SVG Logo Icon */}
      <div
        className="relative flex-shrink-0"
        style={{ width: s.icon, height: s.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={s.icon}
          height={s.icon}
          className="drop-shadow-[0_0_12px_rgba(240,180,41,0.5)] group-hover:drop-shadow-[0_0_18px_rgba(240,180,41,0.7)] transition-all duration-300"
        >
          {/* Globe background */}
          <circle cx="50" cy="50" r="48" fill="url(#globeGradient)" />

          {/* Globe meridians */}
          <ellipse cx="50" cy="50" rx="48" ry="24" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
          <ellipse cx="50" cy="50" rx="28" ry="48" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

          {/* Football pentagonals */}
          {/* Center pentagon */}
          <polygon
            points="50,34 61,42 57,55 43,55 39,42"
            fill="#1a1a1a"
            stroke="#f0b429"
            strokeWidth="1.5"
          />
          {/* Top */}
          <polygon
            points="50,18 57,24 54,32 46,32 43,24"
            fill="#1a1a1a"
            stroke="#f0b429"
            strokeWidth="1"
          />
          {/* Bottom */}
          <polygon
            points="50,82 57,76 54,68 46,68 43,76"
            fill="#1a1a1a"
            stroke="#f0b429"
            strokeWidth="1"
          />
          {/* Left */}
          <polygon
            points="22,44 28,40 34,46 30,54 22,54"
            fill="#1a1a1a"
            stroke="#f0b429"
            strokeWidth="1"
          />
          {/* Right */}
          <polygon
            points="78,44 72,40 66,46 70,54 78,54"
            fill="#1a1a1a"
            stroke="#f0b429"
            strokeWidth="1"
          />

          {/* Gold ring */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="url(#goldRing)" strokeWidth="3" />

          {/* Trophy star top */}
          <polygon
            points="50,4 52,9 57,9 53,12 55,17 50,14 45,17 47,12 43,9 48,9"
            fill="#f0b429"
          />

          <defs>
            <radialGradient id="globeGradient" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#0d2e14" />
              <stop offset="60%" stopColor="#051a09" />
              <stop offset="100%" stopColor="#020b04" />
            </radialGradient>
            <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe566" />
              <stop offset="50%" stopColor="#f7c22a" />
              <stop offset="100%" stopColor="#d4930e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-heading font-bold tracking-wide text-gold-gradient ${s.title}`}
          >
            PRODE
          </span>
          <span
            className={`font-heading font-semibold tracking-[0.15em] text-white/80 uppercase ${s.sub}`}
          >
            Mundial 2026
          </span>
        </div>
      )}
    </Link>
  );
}
