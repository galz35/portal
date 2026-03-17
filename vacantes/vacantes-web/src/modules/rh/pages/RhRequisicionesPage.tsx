import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import { aprobarRequisicionRh, crearRequisicionRh, listarPendientesAprobacionRh, listarRequisicionesRh, rechazarRequisicionRh, type RequisicionRh } from "../../../shared/api/vacantesApi";
import { getPortalMe } from "../../../shared/api/coreSessionApi";
import RhShell, { panelStyle } from "../components/RhShell";
import RhStatusBadge from "../components/RhStatusBadge";

export default function RhRequisicionesPage() {
  const [items, setItems] = useState<RequisicionRh[]>([]);
  const [pendientes, setPendientes] = useState<Array<{ idRequisicion: number; codigoRequisicion: string; tituloPuesto: string; estadoActual: string }>>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    codigoRequisicion: "",
    idPuesto: "",
    tipoNecesidad: "RENUNCIA",
    justificacion: "",
    area: "",
    gerencia: "",
    departamento: "",
    prioridad: "ALTA",
    fechaLimiteRegularizacion: "",
  });

  useEffect(() => {
    void Promise.all([listarRequisicionesRh(), listarPendientesAprobacionRh()]).then(([requisiciones, dataPendientes]) => {
      setItems(requisiciones);
      setPendientes(dataPendientes.items || []);
    });
  }, []);

  async function handleCreate() {
    setLoading(true);
    setStatus("Procesando solicitud...");
    const identity = await getPortalMe();
    if (!identity?.idCuentaPortal) {
      setStatus("No hay sesión RH activa");
      setLoading(false);
      return;
    }

    const result = await crearRequisicionRh({
      codigo_requisicion: form.codigoRequisicion || `REQ-${Date.now()}`,
      id_puesto: Number(form.idPuesto || 0),
      tipo_necesidad: form.tipoNecesidad,
      justificacion: form.justificacion,
      cantidad_plazas: 1,
      codigo_pais: "NI",
      gerencia: form.gerencia || undefined,
      departamento: form.departamento || undefined,
      area: form.area || undefined,
      id_cuenta_portal_solicitante: identity.idCuentaPortal,
      prioridad: form.prioridad || undefined,
      permite_publicacion_sin_completar: true,
      fecha_limite_regularizacion: form.fechaLimiteRegularizacion || undefined,
    });

    setStatus(result?.ok ? `Digitalizado: ${result.codigoRequisicion}` : "Error en proceso");
    setLoading(false);
  }

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="Flujo de Requisiciones"
        title="Gestión de Solicitudes"
        description="Asegura el cumplimiento de plantillas HCM y autorizaciones antes de la publicación externa."
      >
        <div style={layoutGridStyle}>
          <div style={{ display: "grid", gap: 32 }}>
            {/* NEW REQUISITION */}
            <section style={panelStyle}>
              <header style={sectionHeaderStyle}>
                <div style={iconBoxStyle}><i className="fa-solid fa-file-circle-plus"></i></div>
                <div>
                  <h2 style={sectionTitleStyle}>Nueva Digitalización</h2>
                  <p style={sectionTextStyle}>Ingresa los datos para formalizar la vacante en el sistema.</p>
                </div>
              </header>

              <div style={formGridStyle}>
                <Field label="Código Req (Opcional)" value={form.codigoRequisicion} onChange={(v: string) => setForm({...form, codigoRequisicion: v})} placeholder="Ej: REQ-2024-001" />
                <Field label="ID Puesto HCM" value={form.idPuesto} onChange={(v: string) => setForm({...form, idPuesto: v})} placeholder="Ej: 1402" />
                <Field label="Área / Unidad" value={form.area} onChange={(v: string) => setForm({...form, area: v})} placeholder="Ej: Operaciones" />
                <Field label="Prioridad" isSelect options={[{v:"ALTA", l:"Alta Prioridad"}, {v:"MEDIA", l:"Normal"}, {v:"BAJA", l:"Baja"}]} value={form.prioridad} onChange={(v: string) => setForm({...form, prioridad: v})} />
                
                <div style={{ gridColumn: "1 / -1", display: "grid", gap: 12 }}>
                   <label style={labelStyle}>Justificación del Puesto</label>
                   <textarea 
                     style={textareaStyle} 
                     placeholder="Explica el motivo de la vacante..."
                     value={form.justificacion}
                     onChange={(e) => setForm({...form, justificacion: e.target.value})}
                   />
                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 20 }}>
                <button disabled={loading} onClick={() => void handleCreate()} style={primaryBtnStyle}>
                  {loading ? "PROCESANDO..." : "GUARDAR REQUISICIÓN"}
                </button>
                {status && <span style={statusTextStyle}>{status}</span>}
              </div>
            </section>

            {/* TRAY */}
            <section style={panelStyle}>
              <header style={{ marginBottom: 24 }}>
                <h2 style={sectionTitleStyle}>Historial de Solicitudes</h2>
                <p style={sectionTextStyle}>Seguimiento de auditoría y estados de regularización.</p>
              </header>

              <div style={trayStackStyle}>
                {items.map((item) => (
                  <article key={item.idRequisicion} style={rowStyle}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <strong style={rowTitleStyle}>{item.codigoRequisicion}</strong>
                      <div style={rowMetaStyle}>
                        <span><i className="fa-solid fa-briefcase"></i> {item.tituloPuesto}</span>
                        <span><i className="fa-solid fa-layer-group"></i> {item.area}</span>
                        <span><i className="fa-solid fa-clock"></i> Limite: {item.fechaLimiteRegularizacion || "N/A"}</span>
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: 12, justifyItems: "end" }}>
                      <RhStatusBadge value={item.estadoActual} />
                      <div style={rowActionsStyle}>
                         <button style={miniBtnStyle}><i className="fa-solid fa-pencil"></i></button>
                         <button style={miniBtnStyle}><i className="fa-solid fa-trash-can"></i></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* ASIDE */}
          <aside style={{ display: "grid", gap: 24, alignContent: "start" }}>
            <section style={{ ...panelStyle, background: "#0f172a", color: "#fff", border: "none" }}>
              <h3 style={asideTitleStyle}><i className="fa-solid fa-bell"></i> PENDIENTES</h3>
              <div style={pendingStackStyle}>
                {pendientes.length > 0 ? pendientes.map((p) => (
                  <div key={p.idRequisicion} style={pendingItemStyle}>
                    <strong style={{ display: "block", fontSize: 13 }}>{p.codigoRequisicion}</strong>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{p.tituloPuesto}</span>
                    <div style={{ marginTop: 8 }}><RhStatusBadge value={p.estadoActual} /></div>
                  </div>
                )) : (
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "20px 0" }}>Sin pendientes críticos.</p>
                )}
              </div>
            </section>

            <section style={panelStyle}>
               <h3 style={{ ...asideTitleStyle, color: "#1e293b", marginBottom: 16 }}>SLA de Respuesta</h3>
               <div style={slaBoxStyle}>
                 <div style={slaCircleStyle}>94%</div>
                 <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: "#64748b" }}>Cumplimiento promedio en aprobación de jefes directos este mes.</p>
               </div>
            </section>
          </aside>
        </div>
      </RhShell>
    </PermisoGuard>
  );
}

