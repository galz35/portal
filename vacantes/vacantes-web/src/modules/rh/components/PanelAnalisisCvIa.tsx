import type { RhAnalisisIa } from "../../../shared/api/vacantesApi";

type Props = {
  analysis: RhAnalisisIa | null;
  note?: string | null;
};

export default function PanelAnalisisCvIa({ analysis, note }: Props) {
  if (!analysis) {
    return (
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Analisis CV IA</h2>
        <p style={mutedStyle}>{note ?? "Aun no hay un analisis IA vigente para este perfil."}</p>
      </section>
    );
  }

  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>Analisis CV IA</h2>
      <div style={gridStyle}>
        <Metric label="Score total" value={formatScore(analysis.scoreTotal)} />
        <Metric label="Habilidades" value={formatScore(analysis.scoreHabilidades)} />
        <Metric label="Experiencia" value={formatScore(analysis.scoreExperiencia)} />
        <Metric label="Educacion" value={formatScore(analysis.scoreEducacion)} />
        <Metric label="Contexto" value={formatScore(analysis.scoreContexto)} />
        <Metric label="Fecha" value={analysis.fechaAnalisis} />
      </div>
      <p style={paragraphStyle}><strong>Resumen:</strong> {analysis.resumenCandidato || "Sin resumen disponible."}</p>
      <p style={paragraphStyle}><strong>Fortalezas:</strong> {joinList(analysis.fortalezas)}</p>
      <p style={paragraphStyle}><strong>Debilidades:</strong> {joinList(analysis.debilidades)}</p>
      <p style={paragraphStyle}><strong>Alertas:</strong> {joinList(analysis.alertas)}</p>
      <p style={paragraphStyle}><strong>Modelo:</strong> {analysis.versionModelo || "No indicado"} / <strong>Prompt:</strong> {analysis.versionPrompt || "No indicado"}</p>
      {analysis.errorTecnico ? (
        <p style={{ ...paragraphStyle, color: "#b91c1c" }}><strong>Error tecnico:</strong> {analysis.errorTecnico}</p>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={metricStyle}>
      <span style={labelStyle}>{label}</span>
      <strong style={{ color: "#111111" }}>{value}</strong>
    </div>
  );
}

function formatScore(value?: number | null) {
  return typeof value === "number" ? value.toFixed(2) : "N/D";
}

function joinList(items: string[]) {
  return items.length > 0 ? items.join(", ") : "Sin datos";
}

const sectionStyle = { display: "grid", gap: 12, border: "1px solid #fecaca", borderRadius: 18, padding: 18, background: "#fffdfd" };
const titleStyle = { margin: 0, fontSize: 22, fontWeight: 900 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 };
const metricStyle = { display: "grid", gap: 4 };
const labelStyle = { color: "#78716c", fontSize: 12, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.04em" };
const paragraphStyle = { margin: 0, color: "#292524", lineHeight: 1.6 };
const mutedStyle = { margin: 0, color: "#57534e", lineHeight: 1.6 };
