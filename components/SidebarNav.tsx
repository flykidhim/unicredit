"use client";

import Image from "next/image";
import Link from "next/link";

const sidebarItems = [
  {
    key: "conti-correnti",
    label: "Conti correnti",
    src: "/images/sidebar/conti-correnti.png",
  },
  {
    key: "carte",
    label: "Carte",
    src: "/images/sidebar/carte.png",
  },
  {
    key: "prestiti",
    label: "Prestiti",
    src: "/images/sidebar/prestiti.png",
  },
  {
    key: "mutui",
    label: "Mutui",
    src: "/images/sidebar/mutui.png",
  },
  {
    key: "investimenti-risparmio",
    label: "Investimenti e risparmio",
    src: "/images/sidebar/investimenti-risparmio.png",
  },
  {
    key: "assicurazioni",
    label: "Assicurazioni",
    src: "/images/sidebar/assicurazioni.png",
  },
  {
    key: "servizi-digitali",
    label: "Servizi digitali",
    src: "/images/sidebar/servizi-digitali.png",
  },
  {
    key: "casa",
    label: "Casa",
    src: "/images/sidebar/casa.png",
  },
];

export function SidebarNav() {
  return (
    <aside
      className="
        fixed left-0 top-[132px]
        hidden lg:flex
        h-[calc(100vh-132px)] w-[100px]
        flex-col
        border-r border-neutral-200 bg-white
      "
    >
      <nav className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-6 py-6">
          {sidebarItems.map((item) => (
            <Link
              key={item.key}
              href={`/info/${item.key}`}
              className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-center transition hover:bg-cyan-50"
            >
              <Image
                src={item.src}
                alt={item.label}
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-[11px] font-medium leading-tight text-[#262626]">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
