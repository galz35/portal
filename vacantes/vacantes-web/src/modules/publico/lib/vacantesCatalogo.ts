import type { VacantePublica } from "../../../shared/api/vacantesApi";

export const NICARAGUA_DIVISIONES = [
  "Boaco",
  "Carazo",
  "Chinandega",
  "Chontales",
  "Esteli",
  "Granada",
  "Jinotega",
  "Leon",
  "Madriz",
  "Managua",
  "Masaya",
  "Matagalpa",
  "Nueva Segovia",
  "Rio San Juan",
  "Rivas",
  "RACCN",
  "RACCS",
] as const;

export const PAISES_PORTAL = [
  { code: "NI", label: "Nicaragua" },
  { code: "CR", label: "Costa Rica" },
  { code: "GT", label: "Guatemala" },
  { code: "HN", label: "Honduras" },
  { code: "SV", label: "El Salvador" },
  { code: "PA", label: "Panama" },
  { code: "CO", label: "Colombia" },
] as const;

export const CATEGORIAS_PRESET = [
  {
    id: "ventas",
    label: "Ventas y comercial",
    aliases: [
      "ventas",
      "comercial",
      "vendedor",
      "ejecutivo de ventas",
      "account manager",
      "b2b",
      "mercadeo",
      "pymes",
      "corporativo",
      "cartera",
      "postventa",
    ],
  },
  {
    id: "atencion",
    label: "Atencion al cliente",
    aliases: [
      "servicio al cliente",
      "atencion",
      "call center",
      "customer",
      "soporte",
      "asesor",
      "cac",
      "retencion",
      "experiencia al cliente",
    ],
  },
  {
    id: "logistica",
    label: "Logistica y bodega",
    aliases: [
      "logistica",
      "bodega",
      "inventario",
      "despacho",
      "motorista",
      "chofer",
      "ruta",
      "distribucion",
      "almacen",
    ],
  },
  {
    id: "operaciones",
    label: "Operaciones",
    aliases: [
      "operaciones",
      "produccion",
      "planta",
      "supervisor",
      "campo",
      "tecnico",
      "canal masivo",
      "instalacion",
      "cobertura",
    ],
  },
  {
    id: "finanzas",
    label: "Finanzas y contabilidad",
    aliases: ["finanzas", "contabilidad", "contador", "auditor", "cpa", "tesoreria"],
  },
  {
    id: "tecnologia",
    label: "Tecnologia",
    aliases: [
      "tecnologia",
      "developer",
      "desarrollador",
      "qa",
      "software",
      "cloud",
      "devops",
      "datos",
      "telecomunicaciones",
      "red",
      "transmision",
      "planta externa",
      "fibra optica",
      "ftth",
      "noc",
      "radio base",
      "soporte tecnico",
    ],
  },
  {
    id: "rrhh",
    label: "Recursos humanos",
    aliases: ["rrhh", "recursos humanos", "reclutamiento", "talento", "psicologia", "seleccion"],
  },
  {
    id: "administracion",
    label: "Administracion",
    aliases: ["administracion", "asistente", "coordinador", "recepcion", "back office", "secretaria"],
  },
  {
    id: "seguridad",
    label: "Seguridad y mantenimiento",
    aliases: ["seguridad", "vigilancia", "mantenimiento", "limpieza", "servicios generales"],
  },
  {
    id: "salud",
    label: "Salud",
    aliases: ["salud", "medico", "enfermeria", "laboratorio", "farmacia"],
  },
  {
    id: "general",
    label: "General",
    aliases: [],
  },
] as const;

export const REQUISITOS_PRESET = [
  {
    id: "servicio",
    label: "Servicio al cliente",
    tokens: ["servicio al cliente", "protocolo de servicio", "atencion personalizada", "reclamos", "consultas"],
  },
  {
    id: "metas",
    label: "Metas y ventas",
    tokens: ["metas", "ventas", "retencion", "resultados", "prospeccion", "cierres", "cartera", "postventa"],
  },
  {
    id: "licencia",
    label: "Licencia / conducir",
    tokens: ["licencia", "conducir", "chofer", "motorista"],
  },
  {
    id: "vehiculo",
    label: "Vehiculo propio",
    tokens: ["vehiculo", "vehiculo propio", "moto propia"],
  },
  {
    id: "ingles",
    label: "Ingles",
    tokens: ["ingles", "english", "bilingue"],
  },
  {
    id: "excel",
    label: "Excel / Office",
    tokens: ["excel", "office", "word", "powerpoint"],
  },
  {
    id: "turnos",
    label: "Turnos o rotacion",
    tokens: ["turno", "rotativo", "horario", "fines de semana", "24/7", "jornada extendida"],
  },
  {
    id: "viajes",
    label: "Disponibilidad para viajar",
    tokens: ["viajar", "giras", "movilizarse", "trasladarse"],
  },
  {
    id: "record",
    label: "Record de policia",
    tokens: ["record de policia", "antecedentes", "record policial"],
  },
  {
    id: "salud",
    label: "Certificado de salud",
    tokens: ["certificado de salud", "carnet de salud"],
  },
  {
    id: "universidad",
    label: "Titulo o nivel universitario",
    tokens: ["universitario", "licenciatura", "ingenieria", "graduado", "cpa", "titulo"],
  },
  {
    id: "seguridad",
    label: "Seguridad operativa",
    tokens: ["seguridad ocupacional", "protocolos de seguridad", "epp", "altura", "riesgos", "iso 45001"],
  },
] as const;

