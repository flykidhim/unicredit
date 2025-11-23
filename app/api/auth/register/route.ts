// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function generateIban() {
  // Simple fake IBAN generator – looks realistic enough
  const bankPart = "02008"; // fake bank code
  const branchPart = "01633"; // fake branch code
  const accountPart = String(
    Math.floor(10_000_000 + Math.random() * 89_999_999)
  ).padStart(11, "0");
  return `IT60X${bankPart}${branchPart}0${accountPart}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      password,
      dateOfBirth, // "YYYY-MM-DD"
      profileImageUrl,
    } = body || {};

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Tutti i campi obbligatori devono essere compilati." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Questa email è già registrata." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const dobDate =
      dateOfBirth && typeof dateOfBirth === "string" && dateOfBirth.length > 0
        ? new Date(dateOfBirth)
        : null;

    await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        status: "ACTIVE",
        dateOfBirth: dobDate,
        profileImageUrl: profileImageUrl || null,
        accounts: {
          create: {
            name: "Conto Genius",
            type: "CURRENT",
            iban: generateIban(),
            balance: 0,
            currency: "EUR",
          },
        },
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Errore durante la registrazione. Riprova più tardi." },
      { status: 500 }
    );
  }
}
