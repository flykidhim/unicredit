// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { LangProvider } from "@/lib/lang-context";
import { LayoutShell } from "@/components/LayoutShell";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";

export const metadata: Metadata = {
  title: "UniCredit Banking",
  description:
    "Multilingual banking demo with landing, customer and admin areas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <AuthSessionProvider>
          <LangProvider>
            <LayoutShell>{children}</LayoutShell>
          </LangProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
