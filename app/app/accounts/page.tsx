// app/app/accounts/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, fullName: true },
  });

  if (!user) return null;

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header row */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-xl font-semibold text-[#262626]">I tuoi conti</h1>
          <p className="mt-1 text-xs text-neutral-600">
            Gestisci conti correnti, risparmi e depositi da un’unica
            interfaccia.
          </p>
        </div>

        {accounts.length > 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              Saldo complessivo
            </p>
            <p className="mt-1 text-xl font-semibold text-[#007a91]">
              €{" "}
              {totalBalance.toLocaleString("it-IT", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      {accounts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-6 text-center text-sm text-neutral-600">
          Non risultano conti associati al tuo profilo.
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {accounts.map((account) => {
            const balanceNumber = Number(account.balance);

            const typeLabel =
              account.type === "CURRENT"
                ? "Conto corrente"
                : account.type === "SAVINGS"
                ? "Conto risparmio"
                : "Conto deposito";

            const statusLabel =
              account.status === "ACTIVE"
                ? "Attivo"
                : account.status === "FROZEN"
                ? "Bloccato"
                : "Chiuso";

            return (
              <Link
                key={account.id}
                href={`/app/accounts/${account.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-[1px] hover:border-[#007a91] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                      {typeLabel} · #{account.id}
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-[#262626]">
                      {account.name}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      IBAN {maskIban(account.iban)}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Stato:{" "}
                      <span className="font-medium text-[#262626]">
                        {statusLabel}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                      Saldo
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#007a91]">
                      €{" "}
                      {balanceNumber.toLocaleString("it-IT", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {account.currency}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>
                    Creato il{" "}
                    {account.createdAt.toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#007a91]">
                    Dettagli conto
                    <span aria-hidden="true">›</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function maskIban(iban: string) {
  if (!iban) return "";
  const clean = iban.replace(/\s+/g, "");
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
}
