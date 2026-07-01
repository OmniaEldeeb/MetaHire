"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthPayload } from "@/lib/api/types";
import { authApi } from "@/lib/api/endpoints/auth";
import {
  devicesApi,
  getWebPushToken,
} from "@/lib/api/endpoints/devices";

/** Registers the FCM token if we have one — never blocks the auth flow. */
async function registerDeviceSafe() {
  try {
    const token = await getWebPushToken();
    if (token) await devicesApi.register({ token, platform: "web" });
  } catch {
    /* push is best-effort */
  }
}

export function useAuthSuccess() {
  const router = useRouter();
  const params = useSearchParams();
  const signIn = useAuthStore((s) => s.signIn);
  const setSession = useAuthStore((s) => s.setSession);

  return useCallback(
    (payload: AuthPayload) => {
      signIn({ token: payload.token, user: payload.user, role: payload.role });
      void registerDeviceSafe();
      // Hydrate company context (acting_company / company_role) so HR members
      // get company access immediately without waiting for a page reload.
      void authApi
        .me()
        .then((res) =>
          setSession({
            user: res.user,
            role: res.role,
            actingCompany: res.acting_company ?? null,
            companyRole: res.company_role ?? null,
          }),
        )
        .catch(() => {});
      const next = params.get("next");
      router.replace(next && next.startsWith("/") ? next : "/dashboard");
    },
    [router, params, signIn, setSession],
  );
}

export function useLogout() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  return useCallback(
    async (everywhere = false) => {
      try {
        const token = await getWebPushToken();
        if (token) await devicesApi.unregister({ token });
      } catch {
        /* ignore */
      }
      try {
        await (everywhere ? authApi.logoutAll() : authApi.logout());
      } catch {
        /* token may already be invalid */
      }
      signOut();
      router.replace("/login");
    },
    [router, signOut],
  );
}
