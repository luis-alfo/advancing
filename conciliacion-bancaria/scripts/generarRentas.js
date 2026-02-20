// =============================================================================
// AIRTABLE AUTOMATION SCRIPT: Generación de Rentas y Cashflows
// =============================================================================
//
// TRIGGER: "When record matches conditions" en tabla balance
//   - Condiciones: statusGenerarRentas = "Ejecutando"
//
// INPUT VARIABLES (configurar en la automatización):
//   - balanceRecordId: Record ID del registro de balance (del trigger)
//
// FUNCIONAMIENTO:
//   1. Lee configuración del balance y del deal vinculado
//   2. Detecta modalidad: estándar (gestión cobro inquilino) o
//      SEPA propietario mensual (sin gestión cobro, servicio al propietario)
//   3. Genera rentas y cashflows según la modalidad:
//      - Estándar: rentas Alquiler + cashflows In/Out
//      - SEPA Propietario: rentas Comisión Advancing + solo cashflows In
//   4. En modalidad SEPA Propietario, crea mandato SEPA si no existe
//   5. Actualiza statusGenerarRentas a "Ok"
//
// MODALIDAD SEPA PROPIETARIO MENSUAL:
//   Se activa cuando:
//     - gestionCobroSelect (deal) ≠ "Advancing"
//     - cobroServicio (deal) = "Mensualmente"
//     - pagadorServicio (deal) = "Propietario"
//   En esta modalidad:
//     - No se gestiona el cobro del alquiler al inquilino
//     - Se cobra comisión de servicio mensual al propietario via SEPA
//     - Solo se crean cashflows In (sujeto = "Propietario")
//     - No se crean cashflows Out
//     - Se crea mandato SEPA vinculado a la cuenta del propietario
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN - Input desde la automatización
// ─────────────────────────────────────────────────────────────────────────────
const config = input.config();
const balanceRecordId = config.balanceRecordId;

// ─────────────────────────────────────────────────────────────────────────────
// TABLAS
// ─────────────────────────────────────────────────────────────────────────────
const balanceTable = base.getTable("balance");
const rentasTable = base.getTable("rentas");
const cashflowTable = base.getTable("cashflow");
const dealsTable = base.getTable("deals");
const mandateTable = base.getTable("mandate");

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES
// ─────────────────────────────────────────────────────────────────────────────
const getFirstValue = (arr) => Array.isArray(arr) && arr.length > 0 ? arr[0] : arr;

const getSelectName = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (val.name) return val.name;
    if (Array.isArray(val)) {
        const first = val[0];
        if (!first) return null;
        if (typeof first === 'string') return first;
        if (first.name) return first.name;
    }
    return null;
};

