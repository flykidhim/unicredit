"use client";

import Image from "next/image";
import { t } from "@/lib/translations";
import { useLang } from "@/lib/lang-context";

export function MyCareSection() {
  const { lang } = useLang();

  return (
    <section className="bg-uc-grey">
      <div className="uc-container grid items-stretch gap-10 py-16 lg:py-20 lg:grid-cols-[3fr,2.5fr]">
        {/* TEXT */}
        <div className="space-y-4">
          <h2 className="text-[24px] lg:text-[32px] font-semibold text-[#262626]">
            {t(lang, "mycare_title")}
          </h2>
          <p className="text-[20px] text-[#262626]">{t(lang, "mycare_sub")}</p>

          <div className="space-y-3 text-[15px] leading-relaxed text-[#262626]">
            <p>
              UniCredit My Care Autonomia è la protezione che ti aiuta a vivere
              con serenità il tuo domani e quello delle persone a te care.
            </p>
            <p>
              Fai un gesto d’amore per te e le persone che ami: la soluzione
              assicurativa che prevede una rendita mensile vitalizia, utile per
              far fronte alle spese di assistenza come una badante, una casa di
              cura o altri servizi necessari al sostegno economico previsto in
              caso di sopravvenuta non autosufficienza.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button className="inline-flex items-center justify-center rounded-md bg-uc-cta px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-cyan-800 transition-colors">
              {t(lang, "mycare_btn")}
            </button>
            <div className="text-[12px] text-[#262626] space-y-1">
              <p>{t(lang, "mycare_note_1")}</p>
              <p>
                {t(lang, "mycare_note_2")}{" "}
                <a
                  href="https://www.unicreditlife.it"
                  className="text-uc-cta underline"
                >
                  www.unicreditlife.it
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* IMAGE – bottom-right */}
        <div className="relative flex items-end justify-end">
          <div className="relative h-[180px] w-full max-w-[610px] rounded-2xl bg-neutral-300 shadow-md lg:h-[305px]">
            {/* Replace with your MyCare image, ~610×305 */}
            <Image
              src="/images/home/mycare-autonomia.jpg"
              alt="UniCredit My Care Autonomia"
              fill
              className="rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
