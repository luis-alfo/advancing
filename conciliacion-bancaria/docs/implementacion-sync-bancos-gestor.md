# Implementación: Sync Bancos → Gestor (solo Airtable)

Una sola automatización en la base de Bancos que detecta cambios y actualiza el Gestor vía API.

---

## Paso 1: Crear campos previos

### En Bancos (tabla `deals`)

| Campo | Tipo | Valores | Notas |
|-------|------|---------|-------|
| `stopCobroInquilino` | singleSelect | "To Do", "In Progress", "Done" | Mismos valores que en Gestor |
| `estadoBancario` | formula (rollup-based) | Ver paso 2 | Campo calculado, no editable |
| `_syncSource` | singleLineText | — | Prevención de loops (para futuro) |

### En Gestor (tabla `deal`)

| Campo | Tipo | Valores | Notas |
|-------|------|---------|-------|
| `estadoBancario` | singleSelect | "Al corriente", "Cobro pendiente", "Pago pendiente", "Con incidencias", "Stop cobro" | Nuevo campo |
| `_syncSource` | singleLineText | — | Prevención de loops (para futuro) |

> `stopCobroInquilino` ya existe en Gestor (`fldWeJ1s7w64Taob4`, singleSelect: To Do / In Progress / Done)

---

## Paso 2: Campos de apoyo para calcular `estadoBancario` en deals

Para que la automatización pueda calcular el estado sin consultar cashflows uno a uno, creamos **rollups en la tabla `deals`** que agregan datos desde `balance → cashflow`.

### Opción A: Rollups directos en `deals` (recomendada)

Como `deals` ya tiene `linkBalance`, podemos hacer rollups encadenados:

#### En tabla `balance`, crear estos campos:

| Campo | Tipo | Configuración |
|-------|------|---------------|
| `countCashflowInPendiente` | rollup | Link: `cashflow` → Count donde `direccion = "In"` AND `statusIns = "Pendiente"` |
| `countCashflowInDevuelta` | rollup | Link: `cashflow` → Count donde `direccion = "In"` AND `statusIns = "Devuelta"` |
| `countCashflowOutPendiente` | rollup | Link: `cashflow` → Count donde `direccion = "Out"` AND `statusOut = "Pendiente"` |

> **Nota**: Los rollups de Airtable no soportan filtros directamente. Alternativa: crear **campos auxiliares** en `cashflow` y luego hacer rollup de esos.

#### En tabla `cashflow`, crear campos auxiliares (checkbox/number):

| Campo | Tipo | Fórmula |
|-------|------|---------|
| `esCobroPendiente` | formula | `IF(AND({direccion} = "In", {statusIns} = "Pendiente"), 1, 0)` |
| `esCobroDevuelto` | formula | `IF(AND({direccion} = "In", OR({statusIns} = "Devuelta", {statusIns} = "Pago parcial")), 1, 0)` |
| `esPagoPendiente` | formula | `IF(AND({direccion} = "Out", {statusOut} = "Pendiente"), 1, 0)` |

#### En tabla `balance`, crear rollups de esos campos:

| Campo | Tipo | Configuración |
|-------|------|---------------|
| `totalCobrosPendientes` | rollup | Link: cashflows → SUM(`esCobroPendiente`) |
| `totalCobrosDevueltos` | rollup | Link: cashflows → SUM(`esCobroDevuelto`) |
| `totalPagosPendientes` | rollup | Link: cashflows → SUM(`esPagoPendiente`) |

#### En tabla `deals`, crear rollups finales:

| Campo | Tipo | Configuración |
|-------|------|---------------|
| `totalCobrosPendientes` | rollup | Link: `linkBalance` → SUM(`totalCobrosPendientes`) |
| `totalCobrosDevueltos` | rollup | Link: `linkBalance` → SUM(`totalCobrosDevueltos`) |
| `totalPagosPendientes` | rollup | Link: `linkBalance` → SUM(`totalPagosPendientes`) |

#### En tabla `deals`, fórmula `estadoBancario`:

```
IF(
  {stopCobroInquilino} = "In Progress",
  "Stop cobro",
  IF(
    {totalCobrosDevueltos} > 0,
    "Con incidencias",
    IF(
      {totalCobrosPendientes} > 0,
      "Cobro pendiente",
      IF(
        {totalPagosPendientes} > 0,
        "Pago pendiente",
        "Al corriente"
      )
    )
  )
)
```

> **Prioridad de estados**: Stop cobro > Con incidencias > Cobro pendiente > Pago pendiente > Al corriente

---

## Paso 3: La automatización

### Configuración en Airtable

**Base**: Bancos - ADV (`appuGDs3spnRAvc61`)

**Automation**: "Sync Bancos → Gestor"

#### Trigger
- **Tipo**: "When record matches conditions" o "When record is updated"
- **Tabla**: `deals`
- **Campos vigilados**: `stopCobroInquilino`, `estadoBancario` (la fórmula)
- **Condición**: `recordID` is not empty (solo deals que están enlazados al Gestor)

#### Action: Run Script

