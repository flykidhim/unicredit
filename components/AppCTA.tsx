"use client";

import { t } from "@/lib/translations";
import { useLang } from "@/lib/lang-context";

export function AppCTA() {
  const { lang } = useLang();

  return (
    <section className="bg-uc-cta text-white">
      <div className="uc-container flex flex-col items-start justify-between gap-4 py-6 lg:flex-row lg:items-center">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-[22px] lg:text-[30px] font-semibold">
            {t(lang, "app_title")}
          </h2>
          <p className="text-[14px] lg:text-[16px]">{t(lang, "app_body")}</p>
        </div>
        <button className="rounded-md border border-white px-5 py-3 text-[18px] font-semibold hover:bg-white hover:text-uc-cta transition-colors">
          {t(lang, "app_btn")}
        </button>
      </div>
    </section>
  );
}
