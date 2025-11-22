// app/login/page.tsx
import { Suspense } from "react";
import LoginFormClient from "./LoginFormClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div>
      <div className="uc-container py-8 lg:py-10">
        <Suspense
          fallback={
            <div className="flex h-[300px] items-center justify-center text-sm text-neutral-500">
              Caricamento area di accesso...
            </div>
          }
        >
          <LoginFormClient />
        </Suspense>
      </div>
    </div>
  );
}
