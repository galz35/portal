import type { Metadata } from "next";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";
import { Inter, Dancing_Script } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script" });

export const metadata: Metadata = {
  title: "Clar❤ Mi Salud",
  description: "Sistema de Salud Corporativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${dancingScript.variable}`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
