// ============================================================================
// AIRTABLE AUTOMATION SCRIPT: Búsqueda Pagador/Cobrador desde Google Sheets
// ============================================================================
//
// BASE: Advancing (appuV5kGKzKdXlhoR)
//
// TRIGGER: "When record matches conditions" en tabla deal
//   - Condiciones: busquedaBancos = "Pendiente"
//
// INPUT VARIABLES (configurar en la automatización):
//   - dealRecordId: Record ID del registro de deal (del trigger)
//
// PREREQUISITOS:
//   - Google API Key restringida a Sheets API (ver busquedaPagadorCobrador.md)
//   - Spreadsheet con acceso "Anyone with the link can view"
//   - Campo "avisoBusquedaBancos" (long text) en tabla deal — CREAR si no existe
//
// FUNCIONAMIENTO:
//   1. Lee el deal y obtiene su id_deal
//   2. Lee los contactos vinculados al deal (propietarios, inquilinos, avalistas)
//   3. Fetch a Google Sheets:
//      - "Transferencia Propietario" → IBAN del cobrador (propietario)
//      - "CF Cobros" → IBAN del pagador (inquilino)
//   4. Busca la fila por id_deal y extrae el IBAN
//   5. Match: compara el IBAN del Sheet contra los IBANs de los contactos
//   6. Vincula el contacto que matchea en linkPagador / linkCobrador (record link)
//      → Los lookups (nombre, IBAN, doc, BIC) se rellenan automáticamente
//   7. Actualiza busquedaBancos → "Encontrado" / "No encontrado" / "Error"
//   8. Escribe línea de auditoría acumulativa en avisoBusquedaBancos
//
// ============================================================================

const config = input.config();
const dealRecordId = config.dealRecordId;

// --- Referencias a tablas (Advancing) ---
const dealTable = base.getTable('tblwx73iceuKNaz68');           // deal
const contactosTable = base.getTable('tbl7HVrBNBY9cSXzj');     // contactos

// --- Field IDs: Deal ---
const FIELD_INDEX_DEAL = 'fldy5iJC8jL3oC44d';                  // indexDeal (formula)
const FIELD_ID_DEAL = 'fldnvZWV2jyROqgGl';                     // id_deal (text)
const FIELD_BUSQUEDA_BANCOS = 'fldOGuLjLG0RnkcQH';             // busquedaBancos (single select)
const FIELD_AVISO_BUSQUEDA = 'avisoBusquedaBancos';             // CREAR: long text

// Links a contactos (record links → contactos)
const FIELD_LINK_PROPIETARIO = 'fldIFVkAtmKJmo2qo';            // id_propietariolink
const FIELD_LINK_INQUILINO = 'fldTrPxDj6rtOjONv';              // inquilino link
const FIELD_LINK_AVALISTA = 'fldoCJFeFTQ74HX6F';               // id_avalista link

// Links pagador/cobrador (record links → contactos) — los que rellenamos
const FIELD_LINK_PAGADOR = 'fldQFS4EZbVBDsPZW';                // linkPagador
const FIELD_LINK_COBRADOR = 'fldGM0dMF3630o2cx';               // linkCobrador

// --- Field IDs: Contactos ---
const FIELD_CONTACTO_NOMBRE = 'fld9pjRDwkZhflVna';             // nombre
const FIELD_CONTACTO_CUENTA = 'fldUY0qcYZGBQjuk1';             // numero de cuenta (IBAN)
const FIELD_CONTACTO_TIPO = 'fldDfGSRXsZggcAlq';               // tipo contacto (select)
const FIELD_CONTACTO_DOC = 'fldDicT1bmEt0RWha';                // numero documento

// ============================================================================
// CONFIGURACIÓN GOOGLE SHEETS
// ============================================================================

// Spreadsheet ID: se saca de la URL → https://docs.google.com/spreadsheets/d/ESTE_ID/edit
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';               // TODO: Configurar

// Google API Key restringida a Sheets API
const GOOGLE_API_KEY = 'TU_GOOGLE_API_KEY_AQUI';               // TODO: Configurar

