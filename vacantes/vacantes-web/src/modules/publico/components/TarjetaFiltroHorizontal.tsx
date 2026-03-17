import type { CSSProperties } from "react";
import type { VacantePublicaEnriquecida } from "../lib/vacantesCatalogo";

type Props = {
  item: VacantePublicaEnriquecida;
};

export default function TarjetaFiltroHorizontal({ item }: Props) {
  return (
    <div style={cardHorizontalStyle} className="job-card-horizontal">
      <div style={detailsStyle}>
        <a href={`/vacantes/${item.slug}`} className="job-title" style={jobTitleStyle}>
          {item.titulo}
        </a>
        <div style={metaStyle}>
          <span style={metaItemStyle}>
            <i className="fa-solid fa-hourglass-half" style={iconMetaStyle}></i> Expira {item.fechaPublicacion || "Próximamente"}
          </span>
          <span style={metaItemStyle}>
            <i className="fa-solid fa-location-dot" style={iconMetaStyle}></i> {item.departamentoLabel || item.ubicacion} ({item.modalidad || "Presencial"})
          </span>
        </div>
      </div>
      <div style={actionsStyle}>
        <a href={`/vacantes/${item.slug}`} style={btnApplyStyle} className="btn-apply">
          VER OFERTA <i className="fa-solid fa-caret-right"></i>
        </a>
      </div>
    </div>
  );
}

const cardHorizontalStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #E0E0E0",
  borderRadius: "6px",
  padding: "16px 20px",
  display: "flex",
  alignItems: "center",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  position: "relative",
};

const detailsStyle: CSSProperties = {
  flexGrow: 1,
};

const jobTitleStyle: CSSProperties = {
  fontSize: "17px",
  fontWeight: 800,
  color: "#1e293b",
  marginBottom: "10px",
  textDecoration: "none",
  display: "block",
  lineHeight: "1.3",
};

const metaStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  fontSize: "13px",
  color: "#64748b",
};

const metaItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 500,
};

const iconMetaStyle: CSSProperties = {
  fontSize: "12px",
  color: "#94a3b8",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  marginLeft: "20px",
};

const btnApplyStyle: CSSProperties = {
  background: "#DA291C",
  color: "#ffffff",
  padding: "10px 24px",
  fontSize: "11px",
  fontWeight: 900,
  borderRadius: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  textDecoration: "none",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(218, 41, 28, 0.15)",
};
