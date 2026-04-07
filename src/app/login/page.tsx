"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff, LogIn, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username    = (fd.get("username") as string).trim();
    const displayName = (fd.get("displayName") as string ?? "").trim();
    const password    = fd.get("password") as string;
    const confirm     = fd.get("confirm") as string;

    if (!username || !password) {
      toast.error("Completá todos los campos");
      return;
    }
    if (mode === "register") {
      if (!displayName) { toast.error("Ingresá tu nombre"); return; }
      if (password.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return; }
      if (password !== confirm) { toast.error("Las contraseñas no coinciden"); return; }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await login(username, password);
        if (error) { toast.error(error); return; }
        toast.success("¡Bienvenido de nuevo!");
        router.push("/");
        router.refresh();
      } else {
        const { error } = await register(username, displayName, password);
        if (error) { toast.error(error); return; }
        toast.success("¡Cuenta creada! Bienvenido al prode 🎉");
        router.push("/");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[100px] opacity-20"
          style={{ background: "radial-gradient(ellipse, #f0b429 0%, rgba(34,197,94,0.4) 50%, transparent 70%)" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="glass rounded-2xl border border-border p-8">
          {/* Tabs */}
          <div className="flex rounded-xl border border-border overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === "login" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn size={16} />
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                mode === "register" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus size={16} />
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <Field label="Tu nombre">
                <input
                  name="displayName"
                  type="text"
                  placeholder="Ej: Mati el crack"
                  autoComplete="name"
                  className="input-field"
                />
              </Field>
            )}

            <Field label="Usuario">
              <input
                name="username"
                type="text"
                placeholder="tu_usuario"
                autoComplete="username"
                className="input-field"
              />
            </Field>

            <Field label="Contraseña">
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="input-field pr-12 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            {mode === "register" && (
              <Field label="Repetí la contraseña">
                <input
                  name="confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="input-field"
                />
              </Field>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl font-heading font-bold text-lg bg-primary text-primary-foreground hover:bg-gold-dark disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(240,180,41,0.2)]"
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Cargando...</>
              ) : mode === "login" ? (
                "Entrar al Prode"
              ) : (
                "Crear mi cuenta"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            {mode === "login" ? (
              <>¿Primera vez? <button onClick={() => setMode("register")} className="text-primary hover:underline font-medium">Creá tu cuenta acá</button></>
            ) : (
              <>¿Ya tenés cuenta? <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">Ingresá acá</button></>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Acceso exclusivo para participantes del grupo 🏆
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
