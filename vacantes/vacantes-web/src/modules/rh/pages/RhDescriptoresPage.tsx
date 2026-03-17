import { useEffect, useState, type FormEvent, type CSSProperties } from "react";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import {
  crearDescriptorRh,
  listarDescriptoresRh,
  type DescriptorPuestoRh,
} from "../../../shared/api/vacantesApi";
import RhShell, { panelStyle } from "../components/RhShell";
import RhStatusBadge from "../components/RhStatusBadge";

export default function RhDescriptoresPage() {
  const [items, setItems] = useState<DescriptorPuestoRh[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id_puesto: "6001001",
    titulo_puesto: "Ejecutivo de ventas empresariales",
    version_descriptor: "1",
    objetivo_puesto: "Captar y sostener cartera empresarial alineada a objetivos comerciales.",
    competencias_tecnicas: "Ventas consultivas|CRM|Negociación",
    competencias_blandas: "Comunicación|Orientación a resultados|Disciplina comercial",
    fecha_vigencia_desde: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    void listarDescriptoresRh().then(setItems);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const result = await crearDescriptorRh({
      ...form,
      id_puesto: Number(form.id_puesto),
      funciones_principales: "Gestión comercial, seguimiento y cierre de oportunidades",
      modalidad: "HÍBRIDA",
      jornada: "Administrativa",
    });

    if (result?.ok) {
      setStatus("Descriptor guardado exitosamente");
      const refreshed = await listarDescriptoresRh();
      setItems(refreshed);
    } else {
      setStatus("Error al procesar el descriptor");
    }
    setLoading(false);
  }

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="Estándares de Talento"
        title="Descriptores de Puesto"
        description="Base corporativa de competencias y objetivos por puesto HCM para auditoría y reclutamiento."
      >
        <div style={layoutGridStyle}>
          <div style={{ display: "grid", gap: 32 }}>
            {/* REGISTRATION FORM */}
            <section style={panelStyle}>
              <header style={headerStyle}>
                <div style={iconBoxStyle}><i className="fa-solid fa-file-signature"></i></div>
                <div>
                  <h2 style={sectionTitleStyle}>Nuevo Descriptor Operativo</h2>
                  <p style={sectionTextStyle}>Define el ADN del puesto y sus competencias clave.</p>
                </div>
              </header>

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: 24 }}>
                <div style={formGridStyle}>
                   <Field label="ID Puesto HCM" value={form.id_puesto} onChange={(v: string) => setForm({...form, id_puesto: v})} />
                   <Field label="Título Oficial" value={form.titulo_puesto} onChange={(v: string) => setForm({...form, titulo_puesto: v})} />
                   <Field label="Versión" value={form.version_descriptor} onChange={(v: string) => setForm({...form, version_descriptor: v})} />
                   <Field label="Vigencia" type="date" value={form.fecha_vigencia_desde} onChange={(v: string) => setForm({...form, fecha_vigencia_desde: v})} />
                </div>
                
                <div style={{ display: "grid", gap: 10 }}>
                   <label style={labelStyle}>Objetivo del Puesto</label>
                   <textarea 
                     style={textareaStyle} 
                     value={form.objetivo_puesto} 
                     onChange={(e) => setForm({...form, objetivo_puesto: e.target.value})} 
                   />
                </div>

                <div style={formGridStyle}>
                   <Field label="Comp. Técnicas (|)" value={form.competencias_tecnicas} onChange={(v: string) => setForm({...form, competencias_tecnicas: v})} />
                   <Field label="Comp. Blandas (|)" value={form.competencias_blandas} onChange={(v: string) => setForm({...form, competencias_blandas: v})} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <button disabled={loading} type="submit" style={primaryBtnStyle}>
                    {loading ? "GUARDANDO..." : "GUARDAR DESCRIPTOR"}
                  </button>
                  {status && <span style={statusTextStyle}>{status}</span>}
                </div>
              </form>
            </section>

            {/* CATALOG */}
            <section style={panelStyle}>
              <h2 style={{ ...sectionTitleStyle, marginBottom: 24 }}>Catálogo de Descriptores</h2>
              <div style={catalogGridStyle}>
                {items.map((item) => (
                  <article key={item.idDescriptorPuesto} style={descriptorCardStyle}>
                    <div style={cardHeaderStyle}>
                      <div>
                        <strong style={cardTitleStyle}>{item.tituloPuesto}</strong>
                        <span style={cardMetaStyle}>Puesto {item.idPuesto} · V.{item.versionDescriptor}</span>
                      </div>
                      <RhStatusBadge value={item.estadoActual} />
                    </div>
                    
                    <p style={cardBodyStyle}>{item.objetivoPuesto}</p>
                    
                    <div style={tagCloudStyle}>
                      {item.competenciasClave.map((c) => <span key={c} style={competenceTagStyle}>{c}</span>)}
                    </div>

                    <div style={cardFooterStyle}>
                       <span><i className="fa-solid fa-calendar-check"></i> Activo desde: {item.vigenciaDesde}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </RhShell>
    </PermisoGuard>
  );
}

function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label style={labelStyle}>{label}</label>
      <input 
        type={type} 
        style={inputStyle} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}

/* ---------- STYLES ---------- */

const layoutGridStyle: CSSProperties = { display: "grid", gap: 32 };
const headerStyle: CSSProperties = { display: "flex", gap: 20, alignItems: "center", marginBottom: 32 };
const iconBoxStyle: CSSProperties = { width: 52, height: 52, background: "rgba(218, 41, 28, 0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#DA291C" };

const sectionTitleStyle: CSSProperties = { margin: 0, fontSize: 20, fontWeight: 900, color: "#1e293b" };
const sectionTextStyle: CSSProperties = { margin: "4px 0 0", fontSize: 14, color: "#64748b" };

const formGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 };
const labelStyle: CSSProperties = { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputStyle: CSSProperties = { width: "100%", height: 50, borderRadius: "14px", border: "1px solid #e2e8f0", padding: "0 16px", fontSize: 14, fontWeight: 600 };
const textareaStyle: CSSProperties = { width: "100%", height: 100, borderRadius: "14px", border: "1px solid #e2e8f0", padding: "16px", fontSize: 14, fontWeight: 600, resize: "none" };

const primaryBtnStyle: CSSProperties = { background: "#DA291C", color: "#fff", border: "none", height: 50, borderRadius: "14px", fontWeight: 900, padding: "0 32px", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(218, 41, 28, 0.2)" };
const statusTextStyle: CSSProperties = { fontSize: 13, fontWeight: 700, color: "#475569" };

const catalogGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20 };
const descriptorCardStyle: CSSProperties = { padding: 24, background: "#f8fafc", borderRadius: "22px", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 16 };
const cardHeaderStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 };
const cardTitleStyle: CSSProperties = { display: "block", fontSize: 16, fontWeight: 800, color: "#0f172a" };
const cardMetaStyle: CSSProperties = { fontSize: 12, color: "#94a3b8", fontWeight: 700 };
const cardBodyStyle: CSSProperties = { margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 };
const tagCloudStyle: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
const competenceTagStyle: CSSProperties = { padding: "6px 12px", background: "#0f172a", color: "#fff", borderRadius: "8px", fontSize: 11, fontWeight: 700 };
const cardFooterStyle: CSSProperties = { marginTop: "auto", paddingTop: 16, borderTop: "1px solid #e2e8f0", fontSize: 11, color: "#94a3b8", fontWeight: 700 };
