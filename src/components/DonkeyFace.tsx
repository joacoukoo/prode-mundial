// Carita de burro caricatura — aparece inline al lado del nombre del último
export function DonkeyFace({ size = 26 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/donkey.png"
      alt="último lugar"
      style={{ width: size, height: size, display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    />
  );
}
