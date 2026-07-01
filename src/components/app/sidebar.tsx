"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { useAuthStore } from "@/stores/auth.store";
import { useCompanyAccess } from "@/lib/hooks/use-company-access";
import { useMessagesStore } from "@/stores/messages.store";
import { CANDIDATE_NAV, COMPANY_NAV, type NavItem } from "@/lib/content/nav";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isActive(pathname, item.href);
  const msgUnread = useMessagesStore((s) => s.unreadCount);
  const badge = item.href === "/messages" && msgUnread > 0 ? msgUnread : 0;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-brand/10 text-brand"
          : "text-muted hover:bg-elevated hover:text-ink",
      )}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1">{item.label}</span>
      {badge ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[0.65rem] font-semibold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const access = useCompanyAccess();
  const inCompanyArea = pathname.startsWith("/company");
  // Owner accounts always use the company nav. Members (HR/viewer, whose user
  // role is "candidate") use it only while inside the company area, so their
  // personal candidate experience stays the default.
  const showCompanyNav = role === "company" || (access.isCompanyUser && inCompanyArea);
  const nav = showCompanyNav ? COMPANY_NAV : CANDIDATE_NAV;
  // Members who are not the owner account get a personal ↔ company switcher.
  const showSwitcher = access.isCompanyUser && role !== "company";

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="grid h-9 w-9 place-items-center rounded-lg text-faint hover:text-ink lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {showSwitcher && (
        <div className="mx-3 mb-1 rounded-xl border border-line bg-elevated p-2">
          <p className="mb-1.5 px-1 text-[0.62rem] font-semibold uppercase tracking-wide text-faint">
            Viewing as
          </p>
          <div className="grid grid-cols-2 gap-1">
            <Link
              href="/dashboard"
              onClick={onClose}
              className={cn(
                "rounded-lg px-2 py-1.5 text-center text-xs font-semibold transition-colors",
                !inCompanyArea ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink",
              )}
            >
              Personal
            </Link>
            <Link
              href="/company/dashboard"
              onClick={onClose}
              title={access.actingCompany?.name ?? "Company"}
              className={cn(
                "truncate rounded-lg px-2 py-1.5 text-center text-xs font-semibold transition-colors",
                inCompanyArea ? "bg-brand text-white" : "text-muted hover:text-ink",
              )}
            >
              {access.actingCompany?.name ?? "Company"}
            </Link>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onClose}
          />
        ))}
      </nav>

      <div className="border-t border-line px-3 py-4">
        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(pathname, "/settings")
              ? "bg-brand/10 text-brand"
              : "text-muted hover:bg-elevated hover:text-ink",
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-line bg-bg-2 lg:block">
        <div className="sticky top-0 h-dvh">{content}</div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-line bg-bg-2">
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}
