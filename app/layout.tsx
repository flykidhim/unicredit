// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { LangProvider } from "@/lib/lang-context";
import { LayoutShell } from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "UniCredit Banking Clone",
  description: "Multilingual banking with landing, customer and admin areas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <LangProvider>
          <LayoutShell>{children}</LayoutShell>
        </LangProvider>
      </body>
    </html>
  );
}
