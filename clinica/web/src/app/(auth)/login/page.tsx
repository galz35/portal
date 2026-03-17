import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, ShieldCheck, Loader2 } from "lucide-react";

import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get("error");
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    // 1. Si ya está autenticado, redirigir a su dashboard correspondiente
    if (user) {
      if (user.rol === 'PACIENTE') navigate("/paciente/dashboard");
      else if (user.rol === 'MEDICO') navigate("/medico/dashboard");
      else if (user.rol === 'ADMIN') navigate("/admin/dashboard");
      return;
    }

    // 2. DETENER BUCLE: Si hay un error en la URL o acabamos de fallar, NO redirigir automáticamente
    if (errorParam) {
      console.warn("[Portal Auth] Error detectado en URL, deteniendo redirección automática.");
      return;
    }

    // 3. Si no hay sesión y terminó de cargar la validación inicial,
    // redirigir automáticamente al Portal Central (único login aceptado por defecto)
    if (!loading && !user && !showManual) {
      console.log("[Portal Auth] Redirigiendo al servidor central de autenticación...");
      const ssoReturnUrl = `${window.location.origin}/auth/sso`;
      window.location.href = `http://localhost:5173/login-empleado?returnUrl=${encodeURIComponent(ssoReturnUrl)}`;
    }
  }, [user, loading, navigate, errorParam, showManual]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[200px] -right-[100px] w-[600px] h-[600px] bg-red-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-[200px] -left-[100px] w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 text-center"
        >
          <div className="w-16 h-16 bg-[#DA291C] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20 text-white">
            <Stethoscope size={32} />
          </div>
          
          <h1 className="text-2xl font-extrabold text-[#0F172A] mb-2 tracking-tight">Claro Salud</h1>
          <p className="text-sm font-medium text-slate-500 mb-8">Sincronizando con Portal Central de Identidad...</p>

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full text-slate-600 text-[12px] font-bold uppercase tracking-wider">
              <ShieldCheck size={16} className="text-[#DA291C]" />
              Autenticación Unificada
            </div>

            <div className="flex items-center gap-2 text-[#DA291C] font-semibold text-sm">
              <Loader2 size={20} className="animate-spin" />
              Verificando credenciales corporativas...
            </div>
          </div>

          <footer className="mt-12 text-[11px] text-slate-400 font-medium border-t border-slate-50 pt-6">
            <p>© 2026 Claro Nicaragua · Dirección de RRHH</p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
