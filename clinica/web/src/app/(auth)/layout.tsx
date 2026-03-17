import React from "react";
import { HeartPulse } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 flex items-center font-cursive text-4xl text-gray-800">
        <span className="font-bold text-primary">Clar</span>
        <HeartPulse className="relative -bottom-1 mx-[-2px] h-7 w-7 text-primary" />
        <span className="text-foreground">Mi Salud</span>
      </div>
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
