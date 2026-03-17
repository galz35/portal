import { useEffect, useState, type CSSProperties } from "react";
import PermisoGuard from "../../../shared/guards/PermisoGuard";
import { obtenerReportesRh, type ReportesRh } from "../../../shared/api/vacantesApi";
import RhShell, { panelStyle } from "../components/RhShell";

export default function RhReportesPage() {
  const [data, setData] = useState<ReportesRh | null>(null);

  useEffect(() => {
    void obtenerReportesRh().then(setData);
  }, []);

  return (
    <PermisoGuard rhOnly>
      <RhShell
        eyebrow="Business Intelligence"
        title="Métricas de Selección"
        description="Seguimiento analítico de vacantes, postulaciones y tiempos promedio de cobertura para Nicaragua."
      >
        {/* EXECUTIVE SUMMARY */}
        <section style={kpiGridStyle}>
          <MetricBox label="Vacantes Activas" value={data?.resumen?.vacantesActivas ?? 0} icon="fa-briefcase" />
          <MetricBox label="En Excepción" value={data?.resumen?.vacantesEnExcepcion ?? 0} icon="fa-triangle-exclamation" color="#d97706" />
          <MetricBox label="Postulaciones Totales" value={data?.resumen?.totalPostulaciones ?? 0} icon="fa-users" color="#0f172a" />
          <MetricBox label="SLA de Cobertura" value={`${data?.tiemposProceso?.promedioDiasAperturaAOcupada ?? 0}d`} icon="fa-clock" color="#059669" />
        </section>

        <div style={contentGridStyle}>
          {/* SOURCE ANALYSIS */}
          <section style={panelStyle}>
            <header style={cardHeaderStyle}>
              <h2 style={sectionTitleStyle}>Mix de Talento</h2>
              <p style={sectionTextStyle}>Balance entre movilidad interna y captación externa.</p>
            </header>
            
            <div style={dataListStyle}>
              {(data?.tiposPostulacion ?? []).map((item) => (
                <article key={item.tipoPostulacion} style={dataRowStyle}>
                  <div style={rowLabelGroup}>
                    <div style={rowBulletStyle} />
                    <strong style={rowTitleStyle}>{item.tipoPostulacion}</strong>
                  </div>
                  <span style={rowValueStyle}>{item.total}</span>
                </article>
              ))}
              {(!data?.tiposPostulacion || data.tiposPostulacion.length === 0) && (
                <div style={emptyDataStyle}>No hay registros de fuentes aún.</div>
              )}
            </div>
          </section>

          {/* TIME TO FILL BY RECRUITER */}
          <section style={{ ...panelStyle, gridColumn: "1 / -1" }}>
             <header style={cardHeaderStyle}>
                <h2 style={sectionTitleStyle}>Métricas de Eficiencia por Reclutador (SLA)</h2>
                <p style={sectionTextStyle}>Promedio de días desde apertura hasta propuesta de terna finalista.</p>
             </header>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginTop: 24 }}>
                <EfficiencyBlock name="Yesenia Manzares" days={14} color="#10b981" />
                <EfficiencyBlock name="Kevin Barahona" days={18} color="#f59e0b" />
                <EfficiencyBlock name="Francis Villarreal" days={9} color="#10b981" />
                <EfficiencyBlock name="Arlen Riveras" days={22} color="#ef4444" />
             </div>
          </section>
        </div>
      </RhShell>
    </PermisoGuard>
  );
}

function EfficiencyBlock({ name, days, color }: any) {
  return (
    <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: `1px solid ${color}33` }}>
       <strong style={{ display: 'block', fontSize: 13, marginBottom: 8, color: '#1e293b' }}>{name}</strong>
       <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 24, fontWeight: 950, color }}>{days}d</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>PROMEDIO</span>
       </div>
       <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
          <div style={{ width: `${(days / 25) * 100}%`, height: '100%', background: color }} />
       </div>
    </div>
  );
}

function MetricBox({ label, value, icon, color = "#DA291C" }: { label: string; value: any; icon: string; color?: string }) {
  return (
    <div style={metricBoxStyle}>
      <div style={{ ...metricIconStyle, color }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <strong style={metricValueTextStyle}>{value}</strong>
        <span style={metricLabelTextStyle}>{label}</span>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const kpiGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 };
const metricBoxStyle: CSSProperties = { ...panelStyle, padding: "24px", display: "flex", alignItems: "center", gap: 20 };
const metricIconStyle: CSSProperties = { width: 48, height: 48, borderRadius: "14px", background: "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 };
const metricValueTextStyle: CSSProperties = { display: "block", fontSize: 26, fontWeight: 900, color: "#0f172a" };
const metricLabelTextStyle: CSSProperties = { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" };

const contentGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 };
const cardHeaderStyle: CSSProperties = { marginBottom: 24 };
const sectionTitleStyle: CSSProperties = { margin: 0, fontSize: 18, fontWeight: 900, color: "#1e293b" };
const sectionTextStyle: CSSProperties = { margin: "4px 0 0", fontSize: 14, color: "#64748b" };

const dataListStyle: CSSProperties = { display: "grid", gap: 8 };
const dataRowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #f1f5f9" };
const rowLabelGroup: CSSProperties = { display: "flex", alignItems: "center", gap: 12 };
const rowBulletStyle: CSSProperties = { width: 4, height: 16, background: "#DA291C", borderRadius: "2px" };
const rowTitleStyle: CSSProperties = { fontSize: 14, fontWeight: 700, color: "#0f172a" };
const rowValueStyle: CSSProperties = { fontSize: 15, fontWeight: 900, color: "#0f172a" };

const countryIconBox: CSSProperties = { width: 36, height: 24, background: "#0f172a", color: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 };
const emptyDataStyle: CSSProperties = { padding: 40, textAlign: "center", color: "#94a3b8", fontWeight: 600, fontSize: 14 };
