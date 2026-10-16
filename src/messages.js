// Textos de los hallazgos y de la interfaz, en castellano (es) y catalán (ca).
// Catalán: traducción propia, pendiente de revisión por una persona nativa.
import { fmt } from './engine.js';

const d = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
const pct = (n, lang) => n.toLocaleString(lang === 'ca' ? 'ca-ES' : 'es-ES', { maximumFractionDigits: 1 });

const where = {
  es: (p) => `Fila ${p.fila} (nº ${p.num})`,
  ca: (p) => `Fila ${p.fila} (núm. ${p.num})`,
};

const FINDINGS = {
  es: {
    importe: (p) => `${where.es(p)}: falta el importe o no es un número.`,
    acreedor: (p) => `${where.es(p)}: falta el acreedor.`,
    fechaEmision: (p) => `${where.es(p)}: fecha de emisión vacía o no válida («${p.valor}»).`,
    fechaPago: (p) => `${where.es(p)}: falta la fecha de pago o no es válida («${p.valor}»). Los gastos tienen que estar pagados.`,
    nifFalta: (p) => `${where.es(p)}: falta el NIF del acreedor.`,
    nifInvalido: (p) => `${where.es(p)}: el NIF «${p.nif}» no supera la comprobación de formato o dígito de control. Si es un proveedor extranjero, ignóralo.`,
    porcentaje: (p) => `${where.es(p)}: el % imputado debe estar entre 0 y 100.`,
    ivaMayor: (p) => `${where.es(p)}: el IVA es mayor que el importe total.`,
    periodoAntes: (p) => `${where.es(p)}: factura del ${d(p.fecha)}, anterior al inicio del periodo subvencionable (${d(p.limite)}).`,
    periodoDespues: (p) => `${where.es(p)}: factura del ${d(p.fecha)}, posterior al fin del periodo subvencionable (${d(p.limite)}).`,
    pagoTarde: (p) => `${where.es(p)}: pagada el ${d(p.fecha)}. Tiene que estar pagada antes del fin del plazo de justificación (${d(p.limite)}).`,
    personalDeclaracion: (p) => `${where.es(p)}: gasto de personal. Hace falta una declaración con las tareas, el % de dedicación y la fecha de pago.`,
    pagoAntes: (p) => `${where.es(p)}: la fecha de pago es anterior a la de la factura. Comprueba que no sea un error al escribirla.`,
    efectivo: (p) => `${where.es(p)}: pago en efectivo de ${fmt(p.importe)}. Solo se admite por debajo de ${fmt(p.limite)}.`,
    tipo: (p) => `${where.es(p)}: el tipo «${p.tipo}» no está entre los conceptos admitidos (${p.lista}).`,
    excluido: (p) => `${where.es(p)}: los gastos de tipo «${p.tipo}» no son subvencionables en esta convocatoria.`,
    ivaFalta: (p) => `${where.es(p)}: no consta el IVA. Si la factura lo lleva y lo deducís, desglósalo: el IVA deducible no es subvencionable.`,
    duplicado: (p) => `${where.es(p)}: la factura ${p.factura} de ${p.nif} ya aparece en la fila ${p.otra}.`,
    minimoSubvencion: (p) => `Has justificado ${fmt(p.total)}, menos que la subvención concedida (${fmt(p.sub)}). La ayuda se reducirá a lo justificado.`,
    minimoPresupuesto: (p, l) => `El coste justificado (${fmt(p.coste)}) es el ${pct(p.pct, l)} % del presupuesto (${fmt(p.pres)}). La subvención puede reducirse en proporción.`,
    desviacion: (p, l) => `El coste se desvía un ${pct(p.pct, l)} % del presupuesto. Se admite hasta el ${p.max} %, y siempre motivado.`,
    indirectosSub: (p) => `Los costes indirectos (${fmt(p.valor)}) superan el ${p.pct} % de la subvención (máximo ${fmt(p.max)}).`,
    indirectosCoste: (p) => `Los costes indirectos (${fmt(p.valor)}) superan el ${p.pct} % del coste total de la actividad (máximo ${fmt(p.max)}).`,
    personalPct: (p) => `${where.es(p)}: imputas el ${p.pct} % de un gasto de personal. Estas bases admiten hasta el ${p.max} %.`,
    tresOfertas: (p) => `Al proveedor ${p.prov} le habéis pagado ${fmt(p.base)} sin IVA. A partir de ${fmt(p.limite)} hay que acreditar tres ofertas.`,
    sobrefinanciacion: (p) => `Subvención (${fmt(p.sub)}) más otros ingresos (${fmt(p.otros)}) suman ${fmt(p.sub + p.otros)}, más que el coste real justificado (${fmt(p.coste)}). Habría exceso de financiación.`,
    columnasFaltan: (p) => `No encuentro estas columnas: ${p.lista}. Revisa los nombres de la primera fila; puedes partir de la plantilla.`,
    columnasSobran: (p) => `Columnas que no uso: ${p.lista}.`,
    plazoFalta: () => 'No has indicado el último día del plazo de justificación, así que no puedo comprobar si los pagos llegan a tiempo.',
    sinDatos: () => 'No hay gastos que revisar. Pega tu tabla, sube un archivo o carga el ejemplo.',
  },
  ca: {
    importe: (p) => `${where.ca(p)}: falta l'import o no és un número.`,
    acreedor: (p) => `${where.ca(p)}: falta el creditor.`,
    fechaEmision: (p) => `${where.ca(p)}: data d'emissió buida o no vàlida («${p.valor}»).`,
    fechaPago: (p) => `${where.ca(p)}: falta la data de pagament o no és vàlida («${p.valor}»). Les despeses han d'estar pagades.`,
    nifFalta: (p) => `${where.ca(p)}: falta el NIF del creditor.`,
    nifInvalido: (p) => `${where.ca(p)}: el NIF «${p.nif}» no supera la comprovació de format o de dígit de control. Si és un proveïdor estranger, no en facis cas.`,
    porcentaje: (p) => `${where.ca(p)}: el % imputat ha d'estar entre 0 i 100.`,
    ivaMayor: (p) => `${where.ca(p)}: l'IVA és més gran que l'import total.`,
    periodoAntes: (p) => `${where.ca(p)}: factura del ${d(p.fecha)}, anterior a l'inici del període subvencionable (${d(p.limite)}).`,
    periodoDespues: (p) => `${where.ca(p)}: factura del ${d(p.fecha)}, posterior al final del període subvencionable (${d(p.limite)}).`,
    pagoTarde: (p) => `${where.ca(p)}: pagada el ${d(p.fecha)}. Ha d'estar pagada abans del final del termini de justificació (${d(p.limite)}).`,
    personalDeclaracion: (p) => `${where.ca(p)}: despesa de personal. Cal una declaració amb les tasques, el % de dedicació i la data de pagament.`,
    pagoAntes: (p) => `${where.ca(p)}: la data de pagament és anterior a la de la factura. Comprova que no sigui un error en escriure-la.`,
    efectivo: (p) => `${where.ca(p)}: pagament en efectiu de ${fmt(p.importe)}. Només s'admet per sota de ${fmt(p.limite)}.`,
    tipo: (p) => `${where.ca(p)}: el tipus «${p.tipo}» no és entre els conceptes admesos (${p.lista}).`,
    excluido: (p) => `${where.ca(p)}: les despeses de tipus «${p.tipo}» no són subvencionables en aquesta convocatòria.`,
    ivaFalta: (p) => `${where.ca(p)}: no hi consta l'IVA. Si la factura en porta i el deduïu, desglossa'l: l'IVA deduïble no és subvencionable.`,
    duplicado: (p) => `${where.ca(p)}: la factura ${p.factura} de ${p.nif} ja apareix a la fila ${p.otra}.`,
    minimoSubvencion: (p) => `Has justificat ${fmt(p.total)}, menys que la subvenció concedida (${fmt(p.sub)}). L'ajut es reduirà al que s'hagi justificat.`,
    minimoPresupuesto: (p, l) => `El cost justificat (${fmt(p.coste)}) és el ${pct(p.pct, l)} % del pressupost (${fmt(p.pres)}). La subvenció es pot reduir proporcionalment.`,
    desviacion: (p, l) => `El cost es desvia un ${pct(p.pct, l)} % del pressupost. S'admet fins al ${p.max} %, i sempre motivat.`,
    indirectosSub: (p) => `Les despeses indirectes (${fmt(p.valor)}) superen el ${p.pct} % de la subvenció (màxim ${fmt(p.max)}).`,
    indirectosCoste: (p) => `Les despeses indirectes (${fmt(p.valor)}) superen el ${p.pct} % del cost total de l'activitat (màxim ${fmt(p.max)}).`,
    personalPct: (p) => `${where.ca(p)}: imputes el ${p.pct} % d'una despesa de personal. Aquestes bases admeten fins al ${p.max} %.`,
    tresOfertas: (p) => `Al proveïdor ${p.prov} li heu pagat ${fmt(p.base)} sense IVA. A partir de ${fmt(p.limite)} cal acreditar tres ofertes.`,
    sobrefinanciacion: (p) => `Subvenció (${fmt(p.sub)}) més altres ingressos (${fmt(p.otros)}) sumen ${fmt(p.sub + p.otros)}, més que el cost real justificat (${fmt(p.coste)}). Hi hauria excés de finançament.`,
    columnasFaltan: (p) => `No trobo aquestes columnes: ${p.lista}. Revisa els noms de la primera fila; pots partir de la plantilla.`,
    columnasSobran: (p) => `Columnes que no faig servir: ${p.lista}.`,
    plazoFalta: () => "No has indicat l'últim dia del termini de justificació, així que no puc comprovar si els pagaments arriben a temps.",
    sinDatos: () => 'No hi ha despeses per revisar. Enganxa la taula, puja un fitxer o carrega l\'exemple.',
  },
};

