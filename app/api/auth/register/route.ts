// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AccountType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Compila tutti i campi" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Esiste già un utente con questa email" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        // role, status use defaults (USER / ACTIVE)
      },
    });

    // Default CURRENT account for new user
    await prisma.account.create({
      data: {
        userId: user.id,
        name: "Conto Genius",
        type: AccountType.CURRENT,
        iban: `IT60X0542811101${String(user.id).padStart(11, "0")}`,
        balance: 0,
        currency: "EUR",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Errore durante la registrazione" },
      { status: 500 }
    );
  }
}
