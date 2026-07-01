import { create } from "zustand";
import type { AuthUser, ActingCompany, CompanyRole } from "@/lib/api/types";
import { clearToken, setToken } from "@/lib/api/session";
import type { UserRole } from "@/lib/constants/enums";

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  /** Company the user is acting for (owner account OR accepted member). */
  actingCompany: ActingCompany | null;
  /** The user's role inside that company: owner | hr | viewer | null. */
  companyRole: CompanyRole;
  status: "idle" | "loading" | "authenticated" | "guest";
  signIn: (payload: { token: string; user: AuthUser; role: UserRole }) => void;
  setUser: (user: AuthUser, role: UserRole) => void;
  /** Hydrate the full session (called after /auth/me resolves). */
  setSession: (s: {
    user: AuthUser;
    role: UserRole;
    actingCompany: ActingCompany | null;
    companyRole: CompanyRole;
  }) => void;
  signOut: () => void;
  setStatus: (status: AuthState["status"]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  actingCompany: null,
  companyRole: null,
  status: "idle",
  signIn: ({ token, user, role }) => {
    setToken(token);
    set({ user, role, status: "authenticated" });
  },
  setUser: (user, role) => set({ user, role, status: "authenticated" }),
  setSession: ({ user, role, actingCompany, companyRole }) =>
    set({ user, role, actingCompany, companyRole, status: "authenticated" }),
  signOut: () => {
    clearToken();
    set({ user: null, role: null, actingCompany: null, companyRole: null, status: "guest" });
  },
  setStatus: (status) => set({ status }),
}));
