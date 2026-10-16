// Motor de comprobaciones. Funciones puras: sin DOM ni red, se usan igual en el navegador y en los tests.

const COLUMN_ALIASES = {
  num: ['num', 'n', 'no', 'numero', 'orden'],
  concepto: ['concepto', 'descripcion', 'detalle'],
  tipo: ['tipo', 'categoria', 'partida', 'clase'],
  acreedor: ['acreedor', 'acreedora', 'proveedor', 'emisor', 'razon social'],
  nif: ['nif', 'cif', 'nif acreedor', 'nif proveedor'],
  factura: ['factura', 'n factura', 'numero factura', 'documento', 'n documento', 'numero documento', 'referencia'],
  fecha_emision: ['fecha emision', 'fecha factura', 'fecha', 'emision'],
  fecha_pago: ['fecha pago', 'pago', 'fecha de pago'],
  medio_pago: ['medio pago', 'forma pago', 'medio', 'forma de pago', 'medio de pago'],
  importe: ['importe', 'total', 'importe total', 'importe factura'],
  iva: ['iva', 'cuota iva', 'importe iva'],
  porcentaje: ['porcentaje', '% imputado', 'imputado', 'porcentaje imputado', '%'],
  fuente: ['fuente', 'financiacion', 'fuente financiacion', 'financiador'],
};

const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[º°ª.:_]/g, ' ').replace(/\s+/g, ' ').trim();

/** Detecta separador (; , o tabulador) y parsea CSV con comillas. Devuelve array de arrays. */
export function parseCSV(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const sep = [';', '\t', ','].reduce((best, c) =>
    firstLine.split(c).length > firstLine.split(best).length ? c : best, ';');
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

/** Convierte "1.234,56", "1234.56", "1234,5 €" o un número en número. null si no es válido. */
export function parseAmount(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  let s = String(v ?? '').replace(/[€\s]/g, '');
  if (!s) return null;
  if (s.includes(',') && s.includes('.')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (s.includes(',')) s = s.replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ''); // 1.234 = mil doscientos
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Fecha en dd/mm/aaaa, dd-mm-aaaa, aaaa-mm-dd o número de serie de Excel → "aaaa-mm-dd". null si no es válida. */
export function parseDate(v) {
  if (v instanceof Date) return isNaN(v) ? null : v.toISOString().slice(0, 10);
  if (typeof v === 'number' || /^\d{5}(\.\d+)?$/.test(String(v ?? '').trim())) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(Number(v)) * 86400000);
    return d.toISOString().slice(0, 10);
  }
  const s = String(v ?? '').trim();
  let y, m, d, r;
  if ((r = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) [, y, m, d] = r;
  else if ((r = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/))) {
    [, d, m, y] = r;
    if (y.length === 2) y = '20' + y;
  } else return null;
  const dt = new Date(Date.UTC(+y, +m - 1, +d));
  if (dt.getUTCFullYear() !== +y || dt.getUTCMonth() !== +m - 1 || dt.getUTCDate() !== +d) return null;
  return dt.toISOString().slice(0, 10);
}

const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

/** Valida formato y dígito de control de DNI, NIE y CIF/NIF de entidades. */
export function isValidNif(raw) {
  const s = String(raw ?? '').toUpperCase().replace(/[\s.-]/g, '');
  let m;
  if ((m = s.match(/^(\d{8})([A-Z])$/))) return DNI_LETTERS[+m[1] % 23] === m[2];
  if ((m = s.match(/^([XYZ])(\d{7})([A-Z])$/))) return DNI_LETTERS[+('XYZ'.indexOf(m[1]) + m[2]) % 23] === m[3];
  if ((m = s.match(/^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/))) {
    const digits = m[2].split('').map(Number);
    let sum = 0;
    digits.forEach((dg, i) => {
      if (i % 2 === 0) { const x = dg * 2; sum += Math.floor(x / 10) + (x % 10); } else sum += dg;
    });
    const ctrl = (10 - (sum % 10)) % 10;
    const letter = 'JABCDEFGHI'[ctrl];
    if ('PQRSNW'.includes(m[1])) return m[3] === letter;
    if ('ABEH'.includes(m[1])) return m[3] === String(ctrl);
    return m[3] === String(ctrl) || m[3] === letter;
  }
  return false;
}

