import { useEffect, useState, type ReactNode } from "react";

import { getCandidateMe } from "../api/candidateApi";

type CandidateGuardProps = {
  children: ReactNode;
};

export default function CandidateGuard({ children }: CandidateGuardProps) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getCandidateMe().then((profile) => {
      if (!profile) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?returnUrl=${returnUrl}`;
        return;
      }

      setAllowed(true);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Validando acceso candidato...</div>;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
