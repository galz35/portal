import { useEffect, useState, useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import { 
  cambiarEstadoVacanteRh, 
  listarRhVacantes, 
  listarPostulacionesRh,
  type RhVacante,
  type PostulacionRh 
} from "../../../shared/api/vacantesApi";
import { getPortalMe } from "../../../shared/api/coreSessionApi";
import RhShell, { panelStyle } from "../components/RhShell";
import RhStatusBadge from "../components/RhStatusBadge";

export default function RhVacantesPage() {
  const [vacantes, setVacantes] = useState<RhVacante[]>([]);
  const [postulaciones, setPostulaciones] = useState<PostulacionRh[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  async function loadData() {
    setLoading(true);
    const [vData, pData, me] = await Promise.all([
      listarRhVacantes(),
      listarPostulacionesRh(),
      getPortalMe()
    ]);
    setVacantes(vData || []);
    setPostulaciones(pData || []);
    setCurrentUser(me);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const vacantesEnriched = useMemo(() => {
    return vacantes.map(v => ({
      ...v,
      candidatos: postulaciones.filter(p => p.idVacante === v.idVacante).length
    }));
  }, [vacantes, postulaciones]);

  const filteredItems = useMemo(() => {
    let result = vacantesEnriched;
    
    if (showOnlyMine && currentUser?.idCuentaPortal) {
      result = result.filter(v => v.idResponsableRh === currentUser.idCuentaPortal);
    }

    if (!search) return result;
    const q = search.toLowerCase();
    return result.filter(v => 
      v.titulo.toLowerCase().includes(q) || 
      v.codigoVacante.toLowerCase().includes(q)
    );
  }, [vacantesEnriched, search, showOnlyMine, currentUser]);

  const getRecruiterName = (id?: number) => {
    if (!id) return "Sin asignar";
    // Mapeo sugerido por el usuario para realismo
    const team: Record<number, string> = {
      1: "Yesenia Manzares", // Coord
      25: "Kevin Barahona",
      3: "Francis Villarreal",
      4: "Arlen Riveras"
    };
    return team[id] || `Reclutador #${id}`;
  };

  async function handleEstado(idVacante: number, estadoNuevo: string) {
    const identity = await getPortalMe();
    if (!identity?.idCuentaPortal) { setStatus("No hay sesión RH activa"); return; }
    const result = await cambiarEstadoVacanteRh(idVacante, estadoNuevo, identity.idCuentaPortal, `Acción rápida: ${estadoNuevo}`);
    if (result?.ok) {
      setStatus(`Vacante actualizada a ${estadoNuevo}`);
      await loadData();
    }
  }

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="Operaciones de Talento"
        title="Gestión de Vacantes"
        description="Panel administrativo para el control de plazas vigentes, estados de publicación y monitoreo de demanda."
        actions={
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div 
               onClick={() => setShowOnlyMine(!showOnlyMine)} 
               style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8, 
                  background: showOnlyMine ? "#1e293b" : "#f1f5f9", 
                  color: showOnlyMine ? "#fff" : "#475569",
                  padding: "0 16px",
                  height: 42,
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s"
               }}
            >
               <i className={`fa-solid ${showOnlyMine ? 'fa-check-circle' : 'fa-circle'}`}></i>
               MIS VACANTES
            </div>
            <div style={searchBoxStyle}>
               <i className="fa-solid fa-magnifying-glass" style={searchIconStyle}></i>
               <input 
                 placeholder="Filtrar por código o título..." 
                 style={searchInputStyle} 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
               />
            </div>
            <Link to="/app/vacantes/rh/vacantes/nueva" style={primaryButtonStyle}>
              <i className="fa-solid fa-plus"></i> NUEVA VACANTE
            </Link>
          </div>
        }
      >
        <section style={panelStyle}>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead style={stickyTheadStyle}>
                <tr>
                  <th style={thStyle}>CÓDIGO</th>
                  <th style={thStyle}>TÍTULO DE POSICIÓN</th>
                  <th style={thStyle}>ESTADO</th>
                  <th style={thStyle}>RECLUTADOR</th>
                  <th style={thStyle}>CANDIDATOS</th>
                  <th style={thStyle}>ACCIONES RÁPIDAS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <TableSkeleton /> : filteredItems.map((item) => (
                  <tr key={item.idVacante} style={trStyle}>
                    <td style={tdStyle}><span style={codeStyle}>{item.codigoVacante}</span></td>
                    <td style={tdStyle}>
                       <Link to={`/app/vacantes/rh/vacante/${item.idVacante}`} style={titleLinkStyle}>
                          {item.titulo}
                       </Link>
                    </td>
                    <td style={tdStyle}><RhStatusBadge value={item.estadoActual} /></td>
                    <td style={tdStyle}>
                       <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                          <i className="fa-solid fa-user-tie" style={{ marginRight: 6 }}></i>
                          {getRecruiterName(item.idResponsableRh)}
                       </span>
                    </td>
                    <td style={tdStyle}>
                       <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={countLabelStyle}>{item.candidatos}</span>
                          <Link to="/app/vacantes/rh/postulaciones" style={viewPostsStyle}>VER LISTADO</Link>
                       </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={btnGroupStyle}>
                        {item.estadoActual !== "PUBLICADA" && (
                          <button onClick={() => void handleEstado(item.idVacante, "PUBLICADA")} style={miniActionBtnStyle} title="Publicar">
                             <i className="fa-solid fa-upload"></i>
                          </button>
                        )}
                        {item.estadoActual === "PUBLICADA" && (
                          <button onClick={() => void handleEstado(item.idVacante, "PAUSADA")} style={miniActionBtnStyle} title="Pausar">
                             <i className="fa-solid fa-pause"></i>
                          </button>
                        )}
                        <button onClick={() => void handleEstado(item.idVacante, "CERRADA")} style={{ ...miniActionBtnStyle, color: '#ef4444' }} title="Cerrar">
                           <i className="fa-solid fa-box-archive"></i>
                        </button>
                        <Link to={`/app/vacantes/rh/vacante/${item.idVacante}`} style={miniActionBtnStyle} title="Ver Reporte">
                           <i className="fa-solid fa-chart-column"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!loading && filteredItems.length === 0 && (
              <div style={emptyStateStyle}>No se encontraron registros activos.</div>
            )}
          </div>
        </section>

        {status && <div style={floatingStatusStyle}>{status}</div>}
      </RhShell>
    </PermisoGuard>
  );
}

function TableSkeleton() {
   return <>{Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5} style={{ padding: 24 }}><div className="skeleton" style={{ height: 32, borderRadius: 8 }} /></td></tr>)}</>;
}

