// Genera las páginas estáticas del sitio a partir de profiles.js, guides.js y config.js.
// Uso: node scripts/build.js   (sin dependencias; la salida se publica tal cual en GitHub Pages)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROFILES } from '../src/profiles.js';
import { GUIDES } from '../src/guides.js';
import { SITE } from '../src/config.js';
import { profileField } from '../src/messages.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ICON = {
  shield: '<path d="M12 3 19 6v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
  external: '<path d="M7 17 17 7"/><path d="M9 7h8v8"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
};
export const svg = (name, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;

const T = {
  es: {
    htmlLang: 'es', locale: 'es_ES',
    toolPath: '', guidePath: (slug) => `guias/${slug}/`,
    brand: 'Comprobador de justificación de subvenciones',
    toolTitle: 'Comprobador de justificación de subvenciones para asociaciones y clubes',
    toolDescription: 'Revisa la relación clasificada de gastos de la subvención de tu asociación o club antes de presentarla: fechas, pagos, efectivo, indirectos, duplicados y documentos que faltan. Gratis y sin enviar tus datos.',
    lead: 'Para asociaciones y clubes que justifican una subvención con <strong>cuenta justificativa simplificada</strong>. Revisa la relación de gastos antes de presentarla y descubre lo que falta.',
    privacy: 'Todo se procesa en tu navegador: ningún dato sale de tu ordenador.',
    other: { label: 'Català', title: 'Versió en català' },
    s1: 'Convocatoria', s1q: '¿Qué subvención justificas?',
    s2: 'Datos de la concesión',
    f: { sub: 'Subvención concedida (€)', pres: 'Presupuesto o coste total de la actividad (€)', otros: 'Otros ingresos para la actividad (€)',
      ini: 'Inicio del periodo de gastos', fin: 'Fin del periodo de gastos', finj: 'Último día del plazo de justificación', opt: 'opcional' },
    iva: 'La entidad <strong>deduce el IVA</strong>. Si no lo sabes, deja la casilla sin marcar: la mayoría de asociaciones no lo deducen.',
    s3: 'Relación de gastos',
    s3hint: 'Sube un CSV o un Excel, o copia la tabla en Excel y pégala aquí. Columnas reconocidas: Nº, Concepto, Tipo, Acreedor, NIF, Nº factura, Fecha emisión, Fecha pago, Medio de pago, Importe (total con IVA), IVA, % imputado y Fuente.',
    file: 'Subir archivo', example: 'Cargar ejemplo', template: 'Descargar plantilla',
    paste: 'Pega aquí tu tabla…', types: 'Valores de la columna «Tipo»', run: 'Comprobar la relación',
    results: 'Resultado', checklistTitle: 'Lo que tienes que presentar', export: 'Descargar la relación ordenada (CSV)',
    guidesTitle: 'Guías por convocatoria',
    waitlist: '¿Te ahorraría tiempo un kit con la plantilla oficial ya preparada y una memoria guiada? <a href="{url}">Apúntate a la lista de espera</a>; aún no está a la venta.',
    footer: 'Herramienta orientativa: comprueba reglas generales y las de las bases citadas. <strong>No sustituye a las bases de tu convocatoria ni a la revisión del órgano concedente</strong>, y no es asesoramiento jurídico ni fiscal. Si un resultado no te cuadra, mandan las bases.',
    footerMeta: (r) => `Reglas revisadas el ${r}. Código en <a href="${SITE.repo}">GitHub</a>.`,
    guide: { plazo: 'Plazo', docs: 'Qué hay que presentar', rules: 'Qué comprueba el comprobador con estas bases', fuente: 'Bases y fuente oficial',
      cta: 'Revisa tu relación de gastos con estas reglas', back: 'Volver al comprobador', ref: 'Referencia' },
  },
  ca: {
    htmlLang: 'ca', locale: 'ca_ES',
    toolPath: 'ca/', guidePath: (slug) => `ca/guies/${slug}/`,
    brand: 'Comprovador de justificació de subvencions',
    toolTitle: 'Comprovador de justificació de subvencions per a associacions i clubs',
    toolDescription: "Revisa la relació classificada de despeses de la subvenció de la teva entitat abans de presentar-la: dates, pagaments, efectiu, indirectes, duplicats i documents que falten. Gratuït i sense enviar les teves dades.",
    lead: 'Per a associacions i clubs que justifiquen una subvenció amb <strong>compte justificatiu simplificat</strong>. Revisa la relació de despeses abans de presentar-la i descobreix què hi falta.',
    privacy: "Tot es processa al teu navegador: cap dada no surt del teu ordinador.",
    other: { label: 'Castellano', title: 'Versión en castellano' },
    s1: 'Convocatòria', s1q: 'Quina subvenció justifiques?',
    s2: 'Dades de la concessió',
    f: { sub: 'Subvenció concedida (€)', pres: "Pressupost o cost total de l'activitat (€)", otros: "Altres ingressos per a l'activitat (€)",
      ini: 'Inici del període de despeses', fin: 'Final del període de despeses', finj: 'Últim dia del termini de justificació', opt: 'opcional' },
    iva: "L'entitat <strong>dedueix l'IVA</strong>. Si no ho saps, deixa la casella sense marcar: la majoria d'associacions no el dedueixen.",
    s3: 'Relació de despeses',
    s3hint: "Puja un CSV o un Excel, o copia la taula a l'Excel i enganxa-la aquí. Columnes reconegudes (en castellà, com a la plantilla): Nº, Concepto, Tipo, Acreedor, NIF, Nº factura, Fecha emisión, Fecha pago, Medio de pago, Importe (total amb IVA), IVA, % imputado i Fuente.",
    file: 'Pujar fitxer', example: "Carregar l'exemple", template: 'Descarregar la plantilla',
    paste: 'Enganxa aquí la teva taula…', types: 'Valors de la columna «Tipo»', run: 'Comprovar la relació',
    results: 'Resultat', checklistTitle: 'El que has de presentar', export: 'Descarregar la relació ordenada (CSV)',
    guidesTitle: 'Guies per convocatòria',
    waitlist: "T'estalviaria temps un kit amb la plantilla oficial ja preparada i una memòria guiada? <a href=\"{url}\">Apunta't a la llista d'espera</a>; encara no està a la venda.",
    footer: "Eina orientativa: comprova regles generals i les de les bases citades. <strong>No substitueix les bases de la teva convocatòria ni la revisió de l'òrgan que la concedeix</strong>, i no és assessorament jurídic ni fiscal. Si un resultat no et quadra, manen les bases.",
    footerMeta: (r) => `Regles revisades el ${r}. Codi a <a href="${SITE.repo}">GitHub</a>.`,
    guide: { plazo: 'Termini', docs: 'Què cal presentar', rules: 'Què comprova el comprovador amb aquestes bases', fuente: 'Bases i font oficial',
      cta: 'Revisa la teva relació de despeses amb aquestes regles', back: 'Tornar al comprovador', ref: 'Referència' },
  },
};

const fecha = (iso) => iso.split('-').reverse().join('/');

/** Rutas de las versiones de una página en cada idioma (para hreflang). */
const alternatesFor = (kind, id) => {
  const out = {};
  for (const lang of ['es', 'ca']) {
    if (kind === 'tool') out[lang] = T[lang].toolPath;
    else if (GUIDES[id]?.[lang]) out[lang] = T[lang].guidePath(PROFILES[id].slug);
  }
  return out;
};

function layout({ lang, path, title, description, alternates, body, mode }) {
  const t = T[lang];
  const base = '../'.repeat(path.split('/').filter(Boolean).length);
  const otherLang = lang === 'es' ? 'ca' : 'es';
  const otherPath = alternates[otherLang];
  const hreflang = Object.entries(alternates)
    .map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${SITE.url}/${p}">`).join('\n') +
    (alternates.es != null ? `\n<link rel="alternate" hreflang="x-default" href="${SITE.url}/${alternates.es}">` : '');
  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE.url}/${path}">
${hreflang}
<meta property="og:type" content="website">
<meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE.url}/${path}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${base}style.css">
</head>
<body class="${mode}">
<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="${(base + t.toolPath) || './'}">${svg('shield', 'icon brand-mark')}<span>${esc(t.brand)}</span></a>
    ${otherPath != null ? `<a class="lang" href="${base}${otherPath}" hreflang="${otherLang}" lang="${otherLang}" title="${esc(t.other.title)}">${esc(t.other.label)}</a>` : ''}
  </div>
