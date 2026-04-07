export type Team = {
  id: string;
  name: string;
  shortName: string;
  flagCode: string; // ISO 3166-1 alpha-2 for flagcdn.com
  group: string;
};

export type Match = {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  group: string;
  matchday: number;
  date: string; // ISO string in UTC
  venue: string;
  city: string;
  status: "upcoming" | "live" | "finished";
  homeScore?: number;
  awayScore?: number;
};

export type Prediction = {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points?: number;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  totalPoints: number;
  correctResults: number;
  correctWinners: number;
  matchesPlayed: number;
};

export type ScoreResult = {
  points: 0 | 3 | 5;
  type: "exact" | "winner" | "miss";
};
