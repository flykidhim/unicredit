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

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<AdminAccountUpdateBody>;

    if (!body.accountId || !body.action) {
      return NextResponse.json(
        { error: "accountId e action sono obbligatori" },
        { status: 400 }
      );
    }

    const accountId = Number(body.accountId);
    if (!Number.isInteger(accountId)) {
      return NextResponse.json(
        { error: "accountId deve essere un intero valido" },
        { status: 400 }
      );
    }

    let data: any = {};

    switch (body.action) {
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
        if (!body.newName || !body.newName.trim()) {
          return NextResponse.json(
            { error: "newName è obbligatorio per rename" },
            { status: 400 }
          );
        }
        data.name = body.newName.trim();
        break;
      default:
        return NextResponse.json(
          { error: "Azione non supportata" },
          { status: 400 }
        );
    }

    const updated = await prisma.account.update({
      where: { id: accountId },
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
