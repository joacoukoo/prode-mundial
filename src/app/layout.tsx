import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prode Mundial 2026",
  description: "El prode del Mundial 2026 entre amigos. ¿Quién la tiene más clara?",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#0d1628",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#f0f4ff",
            },
          }}
        />
      </body>
    </html>
  );
}
