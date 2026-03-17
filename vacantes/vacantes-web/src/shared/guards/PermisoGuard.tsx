import { useEffect, useState, type ReactNode } from "react";

import { getPortalMe, hasRhVacantes } from "../api/coreSessionApi";
import { buildPortalLoginUrl, currentReturnUrl } from "../security/portalLogin";

type PermisoGuardProps = {
  rhOnly?: boolean;
  children: ReactNode;
};

export default function PermisoGuard({ rhOnly = false, children }: PermisoGuardProps) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getPortalMe().then((identity) => {
      if (!identity) {
        window.location.href = buildPortalLoginUrl(currentReturnUrl());
        return;
      }

      if (rhOnly && !hasRhVacantes(identity)) {
        window.location.href = "/sin-acceso";
        return;
      }

      setAllowed(true);
      setLoading(false);
    });
}, [rhOnly]);

  if (loading) {
    return <div style={{ padding: 24 }}>Validando permisos...</div>;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
