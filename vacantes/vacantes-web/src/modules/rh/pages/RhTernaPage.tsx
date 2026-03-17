import { useEffect, useState, type CSSProperties } from "react";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import { crearTernaRh, listarTernasRh } from "../../../shared/api/vacantesApi";
import { getPortalMe } from "../../../shared/api/coreSessionApi";
import RhShell, { panelStyle } from "../components/RhShell";

export default function RhTernaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [idVacante, setIdVacante] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  async function loadData() {
    setListLoading(true);
    const data = await listarTernasRh();
    setItems(data || []);
    setListLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCrear() {
    setLoading(true);
    const identity = await getPortalMe();
    if (!identity?.idCuentaPortal) {
      setStatus("No hay sesión RH activa");
      setLoading(false);
      return;
    }

    const result = await crearTernaRh(Number(idVacante || 0), identity.idCuentaPortal);
    if (result?.ok) {
       setStatus(`Terna formalizada: ID-${result.idTerna}`);
       setIdVacante("");
       await loadData();
    } else {
       setStatus("No se pudo crear la terna operativa");
    }
    setLoading(false);
  }

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="Talento y Selección"
        title="Gestión de Ternas"
        description="Formalización de finalistas para la presentación ante el cliente interno y toma de decisión final."
      >
        <div style={ternaGridStyle}>
          <div style={{ display: "grid", gap: 32 }}>
            <section style={panelStyle}>
              <header style={headerStyle}>
                <div style={iconStyle}><i className="fa-solid fa-users-viewfinder"></i></div>
                <div>
                  <h2 style={sectionTitleStyle}>Selección de Origen</h2>
                  <p style={sectionTextStyle}>Ingresa el identificador de la vacante para agrupar a los finalistas preseleccionados.</p>
                </div>
              </header>
              
              <div style={formStackStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>ID de Vacante Activa</label>
                  <input
                    value={idVacante}
                    onChange={(event) => setIdVacante(event.target.value)}
                    placeholder="Ej: 1402"
                    style={inputStyle}
                  />
                </div>
                <button 
                   disabled={loading || !idVacante} 
                   onClick={() => void handleCrear()} 
                   style={primaryButtonStyle}
                >
                  {loading ? "FORMALIZANDO..." : "CREAR TERNA DEFINITIVA"}
                </button>
              </div>
              {status && <div style={statusPillStyle}>{status}</div>}
            </section>

            <section style={panelStyle}>
                 <h2 style={{ ...sectionTitleStyle, padding: "20px 24px", borderBottom: '1px solid #f1f5f9' }}>Ternas Formalizadas</h2>
                 <div style={{ overflowX: "auto" }}>
                    <table style={tableStyle}>
                       <thead>
                          <tr>
                             <th style={thStyle}>ID TERNA</th>
                             <th style={thStyle}>VACANTE</th>
                             <th style={thStyle}>FECHA CREACIÓN</th>
                             <th style={thStyle}>ESTADO</th>
                          </tr>
                       </thead>
                       <tbody>
                          {listLoading ? (
                             <tr><td colSpan={4} style={{ textAlign: "center", padding: 40 }}>Cargando ternas...</td></tr>
                          ) : items.map((item, idx) => (
                             <tr key={idx} style={trStyle}>
                                <td style={tdStyle}><strong style={{ color: '#0f172a' }}>#{item.IdTerna}</strong></td>
                                <td style={tdStyle}>
                                   <div style={{ display: 'grid' }}>
                                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.TituloVacante}</span>
                                      <span style={{ fontSize: 11, color: '#94a3b8' }}>ID VAC: {item.IdVacante}</span>
                                   </div>
                                </td>
                                <td style={tdStyle}><span style={{ fontSize: 13, color: '#64748b' }}>{new Date(item.FechaCreacion).toLocaleDateString()}</span></td>
                                <td style={tdStyle}><span style={badgeStyle}>ACTIVA</span></td>
                             </tr>
                          ))}
                          {items.length === 0 && !listLoading && (
                             <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: '#94a3b8' }}>No hay ternas formalizadas recientemente.</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </section>
          </div>

          <aside style={{ display: "grid", gap: 24, alignContent: "start" }}>
            <section style={panelStyle}>
               <h3 style={subTitleStyle}>Consideraciones de la Terna</h3>
               <div style={tipsListStyle}>
                  <Tip icon="fa-check" text="Asegúrate que los 3 candidatos tengan el CV actualizado." />
                  <Tip icon="fa-check" text="Valida el Score IA vs la entrevista técnica inicial." />
                  <Tip icon="fa-check" text="Confirma disponibilidad salarial de los finalistas." />
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

function Tip({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={tipRowStyle}>
      <i className={`fa-solid ${icon}`} style={{ color: "#10b981" }}></i>
      <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>{text}</span>
    </div>
  );
}

/* ---------- STYLES ---------- */

const ternaGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 };
const headerStyle: CSSProperties = { display: "flex", gap: 20, alignItems: "center", marginBottom: 30 };
const iconStyle: CSSProperties = { width: 56, height: 56, background: "rgba(218, 41, 28, 0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#DA291C" };
const sectionTitleStyle: CSSProperties = { margin: 0, fontSize: 20, fontWeight: 900, color: "#1e293b" };
const sectionTextStyle: CSSProperties = { margin: "4px 0 0", fontSize: 14, color: "#64748b", lineHeight: 1.5 };

const formStackStyle: CSSProperties = { display: "grid", gap: 24, maxWidth: 400 };
const fieldGroupStyle: CSSProperties = { display: "grid", gap: 8 };
const labelStyle: CSSProperties = { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputStyle: CSSProperties = { width: "100%", height: 50, borderRadius: "14px", border: "1px solid #e2e8f0", padding: "0 16px", fontSize: 16, fontWeight: 700, transition: "all 0.2s" };

const primaryButtonStyle: CSSProperties = { background: "#DA291C", color: "#fff", border: "none", height: 50, borderRadius: "14px", fontWeight: 900, fontSize: 14, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 10px 15px -3px rgba(218, 41, 28, 0.2)" };
const statusPillStyle: CSSProperties = { marginTop: 20, padding: "12px 16px", background: "#f1f5f9", borderRadius: "12px", color: "#475569", fontSize: 13, fontWeight: 700, textAlign: "center" };

const subTitleStyle: CSSProperties = { margin: "0 0 16px 0", fontSize: 15, fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "1px" };
const tipsListStyle: CSSProperties = { display: "grid", gap: 12 };
const tipRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12 };

const previewPanelStyle: CSSProperties = { background: "#fff", borderRadius: "24px", border: "1px solid #f1f5f9", overflow: "hidden" };
const workflowHeaderStyle: CSSProperties = { padding: "16px 20px", background: "#f8fafc", fontSize: 11, fontWeight: 900, color: "#64748b", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 };
