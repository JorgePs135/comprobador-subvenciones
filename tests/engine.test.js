import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCSV, parseAmount, parseDate, isValidNif, normalizeRows, runChecks, toCSV, imputedAmount } from '../src/engine.js';
import { PROFILES } from '../src/profiles.js';

const HEADER = 'Nº;Concepto;Tipo;Acreedor;NIF;Nº factura;Fecha emisión;Fecha pago;Medio de pago;Importe;IVA;% imputado';
const load = (lines) => normalizeRows(parseCSV([HEADER, ...lines].join('\n'))).expenses;
const codes = (r, level) => r.findings.filter((f) => !level || f.level === level).map((f) => f.code);

test('parseAmount: formatos españoles e ingleses', () => {
  assert.equal(parseAmount('1.234,56'), 1234.56);
  assert.equal(parseAmount('1,234.56'), 1234.56);
  assert.equal(parseAmount('1234,5 €'), 1234.5);
  assert.equal(parseAmount('1.234'), 1234);
  assert.equal(parseAmount('12.5'), 12.5);
  assert.equal(parseAmount(''), null);
  assert.equal(parseAmount('abc'), null);
});

test('parseDate: formatos habituales, serie de Excel y fechas imposibles', () => {
  assert.equal(parseDate('05/03/2026'), '2026-03-05');
  assert.equal(parseDate('5-3-26'), '2026-03-05');
  assert.equal(parseDate('2026-03-05'), '2026-03-05');
  assert.equal(parseDate(46086), '2026-03-05');
  assert.equal(parseDate('31/02/2026'), null);
  assert.equal(parseDate('ayer'), null);
});

test('isValidNif: DNI, NIE y CIF con dígito de control', () => {
  assert.ok(isValidNif('12345678Z'));
  assert.ok(!isValidNif('12345678A'));
  assert.ok(isValidNif('X1234567L'));
  assert.ok(isValidNif('B12345674'));
  assert.ok(!isValidNif('B12345675'));
  assert.ok(isValidNif('G12345674')); // asociaciones: dígito o letra
  assert.ok(isValidNif('G1234567D'));
  assert.ok(!isValidNif('HOLA'));
});

test('parseCSV: comillas, separador coma y líneas vacías', () => {
  const rows = parseCSV('a,b\n"x, y","z ""q"""\n\n');
  assert.deepEqual(rows, [['a', 'b'], ['x, y', 'z "q"']]);
});

test('normalizeRows: detecta columnas con alias y avisa de las que faltan', () => {
  const { expenses, missingColumns } = normalizeRows(parseCSV('Proveedor;Fecha factura;Total\nBar Pepe;01/02/2026;10,00'));
  assert.deepEqual(missingColumns, ['fecha_pago']);
  assert.equal(expenses[0].acreedor, 'Bar Pepe');
  assert.equal(expenses[0].importe, 10);
  assert.equal(expenses[0].porcentaje, 100);
});

test('genérico: sin errores con una relación correcta', () => {
  const ex = load(['1;Licencias;directo;Federación X;G1234567D;F1;10/01/2026;15/01/2026;transferencia;600,00;0;100']);
  const r = runChecks(ex, PROFILES.generico, { subvencion: 500, inicio: '2026-01-01', fin: '2026-12-31', finJustificacion: '2027-02-28' });
  assert.deepEqual(codes(r, 'error'), []);
  assert.equal(r.totals.total, 600);
});

test('genérico: detecta los errores básicos', () => {
  const ex = load([
    '1;Material;directo;Tienda;B12345674;A-1;10/01/2025;15/01/2026;transferencia;100;0;100', // fuera de periodo
    '2;Material;directo;Tienda;B12345674;A-1;10/02/2026;15/02/2026;transferencia;100;0;100', // duplicada
    '3;Material;directo;;B12345675;A-3;10/02/2026;;efectivo;1200;0;100', // sin acreedor, NIF mal, sin pago, efectivo
    '4;Material;directo;Tienda;B12345674;A-4;10/02/2026;01/03/2027;transferencia;100;0;150', // pago tarde, % > 100
  ]);
  const r = runChecks(ex, PROFILES.generico, { subvencion: 5000, inicio: '2026-01-01', fin: '2026-12-31', finJustificacion: '2027-02-28' });
  const errs = codes(r, 'error');
  for (const c of ['PERIODO', 'DUPLICADO', 'ACREEDOR', 'FECHA_PAGO', 'EFECTIVO', 'PAGO_TARDE', 'PORCENTAJE', 'MINIMO']) {
    assert.ok(errs.includes(c), `falta ${c}`);
  }
  assert.ok(codes(r, 'aviso').includes('NIF'));
});

