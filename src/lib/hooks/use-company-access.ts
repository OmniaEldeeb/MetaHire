"use client";

/**
 * useCompanyAccess
 * ================
 * Single source of truth for "what can this user do in the company area".
 *
 * Key fact: HR/viewer members have user `role === "candidate"` — only the owner
 * account has `role === "company"`. So company access is determined by
 * `acting_company` (set whenever the user owns OR is an accepted member of a
 * company), and fine-grained permissions by `company_role` (owner|hr|viewer).
 *
 * Mirrors the backend gates (canManageCompany, companyOwnsApplication,
 * owner-only actions, company-owner-account-only profile edits).
 */

import { useAuthStore } from "@/stores/auth.store";

export interface CompanyAccess {
  isCompanyUser: boolean;
  isOwner: boolean;
  companyRole: "owner" | "hr" | "viewer" | null;
  actingCompany: ReturnType<typeof useAuthStore.getState>["actingCompany"];

  // Jobs
  canViewJobs: boolean;
  canCreateJob: boolean;
  canUpdateJob: boolean;
  canDeleteJob: boolean;     // owner only
  canToggleJob: boolean;
  canViewDashboard: boolean;

  // Applications
  canViewApplications: boolean;
  canInviteInterview: boolean;
  canInviteFinal: boolean;
  canUpdateStatus: boolean;
  canViewAiReport: boolean;
  canAutoInvite: boolean;

  // Company management
  canInviteMembers: boolean;    // owner only
  canRemoveMembers: boolean;    // owner only
  canUpdateMemberRole: boolean; // owner only
  canCancelInvitation: boolean; // owner only
  canViewMembers: boolean;
  canLeaveCompany: boolean;     // hr / viewer (not owner)

  // Company profile
  canEditProfile: boolean;   // company owner ACCOUNT only (role === "company")
  canUploadLogo: boolean;    // company owner ACCOUNT only
}

export function useCompanyAccess(): CompanyAccess {
  const role = useAuthStore((s) => s.role);
  const actingCompany = useAuthStore((s) => s.actingCompany);
  const companyRole = useAuthStore((s) => s.companyRole);

  const isCompanyUser = role === "company" || actingCompany !== null;
  const isOwner = companyRole === "owner";
  const isOwnerAccount = role === "company"; // the dedicated company account

  return {
    isCompanyUser,
    isOwner,
    companyRole,
    actingCompany,

    canViewJobs: isCompanyUser,
    canCreateJob: isCompanyUser,
    canUpdateJob: isCompanyUser,
    canDeleteJob: isOwner,
    canToggleJob: isCompanyUser,
    canViewDashboard: isCompanyUser,

    canViewApplications: isCompanyUser,
    canInviteInterview: isCompanyUser,
    canInviteFinal: isCompanyUser,
    canUpdateStatus: isCompanyUser,
    canViewAiReport: isCompanyUser,
    canAutoInvite: isCompanyUser,

    canInviteMembers: isOwner,
    canRemoveMembers: isOwner,
    canUpdateMemberRole: isOwner,
    canCancelInvitation: isOwner,
    canViewMembers: isCompanyUser,
    canLeaveCompany: companyRole === "hr" || companyRole === "viewer",

    canEditProfile: isOwnerAccount,
    canUploadLogo: isOwnerAccount,
  };
}
