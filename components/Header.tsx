// components/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Phone, Rocket, X, Menu } from "lucide-react";
import { t } from "@/lib/translations";
import { useLang } from "@/lib/lang-context";

const sidebarItems = [
  { label: "Conti correnti" },
  { label: "Carte" },
  { label: "Prestiti" },
  { label: "Mutui" },
  { label: "Investimenti e risparmio" },
  { label: "Assicurazioni" },
  { label: "Servizi digitali" },
  { label: "Casa" },
];

const headerIcons = [
  {
    key: "header_privati",
    src: "/images/header/icon-privati.png",
  },
  {
    key: "header_imprese",
    src: "/images/header/icon-imprese.png",
  },
  {
    key: "header_chi_siamo",
    src: "/images/header/icon-chi-siamo.png",
  },
  {
    key: "header_contatti",
    src: "/images/header/icon-contatti-filiali.png",
  },
  {
    key: "header_cerca",
    src: "/images/header/icon-cerca.png",
  },
  {
    key: "header_numero_verde",
    src: "/images/header/icon-numero-verde.png",
  },
];

// Map the header icon keys to the info pages
const headerIconLinks: Record<string, string> = {
  header_privati: "/", // stays on main landing
  header_imprese: "/info/imprese",
  header_chi_siamo: "/info/chi-siamo",
  header_contatti: "/info/contatti-filiali",
  header_cerca: "/info/cerca",
  header_numero_verde: "/info/numero-verde",
};

export function Header() {
  const { lang, setLang } = useLang();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 bg-white shadow-sm">
        {/* TOP BAR */}
        <div className="border-b border-neutral-200">
          <div className="flex h-[86px] items-center justify-between px-4 lg:px-10">
            {/* LEFT – Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/header/logo-unicredit-privati.png"
                  alt="UniCredit"
                  width={180}
                  height={40}
                  className="h-auto w-auto"
                  priority
                />
              </Link>
            </div>

            {/* CENTER – 6 icons (desktop) */}
            <div className="hidden flex-1 justify-center lg:flex">
              <nav className="flex items-end gap-8">
                {headerIcons.map((item) => {
                  const href = headerIconLinks[item.key] ?? "#";
                  return (
                    <Link
                      key={item.key}
                      href={href}
                      className="flex flex-col items-center gap-1 text-center text-[#262626] hover:text-[#007a91] transition-colors"
                    >
                      <Image
                        src={item.src}
                        alt={t(lang, item.key)}
                        width={32}
                        height={32}
                        className="h-8 w-8"
                      />
                      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-tight leading-4">
                        {item.key === "header_numero_verde"
                          ? `${t(lang, item.key)} 800.57.57.57`
                          : t(lang, item.key)}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* RIGHT – APRI IL CONTO + Login + mobile menu */}
            <div className="flex flex-shrink-0 items-center gap-3">
              <Link
                href="/register"
                className="hidden sm:inline-flex h-[50px] w-[179px] items-center justify-center gap-2 rounded-md bg-[#007a91] text-[13px] font-semibold text-white shadow-sm hover:bg-cyan-800 transition-colors"
              >
                <Rocket className="h-4 w-4" />
                <span>APRI IL CONTO</span>
              </Link>

              {/* Login icon – no circle, just the PNG + text */}
              <Link
                href="/login"
                className="flex flex-col items-center text-[11px] text-[#262626] hover:text-[#007a91] transition-colors"
              >
                <Image
                  src="/images/header/icon-login.png"
                  alt="Login"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="mt-0.5 text-[10px] font-semibold leading-3 text-center">
                  Accesso
                </span>
                <span className="text-[10px] font-semibold leading-3 text-center">
                  Area Clienti
                </span>
              </Link>

              {/* Mobile burger */}
              <button
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white shadow-sm lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Apri menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* SECONDARY BAR – slightly left, like original */}
        <div className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-4 text-[12px] leading-4 text-[#262626]">
            <div className="flex items-center gap-6">
              <button className="font-semibold text-[#262626]">
                {t(lang, "sub_privati_famiglie")}
              </button>
              <button className="hidden sm:inline font-medium text-neutral-600 hover:text-[#007a91]">
                {t(lang, "sub_private_banking")}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="hidden sm:inline text-neutral-500">Lingua</span>
              <div className="flex items-center gap-1 rounded-full border border-neutral-300 px-2 py-1 text-[11px]">
                <button
                  onClick={() => setLang("it")}
                  className={`px-1 ${
                    lang === "it"
                      ? "font-semibold text-[#007a91]"
                      : "text-neutral-600"
                  }`}
                >
                  ITA
                </button>
                <span className="text-neutral-400">|</span>
                <button
                  onClick={() => setLang("en")}
                  className={`px-1 ${
                    lang === "en"
                      ? "font-semibold text-[#007a91]"
                      : "text-neutral-600"
                  }`}
                >
                  EN
                </button>
                <span className="ml-1 text-neutral-500">▾</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[120px] z-40 border-t border-neutral-200 bg-white/95 backdrop-blur-md lg:hidden">
          <div className="flex h-full flex-col px-4 py-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#262626]">Menu</h2>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Chiudi menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="flex items-center rounded-full border border-neutral-300 bg-neutral-50 px-3 py-2">
                <input
                  className="flex-1 bg-transparent text-[13px] outline-none"
                  placeholder="Cerca"
                />
                <Search className="h-4 w-4 text-neutral-500" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Sidebar items */}
              <div className="space-y-3">
                {sidebarItems.map((item, idx) => (
                  <button
                    key={item.label}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-[13px] font-medium text-[#262626] hover:border-[#007a91] hover:bg-cyan-50 transition"
                  >
                    {idx + 1}. {item.label}
                  </button>
                ))}
              </div>

              <div className="my-4 border-t border-neutral-200" />

              {/* Header menu items condensed */}
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                {headerIcons.map((item) => {
                  const href = headerIconLinks[item.key] ?? "#";
                  return (
                    <Link
                      key={item.key}
                      href={href}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left hover:border-[#007a91] hover:bg-cyan-50 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-[11px] uppercase tracking-tight text-[#262626]">
                        {t(lang, item.key)}
                      </span>
                      {item.key === "header_cerca" && (
                        <Search className="h-3 w-3 text-neutral-500" />
                      )}
                      {item.key === "header_numero_verde" && (
                        <Phone className="h-3 w-3 text-neutral-500" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile login / open account */}
              <div className="mt-4 flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-full border border-neutral-300 px-3 py-2 text-center text-[13px] font-semibold text-[#262626] hover:border-[#007a91] hover:bg-cyan-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-full bg-[#007a91] px-3 py-2 text-center text-[13px] font-semibold text-white hover:bg-cyan-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Apri conto
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
