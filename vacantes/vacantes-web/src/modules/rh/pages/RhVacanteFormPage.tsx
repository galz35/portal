import { useState, type CSSProperties } from "react";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import { crearVacanteRh } from "../../../shared/api/vacantesApi";
import { getPortalMe } from "../../../shared/api/coreSessionApi";
import RhShell, { panelStyle } from "../components/RhShell";

const LOCATIONS = [
  "Managua", "León", "Chinandega", "Masaya", "Granada", "Carazo", "Rivas", 
  "Chontales", "Boaco", "Matagalpa", "Jinotega", "Estelí", "Madriz", 
  "Nueva Segovia", "Río San Juan", "Zelaya Central", "RAAN", "RAAS"
];

const RECRUITERS = [
  { v: "100", l: "Yesenia Manzares (Coordinadora)" },
  { v: "25", l: "Gustavo Lira (Yo / Kevin)" }, // 25 is the user's current ID
  { v: "101", l: "Kevin Barahona" },
  { v: "102", l: "Francis Villarreal" },
  { v: "103", l: "Arlen Riveras" }
];

export default function RhVacanteFormPage() {
  const [form, setForm] = useState({
    titulo: "",
    codigoVacante: "",
    idPuesto: "",
    idRequisicion: "",
    codigoPais: "NI",
    modalidad: "PRESENCIAL",
    area: "",
    departamento: "",
    gerencia: "",
    prioridad: "MEDIA",
    fechaLimiteRegularizacion: "",
    esExcepcion: "NO",
    descripcion: "",
    requisitos: "",
    motivoExcepcion: "",
    ubicacion: "Managua",
    idResponsableRh: "25", // Default to current user
  });
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(publicar: boolean) {
    setLoading(true);
    setStatus("Guardando...");
    const identity = await getPortalMe();
    if (!identity?.idCuentaPortal) {
      setStatus("No hay sesión RH activa");
      setLoading(false);
      return;
    }

    const result = await crearVacanteRh({
      codigo_vacante: form.codigoVacante || `VAC-${Date.now()}`,
      titulo: form.titulo,
      descripcion: form.descripcion,
      requisitos: form.requisitos || undefined,
      area: form.area || undefined,
      gerencia: form.gerencia || undefined,
      departamento: form.departamento || undefined,
      tipo_vacante: "FIJO",
      modalidad: form.modalidad || undefined,
      ubicacion: form.ubicacion,
      codigo_pais: form.codigoPais,
      nivel_experiencia: undefined,
      acepta_internos: true,
      es_publica: publicar,
      cantidad_plazas: 1,
      prioridad: form.prioridad || undefined,
      id_solicitante: undefined,
      id_responsable_rh: Number(form.idResponsableRh),
      id_requisicion_personal: form.idRequisicion ? Number(form.idRequisicion) : undefined,
      id_descriptor_puesto: undefined,
      es_excepcion_sin_requisicion: form.esExcepcion === "SI",
      motivo_excepcion: form.motivoExcepcion || undefined,
      fecha_limite_regularizacion: form.fechaLimiteRegularizacion || undefined,
    });

    setStatus(result?.ok ? `Vacante creada: ${result.idVacante}` : "No se pudo crear la vacante");
    setLoading(false);
  }

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="Operaciones de Talento"
        title="Nueva vacante empresarial"
        description="Configuración de posiciones oficiales y procesos de selección por excepción."
        actions={<a href="/app/vacantes/rh/vacantes" style={ghostButtonStyle}><i className="fa-solid fa-list-ul"></i> Ver listado</a>}
      >
        <div style={formGridStyle}>
          <div style={{ display: "grid", gap: 24 }}>
            {/* SECCIÓN 1: DATOS CORE */}
            <section style={panelStyle}>
              <header style={sectionHeaderStyle}>
                <div style={sectionIconStyle}><i className="fa-solid fa-briefcase"></i></div>
                <h2 style={sectionTitleStyle}>Información del Puesto</h2>
              </header>
              <div style={gridRowsStyle}>
                <FormField label="Título de la vacante" placeholder="Ej: Analista de Redes Senior" value={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />
                <div style={gridColsStyle}>
                  <FormField label="Código Vacante (ERP)" placeholder="VAC-000" value={form.codigoVacante} onChange={(v) => setForm({ ...form, codigoVacante: v })} />
                  <FormField label="ID Puesto HCM" placeholder="IDH-000" value={form.idPuesto} onChange={(v) => setForm({ ...form, idPuesto: v })} />
                </div>
              </div>
            </section>

            {/* SECCIÓN 2: UBICACIÓN Y UNIDAD */}
            <section style={panelStyle}>
              <header style={sectionHeaderStyle}>
                <div style={sectionIconStyle}><i className="fa-solid fa-sitemap"></i></div>
                <h2 style={sectionTitleStyle}>Estructura Organizativa</h2>
              </header>
              <div style={gridRowsStyle}>
                <div style={gridColsStyle}>
                  <FormField label="Gerencia" placeholder="Ej: Tecnología" value={form.gerencia} onChange={(v) => setForm({ ...form, gerencia: v })} />
                  <FormField label="Departamento" placeholder="Ej: Infraestructura" value={form.departamento} onChange={(v) => setForm({ ...form, departamento: v })} />
                  <FormSelect 
                    label="Responsable RH" 
                    value={form.idResponsableRh} 
                    options={RECRUITERS} 
                    onChange={(v) => setForm({ ...form, idResponsableRh: v })} 
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                  <FormSelect 
                    label="Ubicación" 
                    value={form.ubicacion} 
                    options={LOCATIONS} 
                    onChange={(v) => setForm({ ...form, ubicacion: v })} 
                  />
                  <FormSelect 
                    label="Modalidad" 
                    value={form.modalidad} 
                    options={["PRESENCIAL", "HIBRIDA", "REMOTO"]} 
                    onChange={(v) => setForm({ ...form, modalidad: v })} 
                  />
                  <FormSelect 
                    label="Prioridad" 
                    value={form.prioridad} 
                    options={["BAJA", "MEDIA", "ALTA", "CRITICA"]} 
                    onChange={(v) => setForm({ ...form, prioridad: v })} 
                  />
                </div>
              </div>
            </section>

            {/* SECCIÓN 3: CONTENIDO */}
            <section style={panelStyle}>
              <header style={sectionHeaderStyle}>
                <div style={sectionIconStyle}><i className="fa-solid fa-file-lines"></i></div>
                <h2 style={sectionTitleStyle}>Descripción y Requisitos</h2>
              </header>
              <div style={gridRowsStyle}>
                <FormTextarea label="Descripción general" placeholder="Describe las responsabilidades principales..." value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} />
                <FormTextarea label="Requisitos y competencias" placeholder="Habilidades técnicas y experiencia requerida..." value={form.requisitos} onChange={(v) => setForm({ ...form, requisitos: v })} />
              </div>
            </section>
          </div>

          <aside style={{ display: "grid", gap: 24, alignContent: "start" }}>
            {/* ASIDE: REQUISICIÓN Y EXCEPCIONES */}
            <section style={panelStyle}>
              <header style={sectionHeaderStyle}>
                <div style={sectionIconStyle}><i className="fa-solid fa-shield-halved"></i></div>
                <h2 style={sectionTitleStyle}>Controles RH</h2>
              </header>
              <div style={gridRowsStyle}>
                <FormField label="ID Requisición Aprobada" placeholder="REQ-000" value={form.idRequisicion} onChange={(v) => setForm({ ...form, idRequisicion: v })} />
                
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                  <FormSelect 
                    label="¿Es publicación por excepción?" 
                    value={form.esExcepcion} 
                    options={[{ label: "No (Normal)", value: "NO" }, { label: "Sí (Especial)", value: "SI" }]} 
                    onChange={(v) => setForm({ ...form, esExcepcion: v })} 
                  />
                </div>

                {form.esExcepcion === "SI" && (
                  <div style={expectionBoxStyle}>
                    <FormField label="Fecha límite regularización" type="date" value={form.fechaLimiteRegularizacion} onChange={(v) => setForm({ ...form, fechaLimiteRegularizacion: v })} />
                    <FormTextarea label="Motivo de excepción" value={form.motivoExcepcion} onChange={(v) => setForm({ ...form, motivoExcepcion: v })} />
                  </div>
                )}
              </div>
            </section>

            {/* ACCIONES */}
            <section style={actionsPanelStyle}>
              <button disabled={loading} onClick={() => void handleSubmit(true)} style={btnPrimaryStyle}>
                {loading ? "PROCESANDO..." : "PUBLICAR OFERTA"}
              </button>
              <button disabled={loading} onClick={() => void handleSubmit(false)} style={btnSecondaryStyle}>
                GUARDAR COMO BORRADOR
              </button>
              {status && <div style={statusBarStyle}>{status}</div>}
            </section>
          </aside>
        </div>
      </RhShell>
    </PermisoGuard>
  );
}