export type FiltrosBusquedaVacantes = {
  keyword: string;
  department: string;
  category: string;
  country: string;
  modality: string;
  requirementTags: string[];
};

export type VacantePublicaEnriquecida = VacantePublica & {
  areaLabel: string;
  departamentoLabel: string;
  categoriaId: string;
  categoriaLabel: string;
  paisLabel: string;
  requirementTags: string[];
  searchableText: string;
};

const CATEGORIA_POR_ID = new Map<string, (typeof CATEGORIAS_PRESET)[number]>(
  CATEGORIAS_PRESET.map((item) => [item.id, item]),
);
const REQUISITO_POR_ID = new Map<string, (typeof REQUISITOS_PRESET)[number]>(
  REQUISITOS_PRESET.map((item) => [item.id, item]),
);

export const FILTROS_INICIALES: FiltrosBusquedaVacantes = {
  keyword: "",
  department: "",
  category: "",
  country: "NI",
  modality: "",
  requirementTags: [],
};

export function normalizarTexto(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function paisNombre(code?: string | null) {
  const item = PAISES_PORTAL.find((entry) => entry.code === (code ?? ""));
  return item?.label ?? (code?.trim() || "Sin definir");
}

export function construirParametrosBusqueda(filtros: FiltrosBusquedaVacantes) {
  const params = new URLSearchParams();
  if (filtros.keyword.trim()) params.set("q", filtros.keyword.trim());
  if (filtros.department.trim()) params.set("dept", filtros.department.trim());
  if (filtros.category.trim()) params.set("cat", filtros.category.trim());
  if (filtros.country.trim()) params.set("country", filtros.country.trim());
  if (filtros.modality.trim()) params.set("mode", filtros.modality.trim());
  if (filtros.requirementTags.length > 0) params.set("req", filtros.requirementTags.join(","));
  return params;
}

export function leerFiltrosDesdeParametros(params: URLSearchParams): FiltrosBusquedaVacantes {
  return {
    keyword: params.get("q") ?? FILTROS_INICIALES.keyword,
    department: params.get("dept") ?? FILTROS_INICIALES.department,
    category: params.get("cat") ?? FILTROS_INICIALES.category,
    country: params.get("country") ?? FILTROS_INICIALES.country,
    modality: params.get("mode") ?? FILTROS_INICIALES.modality,
    requirementTags: (params.get("req") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

export function enriquecerVacante(item: VacantePublica): VacantePublicaEnriquecida {
  const areaLabel = item.area?.trim() || "General";
  const departamentoLabel = detectarDepartamento(item);
  const categoriaId = detectarCategoriaId(item, areaLabel);
  const categoriaLabel = CATEGORIA_POR_ID.get(categoriaId)?.label ?? "General";
  const paisLabel = paisNombre(item.codigoPais);
  const requirementTags = detectarRequisitos(item);
  const categoriaAliases = CATEGORIA_POR_ID.get(categoriaId)?.aliases.join(" ") ?? "";
  const requirementAliases = requirementTags
    .map((id) => REQUISITO_POR_ID.get(id)?.label ?? id)
    .join(" ");

  const searchableText = normalizarTexto(
    [
      item.titulo,
      item.codigoVacante,
      item.ubicacion,
      item.codigoPais,
      paisLabel,
      areaLabel,
      departamentoLabel,
      categoriaLabel,
      categoriaAliases,
      item.modalidad,
      item.tipoVacante,
      item.descripcion,
      item.requisitos,
      item.nivelExperiencia,
      requirementAliases,
    ].join(" "),
  );

  return {
    ...item,
    areaLabel,
    departamentoLabel,
    categoriaId,
    categoriaLabel,
    paisLabel,
    requirementTags,
    searchableText,
  };
}

export function filtrarYOrdenarVacantes(
  items: VacantePublicaEnriquecida[],
  filtros: FiltrosBusquedaVacantes,
) {
  const keyword = normalizarTexto(filtros.keyword);
  const department = normalizarTexto(filtros.department);
  const category = normalizarTexto(filtros.category);
  const modality = normalizarTexto(filtros.modality);
  const country = filtros.country.trim().toUpperCase();

  return items
    .map((item) => ({
      item,
      score: keyword ? puntuarVacante(item, keyword) : 0,
    }))
    .filter(({ item, score }) => {
      if (keyword && score <= 0) return false;
      if (country && (item.codigoPais ?? "").toUpperCase() !== country) return false;
      if (department && normalizarTexto(item.departamentoLabel) !== department) return false;
      if (category && item.categoriaId !== category) return false;
      if (modality && normalizarTexto(item.modalidad) !== modality) return false;
      if (filtros.requirementTags.length > 0) {
        const itemTags = new Set(item.requirementTags);
        for (const tag of filtros.requirementTags) {
          if (!itemTags.has(tag)) return false;
        }
      }
      return true;
    })
    .sort((left, right) => {
      if (keyword && right.score !== left.score) {
        return right.score - left.score;
      }

      const fechaRight = Date.parse(right.item.fechaPublicacion ?? "");
      const fechaLeft = Date.parse(left.item.fechaPublicacion ?? "");
      if (Number.isFinite(fechaRight) && Number.isFinite(fechaLeft) && fechaRight !== fechaLeft) {
        return fechaRight - fechaLeft;
      }

      return left.item.titulo.localeCompare(right.item.titulo);
    })
    .map(({ item }) => item);
}

export function conteoPorCategoria(items: VacantePublicaEnriquecida[]) {
  return contar(items.map((item) => item.categoriaId));
}

export function conteoPorDepartamento(items: VacantePublicaEnriquecida[]) {
  return contar(items.map((item) => item.departamentoLabel).filter(Boolean));
}

export function conteoPorModalidad(items: VacantePublicaEnriquecida[]) {
  return contar(items.map((item) => item.modalidad || "Sin definir"));
}

export function conteoPorRequisito(items: VacantePublicaEnriquecida[]) {
  return contar(items.flatMap((item) => item.requirementTags));
}

export function categoriaLabel(categoryId: string) {
  return CATEGORIA_POR_ID.get(categoryId)?.label ?? "General";
}

export function requisitoLabel(requirementId: string) {
  return REQUISITO_POR_ID.get(requirementId)?.label ?? requirementId;
}

function detectarDepartamento(item: VacantePublica) {
  if (item.departamento?.trim()) {
    return item.departamento.trim();
  }

  const ubicacionNormalizada = normalizarTexto(item.ubicacion);
  const match = NICARAGUA_DIVISIONES.find((division) =>
    ubicacionNormalizada.includes(normalizarTexto(division)),
  );

  if (match) {
    return match;
  }

  return item.codigoPais === "NI" ? "Sin definir" : paisNombre(item.codigoPais);
}

function detectarCategoriaId(item: VacantePublica, areaLabel: string) {
  const searchable = normalizarTexto(
    [item.titulo, areaLabel, item.descripcion, item.requisitos, item.tipoVacante].join(" "),
  );

  const encontrada = CATEGORIAS_PRESET.find((categoria) =>
    categoria.aliases.some((alias) => searchable.includes(normalizarTexto(alias))),
  );

  return encontrada?.id ?? "general";
}

function detectarRequisitos(item: VacantePublica) {
  const searchable = normalizarTexto([item.titulo, item.descripcion, item.requisitos].join(" "));
  return REQUISITOS_PRESET.filter((preset) =>
    preset.tokens.some((token) => searchable.includes(normalizarTexto(token))),
  ).map((preset) => preset.id);
}

function puntuarVacante(item: VacantePublicaEnriquecida, query: string) {
  if (!query) return 0;

  const tokens = query.split(" ").filter(Boolean);
  const title = normalizarTexto(item.titulo);
  const categoryAliases = CATEGORIA_POR_ID.get(item.categoriaId)?.aliases ?? [];
  const hayTodosLosTokens = tokens.every((token) => item.searchableText.includes(token));

  if (!hayTodosLosTokens) {
    return 0;
  }

  let score = 25;

  if (title === query) score += 220;
  if (title.startsWith(query)) score += 120;
  if (title.includes(query)) score += 90;
  if (normalizarTexto(item.categoriaLabel) === query) score += 70;
  if (normalizarTexto(item.areaLabel).includes(query)) score += 45;

  for (const token of tokens) {
    if (title.includes(token)) score += 28;
    if (normalizarTexto(item.departamentoLabel).includes(token)) score += 18;
    if (normalizarTexto(item.areaLabel).includes(token)) score += 16;
    if (categoryAliases.some((alias) => normalizarTexto(alias).includes(token))) score += 14;
    if (item.searchableText.includes(token)) score += 8;
  }

  return score;
}

function contar(values: string[]) {
  const counts: Record<string, number> = {};
  for (const value of values) {
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}
