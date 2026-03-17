import type { CSSProperties } from "react";

type Props = {
  children: React.ReactNode;
  activeTab?: string;
};

const ClaroLogo = ({ height = 40 }: { height?: number }) => (
  <img src="/claro_v6_logo.png" alt="Claro Logo" style={{ height, cursor: "pointer" }} />
);

export default function LayoutFiltro({ children, activeTab = "busqueda" }: Props) {
  return (
    <div style={{ backgroundColor: "#F4F6F8", minHeight: "100vh", fontFamily: "'Roboto', sans-serif" }}>
      {/* NAVBAR */}
      <header style={navbarStyle}>
        <div style={logoStyle}>
          <a href="/">
            <img src="/claro_v6_logo.png" alt="Claro Logo" height="40" />
          </a>
        </div>
        <nav style={navLinksStyle}>
          <a href="/" style={activeTab === "inicio" ? navLinkActiveStyle : navLinkStyle}>Inicio</a>
          <a href="/vacantes" style={activeTab === "busqueda" ? navLinkActiveStyle : navLinkStyle}>Búsqueda de Empleos</a>
        </nav>
        <div style={authLinksStyle}>
          <a href="/login" style={authLinkStyle}>Ingresar</a>
          <a href="/registro" style={registerLinkStyle}>Registrarse</a>
        </div>
      </header>

      {children}
    </div>
  );
}

const navbarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 5%",
  backgroundColor: "#ffffff",
  borderBottom: "1px solid #E0E0E0",
};

const logoStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const navLinksStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const navLinkStyle: CSSProperties = {
  textDecoration: "none",
  color: "#333333",
  margin: "0 15px",
  fontWeight: 500,
  fontSize: "14px",
  textTransform: "uppercase",
};

const navLinkActiveStyle: CSSProperties = {
  ...navLinkStyle,
  color: "#DA291C",
  fontWeight: 700,
};

const authLinksStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const authLinkStyle: CSSProperties = {
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 700,
  color: "#666666",
  marginLeft: "20px",
};

const registerLinkStyle: CSSProperties = {
  ...authLinkStyle,
  color: "#DA291C",
};
