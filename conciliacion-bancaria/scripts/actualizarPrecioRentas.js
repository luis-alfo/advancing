// ============================================================================
// AIRTABLE AUTOMATION SCRIPT: Actualización No Retroactiva de Precio de Rentas
// ============================================================================
//
// TRIGGER: "When record matches conditions" en tabla balance
//   - Condiciones: nuevoPrecio is not empty AND fechaNuevoPrecio is not empty
//
// INPUT VARIABLES (configurar en la automatización):
//   - balanceRecordId: Record ID del registro de balance (del trigger)
//   - gestorPAT: Personal Access Token con acceso a la base del Gestor
//
// FUNCIONAMIENTO:
//   1. Lee nuevoPrecio, fechaNuevoPrecio, precio anterior y aviso existente del balance
//   2. Actualiza importe de rentas tipo "Alquiler" con fecha >= fechaNuevoPrecio
//   3. Actualiza cashflows vinculados a cada renta, respetando importeServicio:
//      - In (cobros)  → nuevoPrecio + importeServicio de la renta
//      - Out (pagos propietario) → nuevoPrecio (sin comisión)
//   4. Escribe línea de auditoría en avisoNuevoPrecio (acumulativo)
//   5. Sincroniza al Gestor: historicoCambiosPrecios + alquiler mensual
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

// --- STEP 1: Leer el registro de balance ---
console.log(`Procesando balance: ${balanceRecordId}`);

const balanceRecord = await balanceTable.selectRecordAsync(balanceRecordId, {
    fields: [
        'fldiWklj6yoWqsQSH', // nuevoPrecio
        'fldMjSkNNd7J7BetK', // fechaNuevoPrecio
        'fldFlp2wDVWljyTtC', // linkMeses (rentas vinculadas)
        'fldtJw4GfIzEtc7h2', // importe (precio anterior)
        'fldaV2nYiekBXEHVz', // avisoNuevoPrecio (historial de auditoría)
    ]
});

if (!balanceRecord) {
    console.error(`Registro de balance ${balanceRecordId} no encontrado`);
    throw new Error('Registro de balance no encontrado');
}

const nuevoPrecio = balanceRecord.getCellValue('fldiWklj6yoWqsQSH');
const fechaNuevoPrecioRaw = balanceRecord.getCellValue('fldMjSkNNd7J7BetK');
const linkedRentas = balanceRecord.getCellValue('fldFlp2wDVWljyTtC') || [];
const precioAnterior = balanceRecord.getCellValue('fldtJw4GfIzEtc7h2');
const avisoExistente = balanceRecord.getCellValue('fldaV2nYiekBXEHVz') || '';

// --- Validación ---
if (nuevoPrecio == null || !fechaNuevoPrecioRaw) {
    console.log('nuevoPrecio o fechaNuevoPrecio vacío. Abortando.');
    return;
}

const fechaEfectiva = new Date(fechaNuevoPrecioRaw);
// Normalizar a medianoche para comparaciones de fecha puras
fechaEfectiva.setHours(0, 0, 0, 0);

console.log(`Nuevo precio: €${nuevoPrecio}`);
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
    'fldSdtfW7UfIw8z4V', // fecha
    'fldTWeJAYDxWOZWPJ', // tipo
    'fld2DbSB516n1bU8f', // importe
    'fldS4Zqn2KLOox9jG', // importeServicio (comisión prorrateada por renta)
    'fld7ERQvv5apIJcyX', // linkCashflows
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
    const tipo = renta.getCellValue('fldTWeJAYDxWOZWPJ');
    if (!tipo || tipo.name !== 'Alquiler') return false;

    // Solo fecha >= fechaEfectiva
    const fecha = renta.getCellValue('fldSdtfW7UfIw8z4V');
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
    fields: { 'fld2DbSB516n1bU8f': nuevoPrecio }
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
    const cfs = renta.getCellValue('fld7ERQvv5apIJcyX');
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
        'fld656RBx2XkCHzR7', // direccion (In/Out)
        'fldrquziQqJoTn08B', // fechaProgramada
        'fldbkCQZwDR8a9kRP', // importe
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
        const fechaProg = cf.getCellValue('fldrquziQqJoTn08B');
        if (!fechaProg) continue;

        const cfDate = new Date(fechaProg);
        cfDate.setHours(0, 0, 0, 0);
        if (cfDate < fechaEfectiva) continue;

        // Determinar dirección
        const direccion = cf.getCellValue('fld656RBx2XkCHzR7');
        if (!direccion) continue;

        // Obtener importeServicio de la renta vinculada a este cashflow
        const rentaVinculada = cashflowIdToRenta.get(cf.id);
        const importeServicio = rentaVinculada
            ? (rentaVinculada.getCellValue('fldS4Zqn2KLOox9jG') || 0)
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
            fields: { 'fldbkCQZwDR8a9kRP': nuevoImporte }
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

