import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import TarjetaVacante from "../components/TarjetaVacante";
import { listarVacantesPublicas, type VacantePublica } from "../../../shared/api/vacantesApi";

export default function HomeVacantesPage() {
  const [items, setItems] = useState<VacantePublica[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void listarVacantesPublicas().then(setItems);
  }, []);

  function handleSearch() {
    if (search.trim()) {
      window.location.href = `/vacantes?q=${encodeURIComponent(search.trim())}`;
    } else {
      window.location.href = "/vacantes";
    }
  }

  return (
    <main style={pageStyle}>
      {/* Nav */}
      <nav style={navStyle} className="fade-in">
        <div style={logoStyle}>
          <div style={logoIconStyle}>C</div>
          <span style={{ fontWeight: 800, fontSize: 18 }}>Claro Vacantes</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/login" style={navLinkStyle}>Iniciar sesión</a>
          <a href="/registro" style={navLinkFilledStyle}>Registrarse</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={heroStyle} className="fade-in">
        <span style={eyebrowStyle}>Claro Nicaragua · Oportunidades laborales</span>
        <h1 style={heroTitleStyle}>
          Encuentra tu próxima<br />
          <span style={{ color: "var(--claro-red)" }}>oportunidad profesional</span>
        </h1>
        <p style={heroTextStyle}>
          Explora las vacantes disponibles en Claro y postúlate en línea. Registro rápido, carga tu CV y dale seguimiento a tus postulaciones.
        </p>

        {/* Search bar */}
        <div style={searchBarStyle}>
          <div style={searchFieldStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder="Cargo, área o palabra clave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              style={searchInputStyle}
            />
          </div>
          <button type="button" onClick={handleSearch} style={searchBtnStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Buscar
          </button>
        </div>

        {/* Stats */}
        <div style={statsRowStyle}>
          <span style={statPillStyle}>
            <strong>{items.length}</strong> vacantes activas
          </span>
          <span style={statPillStyle}>
            <strong>{new Set(items.map((i) => i.codigoPais)).size}</strong> países
          </span>
          <span style={statPillStyle}>
            <strong>{new Set(items.map((i) => i.modalidad)).size}</strong> modalidades
          </span>
        </div>
      </section>

      {/* Featured */}
      <section style={sectionStyle} className="fade-in-delay-1">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={sectionTitleStyle}>Vacantes destacadas</h2>
          <a href="/vacantes" style={viewAllStyle}>
            Ver todas
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
        <div style={gridStyle}>
          {items.slice(0, 3).map((item) => (
            <TarjetaVacante
              key={item.idVacante}
              titulo={item.titulo}
              ubicacion={item.ubicacion}
              modalidad={item.modalidad}
              ruta={`/vacantes/${item.slug}`}
              codigo={item.codigoVacante}
              pais={item.codigoPais}
            />
          ))}
          {items.length === 0 ? (
            <div style={emptyStyle}>
              Aún no hay vacantes públicas cargadas. Las vacantes aparecen aquí cuando RH las publica desde el panel.
            </div>
          ) : null}
        </div>
      </section>

      {/* Value Props */}
      <section style={valuesSection} className="fade-in-delay-2">
        <h2 style={{ ...sectionTitleStyle, textAlign: "center" }}>¿Por qué trabajar en Claro?</h2>
        <div style={valuesGrid}>
          <ValueCard icon="🏥" title="Beneficios completos" desc="Seguro médico, dental y de vida para ti y tu familia." />
          <ValueCard icon="📈" title="Plan de carrera" desc="Programas de desarrollo profesional y movilidad interna." />
          <ValueCard icon="🌎" title="Presencia regional" desc="Operaciones en 8 países. Oportunidades internacionales." />
          <ValueCard icon="🎓" title="Capacitación continua" desc="Acceso a plataformas de aprendizaje y certificaciones." />
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
          © {new Date().getFullYear()} Claro Nicaragua — Portal de Vacantes
        </span>
      </footer>
    </main>
  );
}

function ValueCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={valueCardStyle}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

/* ---------- STYLES ---------- */

const pageStyle: CSSProperties = {
  minHeight: "100vh", background: "var(--bg-page)",
  maxWidth: 1100, margin: "0 auto", padding: "0 24px 48px",
  display: "grid", gap: 24,
};

const navStyle: CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 0",
};
const logoStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
const logoIconStyle: CSSProperties = {
  width: 36, height: 36, borderRadius: "var(--radius-sm)",
  background: "var(--claro-red)", color: "white",
  display: "grid", placeItems: "center",
  fontWeight: 900, fontSize: 18,
};
const navLinkStyle: CSSProperties = { fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", padding: "8px 14px", borderRadius: "var(--radius-sm)", transition: "var(--transition)" };
const navLinkFilledStyle: CSSProperties = { ...navLinkStyle, background: "var(--text-primary)", color: "white" };

const heroStyle: CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border-light)",
  borderRadius: "var(--radius-xl)", padding: "40px 36px",
  boxShadow: "var(--shadow-lg)", display: "grid", gap: 18,
};
const eyebrowStyle: CSSProperties = {
  fontSize: 12, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: "0.08em", color: "var(--text-muted)",
};
const heroTitleStyle: CSSProperties = { fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, lineHeight: 1.1, margin: 0 };
const heroTextStyle: CSSProperties = { fontSize: 16, color: "var(--text-secondary)", maxWidth: 600, lineHeight: 1.6 };

