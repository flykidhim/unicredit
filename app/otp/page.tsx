// app/otp/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

// Fixed demo OTP codes
const VALID_CODES = ["482719", "930154", "671203", "118944", "549082"];

export default function OtpPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If user not logged in, send back to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-sm text-neutral-600">Caricamento in corso…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Simulate network delay for nicer UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    const trimmed = code.trim();

    if (!VALID_CODES.includes(trimmed)) {
      setError("Il codice inserito non è valido. Riprova.");
      setSubmitting(false);
      return;
    }

    try {
      await update({
        otpVerified: true,
      } as any);

      setSuccess("Codice verificato, accesso in corso…");

      setTimeout(() => {
        router.push("/app");
      }, 700);
    } catch (err) {
      console.error("OTP update error:", err);
      setError("Si è verificato un errore durante la verifica. Riprova.");
      setSubmitting(false);
    }
  };

  const maskedEmail =
    session.user?.email?.replace(
      /(.{2}).+(@.+)/,
      (_match, start: string, end: string) => `${start}***${end}`
    ) || "il tuo indirizzo email";

  return (
    <div className="bg-slate-50">
      {/* Less vertical padding so it sits closer under the header */}
      <div className="mx-auto max-w-3xl px-4 py-8 lg:py-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:p-8">
          {/* Header row inside card */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#007a91]/10 text-[#007a91]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#262626] lg:text-lg">
                Verifica tramite codice OTP
              </h1>
              <p className="text-xs text-neutral-500 lg:text-[13px]">
                Per completare l’accesso, inserisci il codice monouso inviato a{" "}
                <span className="font-medium text-neutral-700">
                  {maskedEmail}
                </span>
                .
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500"
              >
                Codice OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[15px] tracking-[0.25em] text-center font-semibold text-[#262626] outline-none focus:border-[#007a91] focus:ring-2 focus:ring-[#007a91]/20"
                placeholder="••••••"
              />
              <p className="text-[11px] text-neutral-500">
                Inserisci il codice a 6 cifre. Hai a disposizione più tentativi.
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
                {success}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                className="text-[12px] font-medium text-[#007a91] hover:text-[#005f6f]"
                // demo only - no real resend action
                onClick={() => {
                  setError(null);
                  setSuccess("Nuovo codice inviato (demo).");
                }}
              >
                Invia un nuovo codice
              </button>

              <button
                type="submit"
                disabled={submitting || !code.trim()}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition ${
                  submitting || !code.trim()
                    ? "bg-[#007a91]/60 cursor-not-allowed"
                    : "bg-[#007a91] hover:bg-[#005f6f]"
                }`}
              >
                {submitting ? (
                  <>
                    <span className="inline-flex h-4 w-4 items-center justify-center">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                    </span>
                    Verifica in corso…
                  </>
                ) : (
                  "Conferma"
                )}
              </button>
            </div>
          </form>

          <p className="mt-4 text-[11px] leading-relaxed text-neutral-500">
            Per la tua sicurezza, questo è un ambiente protetto. Se non hai
            richiesto tu l’accesso, contatta subito la tua filiale o il numero
            verde UniCredit.
          </p>
        </div>
      </div>
    </div>
  );
}
