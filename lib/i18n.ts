// lib/i18n.ts
export type SupportedLang = "it" | "en";

export const translations = {
  it: {
    common: {
      appName: "UniCredit",
    },
    header: {
      privati: "PRIVATI",
      imprese: "IMPRESE",
      chiSiamo: "CHI SIAMO",
      contatti: "CONTATTI E FILIALI",
      cerca: "CERCA",
      numeroVerde: "NUMERO VERDE",
      apriConto: "APRI IL CONTO",
      accessoClienti: "Accesso Area Clienti",
      languageLabel: "ITA",
    },
    userNav: {
      overview: "Panoramica",
      accounts: "Conti e carte",
      transfers: "Trasferimenti",
      movements: "Movimenti",
      profile: "Profilo",
      admin: "Console Admin",
      logout: "Esci",
    },
    admin: {
      dashboardTitle: "Panoramica amministratore",
      transactionsTitle: "Movimenti (super amministratore)",
      adjustTitle: "Rettifica saldo conto (admin)",
      adjustDescription:
        "Aggiungi o rimuovi fondi da un conto creando una movimentazione di rettifica.",
      transferTitle: "Trasferimento tra conti (admin)",
      transferDescription:
        "Sposta denaro tra due conti qualsiasi, indipendentemente dall'intestatario.",
    },
  },
  en: {
    common: {
      appName: "UniCredit",
    },
    header: {
      privati: "PERSONAL",
      imprese: "BUSINESS",
      chiSiamo: "ABOUT US",
      contatti: "CONTACTS & BRANCHES",
      cerca: "SEARCH",
      numeroVerde: "TOLL-FREE NUMBER",
      apriConto: "OPEN ACCOUNT",
      accessoClienti: "Client Login",
      languageLabel: "EN",
    },
    userNav: {
      overview: "Overview",
      accounts: "Accounts & Cards",
      transfers: "Transfers",
      movements: "Transactions",
      profile: "Profile",
      admin: "Admin Console",
      logout: "Logout",
    },
    admin: {
      dashboardTitle: "Admin overview",
      transactionsTitle: "Transactions (super admin)",
      adjustTitle: "Account balance adjustment (admin)",
      adjustDescription:
        "Add or remove funds on an account by creating an adjustment transaction.",
      transferTitle: "Admin transfer between accounts",
      transferDescription:
        "Move money between any two accounts, regardless of owner.",
    },
  },
} as const;

export type TranslationKeyPath =
  | "header.privati"
  | "header.imprese"
  | "header.chiSiamo"
  | "header.contatti"
  | "header.cerca"
  | "header.numeroVerde"
  | "header.apriConto"
  | "header.accessoClienti"
  | "header.languageLabel"
  | "userNav.overview"
  | "userNav.accounts"
  | "userNav.transfers"
  | "userNav.movements"
  | "userNav.profile"
  | "userNav.admin"
  | "userNav.logout"
  | "admin.dashboardTitle"
  | "admin.transactionsTitle"
  | "admin.adjustTitle"
  | "admin.adjustDescription"
  | "admin.transferTitle"
  | "admin.transferDescription";

export function getNestedTranslation(
  lang: SupportedLang,
  path: TranslationKeyPath
) {
  const parts = path.split(".");
  let current: any = translations[lang];

  for (const part of parts) {
    current = current?.[part];
    if (current === undefined) break;
  }

  return typeof current === "string" ? current : path;
}
