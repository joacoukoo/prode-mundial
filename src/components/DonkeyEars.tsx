// Comic donkey ears SVG — sits on top of an avatar
// size = diameter of the avatar it's overlaying

interface DonkeyEarsProps {
  avatarSize: number;
}

export function DonkeyEars({ avatarSize }: DonkeyEarsProps) {
  const w = avatarSize * 2.2;   // total width (ears stick out the sides)
  const h = avatarSize * 1.5;   // height (ears extend above)
  const earW = avatarSize * 0.45;
  const earH = avatarSize * 1.1;
  const earRx = earW / 2;
  const innerW = earW * 0.55;
  const innerH = earH * 0.7;

  // Left ear center, right ear center
  const lx = w * 0.27;
  const rx = w * 0.73;
  const earTopY = h * 0.08;
  const earBottomY = h * 0.72;
  const earMidY = (earTopY + earBottomY) / 2;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      style={{
        position: "absolute",
        top: -h * 0.62,
        left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none",
        zIndex: 20,
        overflow: "visible",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left ear — outer */}
      <ellipse
        cx={lx}
        cy={earMidY}
        rx={earRx}
        ry={earH / 2}
        fill="#c8a882"
        stroke="#a07850"
        strokeWidth="1.5"
        transform={`rotate(-8, ${lx}, ${earMidY})`}
      />
      {/* Left ear — inner pink */}
      <ellipse
        cx={lx}
        cy={earMidY + earH * 0.05}
        rx={innerW / 2}
        ry={innerH / 2}
        fill="#e8a0a0"
        transform={`rotate(-8, ${lx}, ${earMidY})`}
      />

      {/* Right ear — outer */}
      <ellipse
        cx={rx}
        cy={earMidY}
        rx={earRx}
        ry={earH / 2}
        fill="#c8a882"
        stroke="#a07850"
        strokeWidth="1.5"
        transform={`rotate(8, ${rx}, ${earMidY})`}
      />
      {/* Right ear — inner pink */}
      <ellipse
        cx={rx}
        cy={earMidY + earH * 0.05}
        rx={innerW / 2}
        ry={innerH / 2}
        fill="#e8a0a0"
        transform={`rotate(8, ${rx}, ${earMidY})`}
      />
    </svg>
  );
}