// Nombres de hojas (exactos, incluyendo mayúsculas)
const SHEET_COBRADOR = 'Transferencia Propietario';             // IBAN del cobrador
const SHEET_PAGADOR = 'CF Cobros';                              // IBAN del pagador

// --- Nombres de cabeceros en Google Sheets ---
// La búsqueda se hace por nombre de columna (fila 0 = cabecera)
const HEADER_NUM_OPERACION = 'Nº de Operación';  // Columna para buscar el deal
const HEADER_IBAN_COBRADOR = 'IBAN';              // TODO: Ajustar al nombre real de la columna IBAN en "Transferencia Propietario"
const HEADER_IBAN_PAGADOR = 'IBAN';               // TODO: Ajustar al nombre real de la columna IBAN en "CF Cobros"

// ============================================================================
// UTILIDADES
// ============================================================================

function formatTimestamp() {
    const ahora = new Date();
    const dd = String(ahora.getDate()).padStart(2, '0');
    const mm = String(ahora.getMonth() + 1).padStart(2, '0');
    const yyyy = ahora.getFullYear();
    const hh = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/**
 * Normaliza un IBAN: elimina espacios, guiones, puntos → mayúsculas.
 */
function normalizeIBAN(iban) {
    if (!iban) return '';
    return iban.replace(/[\s\-\.]/g, '').toUpperCase().trim();
}

/**
 * Limpia un valor de celda de Google Sheets.
 */
function cleanCellValue(val) {
    if (val === null || val === undefined) return '';
    return String(val).trim();
}

// ============================================================================
// GOOGLE SHEETS: Lectura via API Key
// ============================================================================

/**
 * Obtiene todas las filas de una hoja del Google Sheet.
 */
async function fetchSheetData(sheetName) {
    const range = encodeURIComponent(`${sheetName}!A:Z`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;

    console.log(`Fetching hoja "${sheetName}"...`);

    let response;
    try {
        response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });
    } catch (err) {
        throw new Error(`Error de red: ${err.message}`);
    }

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Google Sheets API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const rows = data.values || [];
    console.log(`  → ${rows.length} filas (incluyendo cabecera)`);
    return rows;
}

/**
 * Busca el índice de una columna por nombre de cabecero (fila 0).
 * Comparación case-insensitive y trimmed.
 */
function findColumnIndex(headers, headerName) {
    if (!headers) return -1;
    const target = headerName.trim().toLowerCase();
    return headers.findIndex(h => cleanCellValue(h).toLowerCase() === target);
}

/**
 * Busca la primera fila cuyo valor en la columna "Nº de Operación" coincida
 * con el id_deal (case-insensitive, trimmed).
 * Salta fila 0 (cabecera). Devuelve { row, headers } o null.
 */
function findRowByNumOperacion(rows, idDeal) {
    if (!rows || rows.length < 2) return null;

    const headers = rows[0];
    const colIndex = findColumnIndex(headers, HEADER_NUM_OPERACION);
    if (colIndex === -1) {
        console.error(`  ✗ Cabecero "${HEADER_NUM_OPERACION}" no encontrado. Cabeceros disponibles: ${headers.map(h => `"${h}"`).join(', ')}`);
        return null;
    }
    console.log(`  Columna "${HEADER_NUM_OPERACION}" encontrada en índice ${colIndex}`);

    const target = String(idDeal).trim().toLowerCase();
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length <= colIndex) continue;
        if (cleanCellValue(row[colIndex]).toLowerCase() === target) return { row, headers };
    }
    return null;
}

// ============================================================================
// STEP 1: Leer el deal y validar
// ============================================================================

console.log(`\n========================================`);
console.log(`BÚSQUEDA PAGADOR/COBRADOR`);
console.log(`========================================`);
console.log(`Deal record: ${dealRecordId}`);

const dealRecord = await dealTable.selectRecordAsync(dealRecordId, {
    fields: [
        FIELD_INDEX_DEAL,
        FIELD_ID_DEAL,
        FIELD_BUSQUEDA_BANCOS,
        FIELD_AVISO_BUSQUEDA,
        FIELD_LINK_PROPIETARIO,
        FIELD_LINK_INQUILINO,
        FIELD_LINK_AVALISTA,
        FIELD_LINK_PAGADOR,
        FIELD_LINK_COBRADOR,
    ]
});

