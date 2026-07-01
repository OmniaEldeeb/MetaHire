"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/lib/api/endpoints/auth";
import { getToken } from "@/lib/api/session";

/** Runs once on mount. If a token is present, fetches the current user. */
export function AuthBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    if (!getToken()) {
      setStatus("guest");
      return;
    }
    setStatus("loading");
    authApi
      .me()
      .then((res) =>
        setSession({
          user: res.user,
          role: res.role,
          actingCompany: res.acting_company ?? null,
          companyRole: res.company_role ?? null,
        }),
      )
      .catch(() => signOut());
  }, [setSession, setStatus, signOut]);

  return null;
}
