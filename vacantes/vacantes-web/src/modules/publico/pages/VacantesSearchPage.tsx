import type { CSSProperties } from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import LayoutFiltro from "../components/LayoutFiltro";
import TarjetaFiltroHorizontal from "../components/TarjetaFiltroHorizontal";
import {
  CATEGORIAS_PRESET,
  FILTROS_INICIALES,
  NICARAGUA_DIVISIONES,
  construirParametrosBusqueda,
  enriquecerVacante,
  filtrarYOrdenarVacantes,
  leerFiltrosDesdeParametros,
  type FiltrosBusquedaVacantes,
} from "../lib/vacantesCatalogo";
import { listarVacantesPublicas, type VacantePublica } from "../../../shared/api/vacantesApi";

export default function VacantesSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<VacantePublica[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filtros, setFiltros] = useState<FiltrosBusquedaVacantes>(() => {
    const parsed = leerFiltrosDesdeParametros(searchParams);
    return { ...FILTROS_INICIALES, ...parsed };
  });

  useEffect(() => {
    void listarVacantesPublicas().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const parsed = leerFiltrosDesdeParametros(searchParams);
    setFiltros((current) => {
      const next = { ...FILTROS_INICIALES, ...parsed };
      return JSON.stringify(current) === JSON.stringify(next) ? current : next;
    });
  }, [searchParams]);

  const enriched = useMemo(() => items.map(enriquecerVacante), [items]);
  const deferredFilters = useDeferredValue(filtros);
  const resultados = useMemo(
    () => filtrarYOrdenarVacantes(enriched, deferredFilters),
    [deferredFilters, enriched],
  );

  const conteos = useMemo(() => {
    const areas: Record<string, number> = {};
    const depts: Record<string, number> = {};
    for (const item of enriched) {
      if (item.categoriaId) areas[item.categoriaId] = (areas[item.categoriaId] ?? 0) + 1;
      if (item.departamentoLabel) depts[item.departamentoLabel] = (depts[item.departamentoLabel] ?? 0) + 1;
    }
    return { areas, depts };
  }, [enriched]);

  function updateFilters(next: Partial<FiltrosBusquedaVacantes>) {
    const combined = { ...filtros, ...next };
    setFiltros(combined);
    setSearchParams(construirParametrosBusqueda(combined), { replace: true });
  }

  return (
    <LayoutFiltro activeTab="busqueda">
      {/* SECCIÓN STRIP DE BÚSQUEDA OSCURA */}
      <section style={searchStripStyle}>
        <div style={searchFormStyle}>
          <div style={searchInputWrapperStyle} className="search-input-wrapper">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              style={searchCleanInputStyle}
              placeholder="Nombre del cargo, Habilidades o Compañía" 
              value={filtros.keyword}
              onChange={e => updateFilters({ keyword: e.target.value })}
            />
          </div>
          
          <div style={searchSelectWrapperStyle} className="search-select-wrapper">
            <select 
              style={searchNativeSelectStyle}
              value={filtros.category}
              onChange={e => updateFilters({ category: e.target.value })}
            >
              <option value="">Categoría</option>
              {CATEGORIAS_PRESET.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div style={searchSelectWrapperStyle} className="search-select-wrapper">
            <select 
              style={searchNativeSelectStyle}
              value={filtros.department}
              onChange={e => updateFilters({ department: e.target.value })}
            >
              <option value="">Nicaragua</option>
              {NICARAGUA_DIVISIONES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button style={btnSearchStyle} className="btn-search">
            <i className="fa-solid fa-search"></i> BUSCAR
          </button>
        </div>
      </section>

      <div style={mainContainerStyle}>
        {/* BARRA LATERAL (Sidebar) */}
        <aside style={sidebarStyle}>
          <div style={filterBoxStyle}>
            <header style={filterHeaderStyle}>
              <i className="fa-solid fa-sliders" style={{ color: '#DA291C' }}></i>
              Filtrar Búsqueda
            </header>
            
            <button 
              onClick={() => updateFilters(FILTROS_INICIALES)} 
              style={clearFiltersLinkStyle}
            >
              <i className="fa-solid fa-rotate-left"></i> RESTABLECER FILTROS
            </button>

            <div style={filterGroupStyle}>
              <h4 style={filterTitleStyle}>Categoría / Área</h4>
              <div style={filterScrollStyle}>
                {Object.entries(conteos.areas).map(([id, count]) => (
                  <div 
                    key={id} 
                    onClick={() => updateFilters({ category: id })}
                    style={filtros.category === id ? filterItemActiveStyle : filterItemStyle}
                    className="filter-item"
                  >
                    <span style={filterLabelStyle}>{CATEGORIAS_PRESET.find(c => c.id === id)?.label || id}</span>
                    <span style={filtros.category === id ? countBadgeActiveStyle : countBadgeStyle}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...filterGroupStyle, borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <h4 style={filterTitleStyle}>Ubicación</h4>
              <div style={filterScrollStyle}>
                {Object.entries(conteos.depts).map(([dept, count]) => (
                  <div 
                    key={dept} 
                    onClick={() => updateFilters({ department: dept })}
                    style={filtros.department === dept ? filterItemActiveStyle : filterItemStyle}
                    className="filter-item"
                  >
                    <span style={filterLabelStyle}>{dept}</span>
                    <span style={filtros.department === dept ? countBadgeActiveStyle : countBadgeStyle}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENIDO DE RESULTADOS */}
        <main style={resultsContentStyle}>
          <div style={resultsToolbarStyle}>
            <div style={totalOffersStyle}>
              <i className="fa-solid fa-briefcase" style={{ color: '#DA291C' }}></i>
              <span>{resultados.length}</span> VACANTES ENCONTRADAS
            </div>
            
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
              <div style={sortOptionsStyle}>
                <span style={toolbarLabelStyle}>ORDENAR POR:</span>
                <select style={sortSelectStyle}>
                  <option>MÁS RECIENTES</option>
                  <option>RELEVANCIA</option>
                </select>
              </div>

              <div style={paginationInfoStyle}>
                <span style={toolbarLabelStyle}>MOSTRAR:</span>
                <span style={pageLimitActiveStyle}>100</span>
                <span style={pageLimitStyle}>50</span>
                <span style={pageLimitStyle}>25</span>
              </div>
            </div>
          </div>

          <div style={jobListStyle}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 110, borderRadius: 4 }} />
              ))
            ) : (
              resultados.map((item) => (
                <TarjetaFiltroHorizontal key={item.idVacante} item={item} />
              ))
            )}
            {!loading && resultados.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", background: "white", border: "1px dashed #ccc" }}>
                No se encontraron vacantes con el filtro actual.
              </div>
            )}
          </div>

          {!loading && resultados.length > 0 && (
            <div className="pagination">
              <div className="page-item"><i className="fa-solid fa-chevron-left"></i></div>
              <div className="page-item active">1</div>
              <div className="page-item">2</div>
              <div className="page-item">3</div>
              <div className="page-item"><i className="fa-solid fa-chevron-right"></i></div>
            </div>
          )}
        </main>
      </div>
    </LayoutFiltro>
  );
}

const toolbarLabelStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 900,
  color: "#94a3b8",
  marginRight: "10px",
  letterSpacing: "0.5px",
};

const pageLimitStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#64748b",
  cursor: "pointer",
  marginLeft: "12px",
  transition: "color 0.2s",
};

const pageLimitActiveStyle: CSSProperties = {
  ...pageLimitStyle,
  color: "#DA291C",
};

const paginationInfoStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const searchStripStyle: CSSProperties = {
  background: "linear-gradient(180deg, #1a1a1a 0%, #2A2A2A 100%)",
  padding: "25px 5%",
  display: "flex",
  justifyContent: "center",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
};

const searchFormStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  width: "100%",
  maxWidth: "1200px",
};

const searchInputWrapperStyle: CSSProperties = {
  position: "relative",
  flex: 2,
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  padding: "0 18px",
  backdropFilter: "blur(4px)",
};

const searchIconStyle: CSSProperties = {
  color: "rgba(255, 255, 255, 0.4)",
  marginRight: "10px",
};

const searchCleanInputStyle: CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  padding: "14px 0",
  fontSize: "14px",
  background: "transparent",
  color: "#ffffff",
  fontWeight: 400,
};

const searchSelectWrapperStyle: CSSProperties = {
  flex: 1,
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  padding: "0 18px",
  position: "relative",
  backdropFilter: "blur(4px)",
};