```javascript
// ============================================================
// Sync Bancos → Gestor
// Automatización Airtable: cuando cambia stopCobroInquilino
// o estadoBancario en deals de Bancos, actualiza el Gestor.
// ============================================================

// --- Configuración ---
const GESTOR_BASE_ID = 'appuV5kGKzKdXlhoR';
const GESTOR_TABLE_ID = 'tblwx73iceuKNaz68'; // tabla deal
const GESTOR_PAT = 'TU_PERSONAL_ACCESS_TOKEN'; // TODO: reemplazar

// Field IDs en Gestor
const GESTOR_FIELDS = {
    stopCobroInquilino: 'fldWeJ1s7w64Taob4',
    estadoBancario: 'FIELD_ID_AQUI', // TODO: reemplazar con el ID del nuevo campo
    _syncSource: 'FIELD_ID_AQUI'     // TODO: reemplazar con el ID del nuevo campo
};

// --- Input del trigger ---
let inputConfig = input.config();
let recordId = inputConfig.recordId;

// --- Leer el deal modificado en Bancos ---
let dealsTable = base.getTable('deals');
let record = await dealsTable.selectRecordAsync(recordId, {
    fields: [
        'recordID',           // Record ID del deal en Gestor
        'stopCobroInquilino',
        'estadoBancario',     // Fórmula calculada
        'id_deal'             // Para logging
    ]
});

if (!record) {
    console.log('Record no encontrado');
    return;
}

let gestorRecordId = record.getCellValueAsString('recordID');
if (!gestorRecordId) {
    console.log(`Deal ${record.getCellValueAsString('id_deal')}: sin recordID de Gestor, skip`);
    return;
}

// --- Preparar payload para Gestor ---
let stopCobro = record.getCellValue('stopCobroInquilino');
let estadoBancario = record.getCellValueAsString('estadoBancario');

let fieldsToUpdate = {};

// stopCobroInquilino: copiar el select value
if (stopCobro) {
    fieldsToUpdate[GESTOR_FIELDS.stopCobroInquilino] = { name: stopCobro.name };
}

// estadoBancario: copiar como select value
if (estadoBancario) {
    fieldsToUpdate[GESTOR_FIELDS.estadoBancario] = { name: estadoBancario };
}

// _syncSource: marcar que viene de Bancos
fieldsToUpdate[GESTOR_FIELDS._syncSource] = 'bancos-sync';

if (Object.keys(fieldsToUpdate).length <= 1) {
    // Solo tiene _syncSource, nada que actualizar
    console.log(`Deal ${record.getCellValueAsString('id_deal')}: sin cambios que sincronizar`);
    return;
}

// --- Llamar a la API de Airtable para actualizar Gestor ---
let url = `https://api.airtable.com/v0/${GESTOR_BASE_ID}/${GESTOR_TABLE_ID}/${gestorRecordId}`;

let response = await fetch(url, {
    method: 'PATCH',
    headers: {
        'Authorization': `Bearer ${GESTOR_PAT}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        fields: fieldsToUpdate
    })
});

if (response.ok) {
    let result = await response.json();
    console.log(`OK: Deal ${record.getCellValueAsString('id_deal')} → Gestor actualizado`);
    console.log(`  stopCobro: ${stopCobro?.name || '(vacío)'}`);
    console.log(`  estadoBancario: ${estadoBancario || '(vacío)'}`);
} else {
    let error = await response.text();
    console.error(`ERROR: Deal ${record.getCellValueAsString('id_deal')} → ${response.status}`);
    console.error(error);
}
```

#### Input variables del trigger

En la configuración de la Action "Run Script", define estos input variables:

| Variable | Valor |
|----------|-------|
| `recordId` | Record ID del trigger (el deal que cambió) |

---

## Paso 4: Verificación

1. **Test stopCobroInquilino**:
   - En Bancos, cambia `stopCobroInquilino` de un deal a "In Progress"
   - Verifica en Gestor que el mismo deal muestra "In Progress"

2. **Test estadoBancario**:
   - En Bancos, marca un cashflow como "Devuelta"
   - Verifica que la fórmula `estadoBancario` en deals cambia a "Con incidencias"
   - Verifica que el campo `estadoBancario` en Gestor se actualiza

3. **Test deal sin enlace**:
   - Verifica que deals sin `recordID` no disparan errores

---

## Resumen de campos a crear

### cashflow (3 fórmulas)
- `esCobroPendiente`
- `esCobroDevuelto`
- `esPagoPendiente`

### balance (3 rollups)
- `totalCobrosPendientes`
- `totalCobrosDevueltos`
- `totalPagosPendientes`

### deals (6 campos: 3 rollups + 1 fórmula + 1 select + 1 text)
- `totalCobrosPendientes` (rollup)
- `totalCobrosDevueltos` (rollup)
- `totalPagosPendientes` (rollup)
- `estadoBancario` (fórmula)
- `stopCobroInquilino` (singleSelect)
- `_syncSource` (singleLineText)

### Gestor - deal (2 campos)
- `estadoBancario` (singleSelect)
- `_syncSource` (singleLineText)

**Total: 14 campos nuevos** (9 en Bancos, 3 en cashflow/balance de apoyo, 2 en Gestor)
