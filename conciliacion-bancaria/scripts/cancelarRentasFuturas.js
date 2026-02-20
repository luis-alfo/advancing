// ============================================================================
// AIRTABLE AUTOMATION SCRIPT: Cancelación de Rentas y Cashflows Futuros
// ============================================================================
//
// TRIGGER: "When record matches conditions" en tabla balance
//   - Condiciones: fechaCancelacion is not empty
//
// INPUT VARIABLES (configurar en la automatización):
//   - balanceRecordId: Record ID del registro de balance (del trigger)
//
// PREREQUISITOS EN AIRTABLE (crear manualmente antes de usar):
//   1. Campo "fechaCancelacion" (date) en tabla balance
//   2. Campo "avisoCancelacion" (long text) en tabla balance
//   3. Opción "Cancelado" en campo statusIns (cashflow) — color sugerido: grayLight1
//   4. Opción "Cancelado" en campo statusOut (cashflow) — color sugerido: grayLight1
//
// FUNCIONAMIENTO:
//   1. Lee fechaCancelacion y rentas vinculadas del balance
//   2. Filtra rentas con fecha >= fechaCancelacion (todos los tipos)
//   3. Pone importe de rentas a €0
//   4. Marca cashflows In como "Cancelado" (statusIns) y pone importe a 0
//   5. Marca cashflows Out como "Cancelado" (statusOut) y pone importe a 0
//   6. Si hay rentas de "Comisión Advancing" canceladas con importeServicio > 0,
//      crea 1 renta de saldo de servicio + 1 cashflow In vinculado (Pendiente)
//   7. Escribe línea de auditoría en avisoCancelacion (acumulativo)
// ============================================================================

const config = input.config();
const balanceRecordId = config.balanceRecordId;

// --- Referencias a tablas ---
const balanceTable = base.getTable('tblYNdOLuMvpBavEu');
const rentasTable = base.getTable('tbl2izIaOR37sRHGg');
const cashflowTable = base.getTable('tblxY6upsLDmqzaaL');

// --- Field IDs ---
// Balance
const FIELD_FECHA_CANCELACION = 'fechaCancelacion';       // CREAR: date
const FIELD_AVISO_CANCELACION = 'avisoCancelacion';       // CREAR: long text
const FIELD_LINK_MESES = 'fldFlp2wDVWljyTtC';            // linkMeses (rentas vinculadas)
const FIELD_BALANCE_IMPORTE = 'fldtJw4GfIzEtc7h2';       // importe (precio actual)

// Rentas
const FIELD_RENTA_FECHA = 'fldSdtfW7UfIw8z4V';           // fecha
const FIELD_RENTA_TIPO = 'fldTWeJAYDxWOZWPJ';            // tipo (Alquiler / Comisión Advancing)
const FIELD_RENTA_IMPORTE = 'fld2DbSB516n1bU8f';         // importe
const FIELD_RENTA_IMPORTE_SERVICIO = 'fldS4Zqn2KLOox9jG'; // importeServicio
const FIELD_RENTA_CASHFLOWS = 'fld7ERQvv5apIJcyX';       // linkCashflows
const FIELD_RENTA_DEAL_BALANCE = 'fldfh0vDzeqRuTFFE';    // dealBalance (link a balance)

// Cashflows
const FIELD_CF_DIRECCION = 'fld656RBx2XkCHzR7';          // direccion (In/Out)
const FIELD_CF_FECHA_PROG = 'fldrquziQqJoTn08B';         // fechaProgramada
const FIELD_CF_IMPORTE = 'fldbkCQZwDR8a9kRP';            // importe
const FIELD_CF_STATUS_INS = 'fldFyfq8PaqbCRgeN';         // statusIns
const FIELD_CF_STATUS_OUT = 'fldIMh0gNEA3TuaiG';         // statusOut
const FIELD_CF_LINK_RENTA = 'fldsTJCCfItHDoCgS';         // linkRenta
const FIELD_CF_LINK_DEAL_BALANCE = 'fldyCWFzrTMhWs7FT';  // linkDealBalance
const FIELD_CF_RAZON = 'fld17mZxxLYPQfUzr';              // razon (Renta/Recobro/DAS)
const FIELD_CF_SUJETO = 'fldazRk0SXXdqQo9L';             // sujeto (Pagador alquiler/DAS/Propietario)

// --- STEP 1: Leer el registro de balance ---
console.log(`Procesando balance: ${balanceRecordId}`);

const balanceRecord = await balanceTable.selectRecordAsync(balanceRecordId, {
    fields: [
        FIELD_FECHA_CANCELACION,
        FIELD_LINK_MESES,
        FIELD_BALANCE_IMPORTE,
        FIELD_AVISO_CANCELACION,
    ]
});

if (!balanceRecord) {
    console.error(`Registro de balance ${balanceRecordId} no encontrado`);
    throw new Error('Registro de balance no encontrado');
}