if (!dealRecord) {
    console.error(`Deal ${dealRecordId} no encontrado`);
    throw new Error('Deal no encontrado');
}

const idDeal = dealRecord.getCellValue(FIELD_ID_DEAL);
const indexDeal = dealRecord.getCellValueAsString(FIELD_INDEX_DEAL);
const busqueda = dealRecord.getCellValue(FIELD_BUSQUEDA_BANCOS);
const avisoExistente = dealRecord.getCellValue(FIELD_AVISO_BUSQUEDA) || '';

console.log(`Deal: ${indexDeal || dealRecordId}`);
console.log(`id_deal: ${idDeal}`);
console.log(`busquedaBancos: ${busqueda ? busqueda.name : '(vacío)'}`);

// Validaciones
if (!busqueda || busqueda.name !== 'Pendiente') {
    console.log('busquedaBancos no es "Pendiente". Abortando.');
    return;
}

if (!idDeal) {
    const msg = 'El deal no tiene id_deal.';
    console.error(msg);
    await dealTable.updateRecordAsync(dealRecordId, {
        [FIELD_BUSQUEDA_BANCOS]: { name: 'Error' },
        [FIELD_AVISO_BUSQUEDA]: avisoExistente
            ? avisoExistente + '\n' + `[${formatTimestamp()}] ERROR: ${msg}`
            : `[${formatTimestamp()}] ERROR: ${msg}`,
    });
    return;
}

// ============================================================================
// STEP 2: Leer contactos vinculados al deal
// ============================================================================

console.log('\n--- STEP 2: Leyendo contactos del deal ---');

// Recopilar todos los contactos vinculados (propietarios, inquilinos, avalistas)
const linkedProp = dealRecord.getCellValue(FIELD_LINK_PROPIETARIO) || [];
const linkedInq = dealRecord.getCellValue(FIELD_LINK_INQUILINO) || [];
const linkedAval = dealRecord.getCellValue(FIELD_LINK_AVALISTA) || [];

const allContactIds = [
    ...linkedProp.map(r => ({ id: r.id, rol: 'propietario' })),
    ...linkedInq.map(r => ({ id: r.id, rol: 'inquilino' })),
    ...linkedAval.map(r => ({ id: r.id, rol: 'avalista' })),
];

console.log(`  Propietarios: ${linkedProp.length}, Inquilinos: ${linkedInq.length}, Avalistas: ${linkedAval.length}`);
console.log(`  Total contactos: ${allContactIds.length}`);

if (allContactIds.length === 0) {
    const msg = 'El deal no tiene contactos vinculados (ni propietarios, ni inquilinos, ni avalistas).';
    console.error(msg);
    await dealTable.updateRecordAsync(dealRecordId, {
        [FIELD_BUSQUEDA_BANCOS]: { name: 'Error' },
        [FIELD_AVISO_BUSQUEDA]: avisoExistente
            ? avisoExistente + '\n' + `[${formatTimestamp()}] ERROR: ${msg}`
            : `[${formatTimestamp()}] ERROR: ${msg}`,
    });
    return;
}

// Leer datos de cada contacto (nombre, IBAN, documento)
const contactos = [];
for (const c of allContactIds) {
    const rec = await contactosTable.selectRecordAsync(c.id, {
        fields: [
            FIELD_CONTACTO_NOMBRE,
            FIELD_CONTACTO_CUENTA,
            FIELD_CONTACTO_TIPO,
            FIELD_CONTACTO_DOC,
        ]
    });
    if (rec) {
        const nombre = rec.getCellValueAsString(FIELD_CONTACTO_NOMBRE);
        const ibanRaw = rec.getCellValue(FIELD_CONTACTO_CUENTA) || '';
        const iban = normalizeIBAN(ibanRaw);
        const tipo = rec.getCellValue(FIELD_CONTACTO_TIPO);
        const doc = rec.getCellValue(FIELD_CONTACTO_DOC) || '';

        contactos.push({
            id: c.id,
            rol: c.rol,
            nombre,
            iban,
            ibanRaw,
            tipo: tipo ? tipo.name : '',
            doc,
        });
        console.log(`  → ${c.rol}: ${nombre} | IBAN: ${iban || '(vacío)'} | Doc: ${doc}`);
    }
}

