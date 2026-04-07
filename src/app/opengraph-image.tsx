import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Prode Mundialista 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a1a0c",
          gap: 20,
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(247,194,42,0.18) 0%, rgba(34,229,114,0.08) 50%, transparent 70%)",
          }}
        />

        {/* Trophy */}
        <div style={{ fontSize: 130, lineHeight: 1 }}>🏆</div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#f7c22a",
            letterSpacing: "0.04em",
            textAlign: "center",
          }}
        >
          PRODE MUNDIALISTA
        </div>

        {/* Year */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 400,
            color: "#edfff0",
            opacity: 0.7,
            letterSpacing: "0.3em",
          }}
        >
          2026
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#5a8460",
            marginTop: 8,
            letterSpacing: "0.05em",
          }}
        >
          50 participantes · 72 partidos · Un solo campeón
        </div>
      </div>
    ),
    { ...size }
  );
}