const fechaCancelacionRaw = balanceRecord.getCellValue(FIELD_FECHA_CANCELACION);
const linkedRentas = balanceRecord.getCellValue(FIELD_LINK_MESES) || [];
const precioActual = balanceRecord.getCellValue(FIELD_BALANCE_IMPORTE);
const avisoExistente = balanceRecord.getCellValue(FIELD_AVISO_CANCELACION) || '';

// --- Validación ---
if (!fechaCancelacionRaw) {
    console.log('fechaCancelacion vacía. Abortando.');
    return;
}

const fechaCancelacion = new Date(fechaCancelacionRaw);
fechaCancelacion.setHours(0, 0, 0, 0);

console.log(`Fecha de cancelación: ${fechaCancelacion.toISOString().slice(0, 10)}`);
console.log(`Rentas vinculadas: ${linkedRentas.length}`);

// --- STEP 2: Obtener rentas futuras (todos los tipos) ---
if (linkedRentas.length === 0) {
    console.log('No hay rentas vinculadas a este balance.');
    return;
}

const rentaIdsList = linkedRentas.map(r => r.id);
const rentasFields = [
    FIELD_RENTA_FECHA,
    FIELD_RENTA_TIPO,
    FIELD_RENTA_IMPORTE,
    FIELD_RENTA_IMPORTE_SERVICIO,
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

const rentasFuturas = allRentasRecords.filter(renta => {
    const fecha = renta.getCellValue(FIELD_RENTA_FECHA);
    if (!fecha) return false;

    const rentaDate = new Date(fecha);
    rentaDate.setHours(0, 0, 0, 0);
    return rentaDate >= fechaCancelacion;
});

console.log(`Rentas futuras a cancelar: ${rentasFuturas.length}`);

if (rentasFuturas.length === 0) {
    console.log('No hay rentas futuras que cancelar.');
    return;
}

// --- STEP 3: Calcular saldo de servicio pendiente ---
// Sumar importeServicio de rentas tipo "Comisión Advancing" que se van a cancelar
let saldoServicio = 0;
let rentasComisionCount = 0;
for (const renta of rentasFuturas) {
    const tipo = renta.getCellValue(FIELD_RENTA_TIPO);
    if (tipo && tipo.name === 'Comisión Advancing') {
        const importeServ = renta.getCellValue(FIELD_RENTA_IMPORTE_SERVICIO) || 0;
        saldoServicio += importeServ;
        rentasComisionCount++;
    }
}

console.log(`Rentas de Comisión Advancing canceladas: ${rentasComisionCount}`);
console.log(`Saldo de servicio pendiente: €${saldoServicio}`);

// --- STEP 4: Poner importe de rentas a 0 ---
const rentasUpdates = rentasFuturas.map(r => ({
    id: r.id,
    fields: { [FIELD_RENTA_IMPORTE]: 0 }
}));

let rentasCanceladas = 0;
for (let i = 0; i < rentasUpdates.length; i += 50) {
    const batch = rentasUpdates.slice(i, i + 50);
    await rentasTable.updateRecordsAsync(batch);
    rentasCanceladas += batch.length;
    console.log(`Rentas canceladas: ${rentasCanceladas}/${rentasUpdates.length}`);
}

// --- STEP 5: Recopilar cashflows vinculados ---
const cashflowIds = new Set();
for (const renta of rentasFuturas) {
    const cfs = renta.getCellValue(FIELD_RENTA_CASHFLOWS);
    if (cfs) {
        for (const cf of cfs) {
            cashflowIds.add(cf.id);
        }
    }
}

console.log(`Cashflows vinculados a rentas futuras: ${cashflowIds.size}`);

let cashflowsCancelados = 0;

if (cashflowIds.size > 0) {
    // --- STEP 6: Obtener cashflows y marcar como cancelados ---
    const cashflowIdsList = [...cashflowIds];
    const cashflowFields = [
        FIELD_CF_DIRECCION,
        FIELD_CF_FECHA_PROG,
        FIELD_CF_IMPORTE,
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

    const cashflowUpdates = [];
    for (const cf of allCashflowRecords) {
        // Solo cashflows con fechaProgramada >= fechaCancelacion
        const fechaProg = cf.getCellValue(FIELD_CF_FECHA_PROG);
        if (!fechaProg) continue;

        const cfDate = new Date(fechaProg);
        cfDate.setHours(0, 0, 0, 0);
        if (cfDate < fechaCancelacion) continue;

        const direccion = cf.getCellValue(FIELD_CF_DIRECCION);
        if (!direccion) continue;

        const updateFields = {
            [FIELD_CF_IMPORTE]: 0,
        };

        if (direccion.name === 'In') {
            updateFields[FIELD_CF_STATUS_INS] = { name: 'Cancelado' };
        } else if (direccion.name === 'Out') {
            updateFields[FIELD_CF_STATUS_OUT] = { name: 'Cancelado' };
        } else {
            continue;
        }

        cashflowUpdates.push({
            id: cf.id,
            fields: updateFields,
        });
    }

    console.log(`Cashflows a cancelar: ${cashflowUpdates.length}`);

    // --- STEP 7: Actualizar cashflows en batches ---
    for (let i = 0; i < cashflowUpdates.length; i += 50) {
        const batch = cashflowUpdates.slice(i, i + 50);
        await cashflowTable.updateRecordsAsync(batch);
        cashflowsCancelados += batch.length;
        console.log(`Cashflows cancelados: ${cashflowsCancelados}/${cashflowUpdates.length}`);
    }
} else {
    console.log('No hay cashflows vinculados a las rentas canceladas.');
}

// --- STEP 8: Crear renta de saldo de servicio + cashflow In ---
let rentaSaldoCreada = false;
if (saldoServicio > 0) {
    console.log(`Creando renta de saldo de servicio: €${saldoServicio}`);

    // Crear renta de tipo "Comisión Advancing" con fecha = fechaCancelacion
    const fechaCancelISO = fechaCancelacion.toISOString().slice(0, 10);
    const nuevaRentaId = await rentasTable.createRecordAsync({
        [FIELD_RENTA_FECHA]: fechaCancelISO,
        [FIELD_RENTA_TIPO]: { name: 'Comisión Advancing' },
        [FIELD_RENTA_IMPORTE_SERVICIO]: saldoServicio,
        [FIELD_RENTA_DEAL_BALANCE]: [{ id: balanceRecordId }],
    });

    console.log(`Renta de saldo creada: ${nuevaRentaId}`);

    // Crear cashflow In vinculado a la nueva renta
    const nuevoCashflowId = await cashflowTable.createRecordAsync({
        [FIELD_CF_DIRECCION]: { name: 'In' },
        [FIELD_CF_FECHA_PROG]: fechaCancelISO,
        [FIELD_CF_IMPORTE]: saldoServicio,
        [FIELD_CF_STATUS_INS]: { name: 'Pendiente' },
        [FIELD_CF_LINK_RENTA]: [{ id: nuevaRentaId }],
        [FIELD_CF_LINK_DEAL_BALANCE]: [{ id: balanceRecordId }],
        [FIELD_CF_RAZON]: { name: 'Renta' },
        [FIELD_CF_SUJETO]: { name: 'Pagador alquiler' },
    });

    console.log(`Cashflow In de saldo creado: ${nuevoCashflowId}`);
    rentaSaldoCreada = true;
} else {
    console.log('No hay saldo de servicio pendiente. No se crea renta adicional.');
}

// --- STEP 9: Escribir línea de auditoría en avisoCancelacion ---
const ahora = new Date();
const dd = String(ahora.getDate()).padStart(2, '0');
const mm = String(ahora.getMonth() + 1).padStart(2, '0');
const yyyy = ahora.getFullYear();
const hh = String(ahora.getHours()).padStart(2, '0');
const min = String(ahora.getMinutes()).padStart(2, '0');
const fechaCancelStr = `${String(fechaCancelacion.getDate()).padStart(2, '0')}/${String(fechaCancelacion.getMonth() + 1).padStart(2, '0')}/${fechaCancelacion.getFullYear()}`;
const precioStr = precioActual != null ? `€${precioActual}` : '?';

let lineaAuditoria = `[${dd}/${mm}/${yyyy} ${hh}:${min}] CANCELACIÓN desde ${fechaCancelStr} (precio era ${precioStr}) — ${rentasCanceladas} rentas, ${cashflowsCancelados} cashflows cancelados`;
if (rentaSaldoCreada) {
    lineaAuditoria += ` | Saldo servicio: €${saldoServicio} (${rentasComisionCount} meses comisión → 1 renta + 1 cashflow In)`;
}

const nuevoAviso = avisoExistente
    ? avisoExistente + '\n' + lineaAuditoria
    : lineaAuditoria;

await balanceTable.updateRecordAsync(balanceRecordId, {
    [FIELD_AVISO_CANCELACION]: nuevoAviso,
});

console.log(`Auditoría escrita: ${lineaAuditoria}`);

// --- Resumen ---
console.log('========================================');
console.log('CANCELACIÓN COMPLETADA');
console.log(`Fecha cancelación: ${fechaCancelStr}`);
console.log(`Precio que tenía: ${precioStr}`);
console.log(`Rentas canceladas (importe → €0): ${rentasCanceladas}`);
console.log(`  - De las cuales ${rentasComisionCount} eran Comisión Advancing`);
console.log(`Cashflows cancelados (importe → €0, status → Cancelado): ${cashflowsCancelados}`);
if (rentaSaldoCreada) {
    console.log(`Renta saldo servicio creada: €${saldoServicio}`);
    console.log(`Cashflow In saldo servicio creado: €${saldoServicio} (Pendiente)`);
}
console.log('========================================');
