import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type InfoSection = {
  heading: string;
  body: string;
};

type InfoPageConfig = {
  title: string;
  subtitle?: string;
  badge?: string;
  heroImage: string;
  intro?: string;
  sections: InfoSection[];
};

const INFO_PAGES: Record<string, InfoPageConfig> = {
  // ==== HEADER PAGES ====
  imprese: {
    title: "Imprese",
    subtitle: "Soluzioni bancarie e finanziarie per il tuo business.",
    badge: "Per le aziende",
    heroImage: "/images/info/imprese-hero.jpg",
    intro:
      "Gestiamo il tuo conto aziendale, i pagamenti internazionali, il credito e la liquidità con un approccio integrato, digitale e vicino alle esigenze delle imprese.",
    sections: [
      {
        heading: "Conti e operatività",
        body: "Conti correnti dedicati alle imprese con operatività online completa, carte aziendali e strumenti per la gestione quotidiana dei pagamenti e degli incassi.",
      },
      {
        heading: "Finanziamenti e sviluppo",
        body: "Linee di credito per investimenti, anticipi fatture, soluzioni per sostenere la crescita e la gestione del capitale circolante.",
      },
      {
        heading: "International & trade",
        body: "Supporto nell’export e nell’import, lettere di credito, servizi di trade finance e consulenza dedicata per operare in sicurezza sui mercati esteri.",
      },
    ],
  },

  "chi-siamo": {
    title: "Chi siamo",
    subtitle:
      "Un partner bancario affidabile, vicino ai clienti e ai territori.",
    badge: "Il Gruppo",
    heroImage: "/images/info/chi-siamo-hero.jpg",
    intro:
      "UniCredit è un Gruppo bancario paneuropeo con una forte presenza in Italia. Ci impegniamo ogni giorno per offrire soluzioni semplici, trasparenti e innovative, mettendo al centro le persone.",
    sections: [
      {
        heading: "La nostra missione",
        body: "Mettere a disposizione dei nostri clienti gli strumenti finanziari migliori per realizzare progetti di vita e di business, con responsabilità e visione di lungo periodo.",
      },
      {
        heading: "Presenza sul territorio",
        body: "Una rete capillare di filiali, consulenti dedicati e canali digitali sempre disponibili, per garantire un’assistenza continua e personalizzata.",
      },
      {
        heading: "Sostenibilità e sociale",
        body: "Iniziative concrete a supporto di famiglie, imprese, terzo settore e comunità locali, con programmi di educazione finanziaria e progetti di solidarietà.",
      },
    ],
  },

  "contatti-filiali": {
    title: "Contatti e Filiali",
    subtitle:
      "Trova la Filiale più vicina o contattaci attraverso i nostri canali.",
    badge: "Assistenza",
    heroImage: "/images/info/contatti-filiali-hero.jpg",
    intro:
      "Puoi prenotare un appuntamento in Filiale, contattare il nostro Servizio Clienti o utilizzare i canali digitali per ricevere supporto rapido e dedicato.",
    sections: [
      {
        heading: "Prenota un appuntamento",
        body: "Scegli giorno, orario e Filiale a te più vicina. Un consulente dedicato ti assisterà per conto, mutuo, prestito, investimenti o altri servizi.",
      },
      {
        heading: "Servizio Clienti",
        body: "I nostri operatori sono disponibili tramite numero verde, dall’estero e tramite canali digitali per risolvere dubbi e richieste operative.",
      },
      {
        heading: "Filiali e ATM",
        body: "Una rete diffusa di sportelli e ATM evoluti per versamenti, prelievi e operazioni di base disponibili 24/7.",
      },
    ],
  },

  cerca: {
    title: "Cerca",
    subtitle: "Trova rapidamente prodotti, servizi e informazioni.",
    badge: "Strumenti digitali",
    heroImage: "/images/info/cerca-hero.jpg",
    intro:
      "La funzione di ricerca online ti aiuta a individuare velocemente prodotti, documenti informativi, numeri utili e contenuti di approfondimento.",
    sections: [
      {
        heading: "Ricerca prodotti",
        body: "Conti, carte, prestiti, mutui, assicurazioni e soluzioni di investimento filtrabili per esigenze e obiettivi.",
      },
      {
        heading: "Documenti e trasparenza",
        body: "Accessi rapidi a fogli informativi, condizioni economiche, normative e documentazione di trasparenza.",
      },
      {
        heading: "Supporto e assistenza",
        body: "Collegamenti diretti alle sezioni di aiuto, FAQ, contatti e percorsi guidati per rispondere alle domande più frequenti.",
      },
    ],
  },

  "numero-verde": {
    title: "Numero verde",
    subtitle: "Supporto telefonico dedicato per privati e imprese.",
    badge: "Servizio Clienti",
    heroImage: "/images/info/numero-verde-hero.jpg",
    intro:
      "Puoi contattarci gratuitamente da telefono fisso e cellulare tramite il numero verde, oppure dall’estero con numeri dedicati.",
    sections: [
      {
        heading: "Assistenza operativa",
        body: "Informazioni su conti, carte, operazioni online, bonifici, addebiti e servizi digitali.",
      },
      {
        heading: "Sicurezza e antifrode",
        body: "Segnalazione di operazioni sospette, blocco carte, phishing e supporto in caso di tentativi di frode.",
      },
      {
        heading: "Supporto specialistico",
        body: "Linee dedicate per imprese e clienti con esigenze specifiche, con possibile instradamento verso consulenti o Filiali.",
      },
    ],
  },

  // ==== SIDEBAR PAGES ====
  "conti-correnti": {
    title: "Conti correnti",
    subtitle: "Soluzioni per la gestione quotidiana del tuo denaro.",
    badge: "Prodotti per privati",
    heroImage: "/images/info/conti-correnti-hero.jpg",
    intro:
      "Conti correnti online e tradizionali con canone azzerabile, operatività digitale completa e servizi collegati per semplificare la vita di tutti i giorni.",
    sections: [
      {
        heading: "Operazioni illimitate",
        body: "Bonifici, addebiti diretti, pagamenti ricorrenti e ricariche eseguibili da app, Internet Banking o in Filiale.",
      },
      {
        heading: "Canone flessibile",
        body: "Soluzioni con canone ridotto o azzerabile al verificarsi di determinate condizioni, come l’accredito di stipendio o pensione.",
      },
      {
        heading: "Strumenti collegati",
        body: "Carte di debito, notifiche in tempo reale, estratti conto digitali e funzioni di categorizzazione delle spese.",
      },
    ],
  },

  carte: {
    title: "Carte",
    subtitle: "Carte di debito, credito e prepagate per ogni esigenza.",
    badge: "Pagamenti",
    heroImage: "/images/info/carte-hero.jpg",
    intro:
      "Un’ampia gamma di carte per acquisti online e in negozio, con elevati standard di sicurezza e controllo via app.",
    sections: [
      {
        heading: "Carte di debito",
        body: "Collegate al tuo conto, per prelievi e pagamenti in Italia e all’estero, con controllo in tempo reale dei movimenti.",
      },
      {
        heading: "Carte di credito",
        body: "Soluzioni a saldo o rateali, plafond personalizzabile e servizi aggiuntivi di protezione acquisti.",
      },
      {
        heading: "Carte prepagate",
        body: "Ideali per online e viaggi, con ricarica semplice, IBAN dedicato e gestione da app.",
      },
    ],
  },

  prestiti: {
    title: "Prestiti",
    subtitle: "Finanziamenti personali per realizzare i tuoi progetti.",
    badge: "Credito al consumo",
    heroImage: "/images/info/prestiti-hero.jpg",
    intro:
      "Prestiti personali flessibili, con importi e durate modulabili, per affrontare esigenze di spesa o nuovi progetti.",
    sections: [
      {
        heading: "Nuova liquidità",
        body: "Finanziamenti per gestire spese impreviste, progetti personali o acquisti importanti.",
      },
      {
        heading: "Consolidamento",
        body: "Possibilità di riunire più prestiti in una sola rata mensile, semplificando la gestione del debito.",
      },
      {
        heading: "Trasparenza",
        body: "Condizioni chiare, TAEG definito e informazioni complete prima della sottoscrizione.",
      },
    ],
  },

  mutui: {
    title: "Mutui",
    subtitle: "Soluzioni per l’acquisto, la ristrutturazione o la surroga.",
    badge: "Casa",
    heroImage: "/images/info/mutui-hero.jpg",
    intro:
      "Mutui a tasso fisso, variabile o misto, accompagnati dalla consulenza di specialisti dedicati.",
    sections: [
      {
        heading: "Acquisto casa",
        body: "Finanziamenti per la prima o seconda casa, con piani di rimborso differenziati.",
      },
      {
        heading: "Ristrutturazione",
        body: "Mutui e prestiti finalizzati per valorizzare il tuo immobile con interventi di ristrutturazione.",
      },
      {
        heading: "Surroga",
        body: "Trasferisci il tuo mutuo in UniCredit per ottenere condizioni potenzialmente più vantaggiose.",
      },
    ],
  },

  "investimenti-risparmio": {
    title: "Investimenti e risparmio",
    subtitle: "Soluzioni per far crescere e proteggere il tuo patrimonio.",
    badge: "Risparmio gestito",
    heroImage: "/images/info/investimenti-risparmio-hero.jpg",
    intro:
      "Servizi di consulenza, piani di accumulo, fondi, obbligazioni e altre soluzioni per obiettivi a breve, medio e lungo termine.",
    sections: [
      {
        heading: "Piani di risparmio",
        body: "Versamenti periodici per costruire nel tempo un capitale destinato a progetti futuri.",
      },
      {
        heading: "Soluzioni di investimento",
        body: "Fondi, gestioni patrimoniali e altre proposte calibrate sul tuo profilo di rischio.",
      },
      {
        heading: "Consulenza dedicata",
        body: "Consulenti qualificati per la costruzione e revisione del tuo portafoglio.",
      },
    ],
  },

  assicurazioni: {
    title: "Assicurazioni",
    subtitle: "Protezione per persone, beni, casa e futuro.",
    badge: "Protezione",
    heroImage: "/images/info/assicurazioni-hero.jpg",
    intro:
      "Coperture che ti aiutano a proteggere la tua famiglia, il tuo patrimonio e la tua serenità nel tempo.",
    sections: [
      {
        heading: "Persone e famiglia",
        body: "Soluzioni per tutelare salute, reddito e stabilità economica in caso di imprevisti.",
      },
      {
        heading: "Casa e beni",
        body: "Polizze per abitazione, contenuto e responsabilità civile verso terzi.",
      },
      {
        heading: "Soluzioni vita e previdenza",
        body: "Prodotti che integrano la protezione con obiettivi di risparmio e previdenza complementare.",
      },
    ],
  },

  "servizi-digitali": {
    title: "Servizi digitali",
    subtitle: "La tua banca sempre con te, via app e Internet Banking.",
    badge: "Canali digitali",
    heroImage: "/images/info/servizi-digitali-hero.jpg",
    intro:
      "Gestisci conti, carte, investimenti e finanziamenti da smartphone, tablet o PC, in modo semplice e sicuro.",
    sections: [
      {
        heading: "App Mobile Banking",
        body: "Consultazione saldi e movimenti, bonifici, ricariche, notifiche in tempo reale e molto altro.",
      },
      {
        heading: "Internet Banking",
        body: "Funzionalità avanzate per una visione completa dei tuoi rapporti e della tua operatività.",
      },
      {
        heading: "Sicurezza digitale",
        body: "Sistemi di autenticazione evoluti, notifiche e strumenti antifrode per proteggere i tuoi dati.",
      },
    ],
  },

  casa: {
    title: "Casa",
    subtitle: "Mutui, assicurazioni e servizi collegati alla tua abitazione.",
    badge: "La tua casa",
    heroImage: "/images/info/casa-hero.jpg",
    intro:
      "Soluzioni integrate per l’acquisto, la protezione e la valorizzazione della tua casa.",
    sections: [
      {
        heading: "Acquisto e ristrutturazione",
        body: "Mutui, prestiti e consulenza per l’acquisto o la ristrutturazione del tuo immobile.",
      },
      {
        heading: "Protezione casa",
        body: "Polizze per danni all’abitazione, contenuto e responsabilità civile.",
      },
      {
        heading: "Servizi collegati",
        body: "Collaborazioni e servizi aggiuntivi per accompagnarti nelle principali fasi del percorso casa.",
      },
    ],
  },
};

