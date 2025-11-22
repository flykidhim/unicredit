// app/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import UsersTable from "./UsersTable";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const safeUsers = users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <>
      <section className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4 shadow">
        <h1 className="text-lg font-semibold text-slate-50">Gestione utenti</h1>
        <p className="mt-1 text-sm text-slate-400">
          Visualizza e aggiorna lo stato degli utenti e i loro ruoli.
        </p>
      </section>

      <UsersTable users={safeUsers} />
    </>
  );
}
