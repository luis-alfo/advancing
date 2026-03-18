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
//      - "Altas SEPA" → IBAN del pagador (inquilino)
//   4. Busca la fila por "Nº de Operación" y extrae el IBAN
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
const FIELD_CONTACTO_NOMBRE_COMPLETO = 'fldaH2bcz65kTp1ko';    // nombreYapellidos (formula: nombre + apellidos)

// ============================================================================
// CONFIGURACIÓN GOOGLE SHEETS
// ============================================================================

// Spreadsheet ID: se saca de la URL → https://docs.google.com/spreadsheets/d/ESTE_ID/edit
const SPREADSHEET_ID = '1Vn6XQMv37AajuKZrwwau9kaRlIQd9Bd8QCv-pzmQLg4';

// Google API Key: configurada como secret en Airtable Automations
const GOOGLE_API_KEY = input.secret("googleAPIKey");

// Nombres de hojas (exactos, incluyendo mayúsculas)
const SHEET_COBRADOR = 'Transferencia Propietario';             // IBAN del cobrador (propietario)
const SHEET_PAGADOR = 'Altas SEPA';                             // IBAN del pagador (inquilino)

// --- Nombres de cabeceros en Google Sheets ---
// La búsqueda se hace por nombre de columna (fila 0 = cabecera)
const HEADER_NUM_OPERACION = 'Nº de Operación';          // Columna para buscar el deal
const HEADER_IBAN_COBRADOR = 'Numero de cuenta';          // Columna IBAN en "Transferencia Propietario"
const HEADER_IBAN_PAGADOR = 'Nº de cuenta inquilino';     // Columna IBAN en "Altas SEPA"

// Columnas de NOMBRE en Google Sheets (para fallback cuando IBAN no matchea)
// CONFIGURAR: poner el nombre exacto del cabecero de la columna de nombre en cada hoja
const HEADER_NOMBRE_PAGADOR = 'Nombre inquilino (deudor)';  // Columna E en "Altas SEPA"
const HEADER_NOMBRE_COBRADOR = 'Nombre propietario';       // Columna N en "Transferencia Propietario"

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
 * Normaliza un nombre para comparación fuzzy:
 * - Minúsculas, sin acentos, sin guiones, sin espacios extra
 * Ejemplo: "VÍCTOR HUGO CAICEDO-CAÑAS" → "victor hugo caicedo canas"
 */
function normalizeName(name) {
    if (!name) return '';
    return name
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // quitar acentos
        .toLowerCase()
        .replace(/[\-\.]/g, ' ')                             // guiones y puntos → espacio
        .replace(/\s+/g, ' ')                                // colapsar espacios
        .trim();
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
            FIELD_CONTACTO_NOMBRE_COMPLETO,
            FIELD_CONTACTO_CUENTA,
            FIELD_CONTACTO_TIPO,
            FIELD_CONTACTO_DOC,
        ]
    });
    if (rec) {
        const nombre = rec.getCellValueAsString(FIELD_CONTACTO_NOMBRE);
        const nombreCompleto = rec.getCellValueAsString(FIELD_CONTACTO_NOMBRE_COMPLETO) || nombre;
        const ibanRaw = rec.getCellValue(FIELD_CONTACTO_CUENTA) || '';
        const iban = normalizeIBAN(ibanRaw);
        const tipo = rec.getCellValue(FIELD_CONTACTO_TIPO);
        const doc = rec.getCellValue(FIELD_CONTACTO_DOC) || '';

        contactos.push({
            id: c.id,
            rol: c.rol,
            nombre,
            nombreCompleto,
            nombreNorm: normalizeName(nombreCompleto),
            iban,
            ibanRaw,
            tipo: tipo ? tipo.name : '',
            doc,
        });
        console.log(`  → ${c.rol}: ${nombreCompleto} | IBAN: ${iban || '(vacío)'} | Doc: ${doc}`);
    }
}

// ============================================================================
// STEP 3: Fetch IBANs de Google Sheets
// ============================================================================

console.log('\n--- STEP 3: Obteniendo IBANs de Google Sheets ---');

let ibanPagadorSheet = null;
let ibanCobradorSheet = null;
let nombrePagadorSheet = null;
let nombreCobradorSheet = null;
let fetchErrors = [];

