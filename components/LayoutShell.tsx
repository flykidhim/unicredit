// components/LayoutShell.tsx
"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { SidebarNav } from "@/components/SidebarNav";
import { Footer } from "@/components/Footer";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Routes that should NOT use the marketing layout
  const isAppShell =
    pathname.startsWith("/app") || pathname.startsWith("/admin");

  // USER / ADMIN AREAS → use their own layouts only
  if (isAppShell) {
    return <>{children}</>;
  }

  // PUBLIC / MARKETING PAGES → show UniCredit header + sidebar + footer
  return (
    <>
      <Header />
      <SidebarNav />
      <div className="uc-main-scroll flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
