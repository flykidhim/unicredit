// app/api/admin/accounts/update/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminAccountUpdateBody = {
  accountId: number | string;
  action: "freeze" | "unfreeze" | "close" | "rename";
  newName?: string;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const role = (session?.user as any)?.role;
    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    let body: AdminAccountUpdateBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Payload JSON non valido" },
        { status: 400 }
      );
    }

    const { accountId, action, newName } = body;

    const idNum =
      typeof accountId === "string" ? parseInt(accountId, 10) : accountId;

    if (!Number.isFinite(idNum)) {
      return NextResponse.json(
        { error: "accountId non valido" },
        { status: 400 }
      );
    }

    const account = await prisma.account.findUnique({
      where: { id: idNum },
    });

    if (!account) {
      return NextResponse.json({ error: "Conto non trovato" }, { status: 404 });
    }

    let data: Partial<{
      status: AccountStatus;
      name: string;
    }> = {};

    switch (action) {
      case "freeze":
        data.status = AccountStatus.FROZEN;
        break;
      case "unfreeze":
        data.status = AccountStatus.ACTIVE;
        break;
      case "close":
        data.status = AccountStatus.CLOSED;
        break;
      case "rename":
        if (!newName || !newName.trim()) {
          return NextResponse.json(
            { error: "Nuovo nome non valido" },
            { status: 400 }
          );
        }
        data.name = newName.trim();
        break;
      default:
        return NextResponse.json(
          { error: "Azione non supportata" },
          { status: 400 }
        );
    }

    const updated = await prisma.account.update({
      where: { id: idNum },
      data,
    });

    return NextResponse.json({ account: updated });
  } catch (err: any) {
    console.error("Admin account update error", err);
    return NextResponse.json(
      {
        error: "Errore interno durante l’aggiornamento del conto",
        details: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
