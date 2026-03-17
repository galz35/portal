import { useEffect } from "react";

import { buildPortalLoginUrl } from "../../../shared/security/portalLogin";

function requestedReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("returnUrl") ?? "/app/vacantes/rh/dashboard";
}

export default function PortalLoginRedirectPage() {
  const redirectUrl = buildPortalLoginUrl(requestedReturnUrl());

  useEffect(() => {
    window.location.replace(redirectUrl);
  }, [redirectUrl]);

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <span style={pillStyle}>Acceso empleado</span>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900 }}>Redirigiendo al portal</h1>
        <p style={textStyle}>
          El login de empleados vive en el portal central. Esta pantalla solo hace el handoff seguro.
        </p>
        <a href={redirectUrl} style={buttonStyle}>
          Ir al login central
        </a>
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(180deg, #fff7f7 0%, #ffffff 100%)",
  color: "#111111",
  fontFamily: "\"Segoe UI\", sans-serif",
  padding: 24,
};

const cardStyle = {
  width: "100%",
  maxWidth: 540,
  background: "#ffffff",
  border: "1px solid #fecaca",
  borderRadius: 28,
  padding: 32,
  display: "grid",
  gap: 16,
  boxShadow: "0 24px 50px rgba(17, 24, 39, 0.08)",
};

const pillStyle = {
  width: "fit-content",
  background: "#111111",
  color: "#ffffff",
  padding: "8px 14px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase" as const,
};

const textStyle = { margin: 0, color: "#57534e", lineHeight: 1.6 };

const buttonStyle = {
  textDecoration: "none",
  width: "fit-content",
  background: "#b91c1c",
  color: "#ffffff",
  padding: "14px 18px",
  borderRadius: 14,
  fontWeight: 800,
};
