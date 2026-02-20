// ============================================================================
// AIRTABLE AUTOMATION SCRIPT: Cambio de Sistema de Pago (Configurable)
// ============================================================================
//
// TRIGGER: "When record matches conditions" en tabla balance
//   - Condiciones: fechaCambioSistema is not empty AND nuevoSistemaPago is not empty
//
// INPUT VARIABLES (configurar en la automatización):
//   - balanceRecordId: Record ID del registro de balance (del trigger)
//
// PREREQUISITOS EN AIRTABLE (crear manualmente antes de usar):
//   1. Campo "fechaCambioSistema" (date) en tabla balance
//   2. Campo "nuevoSistemaPago" (single select: Unnax / Caixa / Manual) en tabla balance
//   3. Campo "avisoCambioSistema" (long text) en tabla balance
//
// FUNCIONAMIENTO:
//   1. Lee fechaCambioSistema, nuevoSistemaPago y rentas vinculadas del balance
//   2. Filtra rentas futuras cuyo sistemaPago sea DISTINTO al destino
//   3. Cambia sistemaPago de esas rentas al destino
//   4. Cambia sistemaPago de cashflows vinculados pendientes al destino
//   5. Actualiza sistemaPago del balance al destino
//   6. Escribe línea de auditoría en avisoCambioSistema (acumulativo)
//
// MAPEO DE NOMBRES ENTRE TABLAS:
//   El campo sistemaPago tiene nombres ligeramente distintos según la tabla.
//   El script normaliza equivalencias para comparar correctamente:
//     - "Caixa", "La Caixa" → se consideran el mismo sistema
//   Al escribir, usa el nombre exacto que existe en cada tabla:
//     - balance:  Unnax | Caixa | Manual
//     - rentas:   Unnax | La Caixa | Caixa
//     - cashflow: Unnax | Caixa | DAS
// ============================================================================

const config = input.config();
const balanceRecordId = config.balanceRecordId;

// --- Referencias a tablas ---
const balanceTable = base.getTable('tblYNdOLuMvpBavEu');
const rentasTable = base.getTable('tbl2izIaOR37sRHGg');
const cashflowTable = base.getTable('tblxY6upsLDmqzaaL');

// --- Field IDs ---
// Balance
const FIELD_FECHA_CAMBIO_SISTEMA = 'fechaCambioSistema';       // CREAR: date
const FIELD_NUEVO_SISTEMA_PAGO = 'nuevoSistemaPago';           // CREAR: single select (Unnax/Caixa/Manual)
const FIELD_AVISO_CAMBIO_SISTEMA = 'avisoCambioSistema';       // CREAR: long text
const FIELD_LINK_MESES = 'fldFlp2wDVWljyTtC';                 // linkMeses (rentas vinculadas)
const FIELD_BALANCE_SISTEMA_PAGO = 'fldSVisYm1biJH5jz';       // sistemaPago (balance)

// Rentas
const FIELD_RENTA_FECHA = 'fldSdtfW7UfIw8z4V';                // fecha
const FIELD_RENTA_SISTEMA_PAGO = 'fldKBseprTEyZysG8';         // sistemaPago (rentas)
const FIELD_RENTA_CASHFLOWS = 'fld7ERQvv5apIJcyX';            // linkCashflows

// Cashflows
const FIELD_CF_DIRECCION = 'fld656RBx2XkCHzR7';               // direccion (In/Out)
const FIELD_CF_FECHA_PROG = 'fldrquziQqJoTn08B';              // fechaProgramada
const FIELD_CF_SISTEMA_PAGO = 'fldjNItVaCzrhlNhf';            // sistemaPago (cashflow)
const FIELD_CF_STATUS_INS = 'fldFyfq8PaqbCRgeN';              // statusIns
const FIELD_CF_STATUS_OUT = 'fldIMh0gNEA3TuaiG';              // statusOut

// --- Mapeo de nombres equivalentes entre tablas ---
// Normaliza un nombre de sistema a un identificador canónico para comparaciones
function normalizeSistema(name) {
    if (!name) return null;
    const lower = name.toLowerCase().trim();
    if (lower === 'caixa' || lower === 'la caixa') return 'caixa';
    if (lower === 'unnax') return 'unnax';
    if (lower === 'manual') return 'manual';
    if (lower === 'das') return 'das';
    return lower;
}

