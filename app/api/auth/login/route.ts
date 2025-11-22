import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email e password richieste" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.passwordHash !== password) {
    return NextResponse.json(
      { message: "Credenziali non valide" },
      { status: 401 }
    );
  }

  return NextResponse.json({ message: "OK", userId: user.id });
}
