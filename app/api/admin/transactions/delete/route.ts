// app/api/admin/transactions/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminTxnDeleteBody = {
  transactionId: number | string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    let body: AdminTxnDeleteBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Payload JSON non valido" },
        { status: 400 }
      );
    }

    const { transactionId } = body;

    const idNum =
      typeof transactionId === "string"
        ? parseInt(transactionId, 10)
        : transactionId;

    if (!Number.isFinite(idNum)) {
      return NextResponse.json(
        { error: "transactionId non valido" },
        { status: 400 }
      );
    }

    const existing = await prisma.transaction.findUnique({
      where: { id: idNum },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Transazione non trovata" },
        { status: 404 }
      );
    }

    const updated = await prisma.transaction.update({
      where: { id: idNum },
      data: {
        status: TransactionStatus.CANCELLED,
        description: `${existing.description} [annullata dall’amministratore]`,
      },
    });

    return NextResponse.json({ transaction: updated });
  } catch (err: any) {
    console.error("Admin transaction delete error", err);
    return NextResponse.json(
      {
        error: "Errore interno durante l’annullamento della transazione",
        details: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