</header>
${body}
<footer class="site-footer">
  <div class="wrap">
    <p>${t.footer}</p>
    <p class="meta">${t.footerMeta(fecha(SITE.revisado))}</p>
  </div>
</footer>
</body>
</html>
`;
}

function guideLinks(lang) {
  const t = T[lang];
  const items = Object.values(PROFILES).map((p) => {
    const g = GUIDES[p.id]?.[lang] ? { lang, path: T[lang].guidePath(p.slug) } : { lang: 'es', path: T.es.guidePath(p.slug) };
    const title = (GUIDES[p.id][g.lang] ?? GUIDES[p.id].es).title;
    return `<li><a href="${'../'.repeat(t.toolPath.split('/').filter(Boolean).length)}${g.path}"${g.lang !== lang ? ` hreflang="${g.lang}" lang="${g.lang}"` : ''}>${esc(title)}</a></li>`;
  });
  return `<section class="guides" aria-labelledby="guides-title"><h2 id="guides-title">${esc(t.guidesTitle)}</h2><ul>${items.join('')}</ul></section>`;
}

function toolPage(lang) {
  const t = T[lang];
  const base = '../'.repeat(t.toolPath.split('/').filter(Boolean).length);
  const body = `<main class="wrap tool" data-base="${base}">
  <section class="intro">
    <h1>${esc(t.toolTitle)}</h1>
    <p class="lead">${t.lead}</p>
    <p class="privacy">${svg('shield')}<span>${esc(t.privacy)}</span></p>
  </section>

  <form id="form" class="steps" novalidate>
    <fieldset class="step">
      <legend><span class="step-n" aria-hidden="true">1</span>${esc(t.s1)}</legend>
      <label for="profile">${esc(t.s1q)}</label>
      <select id="profile" name="perfil"></select>
      <p id="profile-info" class="note" aria-live="polite"></p>
    </fieldset>

    <fieldset class="step">
      <legend><span class="step-n" aria-hidden="true">2</span>${esc(t.s2)}</legend>
      <div class="grid">
        <label>${esc(t.f.sub)}<input id="subvencion" inputmode="decimal" autocomplete="off" placeholder="2.000,00"></label>
        <label>${esc(t.f.pres)}<input id="presupuesto" inputmode="decimal" autocomplete="off" placeholder="${esc(t.f.opt)}"></label>
        <label>${esc(t.f.otros)}<input id="otros" inputmode="decimal" autocomplete="off" placeholder="${esc(t.f.opt)}"></label>
        <label>${esc(t.f.ini)}<input id="inicio" type="date"></label>
        <label>${esc(t.f.fin)}<input id="fin" type="date"></label>
        <label>${esc(t.f.finj)}<input id="finjust" type="date"></label>
      </div>
      <label class="check"><input id="ivadeducible" type="checkbox"><span>${t.iva}</span></label>
    </fieldset>

    <fieldset class="step">
      <legend><span class="step-n" aria-hidden="true">3</span>${esc(t.s3)}</legend>
      <p class="hint">${esc(t.s3hint)}</p>
      <div class="row">
        <label class="button secondary file-button">${esc(t.file)}<input id="file" type="file" accept=".csv,.txt,.xlsx,.xls"></label>
        <button id="example" type="button" class="secondary">${esc(t.example)}</button>
        <a class="button secondary" href="${base}ejemplo_relacion_gastos.csv" download>${esc(t.template)}</a>
        <span id="file-name" class="hint" aria-live="polite"></span>
      </div>
      <label class="sr-only" for="data">${esc(t.s3)}</label>
      <textarea id="data" rows="8" spellcheck="false" placeholder="${esc(t.paste)}"></textarea>
      <details class="hint"><summary>${esc(t.types)}</summary><div id="types-help"></div></details>
      <button id="run" type="submit" class="primary">${esc(t.run)}</button>
    </fieldset>
  </form>

  <section id="results" class="results" hidden aria-labelledby="results-title" tabindex="-1">
    <h2 id="results-title">${esc(t.results)}</h2>
    <div id="summary" class="summary" role="status"></div>
    <dl id="totals" class="totals"></dl>
    <ol id="findings" class="findings"></ol>
    <h3>${esc(t.checklistTitle)}</h3>
    <ul id="checklist" class="checklist"></ul>
    <button id="export" type="button" class="secondary">${esc(t.export)}</button>
    ${SITE.waitlist ? `<p class="waitlist">${t.waitlist.replace('{url}', esc(SITE.waitlist))}</p>` : ''}
  </section>

  ${guideLinks(lang)}
