// ============================================================================
// AIRTABLE AUTOMATION SCRIPT: Búsqueda Pagador/Cobrador desde Google Sheets
// ============================================================================
//
// BASE: Advancing (appuV5kGKzKdXlhoR)
//   → Los datos encontrados se sincronizan automáticamente a Bancos
//
// TRIGGER: "When record matches conditions" en tabla deals (Advancing)
//   - Condiciones: busquedaBancos = "Pendiente"
//
// INPUT VARIABLES (configurar en la automatización):
//   - dealRecordId: Record ID del registro de deal (del trigger)
//
// PREREQUISITOS EN AIRTABLE (crear manualmente antes de usar):
//   1. Campo "busquedaBancos" (single select) en tabla deals de Advancing
//      Opciones: "Pendiente" / "Encontrado" / "No encontrado" / "Parcial" / "Error"
//   2. Campo "avisoBusquedaBancos" (long text) en tabla deals de Advancing
//
// PREREQUISITOS GOOGLE SHEETS:
//   1. Crear Google API Key restringida a Sheets API (ver busquedaPagadorCobrador.md)
//   2. Poner el spreadsheet como "Anyone with the link can view"
//   3. Configurar SPREADSHEET_ID y GOOGLE_API_KEY abajo
//
// FUNCIONAMIENTO:
//   1. Lee el deal en Advancing y obtiene su id_deal
//   2. Fetch a Google Sheets para obtener los datos:
//      - Hoja "Transferencia Propietario" → datos del cobrador (propietario)
//      - Hoja "CF Cobros" → datos del pagador (inquilino)
//   3. Busca la fila con el id_deal correspondiente
//   4. Normaliza los IBANs (sin espacios, guiones, todo mayúsculas)
//   5. Escribe los datos en los campos linkPagador* / linkCobrador* del deal
//   6. Actualiza busquedaBancos → "Encontrado" / "No encontrado" / "Parcial" / "Error"
//   7. Escribe línea de auditoría acumulativa en avisoBusquedaBancos
//
// HOJAS DEL GOOGLE SHEET:
//   - "Transferencia Propietario": datos del cobrador (propietario que recibe pago)
//     Columnas esperadas: id_deal | nombre | IBAN | documento | BIC
//   - "CF Cobros": datos del pagador (inquilino que paga)
//     Columnas esperadas: id_deal | nombre | IBAN | documento
//
// NOTA: Este script corre en Advancing. Los field IDs deben ser los de Advancing,
//   NO los de Bancos. Los IDs actuales son los de Bancos (del schema disponible)
//   y pueden necesitar ajuste. Verificar en Advancing > API docs > deals.
//
// ============================================================================

const config = input.config();
const dealRecordId = config.dealRecordId;

// --- Referencias a tablas (Advancing) ---
// TODO: Verificar que este table ID es correcto en Advancing.
//       Si la tabla deals en Advancing tiene un ID distinto, actualizarlo.
//       El ID actual viene del schema de Bancos donde la tabla se llama "deals".
const dealsTable = base.getTable('tblWnB9SCfCFoXzfW');

// --- Field IDs ---
// IMPORTANTE: Estos field IDs vienen del schema de Bancos. Si los campos en
// Advancing tienen IDs distintos (por ser tablas independientes, no synced),
// hay que sustituirlos por los IDs reales de Advancing.
// Para obtenerlos: Advancing > Help > API documentation > deals table.

// Deal — identificación
const FIELD_DEAL_INDEX = 'fldJ77NBAlUHSyFmY';                  // indexDeal
const FIELD_DEAL_ID_DEAL = 'fldVa3bfj7ej1vb1J';                // id_deal
const FIELD_BUSQUEDA_BANCOS = 'busquedaBancos';                 // CREAR: single select
const FIELD_AVISO_BUSQUEDA = 'avisoBusquedaBancos';             // CREAR: long text

// Deal — campos pagador (a rellenar desde Google Sheets)
const FIELD_DEAL_PAGADOR_NOMBRE = 'fldjbfiwcIyiDhQf6';         // pagadorNombre
const FIELD_DEAL_PAGADOR_NOMBRE_COMPLETO = 'fldMh3Lozbh20yv0l'; // pagadorNombreCompleto
const FIELD_DEAL_PAGADOR_IBAN = 'flda2pglffZTzlTTS';           // pagadorIBAN
const FIELD_DEAL_PAGADOR_DOC = 'fldDwt4Jb5Szp4D5S';            // linkPagadorNumeroDocumento
const FIELD_DEAL_PAGADOR_CUENTA = 'fldjAksJk2dDWN7Td';         // linkPagadorNumeroCuenta
const FIELD_DEAL_PAGADOR_NOMBRE_COMP2 = 'fldeg2ZjqDixv9G1i';   // linkPagadorNombreCompleto

