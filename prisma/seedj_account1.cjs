// prisma/seed.cjs
/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding: Gregory Austin Reed...");

  // ⚠️ If you don't want to wipe everything, comment these three lines out
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const gregoryPasswordHash = await bcrypt.hash("MylovelydaughterMabel", 10);

  // Create user + main account
  const gregory = await prisma.user.create({
    data: {
      fullName: "Gregory Austin Reed",
      email: "gregoryaustinreed@gmail.com",
      passwordHash: gregoryPasswordHash,
      role: "USER",
      status: "ACTIVE",

      // 👇 Only if you've added this field to your schema:
      // dateOfBirth DateTime?
      dateOfBirth: new Date("1954-07-17T00:00:00.000Z"),

      // 👇 Only if you've added this field to your schema:
      // profileImageUrl String?
      profileImageUrl: "/images/profile/gregory-austin-reed.jpg",

      accounts: {
        create: {
          name: "Conto Premium Private",
          type: "CURRENT",
          iban: "IT60X0200801633000000000070",
          balance: "70000000.00", // 70M – adjust if you like
          currency: "EUR",
          status: "ACTIVE",
        },
      },
    },
    include: {
      accounts: true,
    },
  });

  const mainAccount = gregory.accounts[0];

  console.log("✅ Created user:", {
    id: gregory.id,
    email: gregory.email,
    accountId: mainAccount.id,
  });

  // Credit & debit history 2017–2019
  const txData = [
    // 2017 – major funding & first investments
    {
      userId: gregory.id,
      toAccountId: mainAccount.id,
      fromAccountId: null,
      amount: "25000000.00",
      type: "DEPOSIT",
      description: "Initial portfolio funding – private banking onboarding",
      status: "COMPLETED",
      createdAt: new Date("2017-02-01T10:15:00.000Z"),
    },
    {
      userId: gregory.id,
      toAccountId: mainAccount.id,
      fromAccountId: null,
      amount: "5000000.00",
      type: "DEPOSIT",
      description: "Bonus distribution and accumulated investment proceeds",
      status: "COMPLETED",
      createdAt: new Date("2017-06-15T14:40:00.000Z"),
    },
    {
      userId: gregory.id,
      toAccountId: null,
      fromAccountId: mainAccount.id,
      amount: "1200000.00",
      type: "PAYMENT_EXTERNAL",
      description: "Property acquisition – down payment on residential estate",
      status: "COMPLETED",
      createdAt: new Date("2017-09-30T09:05:00.000Z"),
    },

    // 2018 – business proceeds & large transfers
    {
      userId: gregory.id,
      toAccountId: mainAccount.id,
      fromAccountId: null,
      amount: "8000000.00",
      type: "DEPOSIT",
      description: "Business proceeds – Q4 2017 consolidated earnings",
      status: "COMPLETED",
      createdAt: new Date("2018-01-12T11:20:00.000Z"),
    },
    {
      userId: gregory.id,
      toAccountId: null,
      fromAccountId: mainAccount.id,
      amount: "3500000.00",
      type: "TRANSFER_OUT",
      description: "Transfer to external family trust and wealth structure",
      status: "COMPLETED",
      createdAt: new Date("2018-04-03T16:10:00.000Z"),
    },
    {
      userId: gregory.id,
      toAccountId: null,
      fromAccountId: mainAccount.id,
      amount: "450000.00",
      type: "PAYMENT_EXTERNAL",
      description: "Luxury vehicle purchase – dealer settlement",
      status: "COMPLETED",
      createdAt: new Date("2018-10-19T13:35:00.000Z"),
    },

    // 2019 – asset sale & lifestyle expenses
    {
      userId: gregory.id,
      toAccountId: mainAccount.id,
      fromAccountId: null,
      amount: "15000000.00",
      type: "DEPOSIT",
      description:
        "Liquidity injection from asset sale – portfolio rebalancing",
      status: "COMPLETED",
      createdAt: new Date("2019-03-08T09:50:00.000Z"),
    },
    {
      userId: gregory.id,
      toAccountId: null,
      fromAccountId: mainAccount.id,
      amount: "150000.00",
      type: "CARD_PAYMENT",
      description: "Travel & hospitality – international business itinerary",
      status: "COMPLETED",
      createdAt: new Date("2019-07-25T18:20:00.000Z"),
    },
    {
      userId: gregory.id,
      toAccountId: null,
      fromAccountId: mainAccount.id,
      amount: "2500000.00",
      type: "TRANSFER_OUT",
      description:
        "Transfer to external investment manager – discretionary mandate",
      status: "COMPLETED",
      createdAt: new Date("2019-11-30T12:45:00.000Z"),
    },
  ];

  await prisma.transaction.createMany({
    data: txData,
  });

  console.log(`✅ Inserted ${txData.length} transactions for Gregory.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
