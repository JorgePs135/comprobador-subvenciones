// Perfiles: solo datos. Cada regla sale de un artículo de las bases citado en `cite`.
// Al publicarse una edición nueva hay que revisar las bases y actualizar `edicion`, `periodo` y lo que cambie.

const LEY_EFECTIVO = 'Ley 7/2012, art. 7 (redacción de la Ley 11/2021): no se puede pagar en efectivo 1.000 € o más si una de las partes es empresario o profesional.';

const GENERIC_CITE = {
  MINIMO: 'Si se justifica menos de lo concedido, la ayuda se reduce (art. 37 LGS y bases de cada convocatoria).',
  PERIODO: 'Solo son subvencionables los gastos del periodo de ejecución (art. 31.1 LGS).',
  PAGO_TARDE: 'El gasto tiene que estar pagado antes de que acabe el plazo de justificación (art. 31.2 LGS).',
  FECHA_PAGO: 'La relación clasificada incluye fecha de emisión y fecha de pago (art. 75.2 RD 887/2006).',
  ACREEDOR: 'La relación clasificada identifica al acreedor y el documento (art. 75.2 RD 887/2006).',
  EFECTIVO: LEY_EFECTIVO,
  SOBREFINANCIACION: 'La subvención junto con otros ingresos no puede superar el coste de la actividad (art. 19.3 LGS).',
  TRES_OFERTAS: 'Tres ofertas cuando el gasto supera los importes del contrato menor (art. 31.3 LGS).',
  DUPLICADO: 'Un mismo justificante no puede imputarse dos veces.',
};

