"use client";

import { MapPin, Phone } from "lucide-react";
import { t } from "@/lib/translations";
import { useLang } from "@/lib/lang-context";

export function HelpSection() {
  const { lang } = useLang();

  return (
    <section className="py-12 lg:py-16">
      <div className="uc-container space-y-6">
        <h2 className="text-[26px] lg:text-[32px] font-semibold text-[#262626]">
          {t(lang, "help_title")}
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card 1 */}
          <div className="flex items-start gap-4 rounded-md border border-neutral-400 bg-white px-6 py-5 shadow-sm">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
              <MapPin className="h-5 w-5 text-uc-cta" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[18px] lg:text-[20px] font-semibold text-[#262626]">
                {t(lang, "help_card1_title")}
              </h3>
              <p className="text-[14px] lg:text-[15px]">
                {t(lang, "help_card1_p")}
              </p>
              <button className="text-[14px] font-semibold text-uc-cta hover:underline">
                {t(lang, "help_card1_link")}
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-start gap-4 rounded-md border border-neutral-400 bg-white px-6 py-5 shadow-sm">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
              <Phone className="h-5 w-5 text-uc-cta" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[18px] lg:text-[20px] font-semibold text-[#262626]">
                {t(lang, "help_card2_title")}
              </h3>
              <p className="text-[14px] lg:text-[15px]">
                {t(lang, "help_card2_p")}
              </p>
              <button className="text-[14px] font-semibold text-uc-cta hover:underline">
                {t(lang, "help_card2_link")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
