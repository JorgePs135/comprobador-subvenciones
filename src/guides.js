// Contenido de las guías por convocatoria. Las reglas y la lista de documentos salen de profiles.js
// para que guía y comprobador no se contradigan; aquí solo va el texto introductorio y los plazos.

export const GUIDES = {
  generico: {
    es: {
      title: 'Cómo hacer la cuenta justificativa simplificada de una subvención',
      description: 'Qué incluye la cuenta justificativa simplificada (art. 75 RD 887/2006), la relación clasificada de gastos y los errores que provocan reintegros. Con comprobador gratuito.',
      intro: [
        'Si tu asociación o club ha recibido una subvención de menos de 60.000 €, lo normal es que la justifique con una <strong>cuenta justificativa simplificada</strong> (artículo 75 del Reglamento de la Ley General de Subvenciones). No hace falta entregar todas las facturas: basta con una memoria de actuación y una relación clasificada de gastos. La administración pide después una muestra de justificantes.',
        'La relación clasificada es donde se concentran los errores: facturas fuera de plazo, pagos en efectivo por encima del límite, gastos sin pagar o una misma factura imputada dos veces. Son fáciles de evitar si se revisan antes de presentar.',
      ],
      plazo: 'El plazo lo fijan las bases de cada convocatoria. Si no dicen nada, el máximo general es de tres meses desde que termina el plazo para hacer la actividad (art. 30.2 LGS).',
    },
    ca: {
      title: 'Com fer el compte justificatiu simplificat d\'una subvenció',
      description: "Què inclou el compte justificatiu simplificat (art. 75 RD 887/2006), la relació classificada de despeses i els errors que provoquen reintegraments. Amb comprovador gratuït.",
      intro: [
        "Si la teva associació o club ha rebut una subvenció de menys de 60.000 €, el més habitual és justificar-la amb un <strong>compte justificatiu simplificat</strong> (article 75 del Reglament de la Llei general de subvencions). No cal lliurar totes les factures: n'hi ha prou amb una memòria d'actuació i una relació classificada de despeses. Després, l'administració en demana una mostra.",
        "La relació classificada és on es concentren els errors: factures fora de termini, pagaments en efectiu per sobre del límit, despeses sense pagar o una mateixa factura imputada dues vegades. Són fàcils d'evitar si es revisen abans de presentar-la.",
      ],
      plazo: "El termini el fixen les bases de cada convocatòria. Si no en diuen res, el màxim general és de tres mesos des que acaba el termini per fer l'activitat (art. 30.2 LGS).",
    },
  },
  madrid_ayto_deporte_2526: {
    es: {
      title: 'Justificar la subvención deportiva del Ayuntamiento de Madrid 2025-2026',
      description: 'Plazo, documentos y reglas para justificar la subvención de actividades deportivas y de competición del Ayuntamiento de Madrid (temporada 2025-2026): efectivo, indirectos, fuentes de financiación.',
      intro: [
        'La convocatoria de subvenciones para actividades deportivas y de competición del Ayuntamiento de Madrid (BDNS 895830) se justifica con una <strong>cuenta justificativa simplificada única</strong>, aunque la entidad tenga ayuda para la línea A y para varios equipos de la línea B.',
        'Tiene reglas propias más estrictas que la norma general: el efectivo solo se admite en facturas de <strong>menos de 600 €</strong>, los costes indirectos no pueden pasar del <strong>8 % de la subvención</strong> y no se aceptan bienes inventariables. Además, en cada gasto hay que indicar la fuente de financiación y su porcentaje.',
      ],
      plazo: 'Tres meses desde que se publica la concesión en el Boletín Oficial del Ayuntamiento de Madrid. Los gastos deben corresponder a la temporada del 1 de septiembre de 2025 al 31 de agosto de 2026 y estar pagados antes del fin de ese plazo.',
    },
  },
  diba_cultura_popular_2026: {
    es: {
      title: 'Justificar la subvención de cultura popular de la Diputació de Barcelona 2026',
      description: 'Periodos de justificación (13-10 a 16-11-2026 y 2-1 a 28-2-2027), memoria económica, límites de indirectos (5 %) y desviación (30 %) de la convocatoria de cultura popular y tradicional.',
      intro: [
        'La convocatoria de la Diputació de Barcelona para actividades de cultura popular y tradicional de 2026 (BDNS 884163) se justifica con el <strong>modelo normalizado</strong> de su web, presentado en la sede electrónica, en forma de cuenta justificativa simplificada.',
        'Hay que justificar el <strong>coste total</strong> de la actividad, no solo la parte subvencionada, e indicar el porcentaje de cada factura que se imputa a la Diputació. Los gastos indirectos no pueden superar el 5 % del coste total, y la desviación respecto al presupuesto, el 30 %.',
      ],
      plazo: 'Periodo voluntario del 13 de octubre al 16 de noviembre de 2026. Quien no justifique entonces debe hacerlo del 2 de enero al 28 de febrero de 2027. Los gastos son del año 2026.',
    },
    ca: {
      title: 'Justificar la subvenció de cultura popular de la Diputació de Barcelona 2026',
      description: "Períodes de justificació (13-10 a 16-11-2026 i 2-1 a 28-2-2027), memòria econòmica i límits d'indirectes (5 %) i de desviació (30 %) de la convocatòria de cultura popular i tradicional.",
      intro: [
        "La convocatòria de la Diputació de Barcelona per a activitats de cultura popular i tradicional del 2026 (BDNS 884163) es justifica amb el <strong>model normalitzat</strong> del seu web, presentat a la seu electrònica, en forma de compte justificatiu simplificat.",
        "Cal justificar el <strong>cost total</strong> de l'activitat, no només la part subvencionada, i indicar el percentatge de cada factura que s'imputa a la Diputació. Les despeses indirectes no poden superar el 5 % del cost total, i la desviació respecte al pressupost, el 30 %.",
      ],
      plazo: 'Període voluntari del 13 d\'octubre al 16 de novembre de 2026. Qui no justifiqui llavors ho ha de fer del 2 de gener al 28 de febrer de 2027. Les despeses són de l\'any 2026.',
    },
  },
  dipta_cultura_singular: {
    es: {
      title: 'Justificar la subvención de actividades culturales singulares de la Diputació de Tarragona',
      description: 'Qué hay que presentar para justificar la subvención de actividades culturales o de interés ciudadano singulares de la Diputació de Tarragona: balance, gastos excluidos y difusión.',
      intro: [
        'La convocatoria de la Diputació de Tarragona para actividades culturales o de interés ciudadano de carácter singular se justifica en su sede electrónica. Hay que justificar <strong>todo el presupuesto elegible</strong>: si se gasta menos, la subvención se reduce en proporción.',
        'Quedan fuera los gastos de funcionamiento ordinario (sede, suministros, seguros, oficina), las inversiones y el IVA deducible. La difusión con el logotipo de la Diputació es obligatoria y se presenta con la justificación.',
      ],
      plazo: 'En la edición 2025, la actividad se ejecutaba entre el 1 de enero y el 31 de diciembre y se justificaba del 8 de enero al 31 de marzo de 2026, sin ampliación. Comprueba las fechas en las bases de tu edición: esta guía se basa en la de 2025.',
    },
    ca: {
      title: "Justificar la subvenció d'activitats culturals singulars de la Diputació de Tarragona",
      description: "Què cal presentar per justificar la subvenció d'activitats culturals o d'interès ciutadà singulars de la Diputació de Tarragona: balanç, despeses excloses i difusió.",
      intro: [
        "La convocatòria de la Diputació de Tarragona per a activitats culturals o d'interès ciutadà de caràcter singular es justifica a la seu electrònica. Cal justificar <strong>tot el pressupost elegible</strong>: si es gasta menys, la subvenció es redueix proporcionalment.",
        "En queden fora les despeses de funcionament ordinari (seu, subministraments, assegurances, oficina), les inversions i l'IVA deduïble. La difusió amb el logotip de la Diputació és obligatòria i es presenta amb la justificació.",
      ],
      plazo: "A l'edició 2025, l'activitat s'executava entre l'1 de gener i el 31 de desembre i es justificava del 8 de gener al 31 de març de 2026, sense ampliació. Comprova les dates a les bases de la teva edició: aquesta guia es basa en la del 2025.",
    },
  },
  xunta_pr945c_linea1: {
    es: {
      title: 'Justificar la ayuda de la Xunta a clubes deportivos (PR945C)',
      description: 'Anexo XI, conceptos subvencionables (licencias, arbitrajes, transporte…) y plazo para justificar la ayuda de la Xunta de Galicia a clubes deportivos, línea I.',
      intro: [
        'La ayuda de la Xunta de Galicia a clubes deportivos, sociedades anónimas deportivas y secciones deportivas (procedimiento PR945C) se justifica en la Carpeta ciudadana de la sede electrónica con el <strong>anexo VIII</strong> (solicitud del pago) y una cuenta justificativa simplificada: anexos IX, X y XI.',
        'En la línea I solo valen los conceptos de una <strong>lista cerrada</strong>: licencias, seguros, inscripciones, arbitrajes, entrenadores, transporte, alojamiento y manutención, material no inventariable, botiquín, ambulancias, alquiler de instalaciones, personal y profesionales de apoyo. Hay que justificar, como mínimo, el importe concedido.',
      ],
      plazo: 'Un mes desde la publicación de la resolución definitiva. En la línea I los gastos son del año anterior a la convocatoria (en la de 2026, el ejercicio 2025). Esta guía se basa en las bases de 2025 y en la nota de prensa de la convocatoria de 2026.',
    },
  },
};
