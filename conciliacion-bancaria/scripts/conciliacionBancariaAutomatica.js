// ============================================================================
// AIRTABLE AUTOMATION SCRIPT: Conciliación Bancaria Automática (Caixa)
// ============================================================================
//
// TRIGGER: "When record matches conditions" en tabla balance
//   - Condiciones: etiquetaConciliacion is not empty
//
// INPUT VARIABLES (configurar en la automatización):
//   - balanceRecordId: Record ID del registro de balance (del trigger)
//
// PREREQUISITOS EN AIRTABLE (crear manualmente antes de usar):
//   1. Campo "etiquetaConciliacion" (single select) en tabla balance
//      Opciones sugeridas: "Pendiente SEPA" / "Procesado" / "Error"
//   2. Campo "avisoConciliacion" (long text) en tabla balance
//   3. Campo "sepaXML" (long text) en tabla balance — para el XML generado
//
// FUNCIONAMIENTO:
//   1. Lee el balance y su deal vinculado para obtener datos de pagador/cobrador
//   2. CREA/BUSCA registros de pagador y cobrador en el GESTOR BANCARIO
//      (tabla bankAccounts) con los datos del Excel/deal, y los vincula al balance
//      como linkBankAccountCashIn (pagador) y linkBankAccountCashOut (cobrador)
//   3. Filtra cashflows In pendientes con sistema Caixa
//   4. Genera el fichero SEPA Direct Debit XML (pain.008.001.02) para CaixaBank
//   5. Crea registro en tabla remesas y vincula los cashflows
//   6. Marca los cashflows como importados (método → SEPA)
//   7. Escribe línea de auditoría en avisoConciliacion (acumulativo)
//
// DATOS DEL EXCEL → GESTOR BANCARIO:
//   Los datos del pagador y cobrador se leen de la tabla deals donde están
//   sincronizados desde el Excel de control. El script:
//     1. Lee: pagadorNombre, pagadorIBAN, linkPagadorNumeroDocumento, etc.
//     2. Busca en bankAccounts si ya existe un registro con ese IBAN
//     3. Si no existe, CREA el registro en bankAccounts (gestor)
//     4. Vincula el bankAccount al balance (linkBankAccountCashIn / CashOut)
//   Campos del gestor bancario (bankAccounts):
//     - holderName (nombre del titular)
//     - recipientIBANAccount (IBAN del cliente)
//     - holderAccountID (número de documento)
//     - accountIDType (DNI/CIF/NIE)
//     - tipo (Pagador / Perceptor)
//     - linkDealBalance (vínculo al balance)
//
// MAPEO DE NOMBRES ENTRE TABLAS (sistemaPago):
//   - balance:  Unnax | Caixa | Manual
//   - rentas:   Unnax | La Caixa | Caixa
//   - cashflow: Unnax | Caixa | DAS
// ============================================================================

const config = input.config();
const balanceRecordId = config.balanceRecordId;

// --- Referencias a tablas ---
const balanceTable = base.getTable('tblYNdOLuMvpBavEu');
const dealsTable = base.getTable('tblWnB9SCfCFoXzfW');
const rentasTable = base.getTable('tbl2izIaOR37sRHGg');
const cashflowTable = base.getTable('tblxY6upsLDmqzaaL');
const remesasTable = base.getTable('tbl4wzfXvZICfxqc0');
const mandatosCaixaTable = base.getTable('tbl3PChHmHfWSzZVs');
const bankAccountsTable = base.getTable('tblN8MtBDlLSQyu9o');

// --- Field IDs ---
// Balance
const FIELD_ETIQUETA_CONCILIACION = 'etiquetaConciliacion';     // CREAR: single select
const FIELD_AVISO_CONCILIACION = 'avisoConciliacion';           // CREAR: long text
const FIELD_SEPA_XML = 'sepaXML';                               // CREAR: long text
const FIELD_LINK_DEAL = 'fldOnUYgysh29VHMe';                   // linkDeal
const FIELD_LINK_MESES = 'fldFlp2wDVWljyTtC';                  // linkMeses (rentas vinculadas)
const FIELD_BALANCE_SISTEMA_PAGO = 'fldSVisYm1biJH5jz';        // sistemaPago (balance)
const FIELD_BALANCE_IMPORTE = 'fldtJw4GfIzEtc7h2';             // importe
const FIELD_BALANCE_DEFAULT_TYPE_CASH_IN = 'fldy90BjhT4JiQmI2'; // defaultTypeCashIn (SEPA/Transferencia)
const FIELD_BALANCE_LINK_BANK_ACCOUNT = 'fldZw3yDK5LKFqaAx';   // linkBankAccount (general)
const FIELD_BALANCE_LINK_BANK_CASH_IN = 'fldEwSNtJlZRHKuRk';   // linkBankAccountCashIn
const FIELD_BALANCE_LINK_BANK_CASH_OUT = 'fldI4VmjA6mFbco12';  // linkBankAccountCashOut
const FIELD_BALANCE_LINK_CASHFLOW = 'fldVtegaBGTfKnJVO';       // linkCashflow
const FIELD_BALANCE_MANDATOS_CAIXA = 'fldiZEWwafITebXmH';      // mandatosCaixa
const FIELD_BALANCE_STATUS = 'fldzl5KA8qD5L5ILr';              // status

