// app/admin/users/UsersTable.tsx
"use client";

import { useState } from "react";

type Role = "USER" | "ADMIN";
type UserStatus = "ACTIVE" | "SUSPENDED" | "DISABLED";

interface SafeUser {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export default function UsersTable({ users }: { users: SafeUser[] }) {
  const [rows, setRows] = useState<SafeUser[]>(users);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (
    userId: number,
    newStatus?: UserStatus,
    newRole?: Role
  ) => {
    setLoadingId(userId);
    setError(null);
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newStatus, newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante l'aggiornamento utente");
        return;
      }
      setRows((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
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
                Utente
              </th>
              <th className="border-b border-slate-800 px-4 py-2 text-left">
                Email
              </th>
              <th className="border-b border-slate-800 px-4 py-2 text-left">
                Ruolo
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
            {rows.map((u, idx) => (
              <tr
                key={u.id}
                className={
                  idx % 2 === 0 ? "bg-slate-950/60" : "bg-slate-900/60"
                }
              >
                <td className="border-b border-slate-800 px-4 py-2 text-xs text-slate-100">
                  <div className="font-semibold">{u.fullName}</div>
                  <div className="text-[11px] text-slate-400">
                    ID {u.id} ·{" "}
                    {new Date(u.createdAt).toLocaleDateString("it-IT")}
                  </div>
                </td>
                <td className="border-b border-slate-800 px-4 py-2 text-xs text-slate-300">
                  {u.email}
                </td>
                <td className="border-b border-slate-800 px-4 py-2 text-xs">
                  <select
                    className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-100 border border-slate-700"
                    value={u.role}
                    disabled={loadingId === u.id}
                    onChange={(e) =>
                      updateUser(u.id, undefined, e.target.value as Role)
                    }
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="border-b border-slate-800 px-4 py-2 text-xs">
                  <select
                    className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-100 border border-slate-700"
                    value={u.status}
                    disabled={loadingId === u.id}
                    onChange={(e) =>
                      updateUser(u.id, e.target.value as UserStatus, undefined)
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </td>
                <td className="border-b border-slate-800 px-4 py-2 text-right text-[11px] text-slate-300">
                  {loadingId === u.id ? "Aggiornamento..." : "Pronto"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
