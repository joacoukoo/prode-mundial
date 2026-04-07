// Uses the `flag-icons` npm package (served locally — no external CDN needed)
// Sizes are set via inline style to override flag-icons' own CSS specificity.

interface CountryFlagProps {
  flagCode: string;
  countryName: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  rounded?: boolean;
}

// width × height in px (flags are 3:2 ratio)
const sizeMap = {
  xs:  { w: 20,  h: 14  },
  sm:  { w: 28,  h: 19  },
  md:  { w: 40,  h: 27  },
  lg:  { w: 56,  h: 38  },
  xl:  { w: 80,  h: 54  },
  "2xl": { w: 108, h: 72 },
};

function resolveCode(code: string): string {
  if (code === "gb-eng") return "gb-eng";
  if (code === "gb-sct") return "gb-sct";
  return code.toLowerCase().split("-")[0];
}

export function CountryFlag({
  flagCode,
  countryName,
  size = "md",
  className = "",
  rounded = true,
}: CountryFlagProps) {
  const code = resolveCode(flagCode);
  const { w, h } = sizeMap[size];

  return (
    <span
      className={`fi fi-${code} flex-shrink-0 inline-block shadow-md ${rounded ? "rounded-md" : ""} ${className}`}
      style={{ width: w, height: h, backgroundSize: "cover" }}
      title={countryName}
      role="img"
      aria-label={`Bandera de ${countryName}`}
    />
  );
}