// Devuelve el nombre exacto a escribir en cada tabla según el sistema destino
// (respeta las opciones existentes en cada select)
function getNombreParaTabla(sistemaDestino, tabla) {
    const norm = normalizeSistema(sistemaDestino);

    if (norm === 'unnax') return 'Unnax';                      // igual en las 3 tablas
    if (norm === 'manual') return 'Manual';                    // solo existe en balance

    if (norm === 'caixa') {
        if (tabla === 'balance') return 'Caixa';
        if (tabla === 'rentas') return 'Caixa';                // rentas tiene "Caixa" y "La Caixa"
        if (tabla === 'cashflow') return 'Caixa';
    }

    return sistemaDestino; // fallback: usar tal cual
}

// --- STEP 1: Leer el registro de balance ---
console.log(`Procesando balance: ${balanceRecordId}`);

const balanceRecord = await balanceTable.selectRecordAsync(balanceRecordId, {
    fields: [
        FIELD_FECHA_CAMBIO_SISTEMA,
        FIELD_NUEVO_SISTEMA_PAGO,
        FIELD_AVISO_CAMBIO_SISTEMA,
        FIELD_LINK_MESES,
        FIELD_BALANCE_SISTEMA_PAGO,
    ]
});

if (!balanceRecord) {
    console.error(`Registro de balance ${balanceRecordId} no encontrado`);
    throw new Error('Registro de balance no encontrado');
}

const fechaCambioRaw = balanceRecord.getCellValue(FIELD_FECHA_CAMBIO_SISTEMA);
const nuevoSistemaSelect = balanceRecord.getCellValue(FIELD_NUEVO_SISTEMA_PAGO);
const linkedRentas = balanceRecord.getCellValue(FIELD_LINK_MESES) || [];
const sistemaActual = balanceRecord.getCellValue(FIELD_BALANCE_SISTEMA_PAGO);
const avisoExistente = balanceRecord.getCellValue(FIELD_AVISO_CAMBIO_SISTEMA) || '';

// --- Validación ---
if (!fechaCambioRaw) {
    console.log('fechaCambioSistema vacía. Abortando.');
    return;
}
if (!nuevoSistemaSelect) {
    console.log('nuevoSistemaPago vacío. Abortando.');
    return;
}

const fechaCambio = new Date(fechaCambioRaw);
fechaCambio.setHours(0, 0, 0, 0);

const sistemaDestinoName = nuevoSistemaSelect.name;
const sistemaDestinoNorm = normalizeSistema(sistemaDestinoName);
const sistemaActualName = sistemaActual ? sistemaActual.name : '(vacío)';
const sistemaActualNorm = normalizeSistema(sistemaActualName);

console.log(`Fecha de cambio de sistema: ${fechaCambio.toISOString().slice(0, 10)}`);
console.log(`Sistema actual del balance: ${sistemaActualName}`);
console.log(`Sistema destino: ${sistemaDestinoName}`);
console.log(`Rentas vinculadas: ${linkedRentas.length}`);

// Validar que origen y destino no sean el mismo
if (sistemaActualNorm === sistemaDestinoNorm) {
    console.log(`El balance ya tiene sistema "${sistemaDestinoName}". No hay nada que cambiar.`);
    return;
}

// --- STEP 2: Obtener rentas futuras con sistema distinto al destino ---
if (linkedRentas.length === 0) {
    console.log('No hay rentas vinculadas a este balance.');
    return;
}

const rentaIdsList = linkedRentas.map(r => r.id);
const rentasFields = [
    FIELD_RENTA_FECHA,
    FIELD_RENTA_SISTEMA_PAGO,
    FIELD_RENTA_CASHFLOWS,
];

let allRentasRecords = [];
for (let i = 0; i < rentaIdsList.length; i += 100) {
    const batch = rentaIdsList.slice(i, i + 100);
    const query = await rentasTable.selectRecordsAsync({
        fields: rentasFields,
        recordIds: batch,
    });
    allRentasRecords = allRentasRecords.concat(query.records);
}

const rentasFuturasACambiar = allRentasRecords.filter(renta => {
    // Solo fecha >= fechaCambio
    const fecha = renta.getCellValue(FIELD_RENTA_FECHA);
    if (!fecha) return false;

    const rentaDate = new Date(fecha);
    rentaDate.setHours(0, 0, 0, 0);
    if (rentaDate < fechaCambio) return false;

    // Solo las que tienen un sistemaPago distinto al destino
    const sistema = renta.getCellValue(FIELD_RENTA_SISTEMA_PAGO);
    if (!sistema) return true; // sin sistema → cambiar

    return normalizeSistema(sistema.name) !== sistemaDestinoNorm;
});