// BankAccounts (Gestor Bancario)
const FIELD_BA_HOLDER_NAME = 'fldpT0lijU9t7WHtU';              // holderName
const FIELD_BA_HOLDER_ACCOUNT_ID = 'fldcym0YEJPXKcktx';        // holderAccountID (NIF/CIF)
const FIELD_BA_RECIPIENT_IBAN = 'fldxArd414nF6BtbR';           // recipientIBANAccount (IBAN cliente)
const FIELD_BA_RECIPIENT_BIC = 'fldMJc2U6ASSLtSGl';            // recipientBIC
const FIELD_BA_RECIPIENT_DIRECT_BIC = 'fldqFHMc49BD59198';     // recipientDirectBIC
const FIELD_BA_RECIPIENT_BANK_CODE = 'fld627dcxvnCW7TuW';      // recipientBankCode
const FIELD_BA_TIPO = 'fldo56EdsafbyzWA6';                     // tipo (Pagador/Perceptor)
const FIELD_BA_ACCOUNT_ID_TYPE = 'fldrQCW1mEowU8fTm';          // accountIDType (DNI/CIF/NIE/Otros)
const FIELD_BA_LINK_DEAL_BALANCE = 'fld3xgc019HCaYJZP';        // linkDealBalance
const FIELD_BA_LINK_DEAL_BALANCE_CASH_INS = 'fld5aGOXNNTD8oEyH'; // linkDealBalanceCashIns
const FIELD_BA_LINK_DEAL_BALANCE_CASH_OUTS = 'fldLckfyVd2mmEECQ'; // linkDealBalanceCashOuts
const FIELD_BA_MANDATOS_CAIXA = 'fldEQMnRI4QOU2fcC';           // mandatosCaixa

// Deals
const FIELD_DEAL_PAGADOR_NOMBRE = 'fldjbfiwcIyiDhQf6';         // pagadorNombre
const FIELD_DEAL_PAGADOR_NOMBRE_COMPLETO = 'fldMh3Lozbh20yv0l'; // pagadorNombreCompleto
const FIELD_DEAL_PAGADOR_IBAN = 'flda2pglffZTzlTTS';           // pagadorIBAN
const FIELD_DEAL_PAGADOR_DOC = 'fldDwt4Jb5Szp4D5S';            // linkPagadorNumeroDocumento
const FIELD_DEAL_PAGADOR_CUENTA = 'fldjAksJk2dDWN7Td';         // linkPagadorNumeroCuenta
const FIELD_DEAL_PAGADOR_NOMBRE_COMP2 = 'fldeg2ZjqDixv9G1i';   // linkPagadorNombreCompleto
const FIELD_DEAL_COBRADOR = 'fldXkD5aA9ho0WHqi';               // linkCobrador
const FIELD_DEAL_COBRADOR_NOMBRE = 'fld5xxivn9SoV3Mqc';        // linkCobradorNombreCompleto
const FIELD_DEAL_COBRADOR_DOC = 'fldlbnM7EAfB51K9e';           // linkCobradorNumeroDocumento
const FIELD_DEAL_COBRADOR_CUENTA = 'fldWoxur4wvXNMVl7';        // linkCobradorNumeroDeCuenta
const FIELD_DEAL_COBRADOR_BIC = 'fld73WKraSn9Qd9gb';           // linkCobradorSwiftBIC
const FIELD_DEAL_FECHA_FIRMA_SEPA = 'fldoNJ6HzEIYCdqlf';       // fechaFirmaSEPA
const FIELD_DEAL_DIRECCION_INMUEBLE = 'fldU8QxRJP0kqZVrk';     // direccion inmueble
const FIELD_DEAL_INDEX = 'fldJ77NBAlUHSyFmY';                  // indexDeal
const FIELD_DEAL_VER_GESTOR = 'fldB28nEBwqpv3pCw';             // verGestor

// Rentas
const FIELD_RENTA_FECHA = 'fldSdtfW7UfIw8z4V';                 // fecha
const FIELD_RENTA_TIPO = 'fldTWeJAYDxWOZWPJ';                  // tipo
const FIELD_RENTA_IMPORTE = 'fld2DbSB516n1bU8f';               // importe
const FIELD_RENTA_SISTEMA_PAGO = 'fldKBseprTEyZysG8';           // sistemaPago (rentas)
const FIELD_RENTA_CASHFLOWS = 'fld7ERQvv5apIJcyX';             // linkCashflows
const FIELD_RENTA_METODO_PAGO = 'fldYh87G1bwaf2lxl';           // metodoPago

// Cashflows
const FIELD_CF_DIRECCION = 'fld656RBx2XkCHzR7';                // direccion (In/Out)
const FIELD_CF_FECHA_PROG = 'fldrquziQqJoTn08B';               // fechaProgramada
const FIELD_CF_IMPORTE = 'fldbkCQZwDR8a9kRP';                  // importe
const FIELD_CF_STATUS_INS = 'fldFyfq8PaqbCRgeN';               // statusIns
const FIELD_CF_STATUS_OUT = 'fldIMh0gNEA3TuaiG';               // statusOut
const FIELD_CF_SISTEMA_PAGO = 'fldjNItVaCzrhlNhf';             // sistemaPago (cashflow)
const FIELD_CF_METODO_PAGO = 'fldn69DhRftezHhcZ';              // metodoPago
const FIELD_CF_LINK_REMESA = 'fldTbaecb3VfmQR3d';              // linkRemesa
const FIELD_CF_LINK_DEAL_BALANCE = 'fldyCWFzrTMhWs7FT';        // linkDealBalance
const FIELD_CF_LINK_RENTA = 'fldsTJCCfItHDoCgS';               // linkRenta
const FIELD_CF_SUJETO = 'fldazRk0SXXdqQo9L';                   // sujeto
const FIELD_CF_RAZON = 'fld17mZxxLYPQfUzr';                    // razon
const FIELD_CF_FECHA_PAGO = 'fld5eJ1zqTiT5DD1n';               // fechaPago (fecha realización)
const FIELD_CF_LINK_TX_CAIXA = 'fldz6bEbVOE6rc6zQ';            // linkTransactionsCaixa