function FormField({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void, type?: string }) {
  return (
    <div style={fieldGroupStyle}>
      <label style={fieldLabelStyle}>{label}</label>
      <input type={type} style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function FormSelect({ label, value, options, onChange }: { label: string; value: string; options: any[]; onChange: (v: string) => void }) {
  return (
    <div style={fieldGroupStyle}>
      <label style={fieldLabelStyle}>{label}</label>
      <select style={inputStyle} value={value} onChange={e => onChange(e.target.value)}>
        {options.map((o) => (
          typeof o === 'string' 
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function FormTextarea({ label, placeholder, value, onChange }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={fieldGroupStyle}>
      <label style={fieldLabelStyle}>{label}</label>
      <textarea style={textareaStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

const formGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 };
const sectionHeaderStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 16, marginBottom: 32 };
const sectionIconStyle: CSSProperties = { width: 48, height: 48, background: "rgba(218, 41, 28, 0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#DA291C", fontSize: 20 };
const sectionTitleStyle: CSSProperties = { margin: 0, fontSize: 18, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" };
const gridRowsStyle: CSSProperties = { display: "grid", gap: 24 };
const gridColsStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };
const fieldGroupStyle: CSSProperties = { display: "grid", gap: 8 };
const fieldLabelStyle: CSSProperties = { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputStyle: CSSProperties = { width: "100%", height: 50, borderRadius: "14px", border: "1px solid #e2e8f0", padding: "0 16px", fontSize: 14, fontWeight: 600, transition: "all 0.2s" };
const textareaStyle: CSSProperties = { width: "100%", minHeight: 120, borderRadius: "14px", border: "1px solid #e2e8f0", padding: "16px", fontSize: 14, fontWeight: 600, resize: "none" };
const expectionBoxStyle: CSSProperties = { background: "#fffefe", padding: 24, borderRadius: "20px", border: "1px dashed #DA291C", display: "grid", gap: 20, marginTop: 12 };
const actionsPanelStyle: CSSProperties = { display: "grid", gap: 16 };
const statusBarStyle: CSSProperties = { padding: "16px", background: "#f8fafc", borderRadius: "14px", fontSize: 13, fontWeight: 700, color: "#475569", textAlign: "center", border: "1px solid #f1f5f9" };

const btnPrimaryStyle: CSSProperties = { background: "#DA291C", color: "#fff", border: "none", height: 56, borderRadius: "16px", fontWeight: 900, fontSize: 14, cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(218, 41, 28, 0.2)", transition: "all 0.2s" };
const btnSecondaryStyle: CSSProperties = { background: "#0f172a", color: "#fff", border: "none", height: 56, borderRadius: "16px", fontWeight: 900, fontSize: 14, cursor: "pointer", transition: "all 0.2s" };
const ghostButtonStyle: CSSProperties = { textDecoration: "none", background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", height: 42, padding: "0 20px", borderRadius: "12px", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 8 };
