// app/app/transfer/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransferForm from "./TransferForm";

export const dynamic = "force-dynamic";

type AccountForTransfer = {
  id: number;
  userId: number;
  name: string;
  type: string;
  iban: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export default async function TransferPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    // you can redirect to /login here if you prefer
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return null;
  }

  const rawAccounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  // 🔥 Make accounts JSON-serializable (balance as number)
  const accounts: AccountForTransfer[] = rawAccounts.map((acc) => ({
    id: acc.id,
    userId: acc.userId,
    name: acc.name,
    type: acc.type,
    iban: acc.iban,
    balance: Number(acc.balance),
    currency: acc.currency,
    status: acc.status,
    createdAt: acc.createdAt,
    updatedAt: acc.updatedAt,
  }));

  if (!accounts.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-0">
        <h1 className="text-xl font-semibold text-[#262626]">
          Bonifici e trasferimenti
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Per effettuare un bonifico è necessario avere almeno un conto corrente
          attivo. Contatta la banca o l&apos;amministratore per aprire un conto.
        </p>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
      {/* HEADER / SUMMARY */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
            Operazioni
          </p>
          <h1 className="mt-1 text-xl font-semibold text-[#262626]">
            Bonifici e trasferimenti
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-600">
            Effettua trasferimenti tra i tuoi conti o verso IBAN esterni in
            pochi passaggi. Controlla sempre con attenzione i dati inseriti
            prima di confermare.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-700 shadow-sm sm:grid-cols-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              Conti attivi
            </p>
            <p className="mt-1 text-lg font-semibold text-[#262626]">
              {accounts.length}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              Saldo complessivo
            </p>
            <p className="mt-1 text-lg font-semibold text-[#007a91]">
              €{" "}
              {totalBalance.toLocaleString("it-IT", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="col-span-2 hidden sm:block">
            <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              Suggerimento
            </p>
            <p className="mt-1 text-[11px] text-neutral-600">
              Per importi elevati valuta di impostare un avviso SMS o e-mail
              dalle impostazioni di sicurezza.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
        {/* LEFT – FORM CARD */}
        <div className="w-full max-w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <TransferForm accounts={accounts} />
        </div>

        {/* RIGHT – SIDEBAR SUMMARY */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#262626]">
              I tuoi conti
            </h2>
            <div className="mt-3 space-y-3 text-xs text-neutral-700">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-start justify-between rounded-xl bg-neutral-50 px-3 py-2"
                >
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-800">
                      {acc.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-neutral-500">
                      {maskIban(acc.iban)}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-600">
                      Stato:{" "}
                      <span className="font-medium">
                        {acc.status.toLowerCase()}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                      Saldo
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#007a91]">
                      €{" "}
                      {acc.balance.toLocaleString("it-IT", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-[11px] text-neutral-600 shadow-sm">
            <p className="font-semibold text-neutral-800">
              Suggerimenti di sicurezza
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                Non condividere mai le tue credenziali di accesso o codici OTP
                con nessuno.
              </li>
              <li>
                Verifica sempre l&apos;IBAN del beneficiario prima di confermare
                un bonifico esterno.
              </li>
              <li>
                Controlla regolarmente i movimenti per individuare eventuali
                operazioni sospette.
              </li>
            </ul>
          </div>
        </div>
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
