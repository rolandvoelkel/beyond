/* Hrmony – Onboarding-Plan-Generator
 * Externes Tool-Script, geladen via jsDelivr (site-weiter Footer-Loader).
 * Seiten-Guard: läuft nur auf der Seite mit [data-ob-gen-root]; sonst inert.
 * Enthält: Generator-Logik, Plan-/Layer-Daten, Zusatzmodule, Output-Rendering,
 *          natives jsPDF, dataLayer-Tracking, HubSpot-Beacon, Anker-Scroll, Burger-Toggle.
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-ob-gen-root]");
  if (!root) return;                 // andere Seiten: nichts tun
  if (window.__obInit) return;       // Doppel-Init verhindern
  window.__obInit = true;

  var NAV_OFFSET = 96;
  var HS_BEACON =
    "https://cta-eu1.hubspot.com/web-interactives/public/v1/track/redirect?encryptedPayload=AVxigLKa8xOJtGOQT9v8HGCb9M%2FvayeWIugtLJfWSOtj5i7JZWrcW7SMm8lv%2FYRdh7VmBPdX6MDwtR6oyuCfGSwfKeTeICjwtqyHso%2B6NdTP%2B%2Feo6RzvW4ouhH6l%2BEAzM7KeeafzYEOrHUnEXqMh7y18jbaJl28xPFlo&webInteractiveContentId=424882917615&portalId=24887369";

  function dl(event, extra) {
    window.dataLayer = window.dataLayer || [];
    var o = { event: event };
    if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) o[k] = extra[k];
    window.dataLayer.push(o);
  }

  /* ---------------------------------------------------------------------- */
  /* 1) PLAN-DATEN                                                          */
  /* ---------------------------------------------------------------------- */

  function basePlan() {
    return {
      p1: {
        range: "Tag 1\u201330", name: "Ankommen",
        title: "Orientierung & Rollenklarheit",
        ziele: [
          "Rollenklarheit: Was wird bis Tag 90 erwartet?",
          "Stakeholder-Map: Wer entscheidet, wer informiert, wer arbeitet zu?",
          "Psychologische Sicherheit aufbauen \u2013 Fragen sind erw\u00fcnscht."
        ],
        meilensteine: [
          "Welcome-Setup vollst\u00e4ndig (Arbeitsplatz, Tools, Zug\u00e4nge) an Tag 1",
          "Erste Hospitation in angrenzendem Team in Woche 2",
          "Schriftliche Erwartungskl\u00e4rung am Ende von Woche 4"
        ],
        gespraeche: [
          "Tag 1: Kennenlern-Gespr\u00e4ch mit F\u00fchrungskraft (45 Min.)",
          "Ende Woche 1: Reflexion erste Eindr\u00fccke + offene Fragen",
          "Ende Woche 4: Erwartungskl\u00e4rung mit Zielbild bis Tag 90"
        ],
        ressourcen: [
          "Onboarding-Reader (Rolle, Team, Tools)",
          "Buddy mit festem w\u00f6chentlichem 30-Min.-Slot",
          "Glossar interner Begriffe & Tool-Landschaft"
        ],
        benefits: [
          "Willkommens-Moment am ersten Tag (sichtbar, pers\u00f6nlich)",
          "Kleine Anerkennung nach abgeschlossener Woche 1"
        ],
        risiken: [
          "Unklare Erwartungen nach Woche 2",
          "Fehlende Tool-Zug\u00e4nge oder kein definierter Buddy",
          "Person wirkt in Meetings durchg\u00e4ngig still"
        ]
      },
      p2: {
        range: "Tag 31\u201360", name: "Verstehen",
        title: "Eigenst\u00e4ndigkeit, erste Quick Wins, Feedback in beide Richtungen",
        ziele: [
          "Erste Aufgaben eigenverantwortlich \u00fcbernehmen",
          "Quick Wins sichtbar machen \u2013 intern wie f\u00fcr Stakeholder",
          "Feedback geben k\u00f6nnen, nicht nur erhalten"
        ],
        meilensteine: [
          "Erstes eigenes (kleineres) Projekt abgeschlossen",
          "Verantwortung f\u00fcr einen wiederkehrenden Prozess \u00fcbernommen",
          "Kontakt zu mindestens drei Stakeholdern au\u00dferhalb des Teams"
        ],
        gespraeche: [
          "Mid-Probezeit-Gespr\u00e4ch mit klarer Standortbestimmung (Tag 45)",
          "W\u00f6chentliches 1:1 mit Leitfaden statt Checkliste"
        ],
        ressourcen: [
          "Feedback-Leitfaden (f\u00fcr beide Seiten)",
          "Templates f\u00fcr Projekt-Briefings und Status-Updates",
          "Zugang zu fachlichen Lerninhalten je nach Rolle"
        ],
        benefits: [
          "Sichtbare Anerkennung f\u00fcr den ersten Quick Win",
          "Geste \u201EHalbzeit Probezeit\u201C \u2013 informell, aber wahrnehmbar"
        ],
        risiken: [
          "R\u00fcckzug aus Meetings oder ausweichende Antworten in 1:1s",
          "Aufgabenstaus, die nicht angesprochen werden",
          "Keine Initiative bei Quick Wins"
        ]
      },
      p3: {
        range: "Tag 61\u201390", name: "Wirken",
        title: "Volle Verantwortung, Eigeninitiative, Ausblick auf Jahr 1",
        ziele: [
          "Volle Rollenverantwortung \u00fcbernehmen",
          "Eigene Themen setzen, nicht nur zugewiesene abarbeiten",
          "Perspektive auf das erste Jahr gemeinsam entwickeln"
        ],
        meilensteine: [
          "Erstes eigenst\u00e4ndiges Projekt-Ergebnis vorgestellt",
          "Ownership f\u00fcr mindestens einen Stakeholder-Kontakt",
          "Entwicklungspfad f\u00fcr Monate 4\u201312 skizziert"
        ],
        gespraeche: [
          "Probezeit-Abschluss als \u00dcbergangsgespr\u00e4ch (nicht als Endpunkt)",
          "Entwicklungs-1:1 mit Ausblick auf Jahr 1"
        ],
        ressourcen: [
          "Entwicklungsplan-Template Jahr 1",
          "Zugang zu interner Mentor:in oder Peer-Group",
          "Marktvergleich der Rolle (Benchmarks)"
        ],
        benefits: [
          "Anerkennung \u201EProbezeit bestanden\u201C \u2013 sichtbar und konkret",
          "Signal f\u00fcr gemeinsamen Entwicklungspfad (z. B. Lern-Budget)"
        ],
        risiken: [
          "Fehlende Eigeninitiative trotz freier Slots",
          "Kein Interesse an der Jahr-1-Perspektive",
          "Person vergleicht offen mit dem Au\u00dfenmarkt"
        ]
      }
    };
  }

  /* Erfahrungs-Anpassungen am Hauptplan */
  function applyExperience(plan, exp) {
    if (exp === "junior") {
      plan.p1.ziele.unshift("Strukturierte Einf\u00fchrung in die Grundlagen der Rolle");
      plan.p2.meilensteine.unshift("Begleitetes Projekt mit erfahrener Sparring-Person");
    } else if (exp === "senior") {
      plan.p2.ziele.unshift("Erste eigene Hypothesen und Verbesserungsvorschl\u00e4ge einbringen");
      plan.p3.meilensteine.unshift("Coaching oder Mentoring f\u00fcr Junior-Kolleg:innen \u00fcbernehmen");
    }
    return plan;
  }

  /* ---------------------------------------------------------------------- */
  /* 2) LAYER (kontextspezifische Bullets je Phase)                         */
  /* ---------------------------------------------------------------------- */

  var LAYERS = {
    experience: {
      junior: {
        label: "Junior",
        p1: [
          "Buddy fest zuweisen, klare Aufgabenpakete mit Lern-Charakter",
          "Erwartung explizit: Fragen stellen ist Aufgabe, nicht Schw\u00e4che",
          "1:1-Rhythmus engmaschiger als Standard (w\u00f6chentlich)"
        ],
        p2: [
          "Erste eigene kleine Aufgaben mit kurzer Feedback-Schleife",
          "Skill-Roadmap im 1:1 sichtbar machen",
          "Lern-Review nach Halbzeit statt klassischem Performance-Talk"
        ],
        p3: [
          "Erstes eigenes Mini-Projekt mit Mentor-Begleitung",
          "Klarer Entwicklungspfad f\u00fcr die ersten 12 Monate",
          "Lernziele statt Performance-Ziele als Probezeit-Abschluss"
        ]
      },
      mid: {
        label: "Mid-Level",
        p1: [
          "Tool- und Prozess-Einarbeitung im Selbststudium, \u201EHow we work\u201C als Anker",
          "Schnelle \u00dcbersicht \u00fcber Schnittstellen, kein Hand-Holding n\u00f6tig",
          "Direkter Einstieg in bestehende Team-Routinen"
        ],
        p2: [
          "Erste eigenst\u00e4ndige Projektverantwortung",
          "Best Practices aus fr\u00fcheren Stationen aktiv einbringen",
          "Erste Verbesserungsvorschl\u00e4ge im 1:1 platzieren"
        ],
        p3: [
          "Volle Rollenverantwortung, klar definierte Outputs",
          "Beitrag zu Team-Themen jenseits der eigenen Rolle",
          "Eigene mittelfristige Roadmap im Probezeit-Gespr\u00e4ch"
        ]
      },
      fuehrung: {
        label: "F\u00fchrung",
        p1: [
          "Stakeholder-Mapping aktiv betreiben, keine Ver\u00e4nderung in den ersten 30 Tagen",
          "1:1s mit jedem direkten Bericht in Woche 1\u20132",
          "Team-Kultur und Entscheidungslogik verstehen, bevor neue Akzente kommen"
        ],
        p2: [
          "Erste Quick Wins mit dem Team abstimmen, nicht setzen",
          "Hidden Politics kartieren: wer entscheidet wirklich, wer blockiert leise",
          "Erwartungen der eigenen F\u00fchrungskraft schriftlich abgleichen"
        ],
        p3: [
          "Eigene Akzente vorsichtig setzen, mit kleinen sichtbaren Entscheidungen beginnen",
          "Mittelfristige Priorit\u00e4ten im Team kommunizieren",
          "Vertrauen sichtbar machen \u2013 \u00fcber R\u00fcckendeckung, nicht \u00fcber Reden"
        ]
      },
      quereinsteiger: {
        label: "Quereinsteiger",
        p1: [
          "L\u00e4ngere Orientierungs-Spanne einplanen, kein Druck zur fr\u00fchen Performance",
          "Fachliche L\u00fccken offen kartieren, gemeinsam mit der F\u00fchrungskraft",
          "Fachliche Bezugsperson neben dem Buddy definieren"
        ],
        p2: [
          "Strukturierter Fachwissen-Aufbau mit klarer Lern-Roadmap",
          "Doppelte Sparring-Frequenz: organisatorisch und fachlich",
          "Erste fachliche Aufgaben im geschützten Rahmen (Vier-Augen-Prinzip)"
        ],
        p3: [
          "Anwendung des Gelernten in echtem Kontext, weiter mit Sparring-Backup",
          "Langsamerer \u00dcbergang zur Vollverantwortung als bei Standard-Profilen",
          "Probezeit-Gespr\u00e4ch mit explizitem Lern-Bilanz-Block"
        ]
      }
    },
    setup: {
      office: {
        label: "Office",
        p1: [
          "Pers\u00f6nliche Vorstellungsrunde am ersten Tag, Office-Tour mit Buddy",
          "Gemeinsames Mittagessen mit dem Team in der ersten Woche",
          "Sichtbarer Welcome-Moment am Arbeitsplatz"
        ],
        p2: [
          "Schulterblick-Lernen nutzen, ungeplante Begegnungen einplanen",
          "Office-Rituale aktiv mitnehmen (Stand-up vor Ort, gemeinsamer Lunch)",
          "Pers\u00f6nlicher Stand-up-Beitrag ab Woche 6"
        ],
        p3: [
          "Sichtbare Pr\u00e4senz im Team etabliert, Arbeitsplatz eingerichtet",
          "Cross-Team-Begegnungen im Office bewusst suchen",
          "Office-Rituale eigenst\u00e4ndig pr\u00e4gen"
        ]
      },
      hybrid: {
        label: "Hybrid",
        p1: [
          "Erste Woche bewusst mehr Office-Anteil f\u00fcr Beziehungsaufbau",
          "Remote-Tage f\u00fcr Self-Onboarding und Dokumentations-Lesen",
          "Klare Anker-Tage im Office mit dem Team abstimmen"
        ],
        p2: [
          "Fixer Office-Tag pro Woche f\u00fcr Team-Sync etabliert",
          "Remote-Tage f\u00fcr Fokus-Arbeit, ohne Erreichbarkeits-Druck",
          "Spiegel-Gespr\u00e4ch zur Hybrid-Routine in Woche 6"
        ],
        p3: [
          "Hybrid-Routine eingespielt, klare Erreichbarkeits-Regeln pro Modus",
          "Sichtbarkeit \u00fcber beide Modi aktiv halten (Updates, Async-Posts)",
          "Eigene Hybrid-Pr\u00e4ferenzen offen ansprechen"
        ]
      },
      remote: {
        label: "Remote",
        p1: [
          "Hardware- und Tool-Setup vor Tag 1 abgeschlossen",
          "Strukturierte virtuelle Kennenlern-Calls mit allen Schnittstellen in Woche 1",
          "Virtueller Buddy mit t\u00e4glichem Check-in in Woche 1, dann ausschleichend"
        ],
        p2: [
          "Engmaschige virtuelle 1:1s, Doku als Lern-Ressource",
          "Sichtbarkeit \u00fcber strukturierte Wochen-Updates (Format vorgeben)",
          "Virtuelles Onboarding-Zwischenfazit in Woche 6"
        ],
        p3: [
          "Virtuelle Sichtbarkeit \u00fcber Updates und Beitr\u00e4ge aufgebaut",
          "Klare Async-Rituale (Status-Updates, Entscheidungs-Dokus)",
          "Wenn m\u00f6glich: ein Vor-Ort-Anker (Quartals-Meeting, Offsite)"
        ]
      }
    },
    size: {
      kmu: {
        label: "KMU",
        p1: ["Vorstellung im gesamten Unternehmen m\u00f6glich, direkter Draht zur Gesch\u00e4ftsleitung"],
        p2: ["Schnellere Eigenverantwortung, weniger Prozess, pragmatische Entscheidungen"],
        p3: ["Strategischer Beitrag fr\u00fcher gefragt, Rollen-Grenzen flexibel halten"]
      },
      mittelstand: {
        label: "Mittelstand",
        p1: ["Vorstellung im Team und bei definierten Schnittstellen, etablierte Onboarding-Strukturen nutzen"],
        p2: ["Erste Cross-Team-Projekte, definierte Prozesse einhalten, Abteilungs-Logik verstehen"],
        p3: ["Eigenen Bereich gestalten, Stakeholder \u00fcber Team-Grenzen hinaus bedienen"]
      },
      konzern: {
        label: "Konzern",
        p1: ["Vollst\u00e4ndige Stakeholder-Map als Pflicht-Output, formale Onboarding-Programme parallel nutzen"],
        p2: ["Politische Verh\u00e4ltnisse verstehen, Eskalationswege lernen, Entscheidungen dokumentieren"],
        p3: ["Beitrag zur Abteilungsstrategie, gezielte interne Sichtbarkeit, Netzwerk \u00fcber Bereiche aufbauen"]
      }
    },
    industry: {
      it_saas: {
        label: "IT/SaaS",
        p1: ["Tech-Stack-Onboarding, Repository- und Ticket-Zugriff, erste Code-Reviews mitlesen"],
        p2: ["Erste eigene Pull-Requests oder Feature-Beitr\u00e4ge, Tech-Schnittstellen aktiv nutzen"],
        p3: ["Eigene Komponente oder Feature in Verantwortung, Beitr\u00e4ge zu Engineering-Ritualen"]
      },
      industrie: {
        label: "Industrie",
        p1: ["Werks- oder Standort-Tour, Sicherheitsunterweisung, Produktionsverst\u00e4ndnis aufbauen"],
        p2: ["Prozesse vor Ort kennen, Schichtkultur respektieren, Compliance-Bezugspersonen klar"],
        p3: ["Optimierungspotenziale strukturiert dokumentieren, abteilungs\u00fcbergreifend einbringen"]
      },
      handel: {
        label: "Handel",
        p1: ["Sortiments- und Produktwissen aufbauen, Kundenkontakt-Logik beobachten, Standort-Realit\u00e4t verstehen"],
        p2: ["Saisonalit\u00e4ten erkennen, operative KPIs lesen lernen, Filial- oder Vertriebsbezug st\u00e4rken"],
        p3: ["Eigene Verantwortung im laufenden Saison-Zyklus, Kunden-Feedback-Schleifen nutzen"]
      },
      dienstleistung: {
        label: "Dienstleistung",
        p1: ["Kundensegmente kennenlernen, Service-Standards verstehen, Tonalit\u00e4t trainieren"],
        p2: ["Erste eigene Kundenkontakte begleitet, Eskalationswege gekl\u00e4rt, Service-Qualit\u00e4t messbar machen"],
        p3: ["Eigene Kundenbeziehungen aufgebaut, Beitrag zur Weiterentwicklung der Service-Standards"]
      }
    }
  };

  var TAG_STYLE = {
    experience: { bg: "#00D47E", fg: "#FFFFFF" },
    setup: { bg: "#A6E3E8", fg: "#0D1F4B" },
    size: { bg: "#F9F9DA", fg: "#0D1F4B" },
    industry: { bg: "#E5E5C8", fg: "#0D1F4B" }
  };

  /* Auswahl -> Layer-Keys (Reihenfolge: experience, setup, size, industry) */
  function resolveLayers(inp) {
    var out = [];
    var expMap = { junior: "junior", mid: "mid", senior: "mid", lead: "fuehrung", "career-change": "quereinsteiger" };
    var sizeMap = { kmu: "kmu", mid: "mittelstand", enterprise: "konzern" };
    if (inp.experience && expMap[inp.experience]) out.push(["experience", expMap[inp.experience]]);
    if (inp.setup && LAYERS.setup[inp.setup]) out.push(["setup", inp.setup]);
    if (inp.size && sizeMap[inp.size]) out.push(["size", sizeMap[inp.size]]);
    if (inp.industry && inp.industry !== "sonstiges" && LAYERS.industry[inp.industry]) out.push(["industry", inp.industry]);
    return out;
  }

  /* ---------------------------------------------------------------------- */
  /* 3) ZUSATZMODULE                                                        */
  /* ---------------------------------------------------------------------- */

  function resolveExtras(inp) {
    var ex = [];
    if (inp.experience === "career-change") {
      ex.push({
        title: "Fachliche Lernpfade (Quereinsteiger)",
        intro: "Zus\u00e4tzlicher, l\u00e4ngerer Aufgleich-Pfad: fachliche Br\u00fccken statt allgemeiner Onboarding-Checklisten.",
        items: [
          "12-Wochen-Lernplan mit Meilensteinen",
          "W\u00f6chentliche Lern-Reviews mit fachlicher Pat:in",
          "Bis zu 4 Wochen Hospitation in angrenzenden Teams",
          "Glossar branchenspezifischer Begriffe",
          "Klares Signal, dass die Aufgleich-Phase Teil des Plans ist"
        ]
      });
    }
    if (inp.setup === "remote" || inp.setup === "hybrid") {
      ex.push({
        title: "Soziale Anbindung (Remote / Hybrid)",
        intro: "Eigene Module f\u00fcr virtuelle Rituale, asynchrone Buddies und gezielte Vor-Ort-Anker.",
        items: [
          "T\u00e4gliches kurzes Team-Check-in in Woche 1\u20132",
          "Asynchroner Buddy mit definierter Antwortzeit",
          "W\u00f6chentliches virtuelles Kaffee-Roulette",
          "Mindestens ein Vor-Ort-Anker in Phase 1",
          "Klare Async-Doku-Standards"
        ]
      });
    }
    if (inp.experience === "lead") {
      ex.push({
        title: "Stakeholder-Mapping (F\u00fchrungsebene)",
        intro: "Einflussreiche Beziehungen sichtbar machen, bevor erste Entscheidungen fallen.",
        items: [
          "Einfluss/Interesse-Matrix in Woche 2",
          "1:1-Runde mit allen direkten Schnittstellen in 30 Tagen",
          "Drei wichtigste interne Sponsor:innen identifizieren",
          "Informelle Entscheidungswege au\u00dferhalb des Org-Charts mappen"
        ]
      });
      ex.push({
        title: "Quick Wins vs. Hidden Politics (F\u00fchrungsebene)",
        intro: "Fr\u00fche Wirkung erzielen, ohne in ungeschriebene Regeln zu treten.",
        items: [
          "Drei Quick-Win-Kandidaten mit Sponsor abstimmen",
          "Keine strukturellen \u00c4nderungen in den ersten 60 Tagen",
          "Beobachtungs-Tagebuch (Tabus, Rituale)",
          "Reverse-Mentoring mit erfahrenen Team-Mitgliedern"
        ]
      });
    }
    return ex;
  }

  /* ---------------------------------------------------------------------- */
  /* 4) ICONS + OUTPUT-CSS                                                  */
  /* ---------------------------------------------------------------------- */

  function svg(p) {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }
  var ICON = {
    sparkles: svg('<path d="M9.94 6.06 9 3l-.94 3.06L5 7l3.06.94L9 11l.94-3.06L13 7z"/><path d="M18 9l-.6 2-2 .6 2 .6.6 2 .6-2 2-.6-2-.6z"/>'),
    compass: svg('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/>'),
    target: svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
    flag: svg('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>'),
    message: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    heart: svg('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>'),
    alert: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
    plus: svg('<path d="M12 5v14"/><path d="M5 12h14"/>'),
    download: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>'),
    refresh: svg('<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>')
  };

  var CARDS = [
    { key: "ziele", label: "Ziele", icon: ICON.target },
    { key: "meilensteine", label: "Meilensteine", icon: ICON.flag },
    { key: "gespraeche", label: "1:1-Gespr\u00e4che", icon: ICON.message },
    { key: "ressourcen", label: "Ressourcen", icon: ICON.book },
    { key: "benefits", label: "Benefit-Touchpoints", icon: ICON.heart, variant: "mint" },
    { key: "risiken", label: "Risiko-Signale", icon: ICON.alert, variant: "warn" }
  ];

  function injectStyles() {
    if (document.getElementById("ob-out-styles")) return;
    var css =
      ".oo{font-family:Poppins,sans-serif;margin-top:8px;}" +
      ".oo-head{margin-bottom:22px;}" +
      ".oo-eyebrow{font-size:.78rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;}" +
      ".oo-headrow{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;}" +
      ".oo-title{font-size:1.5rem;font-weight:700;color:#26292E;margin:0;}" +
      ".oo-actions{display:flex;gap:10px;flex-wrap:wrap;}" +
      ".oo-btn{display:inline-flex;align-items:center;gap:8px;font-family:Poppins,sans-serif;font-size:.95rem;font-weight:600;border-radius:999px;padding:11px 20px;cursor:pointer;border:none;text-decoration:none;}" +
      ".oo-btn svg{width:18px;height:18px;}" +
      ".oo-btn-pdf{background:#BBE7E4;color:#26292E;}.oo-btn-pdf:hover{background:#8FD3CF;}" +
      ".oo-btn-reset{background:transparent;color:#26292E;border:1px solid #D9D9C4;}.oo-btn-reset:hover{background:#F2F2E6;}" +
      ".oo-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}" +
      ".oo-tab{display:inline-flex;align-items:center;gap:8px;font-family:Poppins,sans-serif;font-size:.95rem;font-weight:600;color:#6B7280;background:#FFFFFF;border:1px solid #E2E0D2;border-radius:999px;padding:10px 18px;cursor:pointer;}" +
      ".oo-tab svg{width:18px;height:18px;}" +
      ".oo-tab.is-active{background:#26292E;color:#FFFFFF;border-color:#26292E;}" +
      ".oo-pane{display:none;}.oo-pane.is-active{display:block;}" +
      ".oo-phasehead{font-size:1.15rem;font-weight:700;color:#26292E;margin:0 0 18px;}" +
      ".oo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}" +
      ".oo-card{background:#FCFCF3;border:1px solid #E8E8D4;border-radius:16px;padding:22px;}" +
      ".oo-card-mint{background:rgba(187,231,228,0.30);border-color:#BBE7E4;}" +
      ".oo-card-warn{background:#FBF7E4;border-color:#EBE3C0;}" +
      ".oo-card-h{display:flex;align-items:center;gap:10px;font-size:1rem;font-weight:700;color:#26292E;margin-bottom:12px;}" +
      ".oo-card-h svg{width:20px;height:20px;color:#26292E;}" +
      ".oo-list{margin:0;padding:0;list-style:none;}" +
      ".oo-list li{position:relative;padding-left:18px;font-size:.95rem;line-height:1.55;color:#374151;margin-bottom:8px;}" +
      ".oo-list li:last-child{margin-bottom:0;}" +
      ".oo-list li:before{content:'';position:absolute;left:0;top:9px;width:6px;height:6px;border-radius:999px;background:#9CD8D5;}" +
      ".oo-layerbox{margin-top:18px;background:#F5FBF1;border:1px solid #DCEFD3;border-radius:16px;padding:20px;}" +
      ".oo-layerbox-h{font-size:.95rem;font-weight:700;color:#26292E;margin:0 0 14px;}" +
      ".oo-layer-line{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;font-size:.93rem;line-height:1.5;color:#374151;}" +
      ".oo-layer-line:last-child{margin-bottom:0;}" +
      ".oo-tag{flex-shrink:0;font-size:.72rem;font-weight:700;letter-spacing:.04em;border-radius:999px;padding:3px 10px;white-space:nowrap;}" +
      ".oo-extras{margin-top:24px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}" +
      ".oo-extra{background:#FCFCF3;border:1px solid #E8E8D4;border-radius:16px;padding:22px;}" +
      ".oo-extra-h{font-size:1rem;font-weight:700;color:#26292E;margin:0 0 8px;}" +
      ".oo-extra-intro{font-size:.9rem;line-height:1.55;color:#6B7280;margin:0 0 12px;}" +
      "@media (max-width:767px){.oo-grid{grid-template-columns:1fr;}.oo-extras{grid-template-columns:1fr;}.oo-headrow{flex-direction:column;align-items:flex-start;}.oo-title{font-size:1.3rem;}}";
    var s = document.createElement("style");
    s.id = "ob-out-styles";
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------------------------------------------------------------------- */
  /* 5) OUTPUT-RENDERING                                                    */
  /* ---------------------------------------------------------------------- */

  function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function listHtml(arr) {
    var h = "";
    for (var i = 0; i < arr.length; i++) h += "<li>" + esc(arr[i]) + "</li>";
    return '<ul class="oo-list">' + h + "</ul>";
  }

  function phaseHtml(phase, idx, layers) {
    var cards = "";
    for (var c = 0; c < CARDS.length; c++) {
      var cd = CARDS[c];
      var cls = "oo-card" + (cd.variant === "mint" ? " oo-card-mint" : cd.variant === "warn" ? " oo-card-warn" : "");
      cards += '<div class="' + cls + '"><div class="oo-card-h">' + cd.icon + "<span>" + cd.label + "</span></div>" + listHtml(phase[cd.key]) + "</div>";
    }
    var pk = "p" + (idx + 1);
    var layerLines = "";
    for (var l = 0; l < layers.length; l++) {
      var cat = layers[l][0], key = layers[l][1];
      var def = LAYERS[cat][key];
      var bullets = def[pk] || [];
      var st = TAG_STYLE[cat];
      for (var b = 0; b < bullets.length; b++) {
        layerLines +=
          '<div class="oo-layer-line"><span class="oo-tag" style="background:' + st.bg + ";color:" + st.fg + '">' +
          esc(def.label) + "</span><span>" + esc(bullets[b]) + "</span></div>";
      }
    }
    var layerBox = layerLines
      ? '<div class="oo-layerbox"><div class="oo-layerbox-h">Auf Ihre Auswahl angepasst</div>' + layerLines + "</div>"
      : "";
    return '<div class="oo-pane' + (idx === 0 ? " is-active" : "") + '" data-ob-pane="' + idx +
      '"><h4 class="oo-phasehead">' + esc(phase.title) + "</h4>" +
      '<div class="oo-grid">' + cards + "</div>" + layerBox + "</div>";
  }

  var TAB_ICONS = [ICON.sparkles, ICON.compass, ICON.target];

  function render(plan, inp, layers, extras) {
    injectStyles();
    var phases = [plan.p1, plan.p2, plan.p3];
    var expLabel = layerLabel("experience", inp) || "";
    var setupLabel = LAYERS.setup[inp.setup] ? LAYERS.setup[inp.setup].label : "";
    var titleBits = [inp.role];
    if (expLabel) titleBits.push(expLabel);
    if (setupLabel) titleBits.push(setupLabel);

    var tabs = "";
    for (var t = 0; t < phases.length; t++) {
      tabs += '<button class="oo-tab' + (t === 0 ? " is-active" : "") + '" data-ob-tab="' + t + '">' +
        TAB_ICONS[t] + "<span>" + esc(phases[t].range + " \u00b7 " + phases[t].name) + "</span></button>";
    }
    var panes = "";
    for (var p = 0; p < phases.length; p++) panes += phaseHtml(phases[p], p, layers);

    var extrasHtml = "";
    if (extras.length) {
      var ec = "";
      for (var e = 0; e < extras.length; e++) {
        ec += '<div class="oo-extra"><div class="oo-extra-h">' + esc(extras[e].title) + "</div>" +
          '<div class="oo-extra-intro">' + esc(extras[e].intro) + "</div>" + listHtml(extras[e].items) + "</div>";
      }
      extrasHtml = '<div class="oo-extras">' + ec + "</div>";
    }

    var html =
      '<div class="oo"><div class="oo-head"><div class="oo-eyebrow">Ihr 90-Tage-Plan</div>' +
      '<div class="oo-headrow"><h3 class="oo-title">' + esc(titleBits.join(" \u00b7 ")) + "</h3>" +
      '<div class="oo-actions">' +
      '<button class="oo-btn oo-btn-pdf" data-ob-pdf>' + ICON.download + "<span>Plan als PDF speichern</span></button>" +
      '<button class="oo-btn oo-btn-reset" data-ob-reset>' + ICON.refresh + "<span>Neu erstellen</span></button>" +
      "</div></div></div>" +
      '<div class="oo-tabs">' + tabs + "</div>" +
      '<div class="oo-panes">' + panes + "</div>" + extrasHtml + "</div>";

    var mount = document.querySelector("[data-ob-output]");
    mount.innerHTML = html;
    bindOutput(mount);
  }

  function layerLabel(cat, inp) {
    var expMap = { junior: "junior", mid: "mid", senior: "mid", lead: "fuehrung", "career-change": "quereinsteiger" };
    if (cat === "experience" && inp.experience && expMap[inp.experience]) {
      return LAYERS.experience[expMap[inp.experience]].label;
    }
    return "";
  }

  function bindOutput(mount) {
    var tabs = mount.querySelectorAll("[data-ob-tab]");
    var panes = mount.querySelectorAll("[data-ob-pane]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var idx = tab.getAttribute("data-ob-tab");
        tabs.forEach(function (x) { x.classList.remove("is-active"); });
        panes.forEach(function (x) { x.classList.remove("is-active"); });
        tab.classList.add("is-active");
        var pane = mount.querySelector('[data-ob-pane="' + idx + '"]');
        if (pane) pane.classList.add("is-active");
      });
    });
    var pdfBtn = mount.querySelector("[data-ob-pdf]");
    if (pdfBtn) pdfBtn.addEventListener("click", onPdf);
    var resetBtn = mount.querySelector("[data-ob-reset]");
    if (resetBtn) resetBtn.addEventListener("click", onReset);
  }

  /* ---------------------------------------------------------------------- */
  /* 6) STATE + GENERIERUNG                                                 */
  /* ---------------------------------------------------------------------- */

  var lastInput = null, lastPlan = null, lastLayers = null, lastExtras = null;

  function readInputs() {
    function v(name) {
      var el = root.querySelector('[data-ob-field="' + name + '"]');
      return el ? el.value.trim() : "";
    }
    return { role: v("role"), experience: v("experience"), setup: v("setup"), size: v("size"), industry: v("industry") };
  }

  function isValid(inp) {
    return inp.role.length > 1 && inp.experience !== "" && inp.setup !== "";
  }

  function generate() {
    var inp = readInputs();
    if (!isValid(inp)) return;
    var plan = applyExperience(basePlan(), inp.experience);
    var layers = resolveLayers(inp);
    var extras = resolveExtras(inp);
    lastInput = inp; lastPlan = plan; lastLayers = layers; lastExtras = extras;
    render(plan, inp, layers, extras);
    dl("onboarding_plan_generated", { role: inp.role, experience: inp.experience, setup: inp.setup });
    var out = document.getElementById("plan-output");
    if (out) scrollToEl(out);
  }

  function onReset() {
    ["role", "experience", "setup", "size", "industry"].forEach(function (n) {
      var el = root.querySelector('[data-ob-field="' + n + '"]');
      if (el) el.value = "";
    });
    var opt = root.querySelector("[data-ob-optional]");
    if (opt) opt.style.display = "none";
    var mount = document.querySelector("[data-ob-output]");
    if (mount) mount.innerHTML = "";
    updateSubmit();
    var gen = document.getElementById("generator");
    if (gen) scrollToEl(gen);
  }

  /* Submit-Link (a[data-ob-submit]) zustandsabhängig schalten */
  function updateSubmit() {
    var btn = root.querySelector("[data-ob-submit]");
    if (!btn) return;
    var ok = isValid(readInputs());
    if (ok) {
      btn.removeAttribute("disabled");
      btn.style.opacity = "";
      btn.style.pointerEvents = "";
      btn.style.cursor = "pointer";
    } else {
      btn.setAttribute("disabled", "");
      btn.style.opacity = "0.5";
      btn.style.pointerEvents = "none";
      btn.style.cursor = "not-allowed";
    }
  }

  /* ---------------------------------------------------------------------- */
  /* 7) PDF (nativ, jsPDF lazy)                                             */
  /* ---------------------------------------------------------------------- */

  function loadJsPdf(cb) {
    if (window.jspdf && window.jspdf.jsPDF) { cb(); return; }
    var s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = cb;
    s.onerror = function () { alert("PDF-Bibliothek konnte nicht geladen werden. Bitte erneut versuchen."); };
    document.head.appendChild(s);
  }

  function san(str) {
    return String(str)
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/[\u201E\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019\u201A]/g, "'")
      .replace(/\u2026/g, "...")
      .replace(/\u00b7/g, "-");
  }
  function slug(str) {
    return String(str).toLowerCase()
      .replace(/[\u00e4]/g, "ae").replace(/[\u00f6]/g, "oe").replace(/[\u00fc]/g, "ue").replace(/[\u00df]/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "plan";
  }

  function onPdf() {
    if (!lastPlan) return;
    loadJsPdf(function () { buildPdf(lastPlan, lastInput, lastLayers, lastExtras); });
    dl("onboarding_plan_pdf_download", { role: lastInput.role, experience: lastInput.experience, setup: lastInput.setup });
    try { new Image().src = HS_BEACON; } catch (e) {}
  }

  function buildPdf(plan, inp, layers, extras) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: "mm", format: "a4" });
    var PW = 210, PH = 297, M = 16, CW = PW - M * 2;
    var y = 0;

    function footer() {
      doc.setDrawColor(220); doc.setLineWidth(0.2);
      doc.line(M, PH - 14, PW - M, PH - 14);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(38, 41, 46);
      doc.text("hrmony", M, PH - 9);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120);
      doc.text("hrmony.de - Onboarding-Plan-Generator", PW / 2, PH - 9, { align: "center" });
    }
    function pageNumbers() {
      var n = doc.internal.getNumberOfPages();
      for (var i = 1; i <= n; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120);
        doc.text("Seite " + i + " / " + n, PW - M, PH - 9, { align: "right" });
      }
    }
    function need(h) { if (y + h > PH - 20) { footer(); doc.addPage(); y = M; } }

    /* Kopfband */
    doc.setFillColor(187, 231, 228);
    doc.rect(0, 0, PW, 34, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(38, 41, 46);
    doc.text("90-Tage-Onboarding-Plan", M, 16);
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    var head = [inp.role];
    var el = layerLabel("experience", inp); if (el) head.push(el);
    if (LAYERS.setup[inp.setup]) head.push(LAYERS.setup[inp.setup].label);
    doc.text(san(head.join("  -  ")), M, 25);
    y = 44;

    var CARD_LABELS = [
      ["ziele", "Ziele"], ["meilensteine", "Meilensteine"], ["gespraeche", "1:1-Gespraeche"],
      ["ressourcen", "Ressourcen"], ["benefits", "Benefit-Touchpoints"], ["risiken", "Risiko-Signale"]
    ];
    var phases = [plan.p1, plan.p2, plan.p3];

    for (var pi = 0; pi < phases.length; pi++) {
      var ph = phases[pi];
      need(18);
      doc.setFillColor(245, 251, 241); doc.rect(M, y - 5, CW, 9, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(38, 41, 46);
      doc.text(san(ph.range + " - " + ph.name), M + 2, y + 1);
      y += 10;
      doc.setFontSize(9.5); doc.setFont("helvetica", "italic"); doc.setTextColor(90);
      var tl = doc.splitTextToSize(san(ph.title), CW - 2);
      need(tl.length * 5 + 3);
      doc.text(tl, M + 2, y); y += tl.length * 5 + 3;
      doc.setFont("helvetica", "normal");

      for (var ci = 0; ci < CARD_LABELS.length; ci++) {
        var key = CARD_LABELS[ci][0], lbl = CARD_LABELS[ci][1];
        var arr = ph[key]; if (!arr || !arr.length) continue;
        need(10);
        doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(38, 41, 46);
        doc.text(lbl, M + 2, y); y += 6;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(55, 65, 81);
        for (var ai = 0; ai < arr.length; ai++) {
          var lines = doc.splitTextToSize(san(arr[ai]), CW - 10);
          need(lines.length * 5 + 1);
          doc.text("-", M + 4, y);
          doc.text(lines, M + 8, y);
          y += lines.length * 5 + 1;
        }
        y += 2;
      }

      /* Layer-Bullets der Phase */
      var pk = "p" + (pi + 1);
      var layerLines = [];
      for (var li = 0; li < layers.length; li++) {
        var cat = layers[li][0], lk = layers[li][1], def = LAYERS[cat][lk];
        var bl = def[pk] || [];
        for (var bi = 0; bi < bl.length; bi++) layerLines.push("(" + def.label + ") " + bl[bi]);
      }
      if (layerLines.length) {
        need(8);
        doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(38, 41, 46);
        doc.text("Auf Ihre Auswahl angepasst", M + 2, y); y += 6;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(55, 65, 81);
        for (var ll = 0; ll < layerLines.length; ll++) {
          var lz = doc.splitTextToSize(san(layerLines[ll]), CW - 10);
          need(lz.length * 5 + 1);
          doc.text("-", M + 4, y);
          doc.text(lz, M + 8, y);
          y += lz.length * 5 + 1;
        }
      }
      y += 6;
    }

    /* Zusatzmodule */
    if (extras.length) {
      need(14);
      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(38, 41, 46);
      doc.text("Zusatzmodule", M + 2, y); y += 8;
      for (var xi = 0; xi < extras.length; xi++) {
        var ex = extras[xi];
        need(12);
        doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(38, 41, 46);
        doc.text(san(ex.title), M + 2, y); y += 5.5;
        doc.setFont("helvetica", "italic"); doc.setFontSize(9.5); doc.setTextColor(90);
        var il = doc.splitTextToSize(san(ex.intro), CW - 4);
        need(il.length * 5);
        doc.text(il, M + 2, y); y += il.length * 5 + 1;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(55, 65, 81);
        for (var ii = 0; ii < ex.items.length; ii++) {
          var xz = doc.splitTextToSize(san(ex.items[ii]), CW - 10);
          need(xz.length * 5 + 1);
          doc.text("-", M + 4, y);
          doc.text(xz, M + 8, y);
          y += xz.length * 5 + 1;
        }
        y += 4;
      }
    }

    footer();
    pageNumbers();
    doc.save("onboarding-plan-" + slug(inp.role) + ".pdf");
  }

  /* ---------------------------------------------------------------------- */
  /* 8) SCROLL + NAV + BINDINGS                                             */
  /* ---------------------------------------------------------------------- */

  function scrollToEl(el) {
    var topY = el.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
    window.scrollTo({ top: topY, behavior: "smooth" });
  }

  function closeMobile() {
    var menu = document.querySelector("[data-ob-mobile-menu]");
    if (menu) menu.style.display = "none";
  }

  /* Anker-Scroll mit festem Offset (Capture-Phase, überschreibt Global-Smooth-Scroll) */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href === "#" || href.length < 2) return;
    var target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    if (a.hasAttribute("data-cta")) {
      dl("cta_click", { cta_label: a.getAttribute("data-cta"), cta_location: a.getAttribute("data-event") || "" });
    }
    closeMobile();
    scrollToEl(target);
  }, true);

  function init() {
    /* Feld-Validierung */
    ["role", "experience", "setup"].forEach(function (n) {
      var el = root.querySelector('[data-ob-field="' + n + '"]');
      if (!el) return;
      el.addEventListener("input", updateSubmit);
      el.addEventListener("change", updateSubmit);
    });
    updateSubmit();

    /* Submit */
    var submit = root.querySelector("[data-ob-submit]");
    if (submit) {
      submit.addEventListener("click", function (e) {
        e.preventDefault();
        if (submit.hasAttribute("disabled")) return;
        generate();
      });
    }

    /* Optional-Toggle */
    var toggle = root.querySelector("[data-ob-toggle]");
    var optional = root.querySelector("[data-ob-optional]");
    if (toggle && optional) {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        var open = optional.style.display === "block";
        optional.style.display = open ? "none" : "block";
        toggle.textContent = (open ? "+ " : "\u2013 ") + "Plan verfeinern (optional)";
      });
    }

    /* Burger */
    var burger = document.querySelector("[data-ob-burger]");
    var menu = document.querySelector("[data-ob-mobile-menu]");
    if (burger && menu) {
      burger.addEventListener("click", function () {
        menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