export const PROFILES = {
  generico: {
    id: 'generico',
    slug: 'cuenta-justificativa-simplificada',
    nombre: 'Genérico: cuenta justificativa simplificada (cualquier convocatoria)',
    edicion: 'RD 887/2006, art. 75, y Ley 38/2003 (LGS)',
    fuente: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-13371',
    nota: 'Comprobaciones comunes. Las bases de tu convocatoria pueden fijar límites más estrictos: revísalas.',
    rules: { minimo: 'subvencion', limiteEfectivo: 1000, tresOfertas: 15000, avisoIva: true },
    cite: GENERIC_CITE,
    checklist: [
      'Memoria de actuación (actividades realizadas y resultados).',
      'Relación clasificada de gastos (acreedor, documento, importe, fechas de emisión y pago).',
      'Relación de otros ingresos o subvenciones que han financiado la actividad.',
      'Desviaciones respecto al presupuesto, si las hay.',
      'Facturas y justificantes de pago disponibles por si piden una muestra.',
    ],
  },

  madrid_ayto_deporte_2526: {
    id: 'madrid_ayto_deporte_2526',
    slug: 'ayuntamiento-madrid-subvenciones-deportivas',
    nombre: 'Ayuntamiento de Madrid: actividades deportivas y de competición 2025-2026',
    edicion: 'Convocatoria BDNS 895830 (decreto de 25-03-2026), puntos sexto y vigesimosegundo',
    fuente: 'https://www.infosubvenciones.es/bdnstrans/GE/es/convocatorias/895830',
    nota: 'Plazo: 3 meses desde que se publica la concesión en el BOAM. Indica la fecha exacta de fin de plazo.',
    rules: {
      minimo: 'subvencion',
      periodo: { inicio: '2025-09-01', fin: null },
      periodoExcepciones: ['inscripcion', 'inscripciones'],
      pagoEstrictamenteAntes: true,
      limiteEfectivo: 600,
      tiposExcluidos: ['inventariable'],
      indirectosMax: { pct: 0.08, sobre: 'subvencion' },
      tresOfertas: 15000,
      nifObligatorio: true,
      avisoIva: true,
    },
    cite: {
      ...GENERIC_CITE,
      PERIODO: 'Punto sexto 1.h: gastos realizados y pagados desde el 01-09-2025. Se admiten inscripciones federativas anteriores si son de la temporada 2025-26 (por eso, con tipo "inscripcion" es un aviso).',
      PAGO_TARDE: 'Punto sexto 1.d y 1.h: pagados hasta el día anterior al fin del plazo de justificación.',
      EFECTIVO: 'Punto vigesimosegundo: efectivo solo en facturas de menos de 600 €, con factura o recibí firmado.',
      EXCLUIDO: 'Punto sexto 1.b: no se admiten bienes inventariables (vida útil de más de 12 meses).',
      INDIRECTOS: 'Punto sexto 1.j: los costes indirectos no pueden superar el 8 % de la subvención concedida.',
      TRES_OFERTAS: 'Punto sexto 1.g: tres ofertas cuando un proveedor llega a 15.000 € de base imponible.',
      NIF: 'Punto vigesimosegundo 1.b: identificación del acreedor con nombre y NIF.',
      SOBREFINANCIACION: 'Punto sexto 1.e y certificado del punto vigesimosegundo 1.c.',
    },
    checklist: [
      'Una única memoria de actuación (líneas A y/o B) con las condiciones y los resultados.',
      'Relación numerada y clasificada de gastos (nombre y NIF del acreedor, importe, fechas) del 01-09-2025 al 31-08-2026, con la fuente de financiación y su % en cada gasto.',
      'Certificado de destino íntegro y de que la ayuda más otros ingresos no supera el 100 % del coste.',
      'Certificado de difusión de la financiación municipal (medios utilizados).',
      'Documentación de los rendimientos financieros generados por los fondos, si los hay.',
      'Publicidad de la subvención según la Ley 19/2013, si os aplica (art. 3.b).',
      'Justificantes de pago: resguardo de transferencia, extracto del cheque o recibí si se pagó en efectivo (< 600 €).',
    ],
  },

  diba_cultura_popular_2026: {
    id: 'diba_cultura_popular_2026',
    slug: 'diputacio-barcelona-cultura-popular',
    nombre: 'Diputació de Barcelona: cultura popular y tradicional 2026',
    edicion: 'Convocatoria BDNS 884163 (bases específicas 2026), arts. 16 y 20',
    fuente: 'https://www.infosubvenciones.es/bdnstrans/GE/es/convocatorias/884163',
    nota: 'Periodos de justificación: del 13-10 al 16-11-2026 (voluntario) y del 02-01 al 28-02-2027. Indica como presupuesto el coste total previsto de la actividad.',
    rules: {
      minimo: 'presupuesto',
      periodo: { inicio: '2026-01-01', fin: '2026-12-31' },
      limiteEfectivo: 1000,
      indirectosMax: { pct: 0.05, sobre: 'total' },
      personalMaxPorcentajeFila: 0.10,
      desviacionMax: 0.30,
      avisoIva: true,
    },
    cite: {
      ...GENERIC_CITE,
      PERIODO: 'Art. 16.2: facturas y recibos de gastos del 01-01-2026 al 31-12-2026.',
      PAGO_TARDE: 'Arts. 16.2 y 20.4: pagado antes de que acabe el periodo de justificación.',
      INDIRECTOS: 'Art. 16.1: los gastos indirectos no pueden superar el 5 % del coste total de la actividad.',
      PERSONAL: 'Art. 16.1: se considera subvencionable un máximo del 10 % de los gastos del personal administrativo, técnico y de producción. Revisa cómo lo aplica la Diputació.',
      DESVIACION: 'Art. 20.6: se admiten desviaciones motivadas de hasta el 30 % del presupuesto.',
      MINIMO: 'Art. 20.2.b: hay que justificar el coste total de la actividad e indicar cómo se ha financiado.',
      IVA: 'Art. 16.1: el IVA solo es subvencionable si no se puede deducir.',
    },
    checklist: [
      'Modelo normalizado de diba.cat/web/cultura/subvencions, que se presenta en la sede electrónica.',
      'Memoria de actuación (actividades, resultados y desviaciones respecto al presupuesto).',
      'Memoria económica: relación clasificada con concepto, acreedor, importe, fecha de emisión, fecha de pago y % imputado; coste total y su financiación.',
      'Si la concesión supera 3.000 €: muestra de las facturas imputadas a la Diputació.',
      'Material gráfico o digital donde conste la colaboración de la Diputació (art. 26).',
      'Declaraciones responsables del formulario (justificantes no usados en otra subvención, sin IVA deducible, financiación ≤ coste…).',
    ],
  },

  dipta_cultura_singular: {
    id: 'dipta_cultura_singular',
    slug: 'diputacio-tarragona-activitats-culturals',
    nombre: 'Diputació de Tarragona: actividades culturales o de interés ciudadano singulares',
    edicion: 'Basado en la convocatoria 2025 (BDNS 837602). SIN VERIFICAR contra las bases de 2026.',
    fuente: 'https://www.infosubvenciones.es/bdnstrans/GE/es/convocatorias/837602',
    nota: 'Supuesto: la edición 2026 mantiene el esquema (ejecución en el año natural; justificación de enero a marzo del año siguiente). Comprueba las fechas en tus bases. Indica como presupuesto el presupuesto elegible aprobado.',
    rules: {
      minimo: 'presupuesto',
      periodo: { inicio: '2026-01-01', fin: '2026-12-31' },
      limiteEfectivo: 1000,
      tiposExcluidos: ['funcionamiento', 'inversion', 'inventariable'],
      personalRequiereDeclaracion: true,
      avisoIva: true,
    },
    cite: {
      ...GENERIC_CITE,
      PERIODO: 'Apartado 14 (ed. 2025): ejecución del 1 de enero al 31 de diciembre, sin ampliación.',
      MINIMO: 'Apartado 16 (ed. 2025): hay que justificar todo el presupuesto elegible; si no, la subvención se reduce en proporción.',
      EXCLUIDO: 'Apartado 2 (ed. 2025): quedan excluidos el funcionamiento ordinario (sede, suministros, seguros, oficina…), las inversiones y los inventariables.',
      PERSONAL: 'Apartados 2.d y 15.1 (ed. 2025): el personal solo es subvencionable con una declaración de tareas y % de dedicación.',
      IVA: 'Apartado 2.e (ed. 2025): no es subvencionable el IVA deducible, compensable o repercutible.',
    },
    checklist: [
      'Trámite de justificación en la sede electrónica de la Diputació (carpeta del beneficiario).',
      'Memoria explicativa.',
      'Balance económico de la actividad (ingresos y gastos).',
      'Relación de todos los gastos pagados con su fecha de pago.',
      'Declaración de otras subvenciones o ayudas para la misma actuación.',
      'Declaración de estar al corriente con Hacienda y la Seguridad Social, si la de la solicitud tiene más de 6 meses.',
      'Si hay personal: declaración con tareas, % de dedicación, importe y fecha de pago.',
      'Si procede: certificados negativos de delitos sexuales del personal (protección del menor).',
      'Pruebas de difusión con "Con el apoyo de la Diputación de Tarragona" y el logotipo, más una noticia en la web y en las redes.',
    ],
  },

  xunta_pr945c_linea1: {
    slug: 'xunta-clubes-deportivos-pr945c',
    id: 'xunta_pr945c_linea1',
    nombre: 'Xunta de Galicia: clubes deportivos PR945C, línea I',
    edicion: 'Bases de la ed. 2025 (DOG 23-12-2024, art. 15). Periodo de la ed. 2026 según la nota de prensa de la Xunta: gastos del ejercicio 2025.',
    fuente: 'https://www.xunta.gal/notas-de-prensa/-/nova/021000/xunta-convoca-primeiras-axudas-2026-para-apoio-entidades-deportivas',
    nota: 'Plazo: 1 mes desde la publicación de la resolución definitiva. Usa el campo "tipo" con los conceptos admitidos.',
    rules: {
      minimo: 'subvencion',
      periodo: { inicio: '2025-01-01', fin: '2025-12-31' },
      limiteEfectivo: 1000,
      tiposPermitidos: ['licencias', 'seguros', 'inscripciones', 'arbitrajes', 'entrenadores', 'transporte', 'alojamiento',
        'material', 'botiquin', 'ambulancias', 'instalaciones', 'personal', 'covid', 'profesionales'],
      nifObligatorio: true,
      avisoIva: true,
    },
    cite: {
      ...GENERIC_CITE,
      MINIMO: 'Art. 15.1.b.2: gastos efectuados y pagados por un importe al menos igual al de la subvención concedida (anexo XI).',
      TIPO: 'Art. 15.1.b.2, letras a)–n): lista cerrada de conceptos (licencias, seguros, inscripciones, arbitrajes, entrenadores, transporte, alojamiento, material no inventariable, botiquín, ambulancias, alquiler de instalaciones, personal, COVID, profesionales de apoyo).',
      PERIODO: 'Anexo XI: línea I, gastos del año natural anterior (ed. 2026: ejercicio 2025, según la nota de prensa de la Xunta).',
      NIF: 'Anexo XI: columna NIF del acreedor obligatoria.',
    },
    checklist: [
      'Anexo VIII: solicitud del pago restante (Carpeta ciudadana, sede electrónica de la Xunta).',
      'Anexo IX: declaración de otras ayudas para la misma finalidad, actualizada.',
      'Anexo X: memoria de actuación (competiciones, resultados, entrenadores).',
      'Anexo XI: relación clasificada (nº, referencia, concepto, nº de documento, fecha de emisión, fecha de pago, acreedor, NIF, importe).',
      'Seguros: solo si no los ha financiado otra ayuda.',
      'Facturas de menos de 1.000 €: vale el justificante de recepción del proveedor (art. 15.4).',
    ],
  },
};

