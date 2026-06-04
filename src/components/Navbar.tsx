"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { Trophy, CalendarDays, BarChart3, MessageSquare, Lightbulb, LogIn, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PlayerAvatar } from "./PlayerAvatar";

const navItems = [
  { href: "/",             label: "Tabla",    icon: Trophy },
  { href: "/partidos",     label: "Partidos", icon: CalendarDays },
  { href: "/estadisticas", label: "Stats",    icon: BarChart3 },
  { href: "/chat",         label: "Chat",       icon: MessageSquare },
  { href: "/curiosidades", label: "Curiosidades", icon: Lightbulb },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#020c04]/95 border-b-2 border-primary/35 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Logo size="sm" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/35 shadow-[0_0_12px_rgba(247,194,42,0.12)]"
                    : "text-foreground/55 hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {profile ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass border border-white/10 hover:border-white/20 transition-all"
              >
                <PlayerAvatar
                  userId={profile.id}
                  displayName={profile.display_name}
                  avatarColor={profile.avatar_color}
                  photoUrl={profile.avatar_url ?? undefined}
                  size={28}
                />
                <span className="text-sm font-medium max-w-[100px] truncate">{profile.display_name}</span>
                {profile.is_admin && (
                  <span className="text-xs text-amber-300 bg-amber-900/30 px-1.5 py-0.5 rounded-full border border-amber-700/40 whitespace-nowrap">Admin</span>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-border shadow-xl z-50 overflow-hidden">
                  <Link
                    href="/perfil"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                  >
                    <User size={15} className="text-muted-foreground" />
                    Mi perfil
                  </Link>
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors border-t border-border"
                  >
                    <LogOut size={15} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-gold-dark transition-colors"
            >
              <LogIn size={16} />
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-border px-4 py-3 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname === href ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {profile ? (
            <>
              <Link href="/perfil" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 border-t border-border mt-1">
                <User size={18} />
                Mi perfil ({profile.display_name})
              </Link>
              <button onClick={() => { setOpen(false); handleLogout(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20">
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground mt-1">
              <LogIn size={18} />
              Ingresar
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
