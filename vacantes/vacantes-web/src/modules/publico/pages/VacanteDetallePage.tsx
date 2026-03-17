import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { applyAsCandidate, getCandidateMe } from "../../../shared/api/candidateApi";
import { obtenerDetalleVacante } from "../../../shared/api/vacantesApi";

export default function VacanteDetallePage() {
  const { slug = "" } = useParams();
  const [detalle, setDetalle] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    void obtenerDetalleVacante(slug).then((data) => {
      setDetalle(data as Record<string, any> | null);
      setLoading(false);
    });
  }, [slug]);

  async function handlePostular() {
    const idVacante = Number(detalle?.idVacante ?? 0);
    if (!idVacante) {
      setStatus("No se encontró la vacante");
      return;
    }

    const profile = await getCandidateMe();
    if (!profile?.id_candidato) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?returnUrl=${returnUrl}`;
      return;
    }

    const { response, data } = await applyAsCandidate(idVacante);
    setStatus(response.ok && data.ok ? "¡Postulación enviada con éxito!" : (data.message ?? "No se pudo enviar la postulación"));
  }

  const titulo = String(detalle?.titulo ?? "Vacante");
  const descripcion = String(detalle?.descripcion ?? "");
  const requisitos = String(detalle?.requisitos ?? "");
  const ubicacion = String(detalle?.ubicacion ?? "Nicaragua");
  const modalidad = String(detalle?.modalidad ?? "Presencial");
  const fechaPublicacion = String(detalle?.fechaPublicacion ?? "Reciente");
  const area = String(detalle?.areaLabel || detalle?.area || "General");

  return (
    <div style={containerStyle}>
      <div style={contentLayoutStyle}>
        {/* COLUMNA IZQUIERDA: CONTENIDO */}
        <main style={mainContentStyle}>
          <Link to="/vacantes" style={backLinkStyle}>
            <i className="fa-solid fa-arrow-left"></i> REGRESAR A LA BÚSQUEDA
          </Link>

          <header style={headerStyle}>
            <h1 style={titleStyle}>{titulo}</h1>
            <div style={redDividerStyle}></div>
          </header>

          <section>
            <h2 style={sectionTitleStyle}>Descripción de la oferta</h2>
            <div style={descriptionTextStyle}>
              {loading ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div className="skeleton" style={{ height: 20, width: "100%" }} />
                  <div className="skeleton" style={{ height: 20, width: "90%" }} />
                  <div className="skeleton" style={{ height: 20, width: "95%" }} />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: descripcion.replace(/\n/g, '<br/>') }} />
              )}
            </div>
          </section>

          {requisitos && (
            <section style={{ marginTop: 40 }}>
              <h2 style={sectionTitleStyle}>Requisitos y Competencias</h2>
              <div style={reqCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={reqNameStyle}>{requisitos}</span>
                  <span style={reqBadgeStyle}>Requerido</span>
                </div>
              </div>
            </section>
          )}

          {status && (
            <div style={statusMessageStyle}>
               <i className="fa-solid fa-circle-info"></i> {status}
            </div>
          )}

          <div style={footerCtaStyle}>
            <button 
              onClick={() => void handlePostular()} 
              style={btnMainApplyStyle}
              className="btn-apply-main"
            >
              Aplicar a esta vacante ahora
            </button>
          </div>
        </main>

        {/* COLUMNA DERECHA: SIDEBARSticky */}
        <aside style={sidebarStickyStyle}>
          <h3 style={sidebarTitleStyle}>Resumen de la oferta</h3>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <DetailItem icon="fa-hourglass-half" label="Fecha de publicación" value={fechaPublicacion} />
            <DetailItem icon="fa-location-dot" label="Ubicación" value={ubicacion} />
            <DetailItem icon="fa-briefcase" label="Área" value={area} />
            <DetailItem icon="fa-user-tie" label="Modalidad" value={modalidad} />
            <DetailItem icon="fa-money-bill-wave" label="Salario" value="Competitivo" />
          </ul>

          <button 
            onClick={() => void handlePostular()} 
            style={btnSidebarApplyStyle}
            className="btn-apply-sidebar"
          >
            APLICAR AHORA
          </button>
        </aside>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <li style={detailItemStyle}>
      <div style={detailIconStyle}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={detailLabelStyle}>{label}</span>
        <span style={detailValueStyle}>{value}</span>
      </div>
    </li>
  );
}

/* ---------- STYLES ---------- */

const containerStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "40px auto 80px",
  padding: "0 20px",
};

const contentLayoutStyle: CSSProperties = {
  display: "flex",
  gap: "30px",
  alignItems: "flex-start",
};

const mainContentStyle: CSSProperties = {
  flex: 2,
  background: "#ffffff",
  padding: "40px",
  borderRadius: "12px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
};

const backLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  color: "#DA291C",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: "12px",
  marginBottom: "25px",
  letterSpacing: "0.5px",
};

const headerStyle: CSSProperties = {
  marginBottom: "30px",
};

const titleStyle: CSSProperties = {
  fontSize: "28px",
  fontWeight: 900,
  textTransform: "uppercase",
  color: "#1a1a1a",
  margin: "0 0 15px 0",
  letterSpacing: "-0.5px",
};

const redDividerStyle: CSSProperties = {
  width: "60px",
  height: "4px",
  backgroundColor: "#DA291C",
  borderRadius: "2px",
  boxShadow: "0 2px 5px rgba(218, 41, 28, 0.2)",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "16px",
  color: "#1a1a1a",
  textTransform: "uppercase",
  marginBottom: "25px",
  fontWeight: 900,
  marginTop: "40px",
  letterSpacing: "0.5px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const descriptionTextStyle: CSSProperties = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "1.8",
};

const reqCardStyle: CSSProperties = {
  backgroundColor: "#f8fafc",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #f1f5f9",
};

const reqNameStyle: CSSProperties = {
  fontWeight: 700,
  color: "#1e293b",
  fontSize: "15px",
};

const reqBadgeStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#DA291C",
  textTransform: "uppercase",
  background: "rgba(218, 41, 28, 0.08)",
  padding: "4px 12px",
  borderRadius: "20px",
};

const sidebarStickyStyle: CSSProperties = {
  flex: 1,
  position: "sticky",
  top: "100px",
  background: "#ffffff",
  padding: "30px",
  borderRadius: "12px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
};

const sidebarTitleStyle: CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  textTransform: "uppercase",
  fontWeight: 900,
  marginBottom: "25px",
  letterSpacing: "0.8px",
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "12px",
};

const detailItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: "20px",
};

const detailIconStyle: CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  backgroundColor: "rgba(218, 41, 28, 0.05)",
  color: "#DA291C",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: "15px",
  fontSize: "14px",
};

const detailLabelStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  marginBottom: "2px",
};

const detailValueStyle: CSSProperties = {
  color: "#1e293b",
  fontWeight: 700,
  fontSize: "14px",
};

const btnSidebarApplyStyle: CSSProperties = {
  width: "100%",
  padding: "16px",
  background: "#DA291C",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontWeight: 900,
  fontSize: "13px",
  textTransform: "uppercase",
  cursor: "pointer",
  marginTop: "10px",
  boxShadow: "0 4px 15px rgba(218, 41, 28, 0.3)",
  transition: "all 0.3s ease",
};

const footerCtaStyle: CSSProperties = {
  marginTop: "50px",
  borderTop: "1px solid #f1f5f9",
  paddingTop: "40px",
  display: "flex",
  justifyContent: "center",
};

const btnMainApplyStyle: CSSProperties = {
  padding: "18px 60px",
  background: "#DA291C",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontWeight: 900,
  fontSize: "15px",
  textTransform: "uppercase",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(218, 41, 28, 0.3)",
  transition: "all 0.3s ease",
};

const statusMessageStyle: CSSProperties = {
  marginTop: "20px",
  padding: "15px",
  borderRadius: "8px",
  backgroundColor: "rgba(218, 41, 28, 0.05)",
  border: "1px solid rgba(218, 41, 28, 0.1)",
  color: "#DA291C",
  fontSize: "14px",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: "10px",
};
