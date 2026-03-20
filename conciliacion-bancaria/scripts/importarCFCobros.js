/**
 * importarCFCobros.js
 *
 * Script de importación de datos de la hoja "CF Cobros" y "Transferencia Propietario"
 * del Excel "Hoja control - MES A MES.xlsx" a la tabla cashflow de Airtable.
 *
 * Genera registros Cash In (cobros al inquilino) y Cash Out (pagos al propietario)
 * para cada operación y mes.
 *
 * CORRECCIONES APLICADAS:
 *
 * 1. Cuando el Cash In tiene estado "Devuelta" (D en el Excel), el Cash Out
 *    (pago al propietario) NO se marca como "Devuelto". El pago al propietario
 *    es independiente de la devolución SEPA del inquilino.
 *
 * 2. Las operaciones sin gestión de cobro (gestionCobro vacío) con SEPA propietario
 *    solo generan Cash In con sujeto = "Propietario". No generan Cash Out,
 *    ya que el propietario paga directamente a Advancing.
 */

import XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Configuración Airtable ────────────────────────────────────────────────────

const AIRTABLE_BASE_ID = process.env.VITE_AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const CASHFLOW_TABLE_ID = 'tblxY6upsLDmqzaaL';

// IDs de campos de la tabla cashflow
const FIELD_IDS = {
  direccion: 'fld656RBx2XkCHzR7',
  statusIns: 'fldFyfq8PaqbCRgeN',
  statusOut: 'fldIMh0gNEA3TuaiG',
  fechaProgramada: 'fldrquziQqJoTn08B',
  importe: 'fldbkCQZwDR8a9kRP',
  sujeto: 'fldazRk0SXXdqQo9L',
  metodoPago: 'fldn69DhRftezHhcZ',
  sistemaPago: 'fldjNItVaCzrhlNhf',
  razon: 'fld17mZxxLYPQfUzr',
  linkDealBalance: 'fldyCWFzrTMhWs7FT',
  orden: 'fldc5yW3lEIo5OoE8',
};

// ─── Mapeos de estados ─────────────────────────────────────────────────────────

/**
 * Mapea el código de estado del Excel (CF Cobros) al valor de statusIns en Airtable.
 * Los estados en el Excel son case-insensitive.
 */
const STATUS_IN_MAP = {
  'c': 'Cobrado',
  'C': 'Cobrado',
  "c'": 'Cobrada con retraso',
  "C'": 'Cobrada con retraso',
  'p': 'Pendiente',
  'P': 'Pendiente',
  'd': 'Devuelta',
  'D': 'Devuelta',
  'pp': 'Pago parcial',
  'PP': 'Pago parcial',
  'r': 'Recuperada vía arrendatario',
  'R': 'Recuperada vía arrendatario',
  "r'": 'Recuperada vía DAS',
  "R'": 'Recuperada vía DAS',
  'das': 'Recuperada vía DAS',
  'DAS': 'Recuperada vía DAS',
  'i': 'Pendiente',           // Inicio / proyectado
  'I': 'Pendiente',
  'pr': 'Pendiente',          // Pre-remesa
  'PR': 'Pendiente',
};

/**
 * Determina el statusOut del Cash Out basándose en el statusIn.
 *
 * REGLA CLAVE: El estado "Devuelta" del Cash In NO se propaga al Cash Out.
 * El pago al propietario ocurre aunque el inquilino haya devuelto su SEPA.
 *
 * Solo se marca el Cash Out como "Devuelto" si el propio pago al propietario
 * fue devuelto, lo cual se gestiona por separado (no desde esta hoja).
 */
function resolveStatusOut(statusInCode) {
  const upper = String(statusInCode || '').trim().toUpperCase();

  // Si el Cash In fue cobrado (cualquier variante), el pago al propietario se considera Pagado
  if (['C', "C'", 'R', "R'", 'DAS'].includes(upper)) {
    return 'Pagado';
  }

  // FIX #1: Si el Cash In fue DEVUELTO, el Cash Out NO se marca como Devuelto.
  // El pago al propietario sigue siendo Pendiente (se paga igualmente).
  if (upper === 'D') {
    return 'Pendiente';
  }

  // Si el Cash In está pendiente o es pago parcial, el Cash Out también está pendiente
  if (['P', 'PP', '-', 'I', 'PR'].includes(upper) || upper === '') {
    return 'Pendiente';
  }

  return 'Pendiente';
}

