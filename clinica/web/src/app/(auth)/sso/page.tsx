import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function SSOHandlerPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken, error: authError } = useAuth();
    const token = searchParams.get("token");
    const [status, setStatus] = useState("Sincronizando con Portal Central...");

    useEffect(() => {
        if (token) {
            loginWithToken(token).catch((err) => {
                console.error("SSO Validation Error:", err);
                setTimeout(() => navigate("/login?error=sso_failed"), 3000);
            });
        } else {
            navigate("/login");
        }
    }, [token, loginWithToken, navigate]);

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[200px] -right-[100px] w-[500px] h-[500px] bg-red-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute -bottom-[200px] -left-[100px] w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="relative z-10 w-full max-w-[400px] bg-white p-12 rounded-[32px] shadow-2xl text-center border border-slate-100">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${authError ? 'bg-red-600 text-white' : 'bg-red-50 text-[#DA291C]'}`}>
                    {authError ? <AlertCircle size={32} /> : <ShieldCheck size={32} />}
                </div>
                
                <h2 className="text-2xl font-black text-[#0F172A] mb-2 tracking-tight">
                    {authError ? 'ERROR DE AUTENTICACIÓN' : 'Sincronizando...'}
                </h2>
                
                <p className={`text-sm font-bold mb-8 ${authError ? 'text-red-600 bg-red-50 p-4 rounded-xl' : 'text-slate-500'}`}>
                    {authError || status}
                </p>

                {!authError && (
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                        <div 
                            className="absolute top-0 left-0 h-full bg-[#DA291C] rounded-full animate-pulse"
                            style={{ width: '100%' }}
                        />
                    </div>
                )}

                {authError && (
                    <button 
                        onClick={() => window.location.href = '/login'}
                        className="w-full h-12 bg-[#0F172A] text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg"
                    >
                        REINTENTAR ACCESO
                    </button>
                )}
            </div>
        </div>
    );
}
