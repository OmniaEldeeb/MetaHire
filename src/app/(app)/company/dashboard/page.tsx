"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useCompanyAccess } from "@/lib/hooks/use-company-access";
import { CompanyDashboard } from "@/components/company/company-dashboard";

/**
 * Dedicated company dashboard route. Unlike /dashboard (which renders the
 * candidate dashboard for candidate-role users), this is reachable by ANY
 * company member — including HR/viewer members whose user role is "candidate".
 */
export default function CompanyDashboardPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const { isCompanyUser } = useCompanyAccess();

  useEffect(() => {
    if (status === "authenticated" && !isCompanyUser) router.replace("/dashboard");
  }, [status, isCompanyUser, router]);

  if (!isCompanyUser) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return <CompanyDashboard />;
}
