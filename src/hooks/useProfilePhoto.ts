"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useProfilePhoto() {
  const supabase = createClient();
  const { profile } = useAuth();

  const uploadPhoto = useCallback(
    async (file: File): Promise<string | null> => {
      if (!profile) return null;

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${profile.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) { console.error(uploadError); return null; }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`; // bust cache

      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id);

      return url;
    },
    [profile, supabase],
  );

  return { uploadPhoto };
}
