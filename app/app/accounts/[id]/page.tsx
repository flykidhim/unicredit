// app/app/accounts/[id]/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user!.email! },
  });

  if (!user) {
    notFound();
  }

  const accountId = Number(params.id);
  if (Number.isNaN(accountId)) {
    notFound();
  }

  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
      transactionsFrom: {
        include: {
          toAccount: {
            select: { id: true, name: true, iban: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      transactionsTo: {
        include: {
          fromAccount: {
            select: { id: true, name: true, iban: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  if (!account) {
    notFound();
  }

  const movements = [
    ...account.transactionsFrom.map((tx) => ({
      ...tx,
      direction: "OUT" as const,
    })),
    ...account.transactionsTo.map((tx) => ({
      ...tx,
      direction: "IN" as const,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const balanceNumber = Number(account.balance);

  return (
    <div className="mx-auto max-w-6xl py-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
            Conto #{account.id} · {account.type}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-[#262626]">
            {account.name}
          </h1>
          <p className="mt-1 text-[11px] text-neutral-600">
            IBAN: {maskIban(account.iban)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
            Saldo disponibile
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#007a91]">
            €{" "}
            {balanceNumber.toLocaleString("it-IT", {
              minimumFractionDigits: 2,
            })}
          </p>
          <div className="mt-2 inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-700">
            <span
              className={
                "mr-2 inline-block h-2 w-2 rounded-full " +
                (account.status === "ACTIVE"
                  ? "bg-emerald-500"
                  : account.status === "FROZEN"
                  ? "bg-amber-500"
                  : "bg-red-500")
              }
            />
            {account.status}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.1fr,1.7fr]">
        {/* LEFT – meta info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-800 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-[#262626]">
              Intestazione conto
            </h2>
            <p className="text-sm font-medium text-[#262626]">
              {account.user.fullName}
            </p>
            <p className="text-xs text-neutral-600">{account.user.email}</p>
            <p className="mt-3 text-xs text-neutral-500">
              Conto aperto il{" "}
              {account.createdAt.toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-700 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-[#262626]">
              Dettagli conto
            </h3>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Tipo</dt>
                <dd className="font-medium text-[#262626]">{account.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Valuta</dt>
                <dd className="font-medium text-[#262626]">
                  {account.currency}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Stato</dt>
                <dd className="font-medium text-[#262626]">{account.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Ultimo aggiornamento</dt>
                <dd className="font-medium text-[#262626]">
                  {account.updatedAt.toLocaleString("it-IT")}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* RIGHT – movements */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[#262626]">
            Ultimi movimenti
          </h2>

          {movements.length === 0 ? (
            <p className="text-xs text-neutral-600">
              Non sono presenti movimenti su questo conto.
            </p>
          ) : (
            <div className="max-h-[460px] overflow-y-auto text-xs">
              <table className="min-w-full border-collapse text-left">
                <thead className="sticky top-0 bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-2 py-2">Data</th>
                    <th className="px-2 py-2">Tipo</th>
                    <th className="px-2 py-2">Controparte</th>
                    <th className="px-2 py-2 text-right">Importo</th>
                    <th className="px-2 py-2 text-right">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((tx) => {
                    const isOut = tx.direction === "OUT";
                    const signedAmount = (isOut ? -1 : 1) * Number(tx.amount);
                    const counterparty =
                      isOut && tx.toAccount
                        ? `${tx.toAccount.name} (${maskIban(
                            tx.toAccount.iban
                          )})`
                        : !isOut && tx.fromAccount
                        ? `${tx.fromAccount.name} (${maskIban(
                            tx.fromAccount.iban
                          )})`
                        : "-";

                    return (
                      <tr
                        key={`${tx.id}-${tx.direction}`}
                        className="border-t border-neutral-200"
                      >
                        <td className="px-2 py-2 align-top">
                          {new Date(tx.createdAt).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-2 py-2 align-top">
                          <span
                            className={
                              "inline-flex rounded-full px-2 py-0.5 text-[10px] " +
                              (isOut
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-600")
                            }
                          >
                            {isOut ? "USCITA" : "ENTRATA"} · {tx.type}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="max-w-[220px] truncate text-neutral-800">
                            {counterparty}
                          </div>
                          {tx.description && (
                            <div className="mt-0.5 line-clamp-2 text-[10px] text-neutral-500">
                              {tx.description}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right align-top font-semibold">
                          <span
                            className={
                              signedAmount < 0
                                ? "text-red-600"
                                : "text-emerald-600"
                            }
                          >
                            {signedAmount < 0 ? "-" : "+"}
                            {Math.abs(signedAmount).toLocaleString("it-IT", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            {account.currency}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-right align-top">
                          <span className="text-[11px] text-neutral-500">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function maskIban(iban: string | null | undefined) {
  if (!iban) return "";
  const clean = iban.replace(/\s+/g, "");
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
}
