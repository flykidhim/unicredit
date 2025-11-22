"use client";

import { t } from "@/lib/translations";
import { useLang } from "@/lib/lang-context";

export function AppointmentCTA() {
  const { lang } = useLang();

  return (
    <section className="bg-uc-cta text-white">
      <div className="uc-container flex flex-col items-start justify-between gap-4 py-6 lg:flex-row lg:items-center">
        <h2 className="text-[22px] lg:text-[35px] font-semibold leading-tight">
          {t(lang, "appunt_title")}
        </h2>
        <button className="rounded-md border border-white px-5 py-3 text-[18px] font-semibold hover:bg-white hover:text-uc-cta transition-colors">
          {t(lang, "appunt_btn")}
        </button>
      </div>
    </section>
  );
}
