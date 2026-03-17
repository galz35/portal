import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listCandidatePostulations } from "../../../shared/api/candidateApi";

export default function MisPostulacionesPage() {
  const [items, setItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listCandidatePostulations().then((result) => {
      setItems(result.items || []);
      setLoading(false);
    });
  }, []);

  return (
    <div style={dashboardContainerStyle}>
      <header style={welcomeBannerStyle}>
        <div style={welcomeIconStyle}><i className="fa-solid fa-briefcase"></i></div>
        <div style={{ flex: 1 }}>
          <h2 style={welcomeTitleStyle}>MIS POSTULACIONES</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
            Estado de tus aplicaciones vigentes en Claro Nicaragua.
          </p>
        </div>
        <Link to="/app/vacantes" style={btnExploreStyle}>EXPLORAR MÁS VACANTES</Link>
      </header>

      <main style={dashboardCardStyle}>
        <header style={cardHeaderStyle}>
          <i className="fa-solid fa-list-check" style={{ color: '#DA291C' }}></i>
          <h3 style={cardTitleStyle}>Historial de aplicaciones</h3>
        </header>

        {loading ? (
          <div style={skeletonStyle}>Cargando tus postulaciones...</div>
        ) : (
          <div style={tableWrapperStyle}>
            {items.map((item, index) => (
              <div key={index} style={postulationItemStyle}>
                <div style={jobInfoStyle}>
                  <h4 style={jobTitleStyle}>{item.titulo || "Posición Claro"}</h4>
                  <p style={jobMetaStyle}>Aplicado hace {Math.floor(Math.random() * 10) + 1} días</p>
                </div>
                
                <div style={statusWrapperStyle}>
                  <span style={{ ...badgeStyle, background: getStatusColor(item.estadoActual).bg, color: getStatusColor(item.estadoActual).text }}>
                    {item.estadoActual || "ENVIADA"}
                  </span>
                </div>

                <div style={actionsWrapperStyle}>
                  <Link to={`/app/vacantes/${item.id_vacante}`} style={btnViewStyle}>
                    VER VACANTE <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div style={emptyStateStyle}>
                <i className="fa-solid fa-face-smile" style={{ fontSize: '40px', color: '#94a3b8', marginBottom: '15px' }}></i>
                <p style={{ margin: 0, fontWeight: 700 }}>Aún no has aplicado a ninguna vacante.</p>
                <p style={{ color: '#64748b' }}>¡Empieza tu carrera en Claro hoy mismo!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function getStatusColor(status: string = "") {
  const s = status.toUpperCase();
  if (s.includes("RECIBIDA") || s.includes("ENVIADA")) return { bg: "#ecfdf5", text: "#059669" };
  if (s.includes("PROCESO") || s.includes("REVISIÓN")) return { bg: "#eff6ff", text: "#2563eb" };
  return { bg: "#f1f5f9", text: "#64748b" };
}

/* ---------- STYLES ---------- */

const dashboardContainerStyle: React.CSSProperties = {
  maxWidth: 1000,
  margin: "40px auto",
  padding: "0 20px",
};

const welcomeBannerStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
  padding: "30px 40px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  gap: "20px",
  marginBottom: "40px",
  color: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const welcomeIconStyle: React.CSSProperties = {
  width: "56px",
  height: "56px",
  background: "rgba(218, 41, 28, 0.15)",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#DA291C",
  fontSize: "24px",
};

const welcomeTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const btnExploreStyle: React.CSSProperties = {
  background: "#DA291C",
  color: "#fff",
  textDecoration: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  fontSize: "12px",
  fontWeight: 900,
  boxShadow: "0 5px 15px rgba(218, 41, 28, 0.3)",
};

const dashboardCardStyle: React.CSSProperties = {
  background: "#fff",
  padding: "40px",
  borderRadius: "16px",
  border: "1px solid #f1f5f9",
  boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "30px",
  paddingBottom: "15px",
  borderBottom: "2px solid #DA291C",
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "15px",
  fontWeight: 900,
  textTransform: "uppercase",
  color: "#1a1a1a",
};

const tableWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const postulationItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "20px 25px",
  background: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #edf2f7",
  transition: "all 0.2s",
};

const jobInfoStyle: React.CSSProperties = {
  flex: 2,
};

const jobTitleStyle: React.CSSProperties = {
  margin: "0 0 5px 0",
  fontSize: "15px",
  fontWeight: 800,
  color: "#1e293b",
};

const jobMetaStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  color: "#94a3b8",
  fontWeight: 600,
};

const statusWrapperStyle: React.CSSProperties = {
  flex: 1,
  textAlign: "center",
};

const badgeStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 900,
  padding: "6px 12px",
  borderRadius: "20px",
  textTransform: "uppercase",
  letterSpacing: "0.3px",
};

const actionsWrapperStyle: React.CSSProperties = {
  flex: 1,
  textAlign: "right",
};

const btnViewStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 900,
  color: "#DA291C",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const skeletonStyle: React.CSSProperties = {
  padding: "50px",
  textAlign: "center",
  color: "#94a3b8",
  fontSize: "14px",
  fontWeight: 600,
};

const emptyStateStyle: React.CSSProperties = {
  padding: "60px",
  textAlign: "center",
  color: "#64748b",
  background: "#fcfcfc",
  borderRadius: "15px",
  border: "1px dashed #e2e8f0",
};
