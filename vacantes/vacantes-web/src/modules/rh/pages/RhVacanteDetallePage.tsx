import { useEffect, useState, useMemo, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import { 
  listarPostulacionesRh, 
  listarRhVacantes,
  type RhVacante,
  type PostulacionRh 
} from "../../../shared/api/vacantesApi";
import RhShell, { panelStyle } from "../components/RhShell";
import RhStatusBadge from "../components/RhStatusBadge";

export default function RhVacanteDetallePage() {
  const { id } = useParams();
  const idVacante = Number(id);
  
  const [vacante, setVacante] = useState<RhVacante | null>(null);
  const [postulaciones, setPostulaciones] = useState<PostulacionRh[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!idVacante) return;
    setLoading(true);
    
    // En un sistema real tendríamos obtenerDetalleVacanteRh(idVacante)
    // Para prototipo rápido, listamos y filtramos
    const [vList, pList] = await Promise.all([
      listarRhVacantes(),
      listarPostulacionesRh()
    ]);
    
    const current = vList.find(v => v.idVacante === idVacante);
    setVacante(current || null);
    setPostulaciones(pList.filter(p => p.idVacante === idVacante));
    
    // Mock de historial si el endpoint fallara o fuera simple
    // En RhController agregamos @Get('vacantes/:id/historial')
    try {
       const res = await fetch(`/api/vacantes/rh/vacantes/${idVacante}/historial`);
       if (res.ok) {
          const hData = await res.json();
          setHistorial(hData || []);
       }
    } catch { /* fallback a vacío */ }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, [idVacante]);

  if (!loading && !vacante) {
     return <div style={{ padding: 40 }}>Vacante no encontrada.</div>;
  }

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="Análisis de Posición"
        title={vacante?.titulo || "Cargando..."}
        description={`Código: ${vacante?.codigoVacante || "..."}`}
        actions={
          <Link to="/app/vacantes/rh/vacantes" style={backBtnStyle}>
             <i className="fa-solid fa-arrow-left"></i> VOLVER
          </Link>
        }
      >
        <div style={layoutGrid}>
           <div style={{ display: "grid", gap: 24 }}>
              {/* STATUS CARD */}
              <section style={panelStyle}>
                 <div style={statusBannerStyle}>
                    <div style={{ display: "grid", gap: 4 }}>
                       <span style={labelLightStyle}>ESTADO ACTUAL PUBLICACIÓN</span>
                       <RhStatusBadge value={vacante?.estadoActual || ""} />
                    </div>
                    <div style={statBoxStyle}>
                       <strong style={statValueStyle}>{postulaciones.length}</strong>
                       <span style={statLabelStyle}>Postulantes</span>
                    </div>
                 </div>
              </section>

              {/* POSTULANTES TABLE */}
              <section style={panelStyle}>
                 <h3 style={sectionTitleStyle}>Candidatos Postulados</h3>
                 <div style={tableWrapperStyle}>
                    <table style={tableStyle}>
                       <thead style={stickyTheadStyle}>
                          <tr>
                             <th style={thStyle}>CANDIDATO</th>
                             <th style={thStyle}>MATCH IA</th>
                             <th style={thStyle}>ESTADO</th>
                             <th style={thStyle}>ACCIONES</th>
                          </tr>
                       </thead>
                       <tbody>
                          {postulaciones.map(p => (
                             <tr key={p.idPostulacion} style={trStyle}>
                                <td style={tdStyle}>
                                   <div style={{ display: "grid", gap: 2 }}>
                                      <strong style={{ fontSize: 13 }}>{p.nombreCandidato}</strong>
                                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{p.fechaPostulacion}</span>
                                   </div>
                                </td>
                                <td style={tdStyle}>
                                   <span style={{ fontWeight: 800, color: p.scoreIa >= 80 ? '#10b981' : '#f59e0b' }}>{p.scoreIa}%</span>
                                </td>
                                <td style={tdStyle}><RhStatusBadge value={p.estadoActual} /></td>
                                <td style={tdStyle}>
                                   <Link 
                                      to={`/app/vacantes/rh/candidato/${p.idPostulacion}?origen=${encodeURIComponent(p.origenPostulacion)}`}
                                      style={btnViewStyle}
                                   >
                                      EXPEDIENTE
                                   </Link>
                                </td>
                             </tr>
                          ))}
                          {postulaciones.length === 0 && (
                             <tr><td colSpan={4} style={emptyTdStyle}>No hay postulaciones registradas.</td></tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </section>
           </div>

           {/* SIDEBAR: HISTORY */}
           <aside style={{ display: "grid", gap: 24, alignContent: "start" }}>
              <section style={panelStyle}>
                 <h3 style={sectionTitleStyle}>Historial de Cambios</h3>
                 <div style={historyListStyle}>
                    {historial.map((h, i) => (
                       <div key={i} style={historyItemStyle}>
                          <div style={historyIconBox}><i className="fa-solid fa-clock-rotate-left"></i></div>
                          <div style={{ flex: 1 }}>
                             <strong style={historyStateStyle}>{h.estado_nuevo || h.EstadoNuevo}</strong>
                             <span style={historyDateStyle}>{h.fecha_cambio || h.FechaCambio}</span>
                             <p style={historyObsStyle}>{h.observacion || "Sin observaciones."}</p>
                          </div>
                       </div>
                    ))}
                    {historial.length === 0 && (
                       <div style={{ padding: 20, textAlign: "center", color: '#94a3b8', fontSize: 12 }}>
                          No hay registro de actividad reciente.
                       </div>
                    )}
                 </div>
              </section>
           </aside>
        </div>
      </RhShell>
    </PermisoGuard>
  );
}

/* ---------- STYLES ---------- */

const layoutGrid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 };

