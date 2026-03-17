import { useState } from "react";
import { solicitarRecuperacionPassword } from "../../../shared/api/vacantesApi";

export default function ForgotPasswordPage() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!correo || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await solicitarRecuperacionPassword(correo);
      if (res.ok) {
        setSent(true);
      } else {
        setError(res.message || "Error al solicitar recuperacion");
      }
    } catch (err) {
      setError("Error de conexion con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#111" }}>Recuperar acceso</h1>
        <p style={{ margin: 0, color: "#57534e", fontSize: 14, lineHeight: 1.6 }}>
          Ingresa tu correo electrónico registrado y te enviaremos un link para restablecer tu contraseña.
        </p>

        {!sent ? (
          <form onSubmit={handleRequest} style={{ display: "grid", gap: 16 }}>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              required
              style={inputStyle}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            {error && <div style={errorStyle}>{error}</div>}
            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "PROCESANDO..." : "ENVIAR LINK DE RECUPERACIÓN"}
            </button>
          </form>
        ) : (
          <div style={successBoxStyle}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: 40, color: "#10b981", marginBottom: 12 }}></i>
            <p style={{ margin: 0, fontWeight: 700 }}>¡Correo enviado!</p>
            <p style={{ margin: 0, fontSize: 13, color: "#57534e", marginTop: 4 }}>
              Revisa tu bandeja de entrada (y spam) para continuar con el proceso.
            </p>
          </div>
        )}

        <div style={{ textAlign: "center", borderTop: "1px solid #fee2e2", paddingTop: 16, marginTop: 8 }}>
          <a href="/login" style={{ fontSize: 13, color: "#b91c1c", fontWeight: 700, textDecoration: "none" }}>
            <i className="fa-solid fa-arrow-left"></i> Volver al inicio de sesión
          </a>
        </div>
      </section>
    </main>
  );
}

const pageStyle = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#fff7f7", padding: 24, fontFamily: "Segoe UI, sans-serif" };
const cardStyle = { width: "100%", maxWidth: 440, background: "#fff", border: "1px solid #fecaca", borderRadius: 24, padding: 32, display: "grid", gap: 20, boxShadow: "0 20px 50px rgba(0,0,0,0.05)" };
const inputStyle = { width: "100%", height: 52, borderRadius: 14, border: "1px solid #d6d3d1", padding: "0 16px", fontSize: 15, outline: "none" };
const buttonStyle = { height: 52, background: "#DA291C", color: "#fff", border: "none", borderRadius: 14, fontWeight: 900, cursor: "pointer", fontSize: 13, letterSpacing: "0.5px" };
const errorStyle = { color: "#DA291C", background: "#fef2f2", padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 700, border: "1px solid #fee2e2" };
const successBoxStyle = { textAlign: "center" as const, background: "#f0fdf4", padding: 24, borderRadius: 16, border: "1px solid #dcfce7" };
