// app/app/payments/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-[#262626]">Pagamenti</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Da qui in futuro potrai gestire bonifici SEPA, bollette, ricariche e
          altri pagamenti. Al momento la sezione è in modalità.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-neutral-600">
          Funzionalità pagamenti avanzati saranno implementate in una fase
          successiva (bonifici verso terzi, bollo auto, MAV/RAV, F24, ecc.).
        </p>
      </div>
    </div>
  );
}
