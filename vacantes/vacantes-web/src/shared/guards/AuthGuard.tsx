import { useEffect, useState, type ReactNode } from "react";

import { getPortalMe } from "../api/coreSessionApi";
import { buildPortalLoginUrl, currentReturnUrl } from "../security/portalLogin";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getPortalMe().then((identity) => {
      if (!identity) {
        window.location.href = buildPortalLoginUrl(currentReturnUrl());
        return;
      }

      setAllowed(true);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Validando sesion...</div>;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
