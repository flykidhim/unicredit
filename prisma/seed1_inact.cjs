/* prisma/seed.cjs */

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

  // Order matters because of FK constraints
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Creating users…");

  const adminPasswordHash = await bcrypt.hash("Admin@2025", 10);
  const giuliaPasswordHash = await bcrypt.hash("UniSecure@2025", 10);

  const adminUser = await prisma.user.create({
    data: {
      fullName: "Admin UniCredit Demo",
      email: "admin@unicredit-demo.it",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: "ACTIVE",
    },
  });

  const giulia = await prisma.user.create({
    data: {
      fullName: "Giulia Rossi",
      email: "giulia.rossi@unicredit-demo.it",
      passwordHash: giuliaPasswordHash,
      role: Role.USER,
      status: "ACTIVE",
    },
  });

  console.log("🏦 Creating accounts for Giulia…");

  const contoCorrente = await prisma.account.create({
    data: {
      userId: giulia.id,
      name: "Conto Genius",
      type: AccountType.CURRENT,
      iban: "IT60X0542811101000000123456",
      balance: "2090.65", // EUR
      currency: "EUR",
      status: "ACTIVE",
    },
  });

  const contoRisparmio = await prisma.account.create({
    data: {
      userId: giulia.id,
      name: "Risparmio Flessibile",
      type: AccountType.SAVINGS,
      iban: "IT60X0542811101000000123457",
      balance: "654.35", // EUR
      currency: "EUR",
      status: "ACTIVE",
    },
  });

  const contoDeposito = await prisma.account.create({
    data: {
      userId: giulia.id,
      name: "Deposito Vincolato 12 mesi",
      type: AccountType.VAULT,
      iban: "IT60X0542811101000000123458",
      balance: "10087.50", // EUR
      currency: "EUR",
      status: "ACTIVE",
    },
  });

  console.log("💸 Creating transaction history…");

  // NOTE:
  // - For simplicity we don’t strictly recompute balances from these;
  //   we’ve already set balances above.
  // - Types & descriptions are chosen to look realistic in the UI.
  await prisma.transaction.createMany({
    data: [
      // === Conto Genius (CURRENT) – deposits & payments ===
      {
        fromAccountId: null,
        toAccountId: contoCorrente.id,
        userId: giulia.id,
        amount: "1500.00",
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: "Versamento iniziale sportello",
        createdAt: new Date("2025-07-01T09:15:00Z"),
      },
      {
        fromAccountId: null,
        toAccountId: contoCorrente.id,
        userId: giulia.id,
        amount: "2500.00",
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: "Stipendio ACME Consulting S.r.l.",
        createdAt: new Date("2025-07-27T08:32:00Z"),
      },
      {
        fromAccountId: contoCorrente.id,
        toAccountId: null,
        userId: giulia.id,
        amount: "900.00",
        type: TransactionType.PAYMENT_EXTERNAL,
        status: TransactionStatus.COMPLETED,
        description: "Bonifico affitto – Sig. Bianchi",
        createdAt: new Date("2025-07-28T10:10:00Z"),
      },
      {
        fromAccountId: contoCorrente.id,
        toAccountId: null,
        userId: giulia.id,
        amount: "180.45",
        type: TransactionType.CARD_PAYMENT,
        status: TransactionStatus.COMPLETED,
        description: "Pagamento carta – Supermercato Esselunga",
        createdAt: new Date("2025-07-29T17:42:00Z"),
      },
      {
        fromAccountId: contoCorrente.id,
        toAccountId: null,
        userId: giulia.id,
        amount: "120.30",
        type: TransactionType.CARD_PAYMENT,
        status: TransactionStatus.COMPLETED,
        description: "Acquisto online – Amazon EU",
        createdAt: new Date("2025-07-30T19:12:00Z"),
      },
      {
        fromAccountId: contoCorrente.id,
        toAccountId: null,
        userId: giulia.id,
        amount: "210.70",
        type: TransactionType.PAYMENT_EXTERNAL,
        status: TransactionStatus.COMPLETED,
        description: "Utenze luce e gas – Bolletta luglio",
        createdAt: new Date("2025-08-01T06:50:00Z"),
      },
      {
        fromAccountId: null,
        toAccountId: contoCorrente.id,
        userId: giulia.id,
        amount: "320.00",
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: "Rimborso IRPEF Agenzia delle Entrate",
        createdAt: new Date("2025-08-03T09:05:00Z"),
      },
      {
        fromAccountId: contoCorrente.id,
        toAccountId: null,
        userId: giulia.id,
        amount: "67.90",
        type: TransactionType.CARD_PAYMENT,
        status: TransactionStatus.COMPLETED,
        description: "Ristorante Trattoria Da Mario",
        createdAt: new Date("2025-08-04T20:30:00Z"),
      },
      {
        fromAccountId: contoCorrente.id,
        toAccountId: contoRisparmio.id,
        userId: giulia.id,
        amount: "600.00",
        type: TransactionType.TRANSFER_INTERNAL,
        status: TransactionStatus.COMPLETED,
        description: "Trasferimento automatico verso Risparmio Flessibile",
        createdAt: new Date("2025-08-05T07:30:00Z"),
      },
      {
        fromAccountId: contoCorrente.id,
        toAccountId: null,
        userId: giulia.id,
        amount: "150.00",
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.COMPLETED,
        description: "Prelievo Bancomat UniCredit",
        createdAt: new Date("2025-08-06T11:22:00Z"),
      },
      {
        fromAccountId: contoCorrente.id,
        toAccountId: null,
        userId: giulia.id,
        amount: "3.00",
        type: TransactionType.FEE,
        status: TransactionStatus.COMPLETED,
        description: "Commissione canone mensile conto",
        createdAt: new Date("2025-08-10T00:05:00Z"),
      },

      // === Risparmio Flessibile (SAVINGS) ===
      {
        fromAccountId: contoCorrente.id,
        toAccountId: contoRisparmio.id,
        userId: giulia.id,
        amount: "600.00",
        type: TransactionType.TRANSFER_INTERNAL,
        status: TransactionStatus.COMPLETED,
        description: "Trasferimento da Conto Genius",
        createdAt: new Date("2025-08-05T07:30:10Z"),
      },
      {
        fromAccountId: null,
        toAccountId: contoRisparmio.id,
        userId: giulia.id,
        amount: "300.00",
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: "Piano di accumulo mensile",
        createdAt: new Date("2025-08-15T08:00:00Z"),
      },
      {
        fromAccountId: null,
        toAccountId: contoRisparmio.id,
        userId: giulia.id,
        amount: "4.35",
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: "Interessi lordi trimestrali",
        createdAt: new Date("2025-08-31T23:59:00Z"),
      },
      {
        fromAccountId: contoRisparmio.id,
        toAccountId: null,
        userId: giulia.id,
        amount: "250.00",
        type: TransactionType.TRANSFER_OUT,
        status: TransactionStatus.COMPLETED,
        description: "Bonifico prenotazione viaggio",
        createdAt: new Date("2025-09-02T09:40:00Z"),
      },

      // === Deposito Vincolato (VAULT) ===
      {
        fromAccountId: null,
        toAccountId: contoDeposito.id,
        userId: giulia.id,
        amount: "10000.00",
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: "Attivazione Deposito Vincolato 12 mesi",
        createdAt: new Date("2025-06-15T10:00:00Z"),
      },
      {
        fromAccountId: null,
        toAccountId: contoDeposito.id,
        userId: giulia.id,
        amount: "87.50",
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: "Interessi trimestrali deposito vincolato",
        createdAt: new Date("2025-09-15T10:00:00Z"),
      },
    ],
  });

  console.log("📰 Seeding some content items for static pages…");

  await prisma.contentItem.createMany({
    data: [
      {
        slug: "conti-correnti-overview",
        title_it: "Conti correnti UniCredit",
        title_en: "UniCredit current accounts",
        body_it:
          "Scopri la gamma di conti correnti UniCredit pensati per le esigenze di ogni giorno: operatività online, app mobile, carte di pagamento e servizi digitali evoluti.",
        body_en:
          "Discover UniCredit current accounts designed for everyday needs: online banking, mobile app, payment cards and advanced digital services.",
      },
      {
        slug: "prestiti-personali",
        title_it: "Prestiti personali",
        title_en: "Personal loans",
        body_it:
          "Con i prestiti personali UniCredit puoi finanziare i tuoi progetti, dalla ristrutturazione della casa agli studi, con piani di rimborso flessibili.",
        body_en:
          "With UniCredit personal loans you can finance your projects, from home renovation to studies, with flexible repayment plans.",
      },
      {
        slug: "sicurezza-online",
        title_it: "Sicurezza online",
        title_en: "Online security",
        body_it:
          "Scopri come proteggere le tue credenziali, riconoscere le principali tipologie di frode online e utilizzare in sicurezza i servizi di Internet e Mobile Banking.",
        body_en:
          "Learn how to protect your credentials, recognize the most common online fraud types and safely use Internet and Mobile Banking services.",
      },
    ],
  });

  console.log("✅ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
