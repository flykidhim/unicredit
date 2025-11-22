// app/admin/transactions/page.tsx
import { prisma } from "@/lib/prisma";

export default async function AdminTransactionsPage() {
  const [transactions, accounts] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        fromAccount: { include: { user: true } },
        toAccount: { include: { user: true } },
      },
      take: 300,
    }),
    prisma.account.findMany({
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const safeTransactions = transactions.map((tx) => ({
    id: tx.id,
    fromAccountId: tx.fromAccountId,
    toAccountId: tx.toAccountId,
    amount: Number(tx.amount),
    type: tx.type,
    status: tx.status,
    description: tx.description,
    createdAt: tx.createdAt.toISOString(),
    fromAccount: tx.fromAccount
      ? {
          id: tx.fromAccount.id,
          name: tx.fromAccount.name,
          iban: tx.fromAccount.iban,
          userName: tx.fromAccount.user.fullName,
        }
      : null,
    toAccount: tx.toAccount
      ? {
          id: tx.toAccount.id,
          name: tx.toAccount.name,
          iban: tx.toAccount.iban,
          userName: tx.toAccount.user.fullName,
        }
      : null,
  }));

  const safeAccounts = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    iban: a.iban,
    balance: Number(a.balance),
    status: a.status,
    userName: a.user.fullName,
  }));

  // Use a client component for all the heavy interactivity
  const AdminTransactionsTable = (await import("./AdminTransactionsTable"))
    .default;

  return (
    <>
      <section className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 shadow">
        <h1 className="text-lg font-semibold text-slate-50">
          Movimenti (super amministratore)
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Modifica, elimina, accredita/addebita fondi e sposta denaro tra i
          conti. Usa queste funzioni con attenzione: ogni azione impatta i saldi
          reali.
        </p>
      </section>

      <AdminTransactionsTable
        transactions={safeTransactions}
        accounts={safeAccounts}
      />
    </>
  );
}
