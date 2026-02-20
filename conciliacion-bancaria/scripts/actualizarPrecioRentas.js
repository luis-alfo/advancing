// ============================================================================
// AIRTABLE AUTOMATION SCRIPT: Actualización No Retroactiva de Precio de Rentas
// ============================================================================
//
// TRIGGER: "When record matches conditions" en tabla balance
//   - Condiciones: nuevoPrecio is not empty AND fechaNuevoPrecio is not empty
//
// INPUT VARIABLES (configurar en la automatización):
//   - balanceRecordId: Record ID del registro de balance (del trigger)
//
// FUNCIONAMIENTO:
//   1. Lee nuevoPrecio, fechaNuevoPrecio, precio anterior, porcentaje de servicio
//      y aviso existente del balance
//   2. Actualiza importe de rentas tipo "Alquiler" con fecha >= fechaNuevoPrecio
//   3. Actualiza cashflows vinculados a cada renta, respetando importeServicio:
//      - In (cobros)  → nuevoPrecio + importeServicio de la renta
//      - Out (pagos propietario) → nuevoPrecio (sin comisión)
//   4. Si el precio sube, calcula el extra de servicio sobre la diferencia
//      para los meses restantes y crea 1 renta + 1 cashflow In de ajuste
//   5. Escribe línea de auditoría en avisoNuevoPrecio (acumulativo)
//
// NOTA: La comisión se gestiona mediante importeServicio en cada renta
//       (puede estar prorrateada), NO con la comisión global del deal.
// ============================================================================

const config = input.config();
const balanceRecordId = config.balanceRecordId;

// --- Referencias a tablas ---
const balanceTable = base.getTable('tblYNdOLuMvpBavEu');
const rentasTable = base.getTable('tbl2izIaOR37sRHGg');
const cashflowTable = base.getTable('tblxY6upsLDmqzaaL');

// --- Field IDs ---
// Balance
const FIELD_NUEVO_PRECIO = 'fldiWklj6yoWqsQSH';
const FIELD_FECHA_NUEVO_PRECIO = 'fldMjSkNNd7J7BetK';
const FIELD_LINK_MESES = 'fldFlp2wDVWljyTtC';
const FIELD_BALANCE_IMPORTE = 'fldtJw4GfIzEtc7h2';
const FIELD_AVISO_NUEVO_PRECIO = 'fldaV2nYiekBXEHVz';
const FIELD_LINK_DEAL_COMISION = 'fldA0WTOnkrCY0pre'; // linkDealComisionProductoAplicable

// Rentas
const FIELD_RENTA_FECHA = 'fldSdtfW7UfIw8z4V';
const FIELD_RENTA_TIPO = 'fldTWeJAYDxWOZWPJ';
const FIELD_RENTA_IMPORTE = 'fld2DbSB516n1bU8f';
const FIELD_RENTA_IMPORTE_SERVICIO = 'fldS4Zqn2KLOox9jG';
const FIELD_RENTA_CASHFLOWS = 'fld7ERQvv5apIJcyX';
const FIELD_RENTA_DEAL_BALANCE = 'fldfh0vDzeqRuTFFE';

// Cashflows
const FIELD_CF_DIRECCION = 'fld656RBx2XkCHzR7';
const FIELD_CF_FECHA_PROG = 'fldrquziQqJoTn08B';
const FIELD_CF_IMPORTE = 'fldbkCQZwDR8a9kRP';
const FIELD_CF_STATUS_INS = 'fldFyfq8PaqbCRgeN';
const FIELD_CF_LINK_RENTA = 'fldsTJCCfItHDoCgS';
const FIELD_CF_LINK_DEAL_BALANCE = 'fldyCWFzrTMhWs7FT';
const FIELD_CF_RAZON = 'fld17mZxxLYPQfUzr';
const FIELD_CF_SUJETO = 'fldazRk0SXXdqQo9L';

// --- STEP 1: Leer el registro de balance ---
console.log(`Procesando balance: ${balanceRecordId}`);

const balanceRecord = await balanceTable.selectRecordAsync(balanceRecordId, {
    fields: [
        FIELD_NUEVO_PRECIO,          // nuevoPrecio
        FIELD_FECHA_NUEVO_PRECIO,    // fechaNuevoPrecio
        FIELD_LINK_MESES,            // linkMeses (rentas vinculadas)
        FIELD_BALANCE_IMPORTE,       // importe (precio anterior)
        FIELD_AVISO_NUEVO_PRECIO,    // avisoNuevoPrecio (historial de auditoría)
        FIELD_LINK_DEAL_COMISION,    // linkDealComisionProductoAplicable (% servicio)
    ]
});

if (!balanceRecord) {
    console.error(`Registro de balance ${balanceRecordId} no encontrado`);
    throw new Error('Registro de balance no encontrado');
}

