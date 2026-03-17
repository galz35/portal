import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import {
  getCandidateCurrentCv,
  listCandidateCvHistory,
  uploadCandidateCv,
  type CandidateCvFile,
} from "../../../shared/api/candidateApi";

export default function MiCvPage() {
  const [currentCv, setCurrentCv] = useState<CandidateCvFile | null>(null);
  const [history, setHistory] = useState<CandidateCvFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [inputKey, setInputKey] = useState(0);

  const canUpload = useMemo(() => selectedFile !== null && !uploading, [selectedFile, uploading]);

  useEffect(() => {
    void reloadCvData();
  }, []);

  async function reloadCvData() {
    setLoading(true);
    setError("");

    const [currentResult, historyResult] = await Promise.all([
      getCandidateCurrentCv(),
      listCandidateCvHistory(),
    ]);

    if (!currentResult.response.ok && currentResult.response.status !== 200) {
      setError(currentResult.message ?? "No fue posible consultar tu CV actual");
    } else {
      setCurrentCv(currentResult.archivo);
    }

    if (!historyResult.response.ok) {
      setError(historyResult.message ?? "No fue posible consultar el historial de CV");
      setHistory([]);
    } else {
      setHistory(historyResult.items);
    }

    setLoading(false);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError("");
    setMessage("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedFile || uploading) return;

    setUploading(true);
    setError("");
    setMessage("");

    const { response, data } = await uploadCandidateCv(selectedFile);
    if (!response.ok || !data.ok) {
      setError(data.message ?? "No fue posible subir el CV");
      setUploading(false);
      return;
    }

    setMessage(data.message ?? "CV cargado correctamente");
    setSelectedFile(null);
    setInputKey((value) => value + 1);
    await reloadCvData();
    setUploading(false);
  }

  return (
    <div style={dashboardContainerStyle}>
      <div style={welcomeBannerStyle}>
        <div style={welcomeIconStyle}><i className="fa-solid fa-rocket"></i></div>
        <h2 style={welcomeTitleStyle}>MI PANEL DE CANDIDATO</h2>
      </div>

      <div style={dashboardCardStyle}>
        <header style={cardHeaderStyle}>
          <i className="fa-solid fa-cloud-arrow-up" style={{ color: '#DA291C' }}></i>
          <h3 style={cardTitleStyle}>Gestión de Currículum</h3>
        </header>

        <p style={instructionTextStyle}>
          Olvídate de llenar formularios largos. Sube tu hoja de vida en formato PDF o Word y usa el mismo archivo para aplicar a todas las vacantes de Claro Nicaragua con un solo clic.
        </p>

        {error && <div style={errorStyle}>{error}</div>}
        {message && <div style={messageStyle}>{message}</div>}

        {loading ? (
          <div style={skeletonStyle}>Cargando información...</div>
        ) : currentCv ? (
          <div style={currentCvBoxStyle}>
            <div style={cvInfoStyle}>
              <div style={cvIconStyle}><i className="fa-solid fa-file-pdf"></i></div>
              <div>
                <h4 style={cvNameStyle}>{currentCv.nombre_original}</h4>
                <p style={cvMetaStyle}>
                  Subido el: {new Date(currentCv.fecha_creacion).toLocaleDateString()} • {formatBytes(currentCv.tamano_bytes)}
                </p>
              </div>
            </div>
            <div style={cvActionsStyle}>
              <button style={btnActionStyle} onClick={() => window.open(currentCv.nombre_original, '_blank')}>
                <i className="fa-solid fa-eye"></i> VER
              </button>
            </div>
          </div>
        ) : (
          <div style={noCvStyle}>
            Aún no has subido tu currículum. Súbelo ahora para empezar a aplicar.
          </div>
        )}

        <form onSubmit={onSubmit} style={uploadDropzoneStyle}>
          <i className="fa-solid fa-cloud-arrow-up" style={dropIconStyle}></i>
          <h4 style={dropTitleStyle}>{selectedFile ? selectedFile.name : "Selecciona tu nuevo currículum"}</h4>
          <p style={dropSubtitleStyle}>Sube tu archivo en formato PDF o DOCX (Máx. 10MB)</p>
          
          <input
            key={inputKey}
            type="file"
            id="cv-upload"
            hidden
            accept=".pdf,.docx"
            onChange={onFileChange}
          />

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              type="button" 
              style={btnExploreStyle}
              onClick={() => document.getElementById('cv-upload')?.click()}
            >
              EXPLORAR ARCHIVOS
            </button>
            
            {canUpload && (
              <button type="submit" style={btnUploadStyle}>
                {uploading ? "SUBIENDO..." : "CONFIRMAR CARGA"}
              </button>
            )}
          </div>
        </form>

        <section style={{ marginTop: '40px' }}>
          <h4 style={historyTitleStyle}>Historial de versiones</h4>
          <div style={historyTableStyle}>
            {history.map((cv) => (
              <div key={cv.id_archivo_candidato_cv} style={historyItemStyle}>
                <div style={{ flex: 1, fontWeight: 700, color: '#1e293b' }}>{cv.nombre_original}</div>
                <div style={{ width: '120px', color: '#64748b', fontSize: '13px' }}>{new Date(cv.fecha_creacion).toLocaleDateString()}</div>
                <div style={{ width: '100px', textAlign: 'right' }}><span style={badgeStyle}>{cv.estado_archivo}</span></div>
              </div>
            ))}
            {history.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No hay historial disponible</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

/* ---------- STYLES ---------- */

const dashboardContainerStyle: React.CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  padding: "40px 20px",
};

const welcomeBannerStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
  padding: "25px 35px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  gap: "20px",
  marginBottom: "35px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
};

const welcomeIconStyle: React.CSSProperties = {
  width: "50px",
  height: "50px",
  background: "rgba(218, 41, 28, 0.1)",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#DA291C",
  fontSize: "20px",
};

const welcomeTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const dashboardCardStyle: React.CSSProperties = {
  background: "#ffffff",
  padding: "40px",
  borderRadius: "16px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 15px 35px -10px rgba(0, 0, 0, 0.05)",
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "25px",
  paddingBottom: "15px",
  borderBottom: "2px solid #DA291C",
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 900,
  textTransform: "uppercase",
  color: "#1a1a1a",
  letterSpacing: "0.5px",
};

const instructionTextStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "15px",
  lineHeight: "1.7",
  marginBottom: "35px",
};

const currentCvBoxStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "25px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "35px",
};

const cvInfoStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
};

const cvIconStyle: React.CSSProperties = {
  fontSize: "32px",
  color: "#DA291C",
};

const cvNameStyle: React.CSSProperties = {
  margin: "0 0 5px 0",
  fontSize: "15px",
  fontWeight: 700,
  color: "#1e293b",
};

const cvMetaStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  color: "#94a3b8",
};

const cvActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
};

const btnActionStyle: React.CSSProperties = {
  padding: "10px 18px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#1e293b",
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const uploadDropzoneStyle: React.CSSProperties = {
  border: "2px dashed #cbd5e1",
  borderRadius: "16px",
  padding: "50px 30px",
  textAlign: "center",
  background: "#fcfcfc",
  transition: "all 0.3s ease",
};

const dropIconStyle: React.CSSProperties = {
  fontSize: "40px",
  color: "#94a3b8",
  marginBottom: "20px",
};

const dropTitleStyle: React.CSSProperties = {
  margin: "0 0 10px 0",
  fontSize: "16px",
  color: "#1e293b",
  fontWeight: 700,
};

const dropSubtitleStyle: React.CSSProperties = {
  margin: "0 0 30px 0",
  fontSize: "14px",
  color: "#64748b",
};

const btnExploreStyle: React.CSSProperties = {
  background: "#ffffff",
  color: "#1e293b",
  border: "1px solid #cbd5e1",
  padding: "12px 25px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
  transition: "all 0.2s",
};

const btnUploadStyle: React.CSSProperties = {
  background: "#DA291C",
  color: "#ffffff",
  border: "none",
  padding: "12px 25px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 5px 15px rgba(218, 41, 28, 0.2)",
};

const historyTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 900,
  textTransform: "uppercase",
  color: "#64748b",
  marginBottom: "20px",
  letterSpacing: "0.5px",
};

const historyTableStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
};

const historyItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "15px 20px",
  background: "#ffffff",
  border: "1px solid #f1f5f9",
  borderRadius: "10px",
};

const badgeStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 800,
  color: "#059669",
  background: "#ecfdf5",
  padding: "4px 10px",
  borderRadius: "20px",
  textTransform: "uppercase",
};

const errorStyle: React.CSSProperties = {
  background: "#fff1f0",
  border: "1px solid #ffa39e",
  color: "#cf1322",
  padding: "12px 20px",
  borderRadius: "10px",
  marginBottom: "20px",
  fontSize: "14px",
  fontWeight: 600,
};

const messageStyle: React.CSSProperties = {
  background: "#f6ffed",
  border: "1px solid #b7eb8f",
  color: "#389e0d",
  padding: "12px 20px",
  borderRadius: "10px",
  marginBottom: "20px",
  fontSize: "14px",
  fontWeight: 600,
};

const noCvStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "30px",
  background: "#fffbeb",
  border: "1px solid #fef3c7",
  borderRadius: "12px",
  color: "#b45309",
  fontSize: "14px",
  fontWeight: 600,
  marginBottom: "30px",
};

const skeletonStyle: React.CSSProperties = {
  padding: "40px",
  background: "#f8fafc",
  borderRadius: "12px",
  textAlign: "center",
  color: "#94a3b8",
  marginBottom: "30px",
};
