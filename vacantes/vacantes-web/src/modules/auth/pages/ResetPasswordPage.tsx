import { useEffect, useState } from "react";
import { verificarTokenPassword, completarRecuperacionPassword } from "../../../shared/api/vacantesApi";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [valid, setValid] = useState<boolean | null>(null); // null means checking
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      void verificarTokenPassword(t).then(res => setValid(res.ok));
    } else {
      setValid(false);
    }
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (nuevaClave !== confirmarClave) {
      setStatus({ type: "error", msg: "Las contraseñas no coinciden" });
      return;
    }
    if (nuevaClave.length < 8) {
      setStatus({ type: "error", msg: "La contraseña debe tener al menos 8 caracteres" });
      return;
    }

    setLoading(true);
    try {
      const res = await completarRecuperacionPassword(token, nuevaClave);
      if (res.ok) {
        setStatus({ type: "success", msg: "Contraseña actualizada. Redirigiendo..." });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setStatus({ type: "error", msg: res.message || "Error al actualizar contraseña" });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Error de red" });
    } finally {
      setLoading(false);
    }
  }

  if (valid === null) {
    return <div style={pageStyle}>Verificando link...</div>;
  }

  if (valid === false) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 40, color: "#DA291C" }}></i>
          <h2 style={{ margin: 0 }}>Link inválido</h2>
          <p style={{ margin: 0, color: "#57534e" }}>Este link de recuperación no es válido o ya ha expirado.</p>
          <a href="/forgot-password" style={buttonStyle}>SOLICITAR NUEVO LINK</a>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#111" }}>Nueva contraseña</h1>
        <p style={{ margin: 0, color: "#57534e", fontSize: 14 }}>Establece tu nueva clave de acceso para continuar.</p>

        <form onSubmit={handleReset} style={{ display: "grid", gap: 16 }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Nueva contraseña</label>
            <input
              type="password"
              style={inputStyle}
              required
              value={nuevaClave}
              onChange={(e) => setNuevaClave(e.target.value)}
            />
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Confirmar nueva contraseña</label>
            <input
              type="password"
              style={inputStyle}
              required
              value={confirmarClave}
              onChange={(e) => setConfirmarClave(e.target.value)}
            />
          </div>

          {status.msg && (
            <div style={{ 
                padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: status.type === "success" ? "#f0fdf4" : "#fef2f2",
                color: status.type === "success" ? "#10b981" : "#DA291C",
                border: `1px solid ${status.type === "success" ? "#dcfce7" : "#fee2e2"}`
            }}>
                {status.msg}
            </div>
          )}

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "ACTUALIZANDO..." : "CAMBIAR CONTRASEÑA"}
          </button>
        </form>
      </section>
    </main>
  );
}

const pageStyle = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#fff7f7", padding: 24, fontFamily: "Segoe UI, sans-serif" };
const cardStyle = { width: "100%", maxWidth: 440, background: "#fff", border: "1px solid #fecaca", borderRadius: 24, padding: 32, display: "grid", gap: 20, textAlign: "center" as const, boxShadow: "0 20px 50px rgba(0,0,0,0.05)" };
const fieldGroupStyle = { textAlign: "left" as const, display: "grid", gap: 6 };
const labelStyle = { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" as const };
const inputStyle = { width: "100%", height: 50, borderRadius: 14, border: "1px solid #d6d3d1", padding: "0 16px", fontSize: 15, outline: "none" };
const buttonStyle = { textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", height: 52, background: "#DA291C", color: "#fff", border: "none", borderRadius: 14, fontWeight: 900, cursor: "pointer", fontSize: 13 };