// Contar cuántas rentas por sistema de origen
const origenCountRentas = {};
for (const renta of rentasFuturasACambiar) {
    const sistema = renta.getCellValue(FIELD_RENTA_SISTEMA_PAGO);
    const name = sistema ? sistema.name : '(vacío)';
    origenCountRentas[name] = (origenCountRentas[name] || 0) + 1;
}

console.log(`Rentas futuras a cambiar: ${rentasFuturasACambiar.length}`);
for (const [origen, count] of Object.entries(origenCountRentas)) {
    console.log(`  - ${origen}: ${count}`);
}

if (rentasFuturasACambiar.length === 0) {
    console.log(`No hay rentas futuras con sistema distinto a "${sistemaDestinoName}".`);
    // Aun así, actualizamos el balance si procede
}

// --- STEP 3: Cambiar sistemaPago de rentas al destino ---
let rentasCambiadas = 0;
const nombreDestinoRentas = getNombreParaTabla(sistemaDestinoName, 'rentas');

if (rentasFuturasACambiar.length > 0) {
    const rentasUpdates = rentasFuturasACambiar.map(r => ({
        id: r.id,
        fields: { [FIELD_RENTA_SISTEMA_PAGO]: { name: nombreDestinoRentas } }
    }));

    for (let i = 0; i < rentasUpdates.length; i += 50) {
        const batch = rentasUpdates.slice(i, i + 50);
        await rentasTable.updateRecordsAsync(batch);
        rentasCambiadas += batch.length;
        console.log(`Rentas cambiadas: ${rentasCambiadas}/${rentasUpdates.length}`);
    }
}

// --- STEP 4: Recopilar cashflows vinculados a rentas cambiadas ---
const cashflowIds = new Set();
for (const renta of rentasFuturasACambiar) {
    const cfs = renta.getCellValue(FIELD_RENTA_CASHFLOWS);
    if (cfs) {
        for (const cf of cfs) {
            cashflowIds.add(cf.id);
        }
    }
}

console.log(`Cashflows vinculados a rentas cambiadas: ${cashflowIds.size}`);

let cashflowsCambiados = 0;
const origenCountCashflows = {};

if (cashflowIds.size > 0) {
    // --- STEP 5: Obtener cashflows y cambiar sistema ---
    const cashflowIdsList = [...cashflowIds];
    const cashflowFields = [
        FIELD_CF_DIRECCION,
        FIELD_CF_FECHA_PROG,
        FIELD_CF_SISTEMA_PAGO,
        FIELD_CF_STATUS_INS,
        FIELD_CF_STATUS_OUT,
    ];

    let allCashflowRecords = [];
    for (let i = 0; i < cashflowIdsList.length; i += 100) {
        const batch = cashflowIdsList.slice(i, i + 100);
        const query = await cashflowTable.selectRecordsAsync({
            fields: cashflowFields,
            recordIds: batch,
        });
        allCashflowRecords = allCashflowRecords.concat(query.records);
    }

    const nombreDestinoCashflow = getNombreParaTabla(sistemaDestinoName, 'cashflow');
    const cashflowUpdates = [];

    for (const cf of allCashflowRecords) {
        // Solo cashflows con fechaProgramada >= fechaCambio
        const fechaProg = cf.getCellValue(FIELD_CF_FECHA_PROG);
        if (!fechaProg) continue;

        const cfDate = new Date(fechaProg);
        cfDate.setHours(0, 0, 0, 0);
        if (cfDate < fechaCambio) continue;

        // Solo los que tienen sistema distinto al destino
        const sistemaCF = cf.getCellValue(FIELD_CF_SISTEMA_PAGO);
        const sistemaCFNorm = normalizeSistema(sistemaCF ? sistemaCF.name : null);
        if (sistemaCFNorm === sistemaDestinoNorm) continue;

        // Solo los que están en estado "Pendiente" (no tocar cobrados/pagados)
        const direccion = cf.getCellValue(FIELD_CF_DIRECCION);
        if (!direccion) continue;

        let esPendiente = false;
        if (direccion.name === 'In') {
            const statusIn = cf.getCellValue(FIELD_CF_STATUS_INS);
            esPendiente = statusIn && statusIn.name === 'Pendiente';
        } else if (direccion.name === 'Out') {
            const statusOut = cf.getCellValue(FIELD_CF_STATUS_OUT);
            esPendiente = statusOut && statusOut.name === 'Pendiente';
        }

        if (!esPendiente) {
            console.log(`  Saltando CF ${cf.id} (${direccion.name}) — no está Pendiente`);
            continue;
        }

        const origenName = sistemaCF ? sistemaCF.name : '(vacío)';
        origenCountCashflows[origenName] = (origenCountCashflows[origenName] || 0) + 1;

        cashflowUpdates.push({
            id: cf.id,
            fields: { [FIELD_CF_SISTEMA_PAGO]: { name: nombreDestinoCashflow } },
        });
    }

    console.log(`Cashflows a cambiar: ${cashflowUpdates.length}`);
    for (const [origen, count] of Object.entries(origenCountCashflows)) {
        console.log(`  - ${origen}: ${count}`);
    }

    // --- STEP 6: Actualizar cashflows en batches ---
    for (let i = 0; i < cashflowUpdates.length; i += 50) {
        const batch = cashflowUpdates.slice(i, i + 50);
        await cashflowTable.updateRecordsAsync(batch);
        cashflowsCambiados += batch.length;
        console.log(`Cashflows cambiados: ${cashflowsCambiados}/${cashflowUpdates.length}`);
    }
} else {
    console.log('No hay cashflows vinculados a las rentas cambiadas.');
}

