// app/api/admin/transactions/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminTxnUpdateBody = {
  transactionId: number | string;
  description?: string;
  status?: TransactionStatus;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    let body: AdminTxnUpdateBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Payload JSON non valido" },
        { status: 400 }
      );
    }

    const { transactionId, description, status } = body;
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

    const data: any = {};
    if (typeof description === "string") {
      data.description = description.trim();
    }
    if (status) {
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nessun campo da aggiornare" },
        { status: 400 }
      );
    }

    const updated = await prisma.transaction.update({
      where: { id: idNum },
      data,
    });

    return NextResponse.json({ transaction: updated });
  } catch (err: any) {
    console.error("Admin transaction update error", err);
    return NextResponse.json(
      {
        error: "Errore interno durante l’aggiornamento della transazione",
        details: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
