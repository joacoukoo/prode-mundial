"use client";

import { useState, useEffect, useCallback } from "react";
import type { Prediction } from "@/lib/types";

const STORAGE_KEY = "prode_predictions";

function loadPredictions(): Record<string, Prediction> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function usePredictions(userId = "me") {
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});

  useEffect(() => {
    setPredictions(loadPredictions());
  }, []);

  const savePrediction = useCallback(
    (matchId: string, homeScore: number, awayScore: number) => {
      const now = new Date().toISOString();
      const pred: Prediction = {
        id: `${userId}_${matchId}`,
        userId,
        matchId,
        homeScore,
        awayScore,
        createdAt: predictions[matchId]?.createdAt ?? now,
        updatedAt: now,
      };
      const updated = { ...loadPredictions(), [matchId]: pred };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setPredictions(updated);
      return pred;
    },
    [userId, predictions],
  );

  const getPrediction = useCallback(
    (matchId: string): Prediction | undefined => predictions[matchId],
    [predictions],
  );

  return { predictions, savePrediction, getPrediction };
}
