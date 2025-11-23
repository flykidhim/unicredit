// app/register/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          dateOfBirth: dateOfBirth || undefined,
          profileImageUrl: profileImageUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrazione non riuscita.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch (err) {
      console.error(err);
      setError("Errore di rete. Riprova.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10">
        {/* LEFT: marketing */}
        <div className="hidden flex-1 flex-col gap-4 pr-10 md:flex">
          <h1 className="text-2xl font-semibold text-[#262626]">
            Apri il tuo conto UniCredit demo
          </h1>
          <p className="text-sm text-neutral-600">
            Crea un profilo cliente con pochi dati: potrai vedere i conti, i
            movimenti e simulare le principali funzioni di Internet Banking.
          </p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
            <li>• Profilo personale con foto e data di nascita</li>
            <li>• Conto Genius demo con saldo e movimenti</li>
            <li>• Accesso sicuro con credenziali personali</li>
          </ul>
        </div>

        {/* RIGHT: form */}
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm border border-neutral-200">
          <h2 className="mb-1 text-lg font-semibold text-[#262626]">
            Registrazione Area Clienti
          </h2>
          <p className="mb-4 text-xs text-neutral-500">
            I dati inseriti servono solo per questa demo didattica.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Nome e cognome
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#007a91] focus:ring-1 focus:ring-[#007a91]"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Data di nascita
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#007a91] focus:ring-1 focus:ring-[#007a91]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">
                  URL foto profilo (opzionale)
                </label>
                <input
                  type="text"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  placeholder="/images/profile/default-avatar.png"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#007a91] focus:ring-1 focus:ring-[#007a91]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#007a91] focus:ring-1 focus:ring-[#007a91]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#007a91] focus:ring-1 focus:ring-[#007a91]"
                required
              />
              <p className="text-[10px] text-neutral-500">
                Usa almeno 8 caratteri, includendo lettere e numeri.
              </p>
            </div>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-md bg-[#007a91] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800 disabled:opacity-70"
            >
              {loading ? "Registrazione in corso..." : "Crea il tuo profilo"}
            </button>
          </form>

          <div className="mt-4 border-t border-neutral-200 pt-3 text-center text-xs text-neutral-600">
            <p>
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
