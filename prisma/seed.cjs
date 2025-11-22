const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data...");

  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@bank.test",
      fullName: "Admin User",
      passwordHash: "admin123",
      role: "ADMIN"
    }
  });

  const customer = await prisma.user.create({
    data: {
      email: "mario.rossi@example.com",
      fullName: "Mario Rossi",
      passwordHash: "password123",
      role: "CUSTOMER"
    }
  });

  const account1 = await prisma.account.create({
    data: {
      userId: customer.id,
      iban: "IT60X0542811101000000123456",
      label: "Conto Genius",
      type: "CURRENT",
      currency: "EUR",
      balance: 2100330.53
    }
  });

  const account2 = await prisma.account.create({
    data: {
      userId: customer.id,
      iban: "IT60X0542811101000000987654",
      label: "Conto Risparmio",
      type: "SAVINGS",
      currency: "EUR",
      balance: 15000.0
    }
  });

  const txData = [
    {
      accountId: account1.id,
      userId: customer.id,
      type: "DEPOSIT",
      amount: 50,
      description: "Deposito agosto",
      status: "COMPLETED"
    },
    {
      accountId: account1.id,
      userId: customer.id,
      type: "DEPOSIT",
      amount: 100,
      description: "Deposito agosto",
      status: "COMPLETED"
    },
    {
      accountId: account1.id,
      userId: customer.id,
      type: "DEPOSIT",
      amount: 200,
      description: "Deposito agosto",
      status: "COMPLETED"
    },
    {
      accountId: account1.id,
      userId: customer.id,
      type: "DEPOSIT",
      amount: 2100330.53,
      description: "Check deposit – Ref 2025-09-09",
      status: "COMPLETED"
    }
  ];

  await prisma.transaction.createMany({ data: txData });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
