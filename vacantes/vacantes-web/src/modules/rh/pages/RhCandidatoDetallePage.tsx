import { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import { 
  cambiarEstadoPostulacionRh, 
  listarRhVacantes, 
  obtenerDetallePostulacionRh, 
  postularEnOtraVacanteRh, 
  type RhCvArchivo, 
  type RhPostulacionDetalle, 
  type RhVacante 
} from "../../../shared/api/vacantesApi";
import { getPortalMe } from "../../../shared/api/coreSessionApi";
import RhShell, { panelStyle } from "../components/RhShell";
import RhStatusBadge from "../components/RhStatusBadge";

export default function RhCandidatoDetallePage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [detail, setDetail] = useState<RhPostulacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [showReutilizar, setShowReutilizar] = useState(false);

  const id = Number(params.id);
  const origen = searchParams.get("origen") ?? "";

  async function loadDetail() {
    if (!Number.isFinite(id) || id <= 0 || !origen) {
      setError("Falta identificador de postulación.");
      setLoading(false);
      return;
    }
    const response = await obtenerDetallePostulacionRh(id, origen);
    if (!response?.ok) {
      setError("Error al cargar expediente.");
      setLoading(false);
      return;
    }
    setDetail(response);
    setLoading(false);
  }

  useEffect(() => {
    void loadDetail();
  }, [id, origen]);

  async function handleUpdateState(nuevoEstado: string) {
    const identity = await getPortalMe();
    if (!identity?.idCuentaPortal) { setStatus("No hay sesión RH activa"); return; }
    const result = await cambiarEstadoPostulacionRh(id, nuevoEstado, identity.idCuentaPortal, origen);
    if (result?.ok) {
      setStatus(`Cambio a ${nuevoEstado} exitoso`);
      await loadDetail();
    }
  }

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="Expediente Digital"
        title={detail?.candidato?.nombre || "Cargando..."}
        description={`Postulación para: ${detail?.postulacion.titulo || "..."}`}
        actions={
          <div style={{ display: "flex", gap: 12 }}>
             <RhStatusBadge value={detail?.postulacion.estadoActual || ""} />
             <Link to="/app/vacantes/rh/postulaciones" style={backLinkStyle}>
                <i className="fa-solid fa-list"></i> LISTADO
             </Link>
          </div>
        }
      >
        {loading ? <div className="skeleton" style={{ height: 400, borderRadius: 20 }} /> : null}
        {error ? <div style={errorStyle}>{error}</div> : null}

        {!loading && detail ? (
          <div style={detailLayoutGrid}>
            
            {/* LEFT: CORE INFO */}
            <div style={{ display: "grid", gap: 24 }}>
              
              <section style={panelStyle}>
                <h3 style={sectionTitleStyle}>Datos de Identificación y Contacto</h3>
                <div style={dataGridStyle}>
                  <DataItem label="Candidato" value={detail.candidato?.nombre} />
                  <DataItem label="Correo" value={detail.candidato?.correo} />
                  <DataItem label="Teléfono" value={detail.candidato?.telefono} />
                  <DataItem label="Ubicación" value={`${detail.candidato?.departamentoResidencia}, ${detail.candidato?.municipioResidencia}`} />
                  <DataItem label="Nivel Académico" value={detail.candidato?.nivelAcademico} />
                  <DataItem label="Categoría" value={detail.candidato?.categoriaInteres} />
                </div>
              </section>

              <section style={panelStyle}>
                <h3 style={sectionTitleStyle}>Evaluación y Documentación</h3>
                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32, padding: 20 }}>
                   <div style={scoreBoxStyle}>
                      <span style={scoreLabelStyle}>MATCH IA</span>
                      <strong style={{ ...scoreValueStyle, color: detail.postulacion.scoreIa >= 80 ? '#10b981' : '#f59e0b' }}>
                        {formatScore(detail.postulacion.scoreIa)}
                      </strong>
                   </div>
                   <div style={{ display: "grid", gap: 16 }}>
                      <div style={cvHeaderStyle}>
                         <i className="fa-solid fa-file-pdf" style={{ color: '#DA291C', fontSize: 24 }}></i>
                         <div style={{ flex: 1 }}>
                            <strong style={{ display: "block", fontSize: 13 }}>{detail.cv.actual?.nombreOriginal || "Curriculum.pdf"}</strong>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatBytes(detail.cv.actual?.tamanoBytes || 0)} • {detail.cv.actual?.fechaCreacion}</span>
                         </div>
                         <button style={btnActionTableStyle}><i className="fa-solid fa-download"></i></button>
                      </div>
                      <div style={resumenPillStyle}>
                         <strong style={resumenTitleStyle}>RESUMEN PROFESIONAL EXTRAÍDO</strong>
                         <p style={resumenTextStyle}>{detail.candidato?.resumenProfesional || "Sin resumen disponible."}</p>
                      </div>
                   </div>
                </div>
              </section>

              {/* Control de Cumplimiento (Oculto por ahora) */}
              {/* 
              <section style={panelStyle}>
                <h3 style={sectionTitleStyle}>Control de Cumplimiento</h3>
                ...
              </section> 
              */}

              {detail.cv.historial.length > 0 && (
                <section style={panelStyle}>
                  <h3 style={sectionTitleStyle}>Historial de Documentos</h3>
                  <div style={{ padding: "0 20px 20px" }}>
                    {detail.cv.historial.map((h, i) => (
                      <div key={i} style={historyRowStyle}>
                        <span>{h.nombreOriginal}</span>
                        <span style={{ opacity: 0.5 }}>{h.fechaCreacion}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT: ACTIONS & STATUS */}
            <aside style={{ display: "grid", gap: 24, alignContent: "start" }}>
              <section style={{ ...panelStyle, background: "#1e293b", color: "#fff", borderColor: "#1e293b" }}>
                <h3 style={{ ...sectionTitleStyle, color: "#fff", borderBottomColor: "rgba(255,255,255,0.1)" }}>Acciones de Flujo</h3>
                <div style={workflowStackStyle}>
                  <button onClick={() => void handleUpdateState("REVISION_RH")} style={btnWorkflowStyle}>A REVISIÓN RH</button>
                  <button onClick={() => void handleUpdateState("ENTREVISTA")} style={{ ...btnWorkflowStyle, background: "#3b82f6", color: "#fff" }}>AGENDAR ENTREVISTA</button>
                  <button onClick={() => void handleUpdateState("DOCUMENTACION")} style={{ ...btnWorkflowStyle, background: "#8b5cf6", color: "#fff" }}>LLENAR DOCUMENTACIÓN</button>
                  <button onClick={() => void handleUpdateState("TERNA")} style={{ ...btnWorkflowStyle, background: "#f59e0b", color: "#fff" }}>PASAR A TERNA</button>
                  <div style={dividerStyle} />
                  <button onClick={() => void handleUpdateState("CONTRATADO")} style={{ ...btnWorkflowStyle, background: "#10b981", color: "#fff" }}>FINALIZAR: CONTRATADO</button>
                  <button onClick={() => void handleUpdateState("DESCARTADO")} style={{ ...btnWorkflowStyle, background: "#ef4444", color: "#fff" }}>DESCARTAR</button>
                  
                  <div style={dividerStyle} />
                  <button 
                    onClick={() => setShowReutilizar(true)} 
                    style={{ ...btnWorkflowStyle, border: '1px dashed rgba(255,255,255,0.3)', background: 'transparent' }}
                  >
                    <i className="fa-solid fa-recycle" style={{ marginRight: 8 }}></i>
                    REUTILIZAR EN OTRA VACANTE
                  </button>
                </div>
              </section>

              {showReutilizar && (
                <ReutilizarModal 
                  idCandidato={detail.candidato?.idCandidato || detail.candidato?.idPersona || 0}
                  origen={origen}
                  onClose={() => setShowReutilizar(false)} 
                />
              )}

              {status && <div style={statusBannerStyle}>{status}</div>}
            </aside>

          </div>
        ) : null}
      </RhShell>
    </PermisoGuard>
  );
}

