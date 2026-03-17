import { startTransition, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";

import { getCandidateCurrentCv, getCandidateMe, updateCandidateProfile } from "../../../shared/api/candidateApi";
import { CATEGORIAS_PRESET, NICARAGUA_DIVISIONES } from "../../publico/lib/vacantesCatalogo";

const MODALIDADES = ["PRESENCIAL", "REMOTA", "HIBRIDA"] as const;
const NIVELES_ACADEMICOS = [
  "Secundaria",
  "Tecnico",
  "Universitario en curso",
  "Universitario graduado",
  "Postgrado",
] as const;

export default function MiPerfilPage() {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    departamento_residencia: "",
    municipio_residencia: "",
    categoria_interes: "",
    modalidad_preferida: "",
    nivel_academico: "",
    linkedin_url: "",
    resumen_profesional: "",
    disponibilidad_viajar: false,
    disponibilidad_horario_rotativo: false,
    tiene_licencia_conducir: false,
    tipo_licencia: "",
    tiene_vehiculo_propio: false,
  });
  const [status, setStatus] = useState("");
  const [hasCv, setHasCv] = useState(false);

  useEffect(() => {
    void Promise.all([getCandidateMe(), getCandidateCurrentCv()]).then(([profile, currentCv]) => {
      if (profile) {
        setForm({
          nombres: profile.nombres ?? "",
          apellidos: profile.apellidos ?? "",
          correo: profile.correo ?? "",
          telefono: profile.telefono ?? "",
          departamento_residencia: profile.departamento_residencia ?? "",
          municipio_residencia: profile.municipio_residencia ?? "",
          categoria_interes: profile.categoria_interes ?? "",
          modalidad_preferida: profile.modalidad_preferida ?? "",
          nivel_academico: profile.nivel_academico ?? "",
          linkedin_url: profile.linkedin_url ?? "",
          resumen_profesional: profile.resumen_profesional ?? "",
          disponibilidad_viajar: Boolean(profile.disponibilidad_viajar),
          disponibilidad_horario_rotativo: Boolean(profile.disponibilidad_horario_rotativo),
          tiene_licencia_conducir: Boolean(profile.tiene_licencia_conducir),
          tipo_licencia: profile.tipo_licencia ?? "",
          tiene_vehiculo_propio: Boolean(profile.tiene_vehiculo_propio),
        });
      }
      setHasCv(Boolean(currentCv.archivo));
    });
  }, []);

  const completion = useMemo(() => {
    const checks = [
      form.nombres.trim(),
      form.apellidos.trim(),
      form.telefono.trim(),
      form.departamento_residencia.trim(),
      form.categoria_interes.trim(),
      form.resumen_profesional.trim(),
      form.nivel_academico.trim(),
      hasCv ? "cv" : "",
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [form, hasCv]);

  async function saveProfile() {
    setStatus("Guardando perfil...");
    const { response, data } = await updateCandidateProfile({
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      telefono: form.telefono.trim() || undefined,
      departamento_residencia: form.departamento_residencia || undefined,
      municipio_residencia: form.municipio_residencia.trim() || undefined,
      categoria_interes: form.categoria_interes || undefined,
      modalidad_preferida: form.modalidad_preferida || undefined,
      nivel_academico: form.nivel_academico || undefined,
      linkedin_url: form.linkedin_url.trim() || undefined,
      resumen_profesional: form.resumen_profesional.trim() || undefined,
      disponibilidad_viajar: form.disponibilidad_viajar,
      disponibilidad_horario_rotativo: form.disponibilidad_horario_rotativo,
      tiene_licencia_conducir: form.tiene_licencia_conducir,
      tipo_licencia: form.tiene_licencia_conducir ? (form.tipo_licencia.trim() || undefined) : undefined,
      tiene_vehiculo_propio: form.tiene_vehiculo_propio,
    });
    setStatus(response.ok && data.ok ? "Perfil actualizado" : (data.message ?? "No fue posible guardar el perfil"));
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    startTransition(() => {
      setForm((current) => ({ ...current, [key]: value }));
    });
  }

  return (
    <div style={dashboardContainerStyle}>
      <div style={welcomeBannerStyle}>
        <div style={welcomeIconStyle}><i className="fa-solid fa-user-circle"></i></div>
        <div style={{ flex: 1 }}>
          <h2 style={welcomeTitleStyle}>Hola, {form.nombres || "Candidato"}</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
            Tu perfil comercial tiene un <strong>{completion}%</strong> de progreso.
          </p>
        </div>
        <div style={completionBadgeStyle}>{completion}%</div>
      </div>

      <main style={dashboardContentStyle}>
        <div style={formWrapperStyle}>
          <section style={cardStyle}>
            <h3 style={sectionTitleStyle}>Datos Personales</h3>
            <div style={formGridStyle}>
              <Field label="Nombres"><input style={formControlStyle} value={form.nombres} onChange={(e) => updateField("nombres", e.target.value)} /></Field>
              <Field label="Apellidos"><input style={formControlStyle} value={form.apellidos} onChange={(e) => updateField("apellidos", e.target.value)} /></Field>
              <Field label="Teléfono"><input style={formControlStyle} value={form.telefono} onChange={(e) => updateField("telefono", e.target.value)} /></Field>
              <Field label="Correo"><input style={{ ...formControlStyle, background: '#f8fafc', color: '#94a3b8' }} value={form.correo} readOnly /></Field>
            </div>
          </section>

          <section style={{ ...cardStyle, marginTop: '30px' }}>
            <h3 style={sectionTitleStyle}>Intereses y Residencia</h3>
            <div style={formGridStyle}>
              <Field label="Departamento">
                <select style={formControlStyle} value={form.departamento_residencia} onChange={(e) => updateField("departamento_residencia", e.target.value)}>
                  <option value="">Selecciona</option>
                  {NICARAGUA_DIVISIONES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Categoría de Interés">
                <select style={formControlStyle} value={form.categoria_interes} onChange={(e) => updateField("categoria_interes", e.target.value)}>
                  <option value="">Selecciona</option>
                  {CATEGORIAS_PRESET.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Nivel Académico">
                 <select style={formControlStyle} value={form.nivel_academico} onChange={(e) => updateField("nivel_academico", e.target.value)}>
                  <option value="">Selecciona</option>
                  {NIVELES_ACADEMICOS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Modalidad Preferida">
                 <select style={formControlStyle} value={form.modalidad_preferida} onChange={(e) => updateField("modalidad_preferida", e.target.value)}>
                  <option value="">Cualquiera</option>
                  {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
            </div>
          </section>

          <section style={{ ...cardStyle, marginTop: '30px' }}>
            <h3 style={sectionTitleStyle}>Movilidad y Operación</h3>
            <div style={toggleGridStyle}>
              <ToggleCard label="Viajar" checked={form.disponibilidad_viajar} onChange={v => updateField("disponibilidad_viajar", v)} />
              <ToggleCard label="Rotativo" checked={form.disponibilidad_horario_rotativo} onChange={v => updateField("disponibilidad_horario_rotativo", v)} />
              <ToggleCard label="Licencia" checked={form.tiene_licencia_conducir} onChange={v => updateField("tiene_licencia_conducir", v)} />
              <ToggleCard label="Vehículo" checked={form.tiene_vehiculo_propio} onChange={v => updateField("tiene_vehiculo_propio", v)} />
            </div>
          </section>

          <div style={actionsBarStyle}>
            <button style={btnSaveStyle} onClick={() => void saveProfile()}>
              GUARDAR CAMBIOS
            </button>
            {status && <span style={statusTextStyle}>{status}</span>}
          </div>
        </div>

        <aside style={sidebarStyle}>
          <div style={cardStyle}>
            <h4 style={sidebarTitleStyle}>CV ACTUAL</h4>
            <div style={cvStatusBoxStyle}>
              <i className={`fa-solid ${hasCv ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ color: hasCv ? '#059669' : '#DA291C' }}></i>
              <span style={{ fontWeight: 700 }}>{hasCv ? 'CURRÍCULUM ACTIVO' : 'SIN CURRÍCULUM'}</span>
            </div>
            <Link to="/app/vacantes/cv" style={btnCvLinkStyle}>
              {hasCv ? 'ACTUALIZAR CV' : 'SUBIR CV AHORA'}
            </Link>
          </div>

          <div style={{ ...cardStyle, marginTop: '20px', background: '#f8fafc' }}>
            <h4 style={sidebarTitleStyle}>TIPS CLARO</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Completa tu <strong>Resumen Profesional</strong> para aumentar tus posibilidades de ser contactado.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={fieldGroupStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function ToggleCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ ...toggleBtnStyle, background: checked ? '#1e293b' : '#f8fafc', color: checked ? '#fff' : '#1e293b' }}>
      <span style={{ fontSize: '12px', fontWeight: 700 }}>{label}</span>
      <i className={`fa-solid ${checked ? 'fa-check' : 'fa-xmark'}`}></i>
    </button>
  );
}

/* ---------- STYLES ---------- */

const dashboardContainerStyle: CSSProperties = { maxWidth: 1100, margin: "40px auto", padding: "0 20px" };
const welcomeBannerStyle: CSSProperties = { background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", padding: "30px 40px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px", color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" };
const welcomeIconStyle: CSSProperties = { width: "56px", height: "56px", background: "rgba(218, 41, 28, 0.15)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#DA291C", fontSize: "24px" };
const welcomeTitleStyle: CSSProperties = { margin: 0, fontSize: "22px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" };
const completionBadgeStyle: CSSProperties = { background: "#DA291C", padding: "8px 16px", borderRadius: "30px", fontSize: "14px", fontWeight: 900, boxShadow: "0 4px 10px rgba(218,218,218,0.2)" };

const dashboardContentStyle: CSSProperties = { display: "flex", gap: "30px", alignItems: "flex-start" };
const formWrapperStyle: CSSProperties = { flex: 2 };
const sidebarStyle: CSSProperties = { flex: 1, position: 'sticky', top: '100px' };

const cardStyle: CSSProperties = { background: "#fff", padding: "35px", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" };
const sectionTitleStyle: CSSProperties = { fontSize: "14px", fontWeight: 900, textTransform: "uppercase", color: "#1a1a1a", marginBottom: "30px", paddingBottom: "12px", borderBottom: "2px solid #DA291C", width: 'fit-content' };
const formGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const fieldGroupStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: "8px" };
const labelStyle: CSSProperties = { fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: 'uppercase' };
const formControlStyle: CSSProperties = { padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", background: "#f8fafc", outline: 'none' };

const toggleGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" };
const toggleBtnStyle: CSSProperties = { border: "1px solid #e2e8f0", padding: "15px", borderRadius: "10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" };

const actionsBarStyle: CSSProperties = { marginTop: "40px", display: 'flex', alignItems: 'center', gap: '20px' };
const btnSaveStyle: CSSProperties = { padding: "18px 40px", background: "#DA291C", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 900, fontSize: "14px", cursor: "pointer", boxShadow: "0 10px 25px rgba(218, 41, 28, 0.2)" };
const statusTextStyle: CSSProperties = { fontSize: '14px', fontWeight: 700, color: '#059669' };

const sidebarTitleStyle: CSSProperties = { fontSize: "12px", fontWeight: 900, color: "#94a3b8", marginBottom: "20px", textTransform: 'uppercase' };
const cvStatusBoxStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', marginBottom: '25px' };
const btnCvLinkStyle: CSSProperties = { display: 'block', textAlign: 'center', padding: '14px', background: '#1e293b', color: '#fff', textDecoration: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 900 };
