import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SSOHandlerPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("Iniciando sesión segura...");
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setError("No se recibió un token de acceso válido.");
            return;
        }

        const handleSSO = async () => {
            try {
                setStatus("Validando credenciales con Portal Central...");
                const response = await fetch("/api/auth/sso-login", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                if (!response.ok) {
                    throw new Error("La validación del token falló.");
                }

                const data = await response.json();
                if (data.ok) {
                    setStatus("¡Acceso concedido! Preparando sistema...");
                    const user = data.user;
                    
                    // Guardar en sesión local para compatibilidad
                    localStorage.setItem('portal_identity', JSON.stringify(user));
                    
                    // Determinar a dónde redirigir
                    const permisos = user.permisos || [];
                    const isRH = permisos.includes("vacantes.rh.ver") || 
                                 permisos.includes("vacantes.rh.crear") || 
                                 permisos.includes("vacantes.rh.estado");

                    const destination = isRH ? "/app/vacantes/rh/dashboard" : "/app/vacantes/perfil";

                    // Pequeña pausa para efecto visual
                    setTimeout(() => {
                        navigate(destination);
                    }, 1500);
                } else {
                    setError(data.message || "Error en la autenticación centralizada.");
                }
            } catch (err) {
                console.error("SSO Error:", err);
                setError("No fue posible establecer la conexión segura con el Portal.");
            }
        };

        handleSSO();
    }, [token, navigate]);

    if (error) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                   <i className="fa-solid fa-circle-xmark" style={{ fontSize: 48, color: "#ef4444" }}></i>
                   <h2 style={{ margin: "16px 0 8px", color: "#0f172a" }}>Error de SSO</h2>
                   <p style={{ color: "#64748b", fontSize: 14 }}>{error}</p>
                   <button 
                        onClick={() => navigate("/login")}
                        style={buttonStyle}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={spinnerStyle}></div>
                <h2 style={{ margin: "16px 0 8px", color: "#0f172a" }}>Portal Central</h2>
                <p style={{ color: "#DA291C", fontWeight: 700, fontSize: 13, letterSpacing: "1px" }}>{status.toUpperCase()}</p>
            </div>
        </div>
    );
}

const containerStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    fontFamily: "'Inter', sans-serif"
};

const cardStyle: React.CSSProperties = {
    background: "#fff",
    padding: 48,
    borderRadius: 32,
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: 400,
    width: "90%",
    border: "1px solid #e2e8f0"
};

const spinnerStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #DA291C",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto"
};

const buttonStyle: React.CSSProperties = {
    marginTop: 24,
    background: "#0f172a",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: 12,
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
};
