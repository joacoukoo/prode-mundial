"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Listens for match_results changes and refreshes server components automatically.
// This keeps Estrella de la Jornada and Stats Globales up to date for all users
// whenever the admin saves a match result.
export function RealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("home-refresh")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_results" },
        () => { router.refresh(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  return null;
}
