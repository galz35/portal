import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { listarVacantesPublicas, type VacantePublica } from "../../../shared/api/vacantesApi";
import FiltrosVacantes from "../components/FiltrosVacantes";
import TarjetaVacante from "../components/TarjetaVacante";

export default function VacantesListPage() {
  const [items, setItems] = useState<VacantePublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ busqueda: "", modalidad: "", pais: "" });

  useEffect(() => {
    void listarVacantesPublicas().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const match = item.titulo.toLowerCase().includes(q) ||
          item.ubicacion.toLowerCase().includes(q) ||
          item.codigoVacante.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filtros.modalidad && item.modalidad !== filtros.modalidad) return false;
      if (filtros.pais && item.codigoPais !== filtros.pais) return false;
      return true;
    });
  }, [items, filtros]);

  return (
    <main style={pageStyle}>
      {/* Header */}
      <header style={headerStyle} className="fade-in">
        <div>
          <a href="/" style={backLinkStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            Inicio
          </a>
          <h1 style={pageTitleStyle}>Vacantes disponibles</h1>
          <p style={subtitleStyle}>
            Explora las oportunidades abiertas en Claro. Usa los filtros para encontrar tu match.
          </p>
        </div>
        <div style={statsStyle}>
          <div style={statCardStyle}>
            <span style={statNumberStyle}>{items.length}</span>
            <span style={statLabelStyle}>Total</span>
          </div>
          <div style={statCardStyle}>
            <span style={statNumberStyle}>{filtered.length}</span>
            <span style={statLabelStyle}>Filtradas</span>
          </div>
        </div>
      </header>

      {/* Two-column layout */}
      <div style={layoutStyle}>
        {/* Sidebar Filters */}
        <FiltrosVacantes items={items} filtros={filtros} onChange={setFiltros} />

        {/* Results */}
        <section style={resultsStyle}>
          {/* Results bar */}
          <div style={resultsBarStyle}>
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Mostrando <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> de {items.length} vacantes
            </span>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div style={{ display: "grid", gap: 12 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="skeleton" style={{ height: 84, borderRadius: "var(--radius-lg)" }} />
              ))}
            </div>
          ) : null}

          {/* List */}
          {!loading && filtered.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {filtered.map((item, i) => (
                <div key={item.idVacante} className={`fade-in-delay-${Math.min(i, 3)}`}>
                  <TarjetaVacante
                    titulo={item.titulo}
                    ubicacion={item.ubicacion}
                    modalidad={item.modalidad}
                    ruta={`/vacantes/${item.slug}`}
                    codigo={item.codigoVacante}
                    pais={item.codigoPais}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {/* Empty state */}
          {!loading && filtered.length === 0 ? (
            <div style={emptyStyle}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Sin resultados</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
                Intenta ajustar los filtros o limpiar la búsqueda.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg-page)",
  padding: "24px 32px 64px",
  maxWidth: 1200,
  margin: "0 auto",
  display: "grid",
  gap: 20,
};

const headerStyle: CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-end",
  gap: 20, flexWrap: "wrap",
  background: "var(--bg-card)", border: "1px solid var(--border-light)",
  borderRadius: "var(--radius-xl)", padding: "24px 28px",
  boxShadow: "var(--shadow-md)",
};

const backLinkStyle: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 13, color: "var(--text-muted)", fontWeight: 500,
  marginBottom: 8, transition: "var(--transition)",
};

const pageTitleStyle: CSSProperties = { fontSize: 28, fontWeight: 800, lineHeight: 1.2, margin: 0 };
const subtitleStyle: CSSProperties = { fontSize: 15, color: "var(--text-secondary)", marginTop: 6, maxWidth: 500 };

const statsStyle: CSSProperties = { display: "flex", gap: 12 };
const statCardStyle: CSSProperties = {
  display: "grid", gap: 2, padding: "10px 18px", textAlign: "center",
  background: "var(--bg-page)", borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-light)", minWidth: 80,
};
const statNumberStyle: CSSProperties = { fontSize: 24, fontWeight: 800, color: "var(--claro-red)", lineHeight: 1 };
const statLabelStyle: CSSProperties = { fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" };

const layoutStyle: CSSProperties = { display: "flex", gap: 20, alignItems: "flex-start" };
const resultsStyle: CSSProperties = { flex: 1, display: "grid", gap: 12, minWidth: 0 };

const resultsBarStyle: CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "10px 16px", background: "var(--bg-card)",
  border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)",
};

const emptyStyle: CSSProperties = {
  display: "grid", placeItems: "center", gap: 12, padding: "60px 24px",
  background: "var(--bg-card)", border: "1px dashed var(--border-light)",
  borderRadius: "var(--radius-xl)", textAlign: "center",
};
