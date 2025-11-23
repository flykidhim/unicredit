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
      // If you added these fields in your schema, you can uncomment:
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
  // - Upsert by IBAN so running the seed multiple times is safe.
  // - Balance set to 700,837.92 EUR as requested.
  const williamAccount = await prisma.account.upsert({
    where: {
      iban: "IT60X0542811101000000123456", // can be adjusted if needed
    },
    update: {
      userId: william.id,
      balance: 700_837.92,
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
      balance: 700_837.92,
      currency: "EUR",
      status: "ACTIVE",
    },
  });

  console.log("✅ William’s account upserted:", williamAccount.iban);

  // 5. TRANSACTIONS FOR WILLIAM
  //
  // We now WIPE his old transactions and insert the new deposits:
  //
  // - Deposit 100,466.46 on 23/08/2015
  // - Deposit 70,364.64 on 11/02/2016
  // - Deposit 120,463.99 on 09/12/2018
  // - Deposit 150,346.76 on 21/05/2018
  // - Deposit 52,461.45 on 15/09/2018
  // - Deposit 66,000.00 on 27/11/2018
  // - Deposit 140,735.63 on 07/01/2019

  console.log("🧹 Deleting existing transactions for William…");
  await prisma.transaction.deleteMany({
    where: { userId: william.id },
  });

  console.log("📈 Seeding new transactions for William…");

  await prisma.transaction.createMany({
    data: [
      {
        fromAccountId: null,
        toAccountId: williamAccount.id,
        userId: william.id,
        amount: 100_466.46,
        type: "DEPOSIT",
        description: "Deposito stipendio e bonus annuale",
        status: "COMPLETED",
        createdAt: new Date("2015-08-23T09:30:00Z"), // 23/08/2015
      },
      {
        fromAccountId: null,
        toAccountId: williamAccount.id,
        userId: william.id,
        amount: 70_364.64,
        type: "DEPOSIT",
        description: "Deposito risparmi famiglia",
        status: "COMPLETED",
        createdAt: new Date("2016-02-11T10:15:00Z"), // 11/02/2016
      },
      {
        fromAccountId: null,
        toAccountId: williamAccount.id,
        userId: william.id,
        amount: 150_346.76,
        type: "DEPOSIT",
        description: "Bonifico da altra banca – portafoglio investimenti",
        status: "COMPLETED",
        createdAt: new Date("2018-05-21T11:00:00Z"), // 21/05/2018
      },
      {
        fromAccountId: null,
        toAccountId: williamAccount.id,
        userId: william.id,
        amount: 52_461.45,
        type: "DEPOSIT",
        description: "Deposito risparmi personali",
        status: "COMPLETED",
        createdAt: new Date("2018-09-15T15:20:00Z"), // 15/09/2018
      },
      {
        fromAccountId: null,
        toAccountId: williamAccount.id,
        userId: william.id,
        amount: 66_000.0,
        type: "DEPOSIT",
        description: "Trasferimento da conto estero",
        status: "COMPLETED",
        createdAt: new Date("2018-11-27T09:50:00Z"), // 27/11/2018
      },
      {
        fromAccountId: null,
        toAccountId: williamAccount.id,
        userId: william.id,
        amount: 120_463.99,
        type: "DEPOSIT",
        description: "Rientro investimento obbligazionario",
        status: "COMPLETED",
        createdAt: new Date("2018-12-09T13:10:00Z"), // 09/12/2018
      },
      {
        fromAccountId: null,
        toAccountId: williamAccount.id,
        userId: william.id,
        amount: 140_735.63,
        type: "DEPOSIT",
        description: "Bonus straordinario e premi vari",
        status: "COMPLETED",
        createdAt: new Date("2019-01-07T10:30:00Z"), // 07/01/2019
      },
    ],
  });

  console.log("✅ New transactions for William seeded.");

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
