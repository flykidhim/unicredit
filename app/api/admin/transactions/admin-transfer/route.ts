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
    const { fromAccountId, toAccountId, amount, description } = body as {
      fromAccountId: number;
      toAccountId: number;
      amount: number;
      description?: string;
    };

    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Dati mancanti o importo non valido" },
        { status: 400 }
      );
    }

    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        { error: "Origine e destinazione devono essere diversi" },
        { status: 400 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
    });

    const result = await prisma.$transaction(async (tx) => {
      const [from, to] = await Promise.all([
        tx.account.findUnique({ where: { id: fromAccountId } }),
        tx.account.findUnique({ where: { id: toAccountId } }),
      ]);

      if (!from || !to) {
        throw new Error("Conto di origine o destinazione non trovato");
      }

      const fromBalance = Number(from.balance);
      if (fromBalance < amount) {
        throw new Error("Saldo insufficiente sul conto di origine");
      }

      await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      });
      await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          fromAccountId,
          toAccountId,
          amount,
          type: TransactionType.TRANSFER_INTERNAL,
          status: TransactionStatus.COMPLETED,
          userId: adminUser ? adminUser.id : null,
          description:
            description ||
            `Trasferimento admin da ${from.name} (${fromAccountId}) a ${to.name} (${toAccountId})`,
        },
      });

      return { transaction };
    });

    return NextResponse.json(
      {
        transaction: {
          ...result.transaction,
          createdAt: result.transaction.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Admin transfer error:", err);
    return NextResponse.json(
      { error: err.message || "Errore durante il trasferimento admin" },
      { status: 500 }
    );
  }
}
