// app/admin/page.tsx
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [usersCount, accounts, transactionsCount, totalBalanceDecimal] =
    await Promise.all([
      prisma.user.count(),
      prisma.account.findMany(),
      prisma.transaction.count(),
      prisma.account.aggregate({
        _sum: { balance: true },
      }),
    ]);

  const totalBalance = Number(totalBalanceDecimal._sum.balance ?? 0);

  return (
    <>
      <section className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 shadow-lg shadow-cyan-500/10">
        <h1 className="text-lg font-semibold text-slate-50">
          Panoramica amministratore
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Sintesi dello stato della piattaforma di internet banking.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Utenti registrati" value={usersCount.toString()} />
        <StatCard label="Conti totali" value={accounts.length.toString()} />
        <StatCard
          label="Saldi complessivi"
          value={
            "€ " +
            totalBalance.toLocaleString("it-IT", {
              minimumFractionDigits: 2,
            })
          }
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
        <p>
          Da questo pannello potrai gestire lo stato degli utenti, attivare o
          congelare conti, monitorare i movimenti e, in futuro, configurare
          contenuti e messaggi promozionali.
        </p>
      </section>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950/80 to-slate-900/60 p-4 shadow-lg shadow-cyan-500/5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-cyan-300">{value}</p>
    </div>
  );
}