// ─── Lectura del Excel ─────────────────────────────────────────────────────────

/**
 * Convierte un serial de fecha de Excel a Date de JavaScript.
 */
function excelSerialToDate(serial) {
  return new Date((serial - 25569) * 86400 * 1000);
}

/**
 * Lee y parsea las hojas "CF Cobros" y "Transferencia Propietario".
 */
function readExcel(filePath) {
  const wb = XLSX.readFile(filePath);

  // Leer CF Cobros
  const cfSheet = wb.Sheets['CF Cobros'];
  const cfData = XLSX.utils.sheet_to_json(cfSheet, { header: 1, range: 0, defval: '' });

  // Leer Transferencia Propietario
  const tpSheet = wb.Sheets['Transferencia Propietario'];
  const tpData = XLSX.utils.sheet_to_json(tpSheet, { header: 1, range: 0, defval: '' });

  return { cfData, tpData };
}

/**
 * Construye un mapa de operaciones desde "Transferencia Propietario".
 * Contiene información de gestión de cobro, pagador, precio Advancing, etc.
 */
function buildOperationMap(tpData) {
  const map = {};
  for (let i = 1; i < tpData.length; i++) {
    const row = tpData[i];
    const op = String(row[0] || '').trim();
    if (!op) continue;

    map[op] = {
      status: String(row[1] || '').trim(),
      importeMes: row[4],
      precioAdv: row[5],
      cuentaPropietario: String(row[12] || '').trim(),
      nombrePropietario: String(row[13] || '').trim(),
      concepto: String(row[14] || '').trim(),
      diaPago: row[15],
      gestionCobro: String(row[41] || '').trim(),         // "SI", "Advancing", o vacío
      pagador: String(row[55] || '').trim(),               // "Propietario", "Inquilino", etc.
      importeInquilino: row[52],
      importePropietario: row[53],
    };
  }
  return map;
}

/**
 * Extrae las columnas de meses del header de CF Cobros.
 * Cada mes tiene dos columnas: Importe (col impar desde 35) y Estado (col par desde 36).
 * La fecha serial está en row[0] en la columna impar.
 */
function extractMonthColumns(headerRow) {
  const months = [];
  for (let j = 35; j < headerRow.length; j += 2) {
    const serial = headerRow[j];
    if (serial && typeof serial === 'number') {
      const date = excelSerialToDate(serial);
      months.push({
        importeCol: j,
        estadoCol: j + 1,
        date,
        yearMonth: date.toISOString().slice(0, 7),
      });
    }
  }
  return months;
}

// ─── Generación de registros cashflow ──────────────────────────────────────────

/**
 * Determina si una operación es "sin gestión de cobro con SEPA propietario".
 * Estas operaciones tienen gestionCobro vacío (no "SI") y pagador = "Propietario".
 */
function isSinGestionConSepaPropietario(opInfo) {
  if (!opInfo) return false;
  return opInfo.gestionCobro !== 'SI' && opInfo.pagador === 'Propietario';
}

/**
 * Genera los registros de cashflow a partir de los datos del Excel.
 *
 * Para cada operación y mes con datos:
 *  - Genera siempre un Cash In (cobro)
 *  - Genera un Cash Out (pago propietario) SOLO si:
 *    a) La operación tiene gestión de cobro ("SI")
 *    b) O si el pagador NO es el propietario
 *
 * FIX #2: Las operaciones sin gestión de cobro con SEPA propietario
 *         solo generan Cash In con sujeto = "Propietario", sin Cash Out.
 */