// Traducciones al catalán (perfil.ca sobrescribe nombre, nota, cite y checklist). Pendientes de revisión nativa.
const LLEI_EFECTIU = "Llei 7/2012, art. 7 (redacció de la Llei 11/2021): no es pot pagar en efectiu 1.000 € o més si una de les parts és empresari o professional.";
const GENERIC_CITE_CA = {
  MINIMO: "Si es justifica menys del que s'ha concedit, l'ajut es redueix (art. 37 LGS i bases de cada convocatòria).",
  PERIODO: "Només són subvencionables les despeses del període d'execució (art. 31.1 LGS).",
  PAGO_TARDE: "La despesa ha d'estar pagada abans que acabi el termini de justificació (art. 31.2 LGS).",
  FECHA_PAGO: "La relació classificada inclou la data d'emissió i la de pagament (art. 75.2 RD 887/2006).",
  ACREEDOR: 'La relació classificada identifica el creditor i el document (art. 75.2 RD 887/2006).',
  EFECTIVO: LLEI_EFECTIU,
  SOBREFINANCIACION: "La subvenció juntament amb altres ingressos no pot superar el cost de l'activitat (art. 19.3 LGS).",
  TRES_OFERTAS: 'Tres ofertes quan la despesa supera els imports del contracte menor (art. 31.3 LGS).',
  DUPLICADO: "Un mateix justificant no es pot imputar dues vegades.",
};