const nuevoPrecio = balanceRecord.getCellValue(FIELD_NUEVO_PRECIO);
const fechaNuevoPrecioRaw = balanceRecord.getCellValue(FIELD_FECHA_NUEVO_PRECIO);
const linkedRentas = balanceRecord.getCellValue(FIELD_LINK_MESES) || [];
const precioAnterior = balanceRecord.getCellValue(FIELD_BALANCE_IMPORTE);
const avisoExistente = balanceRecord.getCellValue(FIELD_AVISO_NUEVO_PRECIO) || '';

// Porcentaje de servicio desde el deal (lookup devuelve array; valor como decimal: 0.06 = 6%)
const porcentajeRaw = balanceRecord.getCellValue(FIELD_LINK_DEAL_COMISION);
const porcentajeServicio = Array.isArray(porcentajeRaw) ? (porcentajeRaw[0] || 0) : (porcentajeRaw || 0);

// --- Validación ---
if (nuevoPrecio == null || !fechaNuevoPrecioRaw) {
    console.log('nuevoPrecio o fechaNuevoPrecio vacío. Abortando.');
    return;
}

const fechaEfectiva = new Date(fechaNuevoPrecioRaw);
// Normalizar a medianoche para comparaciones de fecha puras
fechaEfectiva.setHours(0, 0, 0, 0);

console.log(`Nuevo precio: €${nuevoPrecio}`);
console.log(`Precio anterior: €${precioAnterior}`);
console.log(`Porcentaje servicio: ${porcentajeServicio ? (porcentajeServicio * 100).toFixed(2) + '%' : 'no disponible'}`);
console.log(`Fecha efectiva: ${fechaEfectiva.toISOString().slice(0, 10)}`);
console.log(`Rentas vinculadas: ${linkedRentas.length}`);

// --- STEP 2: Obtener rentas futuras tipo "Alquiler" ---
if (linkedRentas.length === 0) {
    console.log('No hay rentas vinculadas a este balance.');
    return;
}

// Obtener solo las rentas vinculadas (recordIds max 100 por query)
const rentaIdsList = linkedRentas.map(r => r.id);
const rentasFields = [
    FIELD_RENTA_FECHA,              // fecha
    FIELD_RENTA_TIPO,               // tipo
    FIELD_RENTA_IMPORTE,            // importe
    FIELD_RENTA_IMPORTE_SERVICIO,   // importeServicio (comisión prorrateada por renta)
    FIELD_RENTA_CASHFLOWS,          // linkCashflows
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
    // Solo tipo "Alquiler"
    const tipo = renta.getCellValue(FIELD_RENTA_TIPO);
    if (!tipo || tipo.name !== 'Alquiler') return false;

    // Solo fecha >= fechaEfectiva
    const fecha = renta.getCellValue(FIELD_RENTA_FECHA);
    if (!fecha) return false;

    const rentaDate = new Date(fecha);
    rentaDate.setHours(0, 0, 0, 0);
    return rentaDate >= fechaEfectiva;
});

console.log(`Rentas futuras tipo Alquiler a actualizar: ${rentasFuturas.length}`);

if (rentasFuturas.length === 0) {
    console.log('No hay rentas futuras que actualizar.');
    return;
}

// --- STEP 3: Actualizar importe de rentas ---
const rentasUpdates = rentasFuturas.map(r => ({
    id: r.id,
    fields: { [FIELD_RENTA_IMPORTE]: nuevoPrecio }
}));

let rentasActualizadas = 0;
for (let i = 0; i < rentasUpdates.length; i += 50) {
    const batch = rentasUpdates.slice(i, i + 50);
    await rentasTable.updateRecordsAsync(batch);
    rentasActualizadas += batch.length;
    console.log(`Rentas actualizadas: ${rentasActualizadas}/${rentasUpdates.length}`);
}

// --- STEP 4: Recopilar cashflows vinculados y mapear a su renta ---
// Necesitamos saber a qué renta pertenece cada cashflow para usar su importeServicio
const cashflowIdToRenta = new Map(); // cashflowId → renta record
for (const renta of rentasFuturas) {
    const cfs = renta.getCellValue(FIELD_RENTA_CASHFLOWS);
    if (cfs) {
        for (const cf of cfs) {
            cashflowIdToRenta.set(cf.id, renta);
        }
    }
}

console.log(`Cashflows vinculados a rentas futuras: ${cashflowIdToRenta.size}`);

let cashflowsActualizados = 0;
let cashflowsIn = 0;
let cashflowsOut = 0;