export default function InfoPage({ params }: { params: { slug: string } }) {
  const page = INFO_PAGES[params.slug];

  if (!page) {
    return notFound();
  }

  return (
    <div className="pb-12">
      <div className="uc-container pt-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-neutral-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span className="text-neutral-300">Info</span>
          <span className="mx-1">/</span>
          <span className="text-neutral-100">{page.title}</span>
        </nav>

        {/* HERO */}
        <section className="grid gap-8 rounded-xl bg-[#f5f5f5] p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:p-10">
          <div className="space-y-4">
            {page.badge && (
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#007a91]">
                {page.badge}
              </span>
            )}
            <h1 className="text-[30px] lg:text-[38px] font-semibold text-[#262626]">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-[18px] text-[#262626]">{page.subtitle}</p>
            )}
            {page.intro && (
              <p className="text-[15px] text-neutral-700 leading-relaxed">
                {page.intro}
              </p>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/info/contatti-filiali"
                className="inline-flex items-center justify-center rounded-md bg-[#007a91] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-cyan-800 transition-colors"
              >
                Prenota un appuntamento
              </Link>
              <Link
                href="/info/servizi-digitali"
                className="inline-flex items-center justify-center rounded-md border border-[#007a91] px-4 py-2.5 text-[14px] font-semibold text-[#007a91] hover:bg-cyan-50 transition-colors"
              >
                Scopri i servizi digitali
              </Link>
            </div>
          </div>

          <div className="relative h-[220px] w-full overflow-hidden rounded-xl bg-neutral-200 lg:h-[260px]">
            <Image
              src={page.heroImage}
              alt={page.title}
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* SECTIONS */}
        <section className="mt-10 grid gap-8 lg:grid-cols-3">
          {page.sections.map((section) => (
            <div
              key={section.heading}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <h2 className="mb-2 text-[18px] font-semibold text-[#262626]">
                {section.heading}
              </h2>
              <p className="text-[14px] leading-relaxed text-neutral-700">
                {section.body}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
