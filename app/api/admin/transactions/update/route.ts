import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionStatus, TransactionType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      fromAccountId,
      toAccountId,
      amount,
      type,
      status,
      description,
      createdAt,
    } = body as {
      id: number;
      fromAccountId: number | null;
      toAccountId: number | null;
      amount: number;
      type: TransactionType;
      status: TransactionStatus;
      description: string;
      createdAt: string;
    };

    if (!id || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Dati mancanti o importo non valido" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Transazione non trovata");
      }

      const oldAmount = Number(existing.amount);
      const oldFromId = existing.fromAccountId;
      const oldToId = existing.toAccountId;

      // 1) revert old effect on balances
      if (oldFromId) {
        await tx.account.update({
          where: { id: oldFromId },
          data: { balance: { increment: oldAmount } },
        });
      }
      if (oldToId) {
        await tx.account.update({
          where: { id: oldToId },
          data: { balance: { decrement: oldAmount } },
        });
      }

      // 2) apply new effect
      if (fromAccountId) {
        await tx.account.update({
          where: { id: fromAccountId },
          data: { balance: { decrement: amount } },
        });
      }
      if (toAccountId) {
        await tx.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: amount } },
        });
      }

      // 3) update transaction row
      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          fromAccountId: fromAccountId ?? null,
          toAccountId: toAccountId ?? null,
          amount,
          type,
          status,
          description,
          createdAt: createdAt ? new Date(createdAt) : existing.createdAt,
        },
      });

      return updatedTx;
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("Admin tx update error:", err);
    return NextResponse.json(
      { error: err.message || "Errore durante la modifica" },
      { status: 500 }
    );
  }
}
