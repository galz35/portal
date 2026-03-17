import { useDeferredValue, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

import { categoriaLabel, normalizarTexto } from "../../publico/lib/vacantesCatalogo";
import { getPortalMe } from "../../../shared/api/coreSessionApi";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import { cambiarEstadoPostulacionRh, listarPostulacionesRh, type PostulacionRh } from "../../../shared/api/vacantesApi";
import RhShell, { panelStyle } from "../components/RhShell";
import RhStatusBadge from "../components/RhStatusBadge";

type RhFilters = {
  query: string;
  estado: string;
  origen: string;
  departamento: string;
  categoria: string;
  licencia: boolean;
  vehiculo: boolean;
  viajar: boolean;
};

const FILTROS_INICIALES: RhFilters = {
  query: "",
  estado: "",
  origen: "",
  departamento: "",
  categoria: "",
  licencia: false,
  vehiculo: false,
  viajar: false,
};

export default function RhPostulacionesPage() {
  const [items, setItems] = useState<PostulacionRh[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RhFilters>(FILTROS_INICIALES);
  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    void listarPostulacionesRh().then((data) => {
      setItems(data || []);
      setLoading(false);
    });
  }, []);

  const availableEstados = useMemo(() => Array.from(new Set(items.map((item) => item.estadoActual).filter(Boolean))).sort(), [items]);
  const availableDepartments = useMemo(() => Array.from(new Set(items.map((item) => item.departamentoResidencia?.trim()).filter(Boolean) as string[])).sort(), [items]);

  const filteredItems = useMemo(() => {
    const query = normalizarTexto(deferredQuery);
    return items.filter((item) => {
      if (query) {
        const searchable = normalizarTexto([
          item.nombreCandidato, item.titulo, item.departamentoResidencia, item.municipioResidencia
        ].join(" "));
        if (!query.split(" ").filter(Boolean).every(t => searchable.includes(t))) return false;
      }
      if (filters.estado && item.estadoActual !== filters.estado) return false;
      if (filters.origen && item.origenPostulacion !== filters.origen) return false;
      if (filters.departamento && item.departamentoResidencia !== filters.departamento) return false;
      if (filters.categoria && item.categoriaInteres !== filters.categoria) return false;
      if (filters.licencia && !item.tieneLicenciaConducir) return false;
      if (filters.vehiculo && !item.tieneVehiculoPropio) return false;
      if (filters.viajar && !item.disponibilidadViajar) return false;
      return true;
    });
  }, [deferredQuery, filters, items]);

  const stats = useMemo(() => ({
    total: filteredItems.length,
    matchAlto: filteredItems.filter(p => p.scoreIa >= 80).length,
    espera: filteredItems.filter(p => p.estadoActual === 'POSTULADO').length
  }), [filteredItems]);

  async function moveState(idPostulacion: number, origenPostulacion: string, estadoNuevo: string) {
    const identity = await getPortalMe();
    if (!identity?.idCuentaPortal) { setStatus("No hay sesión RH activa"); return; }
    const result = await cambiarEstadoPostulacionRh(idPostulacion, estadoNuevo, identity.idCuentaPortal, origenPostulacion);
    if (result?.ok) {
      setStatus(`Estado actualizado a ${estadoNuevo}`);
      setItems(await listarPostulacionesRh());
    }
  }

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="Gestión de Talento"
        title="Postulaciones Recibidas"
        description="Seguimiento detallado de candidatos, filtrado por competencias y estado de flujo."
      >
        <div style={pageGridStyle}>
          {/* SIDEBAR DE FILTROS */}
          <aside style={sidebarStyle}>
            <div style={filterPanelStyle}>
              <header style={sidebarHeaderStyle}>
                <h2 style={sidebarTitleStyle}><i className="fa-solid fa-sliders"></i> FILTROS</h2>
                <button type="button" style={resetLinkStyle} onClick={() => setFilters(FILTROS_INICIALES)}>Reset</button>
              </header>

              <div style={filterStackStyle}>
                <FormField label="Búsqueda rápida" placeholder="Nombre o cargo..." value={filters.query} onChange={(v: string) => setFilters(f => ({...f, query: v}))} />
                <FormSelect label="Estado del Proceso" value={filters.estado} options={availableEstados} onChange={(v: string) => setFilters(f => ({...f, estado: v}))} />
                <FormSelect label="Origen" value={filters.origen} options={[{ label: "Externo", value: "CANDIDATO_EXTERNO" }, { label: "Interno", value: "EMPLEADO_INTERNO" }]} onChange={(v: string) => setFilters(f => ({...f, origen: v}))} />
                <FormSelect label="Departamento" value={filters.departamento} options={availableDepartments} onChange={(v: string) => setFilters(f => ({...f, departamento: v}))} />

                <div style={fieldGroupStyle}>
                  <label style={fieldLabelStyle}>Movilidad</label>
                  <div style={toggleGridStyle}>
                    <TogglePill label="Licencia" active={filters.licencia} onClick={() => setFilters(f => ({...f, licencia: !f.licencia}))} />
                    <TogglePill label="Vehículo" active={filters.vehiculo} onClick={() => setFilters(f => ({...f, vehiculo: !f.vehiculo}))} />
                  </div>
                </div>
              </div>
            </div>

            <div style={miniStatsPanelStyle}>
               <h3 style={miniStatsTitleStyle}>RESUMEN FILTRADO</h3>
               <StatItem label="Candidatos" value={stats.total} />
               <StatItem label="Match IA > 80" value={stats.matchAlto} color="#10b981" />
               <StatItem label="Por procesar" value={stats.espera} color="#f59e0b" />
            </div>
          </aside>

          {/* LISTADO DE RESULTADOS (TABLA) */}
          <main style={resultsContainerStyle}>
            {status && <div style={statusBannerStyle}>{status}</div>}

            <div style={panelStyle}>
               <div style={tableWrapperStyle}>
                  <table style={tableStyle}>
                     <thead style={stickyTheadStyle}>
                        <tr>
                           <th style={thStyle}>CANDIDATO / POSICIÓN</th>
                           <th style={thStyle}>MATCH IA</th>
                           <th style={thStyle}>ESTADO</th>
                           <th style={thStyle}>RESIDENCIA</th>
                           <th style={thStyle}>ACCIONES</th>
                        </tr>
                     </thead>
                     <tbody>
                        {loading ? <TableSkeleton /> : filteredItems.map(item => (
                           <tr key={item.idPostulacion} style={trStyle}>
                              <td style={tdStyle}>
                                 <div style={identityCellStyle}>
                                    <div style={initialsAvatarStyle}>{item.nombreCandidato.charAt(0)}</div>
                                    <div style={{ display: "grid", gap: 2 }}>
                                       <Link 
                                          to={`/app/vacantes/rh/candidato/${item.idPostulacion}?origen=${encodeURIComponent(item.origenPostulacion)}`}
                                          style={candidateNameStyle}
                                       >
                                          {item.nombreCandidato}
                                       </Link>
                                       <span style={positionTextStyle}>{item.titulo}</span>
                                    </div>
                                 </div>
                              </td>
                              <td style={tdStyle}>
                                 <div style={{ ...scoreStyle, color: item.scoreIa >= 80 ? '#10b981' : item.scoreIa >= 50 ? '#f59e0b' : '#64748b' }}>
                                    {item.scoreIa}%
                                 </div>
                              </td>
                              <td style={tdStyle}><RhStatusBadge value={item.estadoActual} /></td>
                              <td style={tdStyle}>
                                 <span style={locationTextStyle}>
                                    <i className="fa-solid fa-location-dot"></i> {item.departamentoResidencia || "N/A"}
                                 </span>
                              </td>
                              <td style={tdStyle}>
                                 <div style={actionBtnGroupStyle}>
                                    <Link 
                                       to={`/app/vacantes/rh/candidato/${item.idPostulacion}?origen=${encodeURIComponent(item.origenPostulacion)}`}
                                       style={btnExpedienteStyle}
                                       title="Ver Expediente"
                                    >
                                       <i className="fa-solid fa-folder-open"></i>
                                    </Link>
                                    <button 
                                       style={btnFastActionStyle} 
                                       onClick={() => void moveState(item.idPostulacion, item.origenPostulacion, "PRE_SELECCIONADO")}
                                       title="Avanzar Proceso"
                                    >
                                       <i className="fa-solid fa-angles-right"></i>
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  
                  {!loading && filteredItems.length === 0 && (
                    <div style={emptyDataStyle}>
                       <i className="fa-solid fa-user-slash" style={{ fontSize: 32, marginBottom: 12, opacity: 0.2 }}></i>
                       <p>Sin resultados según filtros aplicados.</p>
                    </div>
                  )}
               </div>
            </div>
          </main>
        </div>
      </RhShell>
    </PermisoGuard>
  );
}

/* ---------- COMPONENTS ---------- */

function FormField({ label, placeholder, value, onChange }: any) {
  return (
    <div style={fieldGroupStyle}>
      <label style={fieldLabelStyle}>{label}</label>
      <input style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function FormSelect({ label, value, options, onChange }: any) {
  return (
    <div style={fieldGroupStyle}>
      <label style={fieldLabelStyle}>{label}</label>
      <select style={inputStyle} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">TODOS</option>
        {options.map((o: any) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TogglePill({ label, active, onClick }: any) {
  return (
    <button type="button" onClick={onClick} style={{ ...pillStyle, ...(active ? pillActiveStyle : {}) }}>{label}</button>
  );
}

function StatItem({ label, value, color }: any) {
   return (
      <div style={statItemStyle}>
         <span style={statLabelStyle}>{label}</span>
         <strong style={{ ...statValueStyle, color: color || '#1e293b' }}>{value}</strong>
      </div>
   );
}

function TableSkeleton() {
   return <>{Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5} style={{ padding: 20 }}><div className="skeleton" style={{ height: 40, borderRadius: 8 }} /></td></tr>)}</>;
}

/* ---------- STYLES ---------- */

const pageGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "280px 1fr", gap: 32 };
const sidebarStyle: CSSProperties = { display: "grid", gap: 24, alignContent: "start" };
const filterPanelStyle: CSSProperties = { ...panelStyle, padding: "24px" };
const sidebarHeaderStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 };
const sidebarTitleStyle: CSSProperties = { margin: 0, fontSize: 13, fontWeight: 900, color: "#94a3b8", display: "flex", alignItems: "center", gap: 8 };
const resetLinkStyle: CSSProperties = { background: "none", border: "none", color: "#DA291C", fontSize: 11, fontWeight: 800, cursor: "pointer", textTransform: "uppercase" };

const filterStackStyle: CSSProperties = { display: "grid", gap: 20 };
const fieldGroupStyle: CSSProperties = { display: "grid", gap: 6 };
const fieldLabelStyle: CSSProperties = { fontSize: 10, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" };
const inputStyle: CSSProperties = { width: "100%", height: 42, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0 12px", fontSize: 13, outline: "none" };

const toggleGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 };
const pillStyle: CSSProperties = { padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontSize: 11, fontWeight: 700, color: "#64748b", cursor: "pointer" };
const pillActiveStyle: CSSProperties = { background: "#1e293b", color: "#fff", borderColor: "#1e293b" };

const miniStatsPanelStyle: CSSProperties = { ...panelStyle, padding: 20, background: "#f8fafc" };
const miniStatsTitleStyle: CSSProperties = { margin: "0 0 16px", fontSize: 10, fontWeight: 900, color: "#94a3b8", letterSpacing: "1px" };
const statItemStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" };
const statLabelStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: "#64748b" };
const statValueStyle: CSSProperties = { fontSize: 14, fontWeight: 900 };

const resultsContainerStyle: CSSProperties = { display: "grid", gap: 20 };
const tableWrapperStyle: CSSProperties = { overflowX: "auto" };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const stickyTheadStyle: CSSProperties = { position: "sticky", top: 0, background: "#fff", zIndex: 10 };
const thStyle: CSSProperties = { textAlign: "left", padding: "16px 20px", fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9" };
const trStyle: CSSProperties = { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" };
const tdStyle: CSSProperties = { padding: "16px 20px", verticalAlign: "middle" };

const identityCellStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 14 };
const initialsAvatarStyle: CSSProperties = { width: 36, height: 36, background: "#f1f5f9", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#475569" };
const candidateNameStyle: CSSProperties = { fontSize: 14, fontWeight: 800, color: "#1e293b", textDecoration: "none" };
const positionTextStyle: CSSProperties = { fontSize: 11, fontWeight: 700, color: "#DA291C" };

const scoreStyle: CSSProperties = { fontSize: 16, fontWeight: 900 };
const locationTextStyle: CSSProperties = { fontSize: 13, fontWeight: 600, color: "#64748b" };

const actionBtnGroupStyle: CSSProperties = { display: "flex", gap: 8 };
const btnExpedienteStyle: CSSProperties = { width: 36, height: 36, borderRadius: "10px", background: "#f1f5f9", color: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 14 };
const btnFastActionStyle: CSSProperties = { width: 36, height: 36, borderRadius: "10px", background: "#fff", border: "1px solid #e2e8f0", color: "#10b981", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };

const statusBannerStyle: CSSProperties = { padding: "12px 24px", background: "#f0fdf4", color: "#166534", borderRadius: "14px", border: "1px solid #dcfce7", fontSize: 13, fontWeight: 800 };
const emptyDataStyle: CSSProperties = { padding: "60px", textAlign: "center", color: "#cbd5e1", fontSize: 14, fontWeight: 700 };


