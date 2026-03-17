import type { CSSProperties } from "react";

import type { VacantePublicaEnriquecida } from "../lib/vacantesCatalogo";
import { requisitoLabel } from "../lib/vacantesCatalogo";

type Props = {
  item: VacantePublicaEnriquecida;
  compact?: boolean;
};

const cardStyle: CSSProperties = {
  background: "white",
  minWidth: "350px",
  borderRadius: "24px",
  padding: "30px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
  border: "1px solid rgba(0,0,0,0.04)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  position: "relative",
  overflow: "hidden",
};

const cardHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  marginBottom: "20px",
};

const cardLogoWrapperStyle: CSSProperties = {
  width: "50px",
  height: "50px",
  borderRadius: "14px",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #e2e8f0",
  transition: "transform 0.3s ease",
};

const titleGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const mainTitleStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 800,
  lineHeight: 1.2,
  color: "#333",
  margin: "0 0 4px 0",
};

const companyNameStyle: CSSProperties = {
  fontSize: "13px",
  color: "#666",
  fontWeight: 500,
};

const badgesWrapperStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  marginBottom: "20px",
};

const badgeStyle: CSSProperties = {
  background: "#fff0f0",
  color: "#b52217",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const techBadgeStyle: CSSProperties = {
  ...badgeStyle,
  background: "#f1f5f9",
  color: "#475569",
};

const cardBodyStyle: CSSProperties = {
  marginBottom: "25px",
};

const descriptionStyle: CSSProperties = {
  fontSize: "14px",
  color: "#666",
  lineHeight: "1.6",
  margin: 0,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const cardFooterBoxStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "20px",
  borderTop: "1px solid #e2e8f0",
};

const salaryBoxStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const salaryLabelStyle: CSSProperties = {
  fontSize: "12px",
  color: "#666",
  fontWeight: 600,
  marginBottom: "2px",
};

const salaryValueStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 900,
  color: "#333",
  margin: 0,
};

export default function VacanteSearchCard({ item }: Props) {
  return (
    <article style={cardStyle} className="job-card-premium">
      {/* Decorative top border handled via CSS class in index.css */}
      <div>
        <div style={cardHeaderStyle}>
          <div style={cardLogoWrapperStyle} className="card-logo-zoom">
            <img src="/claro_v6_icono.png" alt="Claro" style={{ width: "35px" }} />
          </div>
          <div style={titleGroupStyle}>
            <h3 style={mainTitleStyle}>{item.titulo}</h3>
            <p style={companyNameStyle}>Claro Nicaragua</p>
          </div>
        </div>

        <div style={badgesWrapperStyle}>
          <span style={badgeStyle}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {item.departamentoLabel || item.ubicacion || "Managua"}
          </span>
          <span style={techBadgeStyle}>Tecnología</span>
        </div>

        <div style={cardBodyStyle}>
          <p style={descriptionStyle}>
            {item.descripcion || "Únete al equipo líder en telecomunicaciones de Nicaragua y crece profesionalmente con nosotros."}
          </p>
        </div>
      </div>

      <div style={cardFooterBoxStyle}>
        <div style={salaryBoxStyle}>
          <p style={salaryLabelStyle}>Plan de Carrera</p>
          <h4 style={salaryValueStyle}>Crecimiento</h4>
        </div>
        <a href={`/vacantes/${item.slug}`} className="btn-apply-premium">
          Aplicar Ahora
        </a>
      </div>
    </article>
  );
}






