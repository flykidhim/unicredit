// app/app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AppDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { fromAccount: { userId: user.id } },
        { toAccount: { userId: user.id } },
      ],
    },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      fromAccount: true,
      toAccount: true,
    },
  });

  const primaryAccount = accounts[0];
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );

  return (
    <div className="flex w-full flex-col gap-6">
      {/* TOP SUMMARY CARD */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Panoramica conti
            </p>
            <h1 className="mt-2 text-xl font-semibold text-[#262626]">
              Benvenuto, {user.fullName}
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Riepilogo rapido di saldi, conti e ultimi movimenti.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              Saldo complessivo
            </p>
            <p className="text-2xl font-semibold text-[#007a91]">
              €{" "}
              {totalBalance.toLocaleString("it-IT", {
                minimumFractionDigits: 2,
              })}
            </p>
            {primaryAccount && (
              <p className="text-[11px] text-neutral-500">
                Conto principale{" "}
                <span className="font-medium text-neutral-700">
                  {primaryAccount.name}
                </span>{" "}
                ·{" "}
                <span className="font-mono">
                  {maskIban(primaryAccount.iban)}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* MIDDLE GRID: ACCOUNTS + QUICK ACTIONS */}
      <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* Accounts list */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#262626]">
              I tuoi conti
            </h2>
            <Link
              href="/app/accounts"
              className="text-xs font-medium text-[#007a91] hover:underline"
            >
              Vai ai dettagli →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {accounts.length === 0 && (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
                Nessun conto ancora associato. Contatta la banca per aprire un
                conto.
              </div>
            )}

            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-800">
                    {account.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-500">
                    {maskIban(account.iban)}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Tipo:{" "}
                    <span className="font-medium">
                      {account.type.toLowerCase()}
                    </span>{" "}
                    · Stato:{" "}
                    <span className="font-medium">
                      {account.status.toLowerCase()}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                    Saldo
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#007a91]">
                    €{" "}
                    {Number(account.balance).toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions + CTA */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#262626]">
              Operazioni veloci
            </h2>
            <p className="mt-1 text-xs text-neutral-600">
              Accedi rapidamente alle funzioni più utilizzate.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <Link
                href="/app/transfer"
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 hover:border-[#007a91] hover:bg-cyan-50"
              >
                <span>Effettua un bonifico</span>
                <span className="text-xs text-neutral-500">→</span>
              </Link>
              <Link
                href="/app/movements"
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 hover:border-[#007a91] hover:bg-cyan-50"
              >
                <span>Vedi tutti i movimenti</span>
                <span className="text-xs text-neutral-500">→</span>
              </Link>
              <Link
                href="/app/accounts"
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 hover:border-[#007a91] hover:bg-cyan-50"
              >
                <span>Conti e carte</span>
                <span className="text-xs text-neutral-500">→</span>
              </Link>
              <Link
                href="/app/profile"
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 hover:border-[#007a91] hover:bg-cyan-50"
              >
                <span>Impostazioni profilo</span>
                <span className="text-xs text-neutral-500">→</span>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-xs text-neutral-600 shadow-sm">
            <p className="font-semibold text-neutral-800">
              Suggerimenti di sicurezza
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                Non condividere mai le credenziali o i codici di sicurezza con
                nessuno.
              </li>
              <li>
                Verifica sempre l&apos;IBAN del beneficiario prima di un
                bonifico esterno.
              </li>
              <li>
                Controlla periodicamente i movimenti per individuare operazioni
                sospette.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* LATEST MOVEMENTS – redesigned card */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#262626]">
            Ultimi movimenti
          </h2>
          <Link
            href="/app/movements"
            className="text-xs font-medium text-[#007a91] hover:underline"
          >
            Vedi tutti →
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {transactions.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">
              Non ci sono movimenti registrati.
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-neutral-50 text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                  <th className="border-b border-neutral-200 px-4 py-2 text-left">
                    Data
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-2 text-left">
                    Descrizione
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-2 text-left">
                    Conto
                  </th>
                  <th className="border-b border-neutral-200 px-4 py-2 text-right">
                    Importo
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => {
                  const isOutgoing = tx.fromAccount?.userId === user.id;
                  const accountRef = isOutgoing ? tx.fromAccount : tx.toAccount;

                  return (
                    <tr
                      key={tx.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                    >
                      <td className="border-b border-neutral-100 px-4 py-2 text-xs text-neutral-600">
                        {tx.createdAt.toLocaleDateString("it-IT")}
                      </td>
                      <td className="border-b border-neutral-100 px-4 py-2 text-xs text-neutral-700">
                        {tx.description}
                      </td>
                      <td className="border-b border-neutral-100 px-4 py-2 text-xs text-neutral-600">
                        {accountRef ? (
                          <>
                            <span className="block text-[11px] font-medium text-neutral-800">
                              {accountRef.name}
                            </span>
                            <span className="block font-mono text-[10px] text-neutral-500">
                              {maskIban(accountRef.iban)}
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="border-b border-neutral-100 px-4 py-2 text-right text-xs">
                        <span
                          className={
                            "font-semibold " +
                            (isOutgoing ? "text-red-600" : "text-emerald-600")
                          }
                        >
                          {isOutgoing ? "-" : "+"}€
                          {Number(tx.amount).toLocaleString("it-IT", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function maskIban(iban: string) {
  if (!iban) return "";
  const clean = iban.replace(/\s+/g, "");
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
}