const searchBarStyle: CSSProperties = {
  display: "flex", gap: 0, background: "var(--bg-page)",
  borderRadius: "var(--radius-lg)", border: "2px solid var(--border-light)",
  overflow: "hidden", maxWidth: 600, transition: "var(--transition)",
};
const searchFieldStyle: CSSProperties = {
  flex: 1, display: "flex", alignItems: "center", gap: 10,
  padding: "14px 16px",
};
const searchInputStyle: CSSProperties = {
  border: "none", outline: "none", background: "transparent",
  fontSize: 15, width: "100%", color: "var(--text-primary)",
};
const searchBtnStyle: CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  background: "var(--claro-red)", color: "white", border: "none",
  padding: "14px 24px", fontWeight: 700, fontSize: 15,
  whiteSpace: "nowrap", transition: "var(--transition)",
};

const statsRowStyle: CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };
const statPillStyle: CSSProperties = {
  fontSize: 13, color: "var(--text-secondary)",
  background: "var(--bg-page)", border: "1px solid var(--border-light)",
  borderRadius: "var(--radius-pill)", padding: "6px 14px",
};

const sectionStyle: CSSProperties = { display: "grid", gap: 16 };
const sectionTitleStyle: CSSProperties = { fontSize: 22, fontWeight: 800, margin: 0 };
const viewAllStyle: CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  fontSize: 14, fontWeight: 600, color: "var(--claro-red)",
};

const gridStyle: CSSProperties = { display: "grid", gap: 12 };

const emptyStyle: CSSProperties = {
  border: "1px dashed var(--border-light)", borderRadius: "var(--radius-xl)",
  padding: 32, color: "var(--text-muted)", fontWeight: 600, textAlign: "center",
  background: "var(--bg-card)",
};

const valuesSection: CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border-light)",
  borderRadius: "var(--radius-xl)", padding: "32px 28px",
  boxShadow: "var(--shadow-md)", display: "grid", gap: 20,
};
const valuesGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 };
const valueCardStyle: CSSProperties = {
  display: "grid", gap: 8, padding: 20,
  background: "var(--bg-page)", borderRadius: "var(--radius-lg)",
  border: "1px solid var(--border-light)",
};

const footerStyle: CSSProperties = { textAlign: "center", padding: "24px 0", borderTop: "1px solid var(--border-light)" };
