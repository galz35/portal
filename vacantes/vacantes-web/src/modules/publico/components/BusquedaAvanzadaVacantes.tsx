import type { CSSProperties } from "react";
import { startTransition, useMemo } from "react";

import type { FiltrosBusquedaVacantes, VacantePublicaEnriquecida } from "../lib/vacantesCatalogo";
import {
  CATEGORIAS_PRESET,
  NICARAGUA_DIVISIONES,
  PAISES_PORTAL,
  REQUISITOS_PRESET,
  conteoPorCategoria,
  conteoPorDepartamento,
  conteoPorModalidad,
  conteoPorRequisito,
} from "../lib/vacantesCatalogo";

type Props = {
  items: VacantePublicaEnriquecida[];
  filtros: FiltrosBusquedaVacantes;
  onChange: (next: FiltrosBusquedaVacantes) => void;
  advancedOpen: boolean;
  onToggleAdvanced: () => void;
};

export default function BusquedaAvanzadaVacantes({
  items,
  filtros,
  onChange,
  advancedOpen,
  onToggleAdvanced,
}: Props) {
  const conteoCategorias = useMemo(() => conteoPorCategoria(items), [items]);
  const conteoDepartamentos = useMemo(() => conteoPorDepartamento(items), [items]);
  const conteoModalidades = useMemo(() => conteoPorModalidad(items), [items]);
  const conteoRequisitos = useMemo(() => conteoPorRequisito(items), [items]);

  return (
    <aside style={panelStyle}>
      <div style={panelHeaderStyle}>
        <div>
          <span style={eyebrowStyle}>Busqueda guiada</span>
          <h2 style={titleStyle}>Encuentra mas rapido</h2>
        </div>
        <button type="button" onClick={onToggleAdvanced} style={ghostButtonStyle}>
          {advancedOpen ? "Ocultar avanzado" : "Modo avanzado"}
        </button>
      </div>

      <div style={fieldStackStyle}>
        <label style={labelStyle}>Puesto, empresa o palabra clave</label>
        <input
          value={filtros.keyword}
          onChange={(event) =>
            startTransition(() =>
              onChange({
                ...filtros,
                keyword: event.target.value,
              }),
            )}
          placeholder="Ej. vendedor, contador, tecnologia"
          style={inputStyle}
        />
      </div>

      <div style={fieldGridStyle}>
        <div style={fieldStackStyle}>
          <label style={labelStyle}>Departamento o region</label>
          <select
            value={filtros.department}
            onChange={(event) => onChange({ ...filtros, department: event.target.value })}
            style={selectStyle}
          >
            <option value="">Todos</option>
            {NICARAGUA_DIVISIONES.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStackStyle}>
          <label style={labelStyle}>Categoria</label>
          <select
            value={filtros.category}
            onChange={(event) => onChange({ ...filtros, category: event.target.value })}
            style={selectStyle}
          >
            <option value="">Todas</option>
            {CATEGORIAS_PRESET.filter((item) => item.id !== "general").map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStackStyle}>
          <label style={labelStyle}>Pais</label>
          <select
            value={filtros.country}
            onChange={(event) => onChange({ ...filtros, country: event.target.value })}
            style={selectStyle}
          >
            {PAISES_PORTAL.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {advancedOpen ? (
        <div style={advancedWrapStyle}>
          <div style={fieldStackStyle}>
            <label style={labelStyle}>Modalidad</label>
            <div style={chipWrapStyle}>
              <FilterChip
                label="Todas"
                count={items.length}
                active={filtros.modality === ""}
                onClick={() => onChange({ ...filtros, modality: "" })}
              />
              {Object.entries(conteoModalidades)
                .sort((left, right) => right[1] - left[1])
                .map(([key, value]) => (
                  <FilterChip
                    key={key}
                    label={key}
                    count={value}
                    active={filtros.modality === key}
                    onClick={() =>
                      onChange({
                        ...filtros,
                        modality: filtros.modality === key ? "" : key,
                      })
                    }
                  />
                ))}
            </div>
          </div>

          <div style={fieldStackStyle}>
            <label style={labelStyle}>Lo que menciona la vacante</label>
            <div style={chipWrapStyle}>
              {REQUISITOS_PRESET.map((item) => (
                <FilterChip
                  key={item.id}
                  label={item.label}
                  count={conteoRequisitos[item.id] ?? 0}
                  active={filtros.requirementTags.includes(item.id)}
                  onClick={() =>
                    onChange({
                      ...filtros,
                      requirementTags: filtros.requirementTags.includes(item.id)
                        ? filtros.requirementTags.filter((value) => value !== item.id)
                        : [...filtros.requirementTags, item.id],
                    })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div style={insightGridStyle}>
        <InsightCard label="Categorias" value={Object.keys(conteoCategorias).length} />
        <InsightCard label="Departamentos" value={Object.keys(conteoDepartamentos).length} />
        <InsightCard label="Requisitos" value={Object.keys(conteoRequisitos).length} />
      </div>

      <button
        type="button"
        onClick={() =>
          onChange({
            keyword: "",
            department: "",
            category: "",
            country: "NI",
            modality: "",
            requirementTags: [],
          })
        }
        style={resetButtonStyle}
      >
        Limpiar filtros
      </button>
    </aside>
  );
}

function InsightCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={insightCardStyle}>
      <strong style={insightValueStyle}>{value}</strong>
      <span style={insightLabelStyle}>{label}</span>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} style={{ ...chipStyle, ...(active ? chipActiveStyle : null) }}>
      <span>{label}</span>
      <span style={{ ...chipCountStyle, ...(active ? chipCountActiveStyle : null) }}>{count}</span>
    </button>
  );
}

const panelStyle: CSSProperties = {
  display: "grid",
  gap: 18,
  padding: 24,
  borderRadius: 28,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  boxShadow: "0 30px 60px -46px rgba(15, 23, 42, 0.6)",
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const eyebrowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  padding: "4px 10px",
  borderRadius: 999,
  background: "#f8fafc",
  color: "#475569",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const titleStyle: CSSProperties = {
  margin: "10px 0 0",
  fontSize: 24,
  lineHeight: 1.1,
  fontWeight: 900,
  color: "#0f172a",
};

const ghostButtonStyle: CSSProperties = {
  minHeight: 42,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid rgba(15, 23, 42, 0.1)",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 700,
};

const fieldGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const fieldStackStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#64748b",
};

const inputStyle: CSSProperties = {
  minHeight: 54,
  padding: "0 16px",
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.3)",
  background: "#f8fafc",
  fontSize: 15,
  color: "#0f172a",
};

const selectStyle: CSSProperties = {
  ...inputStyle,
  appearance: "none",
};

const advancedWrapStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  paddingTop: 6,
  borderTop: "1px solid rgba(148, 163, 184, 0.18)",
};

const chipWrapStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const chipStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 38,
  padding: "0 12px",
  borderRadius: 999,
  border: "1px solid rgba(148, 163, 184, 0.24)",
  background: "#ffffff",
  color: "#334155",
  fontSize: 13,
  fontWeight: 700,
};

const chipActiveStyle: CSSProperties = {
  background: "#0f172a",
  color: "#ffffff",
  borderColor: "#0f172a",
};

const chipCountStyle: CSSProperties = {
  minWidth: 24,
  minHeight: 24,
  padding: "0 7px",
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "#f1f5f9",
  color: "#475569",
  fontSize: 11,
  fontWeight: 800,
};

const chipCountActiveStyle: CSSProperties = {
  background: "rgba(255,255,255,0.14)",
  color: "#ffffff",
};

const insightGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
};

const insightCardStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  padding: "14px 12px",
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid rgba(148, 163, 184, 0.18)",
};

const insightValueStyle: CSSProperties = {
  fontSize: 22,
  lineHeight: 1,
  color: "#0f172a",
};

const insightLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const resetButtonStyle: CSSProperties = {
  minHeight: 46,
  borderRadius: 16,
  border: "1px solid rgba(190, 24, 93, 0.18)",
  background: "#fff1f2",
  color: "#9f1239",
  fontSize: 14,
  fontWeight: 800,
};