const debugValue = (name, val) => {
    console.log(`DEBUG ${name}: tipo=${typeof val}, esArray=${Array.isArray(val)}, valor=${JSON.stringify(val)}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// OBTENER DATOS DEL BALANCE
// ─────────────────────────────────────────────────────────────────────────────
const balanceRecord = await balanceTable.selectRecordAsync(balanceRecordId, {
    fields: [
        "linkDeal",
        "linkDealComisionProductoConIVA",
        "linkDealPrecioCalculo",
        "meses",
        "diasServicio",
        "linkDealCobroServicio",
        "linkDealPagadorServicio",
        "linkDealFechaInicio",
        "diaCobroInq",
        "diaPagoProp",
        "sistemaPago",
        "defaultTypeCashIn",
        "defaultTypeCashOut",
        "linkMandate",
        "linkBankAccountCashIn"
    ]
});

if (!balanceRecord) {
    throw new Error("No se encontró el registro de balance");
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTRAER VALORES DEL BALANCE
// ─────────────────────────────────────────────────────────────────────────────
const comisionTotal = getFirstValue(balanceRecord.getCellValue("linkDealComisionProductoConIVA")) || 0;
const alquilerMensual = getFirstValue(balanceRecord.getCellValue("linkDealPrecioCalculo")) || 0;
const meses = balanceRecord.getCellValue("meses") || 0;
const diasServicio = balanceRecord.getCellValue("diasServicio") || 0;

debugValue("linkDealCobroServicio RAW", balanceRecord.getCellValue("linkDealCobroServicio"));
debugValue("linkDealPagadorServicio RAW", balanceRecord.getCellValue("linkDealPagadorServicio"));

const cobroServicio = getSelectName(balanceRecord.getCellValue("linkDealCobroServicio"));
const pagadorServicio = getSelectName(balanceRecord.getCellValue("linkDealPagadorServicio"));
const fechaInicioRaw = getFirstValue(balanceRecord.getCellValue("linkDealFechaInicio"));
const diaCobroInq = getFirstValue(balanceRecord.getCellValue("diaCobroInq")) || 1;
const diaPagoProp = getFirstValue(balanceRecord.getCellValue("diaPagoProp")) || 1;
const sistemaPago = getSelectName(balanceRecord.getCellValue("sistemaPago"));
const defaultTypeCashIn = getSelectName(balanceRecord.getCellValue("defaultTypeCashIn"));
const defaultTypeCashOut = getSelectName(balanceRecord.getCellValue("defaultTypeCashOut"));

const fechaInicio = fechaInicioRaw ? new Date(fechaInicioRaw) : new Date();

// ─────────────────────────────────────────────────────────────────────────────
// LEER gestionCobroSelect DEL DEAL (no tiene lookup en balance)
// ─────────────────────────────────────────────────────────────────────────────
const linkDeal = balanceRecord.getCellValue("linkDeal");
const dealId = linkDeal && linkDeal[0] ? linkDeal[0].id : null;

let gestionCobroSelect = null;
if (dealId) {
    const dealRecord = await dealsTable.selectRecordAsync(dealId, {
        fields: ["gestionCobroSelect"]
    });
    if (dealRecord) {
        gestionCobroSelect = getSelectName(dealRecord.getCellValue("gestionCobroSelect"));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DETECTAR MODALIDAD SEPA PROPIETARIO MENSUAL
// ─────────────────────────────────────────────────────────────────────────────
const esSEPAPropietario = (
    gestionCobroSelect !== null &&
    gestionCobroSelect !== "Advancing" &&
    cobroServicio === "Mensualmente" &&
    pagadorServicio === "Propietario"
);

console.log("=== DATOS DEL BALANCE ===");
console.log(`Comisión total: ${comisionTotal}€`);
console.log(`Alquiler mensual: ${alquilerMensual}€`);
console.log(`Meses: ${meses}`);
console.log(`Días servicio (prorrateo): ${diasServicio}`);
console.log(`Cobro servicio: ${cobroServicio}`);
console.log(`Pagador servicio: ${pagadorServicio}`);
console.log(`Gestión cobro: ${gestionCobroSelect}`);
console.log(`Fecha inicio: ${fechaInicio}`);
console.log(`Sistema pago: ${sistemaPago}`);
console.log(`Modalidad: ${esSEPAPropietario ? 'SEPA PROPIETARIO MENSUAL' : 'ESTÁNDAR'}`);

// ─────────────────────────────────────────────────────────────────────────────
// CALCULAR NÚMERO TOTAL DE MESES
// ─────────────────────────────────────────────────────────────────────────────
const hayProrrateo = diasServicio > 0;
const totalMeses = meses + (hayProrrateo ? 1 : 0);

console.log(`Total meses a generar: ${totalMeses} (incluye prorrateo: ${hayProrrateo})`);

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN: Calcular importe de servicio por mes según cobroServicio
// (Solo aplica en modalidad estándar - en SEPA Propietario toda la comisión
//  va como importe de la renta, no como importeServicio)
// ─────────────────────────────────────────────────────────────────────────────
function calcularImporteServicio(mesNumero, esProrrateo, diasProrrateo) {
    if (!comisionTotal || comisionTotal === 0) return 0;

    switch (cobroServicio) {
        case "Por anticipado":
            return 0;

        case "Primer mes":
            return mesNumero === 1 ? comisionTotal : 0;

        case "En 2 meses":
            if (mesNumero === 1 || mesNumero === 2) {
                return comisionTotal / 2;
            }
            return 0;

        case "Mensualmente":
            const comisionMensual = comisionTotal / meses;
            if (esProrrateo) {
                return comisionMensual * diasProrrateo / 30;
            }
            return comisionMensual;

        default:
            return 0;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN: Calcular importes de CashIn y CashOut según pagadorServicio
// (Solo aplica en modalidad estándar)
// ─────────────────────────────────────────────────────────────────────────────
function calcularImportesCashflow(importeAlquiler, importeServicio) {
    let cashIn, cashOut;

    switch (pagadorServicio) {
        case "Propietario":
        case "Agencia":
            cashIn = importeAlquiler;
            cashOut = importeAlquiler - importeServicio;
            break;

        case "Inquilino":
            cashIn = importeAlquiler + importeServicio;
            cashOut = importeAlquiler;
            break;

        case "50% propietario / 50% inquilino":
            cashIn = importeAlquiler + (importeServicio / 2);
            cashOut = importeAlquiler - (importeServicio / 2);
            break;

        default:
            cashIn = importeAlquiler;
            cashOut = importeAlquiler - importeServicio;
    }

    return { cashIn, cashOut };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN: Calcular fecha para un mes dado
// ─────────────────────────────────────────────────────────────────────────────
function calcularFecha(mesNumero, diaMes) {
    const fecha = new Date(fechaInicio);
    fecha.setMonth(fecha.getMonth() + mesNumero - 1);
    fecha.setDate(diaMes);
    return fecha.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERAR DATOS DE RENTAS Y CASHFLOWS
// ─────────────────────────────────────────────────────────────────────────────
const rentasACrear = [];
const cashflowsACrear = [];
const BATCH_SIZE = 50;

if (esSEPAPropietario) {
    // =================================================================
    // MODALIDAD: SEPA PROPIETARIO MENSUAL
    // Solo rentas de comisión + cashflows In al propietario
    // =================================================================
    console.log("\n=== MODALIDAD SEPA PROPIETARIO MENSUAL ===");

    if (!comisionTotal || comisionTotal === 0) {
        console.log("⚠ Comisión total es 0. No se generarán rentas.");
    } else {
        const comisionMensual = comisionTotal / meses;

        for (let mes = 1; mes <= totalMeses; mes++) {
            const esProrrateoMes = hayProrrateo && mes === totalMeses;

            // Calcular importe de la comisión mensual
            let importeComision;
            if (esProrrateoMes) {
                importeComision = comisionMensual * diasServicio / 30;
            } else {
                importeComision = comisionMensual;
            }

            // Redondear a 2 decimales
            importeComision = Math.round(importeComision * 100) / 100;

            console.log(`Mes ${mes}: Comisión=${importeComision.toFixed(2)}€${esProrrateoMes ? ' (prorrateo)' : ''}`);

            rentasACrear.push({
                fields: {
                    "fecha": calcularFecha(mes, diaCobroInq),
                    "tipo": { name: "Comisión Advancing" },
                    "importe": importeComision,
                    "importeServicio": 0,
                    "orden": mes,
                    "dealBalance": [{ id: balanceRecordId }],
                    "sistemaPago": sistemaPago ? { name: sistemaPago } : null,
                    "metodoPago": { name: "SEPA" }
                },
                _meta: {
                    tipo: "Comisión Advancing",
                    cashIn: importeComision,
                    cashOut: null,
                    fechaCobro: calcularFecha(mes, diaCobroInq),
                    fechaPago: null,
                    orden: mes
                }
            });
        }
    }
} else {
    // =================================================================
    // MODALIDAD: ESTÁNDAR (gestión de cobro al inquilino)
    // Rentas de alquiler + cashflows In/Out
    // =================================================================
    console.log("\n=== MODALIDAD ESTÁNDAR ===");

    // --- CASO ESPECIAL: Comisión por anticipado (mes 0) ---
    if (cobroServicio === "Por anticipado" && comisionTotal > 0) {
        console.log("Creando renta de Comisión Advancing por anticipado...");

        rentasACrear.push({
            fields: {
                "fecha": calcularFecha(0, diaCobroInq),
                "tipo": { name: "Comisión Advancing" },
                "importe": comisionTotal,
                "importeServicio": 0,
                "orden": 0,
                "dealBalance": [{ id: balanceRecordId }],
                "sistemaPago": sistemaPago ? { name: sistemaPago } : null,
                "metodoPago": defaultTypeCashIn ? { name: defaultTypeCashIn } : null
            },
            _meta: {
                tipo: "Comisión Advancing",
                cashIn: comisionTotal,
                cashOut: null,
                fechaCobro: calcularFecha(0, diaCobroInq),
                fechaPago: null,
                orden: 0
            }
        });
    }

    // --- RENTAS MENSUALES DE ALQUILER ---
    for (let mes = 1; mes <= totalMeses; mes++) {
        const esProrrateo = hayProrrateo && mes === totalMeses;

        let importeAlquiler;
        if (esProrrateo) {
            importeAlquiler = alquilerMensual * diasServicio / 30;
        } else {
            importeAlquiler = alquilerMensual;
        }

        const importeServicio = calcularImporteServicio(mes, esProrrateo, diasServicio);
        const { cashIn, cashOut } = calcularImportesCashflow(importeAlquiler, importeServicio);

        console.log(`Mes ${mes}: Alquiler=${importeAlquiler.toFixed(2)}€, Servicio=${importeServicio.toFixed(2)}€, CashIn=${cashIn.toFixed(2)}€, CashOut=${cashOut.toFixed(2)}€`);

        rentasACrear.push({
            fields: {
                "fecha": calcularFecha(mes, diaCobroInq),
                "tipo": { name: "Alquiler" },
                "importe": importeAlquiler,
                "importeServicio": importeServicio,
                "orden": mes,
                "dealBalance": [{ id: balanceRecordId }],
                "sistemaPago": sistemaPago ? { name: sistemaPago } : null,
                "metodoPago": defaultTypeCashIn ? { name: defaultTypeCashIn } : null
            },
            _meta: {
                tipo: "Alquiler",
                cashIn: cashIn,
                cashOut: cashOut,
                fechaCobro: calcularFecha(mes, diaCobroInq),
                fechaPago: calcularFecha(mes, diaPagoProp),
                orden: mes
            }
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR RENTAS EN BATCH
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n=== CREANDO ${rentasACrear.length} RENTAS ===`);

const rentasCreadas = [];

for (let i = 0; i < rentasACrear.length; i += BATCH_SIZE) {
    const batch = rentasACrear.slice(i, i + BATCH_SIZE);
    const batchFields = batch.map(r => ({ fields: r.fields }));

    const recordIds = await rentasTable.createRecordsAsync(batchFields);

    for (let j = 0; j < recordIds.length; j++) {
        rentasCreadas.push({
            id: recordIds[j],
            meta: batch[j]._meta
        });
    }

    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${recordIds.length} rentas creadas`);
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR CASHFLOWS PARA CADA RENTA
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n=== CREANDO CASHFLOWS ===`);

for (const renta of rentasCreadas) {
    const { id: rentaId, meta } = renta;

    if (esSEPAPropietario) {
        // --- SEPA PROPIETARIO: Solo Cash In con sujeto "Propietario" ---
        cashflowsACrear.push({
            fields: {
                "direccion": { name: "In" },
                "importe": meta.cashIn,
                "fechaProgramada": meta.fechaCobro,
                "orden": meta.orden,
                "linkRenta": [{ id: rentaId }],
                "linkDealBalance": [{ id: balanceRecordId }],
                "statusIns": { name: "Pendiente" },
                "sujeto": { name: "Propietario" },
                "sistemaPago": sistemaPago ? { name: sistemaPago } : null,
                "metodoPago": { name: "SEPA" },
                "razon": { name: "Renta" }
            }
        });
    } else {
        // --- ESTÁNDAR: Cash In ---
        cashflowsACrear.push({
            fields: {
                "direccion": { name: "In" },
                "importe": meta.cashIn,
                "fechaProgramada": meta.fechaCobro,
                "orden": meta.orden,
                "linkRenta": [{ id: rentaId }],
                "linkDealBalance": [{ id: balanceRecordId }],
                "statusIns": { name: "Pendiente" },
                "sujeto": { name: "Pagador alquiler" },
                "sistemaPago": sistemaPago ? { name: sistemaPago } : null,
                "metodoPago": defaultTypeCashIn ? { name: defaultTypeCashIn } : null,
                "razon": { name: "Renta" }
            }
        });

        // --- ESTÁNDAR: Cash Out (excepto para Comisión Advancing) ---
        if (meta.tipo !== "Comisión Advancing" && meta.cashOut !== null) {
            cashflowsACrear.push({
                fields: {
                    "direccion": { name: "Out" },
                    "importe": meta.cashOut,
                    "fechaProgramada": meta.fechaPago,
                    "orden": meta.orden,
                    "linkRenta": [{ id: rentaId }],
                    "linkDealBalance": [{ id: balanceRecordId }],
                    "statusOut": { name: "Pendiente" },
                    "sujeto": { name: "Propietario" },
                    "sistemaPago": sistemaPago ? { name: sistemaPago } : null,
                    "metodoPago": defaultTypeCashOut ? { name: defaultTypeCashOut } : null,
                    "razon": { name: "Renta" }
                }
            });
        }
    }
}

// Crear cashflows en batches
console.log(`Total cashflows a crear: ${cashflowsACrear.length}`);

for (let i = 0; i < cashflowsACrear.length; i += BATCH_SIZE) {
    const batch = cashflowsACrear.slice(i, i + BATCH_SIZE);
    await cashflowTable.createRecordsAsync(batch);
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} cashflows creados`);
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR MANDATO SEPA (solo en modalidad SEPA Propietario)
// ─────────────────────────────────────────────────────────────────────────────
if (esSEPAPropietario) {
    console.log("\n=== MANDATO SEPA PROPIETARIO ===");

    const mandatoExistente = balanceRecord.getCellValue("linkMandate");

    if (mandatoExistente && mandatoExistente.length > 0) {
        console.log(`Mandato ya existe vinculado al balance (${mandatoExistente[0].id}). No se crea uno nuevo.`);
    } else {
        // Obtener cuenta bancaria del propietario (linkBankAccountCashIn del balance)
        const linkBankAccountCashIn = balanceRecord.getCellValue("linkBankAccountCashIn");

        if (!linkBankAccountCashIn || linkBankAccountCashIn.length === 0) {
            console.log("⚠ No hay cuenta bancaria (linkBankAccountCashIn) vinculada al balance.");
            console.log("  El mandato se creará sin cuenta bancaria. Vincular manualmente después.");

            // Crear mandato sin cuenta bancaria
            const mandateRecordId = await mandateTable.createRecordAsync({
                "dealBalance": [{ id: balanceRecordId }],
                "recurring": true,
                "scheme": "CORE"
            });

            // Vincular mandato al balance
            await balanceTable.updateRecordAsync(balanceRecordId, {
                "linkMandate": [{ id: mandateRecordId }]
            });

            console.log(`Mandato creado: ${mandateRecordId} (sin cuenta bancaria)`);
        } else {
            const bankAccountId = linkBankAccountCashIn[0].id;

            // Crear mandato vinculado a la cuenta del propietario
            const mandateRecordId = await mandateTable.createRecordAsync({
                "dealBalance": [{ id: balanceRecordId }],
                "linkBankAccount": [{ id: bankAccountId }],
                "recurring": true,
                "scheme": "CORE"
            });

            // Vincular mandato al balance
            await balanceTable.updateRecordAsync(balanceRecordId, {
                "linkMandate": [{ id: mandateRecordId }]
            });

            console.log(`Mandato creado: ${mandateRecordId}`);
            console.log(`  Vinculado a bankAccount: ${bankAccountId}`);
            console.log(`  Vinculado a balance: ${balanceRecordId}`);
            console.log("  → Activar el mandato via webhookCreateMandate para crear en Unnax.");
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR STATUS DEL BALANCE
// ─────────────────────────────────────────────────────────────────────────────
await balanceTable.updateRecordAsync(balanceRecordId, {
    "statusGenerarRentas": { name: "Ok" }
});

// ─────────────────────────────────────────────────────────────────────────────
// RESUMEN
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n========================================");
console.log("PROCESO COMPLETADO");
console.log(`Modalidad: ${esSEPAPropietario ? 'SEPA Propietario Mensual' : 'Estándar'}`);
console.log(`Rentas creadas: ${rentasCreadas.length}`);
console.log(`Cashflows creados: ${cashflowsACrear.length}`);
if (esSEPAPropietario) {
    console.log(`  - Tipo rentas: Comisión Advancing`);
    console.log(`  - Cashflows: solo In (sujeto: Propietario, método: SEPA)`);
    console.log(`  - Comisión mensual: ${(comisionTotal / meses).toFixed(2)}€`);
}
console.log("Status actualizado a 'Ok'");
console.log("========================================");
