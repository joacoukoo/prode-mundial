import type { Metadata } from "next";
import { Bebas_Neue, Barlow } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

const barlow = Barlow({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prode Mundial 2026",
  description: "El prode del Mundial 2026 entre amigos. ¿Quién la tiene más clara?",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${barlow.variable} ${bebasNeue.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#061009",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#edfff0",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
