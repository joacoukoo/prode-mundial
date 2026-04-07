"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "prode_profile_photos";

function getStoredPhotos(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

// Global in-memory cache so all components re-render when a photo changes
const listeners = new Set<() => void>();
function notifyAll() {
  listeners.forEach((fn) => fn());
}

export function useProfilePhoto(userId: string) {
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setPhoto(getStoredPhotos()[userId] ?? null);
    load();
    listeners.add(load);
    return () => { listeners.delete(load); };
  }, [userId]);

  const uploadPhoto = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const stored = getStoredPhotos();
        stored[userId] = dataUrl;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        setPhoto(dataUrl);
        notifyAll();
      };
      reader.readAsDataURL(file);
    },
    [userId],
  );

  const removePhoto = useCallback(() => {
    const stored = getStoredPhotos();
    delete stored[userId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setPhoto(null);
    notifyAll();
  }, [userId]);

  return { photo, uploadPhoto, removePhoto };
}

// Read-only snapshot for the leaderboard (no re-render loop)
export function useAllProfilePhotos() {
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = () => setPhotos(getStoredPhotos());
    load();
    listeners.add(load);
    return () => { listeners.delete(load); };
  }, []);

  return photos;
}
