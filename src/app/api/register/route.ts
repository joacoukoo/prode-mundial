import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const AVATAR_COLORS = [
  "#f0b429","#22c55e","#3b82f6","#a855f7","#ec4899",
  "#f97316","#06b6d4","#84cc16","#f43f5e","#8b5cf6",
];

export async function POST(req: Request) {
  const { username, displayName, email, password } = await req.json();

  if (!username || !displayName || !email || !password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const cleanUsername = username.toLowerCase().trim();
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  // Check username availability
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", cleanUsername)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Ese usuario ya está en uso" });
  }

  // Create user — Supabase sends real confirmation email automatically
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: {
      username: cleanUsername,
      display_name: displayName.trim(),
      avatar_color: avatarColor,
    },
  });

  if (authError || !authData.user) {
    if (authError?.message?.toLowerCase().includes("already registered")) {
      return NextResponse.json({ error: "Ese email ya está registrado" });
    }
    return NextResponse.json({ error: authError?.message ?? "Error al crear usuario" });
  }

  // Create profile immediately (before email confirmation)
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: authData.user.id,
      username: cleanUsername,
      display_name: displayName.trim(),
      avatar_color: avatarColor,
      avatar_url: null,
      country: null,
      is_admin: false,
      total_points: 0,
      correct_results: 0,
      correct_winners: 0,
      matches_played: 0,
    }, { onConflict: "id" });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: "Error al crear el perfil" });
  }

  return NextResponse.json({ error: null });
}
