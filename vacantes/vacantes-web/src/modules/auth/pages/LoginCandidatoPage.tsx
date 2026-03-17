import { useMemo, useState, useEffect, type FormEvent } from "react";
import { loginCandidate } from "../../../shared/api/candidateApi";

function currentReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("returnUrl") ?? "/app/vacantes/mis-postulaciones";
}

import { getPortalMe, hasRhVacantes } from "../../../shared/api/coreSessionApi";

export default function LoginCandidatoPage() {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Efecto proactivo: Si ya hay una sesión de empleado, mandarlo a su sitio
  useEffect(() => {
    void getPortalMe().then((identity) => {
      if (identity && hasRhVacantes(identity)) {
        window.location.href = "/app/vacantes/rh/dashboard";
      }
    });
  }, []);

  const canSubmit = useMemo(
    () => correo.trim().length >= 5 && correo.includes("@") && clave.trim().length >= 8,
    [correo, clave],
  );

  async function submitLogin(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError("");

    const { response, data } = await loginCandidate({
      correo: correo.trim().toLowerCase(),
      clave,
    });

    if (!response.ok || !data.ok) {
      const retryText = data.retryAfterSeconds ? ` Reintenta en ${data.retryAfterSeconds} segundos.` : "";
      setError((data.message ?? "No fue posible iniciar sesion") + retryText);
      setLoading(false);
      return;
    }

    window.location.href = currentReturnUrl();
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={headerSection}>
          <span style={pillStyle}>Acceso Candidato</span>
          <h1 style={{ margin: "12px 0 0", fontSize: 32, fontWeight: 900, color: "#0f172a" }}>Hola, continúa</h1>
          <p style={textStyle}>Inicia sesión para gestionar tus postulaciones.</p>
        </div>

        <form onSubmit={submitLogin} style={{ display: "grid", gap: 16 }}>
          <div style={inputGroup}>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              placeholder="Ej: candidato@correo.com"
              style={inputStyle}
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
            />
          </div>
          
          <div style={inputGroup}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              value={clave}
              onChange={(event) => setClave(event.target.value)}
            />
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}
          
          <button type="submit" style={buttonStyle} disabled={!canSubmit || loading}>
            {loading ? "Verificando..." : "Ingresar como Candidato"}
          </button>
        </form>

        <div style={divider}>
          <span style={dividerText}>¿Eres del equipo RH?</span>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <a href="/login-empleado" style={employeeButtonStyle}>
            <i className="fa-solid fa-shield-halved" style={{ marginRight: 8 }}></i>
            Acceso con Portal Central
          </a>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
            <a href="/register" style={linkAction}>Crear cuenta</a>
            <a href="/forgot-password" style={linkAction}>Olvidé contraseña</a>
          </div>
        </div>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#F8FAFC", padding: 24, fontFamily: "'Inter', system-ui, sans-serif" };
const cardStyle: React.CSSProperties = { width: "100%", maxWidth: 440, background: "#ffffff", borderRadius: 32, padding: 48, display: "grid", gap: 24, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)", border: "1px solid #e2e8f0" };
const headerSection: React.CSSProperties = { textAlign: "center" as const };
const pillStyle: React.CSSProperties = { background: "#FEF2F2", color: "#DA291C", padding: "6px 14px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" };
const textStyle: React.CSSProperties = { margin: "8px 0 0", color: "#64748b", fontSize: 14, fontWeight: 500 };
const inputGroup: React.CSSProperties = { display: "grid", gap: 8 };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#475569" };
const inputStyle: React.CSSProperties = { background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px", fontSize: 14, outline: "none", transition: "0.2s" };
const buttonStyle: React.CSSProperties = { background: "#0f172a", color: "#ffffff", border: "none", borderRadius: 14, padding: "16px", fontWeight: 700, cursor: "pointer", transition: "0.2s" };
const employeeButtonStyle: React.CSSProperties = { background: "#ffffff", border: "1px solid #DA291C", color: "#DA291C", borderRadius: 14, padding: "16px", fontWeight: 700, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" };
const errorStyle: React.CSSProperties = { background: "#FEF2F2", border: "1px solid #FEE2E2", color: "#B91C1C", borderRadius: 14, padding: "12px", fontSize: 13, textAlign: "center", fontWeight: 600 };
const divider: React.CSSProperties = { display: "flex", alignItems: "center", margin: "8px 0" };
const dividerText: React.CSSProperties = { flex: 1, textAlign: "center" as const, color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" };
const linkAction: React.CSSProperties = { color: "#64748b", fontSize: 12, fontWeight: 600, textDecoration: "none" };