const searchNativeSelectStyle: CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  padding: "14px 0",
  fontSize: "14px",
  appearance: "none",
  cursor: "pointer",
  background: "transparent",
  color: "#ffffff",
};

const btnSearchStyle: CSSProperties = {
  backgroundColor: "#DA291C",
  color: "#ffffff",
  border: "none",
  padding: "0 35px",
  fontWeight: 900,
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  textTransform: "uppercase",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(218, 41, 28, 0.3)",
};

const mainContainerStyle: CSSProperties = {
  display: "flex",
  gap: "30px",
  maxWidth: "1200px",
  margin: "40px auto",
  padding: "0 5%",
};

const sidebarStyle: CSSProperties = {
  width: "260px",
  flexShrink: 0,
};

const filterBoxStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid rgba(224, 224, 224, 0.6)",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "20px",
  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
  position: "relative",
  overflow: "hidden",
};

const filterHeaderStyle: CSSProperties = {
  fontSize: "13px",
  color: "#333",
  textTransform: "uppercase",
  fontWeight: 900,
  marginBottom: "15px",
  paddingBottom: "12px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  letterSpacing: "0.8px",
  borderBottom: "1px solid #f1f5f9",
};

const filterScrollStyle: CSSProperties = {
  maxHeight: "300px",
  overflowY: "auto",
  marginRight: "-10px",
  paddingRight: "5px",
};

const clearFiltersLinkStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "30px",
  background: "#f1f5f9",
  border: "none",
  cursor: "pointer",
  padding: "8px 12px",
  borderRadius: "6px",
  transition: "all 0.2s",
};

const filterGroupStyle: CSSProperties = {
  marginBottom: "30px",
};

const filterTitleStyle: CSSProperties = {
  fontWeight: 800,
  fontSize: "11px",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "12px",
};

const filterItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "13px",
  color: "#475569",
  marginBottom: "4px",
  cursor: "pointer",
  padding: "8px 10px",
  borderRadius: "6px",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  marginLeft: "-10px",
  marginRight: "-10px",
};

const filterItemActiveStyle: CSSProperties = {
  ...filterItemStyle,
  color: "#DA291C",
  fontWeight: 700,
  backgroundColor: "rgba(218, 41, 28, 0.04)",
  borderLeft: "3px solid #DA291C",
  borderRadius: "0 6px 6px 0",
};

const filterItemStaticStyle: CSSProperties = {
  ...filterItemStyle,
  cursor: "default",
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  fontWeight: 600,
};

const filterLabelStyle: CSSProperties = {
  flex: 1,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  marginRight: "10px",
};

const countBadgeStyle: CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  backgroundColor: "#f8fafc",
  padding: "2px 8px",
  borderRadius: "10px",
  fontWeight: 600,
  border: "1px solid #f1f5f9",
};

const countBadgeActiveStyle: CSSProperties = {
  ...countBadgeStyle,
  color: "#ffffff",
  backgroundColor: "#DA291C",
  borderColor: "#DA291C",
};

const activeIndicatorStyle: CSSProperties = {
  width: "6px",
  height: "6px",
  backgroundColor: "#10b981",
  borderRadius: "50%",
};

const resultsContentStyle: CSSProperties = {
  flexGrow: 1,
};

const resultsHeaderTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const resultsTitleStyle: CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#333333",
  textTransform: "uppercase",
};

const btnAlertStyle: CSSProperties = {
  background: "transparent",
  border: "1px solid #DA291C",
  color: "#DA291C",
  padding: "8px 15px",
  fontSize: "12px",
  fontWeight: 700,
  borderRadius: "4px",
  cursor: "pointer",
};

const resultsToolbarStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid rgba(224, 224, 224, 0.6)",
  padding: "18px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: "12px",
  marginBottom: "20px",
  fontSize: "13px",
  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
};

const totalOffersStyle: CSSProperties = {
  color: "#333333",
};

const sortOptionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const sortSelectStyle: CSSProperties = {
  border: "1px solid #E0E0E0",
  padding: "5px",
  fontSize: "13px",
  borderRadius: "3px",
};

const jobListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};
