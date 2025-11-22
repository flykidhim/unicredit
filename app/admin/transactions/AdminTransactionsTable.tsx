"use client";

import { useState } from "react";

type TransactionStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";
type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER_OUT"
  | "TRANSFER_IN"
  | "TRANSFER_INTERNAL"
  | "PAYMENT_EXTERNAL"
  | "CARD_PAYMENT"
  | "FEE";

interface SafeAccount {
  id: number;
  name: string;
  type: string;
  iban: string;
  balance: number;
  status: string;
  userName: string;
}

interface SafeTransaction {
  id: number;
  fromAccountId: number | null;
  toAccountId: number | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  fromAccount: {
    id: number;
    name: string;
    iban: string;
    userName: string;
  } | null;
  toAccount: {
    id: number;
    name: string;
    iban: string;
    userName: string;
  } | null;
}

interface Props {
  transactions: SafeTransaction[];
  accounts: SafeAccount[];
}

export default function AdminTransactionsTable({
  transactions,
  accounts,
}: Props) {
  const [rows, setRows] = useState<SafeTransaction[]>(transactions);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Quick tools state (credit/debit)
  const [adjustAccountId, setAdjustAccountId] = useState<number | "">("");
  const [adjustDirection, setAdjustDirection] = useState<"CREDIT" | "DEBIT">(
    "CREDIT"
  );
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [adjustDescription, setAdjustDescription] = useState<string>("");

  // Quick admin transfer state
  const [adminFromId, setAdminFromId] = useState<number | "">("");
  const [adminToId, setAdminToId] = useState<number | "">("");
  const [adminAmount, setAdminAmount] = useState<string>("");
  const [adminDescription, setAdminDescription] = useState<string>("");

  // Edit modal state
  const [editing, setEditing] = useState<SafeTransaction | null>(null);
  const [editData, setEditData] = useState<{
    fromAccountId: number | null;
    toAccountId: number | null;
    amount: string;
    type: TransactionType;
    status: TransactionStatus;
    description: string;
    createdAt: string;
  } | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = (tx: SafeTransaction) => {
    setEditing(tx);
    setEditData({
      fromAccountId: tx.fromAccountId,
      toAccountId: tx.toAccountId,
      amount: tx.amount.toString().replace(".", ","),
      type: tx.type,
      status: tx.status,
      description: tx.description,
      createdAt: tx.createdAt.slice(0, 16), // yyyy-MM-ddTHH:mm
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditData(null);
    setEditSaving(false);
  };

  const handleEditChange = (
    field: keyof NonNullable<typeof editData>,
    value: any
  ) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  // ---- API helpers ----

  const callJson = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Errore di rete");
    }
    return data;
  };

  // Edit & rebalance
  const handleSaveEdit = async () => {
    if (!editing || !editData) return;

    const parsedAmount = parseFloat(
      editData.amount.replace(".", "").replace(",", ".")
    );
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setGlobalError("Importo non valido nella modifica.");
      return;
    }

    setEditSaving(true);
    setGlobalError(null);
    try {
      const updated = await callJson("/api/admin/transactions/update", {
        id: editing.id,
        fromAccountId: editData.fromAccountId,
        toAccountId: editData.toAccountId,
        amount: parsedAmount,
        type: editData.type,
        status: editData.status,
        description: editData.description,
        createdAt: editData.createdAt,
      });

      setRows((prev) =>
        prev.map((tx) =>
          tx.id === editing.id ? mapUpdatedTx(tx, updated) : tx
        )
      );
      closeEdit();
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message || "Errore durante la modifica.");
      setEditSaving(false);
    }
  };

  const mapUpdatedTx = (tx: SafeTransaction, updated: any): SafeTransaction => {
    return {
      ...tx,
      fromAccountId: updated.fromAccountId ?? null,
      toAccountId: updated.toAccountId ?? null,
      amount: Number(updated.amount),
      type: updated.type,
      status: updated.status,
      description: updated.description,
      createdAt: updated.createdAt,
    };
  };

  // Delete & rebalance
  const handleDelete = async (tx: SafeTransaction) => {
    if (
      !window.confirm(
        `Eliminare definitivamente la transazione #${tx.id}? I saldi verranno ricalcolati.`
      )
    ) {
      return;
    }
    setLoadingId(tx.id);
    setGlobalError(null);
    try {
      await callJson("/api/admin/transactions/delete", { id: tx.id });
      setRows((prev) => prev.filter((t) => t.id !== tx.id));
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message || "Errore durante l'eliminazione.");
    } finally {
      setLoadingId(null);
    }
  };

  // Credit/debit
  const handleAdjust = async () => {
    if (!adjustAccountId) {
      setGlobalError("Seleziona un conto per la rettifica.");
      return;
    }
    const parsedAmount = parseFloat(
      adjustAmount.replace(".", "").replace(",", ".")
    );
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setGlobalError("Importo non valido per la rettifica.");
      return;
    }

    setGlobalError(null);
    try {
      const result = await callJson("/api/admin/transactions/adjust", {
        accountId: adjustAccountId,
        amount: parsedAmount,
        direction: adjustDirection,
        description: adjustDescription || undefined,
      });

      // Append new transaction to table (on top)
      setRows((prev) => [
        {
          id: result.transaction.id,
          fromAccountId: result.transaction.fromAccountId,
          toAccountId: result.transaction.toAccountId,
          amount: Number(result.transaction.amount),
          type: result.transaction.type,
          status: result.transaction.status,
          description: result.transaction.description,
          createdAt: result.transaction.createdAt,
          fromAccount: null,
          toAccount: null,
        },
        ...prev,
      ]);

      setAdjustAmount("");
      setAdjustDescription("");
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message || "Errore durante la rettifica.");
    }
  };

  // Admin transfer
  const handleAdminTransfer = async () => {
    if (!adminFromId || !adminToId) {
      setGlobalError("Seleziona conti di origine e destinazione.");
      return;
    }
    if (adminFromId === adminToId) {
      setGlobalError("Origine e destinazione devono essere diversi.");
      return;
    }
    const parsedAmount = parseFloat(
      adminAmount.replace(".", "").replace(",", ".")
    );
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setGlobalError("Importo non valido per il trasferimento admin.");
      return;
    }

    setGlobalError(null);
    try {
      const result = await callJson("/api/admin/transactions/admin-transfer", {
        fromAccountId: adminFromId,
        toAccountId: adminToId,
        amount: parsedAmount,
        description: adminDescription || undefined,
      });

      setRows((prev) => [
        {
          id: result.transaction.id,
          fromAccountId: result.transaction.fromAccountId,
          toAccountId: result.transaction.toAccountId,
          amount: Number(result.transaction.amount),
          type: result.transaction.type,
          status: result.transaction.status,
          description: result.transaction.description,
          createdAt: result.transaction.createdAt,
          fromAccount: null,
          toAccount: null,
        },
        ...prev,
      ]);

      setAdminAmount("");
      setAdminDescription("");
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message || "Errore durante il trasferimento admin.");
    }
  };

  return (
    <>
      {/* Quick tools row */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Credit/debit */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Rettifica saldo conto (admin)
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Aggiungi o rimuovi fondi da un conto creando una movimentazione di
            rettifica.
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <select
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={adjustAccountId}
              onChange={(e) =>
                setAdjustAccountId(
                  e.target.value ? Number(e.target.value) : ("" as "")
                )
              }
            >
              <option value="">Seleziona conto</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {maskIban(a.iban)} · {a.userName}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <select
                className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                value={adjustDirection}
                onChange={(e) =>
                  setAdjustDirection(e.target.value as "CREDIT" | "DEBIT")
                }
              >
                <option value="CREDIT">+ Accredita</option>
                <option value="DEBIT">- Addebita</option>
              </select>

              <input
                type="text"
                placeholder="Importo"
                className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>

            <input
              type="text"
              placeholder="Causale (es. rettifica saldi)"
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={adjustDescription}
              onChange={(e) => setAdjustDescription(e.target.value)}
            />

            <button
              type="button"
              onClick={handleAdjust}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-cyan-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Applica rettifica
            </button>
          </div>
        </div>

        {/* Admin transfer */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Trasferimento tra conti (admin)
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Sposta denaro tra due conti qualsiasi, indipendentemente
            dall&apos;intestatario.
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <select
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={adminFromId}
              onChange={(e) =>
                setAdminFromId(
                  e.target.value ? Number(e.target.value) : ("" as "")
                )
              }
            >
              <option value="">Conto origine</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {maskIban(a.iban)} · {a.userName}
                </option>
              ))}
            </select>

            <select
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={adminToId}
              onChange={(e) =>
                setAdminToId(
                  e.target.value ? Number(e.target.value) : ("" as "")
                )
              }
            >
              <option value="">Conto destinazione</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {maskIban(a.iban)} · {a.userName}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Importo"
                className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                value={adminAmount}
                onChange={(e) => setAdminAmount(e.target.value)}
              />
            </div>

            <input
              type="text"
              placeholder="Causale (es. trasferimento gestione admin)"
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={adminDescription}
              onChange={(e) => setAdminDescription(e.target.value)}
            />

            <button
              type="button"
              onClick={handleAdminTransfer}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Esegui trasferimento admin
            </button>
          </div>
        </div>
      </section>

      {/* Errors */}
      {globalError && (
        <div className="rounded-xl border border-red-500/50 bg-red-950/60 px-4 py-2 text-[11px] text-red-100">
          {globalError}
        </div>
      )}

      {/* Transactions table */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40 shadow">
        <div className="max-h-[60vh] overflow-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-900 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                <th className="border-b border-slate-800 px-4 py-2 text-left">
                  Data
                </th>
                <th className="border-b border-slate-800 px-4 py-2 text-left">
                  Descrizione
                </th>
                <th className="border-b border-slate-800 px-4 py-2 text-left">
                  Origine
                </th>
                <th className="border-b border-slate-800 px-4 py-2 text-left">
                  Destinazione
                </th>
                <th className="border-b border-slate-800 px-4 py-2 text-right">
                  Importo
                </th>
                <th className="border-b border-slate-800 px-4 py-2 text-right">
                  Stato
                </th>
                <th className="border-b border-slate-800 px-4 py-2 text-right">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tx, idx) => (
                <tr
                  key={tx.id}
                  className={
                    idx % 2 === 0 ? "bg-slate-950/60" : "bg-slate-900/60"
                  }
                >
                  <td className="border-b border-slate-800 px-4 py-2 text-xs text-slate-300">
                    {new Date(tx.createdAt).toLocaleString("it-IT")}
                  </td>
                  <td className="border-b border-slate-800 px-4 py-2 text-xs text-slate-200">
                    <div className="font-medium">{tx.description}</div>
                    <div className="text-[11px] text-slate-500">
                      {tx.type} · ID {tx.id}
                    </div>
                  </td>
                  <td className="border-b border-slate-800 px-4 py-2 text-xs text-slate-300">
                    {tx.fromAccount ? (
                      <>
                        <div>{tx.fromAccount.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {tx.fromAccount.userName} ·{" "}
                          {maskIban(tx.fromAccount.iban)}
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Sistema / esterno
                      </span>
                    )}
                  </td>
                  <td className="border-b border-slate-800 px-4 py-2 text-xs text-slate-300">
                    {tx.toAccount ? (
                      <>
                        <div>{tx.toAccount.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {tx.toAccount.userName} ·{" "}
                          {maskIban(tx.toAccount.iban)}
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Sistema / esterno
                      </span>
                    )}
                  </td>
                  <td className="border-b border-slate-800 px-4 py-2 text-right text-xs">
                    <span
                      className={
                        tx.fromAccountId && !tx.toAccountId
                          ? "font-semibold text-red-400"
                          : tx.toAccountId && !tx.fromAccountId
                          ? "font-semibold text-emerald-400"
                          : "font-semibold text-cyan-300"
                      }
                    >
                      €{" "}
                      {tx.amount.toLocaleString("it-IT", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="border-b border-slate-800 px-4 py-2 text-right text-[11px] text-slate-300">
                    {tx.status.toLowerCase()}
                  </td>
                  <td className="border-b border-slate-800 px-4 py-2 text-right text-[11px] text-slate-200">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(tx)}
                        className="rounded-full border border-slate-600 px-2 py-1 text-[11px] hover:border-cyan-400 hover:text-cyan-300"
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        disabled={loadingId === tx.id}
                        onClick={() => handleDelete(tx)}
                        className="rounded-full border border-red-600/60 px-2 py-1 text-[11px] text-red-200 hover:border-red-400 hover:text-red-100 disabled:opacity-60"
                      >
                        {loadingId === tx.id ? "Elim..." : "Elimina"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editing && editData && (
        <EditModal
          transaction={editing}
          editData={editData}
          accounts={accounts}
          onChange={handleEditChange}
          onClose={closeEdit}
          onSave={handleSaveEdit}
          saving={editSaving}
        />
      )}
    </>
  );
}

function maskIban(iban: string) {
  if (!iban) return "";
  const clean = iban.replace(/\s+/g, "");
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`;
}

// Simple full-screen modal
function EditModal(props: {
  transaction: SafeTransaction;
  editData: {
    fromAccountId: number | null;
    toAccountId: number | null;
    amount: string;
    type: TransactionType;
    status: TransactionStatus;
    description: string;
    createdAt: string;
  };
  accounts: SafeAccount[];
  onChange: (field: any, value: any) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const { editData, accounts, onChange, onClose, onSave, saving, transaction } =
    props;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs text-slate-100 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Modifica transazione
            </p>
            <p className="text-sm text-slate-100">
              ID {transaction.id} ·{" "}
              {new Date(transaction.createdAt).toLocaleString("it-IT")}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-600 px-2 py-1 text-[11px] hover:border-slate-400"
            onClick={onClose}
          >
            Chiudi
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-[11px] text-slate-300">
              Conto origine
            </label>
            <select
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={editData.fromAccountId ?? ""}
              onChange={(e) =>
                onChange(
                  "fromAccountId",
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">Nessuno (es. deposito)</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {maskIban(a.iban)} · {a.userName}
                </option>
              ))}
            </select>

            <label className="block text-[11px] text-slate-300">
              Conto destinazione
            </label>
            <select
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={editData.toAccountId ?? ""}
              onChange={(e) =>
                onChange(
                  "toAccountId",
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">Nessuno (es. prelievo)</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {maskIban(a.iban)} · {a.userName}
                </option>
              ))}
            </select>

            <label className="block text-[11px] text-slate-300">Importo</label>
            <input
              type="text"
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={editData.amount}
              onChange={(e) => onChange("amount", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] text-slate-300">
              Tipo movimento
            </label>
            <select
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={editData.type}
              onChange={(e) =>
                onChange("type", e.target.value as TransactionType)
              }
            >
              <option value="DEPOSIT">DEPOSIT</option>
              <option value="WITHDRAWAL">WITHDRAWAL</option>
              <option value="TRANSFER_INTERNAL">TRANSFER_INTERNAL</option>
              <option value="TRANSFER_OUT">TRANSFER_OUT</option>
              <option value="TRANSFER_IN">TRANSFER_IN</option>
              <option value="PAYMENT_EXTERNAL">PAYMENT_EXTERNAL</option>
              <option value="CARD_PAYMENT">CARD_PAYMENT</option>
              <option value="FEE">FEE</option>
            </select>

            <label className="block text-[11px] text-slate-300">
              Stato movimento
            </label>
            <select
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={editData.status}
              onChange={(e) =>
                onChange("status", e.target.value as TransactionStatus)
              }
            >
              <option value="COMPLETED">COMPLETED</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <label className="block text-[11px] text-slate-300">
              Descrizione
            </label>
            <input
              type="text"
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={editData.description}
              onChange={(e) => onChange("description", e.target.value)}
            />

            <label className="block text-[11px] text-slate-300">
              Data / ora (modifica)
            </label>
            <input
              type="datetime-local"
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={editData.createdAt}
              onChange={(e) => onChange("createdAt", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 text-[11px]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-600 px-3 py-1 hover:border-slate-400"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-full bg-cyan-500 px-4 py-1 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? "Salvataggio..." : "Salva modifiche"}
          </button>
        </div>
      </div>
    </div>
  );
}
