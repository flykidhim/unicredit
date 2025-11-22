// app/app/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userName =
    session.user?.name ||
    (session.user as any)?.fullName ||
    "Cliente UniCredit";
  const role = ((session.user as any)?.role || "USER") as "USER" | "ADMIN";

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f4f6]">
      {/* Sticky top header for user area */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          {/* Left: logo */}
          <div className="flex items-center gap-3">
            <Link href="/app" className="flex items-center gap-2">
              <Image
                src="/images/header/logo-unicredit-privati.png"
                alt="UniCredit"
                width={120}
                height={28}
                className="h-auto w-auto"
              />
            </Link>
          </div>

          {/* Center: main nav (desktop) */}
          <nav className="hidden items-center gap-4 text-[13px] font-medium text-neutral-600 md:flex">
            <NavTab href="/app" label="Panoramica" />
            <NavTab href="/app/accounts" label="Conti e carte" />
            <NavTab href="/app/transfer" label="Trasferimenti" />
            <NavTab href="/app/movements" label="Movimenti" />
            <NavTab href="/app/profile" label="Profilo" />
            {role === "ADMIN" && (
              <NavTab href="/admin" label="Admin Console" variant="accent" />
            )}
          </nav>

          {/* Right: user info + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end text-xs leading-tight text-neutral-700 sm:flex">
              <span className="font-semibold">{userName}</span>
              {/* Removed “Administrator · Internet Banking” tagline */}
            </div>

            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm hover:border-[#007a91] hover:bg-cyan-50 transition-colors"
              >
                Esci
              </button>
            </form>
          </div>
        </div>

        {/* Secondary nav row for mobile */}
        <div className="border-t border-neutral-200 bg-neutral-50 md:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-2 text-[12px]">
            <NavPillMobile href="/app" label="Panoramica" />
            <NavPillMobile href="/app/accounts" label="Conti" />
            <NavPillMobile href="/app/transfer" label="Trasferimenti" />
            <NavPillMobile href="/app/movements" label="Movimenti" />
            <NavPillMobile href="/app/profile" label="Profilo" />
            {role === "ADMIN" && (
              <NavPillMobile href="/admin" label="Admin" variant="accent" />
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 pb-8 pt-6 lg:px-6">
        {children}
      </main>

      {/* FOOTER – user area (no “demo” wording anymore) */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 text-[11px] text-neutral-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Internet Banking.</span>
          <span className="text-[11px] text-neutral-400">
            Area clienti personale.
          </span>
        </div>
      </footer>
    </div>
  );
}

function NavTab({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant?: "accent";
}) {
  const base =
    "whitespace-nowrap rounded-full px-3 py-1 bg-white text-neutral-700 border border-neutral-200 hover:border-[#007a91] hover:text-[#007a91] transition-colors";
  const accent =
    "whitespace-nowrap rounded-full px-3 py-1 bg-[#007a91] text-white border border-[#007a91] hover:bg-cyan-800 transition-colors";

  return (
    <Link href={href} className={variant === "accent" ? accent : base}>
      {label}
    </Link>
  );
}

function NavPillMobile({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant?: "accent";
}) {
  const base =
    "whitespace-nowrap rounded-full border border-neutral-300 bg-white px-3 py-1 text-neutral-700 text-[11px]";
  const accent =
    "whitespace-nowrap rounded-full border border-[#007a91] bg-[#007a91] px-3 py-1 text-white text-[11px]";

  return (
    <Link href={href} className={variant === "accent" ? accent : base}>
      {label}
    </Link>
  );
}