/** Texto de un hallazgo en el idioma pedido. */
export function findingText(f, lang = 'es') {
  const fn = (FINDINGS[lang] ?? FINDINGS.es)[f.key] ?? FINDINGS.es[f.key];
  return fn ? fn(f.params ?? {}, lang) : f.key;
}

/** Campo de un perfil en el idioma pedido (perfil.ca sobrescribe), con el castellano como respaldo. */
export function profileField(profile, field, lang = 'es') {
  return (lang !== 'es' && profile[lang]?.[field]) || profile[field];
}

export const UI = {
  es: {
    count: (n, one, many) => `${n} ${n === 1 ? one : many}`,
    errores: ['error', 'errores'], avisos: ['aviso', 'avisos'], notas: ['nota', 'notas'],
    limpio: 'Sin errores ni avisos en estas comprobaciones',
    niveles: { error: 'Error', aviso: 'Aviso', info: 'Nota' },
    totales: {
      n: 'Gastos', facturas: 'Total facturas', coste: 'Coste de la actividad', imputado: 'Imputado a la subvención',
      indirectos: 'Indirectos imputados', personal: 'Personal imputado', cubierto: 'Cubierto de la subvención',
    },
    referencia: 'Referencia', verFuente: 'Ver las bases o la fuente', tiposUsa: 'Usa uno de estos valores (vacío = directo):',
    tiposExcluidos: 'No subvencionables en esta convocatoria:', excelError: 'No se pudo leer el Excel. Guárdalo como CSV (separado por punto y coma) y súbelo de nuevo.',
    archivoCargado: (n) => `Archivo cargado: ${n}`, csvNombre: 'relacion_clasificada_gastos.csv',
  },
  ca: {
    count: (n, one, many) => `${n} ${n === 1 ? one : many}`,
    errores: ['error', 'errors'], avisos: ['avís', 'avisos'], notas: ['nota', 'notes'],
    limpio: 'Cap error ni avís en aquestes comprovacions',
    niveles: { error: 'Error', aviso: 'Avís', info: 'Nota' },
    totales: {
      n: 'Despeses', facturas: 'Total factures', coste: "Cost de l'activitat", imputado: 'Imputat a la subvenció',
      indirectos: 'Indirectes imputades', personal: 'Personal imputat', cubierto: 'Cobert de la subvenció',
    },
    referencia: 'Referència', verFuente: 'Veure les bases o la font', tiposUsa: 'Fes servir un d\'aquests valors (buit = directo):',
    tiposExcluidos: 'No subvencionables en aquesta convocatòria:', excelError: "No s'ha pogut llegir l'Excel. Desa'l com a CSV (separat per punt i coma) i torna'l a pujar.",
    archivoCargado: (n) => `Fitxer carregat: ${n}`, csvNombre: 'relacio_classificada_despeses.csv',
  },
};