// Deal — campos cobrador (a rellenar desde Google Sheets)
const FIELD_DEAL_COBRADOR = 'fldXkD5aA9ho0WHqi';               // linkCobrador
const FIELD_DEAL_COBRADOR_NOMBRE = 'fld5xxivn9SoV3Mqc';        // linkCobradorNombreCompleto
const FIELD_DEAL_COBRADOR_DOC = 'fldlbnM7EAfB51K9e';           // linkCobradorNumeroDocumento
const FIELD_DEAL_COBRADOR_CUENTA = 'fldWoxur4wvXNMVl7';        // linkCobradorNumeroDeCuenta
const FIELD_DEAL_COBRADOR_BIC = 'fld73WKraSn9Qd9gb';           // linkCobradorSwiftBIC

// ============================================================================
// CONFIGURACIÓN GOOGLE SHEETS
// ============================================================================

// Spreadsheet ID: se saca de la URL del Google Sheet
// Ejemplo: https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';               // TODO: Configurar

// Google API Key restringida a Sheets API (ver docs para crearla)
const GOOGLE_API_KEY = 'TU_GOOGLE_API_KEY_AQUI';               // TODO: Configurar

// Nombres de hojas (exactos, incluyendo mayúsculas/tildes)
const SHEET_COBRADOR = 'Transferencia Propietario';             // Datos del cobrador
const SHEET_PAGADOR = 'CF Cobros';                              // Datos del pagador

// --- Índices de columnas en cada hoja (0-based) ---
// TODO: Ajustar según las columnas reales de tu Google Sheet.
//       Abre la hoja y cuenta: A=0, B=1, C=2, etc.

// Hoja "Transferencia Propietario" (cobrador)
const COL_COBRADOR_ID_DEAL = 0;     // Columna A: id_deal
const COL_COBRADOR_NOMBRE = 1;      // Columna B: nombre completo
const COL_COBRADOR_IBAN = 2;        // Columna C: IBAN
const COL_COBRADOR_DOC = 3;         // Columna D: número documento (DNI/NIE/CIF)
const COL_COBRADOR_BIC = 4;         // Columna E: BIC/SWIFT

// Hoja "CF Cobros" (pagador)
const COL_PAGADOR_ID_DEAL = 0;      // Columna A: id_deal
const COL_PAGADOR_NOMBRE = 1;       // Columna B: nombre completo
const COL_PAGADOR_IBAN = 2;         // Columna C: IBAN
const COL_PAGADOR_DOC = 3;          // Columna D: número documento (DNI/NIE/CIF)

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
 * Normaliza un IBAN: elimina espacios, guiones, puntos y pasa a mayúsculas.
 */
function normalizeIBAN(iban) {
    if (!iban) return '';
    return iban.replace(/[\s\-\.]/g, '').toUpperCase().trim();
}

/**
 * Valida formato básico de IBAN (2 letras país + 2 dígitos control + cuerpo).
 */
