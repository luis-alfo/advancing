// ============================================================================
// AIRTABLE AUTOMATION SCRIPT: Retrospectiva — Migrar datos de Google Sheets
// ============================================================================
//
// TRIGGER: "When record matches conditions" en tabla balance
//   - Condiciones: crearRetro is checked
//
// INPUT VARIABLES (configurar en la automatización):
//   - balanceRecordId: Record ID del registro de balance (del trigger)
//
// PREREQUISITOS:
//   1. Google Sheet con "CF Cobros" y "Transferencia Propietario" (compartido con enlace)
//   2. API Key de Google Sheets (Google Cloud Console)
//   3. Campos "crearRetro" (checkbox) y "avisoRetro" (long text) en tabla balance
//
// FUNCIONAMIENTO:
//   1. Lee balance → linkDeal → numOperacion (indexDeal)
//   2. fetch() → Google Sheets API para leer fila del Excel
//   3. Parsea pares Importe/Estado por mes
//   4. Crea rentas tipo "Alquiler" + "Comisión Advancing" (batch)
//   5. Crea cashflows In (cobro inquilino) + Out (pago propietario) (batch)
//   6. Escribe log en avisoRetro
// ============================================================================

const config = input.config();
const balanceRecordId = config.balanceRecordId;

// --- CONFIGURACION GOOGLE SHEETS ---
// TODO: Reemplazar con valores reales antes de usar
const GOOGLE_API_KEY = 'TU_API_KEY_AQUI';
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
const SHEET_CF_COBROS = 'CF Cobros';
const SHEET_TRANSF_PROP = 'Transferencia Propietario';

// Columnas mensuales en CF Cobros: empiezan en col 36 (AJ), 77 meses × 2 cols = 154 cols
const MONTHLY_START_COL = 36; // AJ (0-indexed en la API: 35)
const MONTHLY_PAIR_COUNT = 77;

// --- Referencias a tablas ---
const balanceTable = base.getTable('tblYNdOLuMvpBavEu');
const dealsTable = base.getTable('tblWnB9SCfCFoXzfW');
const rentasTable = base.getTable('tbl2izIaOR37sRHGg');
const cashflowTable = base.getTable('tblxY6upsLDmqzaaL');

// --- Field IDs ---
// Balance
const FIELD_LINK_DEAL = 'fldOnUYgysh29VHMe';              // linkDeal
const FIELD_LINK_MESES = 'fldFlp2wDVWljyTtC';             // linkMeses (rentas vinculadas)
const FIELD_BALANCE_IMPORTE = 'fldtJw4GfIzEtc7h2';        // importe
const FIELD_CREAR_RETRO = 'crearRetro';                    // CREAR: checkbox
const FIELD_AVISO_RETRO = 'avisoRetro';                    // CREAR: long text

// Deals
const FIELD_DEAL_INDEX = 'fldJ77NBAlUHSyFmY';             // indexDeal (numOperacion)
const FIELD_DEAL_COMISION_IVA = 'fldELB2u320ihPDo4';       // comisionProductoConIVA
const FIELD_DEAL_COBRO_SERVICIO = 'fldxdjQwDUbL6sAyp';    // cobroServicio (modalidad)
const FIELD_DEAL_PAGADOR_SERVICIO = 'fldDUjy7jrW8rYdDo';  // pagadorServicio

// Rentas
const FIELD_RENTA_FECHA = 'fldSdtfW7UfIw8z4V';
const FIELD_RENTA_IMPORTE = 'fld2DbSB516n1bU8f';
const FIELD_RENTA_TIPO = 'fldTWeJAYDxWOZWPJ';
const FIELD_RENTA_DEAL_BALANCE = 'fldfh0vDzeqRuTFFE';
const FIELD_RENTA_IMPORTE_SERVICIO = 'fldS4Zqn2KLOox9jG';
const FIELD_RENTA_ORDEN = 'fld5NwGSUP5onAOKd';
const FIELD_RENTA_SISTEMA_PAGO = 'fldKBseprTEyZysG8';

