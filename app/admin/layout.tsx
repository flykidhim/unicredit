// app/admin/layout.tsx
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 flex-col border-r border-slate-800 bg-[#020617] px-4 pt-5 md:flex">
        <div className="mb-6">
          <h1 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            UniCredit
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-50">
            Admin Console
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-sm">
          <AdminNavLink href="/admin" label="Dashboard" />
          <AdminNavLink href="/admin/users" label="Utenti" />
          <AdminNavLink href="/admin/accounts" label="Conti" />
          <AdminNavLink href="/admin/transactions" label="Movimenti" />
        </nav>

        <div className="mb-4 mt-auto text-[11px] text-slate-500">
          Accesso come admin. Usa con attenzione.
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="border-b border-slate-800 bg-[#020617]/95 px-4 py-3">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Pannello di controllo
              </span>
              <span className="text-sm font-semibold text-slate-50">
                Amministrazione UniCredit
              </span>
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200 hover:border-cyan-400 hover:bg-slate-800"
              >
                Esci
              </button>
            </form>
          </div>

          {/* Mobile nav */}
          <nav className="mt-3 flex items-center gap-2 overflow-x-auto text-xs md:hidden">
            <AdminPill href="/admin" label="Dashboard" />
            <AdminPill href="/admin/users" label="Utenti" />
            <AdminPill href="/admin/accounts" label="Conti" />
            <AdminPill href="/admin/transactions" label="Movimenti" />
          </nav>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-6 pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-cyan-300"
    >
      {label}
    </Link>
  );
}

function AdminPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-200 hover:border-cyan-400 hover:bg-slate-800"
    >
      {label}
    </Link>
  );
}
