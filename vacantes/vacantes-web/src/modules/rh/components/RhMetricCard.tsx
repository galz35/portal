import type { CSSProperties } from "react";

type RhMetricCardProps = {
  label: string;
  value: number | string;
  accent?: string;
  helper?: string;
};

export default function RhMetricCard({ label, value, accent = "#ef4444", helper }: RhMetricCardProps) {
  return (
    <article style={cardStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>{label}</span>
        <div style={{ ...dotStyle, background: accent }} />
      </div>
      <strong style={valueStyle}>{value}</strong>
      {helper ? <p style={helperStyle}>{helper}</p> : null}
    </article>
  );
}

const cardStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: 24,
  padding: 24,
  display: "grid",
  gap: 12,
  boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.04)",
  position: "relative",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const dotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
};

const valueStyle: CSSProperties = {
  fontSize: 32,
  lineHeight: 1,
  fontWeight: 900,
  color: "#0f172a",
};

const helperStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "#94a3b8",
  lineHeight: 1.5,
};

