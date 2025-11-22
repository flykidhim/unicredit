// app/app/transfer/TransferForm.tsx
"use client";

import { useState } from "react";

type Mode = "internal" | "external";

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

interface TransferFormProps {
  accounts: AccountForTransfer[];
}

export default function TransferForm({ accounts }: TransferFormProps) {
  const [mode, setMode] = useState<Mode>("internal");
  const [fromAccountId, setFromAccountId] = useState<number | "">("");
  const [toAccountId, setToAccountId] = useState<number | "">("");
  const [externalName, setExternalName] = useState("");
  const [externalIban, setExternalIban] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fromAccount =
    typeof fromAccountId === "number"
      ? accounts.find((a) => a.id === fromAccountId)
      : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!fromAccountId || !amount) {
      setError("Seleziona il conto di origine e l'importo.");
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Inserisci un importo valido.");
      return;
    }

    const payload: any = {
      mode,
      fromAccountId: Number(fromAccountId),
      amount: numericAmount,
      description: description || undefined,
    };

    if (mode === "internal") {
      if (!toAccountId) {
        setError("Seleziona il conto di destinazione.");
        return;
      }
      payload.toAccountId = Number(toAccountId);
    } else {
      if (!externalName || !externalIban) {
        setError("Nome beneficiario e IBAN sono obbligatori.");
        return;
      }
      payload.externalName = externalName;
      payload.externalIban = externalIban;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante il trasferimento.");
        return;
      }

      setFeedback("Operazione completata con successo.");
      setAmount("");
      setDescription("");
      if (mode === "internal") {
        setToAccountId("");
      } else {
        setExternalName("");
        setExternalIban("");
      }
    } catch (err) {
      console.error(err);
      setError("Errore imprevisto. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-full space-y-6 text-sm"
    >
      {/* Mode toggle */}
      <div className="inline-flex max-w-full rounded-full bg-neutral-100 p-1 text-[11px]">
        <button
          type="button"
          onClick={() => setMode("internal")}
          className={
            "whitespace-nowrap rounded-full px-3 py-1 " +
            (mode === "internal"
              ? "bg-[#007a91] text-white"
              : "text-neutral-700")
          }
        >
          Bonifico interno
        </button>
        <button
          type="button"
          onClick={() => setMode("external")}
          className={
            "whitespace-nowrap rounded-full px-3 py-1 " +
            (mode === "external"
              ? "bg-[#007a91] text-white"
              : "text-neutral-700")
          }
        >
          Verso IBAN esterno
        </button>
      </div>

      {/* From account */}
      <div className="w-full max-w-full space-y-1">
        <label className="block text-[11px] font-semibold text-neutral-700">
          Conto di origine *
        </label>
        <select
          value={fromAccountId}
          onChange={(e) =>
            setFromAccountId(
              e.target.value ? Number(e.target.value) : ("" as any)
            )
          }
          className="block w-full max-w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#007a91]"
        >
          <option value="">Seleziona un conto…</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} · {maskIban(acc.iban)}
            </option>
          ))}
        </select>
      </div>

      {/* To account / external beneficiary */}
      {mode === "internal" ? (
        <div className="w-full max-w-full space-y-1">
          <label className="block text-[11px] font-semibold text-neutral-700">
            Conto di destinazione *
          </label>
          <select
            value={toAccountId}
            onChange={(e) =>
              setToAccountId(
                e.target.value ? Number(e.target.value) : ("" as any)
              )
            }
            className="block w-full max-w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#007a91]"
          >
            <option value="">Seleziona un conto…</option>
            {accounts
              .filter((acc) => acc.id !== Number(fromAccountId))
              .map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} · {maskIban(acc.iban)}
                </option>
              ))}
          </select>
        </div>
      ) : (
        <div className="grid w-full max-w-full gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-neutral-700">
              Beneficiario *
            </label>
            <input
              type="text"
              value={externalName}
              onChange={(e) => setExternalName(e.target.value)}
              className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#007a91]"
              placeholder="Nome e cognome / ragione sociale"
            />
          </div>
          <div className="space-y-1 sm:col-span-1">
            <label className="block text-[11px] font-semibold text-neutral-700">
              IBAN esterno *
            </label>
            <input
              type="text"
              value={externalIban}
              onChange={(e) => setExternalIban(e.target.value)}
              className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#007a91]"
              placeholder="IT00 A 0000 0000 0000 0000 0000 000"
            />
          </div>
        </div>
      )}

      {/* Amount */}
      <div className="w-full max-w-full space-y-1">
        <label className="block text-[11px] font-semibold text-neutral-700">
          Importo *
        </label>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-700">
            EUR
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full max-w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#007a91]"
            placeholder="0,00"
          />
        </div>
      </div>

      {/* Description */}
      <div className="w-full max-w-full space-y-1">
        <label className="block text-[11px] font-semibold text-neutral-700">
          Causale
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full max-w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#007a91]"
          placeholder={
            mode === "internal"
              ? "Trasferimento tra i tuoi conti"
              : "Ad es. Affitto, fattura n. 123"
          }
        />
      </div>

      {/* Summary */}
      {fromAccount && (
        <div className="rounded-xl bg-neutral-50 px-3 py-3 text-[11px] text-neutral-700">
          <div className="flex justify-between gap-4">
            <span>Saldo attuale:</span>
            <span className="font-semibold text-[#007a91]">
              €{" "}
              {fromAccount.balance.toLocaleString("it-IT", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          {amount && Number(amount) > 0 && (
            <div className="mt-1 flex justify-between gap-4 text-[11px] text-neutral-600">
              <span>Saldo dopo operazione:</span>
              <span>
                €{" "}
                {(fromAccount.balance - Number(amount || 0)).toLocaleString(
                  "it-IT",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
      {feedback && <p className="text-[11px] text-emerald-600">{feedback}</p>}

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-[#007a91] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-800 disabled:opacity-60"
        >
          {loading ? "Invio in corso..." : "Conferma operazione"}
        </button>
      </div>
    </form>
  );
}

function maskIban(iban: string) {
  if (!iban) return "";
  const clean = iban.replace(/\s+/g, "");
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
}