/* ---------- STYLES ---------- */

const tableWrapperStyle: CSSProperties = { overflowX: "auto" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const stickyTheadStyle: CSSProperties = { position: "sticky", top: 0, background: "#fff", zIndex: 10 };
const thStyle: CSSProperties = { textAlign: "left", padding: "16px 24px", fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" };
const trStyle: CSSProperties = { borderBottom: "1px solid #f8fafc", transition: "background 0.2s" };
const tdStyle: CSSProperties = { padding: "16px 24px", verticalAlign: "middle" };

const codeStyle: CSSProperties = { fontSize: 12, fontWeight: 900, color: "#cbd5e1", fontFamily: "monospace" };
const titleLinkStyle: CSSProperties = { fontSize: 14, fontWeight: 800, color: "#1e293b", textDecoration: "none" };
const countLabelStyle: CSSProperties = { fontSize: 15, fontWeight: 900, color: "#0f172a" };
const viewPostsStyle: CSSProperties = { fontSize: 10, fontWeight: 800, color: "#DA291C", textDecoration: "none", textTransform: "uppercase" };

const btnGroupStyle: CSSProperties = { display: "flex", gap: 10 };
const miniActionBtnStyle: CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", width: 34, height: 34, borderRadius: "8px", color: "#64748b", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" };

const searchBoxStyle: CSSProperties = { position: "relative", width: 300 };
const searchIconStyle: CSSProperties = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 };
const searchInputStyle: CSSProperties = { width: "100%", height: 42, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0 16px 0 40px", fontSize: 13, outline: "none" };

const primaryButtonStyle: CSSProperties = { textDecoration: "none", background: "#DA291C", color: "#fff", padding: "0 24px", borderRadius: "12px", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", gap: 8, height: 42, boxShadow: "0 8px 15px -3px rgba(218, 41, 28, 0.2)" };
const floatingStatusStyle: CSSProperties = { position: "fixed", bottom: 40, right: 40, background: "#1e293b", color: "#fff", padding: "16px 24px", borderRadius: "16px", fontWeight: 700, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)", zIndex: 1000 };
const emptyStateStyle: CSSProperties = { padding: "60px", textAlign: "center", color: "#94a3b8", fontWeight: 600 };

