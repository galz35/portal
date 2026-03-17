export type PortalIdentity = {
  idCuentaPortal?: number;
  idPersona?: number;
  usuario?: string;
  nombre?: string;
  apps?: string[];
  permisos?: string[];
};

export async function getPortalMe(): Promise<PortalIdentity | null> {
  console.log('Checking portal session via Vacantes API...');
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      console.log('No portal session found (401 or similar)');
      return null;
    }

    const identity = (await response.json()) as PortalIdentity;
    console.log('Portal session confirmed for:', identity.usuario);
    return identity;
  } catch (err) {
    console.error('Error fetching portal session:', err);
    return null;
  }
}

export function hasVacantesAccess(identity: PortalIdentity | null): boolean {
  if (!identity) {
    return false;
  }

  const apps = identity.apps ?? [];
  const permisos = identity.permisos ?? [];
  return apps.includes("vacantes") || permisos.includes("app.vacantes");
}

export function hasRhVacantes(identity: PortalIdentity | null): boolean {
  if (!identity) {
    return false;
  }

  const apps = identity.apps ?? [];
  const permisos = identity.permisos ?? [];
  const hasApp = apps.includes("vacantes") || permisos.includes("app.vacantes");
  const hasRhPermission =
    permisos.includes("vacantes.rh.ver") ||
    permisos.includes("vacantes.rh.crear") ||
    permisos.includes("vacantes.rh.estado");

  return hasApp && hasRhPermission;
}
