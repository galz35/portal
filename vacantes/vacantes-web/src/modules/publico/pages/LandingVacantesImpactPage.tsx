import type { CSSProperties } from "react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";

import BusquedaAvanzadaVacantes from "../components/BusquedaAvanzadaVacantes";
import VacanteSearchCard from "../components/VacanteSearchCard";
import {
  CATEGORIAS_PRESET,
  FILTROS_INICIALES,
  NICARAGUA_DIVISIONES,
  construirParametrosBusqueda,
  enriquecerVacante,
  filtrarYOrdenarVacantes,
  type FiltrosBusquedaVacantes,
} from "../lib/vacantesCatalogo";
import { listarVacantesPublicas, type VacantePublica } from "../../../shared/api/vacantesApi";

const QUICK_SEARCHES = [
  { label: "Servicio al cliente", keyword: "servicio al cliente", category: "atencion" },
  { label: "Ventas PYME", keyword: "ventas corporativas", category: "ventas" },
  { label: "Distribucion", keyword: "distribucion", category: "logistica" },
  { label: "Fibra y tecnologia", keyword: "fibra optica", category: "tecnologia" },
  { label: "Recursos humanos", keyword: "reclutamiento", category: "rrhh" },
];

const MARKET_NOTES = [
  {
    title: "CAC, ventas y cobertura",
    text: "Claro Nicaragua mezcla fuerte atencion al cliente, CAC, ventas comerciales, cobertura y soporte de campo.",
  },
  {
    title: "Comunicacion, cartera y metas",
    text: "En sus roles comerciales aparecen mucho seguimiento, cartera, presentacion, Office y orientacion clara a resultados.",
  },
  {
    title: "Seguridad y movilidad",
    text: "Para distribucion, tecnico y campo pesan licencia, movilidad, horarios y cultura de seguridad operativa.",
  },
];

const DEPARTAMENTOS_DESTACADOS = ["Managua", "Masaya", "Leon", "Chinandega", "Esteli", "Matagalpa"] as const;

const ClaroLogo = ({ height = 55 }: { height?: number }) => (
  <img src="/claro_v6_logo.png" alt="Claro Logo" style={{ height, cursor: "pointer" }} />
);

const BackgroundWavesSVG = () => (
  <div style={{ 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    width: "100%", 
    height: "100%", 
    zIndex: -1, 
    pointerEvents: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23da291c' fill-opacity='0.05' d='M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,160C672,160,768,192,864,213.3C960,235,1056,245,1152,224C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "bottom",
    backgroundSize: "cover"
  }} />
);

import { getPortalMe, hasRhVacantes } from "../../../shared/api/coreSessionApi";

