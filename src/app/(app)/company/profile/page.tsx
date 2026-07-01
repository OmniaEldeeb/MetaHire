"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useCompanyAccess } from "@/lib/hooks/use-company-access";
import { CompanyProfile } from "@/components/profile/company-profile";

/**
 * Company profile reachable by any company member (incl. HR/viewer, whose user
 * role is "candidate"). Members get a read-only view; only the owner account can
 * edit (enforced inside CompanyInfoForm / CompanyTeam via useCompanyAccess).
 */
export default function CompanyProfileRoute() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const { isCompanyUser } = useCompanyAccess();

  useEffect(() => {
    if (status === "authenticated" && !isCompanyUser) router.replace("/profile");
  }, [status, isCompanyUser, router]);

  if (!isCompanyUser) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return <CompanyProfile />;
}