// 3a) IBAN + nombre cobrador desde "Transferencia Propietario"
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
        // Nombre cobrador (para fallback)
        const nombreColIndex = findColumnIndex(result.headers, HEADER_NOMBRE_COBRADOR);
        if (nombreColIndex !== -1) {
            nombreCobradorSheet = cleanCellValue(result.row[nombreColIndex]);
            console.log(`  ✓ Nombre cobrador del Sheet: ${nombreCobradorSheet}`);
        } else {
            console.log(`  - Columna nombre "${HEADER_NOMBRE_COBRADOR}" no encontrada en "${SHEET_COBRADOR}" (fallback nombre no disponible)`);
        }
    } else {
        console.log(`  ✗ "${HEADER_NUM_OPERACION}"="${idDeal}" no encontrado en "${SHEET_COBRADOR}"`);
    }
} catch (err) {
    const msg = `Error "${SHEET_COBRADOR}": ${err.message}`;
    console.error(`  ${msg}`);
    fetchErrors.push(msg);
}

// 3b) IBAN + nombre pagador desde "Altas SEPA"
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
        // Nombre pagador (para fallback)
        const nombreColIndex = findColumnIndex(result.headers, HEADER_NOMBRE_PAGADOR);
        if (nombreColIndex !== -1) {
            nombrePagadorSheet = cleanCellValue(result.row[nombreColIndex]);
            console.log(`  ✓ Nombre pagador del Sheet: ${nombrePagadorSheet}`);
        } else {
            console.log(`  - Columna nombre "${HEADER_NOMBRE_PAGADOR}" no encontrada en "${SHEET_PAGADOR}" (fallback nombre no disponible)`);
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
// STEP 4: Match contactos — IBAN → nombre → rol
// ============================================================================

console.log('\n--- STEP 4: Matching (IBAN → nombre → rol) ---');

let matchPagador = null;   // contacto que matchea como pagador
let matchCobrador = null;  // contacto que matchea como cobrador
let matchPagadorVia = '';   // cómo se hizo el match: 'iban', 'nombre', 'rol'
let matchCobradorVia = '';

/**
 * Intenta encontrar un contacto en 3 pasos:
 * 1. Match exacto por IBAN normalizado
 * 2. Match fuzzy por nombre completo (sin acentos, guiones, mayúsculas)
 * 3. Match por rol (si solo hay un contacto con ese rol)
 */
function findContact(contactos, iban, nombreSheet, rolEsperado) {
    // 1) IBAN exacto
    if (iban) {
        const match = contactos.find(c => c.iban && c.iban === iban);
        if (match) return { contact: match, via: 'iban' };
    }

    // 2) Nombre fuzzy
    if (nombreSheet) {
        const nombreNorm = normalizeName(nombreSheet);
        if (nombreNorm) {
            // Match exacto normalizado
            let match = contactos.find(c => c.nombreNorm && c.nombreNorm === nombreNorm);
            if (match) return { contact: match, via: 'nombre' };

            // Match parcial: el nombre del Sheet contiene al contacto o viceversa
            match = contactos.find(c => {
                if (!c.nombreNorm) return false;
                return nombreNorm.includes(c.nombreNorm) || c.nombreNorm.includes(nombreNorm);
            });
            if (match) return { contact: match, via: 'nombre-parcial' };
        }
    }

    // 3) Único contacto con el rol esperado
    if (rolEsperado) {
        const candidatos = contactos.filter(c => c.rol === rolEsperado);
        if (candidatos.length === 1) {
            return { contact: candidatos[0], via: 'rol' };
        }
    }

    return null;
}

// --- Buscar PAGADOR ---
if (ibanPagadorSheet || nombrePagadorSheet) {
    const result = findContact(contactos, ibanPagadorSheet, nombrePagadorSheet, 'inquilino');
    if (result) {
        matchPagador = result.contact;
        matchPagadorVia = result.via;
        console.log(`  ✓ PAGADOR match (${result.via}): ${matchPagador.nombreCompleto} (${matchPagador.rol}) — IBAN: ${matchPagador.iban || '(vacío)'}`);
    } else {
        console.log(`  ✗ PAGADOR: sin match`);
        console.log(`    IBAN buscado: ${ibanPagadorSheet || '(sin IBAN)'}`);
        console.log(`    Nombre buscado: ${nombrePagadorSheet || '(sin nombre)'}`);
        console.log(`    Contactos: ${contactos.map(c => `${c.rol}:${c.nombreCompleto}:${c.iban || 'sin-IBAN'}`).join(', ')}`);
    }
} else {
    console.log(`  - PAGADOR: sin datos del Sheet para buscar`);
}

// --- Buscar COBRADOR ---
if (ibanCobradorSheet || nombreCobradorSheet) {
    const result = findContact(contactos, ibanCobradorSheet, nombreCobradorSheet, 'propietario');
    if (result) {
        matchCobrador = result.contact;
        matchCobradorVia = result.via;
        console.log(`  ✓ COBRADOR match (${result.via}): ${matchCobrador.nombreCompleto} (${matchCobrador.rol}) — IBAN: ${matchCobrador.iban || '(vacío)'}`);
    } else {
        console.log(`  ✗ COBRADOR: sin match`);
        console.log(`    IBAN buscado: ${ibanCobradorSheet || '(sin IBAN)'}`);
        console.log(`    Nombre buscado: ${nombreCobradorSheet || '(sin nombre)'}`);
        console.log(`    Contactos: ${contactos.map(c => `${c.rol}:${c.nombreCompleto}:${c.iban || 'sin-IBAN'}`).join(', ')}`);
    }
} else {
    console.log(`  - COBRADOR: sin datos del Sheet para buscar`);
}

// ============================================================================
// STEP 4b: Rellenar IBAN en contacto si match fue por nombre/rol
// ============================================================================

console.log('\n--- STEP 4b: Actualizando IBAN en contactos (si match por nombre/rol) ---');

// Si matcheamos por nombre o rol, el contacto no tenía IBAN → escribirlo
if (matchPagador && matchPagadorVia !== 'iban' && ibanPagadorSheet && !matchPagador.iban) {
    await contactosTable.updateRecordAsync(matchPagador.id, {
        [FIELD_CONTACTO_CUENTA]: ibanPagadorSheet,
    });
    console.log(`  ✓ IBAN pagador actualizado en contacto ${matchPagador.nombreCompleto}: ${ibanPagadorSheet}`);
}

if (matchCobrador && matchCobradorVia !== 'iban' && ibanCobradorSheet && !matchCobrador.iban) {
    await contactosTable.updateRecordAsync(matchCobrador.id, {
        [FIELD_CONTACTO_CUENTA]: ibanCobradorSheet,
    });
    console.log(`  ✓ IBAN cobrador actualizado en contacto ${matchCobrador.nombreCompleto}: ${ibanCobradorSheet}`);
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
    auditLines.push(`Pagador: ${matchPagador.nombreCompleto} (${matchPagador.rol}, match: ${matchPagadorVia}, IBAN: ${matchPagador.iban || 'sin IBAN'})`);
    console.log(`  ✓ linkPagador → ${matchPagador.nombreCompleto} (${matchPagador.id})`);
} else if (ibanPagadorSheet || nombrePagadorSheet) {
    auditLines.push(`Pagador: IBAN ${ibanPagadorSheet || 'N/A'} / nombre "${nombrePagadorSheet || 'N/A'}" del Sheet no coincide con ningún contacto`);
    console.log(`  ✗ linkPagador no actualizado — sin match`);
} else {
    auditLines.push(`Pagador: id_deal no encontrado en hoja "${SHEET_PAGADOR}"`);
    console.log(`  ✗ linkPagador no actualizado — sin dato en Sheet`);
}

// Vincular cobrador (record link)
if (matchCobrador) {
    updateFields[FIELD_LINK_COBRADOR] = [{ id: matchCobrador.id }];
    auditLines.push(`Cobrador: ${matchCobrador.nombreCompleto} (${matchCobrador.rol}, match: ${matchCobradorVia}, IBAN: ${matchCobrador.iban || 'sin IBAN'})`);
    console.log(`  ✓ linkCobrador → ${matchCobrador.nombreCompleto} (${matchCobrador.id})`);
} else if (ibanCobradorSheet || nombreCobradorSheet) {
    auditLines.push(`Cobrador: IBAN ${ibanCobradorSheet || 'N/A'} / nombre "${nombreCobradorSheet || 'N/A'}" del Sheet no coincide con ningún contacto`);
    console.log(`  ✗ linkCobrador no actualizado — sin match`);
} else {
    auditLines.push(`Cobrador: id_deal no encontrado en hoja "${SHEET_COBRADOR}"`);
    console.log(`  ✗ linkCobrador no actualizado — sin dato en Sheet`);
}

// Estado final
let estadoFinal;
if (matchPagador && matchCobrador) {
    estadoFinal = 'Encontrado';
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
