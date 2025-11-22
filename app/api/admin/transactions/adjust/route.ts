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
    const { accountId, amount, direction, description } = body as {
      accountId: number;
      amount: number;
      direction: "CREDIT" | "DEBIT";
      description?: string;
    };

    if (!accountId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Dati mancanti o importo non valido" },
        { status: 400 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
    });

    const result = await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new Error("Conto non trovato");
      }

      if (direction === "DEBIT") {
        const current = Number(account.balance);
        if (current < amount) {
          throw new Error("Saldo insufficiente per addebito admin");
        }
      }

      if (direction === "CREDIT") {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: amount } },
        });
      } else {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: amount } },
        });
      }

      const transaction = await tx.transaction.create({
        data: {
          fromAccountId: direction === "DEBIT" ? accountId : null,
          toAccountId: direction === "CREDIT" ? accountId : null,
          userId: adminUser ? adminUser.id : null,
          amount,
          type:
            direction === "CREDIT"
              ? TransactionType.DEPOSIT
              : TransactionType.WITHDRAWAL,
          status: TransactionStatus.COMPLETED,
          description:
            description ||
            (direction === "CREDIT"
              ? "Rettifica saldo (accredito admin)"
              : "Rettifica saldo (addebito admin)"),
        },
      });

      return { transaction };
    });

    // Return ISO string for createdAt so the client can use it directly
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
    console.error("Admin adjust error:", err);
    return NextResponse.json(
      { error: err.message || "Errore durante la rettifica" },
      { status: 500 }
    );
  }
}
