import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id } = body as { id: number };

    if (!id) {
      return NextResponse.json(
        { error: "ID transazione mancante" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Transazione non trovata");
      }

      const amount = Number(existing.amount);

      if (existing.fromAccountId) {
        await tx.account.update({
          where: { id: existing.fromAccountId },
          data: { balance: { increment: amount } },
        });
      }
      if (existing.toAccountId) {
        await tx.account.update({
          where: { id: existing.toAccountId },
          data: { balance: { decrement: amount } },
        });
      }

      await tx.transaction.delete({
        where: { id },
      });
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("Admin tx delete error:", err);
    return NextResponse.json(
      { error: err.message || "Errore durante l'eliminazione" },
      { status: 500 }
    );
  }
}
