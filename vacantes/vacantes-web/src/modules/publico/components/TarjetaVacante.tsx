import type { CSSProperties } from "react";

type TarjetaVacanteProps = {
  titulo: string;
  ubicacion: string;
  modalidad: string;
  ruta: string;
  codigo?: string;
  pais?: string;
  categoria?: string;
  departamento?: string;
  highlights?: string[];
};

export default function TarjetaVacante({
  titulo,
  ubicacion,
  modalidad,
  ruta,
  codigo,
  pais,
  categoria,
  departamento,
  highlights = [],
}: TarjetaVacanteProps) {
  return (
    <article style={cardStyle} className="fade-in">
      <div style={cardBodyStyle}>
        {/* Icon placeholder */}
        <div style={iconStyle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
            <h3 style={titleStyle}>{titulo}</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {codigo ? <span style={badgeCodeStyle}>{codigo}</span> : null}
              {categoria ? <span style={badgeSecondaryStyle}>{categoria}</span> : null}
              <span style={badgeModalidadStyle(modalidad)}>{modalidad || "Sin modalidad"}</span>
            </div>
          </div>
          <div style={metaRowStyle}>
            <span style={metaItemStyle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {ubicacion || "Sin ubicación"}
            </span>
            {departamento ? (
              <span style={metaItemStyle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/></svg>
                {departamento}
              </span>
            ) : null}
            {pais ? (
              <span style={metaItemStyle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                {pais}
              </span>
            ) : null}
          </div>
          {highlights.length > 0 ? (
            <div style={highlightsStyle}>
              {highlights.slice(0, 3).map((highlight) => (
                <span key={highlight} style={highlightPillStyle}>
                  {highlight}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Badges + Action */}
        <div style={actionsStyle}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {codigo ? <span style={badgeCodeStyle}>{codigo}</span> : null}
            <span style={badgeModalidadStyle(modalidad)}>{modalidad || "—"}</span>
          </div>
          <a href={ruta} style={buttonStyle}>
            Ver detalle
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </article>
  );
}

function badgeModalidadStyle(modalidad: string): CSSProperties {
  const colors: Record<string, { bg: string; color: string }> = {
    PRESENCIAL: { bg: "#dbeafe", color: "#1e40af" },
    REMOTO: { bg: "#d1fae5", color: "#065f46" },
    HIBRIDA: { bg: "#fef3c7", color: "#92400e" },
  };
  const c = colors[modalidad?.toUpperCase()] ?? { bg: "#f3f4f6", color: "#374151" };
  return { ...badgeBase, background: c.bg, color: c.color };
}

const cardStyle: CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-light)",
  borderRadius: "var(--radius-lg)",
  padding: 0,
  boxShadow: "var(--shadow-sm)",
  transition: "box-shadow var(--transition), transform var(--transition)",
  overflow: "hidden",
};

const cardBodyStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "18px 20px",
};

const iconStyle: CSSProperties = {
  width: 48, height: 48, borderRadius: "var(--radius-md)",
  background: "var(--claro-red)", flexShrink: 0,
  display: "grid", placeItems: "center",
};

const contentStyle: CSSProperties = { flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 };
const titleStyle: CSSProperties = { fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 };
const metaRowStyle: CSSProperties = { display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" };
const metaItemStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--text-muted)" };

const actionsStyle: CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "flex-end",
  gap: 10, flexShrink: 0,
};

const badgeBase: CSSProperties = {
  fontSize: 11, fontWeight: 600, padding: "3px 10px",
  borderRadius: "var(--radius-pill)", textTransform: "uppercase",
  letterSpacing: "0.04em", whiteSpace: "nowrap",
};

const badgeCodeStyle: CSSProperties = {
  ...badgeBase,
  background: "var(--text-primary)", color: "white",
};

const badgeSecondaryStyle: CSSProperties = {
  ...badgeBase,
  background: "#f8fafc",
  color: "#334155",
  border: "1px solid #e2e8f0",
};

const highlightsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const highlightPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  padding: "5px 10px",
  borderRadius: "var(--radius-pill)",
  background: "#fff1f2",
  color: "#9f1239",
  fontSize: 12,
  fontWeight: 700,
};

const buttonStyle: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "var(--claro-red)", color: "white",
  border: "none", borderRadius: "var(--radius-sm)",
  padding: "8px 14px", fontSize: 13, fontWeight: 600,
  transition: "var(--transition)", whiteSpace: "nowrap",
};
