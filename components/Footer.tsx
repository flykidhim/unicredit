"use client";

import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const legalLinks = [
  "Accessibilità",
  "Arbitro per le controversie finanziarie",
  "Bancassicurazione",
  "Certificazione Qualità",
  "Tesoreria Enti",
  "Cookie Policy",
  "Le tue scelte sui Cookie",
  "Tutti disattivi",
  "Dati societari",
  "Disclaimer",
  "Dizionario Finanziario",
  "FIDT (Fondo Interbancario di Tutela dei Depositi)",
  "Informativa sulla sostenibilità nel settore dei servizi finanziari",
  "Iniziative a supporto di Famiglie e Imprese (ex covid)",
  "Investment Certificate",
  "Manifestazioni a premio",
  "Normativa MiFID",
  "Nuova definizione di Default",
  "Obbligazioni",
  "Operazioni di cartolarizzazione",
  "OPV",
  "Privacy",
  "Rapporti dormienti",
  "Reclami, ricorsi, conciliazione e inadempimenti ABF/ACF",
  "Relazione con i fornitori",
  "Riforma IBOR",
  "SEPA",
  "Sicurezza",
  "UniCredit RE Services (Società di Intermediazione Immobiliare del Gruppo UniCredit)",
  "Whistleblowing",
];

const footerColumns = [
  {
    title: "Privati e Famiglie",
    links: [
      "Conti Correnti",
      "Carte",
      "Prestiti",
      "Mutui",
      "Prodotti di Investimento",
      "Assicurazioni",
      "Servizi Digitali",
    ],
  },
  {
    title: "Wealth Management e Private banking",
    links: [
      "Il modello di servizio",
      "Wealth Management",
      "Soluzioni di Investimento Private Banking",
      "Soluzioni Assicurative Private Banking",
      "Soluzioni Bancarie",
    ],
  },
  {
    title: "Piccole imprese",
    links: [
      "Conti Correnti Piccole Imprese",
      "Carte Piccole Imprese",
      "Finanziamenti Piccole Imprese",
      "Incassi e Pagamenti",
      "Investimenti e Risparmio",
      "Gestione Rischi",
      "International",
      "Servizi Digitali",
    ],
  },
  {
    title: "Corporate Banking",
    links: [
      "Perché UniCredit",
      "Incassi e Pagamenti",
      "Finanziamenti Corporate",
      "International",
      "Rischi e liquidità",
      "Investment Banking",
      "Servizi Digitali",
      "PNRR",
    ],
  },
  {
    title: "Chi siamo",
    links: [
      "Presenza in Italia",
      "Noi e il sociale",
      "Educazione finanziaria",
      "Sostegno e solidarietà",
      "Lavora con noi",
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-8">
      {/* TOP STRIP – social icons, lighter background */}
      <div className="bg-uc-footer-mid py-4">
        <div className="uc-container flex items-center justify-center gap-3">
          {[Twitter, Youtube, Linkedin, Instagram, Facebook].map(
            (Icon, idx) => (
              <div
                key={idx}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
              >
                <Icon className="h-4 w-4" />
              </div>
            )
          )}
        </div>
      </div>

      {/* MAIN FOOTER – deep black */}
      <div className="bg-uc-footer-dark py-6 leading-relaxed text-neutral-300">
        <div className="uc-container space-y-6">
          {/* ROW 1 – logo + long list with vertical separators */}
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-shrink-0 items-center">
              <Image
                src="/images/footer/footer-logo-main.jpg"
                alt="Footer logo"
                width={130}
                height={32}
                className="h-8 w-auto"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {legalLinks.map((item, index) => (
                  <span key={item} className="flex items-center">
                    {index > 0 && (
                      <span
                        className="mx-1 h-3 w-px bg-neutral-500"
                        aria-hidden="true"
                      />
                    )}
                    <button className="text-left text-[14px] text-neutral-300 hover:text-white underline-offset-2 hover:underline">
                      {item}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 2 – 5 columns */}
          <div className="grid grid-cols-1 gap-6 border-t border-neutral-800 pt-6 sm:grid-cols-2 lg:grid-cols-5">
            {footerColumns.map((col) => (
              <div key={col.title} className="space-y-1">
                <h3 className="text-[16px] font-bold tracking-wide text-white">
                  {col.title}
                </h3>
                <ul className="space-y-0.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button className="text-left text-[14px] text-neutral-300 hover:text-white underline-offset-2 hover:underline">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ROW 3 – bottom line + small badge */}
          <div className="border-t border-neutral-800 pt-4">
            <div className="flex flex-col items-center gap-2 text-center text-neutral-400">
              <p className="text-[14px]">
                © 2009-2025 UniCredit S.p.A. - Tutti i diritti riservati - P.IVA
                00348170101
              </p>
              <Image
                src="/images/footer/footer-badge.png"
                alt="Footer certification"
                width={83}
                height={16}
                className="h-4 w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