</main>
<script type="module" src="${base}src/app.js"></script>`;
  return layout({ lang, path: t.toolPath, title: t.toolTitle, description: t.toolDescription, alternates: alternatesFor('tool'), body, mode: 'operate' });
}

function guidePage(id, lang) {
  const t = T[lang];
  const p = PROFILES[id];
  const g = GUIDES[id][lang];
  const path = t.guidePath(p.slug);
  const base = '../'.repeat(path.split('/').filter(Boolean).length);
  // Solo las citas de reglas que este perfil aplica de verdad.
  const R = p.rules;
  const applies = {
    MINIMO: R.minimo, EFECTIVO: R.limiteEfectivo != null, TRES_OFERTAS: R.tresOfertas != null, INDIRECTOS: R.indirectosMax,
    PERSONAL: R.personalMaxPorcentajeFila != null || R.personalRequiereDeclaracion, DESVIACION: R.desviacionMax != null,
    EXCLUIDO: R.tiposExcluidos, TIPO: R.tiposPermitidos, NIF: R.nifObligatorio, IVA: R.avisoIva,
  };
  const cites = [...new Set(Object.entries(profileField(p, 'cite', lang))
    .filter(([code]) => !(code in applies) || applies[code]).map(([, c]) => c))];
  const body = `<main class="wrap guide">
  <article>
    <h1>${esc(g.title)}</h1>
    ${g.intro.map((para) => `<p>${para}</p>`).join('\n    ')}
    <p class="cta"><a class="button primary" href="${base}${t.toolPath}?perfil=${p.slug}">${esc(t.guide.cta)}${svg('arrow')}</a></p>
    <h2>${esc(t.guide.plazo)}</h2>
    <p>${esc(g.plazo)}</p>
    <h2>${esc(t.guide.docs)}</h2>
    <ul>${profileField(p, 'checklist', lang).map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    <h2>${esc(t.guide.rules)}</h2>
    <ul>${cites.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
    <h2>${esc(t.guide.fuente)}</h2>
    <p>${esc(t.guide.ref)}: ${esc(p.edicion)}. <a href="${esc(p.fuente)}" rel="noopener">${esc(p.fuente.replace(/^https:\/\//, '').slice(0, 60))}${svg('external')}</a></p>
    <p class="cta"><a class="button primary" href="${base}${t.toolPath}?perfil=${p.slug}">${esc(t.guide.cta)}${svg('arrow')}</a></p>
  </article>
</main>`;
  return layout({ lang, path, title: g.title, description: g.description, alternates: alternatesFor('guide', id), body, mode: 'read' });
}

export function build(outDir = ROOT) {
  const pages = [];
  const write = (path, html) => {
    const file = join(outDir, path, 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    pages.push(path);
  };
  for (const lang of ['es', 'ca']) write(T[lang].toolPath, toolPage(lang));
  for (const id of Object.keys(PROFILES)) {
    if (!GUIDES[id]) throw new Error(`Falta la guía de ${id}`);
    for (const lang of ['es', 'ca']) if (GUIDES[id][lang]) write(T[lang].guidePath(PROFILES[id].slug), guidePage(id, lang));
  }
  writeFileSync(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE.url}/${p}</loc><lastmod>${SITE.revisado}</lastmod></url>`).join('\n')}
</urlset>
`);
  writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
  return pages;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const pages = build();
  console.log(`${pages.length} páginas generadas:\n` + pages.map((p) => `  /${p}`).join('\n'));
}
