// app/admin/accounts/AccountsTable.tsx
"use client";

import { useState } from "react";

type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";
type AccountType = "CURRENT" | "SAVINGS" | "VAULT";

interface SafeAccount {
  id: number;
  name: string;
  type: AccountType;
  status: AccountStatus;
  balance: number;
  currency: string;
  iban: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export default function AccountsTable({
  accounts,
}: {
  accounts: SafeAccount[];
}) {
  const [rows, setRows] = useState<SafeAccount[]>(accounts);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateAccount = async (accountId: number, newStatus: AccountStatus) => {
    setLoadingId(accountId);
    setError(null);
    try {
      const res = await fetch("/api/admin/accounts/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante l'aggiornamento conto");
        return;
      }
      setRows((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, ...data } : a))
      );
    } catch (e) {
      console.error(e);
      setError("Errore di rete");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40 shadow">
      {error && (
        <div className="border-b border-red-500/40 bg-red-950/60 px-4 py-2 text-xs text-red-200">
          {error}
        </div>
      )}
      <div className="max-h-[60vh] overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-slate-900 text-[11px] uppercase tracking-[0.16em] text-slate-400">
              <th className="border-b border-slate-800 px-4 py-2 text-left">
                Conto
              </th>
              <th className="border-b border-slate-800 px-4 py-2 text-left">
                Intestatario
              </th>
              <th className="border-b border-slate-800 px-4 py-2 text-left">
                IBAN
              </th>
              <th className="border-b border-slate-800 px-4 py-2 text-right">
                Saldo
              </th>
              <th className="border-b border-slate-800 px-4 py-2 text-left">
                Stato
              </th>
              <th className="border-b border-slate-800 px-4 py-2 text-right">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a, idx) => (
              <tr
                key={a.id}
                className={
                  idx % 2 === 0 ? "bg-slate-950/60" : "bg-slate-900/60"
                }
              >
                <td className="border-b border-slate-800 px-4 py-2 text-xs text-slate-100">
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {a.type} ·{" "}
                    {new Date(a.createdAt).toLocaleDateString("it-IT")}
                  </div>
                </td>
                <td className="border-b border-slate-800 px-4 py-2 text-xs text-slate-300">
                  <div>{a.user.fullName}</div>
                  <div className="text-[11px] text-slate-500">
                    {a.user.email}
                  </div>
                </td>
                <td className="border-b border-slate-800 px-4 py-2 text-xs text-slate-300 font-mono">
                  {maskIban(a.iban)}
                </td>
                <td className="border-b border-slate-800 px-4 py-2 text-right text-xs text-cyan-300">
                  €{" "}
                  {a.balance.toLocaleString("it-IT", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="border-b border-slate-800 px-4 py-2 text-xs">
                  <select
                    className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-100 border border-slate-700"
                    disabled={loadingId === a.id}
                    value={a.status}
                    onChange={(e) =>
                      updateAccount(a.id, e.target.value as AccountStatus)
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="FROZEN">FROZEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
                <td className="border-b border-slate-800 px-4 py-2 text-right text-[11px] text-slate-300">
                  {loadingId === a.id ? "Aggiornamento..." : "Pronto"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function maskIban(iban: string) {
  if (!iban) return "";
  const clean = iban.replace(/\s+/g, "");
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
}
