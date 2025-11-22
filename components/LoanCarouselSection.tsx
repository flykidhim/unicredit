"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { t } from "@/lib/translations";
import { useLang } from "@/lib/lang-context";

const slides = [1, 2, 3, 4];

export function LoanCarouselSection() {
  const { lang } = useLang();
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % slides.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="py-10 lg:py-16">
      {/* LEFT column a bit wider: 1.5fr vs 2fr */}
      <div className="uc-container grid items-start gap-10 lg:grid-cols-[1.5fr,2fr]">
        {/* LEFT COLUMN – TEXT */}
        <div className="space-y-4 lg:max-w-[460px]">
          <h2 className="text-[28px] lg:text-[35px] font-semibold text-[#262626]">
            {t(lang, "prestito_title")}
          </h2>
          <p className="text-[20px] text-[#262626]">
            {t(lang, "prestito_sub")}
          </p>
          <div className="space-y-3 text-[15px] leading-relaxed text-[#262626]">
            <p>{t(lang, "prestito_body_1")}</p>
            <p>{t(lang, "prestito_body_2")}</p>
          </div>

          <div className="space-y-2 pt-2">
            {/* 👇 Force button to only be as wide as its content */}
            <button className="inline-flex w-auto items-center justify-center rounded-md bg-uc-cta px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-cyan-800 transition-colors">
              {t(lang, "prestito_btn")}
            </button>
            <p className="text-[12px] text-[#262626]">
              {t(lang, "prestito_note")}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN – STACKED CAROUSEL */}
        <div className="relative mt-4 lg:mt-0">
          <div className="relative h-[320px] lg:h-[440px]">
            {slides.map((slide, idx) => {
              const order = (idx - index + slides.length) % slides.length;

              let style: CSSProperties = {};
              let zIndex = 10;
              let opacity = 0.75;

              if (order === 0) {
                // Active slide – big, left, on top
                style = {
                  left: "0%",
                  top: "0%",
                  width: "60%",
                  height: "100%",
                };
                zIndex = 40;
                opacity = 1;
              } else if (order === 1) {
                // Next slide behind, slightly to the right
                style = {
                  left: "45%",
                  top: "10%",
                  width: "45%",
                  height: "70%",
                };
                zIndex = 30;
              } else if (order === 2) {
                // Third slide behind
                style = {
                  left: "28%",
                  top: "20%",
                  width: "45%",
                  height: "65%",
                };
                zIndex = 20;
              } else {
                // Last slide furthest back
                style = {
                  left: "12%",
                  top: "30%",
                  width: "42%",
                  height: "60%",
                };
                zIndex = 10;
              }

              return (
                <div
                  key={slide}
                  className="absolute rounded-2xl shadow-lg overflow-hidden bg-neutral-200 transition-all duration-500"
                  style={{
                    ...style,
                    zIndex,
                    opacity,
                  }}
                >
                  <Image
                    src={`/images/home/prestito-slide-${slide}.jpg`}
                    alt={`Prestito UniCredit slide ${slide}`}
                    fill
                    className="object-cover"
                  />
                  {order !== 0 && (
                    <div className="absolute inset-0 bg-white/40" />
                  )}
                </div>
              );
            })}
          </div>

          {/* NAVIGATION – bottom-right under the stack */}
          <div className="absolute -bottom-10 right-0 flex items-center gap-3">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-uc-cta text-white text-[18px] hover:bg-cyan-800 transition-colors"
            >
              &lt;
            </button>
            <span className="text-[16px] font-medium text-[#262626]">
              {index + 1}/{slides.length}
            </span>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-uc-cta text-white text-[18px] hover:bg-cyan-800 transition-colors"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
