// app/api/transactions/transfer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  TransactionType,
  TransactionStatus,
  AccountStatus,
} from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      mode, // "internal" | "external"
      fromAccountId,
      toAccountId,
      externalName,
      externalIban,
      amount,
      description,
    }: {
      mode: "internal" | "external";
      fromAccountId: number;
      toAccountId?: number;
      externalName?: string;
      externalIban?: string;
      amount: number;
      description?: string;
    } = body;

    if (!mode || !fromAccountId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Dati trasferimento non validi" },
        { status: 400 }
      );
    }

    // 1) Conto di origine (deve appartenere all'utente e deve essere ATTIVO)
    const fromAccount = await prisma.account.findFirst({
      where: {
        id: Number(fromAccountId),
        userId: user.id,
      },
    });

    if (!fromAccount) {
      return NextResponse.json(
        { error: "Conto di origine non trovato" },
        { status: 404 }
      );
    }

    if (fromAccount.status !== AccountStatus.ACTIVE) {
      return NextResponse.json(
        { error: "Il conto di origine non è attivo" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    const currentBalance = Number(fromAccount.balance);

    if (numericAmount <= 0) {
      return NextResponse.json(
        { error: "L'importo deve essere maggiore di zero" },
        { status: 400 }
      );
    }

    if (currentBalance < numericAmount) {
      return NextResponse.json(
        { error: "Saldo insufficiente" },
        { status: 400 }
      );
    }

    // =====================================
    //   BONIFICO INTERNO (entre conti utente)
    // =====================================
    if (mode === "internal") {
      if (!toAccountId) {
        return NextResponse.json(
          { error: "Conto di destinazione richiesto" },
          { status: 400 }
        );
      }

      const toAccount = await prisma.account.findFirst({
        where: {
          id: Number(toAccountId),
          userId: user.id, // per ora solo tra conti dello stesso utente
        },
      });

      if (!toAccount) {
        return NextResponse.json(
          { error: "Conto di destinazione non trovato" },
          { status: 404 }
        );
      }

      if (toAccount.id === fromAccount.id) {
        return NextResponse.json(
          { error: "Origine e destinazione non possono coincidere" },
          { status: 400 }
        );
      }

      if (toAccount.status !== AccountStatus.ACTIVE) {
        return NextResponse.json(
          { error: "Il conto di destinazione non è attivo" },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedFrom = await tx.account.update({
          where: { id: fromAccount.id },
          data: {
            balance: currentBalance - numericAmount,
          },
        });

        const updatedTo = await tx.account.update({
          where: { id: toAccount.id },
          data: {
            balance: Number(toAccount.balance) + numericAmount,
          },
        });

        const transferTxn = await tx.transaction.create({
          data: {
            fromAccountId: fromAccount.id,
            toAccountId: toAccount.id,
            userId: user.id,
            amount: numericAmount,
            type: TransactionType.TRANSFER_INTERNAL,
            status: TransactionStatus.COMPLETED,
            description:
              description ||
              `Trasferimento interno da ${fromAccount.name} a ${toAccount.name}`,
          },
        });

        return {
          from: updatedFrom,
          to: updatedTo,
          transaction: transferTxn,
        };
      });

      return NextResponse.json(result, { status: 201 });
    }

    // =====================================
    //   BONIFICO ESTERNO (IBAN esterno)
    // =====================================
    if (mode === "external") {
      if (!externalName || !externalIban) {
        return NextResponse.json(
          { error: "Nome beneficiario e IBAN sono obbligatori" },
          { status: 400 }
        );
      }

      const cleanIban = String(externalIban).replace(/\s+/g, "").toUpperCase();

      const result = await prisma.$transaction(async (tx) => {
        const updatedFrom = await tx.account.update({
          where: { id: fromAccount.id },
          data: {
            balance: currentBalance - numericAmount,
          },
        });

        const paymentTxn = await tx.transaction.create({
          data: {
            fromAccountId: fromAccount.id,
            toAccountId: null,
            userId: user.id,
            amount: numericAmount,
            type: TransactionType.PAYMENT_EXTERNAL,
            status: TransactionStatus.COMPLETED,
            description:
              description ||
              `Bonifico a favore di ${externalName} – IBAN ${cleanIban}`,
          },
        });

        return {
          from: updatedFrom,
          transaction: paymentTxn,
        };
      });

      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json(
      { error: "Modalità di trasferimento non riconosciuta" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Errore trasferimento:", error);
    return NextResponse.json(
      { error: "Errore imprevisto durante il trasferimento" },
      { status: 500 }
    );
  }
}