test('IVA deducible: se imputa sin IVA', () => {
  const [e] = load(['1;x;directo;T;B12345674;1;01/02/2026;02/02/2026;transferencia;121;21;50']);
  assert.equal(imputedAmount(e, { ivaDeducible: true }), 50);
  assert.equal(imputedAmount(e, { ivaDeducible: false }), 60.5);
});

test('sobrefinanciación: subvención + otros ingresos > coste', () => {
  const ex = load(['1;x;directo;T;B12345674;1;01/02/2026;02/02/2026;transferencia;1000;0;100']);
  const r = runChecks(ex, PROFILES.generico, { subvencion: 800, otrosIngresos: 300 });
  assert.ok(codes(r, 'error').includes('SOBREFINANCIACION'));
});

test('tres ofertas: suma por proveedor sin IVA', () => {
  const ex = load([
    '1;x;directo;Bus SL;B12345674;1;01/02/2026;02/02/2026;transferencia;9680;1680;100',
    '2;x;directo;Bus SL;B12345674;2;01/03/2026;02/03/2026;transferencia;9680;1680;100',
  ]);
  const r = runChecks(ex, PROFILES.generico, {});
  assert.ok(codes(r, 'aviso').includes('TRES_OFERTAS'));
});

test('Ayto. Madrid: efectivo desde 600 €, indirectos > 8 % de la subvención, inventariables, inscripción anterior', () => {
  const p = PROFILES.madrid_ayto_deporte_2526;
  const ex = load([
    '1;Arbitrajes;directo;Comité;G1234567D;1;10/10/2025;10/10/2025;efectivo;600;0;100',
    '2;Gestoría;indirecto;Asesor;B12345674;2;10/11/2025;10/11/2025;transferencia;500;0;100',
    '3;Porterías;inventariable;Tienda;B12345674;3;10/12/2025;10/12/2025;transferencia;800;0;100',
    '4;Inscripción liga;inscripcion;Federación;G1234567D;4;20/07/2025;20/07/2025;transferencia;300;0;100',
  ]);
  const r = runChecks(ex, p, { subvencion: 5000, finJustificacion: '2027-01-15' });
  const errs = codes(r, 'error');
  assert.ok(errs.includes('EFECTIVO'));
  assert.ok(errs.includes('INDIRECTOS')); // 500 > 8 % de 5000 = 400
  assert.ok(errs.includes('EXCLUIDO'));
  assert.ok(!errs.includes('PERIODO'), 'la inscripción anterior es aviso, no error');
  assert.ok(codes(r, 'aviso').includes('PERIODO'));
  // pagado el mismo día del fin de plazo: Madrid exige el día anterior
  const ex2 = load(['1;x;directo;T;B12345674;9;10/10/2025;15/01/2027;transferencia;100;0;100']);
  assert.ok(codes(runChecks(ex2, p, { finJustificacion: '2027-01-15' }), 'error').includes('PAGO_TARDE'));
});

