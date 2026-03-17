import { useMemo, type CSSProperties } from "react";
import type { VacantePublica } from "../../../shared/api/vacantesApi";

type Props = {
  items: VacantePublica[];
  filtros: { busqueda: string; modalidad: string; pais: string };
  onChange: (f: { busqueda: string; modalidad: string; pais: string }) => void;
};

export default function FiltrosVacantes({ items, filtros, onChange }: Props) {
  const conteos = useMemo(() => {
    const modalidades: Record<string, number> = {};
    const paises: Record<string, number> = {};
    for (const item of items) {
      const m = item.modalidad || "Sin definir";
      modalidades[m] = (modalidades[m] ?? 0) + 1;
      const p = item.codigoPais || "??";
      paises[p] = (paises[p] ?? 0) + 1;
    }
    return { modalidades, paises };
  }, [items]);

  return (
    <aside style={sidebarStyle}>
      {/* Search */}
      <div style={sectionStyle}>
        <div style={searchWrapStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Buscar vacante..."
            value={filtros.busqueda}
            onChange={(e) => onChange({ ...filtros, busqueda: e.target.value })}
            style={searchInputStyle}
          />
        </div>
      </div>

      {/* Modalidad */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Modalidad</h3>
        <FilterOption
          label="Todas"
          count={items.length}
          active={filtros.modalidad === ""}
          onClick={() => onChange({ ...filtros, modalidad: "" })}
        />
        {Object.entries(conteos.modalidades).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
          <FilterOption
            key={key}
            label={key}
            count={count}
            active={filtros.modalidad === key}
            onClick={() => onChange({ ...filtros, modalidad: filtros.modalidad === key ? "" : key })}
          />
        ))}
      </div>

      {/* País */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>País</h3>
        <FilterOption
          label="Todos"
          count={items.length}
          active={filtros.pais === ""}
          onClick={() => onChange({ ...filtros, pais: "" })}
        />
        {Object.entries(conteos.paises).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
          <FilterOption
            key={key}
            label={paisNombre(key)}
            count={count}
            active={filtros.pais === key}
            onClick={() => onChange({ ...filtros, pais: filtros.pais === key ? "" : key })}
          />
        ))}
      </div>

      {/* Reset */}
      {(filtros.busqueda || filtros.modalidad || filtros.pais) ? (
        <button
          type="button"
          onClick={() => onChange({ busqueda: "", modalidad: "", pais: "" })}
          style={resetBtnStyle}
        >
          Limpiar filtros
        </button>
      ) : null}
    </aside>
  );
}

function FilterOption({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ ...optionStyle, ...(active ? optionActiveStyle : {}) }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ ...radioStyle, ...(active ? radioActiveStyle : {}) }} />
        {label}
      </span>
      <span style={countStyle}>{count}</span>
    </button>
  );
}

function paisNombre(code: string) {
  const map: Record<string, string> = { NI: "Nicaragua", GT: "Guatemala", HN: "Honduras", SV: "El Salvador", CR: "Costa Rica", PA: "Panamá", CO: "Colombia" };
  return map[code] ?? code;
}

const sidebarStyle: CSSProperties = {
  width: 260,
  flexShrink: 0,
  background: "var(--bg-card)",
  border: "1px solid var(--border-light)",
  borderRadius: "var(--radius-xl)",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 20,
  alignSelf: "flex-start",
  position: "sticky",
  top: 24,
  boxShadow: "var(--shadow-md)",
};

const sectionStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const sectionTitleStyle: CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 4 };

const searchWrapStyle: CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)",
  padding: "10px 12px", background: "#f9fafb", transition: "var(--transition)",
};
const searchInputStyle: CSSProperties = {
  border: "none", outline: "none", background: "transparent",
  fontSize: 14, width: "100%", color: "var(--text-primary)",
};

const optionStyle: CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "8px 10px", border: "none", background: "transparent",
  borderRadius: "var(--radius-sm)", fontSize: 14, color: "var(--text-secondary)",
  transition: "var(--transition)", textAlign: "left", width: "100%",
};
const optionActiveStyle: CSSProperties = { background: "var(--claro-red-light)", color: "var(--claro-red)", fontWeight: 600 };

const radioStyle: CSSProperties = {
  width: 14, height: 14, borderRadius: "50%",
  border: "2px solid var(--border-light)", flexShrink: 0,
  transition: "var(--transition)",
};
const radioActiveStyle: CSSProperties = { borderColor: "var(--claro-red)", background: "var(--claro-red)", boxShadow: "inset 0 0 0 2px white" };

const countStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: "var(--text-muted)", background: "#f3f4f6", borderRadius: "var(--radius-pill)", padding: "2px 8px" };

const resetBtnStyle: CSSProperties = {
  border: "1px solid var(--claro-red-border)", background: "var(--claro-red-light)",
  color: "var(--claro-red)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", fontSize: 13, fontWeight: 600, transition: "var(--transition)",
};
