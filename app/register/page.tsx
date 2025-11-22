// app/register/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Errore durante la registrazione");
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-[126px]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-stretch">
        {/* Left panel */}
        <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#ffd6d6] via-white to-[#f1f5f9] p-[2px] shadow-lg">
          <div className="flex h-full flex-col justify-between rounded-2xl bg-white px-8 py-8">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d73928]">
                Nuovo Cliente
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#262626]">
                Apri il tuo <span className="text-[#d73928]">Conto Online</span>{" "}
                in pochi minuti
              </h1>
              <p className="mt-4 text-sm text-neutral-600">
                Compila il modulo e ottieni subito l&apos;accesso all&apos;Area
                Clienti per gestire conti, carte e pagamenti.
              </p>
            </div>

            <ul className="mt-8 space-y-2 text-xs text-neutral-700">
              <li>• Nessun canone di apertura</li>
              <li>• Estratti conto sempre disponibili</li>
              <li>• Accesso sicuro con credenziali personali</li>
            </ul>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1">
          <div className="rounded-2xl bg-white p-7 shadow-lg">
            <h2 className="text-xl font-semibold text-[#262626]">
              Registrazione Area Clienti
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Inserisci i dati richiesti per creare il tuo profilo.
            </p>

            {error && (
              <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700">
                  Nome e Cognome
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-[#007a91] focus:bg-white"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-[#007a91] focus:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-[#007a91] focus:bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <p className="mt-1 text-[11px] text-neutral-500">
                  Minimo 6 caratteri. Evita di riutilizzare password di altri
                  servizi.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-md bg-[#007a91] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#006276] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Registrazione in corso..." : "Crea il tuo profilo"}
              </button>
            </form>

            <p className="mt-5 text-xs text-neutral-600">
              Hai già un account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#007a91] hover:underline"
              >
                Accedi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
