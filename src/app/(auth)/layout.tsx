import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Ambient brand glow — kept subtle, no interview illustration here. */}
      <div className="pointer-events-none absolute inset-0 grid-field" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px]"
        aria-hidden
      />

      {/* Top bar */}
      <div className="relative flex items-center justify-between p-5 sm:p-8">
        <Logo />
        <ThemeToggle />
      </div>

      {/* Centered form panel */}
      <main
        id="main-content"
        className="relative flex flex-1 items-center justify-center px-5 pb-16 sm:px-8"
      >
        <div className="w-full max-w-sm">
          <Suspense fallback={<div className="h-96" />}>{children}</Suspense>
        </div>
      </main>

      <p className="readout relative pb-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} MetaHire
      </p>
    </div>
  );
}
