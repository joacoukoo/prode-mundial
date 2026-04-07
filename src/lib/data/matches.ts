import type { Match } from "../types";
import { getTeamById } from "./teams";

// Fixture oficial FIFA Mundial 2026 — Fase de grupos
// Horarios en UTC. Fuente: TYC Sports (hora Argentina UTC-3, +3h = UTC)
// Guatemala = UTC-6 (restar 6h al UTC para mostrar hora local GT)

function m(
  id: number,
  homeId: string, awayId: string,
  group: string, matchday: number,
  isoDate: string,
  venue: string, city: string,
): Match {
  return {
    id: `m${String(id).padStart(3, "0")}`,
    homeTeam: getTeamById(homeId)!,
    awayTeam: getTeamById(awayId)!,
    group,
    matchday,
    date: isoDate,
    venue,
    city,
    status: "upcoming",
  };
}

export const MATCHES: Match[] = [
  // ── Grupo A ────────────────────────────────────────────────────────────────
  m( 1, "mex", "rsa", "A", 1, "2026-06-11T19:00:00Z", "Estadio Azteca",           "Ciudad de México"),
  m( 2, "kor", "cze", "A", 1, "2026-06-12T02:00:00Z", "Estadio Akron",            "Guadalajara"),
  m( 3, "cze", "rsa", "A", 2, "2026-06-18T16:00:00Z", "Mercedes-Benz Stadium",    "Atlanta"),
  m( 4, "mex", "kor", "A", 2, "2026-06-19T01:00:00Z", "Estadio Akron",            "Guadalajara"),
  m( 5, "cze", "mex", "A", 3, "2026-06-25T01:00:00Z", "Estadio Azteca",           "Ciudad de México"),
  m( 6, "rsa", "kor", "A", 3, "2026-06-25T01:00:00Z", "Estadio BBVA",             "Monterrey"),

  // ── Grupo B ────────────────────────────────────────────────────────────────
  m( 7, "can", "bih", "B", 1, "2026-06-12T19:00:00Z", "BMO Field",                "Toronto"),
  m( 8, "qat", "sui", "B", 1, "2026-06-13T19:00:00Z", "Levi's Stadium",           "Santa Clara"),
  m( 9, "sui", "bih", "B", 2, "2026-06-18T19:00:00Z", "SoFi Stadium",             "Los Ángeles"),
  m(10, "can", "qat", "B", 2, "2026-06-18T22:00:00Z", "BC Place",                 "Vancouver"),
  m(11, "sui", "can", "B", 3, "2026-06-24T19:00:00Z", "BC Place",                 "Vancouver"),
  m(12, "bih", "qat", "B", 3, "2026-06-24T19:00:00Z", "Lumen Field",              "Seattle"),

  // ── Grupo C ────────────────────────────────────────────────────────────────
  m(13, "bra", "mar", "C", 1, "2026-06-13T22:00:00Z", "MetLife Stadium",          "Nueva York"),
  m(14, "hai", "sco", "C", 1, "2026-06-14T01:00:00Z", "Gillette Stadium",         "Foxborough"),
  m(15, "sco", "mar", "C", 2, "2026-06-19T22:00:00Z", "Gillette Stadium",         "Foxborough"),
  m(16, "bra", "hai", "C", 2, "2026-06-20T01:00:00Z", "Lincoln Financial Field",  "Filadelfia"),
  m(17, "sco", "bra", "C", 3, "2026-06-24T22:00:00Z", "Hard Rock Stadium",        "Miami"),
  m(18, "mar", "hai", "C", 3, "2026-06-24T22:00:00Z", "Mercedes-Benz Stadium",    "Atlanta"),

  // ── Grupo D ────────────────────────────────────────────────────────────────
  m(19, "usa", "par", "D", 1, "2026-06-13T01:00:00Z", "SoFi Stadium",             "Los Ángeles"),
  m(20, "aus", "tur", "D", 1, "2026-06-13T04:00:00Z", "BC Place",                 "Vancouver"),
  m(21, "tur", "par", "D", 2, "2026-06-19T04:00:00Z", "Levi's Stadium",           "Santa Clara"),
  m(22, "usa", "aus", "D", 2, "2026-06-19T19:00:00Z", "Lumen Field",              "Seattle"),
  m(23, "tur", "usa", "D", 3, "2026-06-26T02:00:00Z", "SoFi Stadium",             "Los Ángeles"),
  m(24, "par", "aus", "D", 3, "2026-06-26T02:00:00Z", "Levi's Stadium",           "Santa Clara"),

  // ── Grupo E ────────────────────────────────────────────────────────────────
  m(25, "ger", "cur", "E", 1, "2026-06-14T17:00:00Z", "NRG Stadium",              "Houston"),
  m(26, "civ", "ecu", "E", 1, "2026-06-14T23:00:00Z", "Lincoln Financial Field",  "Filadelfia"),
  m(27, "ger", "civ", "E", 2, "2026-06-20T20:00:00Z", "BMO Field",                "Toronto"),
  m(28, "cur", "ecu", "E", 2, "2026-06-21T00:00:00Z", "Arrowhead Stadium",        "Kansas City"),
  m(29, "ecu", "ger", "E", 3, "2026-06-25T20:00:00Z", "MetLife Stadium",          "Nueva York"),
  m(30, "cur", "civ", "E", 3, "2026-06-25T20:00:00Z", "Lincoln Financial Field",  "Filadelfia"),

  // ── Grupo F ────────────────────────────────────────────────────────────────
  m(31, "ned", "jpn", "F", 1, "2026-06-14T20:00:00Z", "AT&T Stadium",             "Arlington"),
  m(32, "swe", "tun", "F", 1, "2026-06-15T02:00:00Z", "Estadio BBVA",             "Monterrey"),
  m(33, "jpn", "tun", "F", 2, "2026-06-20T04:00:00Z", "Estadio BBVA",             "Monterrey"),
  m(34, "ned", "swe", "F", 2, "2026-06-20T17:00:00Z", "NRG Stadium",              "Houston"),
  m(35, "tun", "ned", "F", 3, "2026-06-25T23:00:00Z", "AT&T Stadium",             "Arlington"),
  m(36, "jpn", "swe", "F", 3, "2026-06-25T23:00:00Z", "Arrowhead Stadium",        "Kansas City"),

  // ── Grupo G ────────────────────────────────────────────────────────────────
  m(37, "bel", "egy", "G", 1, "2026-06-15T19:00:00Z", "Lumen Field",              "Seattle"),
  m(38, "irn", "nzl", "G", 1, "2026-06-16T01:00:00Z", "SoFi Stadium",             "Los Ángeles"),
  m(39, "bel", "irn", "G", 2, "2026-06-21T19:00:00Z", "SoFi Stadium",             "Los Ángeles"),
  m(40, "egy", "nzl", "G", 2, "2026-06-22T01:00:00Z", "BC Place",                 "Vancouver"),
  m(41, "nzl", "bel", "G", 3, "2026-06-27T03:00:00Z", "BC Place",                 "Vancouver"),
  m(42, "egy", "irn", "G", 3, "2026-06-27T03:00:00Z", "Lumen Field",              "Seattle"),

  // ── Grupo H ────────────────────────────────────────────────────────────────
  m(43, "esp", "cpv", "H", 1, "2026-06-15T16:00:00Z", "Mercedes-Benz Stadium",    "Atlanta"),
  m(44, "ksa", "uru", "H", 1, "2026-06-15T22:00:00Z", "Hard Rock Stadium",        "Miami"),
  m(45, "esp", "ksa", "H", 2, "2026-06-21T16:00:00Z", "Mercedes-Benz Stadium",    "Atlanta"),
  m(46, "cpv", "uru", "H", 2, "2026-06-21T22:00:00Z", "Hard Rock Stadium",        "Miami"),
  m(47, "uru", "esp", "H", 3, "2026-06-27T00:00:00Z", "Estadio Akron",            "Guadalajara"),
  m(48, "cpv", "ksa", "H", 3, "2026-06-27T00:00:00Z", "NRG Stadium",              "Houston"),

  // ── Grupo I ────────────────────────────────────────────────────────────────
  m(49, "fra", "sen", "I", 1, "2026-06-16T19:00:00Z", "MetLife Stadium",          "Nueva York"),
  m(50, "irq", "nor", "I", 1, "2026-06-16T22:00:00Z", "Gillette Stadium",         "Foxborough"),
  m(51, "fra", "irq", "I", 2, "2026-06-22T21:00:00Z", "Lincoln Financial Field",  "Filadelfia"),
  m(52, "nor", "sen", "I", 2, "2026-06-23T00:00:00Z", "MetLife Stadium",          "Nueva York"),
  m(53, "nor", "fra", "I", 3, "2026-06-26T19:00:00Z", "Gillette Stadium",         "Foxborough"),
  m(54, "sen", "irq", "I", 3, "2026-06-26T19:00:00Z", "BMO Field",                "Toronto"),

  // ── Grupo J ────────────────────────────────────────────────────────────────
  m(55, "aut", "jor", "J", 1, "2026-06-16T04:00:00Z", "Levi's Stadium",           "Santa Clara"),
  m(56, "arg", "alg", "J", 1, "2026-06-17T01:00:00Z", "Arrowhead Stadium",        "Kansas City"),
  m(57, "arg", "aut", "J", 2, "2026-06-22T17:00:00Z", "AT&T Stadium",             "Arlington"),
  m(58, "jor", "alg", "J", 2, "2026-06-23T03:00:00Z", "Levi's Stadium",           "Santa Clara"),
  m(59, "jor", "arg", "J", 3, "2026-06-28T02:00:00Z", "AT&T Stadium",             "Arlington"),
  m(60, "alg", "aut", "J", 3, "2026-06-28T02:00:00Z", "Arrowhead Stadium",        "Kansas City"),

  // ── Grupo K ────────────────────────────────────────────────────────────────
  m(61, "por", "cod", "K", 1, "2026-06-17T17:00:00Z", "NRG Stadium",              "Houston"),
  m(62, "uzb", "col", "K", 1, "2026-06-18T02:00:00Z", "Estadio Azteca",           "Ciudad de México"),
  m(63, "por", "uzb", "K", 2, "2026-06-23T17:00:00Z", "NRG Stadium",              "Houston"),
  m(64, "cod", "col", "K", 2, "2026-06-24T02:00:00Z", "Estadio Akron",            "Guadalajara"),
  m(65, "col", "por", "K", 3, "2026-06-27T23:30:00Z", "Hard Rock Stadium",        "Miami"),
  m(66, "cod", "uzb", "K", 3, "2026-06-27T23:30:00Z", "Mercedes-Benz Stadium",    "Atlanta"),

  // ── Grupo L ────────────────────────────────────────────────────────────────
  m(67, "eng", "cro", "L", 1, "2026-06-17T20:00:00Z", "AT&T Stadium",             "Arlington"),
  m(68, "gha", "pan", "L", 1, "2026-06-17T23:00:00Z", "BMO Field",                "Toronto"),
  m(69, "eng", "gha", "L", 2, "2026-06-23T20:00:00Z", "Gillette Stadium",         "Foxborough"),
  m(70, "cro", "pan", "L", 2, "2026-06-23T23:00:00Z", "BMO Field",                "Toronto"),
  m(71, "pan", "eng", "L", 3, "2026-06-27T21:00:00Z", "MetLife Stadium",          "Nueva York"),
  m(72, "cro", "gha", "L", 3, "2026-06-27T21:00:00Z", "Lincoln Financial Field",  "Filadelfia"),
];

export function getMatchesByGroup(group: string): Match[] {
  return MATCHES.filter((m) => m.group === group);
}

export function getMatchById(id: string): Match | undefined {
  return MATCHES.find((m) => m.id === id);
}
