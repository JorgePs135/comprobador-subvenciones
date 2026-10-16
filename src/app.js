import { parseCSV, parseAmount, normalizeRows, runChecks, toCSV, fmt } from './engine.js';
import { PROFILES } from './profiles.js';
import { findingText, profileField, UI } from './messages.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lang = document.documentElement.lang === 'ca' ? 'ca' : 'es';
const ui = UI[lang];
const base = document.querySelector('main').dataset.base ?? '';
const SHEETJS = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const BASE_TYPES = ['directo', 'indirecto', 'personal', 'inventariable', 'inscripcion', 'funcionamiento', 'inversion'];
const ICONS = {
  error: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
  aviso: '<path d="M12 4 2.8 20h18.4L12 4Z"/><path d="M12 10v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  ok: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  external: '<path d="M7 17 17 7"/><path d="M9 7h8v8"/>',
};
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
let last = { expenses: [], ctx: {} };

for (const p of Object.values(PROFILES)) $('profile').add(new Option(profileField(p, 'nombre', lang), p.id));
const wanted = new URLSearchParams(location.search).get('perfil');
const preset = Object.values(PROFILES).find((p) => p.slug === wanted || p.id === wanted);
if (preset) $('profile').value = preset.id;

function showProfile() {
  const p = PROFILES[$('profile').value];
  $('profile-info').innerHTML = `<strong>${esc(ui.referencia)}:</strong> ${esc(p.edicion)}. `
    + `<a href="${esc(p.fuente)}" target="_blank" rel="noopener">${esc(ui.verFuente)}${icon('external')}</a><br>${esc(profileField(p, 'nota', lang))}`;
  $('inicio').value = p.rules.periodo?.inicio ?? '';
  $('fin').value = p.rules.periodo?.fin ?? '';
  const types = p.rules.tiposPermitidos ?? BASE_TYPES;
  $('types-help').innerHTML = `<p>${esc(ui.tiposUsa)}</p><p>${types.map((t) => `<code>${esc(t)}</code>`).join(' ')}</p>`
    + (p.rules.tiposExcluidos ? `<p>${esc(ui.tiposExcluidos)} ${p.rules.tiposExcluidos.map((t) => `<code>${esc(t)}</code>`).join(' ')}</p>` : '');
}
$('profile').addEventListener('change', showProfile);
showProfile();

$('example').addEventListener('click', async () => {
  $('data').value = await (await fetch(`${base}ejemplo_relacion_gastos.csv`)).text();
  $('profile').value = 'madrid_ayto_deporte_2526';
  showProfile();
  $('subvencion').value = '3.000,00';
  $('finjust').value = '2027-01-15';
  $('file-name').textContent = '';
});

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = Object.assign(document.createElement('script'), { src, onload: resolve, onerror: reject });
    document.head.append(s);
  });
}

$('file').addEventListener('change', async (ev) => {
  const f = ev.target.files[0];
  if (!f) return;
  try {
    if (/\.xlsx?$/i.test(f.name)) {
      if (!window.XLSX) await loadScript(SHEETJS);
      // Sin cellDates: las fechas llegan como número de serie de Excel y parseDate las convierte sin zona horaria.
      const wb = window.XLSX.read(await f.arrayBuffer(), { type: 'array' });
      const rows = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
      $('data').value = rows.map((r) => r.join('\t')).join('\n');
    } else {
      $('data').value = await f.text();
    }
    $('file-name').textContent = ui.archivoCargado(f.name);
  } catch {
    $('file-name').textContent = ui.excelError;
  }
});

const num = (id) => { const v = $(id).value.trim(); return v ? parseAmount(v) : null; };

$('form').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const profile = PROFILES[$('profile').value];
  const ctx = {
    subvencion: num('subvencion'), presupuesto: num('presupuesto'), otrosIngresos: num('otros'),
    inicio: $('inicio').value || null, fin: $('fin').value || null, finJustificacion: $('finjust').value || null,
    ivaDeducible: $('ivadeducible').checked,
  };
  const rows = parseCSV($('data').value);
  const { expenses, missingColumns, unknownColumns } = normalizeRows(rows);
  last = { expenses, ctx };
  const { findings, totals } = runChecks(expenses, profile, ctx);
  if (rows.length < 2) findings.unshift({ level: 'error', code: 'DATOS', key: 'sinDatos' });
  else if (missingColumns.length) findings.unshift({ level: 'error', code: 'COLUMNAS', key: 'columnasFaltan', params: { lista: missingColumns.join(', ') } });
  if (unknownColumns.length) findings.push({ level: 'info', code: 'COLUMNAS', key: 'columnasSobran', params: { lista: unknownColumns.join(', ') } });
  if (!ctx.finJustificacion) findings.push({ level: 'info', code: 'PLAZO', key: 'plazoFalta' });
  render(profile, findings, totals, ctx);
});

function render(profile, findings, totals, ctx) {
  const cites = profileField(profile, 'cite', lang) ?? {};
  const count = (l) => findings.filter((f) => f.level === l).length;
  const [e, a, i] = [count('error'), count('aviso'), count('info')];
  const chip = (n, level, words) => (n ? `<span class="chip ${level}">${icon(level)}${ui.count(n, ...words)}</span>` : '');
  $('summary').innerHTML = (e + a === 0 ? `<span class="chip ok">${icon('ok')}${esc(ui.limpio)}</span>` : '')
    + chip(e, 'error', ui.errores) + chip(a, 'aviso', ui.avisos) + chip(i, 'info', ui.notas);
  const T = ui.totales;
  const cells = [[T.n, totals.n], [T.facturas, fmt(totals.totalFacturas)], [T.coste, fmt(totals.costeTotal)], [T.imputado, fmt(totals.total)],
    [T.indirectos, fmt(totals.indirectos)], [T.personal, fmt(totals.personal)]];
  if (ctx.subvencion) cells.push([T.cubierto, `${(totals.total / ctx.subvencion * 100).toLocaleString(lang === 'ca' ? 'ca-ES' : 'es-ES', { maximumFractionDigits: 1 })} %`]);
  $('totals').innerHTML = cells.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  const order = { error: 0, aviso: 1, info: 2 };
  $('findings').innerHTML = [...findings].sort((x, y) => order[x.level] - order[y.level] || (x.row ?? 0) - (y.row ?? 0))
    .map((f) => {
      const cite = cites[f.code];
      return `<li class="finding ${f.level}">${icon(f.level)}<div><span class="lvl">${esc(ui.niveles[f.level])}</span> ${esc(findingText(f, lang))}`
        + `${cite ? `<span class="cite">${esc(cite)}</span>` : ''}</div></li>`;
    }).join('');
  $('checklist').innerHTML = profileField(profile, 'checklist', lang)
    .map((c, n) => `<li><label><input type="checkbox" id="ck${n}"><span>${esc(c)}</span></label></li>`).join('');
  $('results').hidden = false;
  $('results').focus({ preventScroll: true });
  $('results').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

$('export').addEventListener('click', () => {
  const blob = new Blob([toCSV(last.expenses, last.ctx)], { type: 'text/csv;charset=utf-8' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: ui.csvNombre });
  a.click();
  URL.revokeObjectURL(a.href);
});
