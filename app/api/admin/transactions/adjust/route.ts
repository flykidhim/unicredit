// app/api/admin/transactions/adjust/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminTxnAdjustBody = {
  transactionId: number | string;
  newAmount: string | number;
  note?: string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    let body: AdminTxnAdjustBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Payload JSON non valido" },
        { status: 400 }
      );
    }

    const { transactionId, newAmount, note } = body;

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

    const amountNum =
      typeof newAmount === "string" ? parseFloat(newAmount) : newAmount;

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: "Importo non valido" },
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

    const newDescription =
      note && note.trim().length > 0
        ? `${existing.description} (rettifica admin: ${note.trim()})`
        : existing.description;

    const updated = await prisma.transaction.update({
      where: { id: idNum },
      data: {
        amount: amountNum.toString(), // Prisma will handle decimal
        description: newDescription,
      },
    });

    return NextResponse.json({ transaction: updated });
  } catch (err: any) {
    console.error("Admin transaction adjust error", err);
    return NextResponse.json(
      {
        error: "Errore interno durante la rettifica della transazione",
        details: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
