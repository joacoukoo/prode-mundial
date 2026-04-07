import type { Team } from "../types";

// flagCode = ISO 3166-1 alpha-2 (used with flagcdn.com)
// Groups as per official FIFA 2026 World Cup draw (December 5, 2024)
export const TEAMS: Team[] = [
  // Grupo A
  { id: "mex", name: "México", shortName: "MEX", flagCode: "mx", group: "A" },
  { id: "kor", name: "Corea del Sur", shortName: "KOR", flagCode: "kr", group: "A" },
  { id: "rsa", name: "Sudáfrica", shortName: "RSA", flagCode: "za", group: "A" },
  { id: "cze", name: "República Checa", shortName: "CZE", flagCode: "cz", group: "A" },

  // Grupo B
  { id: "can", name: "Canadá", shortName: "CAN", flagCode: "ca", group: "B" },
  { id: "sui", name: "Suiza", shortName: "SUI", flagCode: "ch", group: "B" },
  { id: "qat", name: "Qatar", shortName: "QAT", flagCode: "qa", group: "B" },
  { id: "bih", name: "Bosnia y Herzegovina", shortName: "BIH", flagCode: "ba", group: "B" },

  // Grupo C
  { id: "bra", name: "Brasil", shortName: "BRA", flagCode: "br", group: "C" },
  { id: "mar", name: "Marruecos", shortName: "MAR", flagCode: "ma", group: "C" },
  { id: "hai", name: "Haití", shortName: "HAI", flagCode: "ht", group: "C" },
  { id: "sco", name: "Escocia", shortName: "SCO", flagCode: "gb-sct", group: "C" },

  // Grupo D
  { id: "usa", name: "Estados Unidos", shortName: "USA", flagCode: "us", group: "D" },
  { id: "par", name: "Paraguay", shortName: "PAR", flagCode: "py", group: "D" },
  { id: "aus", name: "Australia", shortName: "AUS", flagCode: "au", group: "D" },
  { id: "tur", name: "Turquía", shortName: "TUR", flagCode: "tr", group: "D" },

  // Grupo E
  { id: "ger", name: "Alemania", shortName: "GER", flagCode: "de", group: "E" },
  { id: "cur", name: "Curazao", shortName: "CUR", flagCode: "cw", group: "E" },
  { id: "civ", name: "Costa de Marfil", shortName: "CIV", flagCode: "ci", group: "E" },
  { id: "ecu", name: "Ecuador", shortName: "ECU", flagCode: "ec", group: "E" },

  // Grupo F
  { id: "ned", name: "Países Bajos", shortName: "NED", flagCode: "nl", group: "F" },
  { id: "jpn", name: "Japón", shortName: "JPN", flagCode: "jp", group: "F" },
  { id: "swe", name: "Suecia", shortName: "SWE", flagCode: "se", group: "F" },
  { id: "tun", name: "Túnez", shortName: "TUN", flagCode: "tn", group: "F" },

  // Grupo G
  { id: "bel", name: "Bélgica", shortName: "BEL", flagCode: "be", group: "G" },
  { id: "egy", name: "Egipto", shortName: "EGY", flagCode: "eg", group: "G" },
  { id: "irn", name: "Irán", shortName: "IRN", flagCode: "ir", group: "G" },
  { id: "nzl", name: "Nueva Zelanda", shortName: "NZL", flagCode: "nz", group: "G" },

  // Grupo H
  { id: "esp", name: "España", shortName: "ESP", flagCode: "es", group: "H" },
  { id: "cpv", name: "Cabo Verde", shortName: "CPV", flagCode: "cv", group: "H" },
  { id: "ksa", name: "Arabia Saudita", shortName: "KSA", flagCode: "sa", group: "H" },
  { id: "uru", name: "Uruguay", shortName: "URU", flagCode: "uy", group: "H" },

  // Grupo I
  { id: "fra", name: "Francia", shortName: "FRA", flagCode: "fr", group: "I" },
  { id: "sen", name: "Senegal", shortName: "SEN", flagCode: "sn", group: "I" },
  { id: "nor", name: "Noruega", shortName: "NOR", flagCode: "no", group: "I" },
  { id: "irq", name: "Irak", shortName: "IRQ", flagCode: "iq", group: "I" },

  // Grupo J
  { id: "arg", name: "Argentina", shortName: "ARG", flagCode: "ar", group: "J" },
  { id: "alg", name: "Argelia", shortName: "ALG", flagCode: "dz", group: "J" },
  { id: "aut", name: "Austria", shortName: "AUT", flagCode: "at", group: "J" },
  { id: "jor", name: "Jordania", shortName: "JOR", flagCode: "jo", group: "J" },

  // Grupo K
  { id: "por", name: "Portugal", shortName: "POR", flagCode: "pt", group: "K" },
  { id: "cod", name: "R.D. del Congo", shortName: "COD", flagCode: "cd", group: "K" },
  { id: "uzb", name: "Uzbekistán", shortName: "UZB", flagCode: "uz", group: "K" },
  { id: "col", name: "Colombia", shortName: "COL", flagCode: "co", group: "K" },

  // Grupo L
  { id: "eng", name: "Inglaterra", shortName: "ENG", flagCode: "gb-eng", group: "L" },
  { id: "cro", name: "Croacia", shortName: "CRO", flagCode: "hr", group: "L" },
  { id: "gha", name: "Ghana", shortName: "GHA", flagCode: "gh", group: "L" },
  { id: "pan", name: "Panamá", shortName: "PAN", flagCode: "pa", group: "L" },
];

export const getTeamById = (id: string): Team | undefined =>
  TEAMS.find((t) => t.id === id);

export const getTeamsByGroup = (group: string): Team[] =>
  TEAMS.filter((t) => t.group === group);

export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