// --- STEP 7: Escribir línea de auditoría en avisoNuevoPrecio ---
const ahora = new Date();
const dd = String(ahora.getDate()).padStart(2, '0');
const mm = String(ahora.getMonth() + 1).padStart(2, '0');
const yyyy = ahora.getFullYear();
const hh = String(ahora.getHours()).padStart(2, '0');
const min = String(ahora.getMinutes()).padStart(2, '0');
const fechaEfectivaStr = `${String(fechaEfectiva.getDate()).padStart(2, '0')}/${String(fechaEfectiva.getMonth() + 1).padStart(2, '0')}/${fechaEfectiva.getFullYear()}`;
const precioAntStr = precioAnterior != null ? precioAnterior : '?';

const lineaAuditoria = `[${dd}/${mm}/${yyyy} ${hh}:${min}] €${precioAntStr} → €${nuevoPrecio} (efectivo desde ${fechaEfectivaStr}) — ${rentasActualizadas} rentas, ${cashflowsActualizados} cashflows (${cashflowsIn} In, ${cashflowsOut} Out)`;

// Append: acumular sobre el historial existente
const nuevoAviso = avisoExistente
    ? avisoExistente + '\n' + lineaAuditoria
    : lineaAuditoria;

await balanceTable.updateRecordAsync(balanceRecordId, {
    'fldaV2nYiekBXEHVz': nuevoAviso, // avisoNuevoPrecio
});

console.log(`Auditoría escrita: ${lineaAuditoria}`);

// --- STEP 8: Sincronizar al Gestor (historicoCambiosPrecios + alquiler mensual) ---
// Navegar balance → deal → recordID (del Gestor)
const linkedDeal = balanceRecord.getCellValue('fldOnUYgysh29VHMe'); // linkDeal
if (linkedDeal && linkedDeal.length > 0) {
    const dealsTable = base.getTable('tblWnB9SCfCFoXzfW');
    const dealRecord = await dealsTable.selectRecordAsync(linkedDeal[0].id, {
        fields: ['recordID', 'id_deal']
    });

    const gestorRecordId = dealRecord?.getCellValueAsString('recordID');
    if (gestorRecordId) {
        const GESTOR_BASE_ID = 'appuV5kGKzKdXlhoR';
        const GESTOR_TABLE_ID = 'tblwx73iceuKNaz68';
        const GESTOR_PAT = input.config().gestorPAT || 'TU_PERSONAL_ACCESS_TOKEN';

        const gestorFields = {
            'fldvEH2HFKDEC6KsI': nuevoAviso,     // historicoCambiosPrecios
            'fldTJIw17zLdUiXDH': nuevoPrecio,     // alquiler mensual
            'fldifPFuiOQMBEWif': 'bancos-sync'    // _syncSource
        };

        const url = `https://api.airtable.com/v0/${GESTOR_BASE_ID}/${GESTOR_TABLE_ID}/${gestorRecordId}`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${GESTOR_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields: gestorFields })
        });

        if (response.ok) {
            console.log(`Gestor actualizado: deal ${dealRecord.getCellValueAsString('id_deal')}`);
            console.log(`  historicoCambiosPrecios: ${nuevoAviso.split('\n').length} líneas`);
            console.log(`  alquiler mensual: €${nuevoPrecio}`);
        } else {
            const error = await response.text();
            console.error(`ERROR al actualizar Gestor: ${response.status} — ${error}`);
        }
    } else {
        console.log('Deal sin recordID de Gestor, sync omitido');
    }
} else {
    console.log('Balance sin linkDeal, sync al Gestor omitido');
}

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
console.log('========================================');
