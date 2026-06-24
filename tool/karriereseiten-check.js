/*!
 * Hrmony – Karriereseiten-Check
 * Tool-Logik: Analyzer (Port aus index.ts), URL-Crawl via Supabase Edge Function,
 * HTML-Paste-Fallback, Ergebnis-Rendering, PDF-Report, HubSpot-Tracking, Nav/Anchor.
 *
 * Hosting: GitHub-Repo -> jsDelivr (.min.js), eingebunden via Page Settings (Before </body>).
 *
 * !! VOR DEM UPLOAD INS REPO AUSFUELLEN !!  (Org-Policy: Keys werden nicht im Chat verarbeitet)
 *    SUPABASE_URL       = Projekt-URL, z. B. https://xxxxxxxx.supabase.co
 *    SUPABASE_ANON_KEY  = oeffentlicher anon/publishable Key des Projekts
 */
(function () {
  'use strict';

  /* ============================================================
   * 0) Page-Guard – nur auf der Karriereseiten-Check-Seite laufen
   * ============================================================ */
  var ROOT = document.querySelector('[data-kc-overview-root]');
  if (!ROOT) return;

  /* ============================================================
   * 1) Konfiguration
   * ============================================================ */
  var SUPABASE_URL      = 'PLATZHALTER_SUPABASE_URL';       // <-- eintragen
  var SUPABASE_ANON_KEY = 'PLATZHALTER_SUPABASE_ANON_KEY';  // <-- eintragen
  var FETCH_FUNCTION    = 'fetch-careerpage';
  var NAV_OFFSET        = 96;

  // HubSpot CTA-Redirect (Image-Beacon) – nur Tracking, kein Redirect des Nutzers
  var HUBSPOT_BEACON =
    'https://cta-eu1.hubspot.com/web-interactives/public/v1/track/redirect' +
    '?encryptedPayload=AVxigLKT4uFiDsLxx94iLRSOnKsMjfvn3eF%2B1uhthDVcvvqWKg%2BUpuHX%2FxD3twnYs4PrQ7MVut7hcDaQJAw%2BZbg1avH73arIVb%2BGQpVAOGK%2FFSkUkd1Tux9OKlw5%2Fm9NFOvSg0vJG3W%2FiDsVYMjnRFNS0v1fcLYkep1G' +
    '&webInteractiveContentId=424883268812&portalId=24887369';

  var JSPDF_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

  /* ============================================================
   * 2) Analyzer  (1:1-Port aus index.ts, node-html-parser -> DOMParser)
   * ============================================================ */
  var LABELS = {
    gehaltsangaben:    { label: 'Gehaltsangaben',                category: 'Pflicht' },
    sprache:           { label: 'Diskriminierungsfreie Sprache', category: 'Pflicht' },
    barrierefreiheit:  { label: 'Barrierefreiheit',              category: 'Pflicht' },
    benefits:          { label: 'Benefits-Sichtbarkeit',         category: 'Inhalt' },
    authentizitaet:    { label: 'Authentizität',                 category: 'Inhalt' },
    evp:               { label: 'EVP-Klarheit',                  category: 'Inhalt' },
    mobile:            { label: 'Mobile-Optimierung',            category: 'Technik & UX' },
    ladezeit:          { label: 'Ladezeit',                      category: 'Technik & UX' },
    'structured-data': { label: 'Strukturierte Daten',           category: 'Technik & UX' },
    formular:          { label: 'Formular-Länge',                category: 'Conversion' },
    cta:               { label: 'CTA-Klarheit',                  category: 'Conversion' },
    ansprechperson:    { label: 'Ansprechperson',                category: 'Conversion' }
  };

  function clamp(n, min, max) {
    min = (min == null) ? 0 : min; max = (max == null) ? 10 : max;
    return Math.max(min, Math.min(max, n));
  }
  function statusForScore(s) { return s >= 8 ? 'green' : s >= 4 ? 'yellow' : 'red'; }
  function buildResult(id, score, findings, tips, notApplicable) {
    var L = LABELS[id];
    return {
      id: id, label: L.label, category: L.category, score: score, maxScore: 10,
      status: notApplicable ? 'n/a' : statusForScore(score),
      findings: findings, tips: tips, notApplicable: !!notApplicable
    };
  }
  function parseDoc(html) { return new DOMParser().parseFromString(html, 'text/html'); }
  function qa(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function attr(el, name) { var v = el.getAttribute(name); return v == null ? null : v; }
  function getVisibleText(doc) {
    var clone = doc.cloneNode(true);
    qa(clone, 'script,style,noscript').forEach(function (n) { n.remove(); });
    var t = clone.body ? clone.body.textContent : (clone.textContent || '');
    return t.replace(/\s+/g, ' ').trim();
  }
  function byteKb(str) { return new TextEncoder().encode(str).length / 1024; }

  // ---------- 1. Gehaltsangaben ----------
  function scoreGehaltsangaben(html) {
    var text = html.replace(/\s+/g, ' ');
    var findings = [], tips = [];
    var spannePattern = /\d{2,3}\.?\d{3}\s*(?:bis|-|–|—)\s*\d{2,3}\.?\d{3}\s*(?:€|EUR|Euro)/i;
    var einzelPattern = /\d{2,3}\.?\d{3}\s*(?:€|EUR|Euro)\s*(?:brutto|p\.a\.|pro Jahr|jährlich)?/i;
    var kontextPattern = /(?:Einstiegs|Bruttogehalt|Jahresgehalt|Entgelt)[\w\s]{0,40}\d{2,3}\.?\d{3}/i;
    var vagePattern = /(gehalt nach vereinbarung|marktgerecht|wettbewerbsfähig|attraktive vergütung)/i;
    var score = 0;
    if (spannePattern.test(text)) { score = 10; findings.push('Konkrete Gehaltsspanne in € gefunden.'); }
    else if (einzelPattern.test(text) || kontextPattern.test(text)) { score = 7; findings.push('Eine konkrete Gehaltszahl wurde gefunden, aber keine Spanne.'); }
    else if (vagePattern.test(text)) { score = 2; findings.push('Vage Formulierungen wie „nach Vereinbarung“ oder „marktgerecht“ gefunden.'); }
    else { score = 0; findings.push('Keine Gehaltsangabe gefunden.'); }
    if (score < 10) tips.push('Ab 7. Juni 2026 verlangt die EU-Entgelttransparenzrichtlinie eine konkrete Angabe des Einstiegsgehalts oder einer Bruttogehaltsspanne, etwa „48.000 bis 62.000 € brutto pro Jahr“. Vage Formulierungen wie „nach Vereinbarung“ erfüllen die Anforderung nicht.');
    return buildResult('gehaltsangaben', score, findings, tips);
  }

  // ---------- 2. Diskriminierungsfreie Sprache ----------
  function scoreSprache(html) {
    var text = html.replace(/\s+/g, ' ');
    var findings = [], tips = [];
    var mwdMatches = text.match(/\([mwd]\/[mwd]\/[mwd]\)/gi) || [];
    var doppelMatches = text.match(/\b\w+:innen\b/gi) || [];
    var sternMatches = text.match(/\b\w+\*innen\b/gi) || [];
    var neutralMatches = text.match(/\b(Mitarbeitende|Beschäftigte|Team)\b/gi) || [];
    var jobLikeWords = text.match(/\b[A-ZÄÖÜ][a-zäöüß]+(?:entwickler|manager|leiter|berater|spezialist|techniker)\b/g) || [];
    var hasMwd = mwdMatches.length > 0 || doppelMatches.length > 0 || sternMatches.length > 0;
    var hasNeutral = neutralMatches.length > 0;
    var mwdCoverage = jobLikeWords.length === 0 ? 1 : Math.min(1, mwdMatches.length / Math.max(1, jobLikeWords.length));
    var score = 0;
    if (hasMwd && hasNeutral && mwdCoverage >= 0.6) { score = 10; findings.push('Konsistente m/w/d- bzw. Doppelpunkt-Kennzeichnung und neutrale Begriffe gefunden.'); }
    else if (hasMwd && mwdCoverage >= 0.6) { score = 7; findings.push('Konsistente m/w/d-Kennzeichnung gefunden, neutrale Begriffe fehlen.'); }
    else if (hasMwd) { score = 4; findings.push('Geschlechtsneutrale Kennzeichnung wird inkonsistent verwendet.'); }
    else { score = 1; findings.push('Keine geschlechtsneutrale Kennzeichnung gefunden.'); }
    if (score < 10) tips.push('Ergänzen Sie alle Stellenbezeichnungen mit (m/w/d) oder Doppelpunkt-Schreibweise. Personenbezeichnungen im Fließtext lassen sich oft durch Neutralformen wie „Mitarbeitende“ oder „Team“ ersetzen.');
    return buildResult('sprache', score, findings, tips);
  }

  // ---------- 3. Barrierefreiheit ----------
  function scoreBarrierefreiheit(doc) {
    var findings = [], tips = [];
    var imgs = qa(doc, 'img');
    var imgsWithAlt = imgs.filter(function (i) { return i.getAttribute('alt') !== null; });
    var altRatio = imgs.length === 0 ? 1 : imgsWithAlt.length / imgs.length;
    var hasMain = doc.querySelector('main') !== null || doc.querySelector('article') !== null;
    var h1s = qa(doc, 'h1'), h2s = qa(doc, 'h2');
    var cleanHierarchy = h1s.length >= 1 && h2s.length >= 1 && h1s.length <= 2;
    var ariaCount = qa(doc, 'button,a,input').filter(function (el) {
      return el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    }).length;
    var htmlTag = doc.documentElement;
    var hasLang = !!(htmlTag && htmlTag.getAttribute('lang'));
    var score = 0;
    if (altRatio >= 0.8) { score += 3; findings.push('Alt-Texte vorhanden auf ' + Math.round(altRatio * 100) + ' % der Bilder.'); }
    else if (altRatio >= 0.5) { score += 1; findings.push('Alt-Texte nur teilweise vorhanden (' + Math.round(altRatio * 100) + ' %).'); }
    else if (imgs.length > 0) { findings.push('Nur ' + Math.round(altRatio * 100) + ' % der Bilder haben alt-Texte.'); }
    if (hasMain) { score += 2; findings.push('Semantisches <main>- oder <article>-Landmark vorhanden.'); }
    else { findings.push('Kein <main>- oder <article>-Landmark gefunden.'); }
    if (cleanHierarchy) { score += 2; findings.push('Saubere h1-h2-Hierarchie vorhanden.'); }
    else { findings.push('Heading-Hierarchie ungewöhnlich (h1: ' + h1s.length + ', h2: ' + h2s.length + ').'); }
    if (ariaCount > 5) { score += 2; findings.push('ARIA-Labels auf ' + ariaCount + ' interaktiven Elementen gefunden.'); }
    if (hasLang) { score += 1; findings.push('Sprach-Attribut gesetzt: lang="' + htmlTag.getAttribute('lang') + '".'); }
    else { findings.push('lang-Attribut am <html>-Tag fehlt.'); }
    score = clamp(score);
    if (score < 8) tips.push('Ergänzen Sie fehlende alt-Texte bei Bildern und sorgen Sie für eine saubere Heading-Hierarchie. Eine semantische Struktur mit <main> und logisch verschachtelten <h1>-<h3>-Elementen erleichtert Screenreadern die Navigation und verbessert nebenbei das SEO-Ranking.');
    return buildResult('barrierefreiheit', score, findings, tips);
  }

  // ---------- 4. Benefits-Sichtbarkeit ----------
  var BENEFIT_KEYWORDS = ['essenszuschuss','essensmarken','essen','sachbezug','gutschein','guthabenkarte','jobrad','jobticket','deutschlandticket','mobilitätsbudget','fahrtkostenzuschuss','internetzuschuss','internetpauschale','homeoffice','remote','hybrid','betriebliche altersvorsorge','bav','weiterbildung','fortbildung','schulung','fitness','urban sports','wellpass','gympass','erholungsbeihilfe','urlaubsgeld','geschenke','anlassgeschenke','kita','kinderbetreuung'];
  var GENERIC_BENEFIT_PHRASES = /(attraktive sozialleistungen|vielzahl von benefits|umfangreiche zusatzleistungen)/i;
  function scoreBenefits(html) {
    var text = html.replace(/\s+/g, ' ').toLowerCase();
    var findings = [], tips = [], found = {}, count = 0, quantified = 0;
    for (var k = 0; k < BENEFIT_KEYWORDS.length; k++) {
      var kw = BENEFIT_KEYWORDS[k];
      var idx = text.indexOf(kw);
      if (idx === -1) continue;
      if (!found[kw]) { found[kw] = true; count++; }
      var start = Math.max(0, idx - 100);
      var end = Math.min(text.length, idx + kw.length + 100);
      var win = text.slice(start, end);
      if (/\d{1,4}[\.,]?\d{0,2}\s*€/.test(win) || /\d{1,4}\s*euro/i.test(win)) quantified++;
    }
    var generic = GENERIC_BENEFIT_PHRASES.test(text);
    var score = 0;
    if (count >= 5 && quantified >= 3) score = 10;
    else if (count >= 5) score = 6;
    else if (count >= 2 && quantified >= 1) score = 5;
    else if (count >= 2) score = 3;
    else if (generic) score = 1;
    else score = 0;
    findings.push(count > 0
      ? count + ' Benefits namentlich erwähnt' + (quantified > 0 ? ', davon ' + quantified + ' mit konkretem Betrag' : '') + '.'
      : 'Keine konkreten Benefits namentlich genannt.');
    if (generic && count < 2) findings.push('Nur generische Formulierungen wie „attraktive Sozialleistungen“.');
    if (score < 8) tips.push('Konkret genannte Benefits wirken glaubwürdiger als allgemeine Aussagen. Empfehlung: Nennen Sie Beträge („50 € Sachbezug monatlich“, „4,57 € Essenszuschuss pro Arbeitstag“) und benennen Sie die Bausteine einzeln statt sie in „Sozialleistungen“ zu bündeln.');
    return buildResult('benefits', score, findings, tips);
  }

  // ---------- 5. Authentizität ----------
  var STOCK_DOMAINS = ['shutterstock','istockphoto','unsplash','pexels','gettyimages','adobestock'];
  function scoreAuthentizitaet(doc) {
    var findings = [], tips = [];
    var imgs = qa(doc, 'img');
    var stockHits = imgs.filter(function (i) {
      var src = (i.getAttribute('src') || '').toLowerCase();
      return STOCK_DOMAINS.some(function (d) { return src.indexOf(d) !== -1; });
    }).length;
    var teamImgs = imgs.filter(function (i) {
      var alt = (i.getAttribute('alt') || '').toLowerCase();
      return /(team|mitarbeiter|mitarbeitende|kollege|kollegin)/.test(alt);
    }).length;
    var namePattern = /[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+/;
    var quotesWithName = qa(doc, 'blockquote, figcaption').filter(function (q) { return namePattern.test(q.textContent || ''); }).length;
    var text = doc.body ? doc.body.textContent : '';
    var hasMitarbeiterstimme = /(erfahrungsbericht|mitarbeiterstimme|lerne(n)? sie kennen|lerne kennen)/i.test(text);
    var videoEmbeds = qa(doc, 'iframe').filter(function (i) { return /vimeo\.com|youtube\.com|youtu\.be/.test(i.getAttribute('src') || ''); }).length;
    var positives = 0;
    if (teamImgs >= 1) positives++;
    if (quotesWithName >= 1) positives++;
    if (hasMitarbeiterstimme) positives++;
    if (videoEmbeds >= 1) positives++;
    var score = 0;
    if (positives >= 3 && stockHits === 0) score = 10;
    else if (positives >= 2) score = 7;
    else if (positives === 1) score = 4;
    else score = 1;
    if (stockHits > 0) { score = Math.max(0, score - 2); findings.push(stockHits + ' Bild(er) von Stockfoto-Plattformen erkannt.'); }
    if (teamImgs > 0) findings.push(teamImgs + ' Team-/Mitarbeitenden-Bilder mit aussagekräftigem alt-Text.');
    if (quotesWithName > 0) findings.push(quotesWithName + ' Zitat-Block(s) mit Personennamen.');
    if (videoEmbeds > 0) findings.push(videoEmbeds + ' Video-Embed(s) (vimeo/youtube) gefunden.');
    if (positives === 0) findings.push('Keine Authentizitäts-Signale (Team-Fotos, Zitate, Videos) gefunden.');
    if (score < 8) tips.push('Bewerbende möchten echte Menschen aus Ihrem Unternehmen sehen. Mitarbeitendenstimmen mit Foto und Vorname, kurze Video-Statements oder Team-Einblicke wirken stärker als professionelle Stockaufnahmen.');
    return buildResult('authentizitaet', score, findings, tips);
  }

  // ---------- 6. EVP-Klarheit ----------
  function scoreEvp(doc) {
    var findings = [], tips = [];
    var visibleText = getVisibleText(doc);
    var aboveFold = visibleText.slice(0, 2000);
    var hasTopHeading = !!(doc.querySelector('h1') || doc.querySelector('h2'));
    var hasWertBegriff = /(warum|wir glauben|unsere werte|bei uns|was uns ausmacht|unser versprechen)/i.test(aboveFold);
    var hasAbout = /(als arbeitgeber|über uns|unsere kultur|unser versprechen)/i.test(visibleText);
    var score = 0;
    if (hasTopHeading && hasWertBegriff && hasAbout) score = 10;
    else if (hasTopHeading && hasWertBegriff) score = 7;
    else if (hasAbout) score = 5;
    else if (hasTopHeading) score = 2;
    else score = 0;
    if (hasTopHeading) findings.push('Heading im sichtbaren Bereich vorhanden.');
    if (hasWertBegriff) findings.push('Wert- oder Kultur-Begriffe im Hero-Bereich gefunden.');
    if (hasAbout) findings.push('„Über uns als Arbeitgeber“-Abschnitt erkennbar.');
    if (score === 0) findings.push('Kein erkennbares EVP-Versprechen.');
    if (score < 8) tips.push('Bewerbende suchen nach einem klaren Versprechen, warum sie sich gerade bei Ihnen bewerben sollten. Empfohlen: ein prominenter Satz im Hero-Bereich, der Ihre Kultur und Ihren Anspruch greifbar macht.');
    return buildResult('evp', score, findings, tips);
  }

  // ---------- 7. Mobile-Optimierung ----------
  function scoreMobile(doc) {
    var findings = [], tips = [];
    var viewport = doc.querySelector("meta[name='viewport']");
    var viewportContent = ((viewport && viewport.getAttribute('content')) || '').toLowerCase();
    var hasViewport = viewportContent.indexOf('width=device-width') !== -1;
    var styles = qa(doc, 'style').map(function (s) { return s.textContent; }).join('\n');
    var classNames = qa(doc, '*').map(function (el) { return el.getAttribute('class') || ''; }).join(' ');
    var hasMediaQueries = /@media[^\{]*\(/i.test(styles) || /\b(md:|lg:|sm:|xl:)/.test(classNames);
    var inlineFixedWidth = qa(doc, '*').some(function (el) { return /width\s*:\s*\d{4,}px/i.test(el.getAttribute('style') || ''); });
    var bodyFontMatch = styles.match(/body\s*\{[^}]*font-size\s*:\s*(\d+)\s*px/i);
    var bodyFont = bodyFontMatch ? parseInt(bodyFontMatch[1], 10) : 16;
    var score = 0;
    if (hasViewport) { score += 4; findings.push('Viewport-Meta-Tag mit width=device-width vorhanden.'); }
    else { findings.push('Kein viewport-Meta-Tag mit width=device-width gefunden.'); }
    if (hasMediaQueries) { score += 3; findings.push('Responsive Styles (Media-Queries oder Utility-Klassen) erkannt.'); }
    else { findings.push('Keine Media-Queries oder responsive Utility-Klassen erkannt.'); }
    if (!inlineFixedWidth) { score += 2; findings.push('Keine starren Pixel-Breiten in Inline-Styles.'); }
    if (bodyFont >= 14) { score += 1; findings.push('Body-Schriftgröße ≥ 14 px (gefunden: ' + bodyFont + ' px).'); }
    score = clamp(score);
    if (score < 8) tips.push('Eine mobile Optimierung beginnt mit dem viewport-Meta-Tag und responsiven Layouts. Über 70 % der Bewerbenden besuchen Karriereseiten heute auf dem Smartphone.');
    return buildResult('mobile', score, findings, tips);
  }

  // ---------- 8. Ladezeit (Approximation) ----------
  function scoreLadezeit(html, doc) {
    var findings = [], tips = [];
    var sizeKb = byteKb(html), score = 0;
    if (sizeKb < 200) { score += 3; findings.push('HTML-Größe ' + Math.round(sizeKb) + ' KB (< 200 KB).'); }
    else if (sizeKb < 500) { score += 2; findings.push('HTML-Größe ' + Math.round(sizeKb) + ' KB (200–500 KB).'); }
    else if (sizeKb < 1024) { score += 1; findings.push('HTML-Größe ' + Math.round(sizeKb) + ' KB (500 KB – 1 MB).'); }
    else { findings.push('HTML-Größe ' + Math.round(sizeKb) + ' KB (> 1 MB).'); }
    var externalScripts = qa(doc, 'script[src]').length;
    if (externalScripts < 10) { score += 3; findings.push(externalScripts + ' externe <script>-Tags (< 10).'); }
    else { findings.push(externalScripts + ' externe <script>-Tags (≥ 10).'); }
    var inlineCss = qa(doc, 'style').map(function (s) { return s.textContent; }).join('');
    var inlineCssKb = byteKb(inlineCss);
    if (inlineCssKb < 30) { score += 2; findings.push('Inline-CSS ' + Math.round(inlineCssKb) + ' KB (< 30 KB).'); }
    else { findings.push('Inline-CSS ' + Math.round(inlineCssKb) + ' KB (≥ 30 KB).'); }
    var hasPreload = doc.querySelector("link[rel='preload']") !== null;
    var hasLazy = qa(doc, "img[loading='lazy']").length > 0;
    if (hasPreload || hasLazy) { score += 2; findings.push('preload-Hints oder loading="lazy" auf Bildern erkannt.'); }
    else { findings.push('Kein preload und kein loading="lazy" gefunden.'); }
    score = clamp(score);
    if (score < 8) tips.push('Reduzieren Sie die Anzahl externer Skripte, optimieren Sie Bildgrößen (WebP statt JPG) und nutzen Sie loading="lazy" für Bilder unterhalb des Folds.');
    tips.push('Hinweis: Ladezeit-Score ist eine Schätzung auf Basis der HTML-Struktur. Für eine vollständige Analyse empfehlen wir Google PageSpeed Insights.');
    return buildResult('ladezeit', score, findings, tips);
  }

  // ---------- 9. Strukturierte Daten ----------
  function scoreStructuredData(jsonLd) {
    var findings = [], tips = [], types = {};
    function add(t) { if (typeof t === 'string') types[t] = true; else if (Array.isArray(t)) t.forEach(function (x) { if (typeof x === 'string') types[x] = true; }); }
    function collect(node) {
      if (!node) return;
      if (Array.isArray(node)) { node.forEach(collect); return; }
      if (typeof node === 'object') {
        add(node['@type']);
        if (Array.isArray(node['@graph'])) collect(node['@graph']);
      }
    }
    jsonLd.forEach(collect);
    var score = 0;
    if (types.JobPosting) { score += 6; findings.push('JobPosting-Schema gefunden.'); } else { findings.push('Kein JobPosting-Schema gefunden.'); }
    if (types.Organization) { score += 2; findings.push('Organization-Schema gefunden.'); }
    if (types.BreadcrumbList) { score += 1; findings.push('BreadcrumbList-Schema gefunden.'); }
    if (types.WebPage) { score += 1; findings.push('WebPage-Schema gefunden.'); }
    score = clamp(score);
    if (score < 6) tips.push('JobPosting-Schema-Markup macht Ihre Stellen in Google for Jobs sichtbar und ermöglicht KI-Antwortsystemen, Ihre Stellen direkt zu zitieren. Beispiel-Markup: schema.org/JobPosting.');
    return buildResult('structured-data', score, findings, tips);
  }

  // ---------- 10. Formular-Länge ----------
  function scoreFormular(doc) {
    var findings = [], tips = [];
    var forms = qa(doc, 'form');
    if (forms.length === 0) {
      return buildResult('formular', 0, ['Kein Bewerbungsformular im HTML gefunden (typisch bei zentralen Karriereseiten, die zu Stellenanzeigen verlinken).'], [], true);
    }
    var fields = forms.map(function (f) {
      var inputs = qa(f, 'input').filter(function (i) {
        var t = (i.getAttribute('type') || 'text').toLowerCase();
        return t !== 'hidden' && t !== 'submit' && t !== 'button' && t !== 'image';
      });
      return inputs.length + qa(f, 'select').length + qa(f, 'textarea').length;
    }).reduce(function (a, b) { return Math.max(a, b); }, 0);
    var score = 0;
    if (fields <= 5) score = 10; else if (fields <= 8) score = 7; else if (fields <= 12) score = 4; else score = 1;
    findings.push(fields + ' Eingabefelder im größten Formular (ohne Hidden/Submit).');
    if (score < 8) tips.push('Bewerbungsformulare mit über 8 Pflichtfeldern führen zu Abbruchraten über 50 %. Reduzieren Sie auf Name, E-Mail, Lebenslauf und maximal zwei weitere Felder. Detailangaben können später im Prozess folgen.');
    return buildResult('formular', score, findings, tips);
  }

  // ---------- 11. CTA-Klarheit ----------
  var CTA_PHRASES = ['jetzt bewerben','bewerbung starten','stelle ansehen','zur stellenausschreibung','offene stellen'];
  function scoreCta(html, doc) {
    var findings = [], tips = [];
    var aboveFold = html.slice(0, 5000).toLowerCase();
    var ctaInAboveFold = CTA_PHRASES.some(function (p) { return aboveFold.indexOf(p) !== -1; });
    var ctaButton = qa(doc, 'button, a').some(function (b) {
      var text = (b.textContent || '').toLowerCase();
      var cls = (b.getAttribute('class') || '').toLowerCase();
      var hasPhrase = CTA_PHRASES.some(function (p) { return text.indexOf(p) !== -1; });
      var looksLikeButton = b.tagName === 'BUTTON' || /btn|button/.test(cls);
      return hasPhrase && looksLikeButton;
    });
    var hasInlineColor = qa(doc, '*').some(function (el) { return /#[0-9a-fA-F]{3,6}/.test(el.getAttribute('style') || ''); });
    var score = 0;
    if (ctaInAboveFold) { score += 6; findings.push('Eindeutiger Bewerben-CTA in den ersten 5.000 Zeichen gefunden.'); }
    else { findings.push('Kein eindeutiger Bewerben-CTA above the fold.'); }
    if (ctaButton) { score += 2; findings.push('CTA als Button bzw. mit Button-Styling realisiert.'); }
    if (hasInlineColor) { score += 2; findings.push('Hervorgehobene Inline-Farben deuten auf gestaltete Buttons hin.'); }
    score = clamp(score);
    if (score < 8) tips.push('Ein klarer, kontrastreicher Bewerben-Button in der oberen Bildschirmhälfte verbessert die Klickrate spürbar. Empfohlen: ein prominenter Primärbutton mit eindeutigem Text, nicht „mehr erfahren“ oder „Kontakt“.');
    return buildResult('cta', score, findings, tips);
  }

  // ---------- 12. Ansprechperson ----------
  function scoreAnsprechperson(doc) {
    var findings = [], tips = [];
    var text = doc.body ? doc.body.textContent : '';
    var hasAnsprechHint = /(ihr ansprechpartner|ihre ansprechpartnerin|bei fragen wenden sie sich an|kontakt für bewerbungen)/i.test(text);
    var hasName = /\b[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+\b/.test(text);
    var hasPhone = /(\+?\d[\d\s\-/().]{6,}\d)/.test(text);
    var hasPersonalEmail = /[a-zäöüß]+\.[a-zäöüß]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
    var hasAnonEmail = /(recruiting|jobs|karriere|hr|bewerbung)@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
    var personImg = qa(doc, 'img').some(function (i) {
      var alt = i.getAttribute('alt') || '';
      return /\b[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+\b/.test(alt);
    });
    var hasPersonContext = hasAnsprechHint || hasName;
    var hasDirectContact = hasPhone || hasPersonalEmail;
    var score = 0;
    if (hasPersonContext && personImg && hasDirectContact) score = 10;
    else if (hasPersonContext && hasDirectContact) score = 7;
    else if (hasPersonContext) score = 4;
    else if (hasAnonEmail) score = 2;
    else score = 0;
    if (hasPersonContext) findings.push('Hinweis auf konkrete Ansprechperson gefunden.');
    if (personImg) findings.push('Bild mit Personennamen im alt-Text gefunden.');
    if (hasPersonalEmail) findings.push('Persönliche E-Mail-Adresse (vorname.nachname@) gefunden.');
    if (hasPhone) findings.push('Telefonnummer im Kontaktumfeld gefunden.');
    if (!hasPersonContext && hasAnonEmail) findings.push('Nur anonymes Postfach (z. B. recruiting@) gefunden.');
    if (score === 0) findings.push('Keine Ansprechperson und kein Kontaktweg gefunden.');
    if (score < 8) tips.push('Eine konkrete Ansprechperson mit Foto, Name und Direktkontakt senkt die Hemmschwelle für Bewerbungen messbar. Anonyme recruiting@-Postfächer wirken im B2B-Kontext unpersönlich.');
    return buildResult('ansprechperson', score, findings, tips);
  }

  // ---------- Gesamtanalyse ----------
  function extractJsonLd(doc) {
    var out = [];
    qa(doc, 'script[type="application/ld+json"]').forEach(function (s) {
      try { out.push(JSON.parse(s.textContent)); } catch (e) {}
    });
    return out;
  }
  function analyzeHtml(html, finalUrl) {
    var doc = parseDoc(html);
    var jsonLd = extractJsonLd(doc);
    var criteria = [
      scoreGehaltsangaben(html), scoreSprache(html), scoreBarrierefreiheit(doc),
      scoreBenefits(html), scoreAuthentizitaet(doc), scoreEvp(doc),
      scoreMobile(doc), scoreLadezeit(html, doc), scoreStructuredData(jsonLd),
      scoreFormular(doc), scoreCta(html, doc), scoreAnsprechperson(doc)
    ];
    var applicable = criteria.filter(function (c) { return !c.notApplicable; });
    var totalScore = applicable.reduce(function (s, c) { return s + c.score; }, 0);
    var maxScore = applicable.length * 10;
    var percentage = maxScore === 0 ? 0 : Math.round((totalScore / maxScore) * 100);
    var ampel = 'red';
    if (percentage >= 80) ampel = 'green'; else if (percentage >= 50) ampel = 'yellow';
    return { totalScore: totalScore, maxScore: maxScore, percentage: percentage, ampel: ampel, finalUrl: finalUrl, criteria: criteria };
  }

  /* ============================================================
   * 3) UI-Helfer
   * ============================================================ */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function show(el) { if (el) el.classList.remove('kc-hidden'); }
  function hide(el) { if (el) el.classList.add('kc-hidden'); }
  function setText(el, t) { if (el) el.textContent = t; }

  var AMPEL_COLOR = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444', 'n/a': '#9aa0a6' };
  var AMPEL_TEXT  = { green: 'Sehr gut', yellow: 'Optimierbar', red: 'Dringender Handlungsbedarf' };
  function catKey(cat) {
    if (cat === 'Pflicht') return 'pflicht';
    if (cat === 'Inhalt') return 'inhalt';
    if (cat === 'Technik & UX') return 'technik';
    return 'conversion';
  }

  // Element-Referenzen
  var form        = $('[data-kc-check-form]');
  var urlInput    = $('[data-kc-url]');
  var checkBtn    = $('[data-kc-check-btn]');
  var statusBox   = $('[data-kc-status]');
  var errorBox    = $('[data-kc-error]');
  var errorMsg    = $('[data-kc-error-msg]');
  var pasteWrap   = $('[data-kc-paste]');
  var pasteInput  = $('[data-kc-paste-input]');
  var pasteBtn    = $('[data-kc-paste-btn]');
  var downloadBtn = $('[data-kc-download-btn]');
  var reportHint  = $('[data-kc-report-hint]');
  var burger      = $('[data-kc-burger]');
  var mobileMenu  = $('[data-kc-mobile-menu]');

  var lastResult = null;
  var checkBtnLabel = checkBtn ? checkBtn.textContent : '';

  function setBusy(busy) {
    if (!checkBtn) return;
    checkBtn.style.pointerEvents = busy ? 'none' : '';
    checkBtn.style.opacity = busy ? '0.6' : '';
    checkBtn.textContent = busy ? 'Wird geprüft …' : checkBtnLabel;
  }
  function clearMessages() { hide(statusBox); hide(errorBox); }
  function showError(msg) {
    hide(statusBox);
    setText(errorMsg, msg || '');
    show(errorBox);
    show(pasteWrap); // HTML-Paste-Fallback anbieten
  }
  function normalizeUrl(u) {
    u = (u || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }
  function pushEvent(name, extra) {
    window.dataLayer = window.dataLayer || [];
    var o = { event: name }; if (extra) for (var k in extra) o[k] = extra[k];
    window.dataLayer.push(o);
  }
  function scrollToEl(el) {
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  /* ============================================================
   * 4) Ablauf: URL-Check (Supabase) + HTML-Paste-Fallback
   * ============================================================ */
  function runUrlCheck() {
    var url = normalizeUrl(urlInput ? urlInput.value : '');
    if (!url) { showError('Bitte geben Sie die Adresse Ihrer Karriereseite ein.'); return; }
    if (SUPABASE_URL.indexOf('PLATZHALTER') !== -1) {
      showError('Der URL-Abruf ist noch nicht konfiguriert. Bitte fügen Sie alternativ den HTML-Quellcode unten ein.');
      return;
    }
    clearMessages();
    setText(statusBox, 'Seite wird geladen und analysiert …');
    show(statusBox);
    setBusy(true);
    pushEvent('career_check_started', { method: 'url' });

    fetch(SUPABASE_URL.replace(/\/+$/, '') + '/functions/v1/' + FETCH_FUNCTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ url: url })
    })
      .then(function (r) { return r.json().catch(function () { return null; }); })
      .then(function (data) {
        if (!data || !data.success || !data.html) {
          throw new Error((data && data.error) ? data.error : 'Die Seite konnte nicht geladen werden.');
        }
        onResult(analyzeHtml(data.html, data.finalUrl || url));
      })
      .catch(function (err) {
        showError('Diese Seite ließ sich nicht automatisch laden (' + (err && err.message ? err.message : 'CORS- oder robots-Sperre') + '). Bitte fügen Sie den HTML-Quellcode unten ein.');
      })
      .then(function () { setBusy(false); });
  }

  function runPasteCheck() {
    var html = pasteInput ? pasteInput.value : '';
    if (!html || html.trim().length < 200) {
      showError('Bitte fügen Sie den vollständigen HTML-Quellcode Ihrer Karriereseite ein (Rechtsklick → „Seitenquelltext anzeigen“ → alles kopieren).');
      return;
    }
    clearMessages();
    pushEvent('career_check_started', { method: 'paste' });
    var url = normalizeUrl(urlInput ? urlInput.value : '') || 'Eingefügter HTML-Quellcode';
    onResult(analyzeHtml(html, url));
  }

  function onResult(result) {
    lastResult = result;
    renderOverview(result);
    clearMessages();
    show(ROOT);
    hide(reportHint);
    scrollToEl(ROOT);
  }

  /* ============================================================
   * 5) Ergebnis-Rendering in #score-overview
   * ============================================================ */
  function renderOverview(result) {
    var pct = result.percentage;

    // Donut
    var donutWrap = $('.kc-result-donutwrap', ROOT);
    if (donutWrap) {
      setText($('.kc-donut-num', donutWrap), String(pct));
      var circles = donutWrap.querySelectorAll('circle');
      var progress = circles[circles.length - 1];
      if (progress) {
        var r = parseFloat(progress.getAttribute('r')) || 52;
        var circ = 2 * Math.PI * r;
        progress.setAttribute('stroke-dasharray', (pct / 100 * circ).toFixed(1) + ' ' + circ.toFixed(1));
        progress.setAttribute('stroke', AMPEL_COLOR[result.ampel]);
      }
    }

    // Ampel
    var ampelDot = $('[data-kc-ampel-dot]', ROOT);
    if (ampelDot) ampelDot.style.background = AMPEL_COLOR[result.ampel];
    setText($('[data-kc-ampel-label]', ROOT), AMPEL_TEXT[result.ampel]);

    // URL
    setText($('[data-kc-result-url]', ROOT), result.finalUrl);

    // Kriterien + Cluster-Aggregation
    var agg = { pflicht: { s: 0, m: 0 }, inhalt: { s: 0, m: 0 }, technik: { s: 0, m: 0 }, conversion: { s: 0, m: 0 } };
    result.criteria.forEach(function (c) {
      var critEl = ROOT.querySelector('[data-kc-crit="' + c.id + '"]');
      if (critEl) {
        var dot = $('[data-kc-crit-dot]', critEl);
        if (dot) dot.style.background = c.notApplicable ? AMPEL_COLOR['n/a'] : AMPEL_COLOR[c.status];
        setText($('[data-kc-crit-score]', critEl), c.notApplicable ? 'n/a' : (c.score + '/10'));
      }
      if (!c.notApplicable) {
        var key = catKey(c.category);
        agg[key].s += c.score; agg[key].m += 10;
      }
    });
    Object.keys(agg).forEach(function (key) {
      var clEl = ROOT.querySelector('[data-kc-cluster="' + key + '"]');
      if (!clEl) return;
      setText($('[data-kc-cluster-score]', clEl), agg[key].m > 0 ? (agg[key].s + '/' + agg[key].m) : 'n/a');
    });
  }

  /* ============================================================
   * 6) PDF-Report (jsPDF lazy) + HubSpot-Beacon
   * ============================================================ */
  function san(s) {
    // jsPDF-Standardfont: typografische Sonderzeichen vermeiden
    return String(s)
      .replace(/[„“”]/g, '"').replace(/[‚‘’]/g, "'")
      .replace(/[–—]/g, '-').replace(/…/g, '...')
      .replace(/\u00a0/g, ' ');
  }
  function loadJsPdf() {
    return new Promise(function (resolve, reject) {
      if (window.jspdf && window.jspdf.jsPDF) return resolve(window.jspdf.jsPDF);
      var s = document.createElement('script');
      s.src = JSPDF_SRC;
      s.onload = function () { (window.jspdf && window.jspdf.jsPDF) ? resolve(window.jspdf.jsPDF) : reject(new Error('jsPDF nicht verfügbar')); };
      s.onerror = function () { reject(new Error('jsPDF konnte nicht geladen werden')); };
      document.head.appendChild(s);
    });
  }
  function fireBeacon() {
    try { var img = new Image(); img.src = HUBSPOT_BEACON + '&_=' + Date.now(); } catch (e) {}
    pushEvent('pdf_download', { form_name: 'career_check_pdf' });
  }
  function buildPdf(JsPDF, result) {
    var doc = new JsPDF({ unit: 'mm', format: 'a4' });
    var W = 210, M = 18, maxW = W - M * 2, y = M;
    function ensure(h) { if (y + h > 282) { doc.addPage(); y = M; } }
    function line(txt, size, style, color, gap) {
      doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size || 11);
      doc.setTextColor.apply(doc, color || [38, 41, 46]);
      var lines = doc.splitTextToSize(san(txt), maxW);
      lines.forEach(function (ln) { ensure(size ? size * 0.5 : 6); doc.text(ln, M, y); y += (size || 11) * 0.5; });
      if (gap) y += gap;
    }

    line('Karriereseiten-Check', 22, 'bold'); y += 1;
    line('Report fuer: ' + result.finalUrl, 10, 'normal', [91, 107, 111]);
    line('Erstellt am ' + new Date().toLocaleDateString('de-DE'), 10, 'normal', [91, 107, 111], 4);

    // Score-Box
    ensure(20);
    doc.setFillColor(249, 249, 218); doc.roundedRect(M, y, maxW, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(38, 41, 46);
    doc.text('Gesamtscore: ' + result.totalScore + ' / ' + result.maxScore + '  (' + result.percentage + '%)', M + 5, y + 8);
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text(san('Bewertung: ' + (AMPEL_TEXT[result.ampel] || '')), M + 5, y + 14);
    y += 24;

    var CAT_ORDER = ['Pflicht', 'Inhalt', 'Technik & UX', 'Conversion'];
    CAT_ORDER.forEach(function (cat) {
      var items = result.criteria.filter(function (c) { return c.category === cat; });
      if (!items.length) return;
      ensure(10);
      line(san(cat), 13, 'bold', [31, 138, 130], 1);
      items.forEach(function (c) {
        ensure(8);
        var head = c.label + '  —  ' + (c.notApplicable ? 'n/a' : (c.score + '/10')) +
          (c.notApplicable ? '' : ' (' + (AMPEL_TEXT[c.status] || c.status) + ')');
        line(head, 11, 'bold', [38, 41, 46]);
        (c.findings || []).forEach(function (f) { line('• ' + f, 10, 'normal', [60, 70, 75]); });
        (c.tips || []).forEach(function (t) { line('Tipp: ' + t, 10, 'italic', [120, 90, 30]); });
        y += 2;
      });
      y += 2;
    });

    ensure(16);
    y += 4;
    line('Hrmony GmbH · Karriereseiten-Check', 9, 'bold', [120, 130, 135]);
    line('Automatisierte Standortbestimmung anhand oeffentlich abrufbarer Inhalte. Die rechtlichen Hinweise sind allgemeiner Natur und ersetzen keine arbeits- oder steuerrechtliche Einzelfallberatung.', 8, 'normal', [150, 160, 165]);

    doc.save('karriereseiten-check-report.pdf');
  }
  function downloadPdf() {
    if (!lastResult) { scrollToEl(document.querySelector('#check')); if (urlInput) urlInput.focus(); return; }
    fireBeacon();
    loadJsPdf().then(function (JsPDF) { buildPdf(JsPDF, lastResult); })
      .catch(function () { alert('Der PDF-Report konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'); });
  }

  /* ============================================================
   * 7) Navigation: Burger-Toggle + Anchor-Scroll mit Offset
   * ============================================================ */
  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      mobileMenu.style.display = (mobileMenu.style.display === 'flex') ? 'none' : 'flex';
    });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    // Aktions-Buttons (Check/Paste/Download) nicht abfangen – sie haben eigene Handler
    if (a.hasAttribute('data-kc-check-btn') || a.hasAttribute('data-kc-paste-btn') || a.hasAttribute('data-kc-download-btn')) return;
    var id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault(); e.stopPropagation();
    scrollToEl(target);
    if (mobileMenu) mobileMenu.style.display = 'none';
  }, true);

  /* ============================================================
   * 8) Event-Bindung
   * ============================================================ */
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); runUrlCheck(); });
  if (checkBtn) checkBtn.addEventListener('click', function (e) { e.preventDefault(); runUrlCheck(); });
  if (pasteBtn) pasteBtn.addEventListener('click', function (e) { e.preventDefault(); runPasteCheck(); });
  if (downloadBtn) downloadBtn.addEventListener('click', function (e) { e.preventDefault(); downloadPdf(); });
})();
