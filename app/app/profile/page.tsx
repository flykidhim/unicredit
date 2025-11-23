// app/app/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Raw id from session may be string or number
  const rawId = (session.user as any).id;

  const userId =
    typeof rawId === "string" ? parseInt(rawId, 10) : (rawId as number | null);

  // If id missing or NaN, treat as not logged in
  if (!userId || Number.isNaN(userId)) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const mainAccount = user.accounts[0] ?? null;
  const profileImageUrl =
    user.profileImageUrl || "/images/profile/default-avatar.png";

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Profile card */}
      <section className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="flex-shrink-0">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-neutral-300 bg-neutral-100">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={user.fullName}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-neutral-600">
                {getInitials(user.fullName)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <h1 className="text-lg font-semibold text-[#262626]">
            {user.fullName}
          </h1>
          <p className="text-sm text-neutral-600">{user.email}</p>
          <p className="text-xs text-neutral-500">
            Ruolo:{" "}
            <span className="font-medium">
              {user.role === "ADMIN" ? "Amministratore" : "Cliente Privato"}
            </span>{" "}
            · Stato: <span className="font-medium">{user.status}</span>
          </p>

          {user.dateOfBirth && (
            <p className="text-xs text-neutral-500">
              Data di nascita:{" "}
              {user.dateOfBirth.toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          )}

          <p className="text-xs text-neutral-400">
            Cliente dal{" "}
            {user.createdAt.toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
      </section>

      {/* Account summary card */}
      {mainAccount && (
        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-[#262626]">
            Riepilogo conto principale
          </h2>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-neutral-500">Nome conto</p>
              <p className="mt-1 font-semibold">{mainAccount.name}</p>
              <p className="mt-1 text-xs text-neutral-500">
                IBAN: {mainAccount.iban}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Saldo disponibile</p>
              <p className="mt-1 text-lg font-semibold text-emerald-600">
                {formatCurrency(mainAccount.balance, mainAccount.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Stato conto</p>
              <p className="mt-1 font-semibold">{mainAccount.status}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatCurrency(value: any, currency: string) {
  const num = typeof value === "number" ? value : Number(value);
  return num.toLocaleString("it-IT", {
    style: "currency",
    currency: currency || "EUR",
  });
}