export default function LandingVacantesImpactPage() {
  const [items, setItems] = useState<VacantePublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosBusquedaVacantes>(FILTROS_INICIALES);

  useEffect(() => {
    // [DESACTIVADO] Proactive check: if logged in as RH, jump to dashboard.
    // Desactivado a petición del usuario para que un Admin pueda ver la vista de candidato.
    /*
    void getPortalMe().then((identity) => {
      if (identity && hasRhVacantes(identity)) {
        window.location.href = "/app/vacantes/rh/dashboard";
      }
    });
    */

    void listarVacantesPublicas().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const enriched = useMemo(() => items.map(enriquecerVacante), [items]);
  const deferredFilters = useDeferredValue(filtros);
  const preview = useMemo(
    () => filtrarYOrdenarVacantes(enriched, deferredFilters).slice(0, 4),
    [deferredFilters, enriched],
  );

  function irABusqueda() {
    const params = construirParametrosBusqueda(filtros);
    window.location.href = `/vacantes${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return (
    <main style={{ backgroundColor: "#ffffff", color: "#333", fontFamily: "'Roboto', sans-serif" }}>
      
      {/* Navbar per user design */}
      <header style={navbarStyle}>
        <div style={logoWrapperStyle}>
          <ClaroLogo />
        </div>
        <nav style={navLinksStyle}>
          <a href="/" style={navItemActiveStyle}>Inicio</a>
          <a href="/vacantes" style={navItemStyle}>Empleos</a>
          <a href="/empresas" style={navItemStyle}>Empresas</a>
          <a href="/blog" style={navItemStyle}>Blog</a>
        </nav>
        <div style={authLinksStyle}>
          <a href="/login" style={authLinkStyle}>Ingresar</a>
          <a href="/registro" style={registerLinkStyle}>Registrarse</a>
        </div>
      </header>

      {/* Hero per user design */}
      <section style={heroSectionStyle}>
        <div style={heroOverlayStyle}></div>
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>TU FUTURO<br />PROFESIONAL<br />COMIENZA AQUÍ.</h1>
          <p style={heroSubStyle}>Encuentra el empleo de tus sueños en<br />Claro Nicaragua y crece con nosotros.</p>
        </div>

        {/* Floating Search Bar per user design */}
        <div style={searchBarContainerStyle}>
          <div style={searchInputGroupStyle}>
            <input 
              style={mockupInputStyle} 
              placeholder="Buscar cargo, empresa o habilidad" 
              value={filtros.keyword}
              onChange={e => setFiltros(c => ({...c, keyword: e.target.value}))}
            />
            <div style={searchIconWrapperStyle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </div>
          
          <div style={searchDividerStyle}></div>
          
          <div style={searchSelectGroupStyle}>
            <label style={searchLabelSmallStyle}>Locación</label>
            <div style={selectWrapperStyle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <select 
                style={dropdownNativeStyle}
                value={filtros.department}
                onChange={e => setFiltros(c => ({...c, department: e.target.value}))}
              >
                <option value="">Managua, Nicaragua</option>
                {NICARAGUA_DIVISIONES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={searchDividerStyle}></div>

          <div style={searchSelectGroupStyle}>
            <label style={searchLabelSmallStyle}>Categoría</label>
            <div style={selectWrapperStyle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5"><rect width="18" height="14" x="3" y="3" rx="2"/><path d="M7 21h10M12 17v4"/></svg>
              <select 
                style={dropdownNativeStyle}
                value={filtros.category}
                onChange={e => setFiltros(c => ({...c, category: e.target.value}))}
              >
                <option value="">Tecnología</option>
                {CATEGORIAS_PRESET.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <button onClick={irABusqueda} style={searchFinalButtonStyle}>
            Buscar Empleo <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" style={{marginLeft: 5}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </section>

      {/* Featured Jobs horizontal slider with manual design gradients */}
      <section style={featuredJobsSectionStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={featuredHeadlineStyle}>EMPLEOS DESTACADOS</h2>
          <a href="/vacantes" style={viewAllLinkStyle}>Ver todos los empleos &rarr;</a>
        </div>
        
        <div style={cardsSliderContainerStyle} className="cards-slider">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ minWidth: 320, height: 260, borderRadius: 20 }} />
            ))
          ) : (
            preview.map((item) => (
              <VacanteSearchCard key={item.idVacante} item={item} />
            ))
          )}
        </div>
      </section>

      <footer style={footerWrapperStyle}>
        <nav style={footerLinksStyle}>
          <a href="/" style={footerLinkItemStyle}>Inicio</a>
          <a href="/vacantes" style={footerLinkItemStyle}>Empleos</a>
          <a href="/empresas" style={footerLinkItemStyle}>Empresas</a>
          <a href="/blog" style={footerLinkItemStyle}>Blog</a>
        </nav>
        <div style={footerLogoWrapperStyle}>
          <ClaroLogo height={40} />
        </div>
      </footer>
    </main>
  );
}

// Styles based on user's manual design
const navbarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 5%",
  backgroundColor: "white",
};

const logoWrapperStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const navLinksStyle: CSSProperties = {
  display: "flex",
  gap: "30px",
};

const navItemStyle: CSSProperties = {
  textDecoration: "none",
  color: "#333",
  fontWeight: 500,
  fontSize: "15px",
};

const navItemActiveStyle: CSSProperties = {
  ...navItemStyle,
  color: "#DA291C",
};

const authLinksStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "30px",
};

const authLinkStyle: CSSProperties = {
  textDecoration: "none",
  color: "#333",
  fontWeight: 500,
  fontSize: "15px",
};

const registerLinkStyle: CSSProperties = {
  ...authLinkStyle,
  fontWeight: 700,
};

const heroSectionStyle: CSSProperties = {
  position: "relative",
  width: "90%",
  margin: "0 auto",
  height: "500px",
  borderRadius: "30px",
  background: "url('/claro_v6_bg.png?v=7') no-repeat center 14% / cover",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "0 5%",
  marginBottom: "80px",
};

const heroOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)",
  borderRadius: "30px",
};

const heroContentStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
  color: "white",
};

const heroTitleStyle: CSSProperties = {
  fontSize: "52px",
  fontWeight: 900,
  lineHeight: 1.1,
  marginBottom: "15px",
  letterSpacing: "-1px",
};

const heroSubStyle: CSSProperties = {
  fontSize: "20px",
  fontWeight: 400,
  lineHeight: 1.4,
  color: "#f0f0f0",
};

const searchBarContainerStyle: CSSProperties = {
  position: "absolute",
  bottom: "-35px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  width: "85%",
  borderRadius: "50px",
  display: "flex",
  alignItems: "center",
  padding: "10px 15px",
  boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
  zIndex: 10,
};

const searchInputGroupStyle: CSSProperties = {
  flex: 2,
  position: "relative",
  padding: "0 15px",
  display: "flex",
  alignItems: "center",
};

const mockupInputStyle: CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  fontSize: "15px",
  padding: "10px 0",
  background: "transparent",
};

const searchIconWrapperStyle: CSSProperties = {
  background: "#DA291C",
  color: "white",
  width: "35px",
  height: "35px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  right: "15px",
};

const searchDividerStyle: CSSProperties = {
  width: "1px",
  height: "40px",
  backgroundColor: "#E0E0E0",
  margin: "0 15px",
};

const searchSelectGroupStyle: CSSProperties = {
  flex: 1.5,
  display: "flex",
  flexDirection: "column",
  padding: "0 10px",
};

const searchLabelSmallStyle: CSSProperties = {
  fontSize: "12px",
  color: "#666",
  marginBottom: "4px",
};

const selectWrapperStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const dropdownNativeStyle: CSSProperties = {
  border: "none",
  outline: "none",
  fontWeight: 700,
  fontSize: "15px",
  background: "transparent",
  cursor: "pointer",
  width: "100%",
  appearance: "none",
  color: "#333",
};

const searchFinalButtonStyle: CSSProperties = {
  backgroundColor: "#DA291C",
  color: "white",
  border: "none",
  padding: "16px 28px",
  borderRadius: "30px",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.3s",
  whiteSpace: "nowrap",
};

const featuredJobsSectionStyle: CSSProperties = {
  padding: "60px 5%",
  backgroundColor: "#ffffff",
  position: "relative",
  overflow: "hidden",
  backgroundImage: `
    radial-gradient(circle at -5% 50%, rgba(218, 41, 28, 0.03) 0%, transparent 40%),
    radial-gradient(circle at 105% 90%, rgba(218, 41, 28, 0.06) 0%, transparent 50%)
  `,
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "30px",
};

const featuredHeadlineStyle: CSSProperties = {
  fontSize: "24px",
  fontWeight: 900,
  textTransform: "uppercase",
  margin: 0,
};

const viewAllLinkStyle: CSSProperties = {
  color: "#DA291C",
  fontWeight: 700,
  textDecoration: "none",
  fontSize: "14px",
};

const cardsSliderContainerStyle: CSSProperties = {
  display: "flex",
  gap: "25px",
  overflowX: "auto",
  paddingBottom: "30px",
  position: "relative",
  scrollbarWidth: "none", // For Firefox
};

const footerWrapperStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "30px 5%",
  borderTop: "1px solid #E0E0E0",
};

const footerLinksStyle: CSSProperties = {
  display: "flex",
  gap: "25px",
};

const footerLinkItemStyle: CSSProperties = {
  textDecoration: "none",
  color: "#666",
  fontSize: "14px",
  fontWeight: 500,
};

const footerLogoWrapperStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
};







