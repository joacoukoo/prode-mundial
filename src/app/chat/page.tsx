"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Send } from "lucide-react";
import { useRouter } from "next/navigation";

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }) +
    " " +
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function Avatar({ name, color, photoUrl, size = 36 }: { name: string; color: string; photoUrl?: string | null; size?: number }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ring-2 ring-white/10 overflow-hidden"
      style={{ width: size, height: size, background: photoUrl ? "transparent" : color, fontSize: Math.round(size * 0.36) }}
    >
      {photoUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        : <span>{initials}</span>
      }
    </div>
  );
}

export default function ChatPage() {
  const { profile, loading: authLoading } = useAuth();
  const { messages, loading, sending, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !profile) router.push("/login");
  }, [authLoading, profile, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
            <MessageSquare className="text-green-400" size={20} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl">Chat del Prode</h1>
            <p className="text-muted-foreground text-sm">Los mensajes quedan para siempre</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 glass rounded-2xl border border-border overflow-hidden flex flex-col" style={{ minHeight: "60vh" }}>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Cargando mensajes...</span>
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16">
                <MessageSquare size={40} className="text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">Sé el primero en escribir algo</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.user_id === profile?.id;
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar
                    name={msg.profiles.display_name}
                    color={msg.profiles.avatar_color}
                    photoUrl={msg.profiles.avatar_url}
                    size={34}
                  />
                  <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`flex items-baseline gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="text-xs font-semibold text-foreground/80">{msg.profiles.display_name}</span>
                      <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                    </div>
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-white/8 text-foreground rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribí algo..."
              maxLength={500}
              disabled={sending || !profile}
              className="flex-1 bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending || !profile}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
