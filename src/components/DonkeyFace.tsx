// Carita de burro caricatura — aparece inline al lado del nombre del último
export function DonkeyFace({ size = 22 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 40 48"
      width={size}
      height={size * 1.2}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      {/* Oreja izquierda */}
      <ellipse cx="11" cy="10" rx="5.5" ry="10" fill="#b0a090" stroke="#8a7860" strokeWidth="1.2" transform="rotate(-10 11 10)" />
      <ellipse cx="11" cy="11" rx="3" ry="6.5" fill="#e8b4b8" transform="rotate(-10 11 11)" />

      {/* Oreja derecha */}
      <ellipse cx="29" cy="10" rx="5.5" ry="10" fill="#b0a090" stroke="#8a7860" strokeWidth="1.2" transform="rotate(10 29 10)" />
      <ellipse cx="29" cy="11" rx="3" ry="6.5" fill="#e8b4b8" transform="rotate(10 29 11)" />

      {/* Cabeza */}
      <ellipse cx="20" cy="29" rx="16" ry="17" fill="#c8b89a" stroke="#a09070" strokeWidth="1.2" />

      {/* Hocico */}
      <ellipse cx="20" cy="37" rx="9" ry="6" fill="#d4c0a8" stroke="#a09070" strokeWidth="1" />
      {/* Narinas */}
      <ellipse cx="17" cy="38" rx="2" ry="1.5" fill="#9a8070" />
      <ellipse cx="23" cy="38" rx="2" ry="1.5" fill="#9a8070" />

      {/* Ojos */}
      <ellipse cx="14.5" cy="26" rx="3" ry="3.5" fill="white" />
      <ellipse cx="25.5" cy="26" rx="3" ry="3.5" fill="white" />
      <circle cx="15" cy="26.5" r="1.8" fill="#3a2a1a" />
      <circle cx="26" cy="26.5" r="1.8" fill="#3a2a1a" />
      {/* Brillo en los ojos */}
      <circle cx="15.7" cy="25.5" r="0.6" fill="white" />
      <circle cx="26.7" cy="25.5" r="0.6" fill="white" />

      {/* Cejas preocupadas */}
      <path d="M12 22.5 Q14.5 21 17 22.5" stroke="#6a5040" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M23 22.5 Q25.5 21 28 22.5" stroke="#6a5040" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