function Field({ label, placeholder, value, onChange, isSelect, options }: any) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label style={labelStyle}>{label}</label>
      {isSelect ? (
        <select style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : (
        <input style={inputStyle} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */

const layoutGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 };

const sectionHeaderStyle: CSSProperties = { display: "flex", gap: 20, alignItems: "center", marginBottom: 32 };
const iconBoxStyle: CSSProperties = { width: 52, height: 52, background: "rgba(218, 41, 28, 0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#DA291C" };
const sectionTitleStyle: CSSProperties = { margin: 0, fontSize: 20, fontWeight: 900, color: "#1e293b" };
const sectionTextStyle: CSSProperties = { margin: "4px 0 0", fontSize: 14, color: "#64748b" };

const formGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 };
const labelStyle: CSSProperties = { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputStyle: CSSProperties = { width: "100%", height: 50, borderRadius: "14px", border: "1px solid #e2e8f0", padding: "0 16px", fontSize: 14, fontWeight: 600 };
const textareaStyle: CSSProperties = { width: "100%", height: 100, borderRadius: "14px", border: "1px solid #e2e8f0", padding: "16px", fontSize: 14, fontWeight: 600, resize: "none" };

const primaryBtnStyle: CSSProperties = { background: "#DA291C", color: "#fff", border: "none", height: 50, borderRadius: "14px", fontWeight: 900, padding: "0 32px", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(218, 41, 28, 0.2)" };
const statusTextStyle: CSSProperties = { fontSize: 13, fontWeight: 700, color: "#475569" };

const trayStackStyle: CSSProperties = { display: "grid", gap: 12 };
const rowStyle: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "#f8fafc", borderRadius: "18px", border: "1px solid #f1f5f9" };
const rowTitleStyle: CSSProperties = { fontSize: 15, fontWeight: 800, color: "#1e293b" };
const rowMetaStyle: CSSProperties = { display: "flex", gap: 16, fontSize: 12, color: "#64748b", fontWeight: 500 };
const rowActionsStyle: CSSProperties = { display: "flex", gap: 8 };
const miniBtnStyle: CSSProperties = { width: 34, height: 34, borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13 };

const asideTitleStyle: CSSProperties = { margin: 0, fontSize: 12, fontWeight: 900, letterSpacing: "1px", display: "flex", alignItems: "center", gap: 10 };
const pendingStackStyle: CSSProperties = { display: "grid", gap: 16, marginTop: 24 };
const pendingItemStyle: CSSProperties = { padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" };
const slaBoxStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 16 };
const slaCircleStyle: CSSProperties = { width: 56, height: 56, borderRadius: "50%", border: "4px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#10b981", flexShrink: 0 };
