// app/login/LoginFormClient.tsx
"use client";

import { useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function LoginFormClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const showErrorMessage =
    localError ||
    (errorParam === "CredentialsSignin"
      ? "Credenziali non valide. Controlla email e password."
      : errorParam
      ? "Si è verificato un errore durante l’accesso."
      : null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res) {
        setLocalError("Errore di connessione. Riprova.");
        return;
      }

      if (res.error) {
        setLocalError(
          res.error === "CredentialsSignin"
            ? "Email o password non corretti."
            : "Impossibile completare l’accesso. Riprova."
        );
        return;
      }

      // Login OK → vai alla dashboard cliente
      router.push("/app");
      router.refresh();
    } catch (err) {
      console.error(err);
      setLocalError("Errore imprevisto. Riprova tra qualche minuto.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-10 rounded-xl bg-white p-6 shadow-sm lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:p-10">
      {/* LEFT – form */}
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#007a91] font-semibold">
            Accesso area clienti
          </p>
          <h1 className="text-[28px] lg:text-[32px] font-semibold text-[#262626]">
            Accedi al tuo Internet Banking
          </h1>
          <p className="text-[14px] text-neutral-600">
            Inserisci le tue credenziali per consultare conti, carte, movimenti
            e disporre operazioni online in modo semplice e sicuro.
          </p>
        </div>

        {showErrorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {showErrorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-[13px] font-semibold text-[#262626]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[14px] text-[#262626] shadow-sm outline-none focus:border-[#007a91] focus:ring-1 focus:ring-[#007a91]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-[13px] font-semibold text-[#262626]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[14px] text-[#262626] shadow-sm outline-none focus:border-[#007a91] focus:ring-1 focus:ring-[#007a91]"
            />
          </div>

          <div className="flex items-center justify-between text-[12px] text-neutral-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-neutral-300 text-[#007a91] focus:ring-[#007a91]"
              />
              <span>Ricorda il mio accesso su questo dispositivo</span>
            </label>

            <Link
              href="#"
              className="text-[12px] font-semibold text-[#007a91] hover:underline"
            >
              Password dimenticata?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-[#007a91] px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>

        <div className="border-t border-neutral-200 pt-4 text-[13px] text-neutral-600">
          <p>
            Non hai ancora un conto online?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#007a91] hover:underline"
            >
              Apri il conto
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT – illustration / reassurance panel */}
      <div className="space-y-4 rounded-xl bg-[#f5f5f5] p-5 lg:p-6">
        <div className="relative h-[180px] w-full overflow-hidden rounded-lg bg-neutral-200">
          {/* Put a real image here */}
          <Image
            src="/images/auth/login-hero.jpg"
            alt="Accesso sicuro all'Internet Banking"
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-3 text-[13px] text-neutral-700">
          <h2 className="text-[16px] font-semibold text-[#262626]">
            Accesso sicuro, ovunque ti trovi
          </h2>
          <p>
            Consulta saldi e movimenti, effettua bonifici, gestisci le tue carte
            e controlla le spese dall’App Mobile Banking o dall’Internet
            Banking, 24 ore su 24.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Autenticazione forte e notifiche in tempo reale.</li>
            <li>Monitoraggio continuo delle operazioni sensibili.</li>
            <li>Supporto dedicato in caso di dubbi o anomalie.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