// Remesas
const FIELD_REMESA_FECHA_INICIO = 'fld1jTryAGMTzCcM5';         // fechaInicio
const FIELD_REMESA_LINK_CASHFLOWS = 'fldHjP7a35Fcsp3zb';       // linkCashflows

// MandatosCaixa
const FIELD_MANDATO_REFERENCIA = 'fldaSk5aP3IHfr9Xa';          // referencia
const FIELD_MANDATO_FECHA_FIRMA = 'fldGmg1JtBLX3wReX';         // fechaFirma
const FIELD_MANDATO_LINK_BANK = 'fldvjcpXPUXS28WWe';           // linkBankAccounts
const FIELD_MANDATO_LINK_BALANCE = 'fldenH3Zj8NrpE0VY';        // linkBalance

// --- Constantes SEPA CaixaBank ---
const SEPA_CREDITOR_NAME = 'ADVANCING REAL ESTATE SL';
const SEPA_CREDITOR_ID = 'ES00000ADVANCINGRE';  // Identificador de acreedor SEPA — CONFIGURAR
const SEPA_CREDITOR_IBAN = 'ES0000000000000000000000'; // IBAN de Advancing en CaixaBank — CONFIGURAR
const SEPA_CREDITOR_BIC = 'CAIXESBBXXX';        // BIC CaixaBank
const SEPA_SCHEME = 'CORE';                      // Esquema SEPA (CORE para particulares)

// ============================================================================
// UTILIDADES
// ============================================================================

function normalizeSistema(name) {
    if (!name) return null;
    const lower = name.toLowerCase().trim();
    if (lower === 'caixa' || lower === 'la caixa') return 'caixa';
    if (lower === 'unnax') return 'unnax';
    if (lower === 'manual') return 'manual';
    if (lower === 'das') return 'das';
    return lower;
}

function formatDate(d) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function formatDateISO(d) {
    return d.toISOString().slice(0, 10);
}

