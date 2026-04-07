import type { Match } from "../types";
import { getTeamById, getTeamsByGroup, GROUPS } from "./teams";

// Schedule based on FIFA 2026 World Cup group stage (June 11–27, 2026)
// All times in UTC. Guatemala = UTC-6.
// Typical kickoff times in Guatemala: 13:00, 16:00, 19:00 hs.
// MD3: both matches per group played simultaneously (World Cup rule).

// Per-group schedule: [MD1_match1, MD1_match2, MD2_match1, MD2_match2, MD3_simultaneous]
const GROUP_SCHEDULE: Record<string, [string, string, string, string, string]> = {
  //                    MD1-P1                MD1-P2                MD2-P1                MD2-P2                MD3
  A: ["2026-06-11T22:00:00Z", "2026-06-13T01:00:00Z", "2026-06-16T22:00:00Z", "2026-06-17T01:00:00Z", "2026-06-25T22:00:00Z"],
  B: ["2026-06-12T19:00:00Z", "2026-06-13T22:00:00Z", "2026-06-17T19:00:00Z", "2026-06-17T22:00:00Z", "2026-06-26T00:00:00Z"],
  C: ["2026-06-12T22:00:00Z", "2026-06-14T01:00:00Z", "2026-06-18T01:00:00Z", "2026-06-18T22:00:00Z", "2026-06-26T02:00:00Z"],
  D: ["2026-06-13T19:00:00Z", "2026-06-14T22:00:00Z", "2026-06-18T19:00:00Z", "2026-06-19T01:00:00Z", "2026-06-26T22:00:00Z"],
  E: ["2026-06-13T22:00:00Z", "2026-06-15T01:00:00Z", "2026-06-19T19:00:00Z", "2026-06-19T22:00:00Z", "2026-06-27T00:00:00Z"],
  F: ["2026-06-14T19:00:00Z", "2026-06-15T22:00:00Z", "2026-06-20T01:00:00Z", "2026-06-20T19:00:00Z", "2026-06-27T02:00:00Z"],
  G: ["2026-06-14T22:00:00Z", "2026-06-16T01:00:00Z", "2026-06-20T22:00:00Z", "2026-06-21T01:00:00Z", "2026-06-27T22:00:00Z"],
  H: ["2026-06-15T19:00:00Z", "2026-06-16T19:00:00Z", "2026-06-21T19:00:00Z", "2026-06-21T22:00:00Z", "2026-06-28T00:00:00Z"],
  I: ["2026-06-16T22:00:00Z", "2026-06-17T19:00:00Z", "2026-06-21T19:00:00Z", "2026-06-22T22:00:00Z", "2026-06-28T02:00:00Z"],
  J: ["2026-06-17T01:00:00Z", "2026-06-18T01:00:00Z", "2026-06-22T19:00:00Z", "2026-06-23T01:00:00Z", "2026-06-28T22:00:00Z"],
  K: ["2026-06-18T22:00:00Z", "2026-06-19T19:00:00Z", "2026-06-23T19:00:00Z", "2026-06-23T22:00:00Z", "2026-06-29T00:00:00Z"],
  L: ["2026-06-20T01:00:00Z", "2026-06-20T22:00:00Z", "2026-06-24T01:00:00Z", "2026-06-24T22:00:00Z", "2026-06-29T22:00:00Z"],
};

// Venues per group
const GROUP_VENUES: Record<string, { venue: string; city: string }[]> = {
  A: [
    { venue: "Estadio Azteca", city: "Ciudad de México" },
    { venue: "Estadio Akron", city: "Guadalajara" },
  ],
  B: [
    { venue: "BMO Field", city: "Toronto" },
    { venue: "BC Place", city: "Vancouver" },
  ],
  C: [
    { venue: "AT&T Stadium", city: "Dallas" },
    { venue: "NRG Stadium", city: "Houston" },
  ],
  D: [
    { venue: "SoFi Stadium", city: "Los Ángeles" },
    { venue: "Levi's Stadium", city: "San Francisco" },
  ],
  E: [
    { venue: "MetLife Stadium", city: "Nueva York" },
    { venue: "Gillette Stadium", city: "Boston" },
  ],
  F: [
    { venue: "Arrowhead Stadium", city: "Kansas City" },
    { venue: "AT&T Stadium", city: "Dallas" },
  ],
  G: [
    { venue: "Hard Rock Stadium", city: "Miami" },
    { venue: "Bank of America Stadium", city: "Charlotte" },
  ],
  H: [
    { venue: "Lincoln Financial Field", city: "Filadelfia" },
    { venue: "MetLife Stadium", city: "Nueva York" },
  ],
  I: [
    { venue: "SoFi Stadium", city: "Los Ángeles" },
    { venue: "Estadio Akron", city: "Guadalajara" },
  ],
  J: [
    { venue: "Hard Rock Stadium", city: "Miami" },
    { venue: "NRG Stadium", city: "Houston" },
  ],
  K: [
    { venue: "BC Place", city: "Vancouver" },
    { venue: "Estadio BBVA", city: "Monterrey" },
  ],
  L: [
    { venue: "AT&T Stadium", city: "Dallas" },
    { venue: "SoFi Stadium", city: "Los Ángeles" },
  ],
};

// Matchday pairings: [home_idx, away_idx] for teams [0,1,2,3] in each group
// MD1: 0v1, 2v3 | MD2: 0v2, 1v3 | MD3: 0v3, 1v2 (simultaneous)
const PAIRINGS = [
  [[0, 1], [2, 3]], // Matchday 1
  [[0, 2], [1, 3]], // Matchday 2
  [[0, 3], [1, 2]], // Matchday 3
];

function generateGroupMatches(): Match[] {
  const matches: Match[] = [];
  let matchId = 1;

  for (const group of GROUPS) {
    const teams = getTeamsByGroup(group);
    if (teams.length !== 4) continue;

    const schedule = GROUP_SCHEDULE[group];
    const venues = GROUP_VENUES[group];

    for (let md = 0; md < 3; md++) {
      const [[i1, j1], [i2, j2]] = PAIRINGS[md];

      const date1 = md < 2 ? schedule[md * 2] : schedule[4];
      const date2 = md < 2 ? schedule[md * 2 + 1] : schedule[4];

      const venueA = venues[0];
      const venueB = venues[1] ?? venues[0];

      matches.push({
        id: `m${String(matchId).padStart(3, "0")}`,
        homeTeam: getTeamById(teams[i1].id)!,
        awayTeam: getTeamById(teams[j1].id)!,
        group,
        matchday: md + 1,
        date: date1,
        venue: venueA.venue,
        city: venueA.city,
        status: "upcoming",
      });
      matchId++;

      matches.push({
        id: `m${String(matchId).padStart(3, "0")}`,
        homeTeam: getTeamById(teams[i2].id)!,
        awayTeam: getTeamById(teams[j2].id)!,
        group,
        matchday: md + 1,
        date: date2,
        venue: venueB.venue,
        city: venueB.city,
        status: "upcoming",
      });
      matchId++;
    }
  }

  return matches;
}

export const MATCHES: Match[] = generateGroupMatches();

export const getMatchById = (id: string): Match | undefined =>
  MATCHES.find((m) => m.id === id);

export const getMatchesByGroup = (group: string): Match[] =>
  MATCHES.filter((m) => m.group === group);

export const getMatchesByMatchday = (matchday: number): Match[] =>
  MATCHES.filter((m) => m.matchday === matchday);