function generateCashflowRecords(cfData, operationMap, options = {}) {
  const headerRow = cfData[0];
  const months = extractMonthColumns(headerRow);
  const records = [];
  const { targetMonth, dryRun } = options;

  for (let i = 2; i < cfData.length; i++) {
    const row = cfData[i];
    const opNumber = String(row[0] || '').trim();
    if (!opNumber) continue;

    const opInfo = operationMap[opNumber];
    const concepto = String(row[6] || '').trim();
    const importeMes = row[5];
    const sinGestionProp = isSinGestionConSepaPropietario(opInfo);

    for (const month of months) {
      // Si se especificó un mes target, saltar los demás
      if (targetMonth && month.yearMonth !== targetMonth) continue;

      const importe = row[month.importeCol];
      const estado = String(row[month.estadoCol] || '').trim();

      // Saltar meses sin datos (ni importe ni estado)
      if (!importe && !estado) continue;
      if (estado === '-' && !importe) continue;

      const importeNum = typeof importe === 'number' ? importe : parseFloat(importe);
      if (isNaN(importeNum) || importeNum <= 0) continue;

      // Estado vacío con importe → Pendiente (mes futuro/proyectado)
      const estadoEfectivo = estado === '' ? 'P' : estado;
      const statusIn = STATUS_IN_MAP[estadoEfectivo];
      if (!statusIn) {
        console.warn(`[WARN] Op ${opNumber}, mes ${month.yearMonth}: estado "${estado}" no reconocido, se omite.`);
        continue;
      }

      // Fecha programada: día 1 del mes (o día de cobro si aplica)
      const fechaProgramada = month.date.toISOString().slice(0, 10);

      // ─── Cash In ───────────────────────────────────────────────
      const cashIn = {
        direccion: 'In',
        statusIns: statusIn,
        importe: importeNum,
        fechaProgramada,
        razon: 'Renta',
        operacion: opNumber,
        concepto,
        mes: month.yearMonth,
      };

      // FIX #2: Si es sin gestión con SEPA propietario, el sujeto es "Propietario"
      if (sinGestionProp) {
        cashIn.sujeto = 'Propietario';
        cashIn.metodoPago = 'SEPA';
      } else {
        cashIn.sujeto = 'Pagador alquiler';
      }

      records.push(cashIn);

      // ─── Cash Out (pago propietario) ───────────────────────────
      // FIX #2: NO generar Cash Out para operaciones sin gestión con SEPA propietario.
      // En estos casos, el propietario paga directamente a Advancing (Cash In).
      // No hay un "pago al propietario" separado.
      if (sinGestionProp) {
        continue; // Solo Cash In para estas operaciones
      }

      // FIX #1: El statusOut NO hereda "Devuelto" del Cash In.
      // El pago al propietario ocurre aunque el inquilino devuelva su SEPA.
      const statusOut = resolveStatusOut(estadoEfectivo);

      // Calcular importe del Cash Out (renta menos comisión Advancing)
      let importeOut = importeNum;
      if (opInfo && opInfo.precioAdv && typeof opInfo.precioAdv === 'number') {
        importeOut = importeNum * (1 - opInfo.precioAdv);
        importeOut = Math.round(importeOut * 100) / 100;
      }

      const cashOut = {
        direccion: 'Out',
        statusOut,
        importe: importeOut,
        fechaProgramada,
        sujeto: 'Propietario',
        razon: 'Renta',
        operacion: opNumber,
        concepto,
        mes: month.yearMonth,
      };

      records.push(cashOut);
    }
  }

  return records;
}

// ─── Envío a Airtable ──────────────────────────────────────────────────────────

/**
 * Convierte un registro interno a formato de campos de Airtable.
 */
function toAirtableFields(record) {
  const fields = {};

  fields[FIELD_IDS.direccion] = record.direccion;
  fields[FIELD_IDS.importe] = record.importe;
  fields[FIELD_IDS.fechaProgramada] = record.fechaProgramada;
  fields[FIELD_IDS.razon] = record.razon;

  if (record.sujeto) {
    fields[FIELD_IDS.sujeto] = record.sujeto;
  }
  if (record.metodoPago) {
    fields[FIELD_IDS.metodoPago] = record.metodoPago;
  }
  if (record.direccion === 'In' && record.statusIns) {
    fields[FIELD_IDS.statusIns] = record.statusIns;
  }
  if (record.direccion === 'Out' && record.statusOut) {
    fields[FIELD_IDS.statusOut] = record.statusOut;
  }

  return fields;
}

/**
 * Envía registros a Airtable en lotes de 10 (límite de la API).
 */
