/* prisma/seed.cjs */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // 1. HASH PASSWORDS
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const williamPasswordHash = await bcrypt.hash("Taylor0557@", 10);

  // 2. ADMIN USER (simple demo admin)
  const admin = await prisma.user.upsert({
    where: { email: "admin@unicredit-demo.local" },
    update: {}, // keep whatever you already have, just ensure it exists
    create: {
      fullName: "Demo Admin",
      email: "admin@unicredit-demo.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
      // If you added these fields in your schema, uncomment:
      // dateOfBirth: new Date("1980-01-01"),
      // profileImageUrl: "/images/profile/default-admin.png",
    },
  });

  console.log("✅ Admin user upserted:", admin.email);

  // 3. WILLIAM TAYLOR – main demo customer with avatar
  const william = await prisma.user.upsert({
    where: { email: "urbanash11@gmail.com" },
    update: {
      fullName: "William Taylor",
      profileImageUrl: "/images/profile/william-taylor.jpg",
      // If you have dateOfBirth in schema, keep this:
      // otherwise remove it.
      dateOfBirth: new Date("1979-11-05"),
    },
    create: {
      fullName: "William Taylor",
      email: "urbanash11@gmail.com",
      passwordHash: williamPasswordHash,
      role: "USER",
      status: "ACTIVE",
      dateOfBirth: new Date("1979-11-05"),
      profileImageUrl: "/images/profile/william-taylor.jpg",
    },
  });

  console.log("✅ William Taylor upserted:", william.email);

  // 4. WILLIAM’S MAIN ACCOUNT
  //
  // NOTE:
  // - We upsert by IBAN so running the seed multiple times is safe.
  // - Balance is set to 700,837.92 EUR as requested.
  const williamAccount = await prisma.account.upsert({
    where: {
      iban: "IT60X0542811101000000123456", // you can change to whatever you like
    },
    update: {
      userId: william.id,
      balance: 700837.92,
      currency: "EUR",
      name: "Conto Genius",
      type: "CURRENT",
      status: "ACTIVE",
    },
    create: {
      userId: william.id,
      name: "Conto Genius",
      type: "CURRENT",
      iban: "IT60X0542811101000000123456",
      balance: 700837.92,
      currency: "EUR",
      status: "ACTIVE",
    },
  });

  console.log("✅ William’s account upserted:", williamAccount.iban);

  // 5. SOME SAMPLE TRANSACTIONS FOR WILLIAM
  //
  // These are just illustrative; the balance field is not auto-calculated from
  // transactions, so it’s okay if they don’t mathematically sum exactly.
  // Adjust or add more if you want heavier history later.
  const existingWilliamTx = await prisma.transaction.count({
    where: { userId: william.id },
  });

  if (existingWilliamTx === 0) {
    console.log("📈 Seeding sample transactions for William…");

    await prisma.transaction.createMany({
      data: [
        {
          fromAccountId: null,
          toAccountId: williamAccount.id,
          userId: william.id,
          amount: 250000.0,
          type: "DEPOSIT",
          description: "Bonifico stipendio annuale",
          status: "COMPLETED",
          createdAt: new Date("2019-01-10T09:30:00Z"),
        },
        {
          fromAccountId: null,
          toAccountId: williamAccount.id,
          userId: william.id,
          amount: 150000.0,
          type: "DEPOSIT",
          description: "Investimento rientrato",
          status: "COMPLETED",
          createdAt: new Date("2020-03-22T10:45:00Z"),
        },
        {
          fromAccountId: williamAccount.id,
          toAccountId: null,
          userId: william.id,
          amount: 50000.0,
          type: "WITHDRAWAL",
          description: "Acquisto immobiliare",
          status: "COMPLETED",
          createdAt: new Date("2020-06-05T14:10:00Z"),
        },
        {
          fromAccountId: null,
          toAccountId: williamAccount.id,
          userId: william.id,
          amount: 200000.0,
          type: "DEPOSIT",
          description: "Trasferimento da altra banca",
          status: "COMPLETED",
          createdAt: new Date("2021-11-15T11:00:00Z"),
        },
        {
          fromAccountId: williamAccount.id,
          toAccountId: null,
          userId: william.id,
          amount: 30000.0,
          type: "CARD_PAYMENT",
          description: "Spese carta credito",
          status: "COMPLETED",
          createdAt: new Date("2022-02-08T19:45:00Z"),
        },
        {
          fromAccountId: williamAccount.id,
          toAccountId: null,
          userId: william.id,
          amount: 5000.0,
          type: "FEE",
          description: "Canoni e commissioni varie",
          status: "COMPLETED",
          createdAt: new Date("2022-12-20T08:15:00Z"),
        },
      ],
    });

    console.log("✅ Transactions for William seeded.");
  } else {
    console.log(
      `ℹ️ William already has ${existingWilliamTx} transaction(s), skipping transaction seed.`
    );
  }

  console.log("🌱 Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
