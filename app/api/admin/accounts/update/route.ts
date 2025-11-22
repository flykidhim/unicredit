// app/api/admin/accounts/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { accountId, newStatus } = body as {
      accountId: number;
      newStatus: AccountStatus;
    };

    if (!accountId || !newStatus) {
      return NextResponse.json(
        { error: "accountId o newStatus mancanti" },
        { status: 400 }
      );
    }

    const updated = await prisma.account.update({
      where: { id: accountId },
      data: { status: newStatus },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Admin account update error:", err);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento conto" },
      { status: 500 }
    );
  }
}
