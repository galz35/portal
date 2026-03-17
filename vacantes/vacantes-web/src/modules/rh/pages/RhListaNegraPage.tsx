import { useEffect, useState, type CSSProperties } from "react";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import { registrarListaNegraRh, listarListaNegraRh } from "../../../shared/api/vacantesApi";
import { getPortalMe } from "../../../shared/api/coreSessionApi";
import RhShell, { panelStyle } from "../components/RhShell";

export default function RhListaNegraPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    idPersona: "",
    motivo: "",
    categoria: "CONDUCTA",
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFin: "",
    permanente: false,
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  async function loadData() {
    setListLoading(true);
    const data = await listarListaNegraRh();
    setItems(data || []);
    setListLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleRegistrar() {
    setLoading(true);
    const identity = await getPortalMe();
    if (!identity?.idCuentaPortal) {
      setStatus("No hay sesión RH activa");
      setLoading(false);
      return;
    }

    const result = await registrarListaNegraRh({
      id_persona: Number(form.idPersona || 0),
      motivo: form.motivo,
      categoria: form.categoria || undefined,
      fecha_inicio: form.fechaInicio,
      fecha_fin: form.fechaFin || undefined,
      permanente: form.permanente,
    }, identity.idCuentaPortal);

    if (result?.ok) {
      setStatus(`Restricción aplicada: ID-${result.idListaNegra}`);
      setForm({
         idPersona: "",
         motivo: "",
         categoria: "CONDUCTA",
         fechaInicio: new Date().toISOString().slice(0, 10),
         fechaFin: "",
         permanente: false,
      });
      await loadData();
    } else {
      setStatus("Error al registrar restricción");
    }
    setLoading(false);
  }

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="Integridad y cumplimiento"
        title="Lista de Restricción"
        description="Gestión oficial de candidatos inhabilitados para procesos de selección por motivos de integridad o política corporativa."
      >
        <div style={layoutGridStyle}>
           <div style={{ display: "grid", gap: 32 }}>
              {/* FORM */}
              <section style={panelStyle}>
                <header style={headerStyle}>
                  <div style={iconBoxStyle}><i className="fa-solid fa-user-shield"></i></div>
                  <div>
                    <h2 style={sectionTitleStyle}>Nuevo Registro de Restricción</h2>
                    <p style={sectionTextStyle}>Ingresa el identificador único del candidato y el motivo legal de la restricción.</p>
                  </div>
                </header>

                <div style={formStackStyle}>
                  <div style={formGridStyle}>
                    <div style={fieldGroupStyle}>
                      <label style={labelStyle}>ID de Persona (HCM)</label>
                      <input style={inputStyle} value={form.idPersona} onChange={(e) => setForm({...form, idPersona: e.target.value})} placeholder="Ej: 100542" />
                    </div>
                    <div style={fieldGroupStyle}>
                      <label style={labelStyle}>Categoría de Falta</label>
                      <select style={inputStyle} value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})}>
                        <option value="CONDUCTA">Conducta Ética</option>
                        <option value="REFERENCIAS">Referencias Negativas</option>
                        <option value="PRUEBAS">Fallo en Pruebas de Confianza</option>
                        <option value="OTRO">Otros Motivos Legales</option>
                      </select>
                    </div>
                    <div style={fieldGroupStyle}>
                      <label style={labelStyle}>Fecha Inicio</label>
                      <input type="date" style={inputStyle} value={form.fechaInicio} onChange={(e) => setForm({...form, fechaInicio: e.target.value})} />
                    </div>
                    <div style={fieldGroupStyle}>
                      <label style={labelStyle}>Fecha Fin (Opcional)</label>
                      <input type="date" disabled={form.permanente} style={inputStyle} value={form.fechaFin} onChange={(e) => setForm({...form, fechaFin: e.target.value})} />
                    </div>
                  </div>

                  <div style={fieldGroupStyle}>
                    <label style={labelStyle}>Descripción Detallada del Motivo</label>
                    <textarea 
                       style={textareaStyle} 
                       value={form.motivo} 
                       onChange={(e) => setForm({...form, motivo: e.target.value})}
                       placeholder="Escribe la justificación oficial... (mínimo 20 caracteres)"
                    />
                  </div>

                  <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <input 
                           type="checkbox" 
                           style={checkboxStyle} 
                           checked={form.permanente} 
                           onChange={(e) => setForm({...form, permanente: e.target.checked})} 
                        />
                        <div>
                           <strong style={{ display: "block", fontSize: 13, color: "#1e293b" }}>Restricción Permanente</strong>
                           <span style={{ fontSize: 11, color: "#94a3b8" }}>Este candidato no podrá postularse nunca más.</span>
                        </div>
                     </div>
                     <i className="fa-solid fa-lock" style={{ color: form.permanente ? "#DA291C" : "#cbd5e1", fontSize: 18 }}></i>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
                    <button disabled={loading || !form.idPersona} onClick={() => void handleRegistrar()} style={primaryBtnStyle}>
                       {loading ? "PROCESANDO..." : "REGISTRAR EN LISTA NEGRA"}
                    </button>
                    {status && <span style={statusTextStyle}>{status}</span>}
                  </div>
                </div>
              </section>

              {/* LIST */}
              <section style={panelStyle}>
                 <h2 style={{ ...sectionTitleStyle, padding: "20px 24px", borderBottom: '1px solid #f1f5f9' }}>Historial de Restricciones</h2>
                 <div style={{ overflowX: "auto" }}>
                    <table style={tableStyle}>
                       <thead>
                          <tr>
                             <th style={thStyle}>ID PERSONA</th>
                             <th style={thStyle}>MOTIVO</th>
                             <th style={thStyle}>CATEGORÍA</th>
                             <th style={thStyle}>FIN</th>
                          </tr>
                       </thead>
                       <tbody>
                          {listLoading ? (
                             <tr><td colSpan={4} style={{ textAlign: "center", padding: 40 }}>Cargando registros...</td></tr>
                          ) : items.map((item, idx) => (
                             <tr key={idx} style={trStyle}>
                                <td style={tdStyle}><strong style={{ color: '#0f172a' }}>{item.IdPersona}</strong></td>
                                <td style={tdStyle}><span style={{ fontSize: 13, color: '#64748b' }}>{item.Motivo}</span></td>
                                <td style={tdStyle}><span style={badgeStyle}>{item.Categoria}</span></td>
                                <td style={tdStyle}>
                                   <span style={{ fontSize: 12, fontWeight: 700, color: item.Permanente ? '#DA291C' : '#94a3b8' }}>
                                      {item.Permanente ? 'PERMANENTE' : (item.FechaFin || 'Indefinida')}
                                   </span>
                                </td>
                             </tr>
                          ))}
                          {items.length === 0 && !listLoading && (
                             <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: '#94a3b8' }}>No hay restricciones activas registradas.</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </section>
           </div>

          <aside style={{ display: "grid", gap: 24, alignContent: "start" }}>
             <section style={{ ...panelStyle, background: "#0f172a", color: "#fff", border: "none" }}>
                <h3 style={asideTitleStyle}><i className="fa-solid fa-circle-info"></i> POLÍTICA</h3>
                <p style={asideTextStyle}>Todo registro en esta lista debe contar con el sustento legal o de recursos humanos correspondiente para evitar auditorías negativas.</p>
                <div style={promoBoxStyle}>
                   <i className="fa-solid fa-shield-halved"></i> Datos Encriptados
                </div>
             </section>
          </aside>
        </div>
      </RhShell>
    </PermisoGuard>
  );
}