async function sendToAirtable(records) {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
    console.error('Error: Se requieren VITE_AIRTABLE_BASE_ID y AIRTABLE_TOKEN como variables de entorno.');
    console.error('Ejemplo: VITE_AIRTABLE_BASE_ID=appXXX AIRTABLE_TOKEN=patXXX node scripts/importarCFCobros.js');
    process.exit(1);
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CASHFLOW_TABLE_ID}`;
  const batchSize = 10;
  let created = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const body = {
      records: batch.map(r => ({ fields: toAirtableFields(r) })),
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[ERROR] Batch ${Math.floor(i / batchSize) + 1}: HTTP ${res.status} - ${errText}`);
        errors += batch.length;
      } else {
        created += batch.length;
        console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} registros creados.`);
      }
    } catch (err) {
      console.error(`[ERROR] Batch ${Math.floor(i / batchSize) + 1}: ${err.message}`);
      errors += batch.length;
    }

    // Rate limiting: 5 requests/sec
    if (i + batchSize < records.length) {
      await new Promise(r => setTimeout(r, 220));
    }
  }

  return { created, errors };
}

// ─── Punto de entrada ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const monthArg = args.find(a => a.startsWith('--month='));
  const targetMonth = monthArg ? monthArg.split('=')[1] : null;

  const excelPath = resolve(__dirname, '..', 'Hoja control  - MES A MES.xlsx');
  console.log(`Leyendo Excel: ${excelPath}`);

  const { cfData, tpData } = readExcel(excelPath);
  console.log(`  CF Cobros: ${cfData.length - 2} operaciones`);
  console.log(`  Transferencia Propietario: ${tpData.length - 1} operaciones`);

  const operationMap = buildOperationMap(tpData);
  console.log(`  Mapa de operaciones: ${Object.keys(operationMap).length} entradas`);

  const records = generateCashflowRecords(cfData, operationMap, { targetMonth, dryRun });
  const cashIns = records.filter(r => r.direccion === 'In');
  const cashOuts = records.filter(r => r.direccion === 'Out');

  console.log(`\nRegistros generados:`);
  console.log(`  Cash In:  ${cashIns.length}`);
  console.log(`  Cash Out: ${cashOuts.length}`);
  console.log(`  Total:    ${records.length}`);

  // Estadísticas de correcciones
  const devueltasIn = cashIns.filter(r => r.statusIns === 'Devuelta');
  const sinGestionPropRecords = cashIns.filter(r => r.sujeto === 'Propietario');
  console.log(`\nEstadísticas de correcciones:`);
  console.log(`  Cash In con Devuelta: ${devueltasIn.length} (Cash Out NO marcados como Devuelto)`);
  console.log(`  Cash In sin gestión (sujeto Propietario): ${sinGestionPropRecords.length} (sin Cash Out asociado)`);

  if (targetMonth) {
    console.log(`\nFiltro de mes aplicado: ${targetMonth}`);
  }

  if (dryRun) {
    console.log('\n[DRY RUN] No se envían datos a Airtable.');
    console.log('\nPrimeros 20 registros:');
    records.slice(0, 20).forEach((r, idx) => {
      const status = r.direccion === 'In' ? r.statusIns : r.statusOut;
      console.log(`  ${idx + 1}. ${r.direccion} | Op: ${r.operacion} | ${r.mes} | €${r.importe} | ${status} | Sujeto: ${r.sujeto || '-'}`);
    });

    // Mostrar ejemplos de las correcciones
    console.log('\n--- Ejemplo FIX #1: Cash In Devuelta SIN Cash Out Devuelto ---');
    for (const devIn of devueltasIn.slice(0, 5)) {
      const matchingOut = cashOuts.find(
        o => o.operacion === devIn.operacion && o.mes === devIn.mes
      );
      console.log(`  Op: ${devIn.operacion} | Mes: ${devIn.mes} | In: Devuelta | Out: ${matchingOut ? matchingOut.statusOut : '(sin Cash Out)'}`);
    }

    console.log('\n--- Ejemplo FIX #2: Sin gestión, solo Cash In con sujeto Propietario ---');
    for (const rec of sinGestionPropRecords.slice(0, 5)) {
      const matchingOut = cashOuts.find(
        o => o.operacion === rec.operacion && o.mes === rec.mes
      );
      console.log(`  Op: ${rec.operacion} | Mes: ${rec.mes} | In sujeto: ${rec.sujeto} | Cash Out: ${matchingOut ? 'SÍ (ERROR!)' : 'NO (correcto)'}`);
    }

    return;
  }

  console.log('\nEnviando a Airtable...');
  const { created, errors } = await sendToAirtable(records);
  console.log(`\nResultado: ${created} creados, ${errors} errores.`);
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