// ============================================================================
// STEP 3: Fetch IBANs de Google Sheets
// ============================================================================

console.log('\n--- STEP 3: Obteniendo IBANs de Google Sheets ---');

let ibanPagadorSheet = null;
let ibanCobradorSheet = null;
let fetchErrors = [];

// 3a) IBAN cobrador desde "Transferencia Propietario"
try {
    const rows = await fetchSheetData(SHEET_COBRADOR);
    const result = findRowByNumOperacion(rows, idDeal);
    if (result) {
        const ibanColIndex = findColumnIndex(result.headers, HEADER_IBAN_COBRADOR);
        if (ibanColIndex === -1) {
            console.error(`  ✗ Cabecero IBAN "${HEADER_IBAN_COBRADOR}" no encontrado en "${SHEET_COBRADOR}"`);
        } else {
            ibanCobradorSheet = normalizeIBAN(cleanCellValue(result.row[ibanColIndex]));
            console.log(`  ✓ IBAN cobrador del Sheet: ${ibanCobradorSheet}`);
        }
    } else {
        console.log(`  ✗ "${HEADER_NUM_OPERACION}"="${idDeal}" no encontrado en "${SHEET_COBRADOR}"`);
    }
} catch (err) {
    const msg = `Error "${SHEET_COBRADOR}": ${err.message}`;
    console.error(`  ${msg}`);
    fetchErrors.push(msg);
}

// 3b) IBAN pagador desde "CF Cobros"
try {
    const rows = await fetchSheetData(SHEET_PAGADOR);
    const result = findRowByNumOperacion(rows, idDeal);
    if (result) {
        const ibanColIndex = findColumnIndex(result.headers, HEADER_IBAN_PAGADOR);
        if (ibanColIndex === -1) {
            console.error(`  ✗ Cabecero IBAN "${HEADER_IBAN_PAGADOR}" no encontrado en "${SHEET_PAGADOR}"`);
        } else {
            ibanPagadorSheet = normalizeIBAN(cleanCellValue(result.row[ibanColIndex]));
            console.log(`  ✓ IBAN pagador del Sheet: ${ibanPagadorSheet}`);
        }
    } else {
        console.log(`  ✗ "${HEADER_NUM_OPERACION}"="${idDeal}" no encontrado en "${SHEET_PAGADOR}"`);
    }
} catch (err) {
    const msg = `Error "${SHEET_PAGADOR}": ${err.message}`;
    console.error(`  ${msg}`);
    fetchErrors.push(msg);
}

// Si fallaron AMBAS hojas → Error
if (fetchErrors.length === 2) {
    const msg = `Error en ambas hojas:\n${fetchErrors.join('\n')}`;
    await dealTable.updateRecordAsync(dealRecordId, {
        [FIELD_BUSQUEDA_BANCOS]: { name: 'Error' },
        [FIELD_AVISO_BUSQUEDA]: avisoExistente
            ? avisoExistente + '\n' + `[${formatTimestamp()}] ERROR: ${msg}`
            : `[${formatTimestamp()}] ERROR: ${msg}`,
    });
    return;
}

// ============================================================================
// STEP 4: Match IBANs del Sheet contra contactos del deal
// ============================================================================

console.log('\n--- STEP 4: Matching IBANs ---');

let matchPagador = null;   // contacto que matchea como pagador
let matchCobrador = null;  // contacto que matchea como cobrador

// Buscar pagador: ¿qué contacto tiene el IBAN del pagador del Sheet?
if (ibanPagadorSheet) {
    matchPagador = contactos.find(c => c.iban && c.iban === ibanPagadorSheet);
    if (matchPagador) {
        console.log(`  ✓ PAGADOR match: ${matchPagador.nombre} (${matchPagador.rol}) — IBAN: ${matchPagador.iban}`);
    } else {
        console.log(`  ✗ PAGADOR: ningún contacto tiene IBAN ${ibanPagadorSheet}`);
        // Log todos los IBANs disponibles para debug
        console.log(`    IBANs disponibles: ${contactos.map(c => `${c.rol}:${c.iban || 'vacío'}`).join(', ')}`);
    }
} else {
    console.log(`  - PAGADOR: sin IBAN del Sheet para buscar`);
}

