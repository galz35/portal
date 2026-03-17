export default function SinAccesoPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(180deg, #fff7f7 0%, #ffffff 100%)",
        color: "#111111",
        fontFamily: "\"Segoe UI\", sans-serif",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 620,
          background: "#ffffff",
          border: "1px solid #fecaca",
          borderRadius: 28,
          padding: 32,
          display: "grid",
          gap: 14,
          boxShadow: "0 24px 50px rgba(17, 24, 39, 0.08)",
        }}
      >
        <span style={{ color: "#b91c1c", fontWeight: 800, textTransform: "uppercase" }}>Vacantes</span>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900 }}>Sin acceso</h1>
        <p style={{ margin: 0, color: "#57534e", lineHeight: 1.7 }}>
          Tu sesion existe, pero no tiene permiso para entrar a este modulo de Vacantes.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/" style={primaryButtonStyle}>Ir al inicio</a>
          <a href="/portal" style={ghostButtonStyle}>Volver al portal</a>
        </div>
      </section>
    </main>
  );
}

const primaryButtonStyle = { textDecoration: "none", background: "#b91c1c", color: "#ffffff", padding: "13px 18px", borderRadius: 14, fontWeight: 800 };
const ghostButtonStyle = { textDecoration: "none", background: "#ffffff", color: "#111111", border: "1px solid #fca5a5", padding: "13px 18px", borderRadius: 14, fontWeight: 800 };
