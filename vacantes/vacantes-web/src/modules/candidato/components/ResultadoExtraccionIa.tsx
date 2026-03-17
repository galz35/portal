export default function ResultadoExtraccionIa() {
  return (
    <section style={sectionStyle}>
      <h2 style={titleStyle}>Ultimo analisis IA</h2>
      <p style={textStyle}>
        Esta vista ya no muestra datos inventados. El resumen estructurado del CV se habilitara cuando el pipeline IA
        del candidato exponga resultados reales para la sesion actual.
      </p>
    </section>
  );
}

const sectionStyle = { display: "grid", gap: 10, border: "1px solid #fecaca", borderRadius: 18, padding: 18, background: "#fffdfd" };
const titleStyle = { margin: 0, fontSize: 22, fontWeight: 900, color: "#111111" };
const textStyle = { margin: 0, color: "#57534e", lineHeight: 1.6 };