/** Filas crudas (array de arrays con cabecera) → gastos normalizados con errores de lectura. */
export function normalizeRows(rows) {
  if (!rows.length) return { expenses: [], unknownColumns: [], missingColumns: ['importe'] };
  const header = rows[0].map(fold);
  const index = {};
  const unknownColumns = [];
  header.forEach((h, i) => {
    const key = Object.keys(COLUMN_ALIASES).find((k) => COLUMN_ALIASES[k].includes(h));
    if (key && !(key in index)) index[key] = i;
    else if (h) unknownColumns.push(rows[0][i]);
  });
  const missingColumns = ['acreedor', 'fecha_emision', 'fecha_pago', 'importe'].filter((k) => !(k in index));
  const get = (r, k) => (k in index ? r[index[k]] : undefined);
  const expenses = rows.slice(1).map((r, i) => {
    const pctRaw = get(r, 'porcentaje');
    const pct = pctRaw === undefined || String(pctRaw).trim() === '' ? 100 : parseAmount(String(pctRaw).replace('%', ''));
    return {
      row: i + 2, // fila en la hoja (la 1 es la cabecera)
      num: String(get(r, 'num') ?? i + 1).trim(),
      concepto: String(get(r, 'concepto') ?? '').trim(),
      tipo: fold(get(r, 'tipo')) || 'directo',
      acreedor: String(get(r, 'acreedor') ?? '').trim(),
      nif: String(get(r, 'nif') ?? '').toUpperCase().replace(/[\s.-]/g, ''),
      factura: String(get(r, 'factura') ?? '').trim(),
      fechaEmisionRaw: get(r, 'fecha_emision'),
      fechaEmision: parseDate(get(r, 'fecha_emision')),
      fechaPagoRaw: get(r, 'fecha_pago'),
      fechaPago: parseDate(get(r, 'fecha_pago')),
      medioPago: fold(get(r, 'medio_pago')),
      importe: parseAmount(get(r, 'importe')),
      iva: parseAmount(get(r, 'iva')) ?? 0,
      porcentaje: pct,
      fuente: String(get(r, 'fuente') ?? '').trim(),
    };
  });
  return { expenses, unknownColumns, missingColumns };
}

const round2 = (n) => Math.round(n * 100) / 100;
export const fmt = (n) => (n ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }) + ' €';
const isCash = (medio) => /efectivo|metalico|caja|contado/.test(medio);

/** Importe que se imputa a la subvención: sin IVA si la entidad lo deduce. */
export function imputedAmount(e, ctx) {
  if (e.importe == null || e.porcentaje == null) return 0;
  const base = ctx.ivaDeducible ? e.importe - e.iva : e.importe;
  return round2(base * e.porcentaje / 100);
}

/**
 * Ejecuta las comprobaciones.
 * ctx: { subvencion, presupuesto, otrosIngresos, inicio, fin, finJustificacion, ivaDeducible }
 * Devuelve { findings: [{level, code, row, key, params}], totals }.
 * El texto de cada hallazgo lo compone messages.js a partir de `key` y `params`, en el idioma de la página.
 */