const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const thStyle: CSSProperties = { textAlign: "left", padding: "16px 24px", fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" };
const trStyle: CSSProperties = { borderBottom: "1px solid #f8fafc" };
const tdStyle: CSSProperties = { padding: "16px 24px", verticalAlign: "middle" };
const badgeStyle: CSSProperties = { padding: "4px 8px", background: "#f1f5f9", borderRadius: "6px", fontSize: 10, fontWeight: 800, color: "#475569" };

/* ---------- STYLES ---------- */

const layoutGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 };
const headerStyle: CSSProperties = { display: "flex", gap: 20, alignItems: "center", marginBottom: 32 };
const iconBoxStyle: CSSProperties = { width: 52, height: 52, background: "rgba(218, 41, 28, 0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#DA291C" };
const sectionTitleStyle: CSSProperties = { margin: 0, fontSize: 20, fontWeight: 900, color: "#1e293b" };
const sectionTextStyle: CSSProperties = { margin: "4px 0 0", fontSize: 14, color: "#64748b" };

const formStackStyle: CSSProperties = { display: "grid", gap: 24 };
const formGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };
const fieldGroupStyle: CSSProperties = { display: "grid", gap: 8 };
const labelStyle: CSSProperties = { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputStyle: CSSProperties = { width: "100%", height: 50, borderRadius: "14px", border: "1px solid #e2e8f0", padding: "0 16px", fontSize: 14, fontWeight: 600 };
const textareaStyle: CSSProperties = { width: "100%", height: 110, borderRadius: "14px", border: "1px solid #e2e8f0", padding: "16px", fontSize: 14, fontWeight: 600, resize: "none" };
const checkboxStyle: CSSProperties = { width: 20, height: 20, cursor: "pointer" };

const primaryBtnStyle: CSSProperties = { background: "#1e293b", color: "#fff", border: "none", height: 50, borderRadius: "14px", fontWeight: 900, padding: "0 32px", cursor: "pointer", transition: "all 0.2s" };
const statusTextStyle: CSSProperties = { fontSize: 13, fontWeight: 700, color: "#DA291C" };

const asideTitleStyle: CSSProperties = { margin: "0 0 12px", fontSize: 12, fontWeight: 900, letterSpacing: "1px", display: "flex", alignItems: "center", gap: 8 };
const asideTextStyle: CSSProperties = { margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 };
const promoBoxStyle: CSSProperties = { marginTop: 24, padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.7)" };
