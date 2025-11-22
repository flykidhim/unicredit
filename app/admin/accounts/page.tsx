// app/admin/accounts/page.tsx
import { prisma } from "@/lib/prisma";
import AccountsTable from "./AccountsTable";

export default async function AdminAccountsPage() {
  const accounts = await prisma.account.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const safeAccounts = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    status: a.status,
    balance: Number(a.balance),
    currency: a.currency,
    iban: a.iban,
    user: {
      id: a.user.id,
      fullName: a.user.fullName,
      email: a.user.email,
    },
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <>
      <section className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 shadow">
        <h1 className="text-lg font-semibold text-slate-50">Gestione conti</h1>
        <p className="mt-1 text-sm text-slate-400">
          Visualizza i conti associati agli utenti e aggiorna il loro stato
          (attivo / congelato / chiuso).
        </p>
      </section>

      <AccountsTable accounts={safeAccounts} />
    </>
  );
}