PROFILES.generico.ca = {
  nombre: 'Genèric: compte justificatiu simplificat (qualsevol convocatòria)',
  nota: 'Comprovacions comunes. Les bases de la teva convocatòria poden fixar límits més estrictes: revisa-les.',
  cite: GENERIC_CITE_CA,
  checklist: [
    "Memòria d'actuació (activitats fetes i resultats).",
    "Relació classificada de despeses (creditor, document, import, dates d'emissió i de pagament).",
    "Relació d'altres ingressos o subvencions que han finançat l'activitat.",
    'Desviacions respecte al pressupost, si n\'hi ha.',
    'Factures i justificants de pagament disponibles per si en demanen una mostra.',
  ],
};

PROFILES.diba_cultura_popular_2026.ca = {
  nombre: 'Diputació de Barcelona: cultura popular i tradicional 2026',
  nota: "Períodes de justificació: del 13-10 al 16-11-2026 (voluntari) i del 02-01 al 28-02-2027. Indica com a pressupost el cost total previst de l'activitat.",
  cite: {
    ...GENERIC_CITE_CA,
    PERIODO: "Art. 16.2: factures i rebuts de despeses de l'01-01-2026 al 31-12-2026.",
    PAGO_TARDE: 'Arts. 16.2 i 20.4: pagat abans que acabi el període de justificació.',
    INDIRECTOS: "Art. 16.1: les despeses indirectes no poden superar el 5 % del cost total de l'activitat.",
    PERSONAL: "Art. 16.1: es considera subvencionable un màxim del 10 % de les despeses de personal administratiu, tècnic i de producció. Revisa com ho aplica la Diputació.",
    DESVIACION: 'Art. 20.6: s\'admeten desviacions motivades de fins al 30 % del pressupost.',
    MINIMO: "Art. 20.2.b: cal justificar el cost total de l'activitat i indicar com s'ha finançat.",
    IVA: "Art. 16.1: l'IVA només és subvencionable si no es pot deduir.",
  },
  checklist: [
    'Model normalitzat de diba.cat/web/cultura/subvencions, que es presenta a la seu electrònica.',
    "Memòria d'actuació (activitats, resultats i desviacions respecte al pressupost).",
    "Memòria econòmica: relació classificada amb concepte, creditor, import, data d'emissió, data de pagament i % imputat; cost total i com s'ha finançat.",
    'Si la concessió supera 3.000 €: mostra de les factures imputades a la Diputació.',
    'Material gràfic o digital on consti la col·laboració de la Diputació (art. 26).',
    "Declaracions responsables del formulari (justificants no fets servir en una altra subvenció, sense IVA deduïble, finançament ≤ cost…).",
  ],
};

