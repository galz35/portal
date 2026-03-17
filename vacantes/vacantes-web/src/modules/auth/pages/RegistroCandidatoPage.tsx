import type { CSSProperties } from "react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { registerCandidate } from "../../../shared/api/candidateApi";

function currentReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("returnUrl") ?? "/app/vacantes/perfil";
}

export default function RegistroCandidatoPage() {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    clave: "",
    nacionalidad: "NI",
    genero: "M",
    nacimiento: { dia: "01", mes: "01", anio: "1995" },
    ubicacion: { pais: "NI", estado: "", municipio: "", direccion: "" },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    const { response, data } = await registerCandidate({
      correo: form.correo.trim().toLowerCase(),
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      telefono: form.telefono.trim() || undefined,
      clave: form.clave,
    });

    if (!response.ok || !data.ok) {
      setError(data.message ?? "No fue posible crear la cuenta");
      setLoading(false);
      return;
    }

    window.location.href = currentReturnUrl();
  }

  return (
    <div style={pageContainerStyle}>
      <header style={authHeaderStyle}>
        <h1 style={authTitleStyle}>Regístrate Gratis</h1>
        <p style={authSubtitleStyle}>
          ¿Ya tienes una cuenta? <Link to="/login" style={linkRedStyle}>Haz clic aquí para ingresar</Link>
        </p>
      </header>

      <form onSubmit={submit} style={formContainerStyle}>
        {/* SECCIÓN 1: DATOS DE LA CUENTA */}
        <section style={formSectionStyle}>
          <h2 style={sectionTitleStyle}>Datos de la cuenta</h2>
          <div style={requiredNoteStyle}>* Campo requerido</div>

          <div style={formRowStyle}>
            <div style={{ ...formGroupStyle, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Correo Electrónico <span style={{ color: '#DA291C' }}>*</span></label>
              <input 
                type="email" 
                required 
                style={formControlStyle} 
                placeholder="ejemplo@correo.com"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
            </div>

            <div style={{ ...formGroupStyle, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Contraseña <span style={{ color: '#DA291C' }}>*</span></label>
              <div style={passwordWrapperStyle}>
                <input 
                  type={showPass ? "text" : "password"} 
                  required 
                  style={formControlStyle} 
                  placeholder="Crea una contraseña segura"
                  value={form.clave}
                  onChange={(e) => setForm({ ...form, clave: e.target.value })}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  style={togglePasswordStyle}
                >
                  <i className={`fa-regular ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <p style={helpTextStyle}>Mínimo 8 caracteres, incluye una mayúscula, un número y un especial.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: DATOS GENERALES */}
        <section style={formSectionStyle}>
          <h2 style={sectionTitleStyle}>Datos Generales</h2>
          
          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Nombres <span style={{ color: '#DA291C' }}>*</span></label>
              <input 
                type="text" 
                required 
                style={formControlStyle} 
                placeholder="Tus nombres"
                value={form.nombres}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Apellidos <span style={{ color: '#DA291C' }}>*</span></label>
              <input 
                type="text" 
                required 
                style={formControlStyle} 
                placeholder="Tus apellidos"
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
              />
            </div>
          </div>

          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Nacionalidad <span style={{ color: '#DA291C' }}>*</span></label>
              <select style={formControlStyle} value={form.nacionalidad} onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })}>
                <option value="NI">Nicaragua</option>
                <option value="CR">Costa Rica</option>
                <option value="SV">El Salvador</option>
                <option value="GT">Guatemala</option>
              </select>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Género <span style={{ color: '#DA291C' }}>*</span></label>
              <div style={radioGroupStyle}>
                <label style={radioItemStyle}>
                  <input type="radio" name="genero" value="F" checked={form.genero === "F"} onChange={() => setForm({ ...form, genero: "F" })} /> Femenino
                </label>
                <label style={radioItemStyle}>
                  <input type="radio" name="genero" value="M" checked={form.genero === "M"} onChange={() => setForm({ ...form, genero: "M" })} /> Masculino
                </label>
              </div>
            </div>
          </div>
        </section>

        {error && <div style={errorBannerStyle}>{error}</div>}

        <section style={{ textAlign: 'center', marginBottom: 40 }}>
           <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '25px' }}>
             Al hacer clic en Registrarme aceptas las <Link to="/terminos" style={linkRedStyle}>condiciones de uso</Link> de Claro Empleos.
           </p>
           <button type="submit" disabled={loading} style={btnSubmitStyle}>
             {loading ? "Procesando..." : "Registrarme"}
           </button>
        </section>
      </form>
    </div>
  );
}

/* ---------- STYLES ---------- */

const pageContainerStyle: CSSProperties = {
  maxWidth: 800,
  margin: "60px auto 100px",
  padding: "0 20px",
};

const authHeaderStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: "40px",
};

const authTitleStyle: CSSProperties = {
  fontSize: "36px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "-1px",
  color: "#1a1a1a",
  marginBottom: "10px",
};

const authSubtitleStyle: CSSProperties = {
  fontSize: "15px",
  color: "#64748b",
};

const linkRedStyle: CSSProperties = {
  color: "#DA291C",
  fontWeight: 800,
  textDecoration: "none",
};

const formContainerStyle: CSSProperties = {
  display: "grid",
  gap: "30px",
};

const formSectionStyle: CSSProperties = {
  background: "#ffffff",
  padding: "40px",
  borderRadius: "16px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.05)",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "14px",
  fontWeight: 900,
  textTransform: "uppercase",
  color: "#1a1a1a",
  marginBottom: "25px",
  paddingBottom: "15px",
  borderBottom: "1px solid #f1f5f9",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const requiredNoteStyle: CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  textAlign: "right",
  marginTop: "-50px",
  marginBottom: "25px",
  textTransform: "uppercase",
  fontWeight: 700,
};

const formRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginBottom: "15px",
};

const formGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#334155",
};

const formControlStyle: CSSProperties = {
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "15px",
  background: "#f8fafc",
  transition: "all 0.2s",
  outline: "none",
};

const passwordWrapperStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const togglePasswordStyle: CSSProperties = {
  position: "absolute",
  right: "15px",
  background: "none",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
  fontSize: "16px",
};

const helpTextStyle: CSSProperties = {
  fontSize: "11px",
  color: "#64748b",
  marginTop: "6px",
  lineHeight: "1.4",
};

const radioGroupStyle: CSSProperties = {
  display: "flex",
  gap: "20px",
  padding: "12px 0",
};

const radioItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#475569",
  cursor: "pointer",
};

const btnSubmitStyle: CSSProperties = {
  width: "100%",
  padding: "18px",
  background: "#DA291C",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  fontWeight: 900,
  fontSize: "16px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  cursor: "pointer",
  boxShadow: "0 10px 30px rgba(218, 41, 28, 0.3)",
  transition: "all 0.3s ease",
};

const errorBannerStyle: CSSProperties = {
  padding: "15px",
  backgroundColor: "#fff1f0",
  border: "1px solid #ffa39e",
  color: "#cf1322",
  borderRadius: "10px",
  fontSize: "14px",
  textAlign: "center",
  fontWeight: 600,
};