// --- STEP 7: Actualizar sistemaPago del balance al destino ---
const nombreDestinoBalance = getNombreParaTabla(sistemaDestinoName, 'balance');
await balanceTable.updateRecordAsync(balanceRecordId, {
    [FIELD_BALANCE_SISTEMA_PAGO]: { name: nombreDestinoBalance },
});
console.log(`Balance actualizado: sistemaPago → ${nombreDestinoBalance}`);

// --- STEP 8: Escribir línea de auditoría en avisoCambioSistema ---
const ahora = new Date();
const dd = String(ahora.getDate()).padStart(2, '0');
const mm = String(ahora.getMonth() + 1).padStart(2, '0');
const yyyy = ahora.getFullYear();
const hh = String(ahora.getHours()).padStart(2, '0');
const min = String(ahora.getMinutes()).padStart(2, '0');
const fechaCambioStr = `${String(fechaCambio.getDate()).padStart(2, '0')}/${String(fechaCambio.getMonth() + 1).padStart(2, '0')}/${fechaCambio.getFullYear()}`;

// Desglose de orígenes para auditoría
const detalleOrigenRentas = Object.entries(origenCountRentas)
    .map(([k, v]) => `${v}×${k}`)
    .join(', ') || 'ninguna';
const detalleOrigenCashflows = Object.entries(origenCountCashflows)
    .map(([k, v]) => `${v}×${k}`)
    .join(', ') || 'ninguno';

const lineaAuditoria = `[${dd}/${mm}/${yyyy} ${hh}:${min}] CAMBIO SISTEMA ${sistemaActualName} → ${sistemaDestinoName} (efectivo desde ${fechaCambioStr}) — ${rentasCambiadas} rentas [${detalleOrigenRentas}], ${cashflowsCambiados} cashflows [${detalleOrigenCashflows}]`;

const nuevoAviso = avisoExistente
    ? avisoExistente + '\n' + lineaAuditoria
    : lineaAuditoria;

await balanceTable.updateRecordAsync(balanceRecordId, {
    [FIELD_AVISO_CAMBIO_SISTEMA]: nuevoAviso,
});

console.log(`Auditoría escrita: ${lineaAuditoria}`);

// --- Resumen ---
console.log('========================================');
console.log('CAMBIO DE SISTEMA COMPLETADO');
console.log(`Sistema anterior (balance): ${sistemaActualName}`);
console.log(`Sistema nuevo: ${sistemaDestinoName}`);
console.log(`Fecha efectiva: ${fechaCambioStr}`);
console.log(`Rentas cambiadas → ${nombreDestinoRentas}: ${rentasCambiadas} [${detalleOrigenRentas}]`);
console.log(`Cashflows cambiados → ${getNombreParaTabla(sistemaDestinoName, 'cashflow')}: ${cashflowsCambiados} [${detalleOrigenCashflows}] (solo Pendientes)`);
console.log(`Balance actualizado: sistemaPago → ${nombreDestinoBalance}`);
console.log('========================================');
