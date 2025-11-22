"use client";

import Image from "next/image";
import { t } from "@/lib/translations";
import { useLang } from "@/lib/lang-context";

export function LandingHero() {
  const { lang } = useLang();

  return (
    // Full hero band
    <section className="bg-[#d1960a] text-[#262626]">
      {/* No vertical padding here so the image can match section height */}
      <div className="flex flex-col lg:flex-row lg:h-[400px]">
        {/* TEXT COLUMN – about 60% */}
        <div className="order-2 lg:order-1 flex-1 lg:flex-[3] flex items-center">
          {/* Inner padding only for the text, not the image */}
          <div className="w-full max-w-5xl px-4 py-6 lg:px-10 lg:py-0 space-y-6">
            <div className="space-y-3">
              {/* Rows 1–2: big title */}
              <p
                className="text-[32px] lg:text-[50px] font-semibold leading-tight"
                style={{
                  fontFamily:
                    '"unicredit-regular", "Helvetica Neue", Helvetica, sans-serif',
                }}
              >
                {t(lang, "hero_badge")}
              </p>

              {/* Row 3 */}
              <p className="text-[20px] font-semibold tracking-wide">
                {t(lang, "hero_title")}
              </p>

              {/* Row 4 */}
              <p className="text-[18px] max-w-xl">{t(lang, "hero_subline")}</p>
            </div>

            {/* Row 5 + 6 */}
            <div className="space-y-2">
              <button className="inline-flex items-center justify-center rounded-md bg-uc-cta px-5 py-3 text-[18px] font-semibold text-white hover:bg-cyan-800 transition-colors">
                {t(lang, "hero_btn")}
              </button>
              <p className="text-[11px]">{t(lang, "hero_note")}</p>
            </div>
          </div>
        </div>

        {/* IMAGE COLUMN – about 40%, fills full hero height */}
        <div className="order-1 lg:order-2 w-full lg:flex-[2]">
          {/* No padding/margin here; image owns the whole column */}
          <div className="relative h-[220px] w-full lg:h-full">
            <Image
              src="/images/home/hero-conto-genius.jpg"
              alt="Conto Genius – UniCredit"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
