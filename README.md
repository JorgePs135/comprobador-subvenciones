# Comprobador de justificación de subvenciones (v0)

Página web estática que revisa la **relación clasificada de gastos** de una subvención (cuenta justificativa simplificada)
antes de presentarla. Todo se ejecuta en el navegador: no hay servidor, base de datos ni envío de datos.
Solo se descarga de cdnjs la librería SheetJS, y únicamente cuando el usuario sube un `.xlsx`.

## Estructura

```
comprobador/
├── index.html                    interfaz
├── style.css                     estilos (claro/oscuro, móvil)
├── ejemplo_relacion_gastos.csv   plantilla y datos de ejemplo
├── src/engine.js                 motor: lectura CSV, fechas, importes, NIF y comprobaciones (funciones puras)
├── src/profiles.js               perfiles por convocatoria: solo datos, con cita de cada regla
├── src/app.js                    conexión con la página
└── tests/engine.test.js          tests (node:test, sin dependencias)
```

## Ejecutar en Windows

Requisitos: Node.js 18 o superior (para los tests) y Python 3 (solo para servir la página en local).

```bash
cd "D:\Datos Usuario\Desktop\negocio_digital\comprobador"
```

```bash
npm test
```

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Después abre http://127.0.0.1:8765. No funciona con doble clic sobre `index.html`, porque los navegadores bloquean los módulos JS en `file://`.

## Comprobaciones

| Código | Qué mira |
|---|---|
| IMPORTE, ACREEDOR, FECHA_EMISION, FECHA_PAGO, NIF | Datos obligatorios de la relación (art. 75.2 RD 887/2006), NIF con dígito de control |
| PERIODO | Factura fuera del periodo subvencionable |
| PAGO_TARDE / PAGO_ANTES | Pago después del fin de plazo de justificación / pago anterior a la factura |
| EFECTIVO | Efectivo por encima del límite (1.000 € por ley; 600 € en el Ayto. de Madrid) |
| DUPLICADO | Misma factura (NIF + número) dos veces |
| PORCENTAJE, IVA | % imputado fuera de 0–100; IVA mayor que el total; IVA deducible |
| TIPO / EXCLUIDO | Conceptos fuera de la lista cerrada (Xunta) o excluidos (inventariables, funcionamiento…) |
| MINIMO | Justificado < subvención, o coste < presupuesto, según la convocatoria |
| INDIRECTOS, PERSONAL, DESVIACION | Topes de cada convocatoria (8 % de la subvención en Madrid; 5 % del coste, 10 % de personal y 30 % de desviación en Barcelona) |
| TRES_OFERTAS | Proveedor con ≥ 15.000 € sin IVA |
| SOBREFINANCIACION | Subvención + otros ingresos > coste real |

Niveles: **error** (incumple una regla verificable), **aviso** (hay que revisarlo) y **nota**. Nunca dice "justificación correcta".

## Perfiles y su estado

| Perfil | Fuente | Estado |
|---|---|---|
| Genérico | RD 887/2006 y LGS | Reglas comunes |
| Ayto. Madrid, deporte 2025-26 | BDNS 895830 | Bases 2026 leídas |
| Diputació de Barcelona, cultura popular 2026 | BDNS 884163 | Bases 2026 leídas |
| Diputació de Tarragona, cultura singular | BDNS 837602 | **Bases 2025**; periodo 2026 supuesto |
| Xunta PR945C, línea I | Bases 2025 + nota de prensa 2026 | **Texto de 2026 sin leer** |

Mantenimiento anual: cuando salga cada convocatoria nueva, leer las bases y actualizar `edicion`, `periodo` y las reglas que cambien.
Añadir un test por cada regla nueva.

## Publicación

- Web: https://jorgeps135.github.io/comprobador-subvenciones/ (GitHub Pages, rama `main`, raíz).
- Para publicar cambios: `node scripts/build.js`, `npm test`, commit y `git push`. Pages se actualiza en 1–2 minutos.
- Licencia: todos los derechos reservados (ver `LICENSE`).

## Pendiente

- Revisión del catalán por una persona nativa.
- Lista de espera: falta la URL del formulario (ver `../06_lista_espera.md`).
- Bases de 2026 de Tarragona y de la Xunta.
