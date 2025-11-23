// prisma/seed.cjs

const {
  PrismaClient,
  Role,
  AccountType,
  TransactionType,
  TransactionStatus,
} = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Clearing existing data…");

  // Order matters: transactions -> accounts -> content -> users
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();

  // If ContentItem exists in your schema, clear it too (safe if empty)
  try {
    await prisma.contentItem.deleteMany();
  } catch (err) {
    // If the model doesn't exist for some reason, just ignore
    console.warn("ℹ️ ContentItem model not found or not used, skipping.");
  }

  await prisma.user.deleteMany();

  console.log("👤 Creating customer William Taylor…");

  // Hash the password
  const passwordHash = await bcrypt.hash("Taylor0557@", 10);

  // Create the user (ROLE = USER)
  const william = await prisma.user.create({
    data: {
      fullName: "William Taylor",
      email: "urbanash11@gmail.com",
      passwordHash,
      role: Role.USER,
      status: "ACTIVE",
    },
  });

  console.log("🏦 Creating William's main account…");

  const williamAccount = await prisma.account.create({
    data: {
      userId: william.id,
      name: "Conto Corrente Premium",
      type: AccountType.CURRENT,
      iban: "IT60X0542811101000000999999", // just needs to be unique
      balance: "700837.92", // € 700,837.92
      currency: "EUR",
      status: "ACTIVE",
    },
  });

  console.log("💸 Creating initial deposit transaction…");

  await prisma.transaction.create({
    data: {
      fromAccountId: null,
      toAccountId: williamAccount.id,
      userId: william.id,
      amount: "700837.92",
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      description: "Deposito iniziale conto premium",
      createdAt: new Date("2025-08-20T10:00:00Z"),
    },
  });

  console.log("✅ Seed completed. William Taylor ready with €700,837.92.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