// Cashflows
const FIELD_CF_DIRECCION = 'fld656RBx2XkCHzR7';
const FIELD_CF_IMPORTE = 'fldbkCQZwDR8a9kRP';
const FIELD_CF_FECHA_PROG = 'fldrquziQqJoTn08B';
const FIELD_CF_STATUS_INS = 'fldFyfq8PaqbCRgeN';
const FIELD_CF_STATUS_OUT = 'fldIMh0gNEA3TuaiG';
const FIELD_CF_LINK_RENTA = 'fldsTJCCfItHDoCgS';
const FIELD_CF_LINK_DEAL_BALANCE = 'fldyCWFzrTMhWs7FT';
const FIELD_CF_SISTEMA_PAGO = 'fldjNItVaCzrhlNhf';
const FIELD_CF_RAZON = 'fld17mZxxLYPQfUzr';
const FIELD_CF_SUJETO = 'fldazRk0SXXdqQo9L';
const FIELD_CF_ORDEN = 'fldc5yW3lEIo5OoE8';
const FIELD_CF_METODO_PAGO = 'fldn69DhRftezHhcZ';

// =====================================================================
// MAPEO DE ESTADOS: Excel → Airtable
// =====================================================================
function mapStatusIn(estado) {
    const e = (estado || '').trim().toUpperCase();
    const map = {
        'C':   'Cobrado',
        "C'":  'Cobrada con retraso',
        'P':   'Pendiente',
        'PP':  'Pago parcial',
        'D':   'Devuelta',
        'R':   'Recuperada vía arrendatario',
        "R'":  'Recuperada vía arrendatario',
        'DAS': 'Recuperada vía DAS',
        'PR':  'Pendiente',
        'I':   'Devuelta',
    };
    return map[e] || null;
}

function mapStatusOut(estado) {
    const e = (estado || '').trim().toUpperCase();
    const map = {
        'C':   'Pagado',
        "C'":  'Pagado',
        'P':   'Pendiente',
        'PP':  'Pendiente',
        'D':   'Devuelto',
        'R':   'Pagado',
        "R'":  'Pagado',
        'DAS': 'Pagado',
        'PR':  'Pendiente',
        'I':   'Pendiente',
    };
    return map[e] || null;
}

function shouldSkip(estado) {
    const e = (estado || '').trim();
    return e === '' || e === '-';
}

// =====================================================================
// GOOGLE SHEETS API HELPERS
// =====================================================================
async function fetchSheetRange(sheetName, range) {
    const encodedSheet = encodeURIComponent(sheetName);
    const encodedRange = encodeURIComponent(`${sheetName}!${range}`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodedRange}?key=${GOOGLE_API_KEY}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`;

    const response = await fetch(url);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Google Sheets API error (${response.status}): ${text}`);
    }

    const data = await response.json();
    return data.values || [];
}

// Buscar fila por valor en columna A
async function findRowByNumOp(sheetName, numOp) {
    // Leer toda la columna A
    const colA = await fetchSheetRange(sheetName, 'A:A');

    const numOpStr = String(numOp).trim();
    for (let i = 0; i < colA.length; i++) {
        const cellVal = String(colA[i][0] || '').trim();
        if (cellVal === numOpStr) {
            return i + 1; // 1-indexed row number
        }
    }
    return null;
}

