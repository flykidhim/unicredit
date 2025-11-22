"use client";

import { t } from "@/lib/translations";
import { useLang } from "@/lib/lang-context";
import Image from "next/image";

const cards = [
  {
    key: "re-services",
    title: "UniCredit RE Services",
    body: "La società di intermediazione immobiliare del Gruppo UniCredit che ti accompagna con professionalità nella vendita e nell'acquisto della tua casa.",
    link: "UniCredit RE Services >",
    src: "/images/home/lo-sapevi-re-services.jpg",
  },
  {
    key: "antifrode",
    title: "L'antifrode più efficace puoi essere tu",
    body: "Approfondisci la tua conoscenza della sicurezza digitale: le truffe digitali più diffuse (finto operatore di banca o agente delle Forze dell’Ordine, smishing, truffe sentimentali) che puntano a sottrarre denaro e dati e alcuni consigli pratici per proteggere le tue carte e i servizi online.",
    link: "Sicurezza digitale >",
    src: "/images/home/lo-sapevi-antifrode.jpg",
  },
  {
    key: "carta-etica",
    title: "Progetto Carta Etica",
    body: "Un’iniziativa di solidarietà legata all’utilizzo delle carte di credito Etiche, per sostenere iniziative e progetti di solidarietà del Terzo Settore e Organizzazioni senza scopo di lucro. Il progetto, attivo dal 2005, segna un traguardo importante perché si celebrano i 20 anni del Fondo Carta Etica.",
    link: "Fondo Carta Etica >",
    src: "/images/home/lo-sapevi-carta-etica.jpg",
  },
];

export function DidYouKnowSection() {
  const { lang } = useLang();

  return (
    <section className="py-12 lg:py-16">
      <div className="uc-container">
        <h2 className="text-[26px] lg:text-[35px] font-semibold text-[#262626]">
          {t(lang, "losapevi_title")}
        </h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.key}
              className="uc-card overflow-hidden flex flex-col"
            >
              {/* IMAGE */}
              <div className="relative h-[200px] lg:h-[243px] bg-neutral-300">
                <Image
                  src={card.src}
                  alt={card.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 h-2 w-full bg-[#d73928]" />
              </div>

              {/* BODY */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-[20px] lg:text-[24px] font-semibold text-[#262626]">
                  {card.title}
                </h3>
                <p className="text-[15px] lg:text-[18px] leading-relaxed text-[#262626]">
                  {card.body}
                </p>
                <button className="mt-auto text-[14px] font-semibold text-uc-cta hover:underline">
                  {card.link}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