// Buscar cobrador: ¿qué contacto tiene el IBAN del cobrador del Sheet?
if (ibanCobradorSheet) {
    matchCobrador = contactos.find(c => c.iban && c.iban === ibanCobradorSheet);
    if (matchCobrador) {
        console.log(`  ✓ COBRADOR match: ${matchCobrador.nombre} (${matchCobrador.rol}) — IBAN: ${matchCobrador.iban}`);
    } else {
        console.log(`  ✗ COBRADOR: ningún contacto tiene IBAN ${ibanCobradorSheet}`);
        console.log(`    IBANs disponibles: ${contactos.map(c => `${c.rol}:${c.iban || 'vacío'}`).join(', ')}`);
    }
} else {
    console.log(`  - COBRADOR: sin IBAN del Sheet para buscar`);
}

// ============================================================================
// STEP 5: Actualizar deal con los matches
// ============================================================================

console.log('\n--- STEP 5: Actualizando deal ---');

const updateFields = {};
const auditLines = [];

// Vincular pagador (record link)
if (matchPagador) {
    updateFields[FIELD_LINK_PAGADOR] = [{ id: matchPagador.id }];
    auditLines.push(`Pagador: ${matchPagador.nombre} (${matchPagador.rol}, IBAN: ${matchPagador.iban})`);
    console.log(`  ✓ linkPagador → ${matchPagador.nombre} (${matchPagador.id})`);
} else if (ibanPagadorSheet) {
    auditLines.push(`Pagador: IBAN ${ibanPagadorSheet} del Sheet no coincide con ningún contacto`);
    console.log(`  ✗ linkPagador no actualizado — sin match`);
} else {
    auditLines.push(`Pagador: id_deal no encontrado en hoja "${SHEET_PAGADOR}"`);
    console.log(`  ✗ linkPagador no actualizado — sin dato en Sheet`);
}

// Vincular cobrador (record link)
if (matchCobrador) {
    updateFields[FIELD_LINK_COBRADOR] = [{ id: matchCobrador.id }];
    auditLines.push(`Cobrador: ${matchCobrador.nombre} (${matchCobrador.rol}, IBAN: ${matchCobrador.iban})`);
    console.log(`  ✓ linkCobrador → ${matchCobrador.nombre} (${matchCobrador.id})`);
} else if (ibanCobradorSheet) {
    auditLines.push(`Cobrador: IBAN ${ibanCobradorSheet} del Sheet no coincide con ningún contacto`);
    console.log(`  ✗ linkCobrador no actualizado — sin match`);
} else {
    auditLines.push(`Cobrador: id_deal no encontrado en hoja "${SHEET_COBRADOR}"`);
    console.log(`  ✗ linkCobrador no actualizado — sin dato en Sheet`);
}

// Estado final
let estadoFinal;
if (matchPagador && matchCobrador) {
    estadoFinal = 'Encontrado';
} else if (!ibanPagadorSheet && !ibanCobradorSheet) {
    estadoFinal = 'No encontrado';
} else {
    estadoFinal = 'No encontrado';
}

if (fetchErrors.length > 0) {
    auditLines.push(`Advertencia: ${fetchErrors.join('; ')}`);
}

// Auditoría acumulativa
const auditMsg = `[${formatTimestamp()}] id_deal="${idDeal}" → ${estadoFinal}\n  ${auditLines.join('\n  ')}`;

updateFields[FIELD_BUSQUEDA_BANCOS] = { name: estadoFinal };
updateFields[FIELD_AVISO_BUSQUEDA] = avisoExistente
    ? avisoExistente + '\n' + auditMsg
    : auditMsg;

await dealTable.updateRecordAsync(dealRecordId, updateFields);

console.log(`\n========================================`);
console.log(`RESULTADO: ${estadoFinal}`);
console.log(`========================================`);
console.log(auditMsg);