export function runChecks(expenses, profile, ctx) {
  const R = profile.rules;
  const findings = [];
  const add = (level, code, row, key, params = {}) => findings.push({ level, code, row, key, params });

  const inicio = ctx.inicio || R.periodo?.inicio;
  const fin = ctx.fin || R.periodo?.fin;
  const finJust = ctx.finJustificacion || null;
  const seen = new Map();
  const byProvider = new Map();

  for (const e of expenses) {
    const p = { fila: e.row, num: e.num };
    if (e.importe == null) add('error', 'IMPORTE', e.row, 'importe', p);
    if (!e.acreedor) add('error', 'ACREEDOR', e.row, 'acreedor', p);
    if (!e.fechaEmision) add('error', 'FECHA_EMISION', e.row, 'fechaEmision', { ...p, valor: e.fechaEmisionRaw ?? '' });
    if (!e.fechaPago) add('error', 'FECHA_PAGO', e.row, 'fechaPago', { ...p, valor: e.fechaPagoRaw ?? '' });
    if (!e.nif) add(R.nifObligatorio ? 'error' : 'aviso', 'NIF', e.row, 'nifFalta', p);
    else if (!isValidNif(e.nif)) add('aviso', 'NIF', e.row, 'nifInvalido', { ...p, nif: e.nif });
    if (e.porcentaje == null || e.porcentaje < 0 || e.porcentaje > 100) add('error', 'PORCENTAJE', e.row, 'porcentaje', p);
    if (e.iva && e.importe != null && e.iva > e.importe) add('error', 'IVA', e.row, 'ivaMayor', p);

    const periodLevel = R.periodoExcepciones?.includes(e.tipo) ? 'aviso' : 'error';
    if (e.fechaEmision && inicio && e.fechaEmision < inicio) add(periodLevel, 'PERIODO', e.row, 'periodoAntes', { ...p, fecha: e.fechaEmision, limite: inicio });
    if (e.fechaEmision && fin && e.fechaEmision > fin) add(periodLevel, 'PERIODO', e.row, 'periodoDespues', { ...p, fecha: e.fechaEmision, limite: fin });
    if (e.fechaPago && finJust && (R.pagoEstrictamenteAntes ? e.fechaPago >= finJust : e.fechaPago > finJust)) {
      add('error', 'PAGO_TARDE', e.row, 'pagoTarde', { ...p, fecha: e.fechaPago, limite: finJust });
    }
    if (e.tipo === 'personal' && R.personalRequiereDeclaracion) add('info', 'PERSONAL', e.row, 'personalDeclaracion', p);
    if (e.fechaPago && e.fechaEmision && e.fechaPago < e.fechaEmision) add('aviso', 'PAGO_ANTES', e.row, 'pagoAntes', p);

    if (isCash(e.medioPago) && e.importe != null && R.limiteEfectivo != null && e.importe >= R.limiteEfectivo) {
      add('error', 'EFECTIVO', e.row, 'efectivo', { ...p, importe: e.importe, limite: R.limiteEfectivo });
    }
    if (R.tiposPermitidos && !R.tiposPermitidos.includes(e.tipo)) add('error', 'TIPO', e.row, 'tipo', { ...p, tipo: e.tipo, lista: R.tiposPermitidos.join(', ') });
    if (R.tiposExcluidos?.includes(e.tipo)) add('error', 'EXCLUIDO', e.row, 'excluido', { ...p, tipo: e.tipo });
    if (ctx.ivaDeducible && e.iva === 0 && e.importe > 0 && R.avisoIva) add('info', 'IVA', e.row, 'ivaFalta', p);

    if (e.nif && e.factura) {
      const k = `${e.nif}|${fold(e.factura)}`;
      if (seen.has(k)) add('error', 'DUPLICADO', e.row, 'duplicado', { ...p, factura: e.factura, nif: e.nif, otra: seen.get(k) });
      else seen.set(k, e.row);
    }
    if (e.importe != null) {
      const key = e.nif || fold(e.acreedor);
      byProvider.set(key, (byProvider.get(key) ?? 0) + (e.importe - e.iva));
    }
  }

  const imputed = expenses.map((e) => ({ e, v: imputedAmount(e, ctx) }));
  const total = round2(imputed.reduce((s, x) => s + x.v, 0));
  const totalFacturas = round2(expenses.reduce((s, e) => s + (e.importe ?? 0), 0));
  // Coste total de la actividad: todos los gastos al 100 %, sin IVA si es deducible.
  const fullCost = (e) => imputedAmount({ ...e, porcentaje: 100 }, ctx);
  const costeTotal = round2(expenses.reduce((s, e) => s + fullCost(e), 0));
  const sumTipo = (t) => round2(imputed.filter((x) => x.e.tipo === t).reduce((s, x) => s + x.v, 0));
  const indirectos = sumTipo('indirecto');
  const indirectosCoste = round2(expenses.filter((e) => e.tipo === 'indirecto').reduce((s, e) => s + fullCost(e), 0));
  const personal = sumTipo('personal');

  const sub = ctx.subvencion ?? null;
  const pres = ctx.presupuesto ?? null;

  if (R.minimo === 'subvencion' && sub != null && total < sub) add('error', 'MINIMO', null, 'minimoSubvencion', { total, sub });
  if (R.minimo === 'presupuesto' && pres && costeTotal < pres) add('aviso', 'MINIMO', null, 'minimoPresupuesto', { coste: costeTotal, pres, pct: costeTotal / pres * 100 });
  if (R.desviacionMax != null && pres) {
    const desv = Math.abs(costeTotal - pres) / pres;
    if (desv > R.desviacionMax) add('aviso', 'DESVIACION', null, 'desviacion', { pct: desv * 100, max: R.desviacionMax * 100 });
  }
  if (R.indirectosMax) {
    const { pct, sobre } = R.indirectosMax;
    const [value, base] = sobre === 'subvencion' ? [indirectos, sub] : [indirectosCoste, costeTotal];
    if (base && value > base * pct + 0.005) add('error', 'INDIRECTOS', null, sobre === 'subvencion' ? 'indirectosSub' : 'indirectosCoste', { valor: value, pct: pct * 100, max: base * pct });
  }
  if (R.personalMaxPorcentajeFila != null) {
    for (const x of imputed.filter((x) => x.e.tipo === 'personal' && x.e.porcentaje > R.personalMaxPorcentajeFila * 100)) {
      add('aviso', 'PERSONAL', x.e.row, 'personalPct', { fila: x.e.row, num: x.e.num, pct: x.e.porcentaje, max: R.personalMaxPorcentajeFila * 100 });
    }
  }
  if (R.tresOfertas != null) {
    for (const [prov, base] of byProvider) if (base >= R.tresOfertas) add('aviso', 'TRES_OFERTAS', null, 'tresOfertas', { prov, base, limite: R.tresOfertas });
  }
  if (sub != null && ctx.otrosIngresos != null && costeTotal > 0 && sub + ctx.otrosIngresos > costeTotal + 0.005) {
    add('error', 'SOBREFINANCIACION', null, 'sobrefinanciacion', { sub, otros: ctx.otrosIngresos, coste: costeTotal });
  }

  return { findings, totals: { total, totalFacturas, costeTotal, indirectos, indirectosCoste, personal, n: expenses.length } };
}

/** Relación ordenada por fecha para exportar a CSV (separador ;, como Excel en español). */
export function toCSV(expenses, ctx) {
  const head = ['Nº', 'Concepto', 'Tipo', 'Acreedor', 'NIF', 'Nº factura', 'Fecha emisión', 'Fecha pago', 'Medio de pago', 'Importe', 'IVA', '% imputado', 'Importe imputado', 'Fuente'];
  const q = (v) => /[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
  const num = (n) => (n ?? 0).toFixed(2).replace('.', ',');
  const sorted = [...expenses].sort((a, b) => String(a.fechaEmision).localeCompare(String(b.fechaEmision)));
  const lines = sorted.map((e, i) => [i + 1, e.concepto, e.tipo, e.acreedor, e.nif, e.factura, e.fechaEmision ?? '', e.fechaPago ?? '',
    e.medioPago, num(e.importe), num(e.iva), e.porcentaje ?? '', num(imputedAmount(e, ctx)), e.fuente].map(q).join(';'));
  return '﻿' + [head.join(';'), ...lines].join('\r\n');
}