const statusBannerStyle: CSSProperties = { padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" };
const labelLightStyle: CSSProperties = { fontSize: 10, fontWeight: 900, color: "#94a3b8", letterSpacing: "0.5px" };

const statBoxStyle: CSSProperties = { textAlign: "right", borderLeft: "1px solid #f1f5f9", paddingLeft: 24 };
const statValueStyle: CSSProperties = { display: "block", fontSize: 32, fontWeight: 950, color: "#1e293b" };
const statLabelStyle: CSSProperties = { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" };

const sectionTitleStyle: CSSProperties = { margin: 0, padding: "16px 20px", fontSize: 12, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" };
const tableWrapperStyle: CSSProperties = { overflowX: "auto" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const stickyTheadStyle: CSSProperties = { position: "sticky", top: 0, background: "#fff", zIndex: 10 };
const thStyle: CSSProperties = { textAlign: "left", padding: "12px 20px", fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" };
const trStyle: CSSProperties = { borderBottom: "1px solid #f8fafc" };
const tdStyle: CSSProperties = { padding: "12px 20px", verticalAlign: "middle" };

const btnViewStyle: CSSProperties = { padding: "6px 12px", background: "#f1f5f9", color: "#1e293b", borderRadius: "8px", textDecoration: "none", fontSize: 11, fontWeight: 800 };
const emptyTdStyle: CSSProperties = { padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 };

const historyListStyle: CSSProperties = { padding: 10, display: "grid", gap: 10 };
const historyItemStyle: CSSProperties = { display: "flex", gap: 14, padding: 12, background: "#f8fafc", borderRadius: 12 };
const historyIconBox: CSSProperties = { color: "#DA291C", fontSize: 14, marginTop: 2 };
const historyStateStyle: CSSProperties = { display: "block", fontSize: 12, fontWeight: 800, color: "#1e293b" };
const historyDateStyle: CSSProperties = { display: "block", fontSize: 10, fontWeight: 600, color: "#94a3b8" };
const historyObsStyle: CSSProperties = { margin: "4px 0 0", fontSize: 11, color: "#64748b", lineHeight: 1.4 };

const backBtnStyle: CSSProperties = { textDecoration: "none", background: "#fff", border: "1px solid #e2e8f0", height: 40, padding: "0 16px", borderRadius: "10px", color: "#1e293b", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 };

const skeletonStyle: CSSProperties = { height: 100, background: "#f1f5f9", borderRadius: 20, animation: "pulse 1.5s infinite" };