// Parsear fecha serial de Google Sheets a YYYY-MM-DD
function serialToDate(serial) {
    if (typeof serial === 'number') {
        // Google Sheets serial date: days since Dec 30, 1899
        const epoch = new Date(1899, 11, 30);
        const date = new Date(epoch.getTime() + serial * 86400000);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}-01`; // Primer dia del mes
    }
    // Si es string tipo "2021-03-01"
    const str = String(serial);
    if (str.match(/^\d{4}-\d{2}/)) {
        return str.slice(0, 7) + '-01';
    }
    return null;
}

function serialToYYYYMM(serial) {
    const date = serialToDate(serial);
    return date ? date.slice(0, 7) : null;
}

// =====================================================================
// MAIN SCRIPT
// =====================================================================

console.log(`=== RETROSPECTIVA: Procesando balance ${balanceRecordId} ===`);

// --- STEP 1: Leer balance y deal ---
const balanceRecord = await balanceTable.selectRecordAsync(balanceRecordId, {
    fields: [FIELD_LINK_DEAL, FIELD_BALANCE_IMPORTE, FIELD_AVISO_RETRO, FIELD_LINK_MESES]
});

if (!balanceRecord) {
    throw new Error(`Balance ${balanceRecordId} no encontrado`);
}

// Verificar que no hay rentas ya vinculadas (proteccion contra doble ejecucion)
const rentasExistentes = balanceRecord.getCellValue(FIELD_LINK_MESES) || [];
if (rentasExistentes.length > 0) {
    console.log(`⚠ Este balance ya tiene ${rentasExistentes.length} rentas vinculadas.`);
    console.log('Para evitar duplicados, abortamos. Elimina las rentas existentes primero si quieres re-ejecutar.');
    return;
}

const linkedDeals = balanceRecord.getCellValue(FIELD_LINK_DEAL);
if (!linkedDeals || linkedDeals.length === 0) {
    throw new Error('Balance no tiene deal vinculado (linkDeal vacio)');
}

const dealId = linkedDeals[0].id;
const dealRecord = await dealsTable.selectRecordAsync(dealId, {
    fields: [
        FIELD_DEAL_INDEX,
        FIELD_DEAL_COMISION_IVA,
        FIELD_DEAL_COBRO_SERVICIO,
        FIELD_DEAL_PAGADOR_SERVICIO,
    ]
});

const indexDealRaw = String(dealRecord.getCellValue(FIELD_DEAL_INDEX) || '').trim();
// indexDeal tiene formato: "Casas Bcn - CL DOCTOR REIG 79 ... [36663988097]"
// Extraemos el numero entre corchetes al final
const bracketMatch = indexDealRaw.match(/\[(\d+)\]/);
const numOperacion = bracketMatch ? bracketMatch[1] : indexDealRaw;
const comisionTotal = dealRecord.getCellValue(FIELD_DEAL_COMISION_IVA) || 0;
const cobroServicio = dealRecord.getCellValue(FIELD_DEAL_COBRO_SERVICIO);
const cobroServicioName = cobroServicio ? cobroServicio.name : null;

const avisoExistente = balanceRecord.getCellValue(FIELD_AVISO_RETRO) || '';

console.log(`Deal: ${dealId}`);
console.log(`Num operacion: ${numOperacion}`);
console.log(`Comision total (con IVA): €${comisionTotal}`);
console.log(`Modalidad cobro servicio: ${cobroServicioName}`);

if (!numOperacion) {
    throw new Error('indexDeal (numOperacion) vacio en el deal');
}

// --- STEP 2: Leer datos de Google Sheets ---
console.log('\nLeyendo Google Sheets...');

// 2a. Fila 1: headers con fechas de meses (CF Cobros)
const headers = await fetchSheetRange(SHEET_CF_COBROS, '1:1');
const headerRow = headers[0] || [];

// 2b. Buscar fila del numOp en CF Cobros
const cfRow = await findRowByNumOp(SHEET_CF_COBROS, numOperacion);
if (!cfRow) {
    throw new Error(`Operacion ${numOperacion} no encontrada en hoja "${SHEET_CF_COBROS}"`);
}
console.log(`Fila encontrada en CF Cobros: ${cfRow}`);

// 2c. Leer la fila completa
const cfData = await fetchSheetRange(SHEET_CF_COBROS, `${cfRow}:${cfRow}`);
const dataRow = cfData[0] || [];

// 2d. Buscar en Transferencia Propietario para importes Out
const tpRow = await findRowByNumOp(SHEET_TRANSF_PROP, numOperacion);
let importeProp = null; // importe que cobra el propietario
let precioAdv = null;   // % comision Advancing

if (tpRow) {
    const tpData = await fetchSheetRange(SHEET_TRANSF_PROP, `${tpRow}:${tpRow}`);
    const tpCols = tpData[0] || [];
    // Col E (idx 4) = Importe mes, Col F (idx 5) = Precio Adv (%)
    importeProp = tpCols[4] != null ? Number(tpCols[4]) : null;
    precioAdv = tpCols[5] != null ? Number(tpCols[5]) : null;
    console.log(`Transferencia Propietario fila ${tpRow}: importeProp=€${importeProp}, precioAdv=${precioAdv}`);
} else {
    console.log(`Operacion ${numOperacion} NO encontrada en Transferencia Propietario`);
}

// Metadatos de CF Cobros
const nombreDeudor = dataRow[4] || '';
const importeNominal = dataRow[5] != null ? Number(dataRow[5]) : null;

console.log(`Nombre: ${nombreDeudor}`);
console.log(`Importe nominal (col F): €${importeNominal}`);

// --- STEP 3: Parsear meses ---
const meses = [];
// Columnas mensuales: desde indice 35 (col AJ, 0-indexed), pares de 2
for (let i = 0; i < MONTHLY_PAIR_COUNT; i++) {
    const colIdx = 35 + (i * 2); // 0-indexed: 35=AJ, 37=AL, 39=AN...
    const headerDate = headerRow[colIdx];
    const importeCell = dataRow[colIdx];
    const estadoCell = dataRow[colIdx + 1];

    if (!headerDate) continue;

    const fechaStr = serialToDate(headerDate);
    if (!fechaStr) continue;

    const estado = estadoCell != null ? String(estadoCell).trim() : '';

    if (shouldSkip(estado)) continue;

    // Determinar importe
    let importe = null;
    if (importeCell != null && importeCell !== '' && importeCell !== '-') {
        importe = Number(importeCell);
        if (isNaN(importe)) importe = null;
    }

    // Fallback: usar importe nominal si hay estado pero no importe
    if (importe == null && importeNominal != null) {
        importe = importeNominal;
    }

    if (importe == null) continue; // Sin importe, no podemos crear nada

    meses.push({
        fecha: fechaStr,           // YYYY-MM-01
        mesLabel: fechaStr.slice(0, 7), // YYYY-MM
        importe: importe,          // Lo que paga el inquilino
        estado: estado,
        statusIn: mapStatusIn(estado),
        statusOut: mapStatusOut(estado),
    });
}

console.log(`\nMeses con datos: ${meses.length}`);
if (meses.length === 0) {
    console.log('No hay meses con datos validos. Abortando.');
    return;
}

// --- STEP 4: Calcular importeServicio por renta ---
// Si el cobro es "Mensualmente", distribuimos la comision entre todos los meses
// Si es "Primer mes" o "Por anticipado", solo el primer mes tiene importeServicio
let importeServicioPorMes = 0;

if (comisionTotal > 0 && meses.length > 0) {
    if (cobroServicioName === 'Mensualmente') {
        importeServicioPorMes = Math.round((comisionTotal / meses.length) * 100) / 100;
        console.log(`Comision mensual: €${comisionTotal} / ${meses.length} meses = €${importeServicioPorMes}/mes`);
    } else {
        // "Primer mes", "Por anticipado", "En 2 meses": toda la comision en el primer mes
        console.log(`Comision en primer mes: €${comisionTotal}`);
    }
}

// Calcular importe Out (propietario)
// Si tenemos importeProp de Transferencia Propietario, usamos ese
// Si no, lo calculamos como: importe - importeServicio (aprox)
const importeOutBase = importeProp || importeNominal || 0;
console.log(`Importe Out (propietario) base: €${importeOutBase}`);

// --- STEP 5: Crear rentas Alquiler en batch ---
console.log('\nCreando rentas Alquiler...');

const rentaRecords = [];
for (let i = 0; i < meses.length; i++) {
    const mes = meses[i];

    // importeServicio segun modalidad
    let importeServicio = 0;
    if (cobroServicioName === 'Mensualmente') {
        importeServicio = importeServicioPorMes;
    } else if (i === 0 && comisionTotal > 0) {
        // Primera renta lleva toda la comision
        importeServicio = comisionTotal;
    }

    // El importe de la renta = lo que cobra el propietario (sin comision)
    // CF Cobros importe = rent + servicio. Pero si tenemos importeProp, usamos ese.
    let rentaImporte = mes.importe;
    if (importeProp != null && importeServicio > 0) {
        // Si el importe del Excel incluye la comision, la renta es el importe del propietario
        rentaImporte = importeProp;
    }

    rentaRecords.push({
        fields: {
            [FIELD_RENTA_FECHA]: mes.fecha,
            [FIELD_RENTA_IMPORTE]: rentaImporte,
            [FIELD_RENTA_TIPO]: { name: 'Alquiler' },
            [FIELD_RENTA_DEAL_BALANCE]: [{ id: balanceRecordId }],
            [FIELD_RENTA_IMPORTE_SERVICIO]: importeServicio,
            [FIELD_RENTA_ORDEN]: i + 1,
            [FIELD_RENTA_SISTEMA_PAGO]: { name: 'Caixa' },
        },
        _mes: mes,       // metadata temporal (no se envia a Airtable)
        _importeServicio: importeServicio,
    });
}

// Crear en batches de 50
const rentaIds = [];
for (let i = 0; i < rentaRecords.length; i += 50) {
    const batch = rentaRecords.slice(i, i + 50).map(r => ({ fields: r.fields }));
    const ids = await rentasTable.createRecordsAsync(batch);
    rentaIds.push(...ids);
    console.log(`Rentas creadas: ${rentaIds.length}/${rentaRecords.length}`);
}

// --- STEP 6: Crear rentas Comision Advancing (si cobro mensual) ---
let rentaComisionIds = [];
if (cobroServicioName === 'Mensualmente' && importeServicioPorMes > 0) {
    console.log('\nCreando rentas Comision Advancing...');

    const comisionRecords = [];
    for (let i = 0; i < meses.length; i++) {
        comisionRecords.push({
            fields: {
                [FIELD_RENTA_FECHA]: meses[i].fecha,
                [FIELD_RENTA_IMPORTE]: 0, // Las rentas de comision no tienen importe propio
                [FIELD_RENTA_TIPO]: { name: 'Comisión Advancing' },
                [FIELD_RENTA_DEAL_BALANCE]: [{ id: balanceRecordId }],
                [FIELD_RENTA_IMPORTE_SERVICIO]: importeServicioPorMes,
                [FIELD_RENTA_ORDEN]: meses.length + i + 1,
                [FIELD_RENTA_SISTEMA_PAGO]: { name: 'Caixa' },
            }
        });
    }

    for (let i = 0; i < comisionRecords.length; i += 50) {
        const batch = comisionRecords.slice(i, i + 50);
        const ids = await rentasTable.createRecordsAsync(batch);
        rentaComisionIds.push(...ids);
        console.log(`Rentas Comision creadas: ${rentaComisionIds.length}/${comisionRecords.length}`);
    }
}

// --- STEP 7: Crear cashflows In (cobro inquilino) ---
console.log('\nCreando cashflows In...');

const cashflowInRecords = [];
for (let i = 0; i < meses.length; i++) {
    const mes = meses[i];
    const rentaId = rentaIds[i];
    if (!mes.statusIn) continue;

    cashflowInRecords.push({
        fields: {
            [FIELD_CF_DIRECCION]: { name: 'In' },
            [FIELD_CF_IMPORTE]: mes.importe,  // Lo que paga el inquilino (rent + servicio)
            [FIELD_CF_FECHA_PROG]: mes.fecha,
            [FIELD_CF_STATUS_INS]: { name: mes.statusIn },
            [FIELD_CF_LINK_RENTA]: [{ id: rentaId }],
            [FIELD_CF_LINK_DEAL_BALANCE]: [{ id: balanceRecordId }],
            [FIELD_CF_SISTEMA_PAGO]: { name: 'Caixa' },
            [FIELD_CF_RAZON]: { name: 'Renta' },
            [FIELD_CF_SUJETO]: { name: 'Pagador alquiler' },
            [FIELD_CF_ORDEN]: i + 1,
            [FIELD_CF_METODO_PAGO]: { name: 'SEPA' },
        }
    });
}

let cfInCreated = 0;
for (let i = 0; i < cashflowInRecords.length; i += 50) {
    const batch = cashflowInRecords.slice(i, i + 50);
    await cashflowTable.createRecordsAsync(batch);
    cfInCreated += batch.length;
    console.log(`Cashflows In creados: ${cfInCreated}/${cashflowInRecords.length}`);
}

// --- STEP 8: Crear cashflows Out (pago propietario) ---
console.log('\nCreando cashflows Out...');

const cashflowOutRecords = [];
for (let i = 0; i < meses.length; i++) {
    const mes = meses[i];
    const rentaId = rentaIds[i];
    if (!mes.statusOut) continue;

    // Importe Out: lo que cobra el propietario
    // Si tenemos importeProp de Transferencia Propietario, usamos ese
    // Si no, usamos el importe de la renta (sin comision)
    let importeOut = importeOutBase;
    // Si el importe de la celda difiere del nominal (cambio de precio), ajustar proporcionalmente
    if (importeNominal && importeNominal !== mes.importe && importeProp) {
        // El importe cambio (ej. IPC): proporcionar el Out
        importeOut = mes.importe - rentaRecords[i]._importeServicio;
    }

    cashflowOutRecords.push({
        fields: {
            [FIELD_CF_DIRECCION]: { name: 'Out' },
            [FIELD_CF_IMPORTE]: importeOut,
            [FIELD_CF_FECHA_PROG]: mes.fecha,
            [FIELD_CF_STATUS_OUT]: { name: mes.statusOut },
            [FIELD_CF_LINK_RENTA]: [{ id: rentaId }],
            [FIELD_CF_LINK_DEAL_BALANCE]: [{ id: balanceRecordId }],
            [FIELD_CF_SISTEMA_PAGO]: { name: 'Caixa' },
            [FIELD_CF_RAZON]: { name: 'Renta' },
            [FIELD_CF_SUJETO]: { name: 'Propietario' },
            [FIELD_CF_ORDEN]: i + 1,
            [FIELD_CF_METODO_PAGO]: { name: 'Transferencia' },
        }
    });
}

let cfOutCreated = 0;
for (let i = 0; i < cashflowOutRecords.length; i += 50) {
    const batch = cashflowOutRecords.slice(i, i + 50);
    await cashflowTable.createRecordsAsync(batch);
    cfOutCreated += batch.length;
    console.log(`Cashflows Out creados: ${cfOutCreated}/${cashflowOutRecords.length}`);
}

// --- STEP 9: Escribir auditoria ---
const ahora = new Date();
const dd = String(ahora.getDate()).padStart(2, '0');
const mm = String(ahora.getMonth() + 1).padStart(2, '0');
const yyyy = ahora.getFullYear();
const hh = String(ahora.getHours()).padStart(2, '0');
const min = String(ahora.getMinutes()).padStart(2, '0');

const primerMes = meses[0]?.mesLabel || '?';
const ultimoMes = meses[meses.length - 1]?.mesLabel || '?';

const lineaAuditoria = `[${dd}/${mm}/${yyyy} ${hh}:${min}] RETROSPECTIVA op.${numOperacion} (${nombreDeudor}) — ${meses.length} meses (${primerMes} → ${ultimoMes}) | ${rentaIds.length} rentas Alquiler + ${rentaComisionIds.length} rentas Comision | ${cfInCreated} CF In + ${cfOutCreated} CF Out | Fila ${cfRow} en Sheets`;

const nuevoAviso = avisoExistente
    ? avisoExistente + '\n' + lineaAuditoria
    : lineaAuditoria;

await balanceTable.updateRecordAsync(balanceRecordId, {
    [FIELD_AVISO_RETRO]: nuevoAviso,
    [FIELD_CREAR_RETRO]: false, // Desmarcar checkbox para evitar re-ejecucion
});

console.log(`\nAuditoria: ${lineaAuditoria}`);

// --- Resumen ---
console.log('\n========================================');
console.log('RETROSPECTIVA COMPLETADA');
console.log(`Operacion: ${numOperacion} (${nombreDeudor})`);
console.log(`Meses procesados: ${meses.length} (${primerMes} → ${ultimoMes})`);
console.log(`Rentas Alquiler creadas: ${rentaIds.length}`);
console.log(`Rentas Comision creadas: ${rentaComisionIds.length}`);
console.log(`Cashflows In creados: ${cfInCreated}`);
console.log(`Cashflows Out creados: ${cfOutCreated}`);
console.log(`Fila en Google Sheets: ${cfRow}`);
console.log('========================================');
