import type { RhAnalisisIa } from "../../../shared/api/vacantesApi";

type Props = {
  items: RhAnalisisIa[];
};

export default function HistorialAnalisisIa({ items }: Props) {
  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>Historial analisis IA</h2>
      {items.length === 0 ? (
        <p style={mutedStyle}>Todavia no hay historial disponible.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item) => (
            <article key={item.idAnalisisCvIa} style={rowStyle}>
              <strong>{item.fechaAnalisis}</strong>
              <span>{item.versionPrompt || "sin prompt"}</span>
              <span>{item.versionModelo || "sin modelo"}</span>
              <span>{item.fueExitoso ? "exito" : "fallo"}</span>
              <span>{item.esVigente ? "vigente" : "historico"}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const sectionStyle = { display: "grid", gap: 12, border: "1px solid #fecaca", borderRadius: 18, padding: 18, background: "#fffdfd" };
const titleStyle = { margin: 0, fontSize: 22, fontWeight: 900 };
const mutedStyle = { margin: 0, color: "#57534e", lineHeight: 1.6 };
const rowStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, padding: 12, border: "1px solid #fecaca", borderRadius: 14, background: "#ffffff", alignItems: "center" };
