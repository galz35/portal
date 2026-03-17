import type { CSSProperties } from "react";

type RhStatusBadgeProps = {
  value: string;
};

export default function RhStatusBadge({ value }: RhStatusBadgeProps) {
  if (!value) return <span style={{ ...badgeStyle, ...resolveTone("") }}>N/A</span>;
  return <span style={{ ...badgeStyle, ...resolveTone(value) }}>{value.replace(/_/g, " ")}</span>;
}

function resolveTone(value: string): CSSProperties {
  const norm = (value || "").toUpperCase();
  
  if (norm.includes("APROBADA") || norm.includes("VIGENTE") || norm.includes("PUBLICADA") || norm.includes("PRESELECCIONADA") || norm.includes("CONTRATADO")) {
    return { background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" };
  }

  if (norm.includes("PENDIENTE") || norm.includes("EXCEPCION") || norm.includes("REVISION") || norm.includes("TERNA")) {
    return { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" };
  }

  if (norm.includes("DOCUMENTACION")) {
    return { background: "#f5f3ff", color: "#5b21b6", border: "1px solid #ddd6fe" };
  }

  if (norm.includes("RECHAZADA") || norm.includes("SUSPENDIDA") || norm.includes("CERRADA")) {
    return { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" };
  }

  return { background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" };
}

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "fit-content",
  padding: "4px 10px",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
};