if (cashflowIdToRenta.size > 0) {
    // --- STEP 5: Obtener y filtrar cashflows ---
    const cashflowIdsList = [...cashflowIdToRenta.keys()];
    const cashflowFields = [
        FIELD_CF_DIRECCION,     // direccion (In/Out)
        FIELD_CF_FECHA_PROG,    // fechaProgramada
        FIELD_CF_IMPORTE,       // importe
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
        // Solo cashflows con fechaProgramada >= fechaEfectiva
        const fechaProg = cf.getCellValue(FIELD_CF_FECHA_PROG);
        if (!fechaProg) continue;

        const cfDate = new Date(fechaProg);
        cfDate.setHours(0, 0, 0, 0);
        if (cfDate < fechaEfectiva) continue;

        // Determinar dirección
        const direccion = cf.getCellValue(FIELD_CF_DIRECCION);
        if (!direccion) continue;

        // Obtener importeServicio de la renta vinculada a este cashflow
        const rentaVinculada = cashflowIdToRenta.get(cf.id);
        const importeServicio = rentaVinculada
            ? (rentaVinculada.getCellValue(FIELD_RENTA_IMPORTE_SERVICIO) || 0)
            : 0;

        let nuevoImporte;
        if (direccion.name === 'In') {
            // Cobro al inquilino = alquiler + comisión servicio prorrateada
            nuevoImporte = nuevoPrecio + importeServicio;
            cashflowsIn++;
            console.log(`  CF In ${cf.id}: €${nuevoPrecio} + €${importeServicio} (servicio) = €${nuevoImporte}`);
        } else if (direccion.name === 'Out') {
            // Pago al propietario = alquiler puro (sin comisión)
            nuevoImporte = nuevoPrecio;
            cashflowsOut++;
            console.log(`  CF Out ${cf.id}: €${nuevoImporte}`);
        } else {
            continue;
        }

        cashflowUpdates.push({
            id: cf.id,
            fields: { [FIELD_CF_IMPORTE]: nuevoImporte }
        });
    }

    console.log(`Cashflows a actualizar: ${cashflowUpdates.length} (${cashflowsIn} In, ${cashflowsOut} Out)`);

    // --- STEP 6: Actualizar cashflows en batches ---
    for (let i = 0; i < cashflowUpdates.length; i += 50) {
        const batch = cashflowUpdates.slice(i, i + 50);
        await cashflowTable.updateRecordsAsync(batch);
        cashflowsActualizados += batch.length;
        console.log(`Cashflows actualizados: ${cashflowsActualizados}/${cashflowUpdates.length}`);
    }
} else {
    console.log('No hay cashflows vinculados a las rentas actualizadas.');
}

// --- STEP 7: Ajuste de servicio por incremento de precio ---
// Si el precio sube, calcular el extra de comisión sobre la diferencia
// para todos los meses restantes y concentrarlo en el primer mes.
const diferencia = nuevoPrecio - precioAnterior;
const mesesPendientes = rentasFuturas.length;
let ajusteServicioCreado = false;
let importeAjusteServicio = 0;

if (diferencia > 0 && porcentajeServicio > 0 && mesesPendientes > 0) {
    // importe_extra = diferencia × porcentaje × meses
    importeAjusteServicio = Math.round(diferencia * porcentajeServicio * mesesPendientes * 100) / 100;

    console.log(`--- Ajuste de servicio por subida de precio ---`);
    console.log(`  Diferencia: €${diferencia}`);
    console.log(`  Porcentaje servicio: ${(porcentajeServicio * 100).toFixed(2)}%`);
    console.log(`  Meses pendientes: ${mesesPendientes}`);
    console.log(`  Importe ajuste total: €${importeAjusteServicio}`);

    // Fecha del primer mes con nuevo precio (ordenar rentasFuturas por fecha)
    const rentasOrdenadas = [...rentasFuturas].sort((a, b) => {
        return new Date(a.getCellValue(FIELD_RENTA_FECHA)) - new Date(b.getCellValue(FIELD_RENTA_FECHA));
    });
    const fechaPrimerMes = rentasOrdenadas[0].getCellValue(FIELD_RENTA_FECHA);
    const fechaAjusteISO = new Date(fechaPrimerMes).toISOString().slice(0, 10);

    // --- Opción "todo en primer mes" (preparado para reparto mensual futuro) ---
    // Para cambiar a reparto mensual, sustituir estos arrays por uno por mes:
    //   const importePorMes = Math.round((importeAjusteServicio / mesesPendientes) * 100) / 100;
    //   const importesPorMes = rentasOrdenadas.map(() => importePorMes);
    //   const fechasPorMes = rentasOrdenadas.map(r => new Date(r.getCellValue(FIELD_RENTA_FECHA)).toISOString().slice(0, 10));
    const importesPorMes = [importeAjusteServicio];
    const fechasPorMes = [fechaAjusteISO];

    for (let m = 0; m < importesPorMes.length; m++) {
        // Crear renta de tipo "Comisión Advancing" para el ajuste de servicio
        const nuevaRentaId = await rentasTable.createRecordAsync({
            [FIELD_RENTA_FECHA]: fechasPorMes[m],
            [FIELD_RENTA_TIPO]: { name: 'Comisión Advancing' },
            [FIELD_RENTA_IMPORTE_SERVICIO]: importesPorMes[m],
            [FIELD_RENTA_DEAL_BALANCE]: [{ id: balanceRecordId }],
        });

        console.log(`  Renta ajuste creada: ${nuevaRentaId} (€${importesPorMes[m]}, ${fechasPorMes[m]})`);

        // Crear cashflow In vinculado a la nueva renta
        const nuevoCfId = await cashflowTable.createRecordAsync({
            [FIELD_CF_DIRECCION]: { name: 'In' },
            [FIELD_CF_FECHA_PROG]: fechasPorMes[m],
            [FIELD_CF_IMPORTE]: importesPorMes[m],
            [FIELD_CF_STATUS_INS]: { name: 'Pendiente' },
            [FIELD_CF_LINK_RENTA]: [{ id: nuevaRentaId }],
            [FIELD_CF_LINK_DEAL_BALANCE]: [{ id: balanceRecordId }],
            [FIELD_CF_RAZON]: { name: 'Renta' },
            [FIELD_CF_SUJETO]: { name: 'Pagador alquiler' },
        });

        console.log(`  Cashflow In ajuste creado: ${nuevoCfId} (€${importesPorMes[m]}, Pendiente)`);
    }

    ajusteServicioCreado = true;
    console.log(`Ajuste de servicio completado: €${importeAjusteServicio} concentrado en ${fechaAjusteISO}`);
} else if (diferencia <= 0) {
    console.log('Precio no sube (diferencia <= 0). No se crea ajuste de servicio.');
} else if (!porcentajeServicio) {
    console.log('Porcentaje de servicio no disponible en el deal. No se crea ajuste de servicio.');
}

