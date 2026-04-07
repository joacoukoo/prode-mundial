"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[100px] opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(240,180,41,0.6) 0%, rgba(34,197,94,0.4) 50%, transparent 70%)" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Card */}
        <div className="glass rounded-2xl border border-border p-8">
          {/* Tabs */}
          <div className="flex rounded-xl border border-border overflow-hidden mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn size={16} />
              Ingresar
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus size={16} />
              Registrarse
            </button>
          </div>

          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Nombre para mostrar
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mati el crack"
                  className="px-4 py-3 rounded-xl bg-white/5 border border-border focus:border-primary focus:bg-primary/5 outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Usuario
              </label>
              <input
                type="text"
                placeholder="tu_usuario"
                className="px-4 py-3 rounded-xl bg-white/5 border border-border focus:border-primary focus:bg-primary/5 outline-none transition-colors text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-border focus:border-primary focus:bg-primary/5 outline-none transition-colors text-foreground placeholder:text-muted-foreground pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-border focus:border-primary focus:bg-primary/5 outline-none transition-colors text-foreground placeholder:text-muted-foreground pr-12"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full py-3 rounded-xl font-heading font-bold text-lg bg-primary text-primary-foreground hover:bg-gold-dark transition-colors border border-primary/50 shadow-[0_0_20px_rgba(240,180,41,0.2)]"
            >
              {mode === "login" ? "Ingresar al Prode" : "Crear mi cuenta"}
            </button>
          </form>

          {mode === "login" && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              ¿Primera vez?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-primary hover:text-gold-dark font-medium transition-colors"
              >
                Creá tu cuenta acá
              </button>
            </p>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Acceso exclusivo para participantes del grupo 🏆
        </p>
      </div>
    </div>
  );
}