PROFILES.dipta_cultura_singular.ca = {
  nombre: "Diputació de Tarragona: activitats culturals o d'interès ciutadà singulars",
  nota: "Suposició: l'edició 2026 manté l'esquema (execució durant l'any natural; justificació de gener a març de l'any següent). Comprova les dates a les teves bases. Indica com a pressupost el pressupost elegible aprovat.",
  cite: {
    ...GENERIC_CITE_CA,
    PERIODO: "Apartat 14 (ed. 2025): execució de l'1 de gener al 31 de desembre, sense ampliació.",
    MINIMO: "Apartat 16 (ed. 2025): cal justificar tot el pressupost elegible; si no, la subvenció es redueix proporcionalment.",
    EXCLUIDO: "Apartat 2 (ed. 2025): queden excloses les despeses de funcionament ordinari (seu, subministraments, assegurances, oficina…), les inversions i els inventariables.",
    PERSONAL: 'Apartats 2.d i 15.1 (ed. 2025): el personal només és subvencionable amb una declaració de tasques i % de dedicació.',
    IVA: "Apartat 2.e (ed. 2025): no és subvencionable l'IVA deduïble, compensable o repercutible.",
  },
  checklist: [
    'Tràmit de justificació a la seu electrònica de la Diputació (carpeta del beneficiari).',
    'Memòria explicativa.',
    "Balanç econòmic de l'activitat (ingressos i despeses).",
    'Relació de totes les despeses pagades amb la data de pagament.',
    "Declaració d'altres subvencions o ajuts per a la mateixa actuació.",
    "Declaració d'estar al corrent amb Hisenda i la Seguretat Social, si la de la sol·licitud té més de 6 mesos.",
    'Si hi ha personal: declaració amb tasques, % de dedicació, import i data de pagament.',
    'Si escau: certificats negatius de delictes sexuals del personal (protecció del menor).',
    'Proves de difusió amb «Amb el suport de la Diputació de Tarragona» i el logotip, i una notícia al web i a les xarxes.',
  ],
};