function formatTimestamp() {
    const ahora = new Date();
    const dd = String(ahora.getDate()).padStart(2, '0');
    const mm = String(ahora.getMonth() + 1).padStart(2, '0');
    const yyyy = ahora.getFullYear();
    const hh = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

// Genera un Message ID único para SEPA (máx 35 caracteres)
function generateMsgId() {
    const now = new Date();
    const ts = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `ADV-${ts}-${rand}`;
}

// Escapa caracteres XML
function xmlEscape(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Formatea importe para SEPA (2 decimales, punto como separador)
function formatAmount(amount) {
    return Math.abs(amount).toFixed(2);
}

// ============================================================================
// STEP 1: Leer el registro de balance y validar
// ============================================================================

console.log(`Procesando balance: ${balanceRecordId}`);

const balanceRecord = await balanceTable.selectRecordAsync(balanceRecordId, {
    fields: [
        FIELD_ETIQUETA_CONCILIACION,
        FIELD_AVISO_CONCILIACION,
        FIELD_LINK_DEAL,
        FIELD_LINK_MESES,
        FIELD_BALANCE_SISTEMA_PAGO,
        FIELD_BALANCE_IMPORTE,
        FIELD_BALANCE_DEFAULT_TYPE_CASH_IN,
        FIELD_BALANCE_LINK_BANK_ACCOUNT,
        FIELD_BALANCE_LINK_BANK_CASH_IN,
        FIELD_BALANCE_LINK_BANK_CASH_OUT,
        FIELD_BALANCE_LINK_CASHFLOW,
        FIELD_BALANCE_MANDATOS_CAIXA,
        FIELD_BALANCE_STATUS,
    ]
});

if (!balanceRecord) {
    console.error(`Registro de balance ${balanceRecordId} no encontrado`);
    throw new Error('Registro de balance no encontrado');
}

const etiqueta = balanceRecord.getCellValue(FIELD_ETIQUETA_CONCILIACION);
const avisoExistente = balanceRecord.getCellValue(FIELD_AVISO_CONCILIACION) || '';
const linkedDeal = balanceRecord.getCellValue(FIELD_LINK_DEAL);
const linkedRentas = balanceRecord.getCellValue(FIELD_LINK_MESES) || [];
const sistemaPago = balanceRecord.getCellValue(FIELD_BALANCE_SISTEMA_PAGO);
const importeBalance = balanceRecord.getCellValue(FIELD_BALANCE_IMPORTE);
const linkedCashflows = balanceRecord.getCellValue(FIELD_BALANCE_LINK_CASHFLOW) || [];
const mandatosCaixa = balanceRecord.getCellValue(FIELD_BALANCE_MANDATOS_CAIXA) || [];

// --- Validaciones ---
if (!etiqueta) {
    console.log('etiquetaConciliacion vacía. Abortando.');
    return;
}

console.log(`Etiqueta: ${etiqueta.name}`);
console.log(`Sistema de pago del balance: ${sistemaPago ? sistemaPago.name : '(vacío)'}`);

// Verificar que el sistema de pago es Caixa
const sistemaNorm = normalizeSistema(sistemaPago ? sistemaPago.name : null);
if (sistemaNorm !== 'caixa') {
    const msg = `Sistema de pago "${sistemaPago ? sistemaPago.name : '(vacío)'}" no es Caixa. Este script solo procesa Caixa.`;
    console.log(msg);
    await balanceTable.updateRecordAsync(balanceRecordId, {
        [FIELD_ETIQUETA_CONCILIACION]: { name: 'Error' },
        [FIELD_AVISO_CONCILIACION]: avisoExistente
            ? avisoExistente + '\n' + `[${formatTimestamp()}] ERROR: ${msg}`
            : `[${formatTimestamp()}] ERROR: ${msg}`,
    });
    return;
}

if (!linkedDeal || linkedDeal.length === 0) {
    console.error('No hay deal vinculado a este balance.');
    throw new Error('No hay deal vinculado');
}

// ============================================================================
// STEP 2: Leer datos del deal (pagador/cobrador del Excel)
// ============================================================================

console.log('--- STEP 2: Leyendo datos del deal (pagador/cobrador) ---');

const dealId = linkedDeal[0].id;
const dealRecord = await dealsTable.selectRecordAsync(dealId, {
    fields: [
        FIELD_DEAL_INDEX,
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
        FIELD_DEAL_FECHA_FIRMA_SEPA,
        FIELD_DEAL_DIRECCION_INMUEBLE,
    ]
});

if (!dealRecord) {
    throw new Error(`Deal ${dealId} no encontrado`);
}

// Extraer datos del pagador (deudor en SEPA = el inquilino que paga)
const pagadorNombre = dealRecord.getCellValue(FIELD_DEAL_PAGADOR_NOMBRE) || '';
const pagadorNombreCompleto = dealRecord.getCellValue(FIELD_DEAL_PAGADOR_NOMBRE_COMPLETO)
    || dealRecord.getCellValue(FIELD_DEAL_PAGADOR_NOMBRE_COMP2)
    || pagadorNombre;
const pagadorIBAN = dealRecord.getCellValue(FIELD_DEAL_PAGADOR_IBAN)
    || dealRecord.getCellValue(FIELD_DEAL_PAGADOR_CUENTA)
    || '';
const pagadorDocumento = dealRecord.getCellValue(FIELD_DEAL_PAGADOR_DOC) || '';

// Extraer datos del cobrador (acreedor en SEPA = Advancing)
const cobradorNombre = dealRecord.getCellValue(FIELD_DEAL_COBRADOR_NOMBRE) || SEPA_CREDITOR_NAME;
const cobradorCuenta = dealRecord.getCellValue(FIELD_DEAL_COBRADOR_CUENTA) || SEPA_CREDITOR_IBAN;
const cobradorBIC = dealRecord.getCellValue(FIELD_DEAL_COBRADOR_BIC) || SEPA_CREDITOR_BIC;
const cobradorDocumento = dealRecord.getCellValue(FIELD_DEAL_COBRADOR_DOC) || '';
const fechaFirmaSEPA = dealRecord.getCellValue(FIELD_DEAL_FECHA_FIRMA_SEPA);
const direccionInmueble = dealRecord.getCellValue(FIELD_DEAL_DIRECCION_INMUEBLE) || '';
const dealIndex = dealRecord.getCellValue(FIELD_DEAL_INDEX) || '';

console.log(`Deal: ${dealIndex}`);
console.log(`Pagador: ${pagadorNombreCompleto} (IBAN: ${pagadorIBAN ? pagadorIBAN.slice(0, 4) + '****' : 'N/A'})`);
console.log(`Cobrador: ${cobradorNombre}`);
console.log(`Fecha firma SEPA: ${fechaFirmaSEPA || 'N/A'}`);

// Validar datos mínimos para SEPA
if (!pagadorIBAN) {
    const msg = 'Falta IBAN del pagador. No se puede generar SEPA.';
    console.error(msg);
    await balanceTable.updateRecordAsync(balanceRecordId, {
        [FIELD_ETIQUETA_CONCILIACION]: { name: 'Error' },
        [FIELD_AVISO_CONCILIACION]: avisoExistente
            ? avisoExistente + '\n' + `[${formatTimestamp()}] ERROR: ${msg}`
            : `[${formatTimestamp()}] ERROR: ${msg}`,
    });
    return;
}

if (!pagadorNombreCompleto) {
    const msg = 'Falta nombre del pagador. No se puede generar SEPA.';
    console.error(msg);
    await balanceTable.updateRecordAsync(balanceRecordId, {
        [FIELD_ETIQUETA_CONCILIACION]: { name: 'Error' },
        [FIELD_AVISO_CONCILIACION]: avisoExistente
            ? avisoExistente + '\n' + `[${formatTimestamp()}] ERROR: ${msg}`
            : `[${formatTimestamp()}] ERROR: ${msg}`,
    });
    return;
}

// ============================================================================
// STEP 2b: Asignar pagador y cobrador en el GESTOR BANCARIO (bankAccounts)
// ============================================================================
// La tabla bankAccounts es el gestor bancario vinculado al balance.
// El script busca si ya existe un registro con el mismo IBAN; si no, lo crea.
// Luego vincula al balance como linkBankAccountCashIn (pagador) y
// linkBankAccountCashOut (cobrador).
// ============================================================================

console.log('--- STEP 2b: Asignando pagador/cobrador en el gestor bancario ---');

// Función auxiliar para detectar tipo de documento español
function detectAccountIDType(doc) {
    if (!doc) return null;
    const clean = doc.replace(/[-\s]/g, '').toUpperCase();
    if (/^[0-9]{8}[A-Z]$/.test(clean)) return 'DNI';
    if (/^[XYZ][0-9]{7}[A-Z]$/.test(clean)) return 'NIE';
    if (/^[A-Z][0-9]{7}[A-Z0-9]$/.test(clean)) return 'CIF';
    return 'Otros';
}

// Función para buscar bankAccount existente por IBAN
async function findBankAccountByIBAN(iban, tipo) {
    if (!iban) return null;
    const ibanClean = iban.replace(/\s/g, '').toUpperCase();

    const query = await bankAccountsTable.selectRecordsAsync({
        fields: [
            FIELD_BA_RECIPIENT_IBAN,
            FIELD_BA_TIPO,
            FIELD_BA_HOLDER_NAME,
            FIELD_BA_LINK_DEAL_BALANCE,
        ]
    });

    for (const record of query.records) {
        const recIBAN = record.getCellValue(FIELD_BA_RECIPIENT_IBAN);
        if (!recIBAN) continue;
        const recIBANClean = recIBAN.replace(/\s/g, '').toUpperCase();
        if (recIBANClean !== ibanClean) continue;

        // Si se especifica tipo, verificar que coincida
        if (tipo) {
            const recTipo = record.getCellValue(FIELD_BA_TIPO);
            if (recTipo && recTipo.name !== tipo) continue;
        }

        return record;
    }
    return null;
}

// --- Pagador (tipo: "Pagador" en gestor = deudor SEPA = inquilino) ---
const existingBankAccountCashIn = balanceRecord.getCellValue(FIELD_BALANCE_LINK_BANK_CASH_IN);
let pagadorBankAccountId = null;

if (existingBankAccountCashIn && existingBankAccountCashIn.length > 0) {
    pagadorBankAccountId = existingBankAccountCashIn[0].id;
    console.log(`Pagador ya vinculado en gestor: ${pagadorBankAccountId}`);

    // Actualizar datos por si han cambiado en el Excel
    const updatePagador = {};
    if (pagadorNombreCompleto) updatePagador[FIELD_BA_HOLDER_NAME] = pagadorNombreCompleto;
    if (pagadorIBAN) updatePagador[FIELD_BA_RECIPIENT_IBAN] = pagadorIBAN.replace(/\s/g, '');
    if (pagadorDocumento) {
        updatePagador[FIELD_BA_HOLDER_ACCOUNT_ID] = pagadorDocumento;
        const idType = detectAccountIDType(pagadorDocumento);
        if (idType) updatePagador[FIELD_BA_ACCOUNT_ID_TYPE] = { name: idType };
    }

    if (Object.keys(updatePagador).length > 0) {
        await bankAccountsTable.updateRecordAsync(pagadorBankAccountId, updatePagador);
        console.log(`Datos del pagador actualizados en gestor`);
    }
} else {
    // Buscar por IBAN
    const existingByIBAN = await findBankAccountByIBAN(pagadorIBAN, 'Pagador');

    if (existingByIBAN) {
        pagadorBankAccountId = existingByIBAN.id;
        console.log(`Pagador encontrado en gestor por IBAN: ${pagadorBankAccountId}`);

        // Vincular al balance
        await balanceTable.updateRecordAsync(balanceRecordId, {
            [FIELD_BALANCE_LINK_BANK_CASH_IN]: [{ id: pagadorBankAccountId }],
        });
    } else {
        // Crear nuevo registro en gestor bancario
        const pagadorFields = {
            [FIELD_BA_HOLDER_NAME]: pagadorNombreCompleto,
            [FIELD_BA_RECIPIENT_IBAN]: pagadorIBAN.replace(/\s/g, ''),
            [FIELD_BA_TIPO]: { name: 'Pagador' },
            [FIELD_BA_LINK_DEAL_BALANCE]: [{ id: balanceRecordId }],
            [FIELD_BA_LINK_DEAL_BALANCE_CASH_INS]: [{ id: balanceRecordId }],
        };

        if (pagadorDocumento) {
            pagadorFields[FIELD_BA_HOLDER_ACCOUNT_ID] = pagadorDocumento;
            const idType = detectAccountIDType(pagadorDocumento);
            if (idType) pagadorFields[FIELD_BA_ACCOUNT_ID_TYPE] = { name: idType };
        }

        // Extraer BIC del IBAN si es español (4 primeros dígitos del código bancario)
        const pagadorIBANClean = pagadorIBAN.replace(/\s/g, '');
        if (pagadorIBANClean.startsWith('ES') && pagadorIBANClean.length >= 8) {
            pagadorFields[FIELD_BA_RECIPIENT_BANK_CODE] = pagadorIBANClean.slice(4, 8);
        }

        pagadorBankAccountId = await bankAccountsTable.createRecordAsync(pagadorFields);
        console.log(`Pagador CREADO en gestor: ${pagadorBankAccountId}`);
    }
}

// --- Cobrador (tipo: "Perceptor" en gestor = acreedor SEPA = Advancing) ---
const existingBankAccountCashOut = balanceRecord.getCellValue(FIELD_BALANCE_LINK_BANK_CASH_OUT);
let cobradorBankAccountId = null;

if (existingBankAccountCashOut && existingBankAccountCashOut.length > 0) {
    cobradorBankAccountId = existingBankAccountCashOut[0].id;
    console.log(`Cobrador ya vinculado en gestor: ${cobradorBankAccountId}`);

    // Actualizar datos por si han cambiado
    const updateCobrador = {};
    if (cobradorNombre) updateCobrador[FIELD_BA_HOLDER_NAME] = cobradorNombre;
    if (cobradorCuenta) updateCobrador[FIELD_BA_RECIPIENT_IBAN] = cobradorCuenta.replace(/\s/g, '');
    if (cobradorBIC) updateCobrador[FIELD_BA_RECIPIENT_BIC] = cobradorBIC;
    if (cobradorDocumento) {
        updateCobrador[FIELD_BA_HOLDER_ACCOUNT_ID] = cobradorDocumento;
        const idType = detectAccountIDType(cobradorDocumento);
        if (idType) updateCobrador[FIELD_BA_ACCOUNT_ID_TYPE] = { name: idType };
    }

    if (Object.keys(updateCobrador).length > 0) {
        await bankAccountsTable.updateRecordAsync(cobradorBankAccountId, updateCobrador);
        console.log(`Datos del cobrador actualizados en gestor`);
    }
} else {
    // Buscar por IBAN
    const existingByIBAN = await findBankAccountByIBAN(cobradorCuenta, 'Perceptor');

    if (existingByIBAN) {
        cobradorBankAccountId = existingByIBAN.id;
        console.log(`Cobrador encontrado en gestor por IBAN: ${cobradorBankAccountId}`);

        // Vincular al balance
        await balanceTable.updateRecordAsync(balanceRecordId, {
            [FIELD_BALANCE_LINK_BANK_CASH_OUT]: [{ id: cobradorBankAccountId }],
        });
    } else {
        // Crear nuevo registro en gestor bancario
        const cobradorFields = {
            [FIELD_BA_HOLDER_NAME]: cobradorNombre,
            [FIELD_BA_RECIPIENT_IBAN]: cobradorCuenta.replace(/\s/g, ''),
            [FIELD_BA_TIPO]: { name: 'Perceptor' },
            [FIELD_BA_LINK_DEAL_BALANCE]: [{ id: balanceRecordId }],
            [FIELD_BA_LINK_DEAL_BALANCE_CASH_OUTS]: [{ id: balanceRecordId }],
        };

        if (cobradorBIC) cobradorFields[FIELD_BA_RECIPIENT_BIC] = cobradorBIC;
        if (cobradorDocumento) {
            cobradorFields[FIELD_BA_HOLDER_ACCOUNT_ID] = cobradorDocumento;
            const idType = detectAccountIDType(cobradorDocumento);
            if (idType) cobradorFields[FIELD_BA_ACCOUNT_ID_TYPE] = { name: idType };
        }

        const cobradorIBANClean = cobradorCuenta.replace(/\s/g, '');
        if (cobradorIBANClean.startsWith('ES') && cobradorIBANClean.length >= 8) {
            cobradorFields[FIELD_BA_RECIPIENT_BANK_CODE] = cobradorIBANClean.slice(4, 8);
        }

        cobradorBankAccountId = await bankAccountsTable.createRecordAsync(cobradorFields);
        console.log(`Cobrador CREADO en gestor: ${cobradorBankAccountId}`);
    }
}

console.log(`Gestor bancario configurado: Pagador=${pagadorBankAccountId}, Cobrador=${cobradorBankAccountId}`);

// ============================================================================
// STEP 3: Obtener mandato Caixa vinculado al balance
// ============================================================================

console.log('--- STEP 3: Leyendo mandato Caixa ---');

let mandatoReferencia = '';
let mandatoFechaFirma = '';
let mandatoId = null;

if (mandatosCaixa.length > 0) {
    mandatoId = mandatosCaixa[0].id;
    const mandatoRecord = await mandatosCaixaTable.selectRecordAsync(mandatoId, {
        fields: [
            FIELD_MANDATO_REFERENCIA,
            FIELD_MANDATO_FECHA_FIRMA,
        ]
    });

    if (mandatoRecord) {
        mandatoReferencia = mandatoRecord.getCellValue(FIELD_MANDATO_REFERENCIA) || '';
        const fechaFirmaMandato = mandatoRecord.getCellValue(FIELD_MANDATO_FECHA_FIRMA);
        mandatoFechaFirma = fechaFirmaMandato || '';
        console.log(`Mandato Caixa: ${mandatoReferencia} (firma: ${mandatoFechaFirma || 'N/A'})`);
    }
} else {
    console.log('No hay mandato Caixa vinculado. Se usará la fecha de firma SEPA del deal.');
    // Usar referencia generada y fecha del deal
    mandatoReferencia = `ADV-${dealIndex}`.slice(0, 35);
    mandatoFechaFirma = fechaFirmaSEPA || '';
}

if (!mandatoReferencia) {
    mandatoReferencia = `ADV-${dealIndex}-${Date.now()}`.slice(0, 35);
    console.log(`Referencia mandato generada: ${mandatoReferencia}`);
}

// ============================================================================
// STEP 4: Filtrar cashflows In pendientes con sistema Caixa
// ============================================================================

console.log('--- STEP 4: Filtrando cashflows Caixa pendientes ---');

if (linkedCashflows.length === 0) {
    console.log('No hay cashflows vinculados a este balance.');
    await balanceTable.updateRecordAsync(balanceRecordId, {
        [FIELD_ETIQUETA_CONCILIACION]: { name: 'Error' },
        [FIELD_AVISO_CONCILIACION]: avisoExistente
            ? avisoExistente + '\n' + `[${formatTimestamp()}] ERROR: No hay cashflows vinculados`
            : `[${formatTimestamp()}] ERROR: No hay cashflows vinculados`,
    });
    return;
}

const cashflowIdsList = linkedCashflows.map(c => c.id);
const cashflowFields = [
    FIELD_CF_DIRECCION,
    FIELD_CF_FECHA_PROG,
    FIELD_CF_IMPORTE,
    FIELD_CF_STATUS_INS,
    FIELD_CF_STATUS_OUT,
    FIELD_CF_SISTEMA_PAGO,
    FIELD_CF_METODO_PAGO,
    FIELD_CF_LINK_REMESA,
    FIELD_CF_SUJETO,
    FIELD_CF_RAZON,
    FIELD_CF_FECHA_PAGO,
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

// Filtrar: solo In + Pendiente + sistema Caixa + sin remesa asignada
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

const cashflowsParaSEPA = allCashflowRecords.filter(cf => {
    // Solo dirección "In" (cobros)
    const direccion = cf.getCellValue(FIELD_CF_DIRECCION);
    if (!direccion || direccion.name !== 'In') return false;

    // Solo status "Pendiente"
    const statusIn = cf.getCellValue(FIELD_CF_STATUS_INS);
    if (!statusIn || statusIn.name !== 'Pendiente') return false;

    // Solo sistema Caixa
    const sistema = cf.getCellValue(FIELD_CF_SISTEMA_PAGO);
    if (!sistema || normalizeSistema(sistema.name) !== 'caixa') return false;

    // Solo sin remesa ya asignada (evitar doble importación)
    const remesa = cf.getCellValue(FIELD_CF_LINK_REMESA);
    if (remesa && remesa.length > 0) return false;

    // Solo con importe > 0
    const importe = cf.getCellValue(FIELD_CF_IMPORTE);
    if (!importe || importe <= 0) return false;

    return true;
});

// Ordenar por fecha programada
cashflowsParaSEPA.sort((a, b) => {
    const fa = new Date(a.getCellValue(FIELD_CF_FECHA_PROG) || 0);
    const fb = new Date(b.getCellValue(FIELD_CF_FECHA_PROG) || 0);
    return fa - fb;
});

console.log(`Cashflows Caixa pendientes para SEPA: ${cashflowsParaSEPA.length}`);

if (cashflowsParaSEPA.length === 0) {
    const msg = 'No hay cashflows In pendientes con sistema Caixa sin remesa asignada.';
    console.log(msg);
    await balanceTable.updateRecordAsync(balanceRecordId, {
        [FIELD_ETIQUETA_CONCILIACION]: { name: 'Error' },
        [FIELD_AVISO_CONCILIACION]: avisoExistente
            ? avisoExistente + '\n' + `[${formatTimestamp()}] ERROR: ${msg}`
            : `[${formatTimestamp()}] ERROR: ${msg}`,
    });
    return;
}

// Calcular totales
let importeTotal = 0;
const detallesCashflows = [];
for (const cf of cashflowsParaSEPA) {
    const importe = cf.getCellValue(FIELD_CF_IMPORTE);
    const fechaProg = cf.getCellValue(FIELD_CF_FECHA_PROG);
    importeTotal += importe;
    detallesCashflows.push({
        id: cf.id,
        importe: importe,
        fecha: fechaProg,
        fechaISO: fechaProg ? new Date(fechaProg).toISOString().slice(0, 10) : formatDateISO(hoy),
    });
    console.log(`  CF ${cf.id}: €${importe} — ${fechaProg}`);
}

console.log(`Importe total SEPA: €${importeTotal.toFixed(2)}`);

// ============================================================================
// STEP 5: Generar SEPA Direct Debit XML (pain.008.001.02) para CaixaBank
// ============================================================================

console.log('--- STEP 5: Generando fichero SEPA XML ---');

const msgId = generateMsgId();
const creationDateTime = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const numTransacciones = cashflowsParaSEPA.length;

// Fecha de cobro solicitada: usar la más temprana de los cashflows o mañana si es pasada
let fechaCobro = new Date(detallesCashflows[0].fecha);
const manana = new Date(hoy);
manana.setDate(manana.getDate() + 1);
if (fechaCobro < manana) {
    fechaCobro = manana;
}
const fechaCobroISO = formatDateISO(fechaCobro);

// Determinar tipo de secuencia (RCUR = recurrente, FRST = primera vez)
const tipoSecuencia = fechaFirmaSEPA ? 'RCUR' : 'FRST';

// Fecha firma mandato para SEPA
const mandatoFechaISO = mandatoFechaFirma
    ? new Date(mandatoFechaFirma).toISOString().slice(0, 10)
    : (fechaFirmaSEPA ? new Date(fechaFirmaSEPA).toISOString().slice(0, 10) : formatDateISO(hoy));

// Construir XML SEPA pain.008.001.02
let sepaXML = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>${xmlEscape(msgId)}</MsgId>
      <CreDtTm>${creationDateTime}</CreDtTm>
      <NbOfTxs>${numTransacciones}</NbOfTxs>
      <CtrlSum>${formatAmount(importeTotal)}</CtrlSum>
      <InitgPty>
        <Nm>${xmlEscape(SEPA_CREDITOR_NAME)}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${xmlEscape(msgId + '-PMT')}</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <NbOfTxs>${numTransacciones}</NbOfTxs>
      <CtrlSum>${formatAmount(importeTotal)}</CtrlSum>
      <PmtTpInf>
        <SvcLvl>
          <Cd>SEPA</Cd>
        </SvcLvl>
        <LclInstrm>
          <Cd>${SEPA_SCHEME}</Cd>
        </LclInstrm>
        <SeqTp>${tipoSecuencia}</SeqTp>
      </PmtTpInf>
      <ReqdColltnDt>${fechaCobroISO}</ReqdColltnDt>
      <Cdtr>
        <Nm>${xmlEscape(cobradorNombre)}</Nm>
      </Cdtr>
      <CdtrAcct>
        <Id>
          <IBAN>${xmlEscape(cobradorCuenta.replace(/\s/g, ''))}</IBAN>
        </Id>
      </CdtrAcct>
      <CdtrAgt>
        <FinInstnId>
          <BIC>${xmlEscape(cobradorBIC)}</BIC>
        </FinInstnId>
      </CdtrAgt>
      <CdtrSchmeId>
        <Id>
          <PrvtId>
            <Othr>
              <Id>${xmlEscape(SEPA_CREDITOR_ID)}</Id>
              <SchmeNm>
                <Prtry>SEPA</Prtry>
              </SchmeNm>
            </Othr>
          </PrvtId>
        </Id>
      </CdtrSchmeId>`;

// Generar una transacción por cada cashflow
for (let i = 0; i < cashflowsParaSEPA.length; i++) {
    const cf = cashflowsParaSEPA[i];
    const detalle = detallesCashflows[i];
    const endToEndId = `${msgId}-${String(i + 1).padStart(3, '0')}`;

    // Concepto: referencia del deal + mes
    const fechaCF = new Date(detalle.fecha);
    const mesNombre = fechaCF.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const concepto = `Alquiler ${direccionInmueble} ${mesNombre}`.slice(0, 140);

    sepaXML += `
      <DrctDbtTxInf>
        <PmtId>
          <EndToEndId>${xmlEscape(endToEndId)}</EndToEndId>
        </PmtId>
        <InstdAmt Ccy="EUR">${formatAmount(detalle.importe)}</InstdAmt>
        <DrctDbtTx>
          <MndtRltdInf>
            <MndtId>${xmlEscape(mandatoReferencia)}</MndtId>
            <DtOfSgntr>${mandatoFechaISO}</DtOfSgntr>
          </MndtRltdInf>
        </DrctDbtTx>
        <DbtrAgt>
          <FinInstnId>
            <Othr>
              <Id>NOTPROVIDED</Id>
            </Othr>
          </FinInstnId>
        </DbtrAgt>
        <Dbtr>
          <Nm>${xmlEscape(pagadorNombreCompleto)}</Nm>
        </Dbtr>
        <DbtrAcct>
          <Id>
            <IBAN>${xmlEscape(pagadorIBAN.replace(/\s/g, ''))}</IBAN>
          </Id>
        </DbtrAcct>
        <RmtInf>
          <Ustrd>${xmlEscape(concepto)}</Ustrd>
        </RmtInf>
      </DrctDbtTxInf>`;
}

sepaXML += `
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>`;

console.log(`SEPA XML generado: ${sepaXML.length} caracteres, MsgId: ${msgId}`);

// ============================================================================
// STEP 6: Crear remesa y vincular cashflows
// ============================================================================

console.log('--- STEP 6: Creando remesa e importando pagos ---');

// Crear registro de remesa
const remesaId = await remesasTable.createRecordAsync({
    [FIELD_REMESA_FECHA_INICIO]: formatDateISO(fechaCobro),
    [FIELD_REMESA_LINK_CASHFLOWS]: cashflowsParaSEPA.map(cf => ({ id: cf.id })),
});

console.log(`Remesa creada: ${remesaId} (fecha: ${fechaCobroISO})`);

// ============================================================================
// STEP 7: Marcar cashflows como importados (similar al script de rentas)
// ============================================================================

console.log('--- STEP 7: Importando pagos (actualizando cashflows) ---');

const fechaHoyISO = formatDateISO(hoy);
const cashflowUpdates = cashflowsParaSEPA.map(cf => ({
    id: cf.id,
    fields: {
        [FIELD_CF_METODO_PAGO]: { name: 'SEPA' },
        [FIELD_CF_LINK_REMESA]: [{ id: remesaId }],
    }
}));

let cashflowsActualizados = 0;
for (let i = 0; i < cashflowUpdates.length; i += 50) {
    const batch = cashflowUpdates.slice(i, i + 50);
    await cashflowTable.updateRecordsAsync(batch);
    cashflowsActualizados += batch.length;
    console.log(`Cashflows actualizados: ${cashflowsActualizados}/${cashflowUpdates.length}`);
}

// ============================================================================
// STEP 8: Guardar SEPA XML y actualizar balance
// ============================================================================

console.log('--- STEP 8: Guardando XML y actualizando balance ---');

// Escribir el XML en el campo del balance
const updateFields = {
    [FIELD_SEPA_XML]: sepaXML,
    [FIELD_ETIQUETA_CONCILIACION]: { name: 'Procesado' },
};

await balanceTable.updateRecordAsync(balanceRecordId, updateFields);

console.log('SEPA XML guardado en el balance');

// ============================================================================
// STEP 9: Escribir auditoría
// ============================================================================

const lineaAuditoria = `[${formatTimestamp()}] CONCILIACIÓN CAIXA — ${cashflowsParaSEPA.length} cobros por €${importeTotal.toFixed(2)} | SEPA MsgId: ${msgId} | Remesa: ${remesaId} | Pagador: ${pagadorNombreCompleto} (${pagadorIBAN.slice(0, 4)}****) [gestor:${pagadorBankAccountId}] | Cobrador: ${cobradorNombre} [gestor:${cobradorBankAccountId}] | Mandato: ${mandatoReferencia} | Tipo: ${tipoSecuencia} | Fecha cobro: ${fechaCobroISO}`;

const nuevoAviso = avisoExistente
    ? avisoExistente + '\n' + lineaAuditoria
    : lineaAuditoria;

await balanceTable.updateRecordAsync(balanceRecordId, {
    [FIELD_AVISO_CONCILIACION]: nuevoAviso,
});

console.log(`Auditoría escrita: ${lineaAuditoria}`);

// ============================================================================
// RESUMEN
// ============================================================================

console.log('========================================');
console.log('CONCILIACIÓN BANCARIA COMPLETADA');
console.log(`Deal: ${dealIndex}`);
console.log(`Pagador: ${pagadorNombreCompleto}`);
console.log(`Cobrador: ${cobradorNombre}`);
console.log(`Sistema: Caixa`);
console.log(`Cashflows procesados: ${cashflowsActualizados}`);
console.log(`Importe total SEPA: €${importeTotal.toFixed(2)}`);
console.log(`Tipo secuencia: ${tipoSecuencia}`);
console.log(`Fecha cobro solicitada: ${fechaCobroISO}`);
console.log(`Remesa: ${remesaId}`);
console.log(`SEPA MsgId: ${msgId}`);
console.log(`Mandato: ${mandatoReferencia}`);
console.log('========================================');