test('Diputació de Barcelona: indirectos > 5 % del coste total, desviación > 30 %, personal > 10 %', () => {
  const p = PROFILES.diba_cultura_popular_2026;
  const ex = load([
    '1;Músicos;directo;Cobla;G1234567D;1;10/05/2026;10/05/2026;transferencia;9000;0;50',
    '2;Luz local;indirecto;Eléctrica;A12345674;2;10/06/2026;10/06/2026;transferencia;1000;0;100',
    '3;Técnico;personal;Persona;12345678Z;3;10/07/2026;10/07/2026;transferencia;2000;0;40',
  ]);
  const r = runChecks(ex, p, { subvencion: 3000, presupuesto: 20000, finJustificacion: '2026-11-16' });
  assert.ok(codes(r, 'error').includes('INDIRECTOS')); // 1000 > 5 % de 12000
  assert.ok(codes(r, 'aviso').includes('DESVIACION')); // 12000 frente a 20000 = 40 %
  assert.ok(codes(r, 'aviso').includes('PERSONAL'));
  assert.equal(r.totals.costeTotal, 12000);
});

test('Diputació de Tarragona: excluidos y personal con declaración', () => {
  const p = PROFILES.dipta_cultura_singular;
  const ex = load([
    '1;Alquiler sede;funcionamiento;Inmob;B12345674;1;10/05/2026;10/05/2026;transferencia;500;0;100',
    '2;Coordinadora;personal;Persona;12345678Z;2;10/06/2026;10/06/2026;transferencia;800;0;50',
  ]);
  const r = runChecks(ex, p, { presupuesto: 1300 });
  assert.ok(codes(r, 'error').includes('EXCLUIDO'));
  assert.ok(codes(r, 'info').includes('PERSONAL'));
});

test('Xunta PR945C: lista cerrada de conceptos, NIF obligatorio y mínimo = subvención', () => {
  const p = PROFILES.xunta_pr945c_linea1;
  const ex = load([
    '1;Licencias;licencias;Federación Galega;G1234567D;1;10/03/2025;10/03/2025;transferencia;1500;0;100',
    '2;Cena de gala;comidas;Restaurante;;2;10/04/2025;10/04/2025;transferencia;300;0;100',
  ]);
  const r = runChecks(ex, p, { subvencion: 2000 });
  const errs = codes(r, 'error');
  assert.ok(errs.includes('TIPO'));
  assert.ok(errs.includes('NIF'));
  assert.ok(errs.includes('MINIMO')); // 1800 < 2000
});

test('cada perfil tiene nombre, fuente, reglas y checklist', () => {
  for (const p of Object.values(PROFILES)) {
    assert.ok(p.nombre && p.fuente.startsWith('https://') && p.rules && p.checklist.length, p.id);
  }
});

test('toCSV: ordena por fecha y usa coma decimal', () => {
  const ex = load([
    '1;b;directo;T;B12345674;2;10/02/2026;11/02/2026;transferencia;20,5;0;100',
    '2;a;directo;T;B12345674;1;10/01/2026;11/01/2026;transferencia;10;0;100',
  ]);
  const lines = toCSV(ex, {}).split('\r\n');
  assert.match(lines[1], /^1;a;/);
  assert.match(lines[2], /20,50/);
});

test('el CSV de ejemplo se lee sin columnas que falten', () => {
  const text = readFileSync(new URL('../ejemplo_relacion_gastos.csv', import.meta.url), 'utf8');
  const { expenses, missingColumns } = normalizeRows(parseCSV(text));
  assert.deepEqual(missingColumns, []);
  assert.ok(expenses.length >= 5);
});

test('build: genera herramienta y guías en ambos idiomas, con hreflang y sin enlaces rotos internos', async () => {
  const { build } = await import('../scripts/build.js');
  const { mkdtempSync, readFileSync: rf, existsSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const out = mkdtempSync(join(tmpdir(), 'site-'));
  const pages = build(out);
  assert.ok(pages.includes('') && pages.includes('ca/'));
  for (const p of Object.values(PROFILES)) assert.ok(pages.includes(`guias/${p.slug}/`), p.id);
  for (const page of pages) {
    const html = rf(join(out, page, 'index.html'), 'utf8');
    assert.match(html, /<link rel="canonical"/);
    for (const [, href] of html.matchAll(/href="((?:\.\.\/)*(?:guias|ca)\/[^"?#]*)"/g)) {
      assert.ok(existsSync(join(out, page, href, 'index.html')), `${page} -> ${href}`);
    }
  }
});
