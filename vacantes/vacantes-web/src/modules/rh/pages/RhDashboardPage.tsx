import { useEffect, useState, useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import { 
  listarPendientesAprobacionRh, 
  listarPostulacionesRh, 
  listarRhVacantes, 
  obtenerRhDashboard, 
  type RhDashboard, 
  type RhVacante, 
  type PostulacionRh 
} from "../../../shared/api/vacantesApi";
import RhShell, { panelStyle } from "../components/RhShell";
import RhStatusBadge from "../components/RhStatusBadge";

export default function RhDashboardPage() {
  const [dashboard, setDashboard] = useState<RhDashboard | null>(null);
  const [vacantes, setVacantes] = useState<RhVacante[]>([]);
  const [postulaciones, setPostulaciones] = useState<PostulacionRh[]>([]);
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    void Promise.all([
      obtenerRhDashboard(),
      listarRhVacantes(),
      listarPostulacionesRh(),
      listarPendientesAprobacionRh()
    ]).then(([dashData, vacsData, postsData, pendientesData]) => {
      setDashboard(dashData);
      setVacantes(vacsData || []);
      setPostulaciones(postsData || []);
      setPendientes(pendientesData.items || []);
      setLoading(false);
    });
  }, []);

  // Calcular candidatos por vacante
  const vacantesConConteo = useMemo(() => {
    return vacantes.map(v => ({
      ...v,
      candidatos: postulaciones.filter(p => p.idVacante === v.idVacante).length
    }));
  }, [vacantes, postulaciones]);

  const filteredVacantes = useMemo(() => {
    if (!filter) return vacantesConConteo;
    return vacantesConConteo.filter(v => 
      v.titulo.toLowerCase().includes(filter.toLowerCase()) || 
      v.codigoVacante.toLowerCase().includes(filter.toLowerCase())
    );
  }, [vacantesConConteo, filter]);

  const recentPosts = useMemo(() => {
    return postulaciones.slice(0, 5);
  }, [postulaciones]);

  const locationStats = useMemo(() => {
    const counts: Record<string, number> = {};
    vacantes.forEach(v => {
      counts[v.ubicacion] = (counts[v.ubicacion] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [vacantes]);

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="RH Dashboard"
        title="Consola de Reclutamiento"
        description="Gestión integral de talento: monitoreo de vacantes activas y detección de perfiles compatibles."
        actions={
          <div style={{ display: "flex", gap: 12 }}>
             <div style={searchWrapperStyle}>
                <i className="fa-solid fa-magnifying-glass" style={searchIconStyle}></i>
                <input 
                  placeholder="Buscar vacante..." 
                  style={searchFieldStyle} 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
             </div>
             <Link to="/app/vacantes/rh/vacantes/nueva" style={primaryBtnStyle}>
                <i className="fa-solid fa-plus"></i> NUEVA VACANTE
             </Link>
          </div>
        }
      >
        {/* KPI ROW */}
        <section style={kpiGridStyle}>
          <MetricBox 
            label="Vacantes Públicas" 
            value={dashboard?.kpis.vacantesPublicadas ?? 0} 
            icon="fa-briefcase"
          />
          <MetricBox 
            label="Total Postulaciones" 
            value={postulaciones.length} 
            icon="fa-users"
            color="#3b82f6"
          />
          <MetricBox 
            label="Match IA > 80%" 
            value={postulaciones.filter(p => p.scoreIa >= 80).length} 
            icon="fa-brain"
            color="#10b981"
          />
          <MetricBox 
            label="Aprobaciones Pend." 
            value={dashboard?.kpis.requisicionesPendientes ?? 0} 
            icon="fa-file-signature"
            color="#f59e0b"
          />
        </section>

        <div style={mainLayoutGridStyle}>
          {/* LEFT: TABLES */}
          <div style={{ display: "grid", gap: 40 }}>
            
            {/* TABLE: VACANTES */}
            <section style={panelStyle}>
              <header style={tableHeaderStyle}>
                <h2 style={sectionTitleStyle}>Gestión de Vacantes Activas</h2>
                <Link to="/app/vacantes/rh/vacantes" style={viewAllLinkStyle}>VER TODAS ({vacantes.length})</Link>
              </header>
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>CÓDIGO / TÍTULO</th>
                      <th style={thStyle}>ESTADO</th>
                      <th style={thStyle}>CANDIDATOS</th>
                      <th style={thStyle}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <TableSkeleton cols={4} /> : filteredVacantes.slice(0, 5).map((v) => (
                      <tr key={v.idVacante} style={trStyle}>
                        <td style={tdStyle}>
                          <div style={{ display: "grid" }}>
                            <span style={codeStyle}>{v.codigoVacante}</span>
                            <strong style={titleStyle}>{v.titulo}</strong>
                          </div>
                        </td>
                        <td style={tdStyle}><RhStatusBadge value={v.estadoActual} /></td>
                        <td style={tdStyle}>
                          <div style={countBoxStyle}>
                            <i className="fa-solid fa-users"></i> {v.candidatos}
                          </div>
                        </td>
                        <td style={tdStyle}>
                           <Link to={`/app/vacantes/rh/vacante/${v.idVacante}`} style={iconBtnStyle}>
                              <i className="fa-solid fa-chart-line"></i>
                           </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* TABLE: CANDIDATOS RECIENTES */}
            <section style={panelStyle}>
              <header style={tableHeaderStyle}>
                <h2 style={sectionTitleStyle}>Últimas Postulaciones</h2>
                <Link to="/app/vacantes/rh/postulaciones" style={viewAllLinkStyle}>GESTIONAR CANDIDATOS</Link>
              </header>
              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>CANDIDATO</th>
                      <th style={thStyle}>POSICIÓN</th>
                      <th style={thStyle}>MATCH IA</th>
                      <th style={thStyle}>FECHA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? <TableSkeleton cols={4} /> : recentPosts.map((p) => (
                      <tr key={p.idPostulacion} style={trStyle}>
                        <td style={tdStyle}>
                          <Link 
                            to={`/app/vacantes/rh/candidato/${p.idPostulacion}?origen=${encodeURIComponent(p.origenPostulacion)}`}
                            style={candidateLinkStyle}
                          >
                            {p.nombreCandidato}
                          </Link>
                        </td>
                        <td style={tdStyle}><span style={vacanteTitleStyle}>{p.titulo}</span></td>
                        <td style={tdStyle}>
                           <div style={{ ...scoreStyle, color: p.scoreIa >= 80 ? '#10b981' : p.scoreIa >= 50 ? '#f59e0b' : '#64748b' }}>
                              {p.scoreIa}%
                           </div>
                        </td>
                        <td style={tdStyle}><span style={dateStyle}>{p.fechaPostulacion}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>

          {/* RIGHT: ALERTS & UTILITIES */}
          <div style={{ display: "grid", gap: 32, alignContent: "start" }}>
            
            {/* ALERTS SECTION */}
            <section style={{ ...panelStyle, padding: 24 }}>
              <header style={sidebarSectionHeaderStyle}>
                <h2 style={sidebarSectionTitleStyle}>Alertas de Operación</h2>
                {pendientes.length > 0 && <span style={counterBadgeStyle}>{pendientes.length}</span>}
              </header>
              
              <div style={actionListStyle}>
                {pendientes.length > 0 ? (
                  pendientes.slice(0, 4).map((item) => (
                    <article key={item.idRequisicion} style={alertRowStyle}>
                      <div style={{ flex: 1 }}>
                        <strong style={alertCodeStyle}>{item.codigoRequisicion}</strong>
                        <span style={alertPuestoStyle}>{item.tituloPuesto}</span>
                      </div>
                      <RhStatusBadge value={item.estadoActual} />
                    </article>
                  ))
                ) : (
                  <div style={emptyStateStyle}>
                    <p style={{ margin: 0 }}>Flujo al día.</p>
                  </div>
                )}
              </div>
            </section>

            {/* LOCATION STATS */}
            <section style={panelStyle}>
               <header style={sidebarSectionHeaderStyle}>
                  <h2 style={sidebarSectionTitleStyle}>Distribución Territorial</h2>
                  <i className="fa-solid fa-map-location-dot" style={{ color: '#94a3b8' }}></i>
               </header>
               <div style={{ display: 'grid', gap: 16 }}>
                  {locationStats.map((loc) => (
                    <div key={loc.name} style={{ display: 'grid', gap: 6 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800 }}>
                          <span style={{ color: '#334155' }}>{loc.name.toUpperCase()}</span>
                          <span style={{ color: '#DA291C' }}>{loc.count}</span>
                       </div>
                       <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${(loc.count / vacantes.length) * 100}%`, height: '100%', background: '#DA291C' }} />
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* QUICK LINKS */}
            <section style={{ ...panelStyle, background: "#0f172a", color: "#fff", padding: 24, borderColor: "#1e293b" }}>
              <h2 style={{ ...sectionTitleStyle, color: "#fff", marginBottom: 20 }}>Atajos Rápidos</h2>
              <div style={shortcutGridStyle}>
                <ShortcutBtn icon="fa-file-pdf" label="Descriptores" to="/app/vacantes/rh/descriptores" />
                <ShortcutBtn icon="fa-ban" label="Lista Negra" to="/app/vacantes/rh/lista-negra" />
                <ShortcutBtn icon="fa-chart-pie" label="Reportes" to="/app/vacantes/rh/reportes" />
                <ShortcutBtn icon="fa-user-group" label="Ternas" to="/app/vacantes/rh/terna" />
              </div>
            </section>

          </div>
        </div>
      </RhShell>
    </PermisoGuard>
  );
}

function MetricBox({ label, value, icon, color = "#1e293b" }: { label: string; value: number | string; icon: string; color?: string }) {
  return (
    <div style={metricBoxStyle}>
      <div style={{ ...metricIconStyle, color }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <strong style={metricValueStyle}>{value}</strong>
        <span style={metricLabelStyle}>{label}</span>
      </div>
    </div>
  );
}

function ShortcutBtn({ icon, label, to }: { icon: string; label: string; to: string }) {
  return (
    <Link to={to} style={shortcutBtnStyle}>
      <i className={`fa-solid ${icon}`} style={{ fontSize: 16 }}></i>
      <span>{label}</span>
    </Link>
  );
}

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} style={tdStyle}>
              <div className="skeleton" style={{ height: 20, borderRadius: 4 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ---------- STYLES ---------- */

const kpiGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 40 };
const metricBoxStyle: CSSProperties = { ...panelStyle, padding: "20px", display: "flex", alignItems: "center", gap: 16 };
const metricIconStyle: CSSProperties = { width: 44, height: 44, borderRadius: "12px", background: "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 };
const metricValueStyle: CSSProperties = { display: "block", fontSize: 24, fontWeight: 900, color: "#1e293b" };
const metricLabelStyle: CSSProperties = { fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" };

const mainLayoutGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 };
const tableHeaderStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" };
const sectionTitleStyle: CSSProperties = { margin: 0, fontSize: 15, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px" };
const viewAllLinkStyle: CSSProperties = { color: "#DA291C", fontSize: 11, fontWeight: 900, textDecoration: "none" };

const tableContainerStyle: CSSProperties = { padding: "0 12px 12px" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const thStyle: CSSProperties = { textAlign: "left", padding: "16px 12px", fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" };
const trStyle: CSSProperties = { borderBottom: "1px solid #f8fafc", transition: "background 0.2s" };
const tdStyle: CSSProperties = { padding: "16px 12px", verticalAlign: "middle" };

const codeStyle: CSSProperties = { fontSize: 10, fontWeight: 900, color: "#cbd5e1", fontFamily: "monospace" };
const titleStyle: CSSProperties = { fontSize: 14, fontWeight: 700, color: "#334155" };
const countBoxStyle: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#f1f5f9", borderRadius: "8px", fontSize: 12, fontWeight: 800, color: "#475569" };
const iconBtnStyle: CSSProperties = { width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none", fontSize: 14 };

const candidateLinkStyle: CSSProperties = { fontSize: 14, fontWeight: 800, color: "#DA291C", textDecoration: "none" };
const vacanteTitleStyle: CSSProperties = { fontSize: 13, fontWeight: 600, color: "#64748b" };
const scoreStyle: CSSProperties = { fontSize: 15, fontWeight: 900 };
const dateStyle: CSSProperties = { fontSize: 12, color: "#94a3b8", fontWeight: 600 };

const sidebarSectionHeaderStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 };
const sidebarSectionTitleStyle: CSSProperties = { margin: 0, fontSize: 13, fontWeight: 900, color: "#1e293b" };
const counterBadgeStyle: CSSProperties = { background: "#DA291C", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: "6px" };

const actionListStyle: CSSProperties = { display: "grid", gap: 12 };
const alertRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" };
const alertCodeStyle: CSSProperties = { display: "block", fontSize: 11, fontWeight: 800, color: "#94a3b8" };
const alertPuestoStyle: CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: "#1e293b" };

const shortcutGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const shortcutBtnStyle: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px", background: "rgba(255,255,255,0.05)", borderRadius: "14px", textDecoration: "none", color: "#fff", fontSize: 11, fontWeight: 800, transition: "background 0.2s" };

const searchWrapperStyle: CSSProperties = { position: "relative", width: 240 };
const searchIconStyle: CSSProperties = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13 };
const searchFieldStyle: CSSProperties = { width: "100%", height: 42, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0 16px 0 40px", fontSize: 13, outline: "none", transition: "border-color 0.2s" };

const primaryBtnStyle: CSSProperties = { textDecoration: "none", background: "#DA291C", color: "#fff", padding: "0 20px", borderRadius: "12px", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", gap: 8, height: 42, boxShadow: "0 10px 15px -3px rgba(218, 41, 28, 0.2)" };
const emptyStateStyle: CSSProperties = { padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: 12, fontWeight: 600 };