function DataItem({ label, value }: { label: string; value: any }) {
  return (
    <div style={dataItemStyle}>
      <span style={dataLabelStyle}>{label}</span>
      <strong style={dataValueStyle}>{value || "N/A"}</strong>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 B";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatScore(value?: number | null) {
  return typeof value === "number" ? `${(value * 1).toFixed(0)}%` : "N/A";
}

/* ---------- STYLES ---------- */

/* ---------- SUB-COMPONENTS ---------- */

function ReutilizarModal({ idCandidato, origen, onClose }: { idCandidato: number, origen: string, onClose: () => void }) {
  const [vacantes, setVacantes] = useState<RhVacante[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    void listarRhVacantes().then((data: RhVacante[]) => {
      setVacantes(data?.filter((v: RhVacante) => v.estadoActual === 'PUBLICADA') || []);
      setLoading(false);
    });
  }, []);

  async function handleConfirm() {
    if (!selected) return;
    setBusy(true);
    const identity = await getPortalMe();
    const res = await postularEnOtraVacanteRh({
      idVacante: Number(selected),
      origen,
      id: idCandidato,
      idCuentaPortal: identity?.idCuentaPortal || 0
    });

    if (res?.ok) {
      setStatus("Candidato postulado exitosamente en la nueva vacante.");
      setTimeout(onClose, 2000);
    } else {
      setStatus("Error: " + (res?.message || "No se pudo realizar la acción"));
      setBusy(false);
    }
  }

  return (
    <div style={modalOverlayStyle}>
       <div style={modalContentStyle}>
          <header style={modalHeaderStyle}>
             <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>REUTILIZAR CANDIDATO</h3>
             <button onClick={onClose} style={closeBtnStyle}>&times;</button>
          </header>
          
          <div style={{ padding: 24 }}>
             <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>
                Selecciona la vacante donde deseas postular nuevamente a este candidato. Se creará un nuevo registro de postulación.
             </p>

             {loading ? <p>Cargando vacantes vigentes...</p> : (
               <select 
                  style={modalInputStyle} 
                  value={selected} 
                  onChange={e => setSelected(e.target.value)}
                  disabled={busy}
               >
                  <option value="">-- Seleccionar Vacante Destino --</option>
                  {vacantes.map(v => (
                    <option key={v.idVacante} value={v.idVacante}>[{v.codigoVacante}] {v.titulo}</option>
                  ))}
               </select>
             )}

             {status && <p style={{ color: status.includes("Error") ? "#ef4444" : "#10b981", fontSize: 13, fontWeight: 700, marginTop: 16 }}>{status}</p>}

             <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                <button onClick={onClose} style={modalSecondaryBtnStyle} disabled={busy}>CANCELAR</button>
                <button 
                  onClick={handleConfirm} 
                  style={{ ...modalPrimaryBtnStyle, opacity: (!selected || busy) ? 0.5 : 1 }} 
                  disabled={!selected || busy}
                >
                  {busy ? "PROCESANDO..." : "CONFIRMAR POSTULACIÓN"}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const modalOverlayStyle: CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(4px)" };
const modalContentStyle: CSSProperties = { background: "#fff", width: 500, borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden" };
const modalHeaderStyle: CSSProperties = { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" };
const closeBtnStyle: CSSProperties = { background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#94a3b8" };
const modalInputStyle: CSSProperties = { width: "100%", height: 48, borderRadius: 12, border: "1px solid #e2e8f0", padding: "0 16px", fontSize: 14, outline: "none", background: "#f8fafc" };
const modalPrimaryBtnStyle: CSSProperties = { flex: 1, height: 48, background: "#DA291C", color: "#fff", border: "none", borderRadius: 12, fontWeight: 900, fontSize: 13, cursor: "pointer" };
const modalSecondaryBtnStyle: CSSProperties = { flex: 1, height: 48, background: "#f1f5f9", color: "#1e293b", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer" };

const detailLayoutGrid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 };
const sectionTitleStyle: CSSProperties = { margin: 0, padding: "16px 20px", fontSize: 13, fontWeight: 900, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9" };

const dataGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#f1f5f9", border: "1px solid #f1f5f9" };
const dataItemStyle: CSSProperties = { padding: "16px 20px", background: "#fff", display: "grid", gap: 4 };
const dataLabelStyle: CSSProperties = { fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" };
const dataValueStyle: CSSProperties = { fontSize: 14, color: "#1e293b", fontWeight: 700 };

const scoreBoxStyle: CSSProperties = { background: "#f8fafc", borderRadius: "16px", padding: 24, textAlign: "center", display: "grid", alignContent: "center", gap: 8 };
const scoreLabelStyle: CSSProperties = { fontSize: 10, fontWeight: 900, color: "#94a3b8" };
const scoreValueStyle: CSSProperties = { fontSize: 42, fontWeight: 950 };

const cvHeaderStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#f1f5f9", borderRadius: "12px" };
const btnActionTableStyle: CSSProperties = { width: 32, height: 32, borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#475569" };

const resumenPillStyle: CSSProperties = { padding: 16, background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" };
const resumenTitleStyle: CSSProperties = { display: "block", fontSize: 10, fontWeight: 900, color: "#64748b", marginBottom: 8 };
const resumenTextStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.6 };

const historyRowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f8fafc", fontSize: 12, fontWeight: 600, color: "#64748b" };

const workflowStackStyle: CSSProperties = { padding: 20, display: "grid", gap: 12 };
const btnWorkflowStyle: CSSProperties = { width: "100%", height: 42, borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 12, fontWeight: 900, cursor: "pointer", transition: "all 0.2s" };
const dividerStyle: CSSProperties = { height: 1, background: "rgba(255,255,255,0.1)", margin: "8px 0" };

const backLinkStyle: CSSProperties = { textDecoration: "none", background: "#fff", color: "#1e293b", border: "1px solid #e2e8f0", height: 40, padding: "0 16px", borderRadius: "10px", display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 900 };
const statusBannerStyle: CSSProperties = { padding: "12px", background: "#DA291C", color: "#fff", borderRadius: "12px", textAlign: "center", fontSize: 12, fontWeight: 800 };
const errorStyle: CSSProperties = { padding: 20, background: "#fee2e2", color: "#991b1b", borderRadius: 16, fontWeight: 700, marginBottom: 20 };
const complianceBoxStyle: CSSProperties = { padding: 16, background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 14 };


