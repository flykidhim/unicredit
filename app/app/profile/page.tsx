// app/app/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return (
      <div className="w-full rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-700">
          Utente non trovato. Contatta il supporto.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-[#262626]">
          Profilo personale
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Riepilogo dei tuoi dati di accesso e informazioni di base.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Nome completo
            </dt>
            <dd className="mt-1 text-sm text-[#262626]">{user.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Email
            </dt>
            <dd className="mt-1 text-sm text-[#262626]">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Ruolo
            </dt>
            <dd className="mt-1 text-sm text-[#262626]">
              {user.role.toLowerCase()}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Stato utente
            </dt>
            <dd className="mt-1 text-sm text-[#262626]">
              {user.status.toLowerCase()}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Creato il
            </dt>
            <dd className="mt-1 text-sm text-[#262626]">
              {user.createdAt.toLocaleDateString("it-IT")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Ultimo aggiornamento
            </dt>
            <dd className="mt-1 text-sm text-[#262626]">
              {user.updatedAt.toLocaleDateString("it-IT")}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-neutral-500">
          Per modificare i tuoi dati anagrafici completi, rivolgiti alla tua
          Filiale UniCredit di riferimento.
        </p>
      </div>
    </div>
  );
}