function isValidIBAN(iban) {
    if (!iban) return false;
    const n = normalizeIBAN(iban);
    if (/^ES\d{22}$/.test(n)) return true;                     // España
    if (/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(n)) return true;  // Genérico
    return false;
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
// El spreadsheet debe estar como "Anyone with the link can view".
// Para producción con datos sensibles, considerar migrar a un proxy
// (Cloud Function / Make webhook) que use Service Account.
// ============================================================================

/**
 * Obtiene todas las filas de una hoja del Google Sheet.
 * Devuelve un array de arrays (filas × columnas).
 */
async function fetchSheetData(sheetName) {
    const range = encodeURIComponent(`${sheetName}!A:Z`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;

    console.log(`Fetching hoja "${sheetName}"...`);

    let response;
    try {
        response = await remoteFetchAsync(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });
    } catch (err) {
        throw new Error(`Error de red al conectar con Google Sheets: ${err.message}`);
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
 * Busca la primera fila cuyo id_deal coincida (case-insensitive, trimmed).
 * Salta la fila 0 (cabecera).
 */
function findRowByIdDeal(rows, idDeal, idDealColIndex) {
    if (!rows || rows.length < 2) return null;

    const target = String(idDeal).trim().toLowerCase();

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length <= idDealColIndex) continue;

        const cell = cleanCellValue(row[idDealColIndex]).toLowerCase();
        if (cell === target) {
            return row;
        }
    }
    return null;
}

// ============================================================================
// STEP 1: Leer el deal en Advancing y validar
// ============================================================================

console.log(`\n========================================`);
console.log(`BÚSQUEDA PAGADOR/COBRADOR`);
console.log(`Base: Advancing`);
console.log(`========================================`);
console.log(`Procesando deal: ${dealRecordId}`);

const dealRecord = await dealsTable.selectRecordAsync(dealRecordId, {
    fields: [
        FIELD_DEAL_INDEX,
        FIELD_DEAL_ID_DEAL,
        FIELD_BUSQUEDA_BANCOS,
        FIELD_AVISO_BUSQUEDA,
        FIELD_DEAL_PAGADOR_NOMBRE,
        FIELD_DEAL_PAGADOR_NOMBRE_COMPLETO,
        FIELD_DEAL_PAGADOR_IBAN,
        FIELD_DEAL_PAGADOR_DOC,
        FIELD_DEAL_PAGADOR_CUENTA,
        FIELD_DEAL_PAGADOR_NOMBRE_COMP2,
        FIELD_DEAL_COBRADOR,
        FIELD_DEAL_COBRADOR_NOMBRE,
        FIELD_DEAL_COBRADOR_DOC,
        FIELD_DEAL_COBRADOR_CUENTA,
        FIELD_DEAL_COBRADOR_BIC,
    ]
});

if (!dealRecord) {
    console.error(`Deal ${dealRecordId} no encontrado en Advancing`);
    throw new Error('Registro de deal no encontrado');
}

const idDeal = dealRecord.getCellValue(FIELD_DEAL_ID_DEAL);
const indexDeal = dealRecord.getCellValue(FIELD_DEAL_INDEX);
const busqueda = dealRecord.getCellValue(FIELD_BUSQUEDA_BANCOS);
const avisoExistente = dealRecord.getCellValue(FIELD_AVISO_BUSQUEDA) || '';

console.log(`Deal: ${indexDeal || dealRecordId}`);
console.log(`id_deal: ${idDeal}`);
console.log(`busquedaBancos: ${busqueda ? busqueda.name : '(vacío)'}`);

// --- Validaciones ---
if (!busqueda || busqueda.name !== 'Pendiente') {
    console.log('busquedaBancos no es "Pendiente". Abortando.');
    return;
}

if (!idDeal) {
    const msg = 'El deal no tiene id_deal. No se puede buscar en Google Sheets.';
    console.error(msg);
    await dealsTable.updateRecordAsync(dealRecordId, {
        [FIELD_BUSQUEDA_BANCOS]: { name: 'Error' },
        [FIELD_AVISO_BUSQUEDA]: avisoExistente
            ? avisoExistente + '\n' + `[${formatTimestamp()}] ERROR: ${msg}`
            : `[${formatTimestamp()}] ERROR: ${msg}`,
    });
    return;
}

// ============================================================================
// STEP 2: Fetch datos de Google Sheets
// ============================================================================

console.log('\n--- STEP 2: Obteniendo datos de Google Sheets ---');

let cobradorRow = null;
let pagadorRow = null;
let fetchErrors = [];

// 2a) Buscar cobrador en "Transferencia Propietario"
try {
    const sheetData = await fetchSheetData(SHEET_COBRADOR);
    cobradorRow = findRowByIdDeal(sheetData, idDeal, COL_COBRADOR_ID_DEAL);
    console.log(cobradorRow
        ? `  ✓ Cobrador encontrado en "${SHEET_COBRADOR}"`
        : `  ✗ Cobrador NO encontrado para id_deal="${idDeal}"`);
} catch (err) {
    const msg = `Error leyendo "${SHEET_COBRADOR}": ${err.message}`;
    console.error(`  ${msg}`);
    fetchErrors.push(msg);
}

// 2b) Buscar pagador en "CF Cobros"
try {
    const sheetData = await fetchSheetData(SHEET_PAGADOR);
    pagadorRow = findRowByIdDeal(sheetData, idDeal, COL_PAGADOR_ID_DEAL);
    console.log(pagadorRow
        ? `  ✓ Pagador encontrado en "${SHEET_PAGADOR}"`
        : `  ✗ Pagador NO encontrado para id_deal="${idDeal}"`);
} catch (err) {
    const msg = `Error leyendo "${SHEET_PAGADOR}": ${err.message}`;
    console.error(`  ${msg}`);
    fetchErrors.push(msg);
}

// Si fallaron AMBAS hojas → Error
if (fetchErrors.length === 2) {
    const msg = `Error en ambas hojas:\n${fetchErrors.join('\n')}`;
    console.error(msg);
    await dealsTable.updateRecordAsync(dealRecordId, {
        [FIELD_BUSQUEDA_BANCOS]: { name: 'Error' },
        [FIELD_AVISO_BUSQUEDA]: avisoExistente
            ? avisoExistente + '\n' + `[${formatTimestamp()}] ERROR: ${msg}`
            : `[${formatTimestamp()}] ERROR: ${msg}`,
    });
    return;
}

// ============================================================================
// STEP 3: Extraer y normalizar datos
// ============================================================================

console.log('\n--- STEP 3: Extrayendo y normalizando datos ---');

let pagadorData = null;
let cobradorData = null;

// Extraer datos del pagador
if (pagadorRow) {
    const nombre = cleanCellValue(pagadorRow[COL_PAGADOR_NOMBRE]);
    const ibanRaw = cleanCellValue(pagadorRow[COL_PAGADOR_IBAN]);
    const iban = normalizeIBAN(ibanRaw);
    const doc = cleanCellValue(pagadorRow[COL_PAGADOR_DOC]);

    if (iban) {
        pagadorData = { nombre, iban, ibanRaw, doc };
        console.log(`  Pagador: ${nombre} | IBAN: ${iban} | Doc: ${doc}`);
        if (!isValidIBAN(iban)) {
            console.log(`  ⚠ IBAN pagador formato inválido: "${ibanRaw}" → "${iban}"`);
        }
    } else {
        console.log(`  ⚠ Fila pagador encontrada pero sin IBAN`);
    }
}

// Extraer datos del cobrador
if (cobradorRow) {
    const nombre = cleanCellValue(cobradorRow[COL_COBRADOR_NOMBRE]);
    const ibanRaw = cleanCellValue(cobradorRow[COL_COBRADOR_IBAN]);
    const iban = normalizeIBAN(ibanRaw);
    const doc = cleanCellValue(cobradorRow[COL_COBRADOR_DOC]);
    const bic = cleanCellValue(cobradorRow[COL_COBRADOR_BIC]);

    if (iban) {
        cobradorData = { nombre, iban, ibanRaw, doc, bic };
        console.log(`  Cobrador: ${nombre} | IBAN: ${iban} | Doc: ${doc} | BIC: ${bic}`);
        if (!isValidIBAN(iban)) {
            console.log(`  ⚠ IBAN cobrador formato inválido: "${ibanRaw}" → "${iban}"`);
        }
    } else {
        console.log(`  ⚠ Fila cobrador encontrada pero sin IBAN`);
    }
}

// ============================================================================
// STEP 4: Actualizar campos del deal en Advancing
// ============================================================================

console.log('\n--- STEP 4: Actualizando deal en Advancing ---');

const updateFields = {};
const auditLines = [];

// Campos del pagador
if (pagadorData) {
    updateFields[FIELD_DEAL_PAGADOR_NOMBRE] = pagadorData.nombre || null;
    updateFields[FIELD_DEAL_PAGADOR_NOMBRE_COMPLETO] = pagadorData.nombre || null;
    updateFields[FIELD_DEAL_PAGADOR_IBAN] = pagadorData.iban || null;
    updateFields[FIELD_DEAL_PAGADOR_DOC] = pagadorData.doc || null;
    updateFields[FIELD_DEAL_PAGADOR_CUENTA] = pagadorData.iban || null;
    updateFields[FIELD_DEAL_PAGADOR_NOMBRE_COMP2] = pagadorData.nombre || null;

    auditLines.push(`Pagador: ${pagadorData.nombre} (IBAN: ${pagadorData.iban}, Doc: ${pagadorData.doc})`);
    console.log(`  ✓ Campos pagador actualizados`);
} else {
    auditLines.push(`Pagador: NO encontrado en hoja "${SHEET_PAGADOR}"`);
    console.log(`  ✗ Sin datos de pagador`);
}

// Campos del cobrador
if (cobradorData) {
    updateFields[FIELD_DEAL_COBRADOR] = cobradorData.nombre || null;
    updateFields[FIELD_DEAL_COBRADOR_NOMBRE] = cobradorData.nombre || null;
    updateFields[FIELD_DEAL_COBRADOR_DOC] = cobradorData.doc || null;
    updateFields[FIELD_DEAL_COBRADOR_CUENTA] = cobradorData.iban || null;
    updateFields[FIELD_DEAL_COBRADOR_BIC] = cobradorData.bic || null;

    auditLines.push(`Cobrador: ${cobradorData.nombre} (IBAN: ${cobradorData.iban}, Doc: ${cobradorData.doc}, BIC: ${cobradorData.bic || 'N/A'})`);
    console.log(`  ✓ Campos cobrador actualizados`);
} else {
    auditLines.push(`Cobrador: NO encontrado en hoja "${SHEET_COBRADOR}"`);
    console.log(`  ✗ Sin datos de cobrador`);
}

// Estado final
let estadoFinal;
if (pagadorData && cobradorData) {
    estadoFinal = 'Encontrado';
} else if (pagadorData || cobradorData) {
    estadoFinal = 'Parcial';
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

await dealsTable.updateRecordAsync(dealRecordId, updateFields);

console.log(`\n========================================`);
console.log(`RESULTADO: ${estadoFinal}`);
console.log(`========================================`);
console.log(auditMsg);
