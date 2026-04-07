"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/supabase/types";

export function useChat() {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    fetchMessages();

    channelRef.current = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          // Fetch the full message with profile join
          const { data } = await supabase
            .from("messages")
            .select("id, user_id, content, created_at, profiles(display_name, avatar_color, avatar_url)")
            .eq("id", payload.new.id)
            .single();
          if (data) {
            setMessages((prev) => [...prev, data as unknown as ChatMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("id, user_id, content, created_at, profiles(display_name, avatar_color, avatar_url)")
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages((data as unknown as ChatMessage[]) ?? []);
    setLoading(false);
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("messages").insert({ user_id: user.id, content: trimmed });
    }
    setSending(false);
  }

  return { messages, loading, sending, sendMessage };
}
