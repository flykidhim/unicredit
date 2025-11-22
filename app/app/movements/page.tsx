// app/app/movements/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MovementsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { fromAccount: { userId: user.id } },
        { toAccount: { userId: user.id } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      fromAccount: true,
      toAccount: true,
    },
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-[#262626]">
          Tutti i movimenti
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Elenco completo dei movimenti registrati sui tuoi conti.
        </p>
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
                  Conto e direzione
                </th>
                <th className="border-b border-neutral-200 px-4 py-2 text-right">
                  Importo
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => {
                const isOutgoing = tx.fromAccount?.userId === user.id;
                const from = tx.fromAccount;
                const to = tx.toAccount;
                const mainAccount = isOutgoing ? from : to;

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
                      {mainAccount ? (
                        <>
                          <span className="block text-[11px] font-medium text-neutral-800">
                            {mainAccount.name}
                          </span>
                          <span className="block font-mono text-[10px] text-neutral-500">
                            {maskIban(mainAccount.iban)}
                          </span>
                          {from && to && (
                            <span className="mt-1 block text-[10px] text-neutral-500">
                              {isOutgoing
                                ? `Da ${from.name} a ${to.name}`
                                : `Da ${from.name} a ${to.name}`}
                            </span>
                          )}
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
    </div>
  );
}

function maskIban(iban: string) {
  if (!iban) return "";
  const clean = iban.replace(/\s+/g, "");
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
}
