import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  // Verify the caller is an authenticated admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const { match_id, home_score, away_score, status } = body as {
    match_id: string;
    home_score: number;
    away_score: number;
    status: "upcoming" | "live" | "finished";
  };

  if (!match_id || home_score === undefined || away_score === undefined || !status) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("match_results")
    .upsert(
      {
        match_id,
        home_score,
        away_score,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "match_id" },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
