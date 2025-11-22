// components/AppNavTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type LinkItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const baseLinks: LinkItem[] = [
  { href: "/app", label: "Panoramica" },
  { href: "/app/accounts", label: "Conti e carte" },
  { href: "/app/transfer", label: "Trasferimenti" },
  { href: "/app/movements", label: "Movimenti" },
  { href: "/app/profile", label: "Profilo" },
];

const adminLink: LinkItem = {
  href: "/admin",
  label: "Admin Console",
  adminOnly: true,
};

export function AppNavTabs({
  isAdmin,
  variant,
}: {
  isAdmin: boolean;
  variant: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const links = isAdmin ? [...baseLinks, adminLink] : baseLinks;

  if (variant === "desktop") {
    return (
      <nav className="hidden items-center gap-4 text-[13px] font-medium text-neutral-600 md:flex">
        {links.map((link) => {
          const active = pathname === link.href;
          const isAdminLink = link.adminOnly;

          const base =
            "rounded-full px-3 py-1 transition-colors whitespace-nowrap";
          const normalInactive =
            "bg-transparent text-neutral-600 hover:bg-neutral-100";
          const normalActive =
            "bg-[#007a91] text-white shadow-sm hover:bg-[#007a91]";
          const adminInactive =
            "border border-[#007a91] text-[#007a91] bg-white hover:bg-cyan-50";
          const adminActive =
            "border border-[#007a91] bg-[#007a91] text-white shadow-sm";

          let cls = base;
          if (isAdminLink) {
            cls += " " + (active ? adminActive : adminInactive);
          } else {
            cls += " " + (active ? normalActive : normalInactive);
          }

          return (
            <Link key={link.href} href={link.href} className={cls}>
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  // MOBILE
  return (
    <div className="border-t border-neutral-200 bg-neutral-50 md:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-2 text-[12px]">
        {links.map((link) => {
          const active = pathname === link.href;
          const isAdminLink = link.adminOnly;

          const base =
            "whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors";
          const normalInactive =
            "bg-white text-neutral-700 border border-neutral-200";
          const normalActive =
            "bg-[#007a91] text-white border border-[#007a91]";
          const adminInactive =
            "border border-[#007a91] text-[#007a91] bg-white";
          const adminActive = "border border-[#007a91] bg-[#007a91] text-white";

          let cls = base;
          if (isAdminLink) {
            cls += " " + (active ? adminActive : adminInactive);
          } else {
            cls += " " + (active ? normalActive : normalInactive);
          }

          return (
            <Link key={link.href} href={link.href} className={cls}>
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
