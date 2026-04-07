import type { ScoreResult } from "./types";

export function calculatePoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): ScoreResult {
  // Exact result
  if (predHome === realHome && predAway === realAway) {
    return { points: 5, type: "exact" };
  }

  const predOutcome = Math.sign(predHome - predAway); // -1, 0, 1
  const realOutcome = Math.sign(realHome - realAway);

  // Correct winner or correct draw (but wrong score)
  if (predOutcome === realOutcome) {
    return { points: 3, type: "winner" };
  }

  return { points: 0, type: "miss" };
}

export function getOutcomeLabel(outcome: ScoreResult["type"]): string {
  switch (outcome) {
    case "exact":
      return "¡Resultado exacto!";
    case "winner":
      return "Ganador correcto";
    case "miss":
      return "Sin puntos";
  }
}
