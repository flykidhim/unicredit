// app/api/admin/transactions/admin-transfer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionStatus, TransactionType } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminTransferBody = {
  fromAccountId: number | string;
  toAccountId: number | string;
  amount: number | string;
  description?: string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const adminUserId = (session?.user as any)?.id as number | undefined;

    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    let body: AdminTransferBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Payload JSON non valido" },
        { status: 400 }
      );
    }

    const { fromAccountId, toAccountId, amount, description } = body;

    const fromId =
      typeof fromAccountId === "string"
        ? parseInt(fromAccountId, 10)
        : fromAccountId;
    const toId =
      typeof toAccountId === "string" ? parseInt(toAccountId, 10) : toAccountId;

    if (!Number.isFinite(fromId) || !Number.isFinite(toId)) {
      return NextResponse.json(
        { error: "ID conto non valido" },
        { status: 400 }
      );
    }

    const amountNum = typeof amount === "string" ? parseFloat(amount) : amount;

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: "Importo non valido" },
        { status: 400 }
      );
    }

    if (fromId === toId) {
      return NextResponse.json(
        { error: "I conti devono essere diversi" },
        { status: 400 }
      );
    }

    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findUnique({ where: { id: fromId } }),
      prisma.account.findUnique({ where: { id: toId } }),
    ]);

    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { error: "Conto origine o destinazione non trovato" },
        { status: 404 }
      );
    }

    const amountStr = amountNum.toString();
    const baseDescription =
      description && description.trim().length > 0
        ? description.trim()
        : "Trasferimento amministratore";

    const result = await prisma.$transaction(async (tx) => {
      // ✅ Use toNumber() so we compare number vs number (fixes TS error)
      if (fromAccount.balance.toNumber() < amountNum) {
        throw new Error("Saldo insufficiente sul conto di origine");
      }

      // 1. Update balances
      const updatedFrom = await tx.account.update({
        where: { id: fromId },
        data: {
          balance: {
            decrement: amountStr,
          },
        },
      });

      const updatedTo = await tx.account.update({
        where: { id: toId },
        data: {
          balance: {
            increment: amountStr,
          },
        },
      });

      // 2. Create transaction record
      const transferTxn = await tx.transaction.create({
        data: {
          fromAccountId: fromId,
          toAccountId: toId,
          userId: adminUserId ?? null,
          amount: amountStr,
          type: TransactionType.TRANSFER_INTERNAL,
          status: TransactionStatus.COMPLETED,
          description: baseDescription + " (operazione admin)",
        },
      });

      return {
        fromAccount: updatedFrom,
        toAccount: updatedTo,
        transaction: transferTxn,
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Admin internal transfer error", err);
    return NextResponse.json(
      {
        error: "Errore interno durante il trasferimento",
        details: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