// --- STEP 8: Escribir línea de auditoría en avisoNuevoPrecio ---
const ahora = new Date();
const dd = String(ahora.getDate()).padStart(2, '0');
const mm = String(ahora.getMonth() + 1).padStart(2, '0');
const yyyy = ahora.getFullYear();
const hh = String(ahora.getHours()).padStart(2, '0');
const min = String(ahora.getMinutes()).padStart(2, '0');
const fechaEfectivaStr = `${String(fechaEfectiva.getDate()).padStart(2, '0')}/${String(fechaEfectiva.getMonth() + 1).padStart(2, '0')}/${fechaEfectiva.getFullYear()}`;
const precioAntStr = precioAnterior != null ? precioAnterior : '?';

let lineaAuditoria = `[${dd}/${mm}/${yyyy} ${hh}:${min}] €${precioAntStr} → €${nuevoPrecio} (efectivo desde ${fechaEfectivaStr}) — ${rentasActualizadas} rentas, ${cashflowsActualizados} cashflows (${cashflowsIn} In, ${cashflowsOut} Out)`;

if (ajusteServicioCreado) {
    lineaAuditoria += ` | Ajuste servicio: €${importeAjusteServicio} (dif €${diferencia} × ${(porcentajeServicio * 100).toFixed(0)}% × ${mesesPendientes} meses)`;
}

// Append: acumular sobre el historial existente
const nuevoAviso = avisoExistente
    ? avisoExistente + '\n' + lineaAuditoria
    : lineaAuditoria;

await balanceTable.updateRecordAsync(balanceRecordId, {
    [FIELD_AVISO_NUEVO_PRECIO]: nuevoAviso,
});

console.log(`Auditoría escrita: ${lineaAuditoria}`);

// --- Resumen ---
console.log('========================================');
console.log('ACTUALIZACIÓN COMPLETADA');
console.log(`Nuevo precio (importe renta): €${nuevoPrecio}`);
console.log(`Precio anterior: €${precioAntStr}`);
console.log(`Fecha efectiva: ${fechaEfectivaStr}`);
console.log(`Rentas actualizadas: ${rentasActualizadas}`);
console.log(`Cashflows actualizados: ${cashflowsActualizados} (${cashflowsIn} In, ${cashflowsOut} Out)`);
console.log(`  - In (cobros): nuevoPrecio + importeServicio de cada renta`);
console.log(`  - Out (pagos propietario): €${nuevoPrecio}`);
if (ajusteServicioCreado) {
    console.log(`Ajuste servicio: €${importeAjusteServicio}`);
    console.log(`  Diferencia: €${diferencia}, Porcentaje: ${(porcentajeServicio * 100).toFixed(2)}%, Meses: ${mesesPendientes}`);
    console.log(`  → 1 renta "Comisión Advancing" + 1 cashflow In creados`);
}
console.log('========================================');
