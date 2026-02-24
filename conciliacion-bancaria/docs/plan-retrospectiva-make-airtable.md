# Plan: Retrospectiva Excel → Airtable via Make

Workflow para migrar los datos historicos de la **Hoja Control (CF Cobros)** en Google Sheets hacia las tablas `rentas` y `cashflow` en Airtable, disparado desde un registro de `balance` en Airtable.

---

## 1. Resumen del flujo

```
┌─────────────────────────────────┐
│  AIRTABLE - tabla balance       │
│  Campo trigger: crearRetro ✓    │
│  Envia: balanceRecordId,        │
│         numOperacion             │
└──────────────┬──────────────────┘
               │ Webhook POST
               ▼
┌─────────────────────────────────┐
│  MAKE - Escenario Retrospectiva │
│                                 │
│  1. Google Sheets: Search Row   │
│     (CF Cobros, col A = numOp)  │
│                                 │
│  2. Google Apps Script: Parse   │
│     Devuelve JSON array de      │
│     {mes, importe, estado}      │
│                                 │
│  3. Iterator sobre meses        │
│                                 │
│  4. Router (filtro: tiene dato) │
│     ├─ Crear Renta en Airtable  │
│     └─ Crear Cashflow(s)        │
│        ├─ Cashflow In (cobro)   │
│        └─ Cashflow Out (pago)   │
│                                 │
│  5. Actualizar balance con log  │
└─────────────────────────────────┘
```

---

## 2. Estructura de la Hoja Control (CF Cobros)

### Columnas de metadatos (A - AI)

| Columna | Campo | Ejemplo | Uso en retrospectiva |
|---------|-------|---------|---------------------|
| A | Nº De Operacion | `4468783216` | **Clave de busqueda** (= indexDeal en Airtable) |
| B | Nº SEPA | `20369314` | Informativo |
| D | DNI | `08877577Z` | No se usa |
| E | Nombre deudor | `Antonio Rodriguez` | Verificacion |
| F | Importe mes (nominal) | `1300` | Importe por defecto si celda vacia |
| G | CONCEPTO | `Alquiler Calle X` | Verificacion |
| H | Dia de cobro | `5 de mes` | Para calcular `calcFechaCobroInq` |
| I | Mes inicio cobro | `Septiembre` | Primera renta |
| J | Mes inicio cobro (num) | `9` | Primera renta |
| K | Año inicio cobro | `2021` | Primera renta |
| L | Score | `NO` / `SI` | No se usa |
| M | Parte DAS (siniestro) | `NO` / num | Informativo |

### Columnas mensuales (AJ - GG)

Desde la columna **AJ (col 36)** hasta **GG**, hay **77 meses** en pares de 2 columnas:

```
Col AJ (36) = Importe Marzo 2021      Col AK (37) = Estado Marzo 2021
Col AL (38) = Importe Abril 2021      Col AM (39) = Estado Abril 2021
Col AN (40) = Importe Mayo 2021       Col AO (41) = Estado Mayo 2021
...
Hasta Julio 2027
```

**Rango temporal**: Marzo 2021 → Julio 2027

### Patron por mes

Cada mes tiene exactamente 2 columnas:
- **Columna par** (AJ, AL, AN...): `Importe` (currency, ej: `1200.0`, `813.0`, `-`, vacio)
- **Columna impar** (AK, AM, AO...): `Estado` (letra/codigo)

---

## 3. Mapeo de Estados: Excel → Airtable

### Cashflow In (statusIns)

| Excel | Significado | Airtable statusIns | Airtable statusOut |
|-------|-------------|-------------------|-------------------|
| `C` o `c` | Cobrado | `Cobrado` | `Pagado` |
| `C'` o `c'` | Cobrada con retraso | `Cobrada con retraso` | `Pagado` |
| `P` o `p` | Pendiente | `Pendiente` | `Pendiente` |
| `PP` o `pp` | Pago parcial | `Pago parcial` | `Pendiente` |
| `D` | Devuelta | `Devuelta` | `Devuelto` |
| `R` | Recuperada via arrendatario | `Recuperada vía arrendatario` | `Pagado` |
| `R'` | Recuperada parcial via arrendatario | `Recuperada vía arrendatario` | `Pagado` |
| `DAS` | Recuperada via DAS | `Recuperada vía DAS` | `Pagado` |
| `PR` | Pendiente de recobro | `Pendiente` | `Pendiente` |
| `I` | Impagado / Incidencia | `Devuelta` | `Pendiente` |
| `-` | No aplica (sin renta ese mes) | **SKIP** — no crear registros | — |
| vacio | Sin datos | **SKIP** — no crear registros | — |

### Logica de estados derivados para Cashflow Out

El cashflow Out (pago al propietario) se deriva del estado del cobro (In):
- Si el cobro esta realizado (C, C', R, R', DAS) → Out = `Pagado`
- Si el cobro esta pendiente o impagado (P, PP, D, PR, I) → Out = `Pendiente`
- Si D (devuelta) → Out = `Devuelto`

---

## 4. Logica de importes

### Renta

```
renta.importe = Importe de la celda del mes en CF Cobros
```

Si la celda de importe esta vacia pero el estado es `P` o `C`:
```
renta.importe = columna F (Importe mes nominal)
```

### Cashflow In (cobro al inquilino)

```
cashflowIn.importe = renta.importe + renta.importeServicio
```

> **Nota**: `importeServicio` se calcula por separado segun la estructura del deal (comision prorrateada). En la retrospectiva, como los datos vienen del Excel que ya refleja el importe total cobrado, se puede usar directamente el importe del Excel como importe del cashflow In, y dejar `importeServicio = 0` en la renta (o calcularlo a posteriori).

**Alternativa simplificada** (recomendada para retrospectiva):
```
cashflowIn.importe = Importe de la celda del Excel (ya incluye servicio)
renta.importe      = Importe de la celda del Excel
```

### Cashflow Out (pago al propietario)

El importe que se paga al propietario se puede obtener de la hoja **"Transferencia Propietario"**:
```
cashflowOut.importe = Transferencia Propietario > col E (Importe mes)
```

O calcularlo como:
```
cashflowOut.importe = renta.importe - comisionAdvancing
```

> **Decision pendiente**: Confirmar si se crean cashflows Out en la retrospectiva o solo los In (cobros). Ver seccion 8.

---

## 5. Registros a crear por cada mes con datos

Por cada par (Importe, Estado) **que no sea vacio ni "-"**, crear:

### 5.1 Registro en `rentas` (tbl2izIaOR37sRHGg)

| Campo Airtable | Field ID | Valor |
|----------------|----------|-------|
| `fecha` | fldSdtfW7UfIw8z4V | Primer dia del mes (ej: `2021-03-01`) |
| `importe` | fld2DbSB516n1bU8f | Importe del Excel |
| `tipo` | fldTWeJAYDxWOZWPJ | `Alquiler` |
| `dealBalance` | fldfh0vDzeqRuTFFE | `[balanceRecordId]` (del trigger) |
| `importeServicio` | fldS4Zqn2KLOox9jG | `0` (o calcular si se tiene el dato) |
| `orden` | fld5NwGSUP5onAOKd | Indice secuencial (1, 2, 3...) |
| `sistemaPago` | fldKBseprTEyZysG8 | `Caixa` (historico) o `Unnax` (reciente) |

### 5.2 Registro en `cashflow` - direccion In (tblxY6upsLDmqzaaL)

| Campo Airtable | Field ID | Valor |
|----------------|----------|-------|
| `direccion` | fld656RBx2XkCHzR7 | `In` |
| `importe` | fldbkCQZwDR8a9kRP | Importe del Excel |
| `fechaProgramada` | fldrquziQqJoTn08B | Primer dia del mes |
| `statusIns` | fldFyfq8PaqbCRgeN | Segun mapeo de estados (seccion 3) |
| `linkRenta` | fldsTJCCfItHDoCgS | `[rentaRecordId]` (del paso anterior) |
| `linkDealBalance` | fldyCWFzrTMhWs7FT | `[balanceRecordId]` |
| `sistemaPago` | fldjNItVaCzrhlNhf | `Caixa` o `Unnax` |
| `razon` | fld17mZxxLYPQfUzr | `Renta` |
| `sujeto` | fldazRk0SXXdqQo9L | `Pagador alquiler` |
| `orden` | fldc5yW3lEIo5OoE8 | Mismo orden que la renta |
| `metodoPago` | fldn69DhRftezHhcZ | `SEPA` |

### 5.3 Registro en `cashflow` - direccion Out (opcional)

| Campo Airtable | Field ID | Valor |
|----------------|----------|-------|
| `direccion` | fld656RBx2XkCHzR7 | `Out` |
| `importe` | fldbkCQZwDR8a9kRP | Importe pago propietario |
| `fechaProgramada` | fldrquziQqJoTn08B | Primer dia del mes |
| `statusOut` | fldIMh0gNEA3TuaiG | Derivado del estado In (ver seccion 3) |
| `linkRenta` | fldsTJCCfItHDoCgS | `[rentaRecordId]` |
| `linkDealBalance` | fldyCWFzrTMhWs7FT | `[balanceRecordId]` |
| `sujeto` | fldazRk0SXXdqQo9L | `Propietario` |
| `orden` | fldc5yW3lEIo5OoE8 | Mismo orden que la renta |
| `metodoPago` | fldn69DhRftezHhcZ | `Transferencia` |

---

## 6. Diseno del escenario Make

### Prerequisitos

1. **Google Sheets**: Subir el Excel "Hoja control - MES A MES" a Google Drive (o vincular)
2. **Google Apps Script**: Crear un web app para parsear la fila (ver seccion 7)
3. **Airtable**: Crear campo `crearRetro` (checkbox) en tabla `balance`
4. **Airtable**: Crear campo `avisoRetro` (long text) en tabla `balance`

### Modulos del escenario (orden secuencial)

```
[1] Webhooks: Custom webhook
         │
         │  Recibe: { balanceRecordId, numOperacion }
         │
         ▼
[2] HTTP: Make a request
         │
         │  GET → Google Apps Script web app
         │  Query: ?numOp={{numOperacion}}&sheetId={{SHEET_ID}}
         │  Respuesta: JSON array de meses
         │
         ▼
[3] JSON: Parse JSON
         │
         │  Parsea la respuesta del GAS
         │  Array de { month, importe, estado }
         │
         ▼
[4] Flow Control: Iterator
         │
         │  Itera sobre cada mes del array
         │
         ▼
[5] Tools: Set variable
         │
         │  statusIn = mapeo(estado)
         │  statusOut = derivado(statusIn)
         │  skip = (estado vacio o "-")
         │
         ▼
[6] Filter: Solo si skip = false
         │
         ▼
[7] Airtable: Create a record (tabla rentas)
         │
         │  Crea la renta con fecha, importe, tipo, link a balance
         │  Guarda: rentaRecordId
         │
         ▼
[8] Airtable: Create a record (tabla cashflow - In)
         │
         │  Crea cashflow In con link a renta y balance
         │
         ▼
[9] Airtable: Create a record (tabla cashflow - Out) [OPCIONAL]
         │
         │  Crea cashflow Out con link a renta y balance
         │
         ▼
[10] Tools: Increment variable (orden++)
         │
         │  (vuelve al Iterator si quedan meses)
         │
         ▼
[11] Airtable: Update a record (tabla balance)
         │
         │  Escribe log en avisoRetro
         │  Limpia crearRetro = false
```

### Diagrama visual Make

```
┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐
│ Webhook  │──▶│ HTTP(GAS) │──▶│Parse JSON│──▶│ Iterator │
└──────────┘   └───────────┘   └──────────┘   └────┬─────┘
                                                    │
                                         ┌──────────▼──────────┐
                                         │  Set Variable       │
                                         │  (mapeo estados)    │
                                         └──────────┬──────────┘
                                                    │
                                              [Filter: hay dato]
                                                    │
                                         ┌──────────▼──────────┐
                                         │  Airtable: Create   │
                                         │  RENTA              │
                                         └──────────┬──────────┘
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼                               ▼
                          ┌─────────────────┐             ┌─────────────────┐
                          │ Airtable: Create│             │ Airtable: Create│
                          │ CASHFLOW IN     │             │ CASHFLOW OUT    │
                          └─────────────────┘             └─────────────────┘
```

---

## 7. Google Apps Script - Parser de fila

Este script se despliega como Web App y recibe el numero de operacion. Busca en CF Cobros, parsea los pares Importe/Estado y devuelve JSON limpio.

```javascript
function doGet(e) {
  var numOp = e.parameter.numOp;
  var sheetId = e.parameter.sheetId || 'TU_SHEET_ID';

  var ss = SpreadsheetApp.openById(sheetId);
  var ws = ss.getSheetByName('CF Cobros');

  // Fila 1: headers con fechas de meses (desde col AJ = col 36)
  var headerRow = ws.getRange(1, 36, 1, 154).getValues()[0]; // 77 meses * 2 cols

  // Buscar fila por numOp en columna A
  var colA = ws.getRange('A:A').getValues();
  var targetRow = -1;
  for (var i = 2; i < colA.length; i++) {
    if (String(colA[i][0]).trim() === String(numOp).trim()) {
      targetRow = i + 1; // 1-indexed
      break;
    }
  }

  if (targetRow === -1) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'Operacion no encontrada', numOp: numOp })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Leer metadatos de la fila
  var metaRange = ws.getRange(targetRow, 1, 1, 35).getValues()[0];
  var dataRange = ws.getRange(targetRow, 36, 1, 154).getValues()[0];

  var result = {
    numOperacion: String(metaRange[0]),
    nombre: metaRange[4],
    importeNominal: metaRange[5],
    concepto: metaRange[6],
    diaCobro: metaRange[7],
    meses: []
  };

  // Parsear pares Importe/Estado
  for (var j = 0; j < 154; j += 2) {
    var monthDate = headerRow[j];
    var importe = dataRange[j];
    var estado = dataRange[j + 1];

    if (!monthDate) continue;

    // Formatear fecha como YYYY-MM
    var monthStr;
    if (monthDate instanceof Date) {
      monthStr = Utilities.formatDate(monthDate, 'Europe/Madrid', 'yyyy-MM');
    } else {
      monthStr = String(monthDate);
    }

    // Normalizar estado
    var estadoStr = estado ? String(estado).trim() : '';
    var importeNum = null;

    if (importe !== null && importe !== '' && importe !== '-') {
      importeNum = Number(importe);
    }

    // Solo incluir meses con datos
    if (estadoStr !== '' && estadoStr !== '-') {
      result.meses.push({
        month: monthStr,
        monthDate: monthStr + '-01', // YYYY-MM-DD para Airtable
        importe: importeNum,
        estado: estadoStr.toUpperCase()
      });
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify(result)
  ).setMimeType(ContentService.MimeType.JSON);
}
```

### Ejemplo de respuesta JSON

```json
{
  "numOperacion": "4468783216",
  "nombre": "Antonio Rodriguez Cumplido",
  "importeNominal": 1300,
  "concepto": "Alquiler Calle Espalmador",
  "diaCobro": "5 de mes",
  "meses": [
    { "month": "2021-03", "monthDate": "2021-03-01", "importe": 813, "estado": "C" },
    { "month": "2021-04", "monthDate": "2021-04-01", "importe": 1200, "estado": "C" },
    { "month": "2021-05", "monthDate": "2021-05-01", "importe": 1200, "estado": "C" },
    { "month": "2021-09", "monthDate": "2021-09-01", "importe": 1300, "estado": "C" },
    { "month": "2021-10", "monthDate": "2021-10-01", "importe": 1300, "estado": "C" },
    { "month": "2021-11", "monthDate": "2021-11-01", "importe": null, "estado": "P" },
    { "month": "2022-05", "monthDate": "2022-05-01", "importe": null, "estado": "P" }
  ]
}
```

---

## 8. Decisiones pendientes

Antes de implementar, confirmar:

### 8.1 Cashflows Out (pagos al propietario)

- **Opcion A**: Crear solo cashflows In (cobros). Los Out se crearan despues manualmente o con otro proceso.
- **Opcion B**: Crear In + Out en la misma retrospectiva. Requiere determinar el importe del Out (desde hoja "Transferencia Propietario" o calculando `importe - comision`).

### 8.2 Importe del servicio (comision Advancing)

- **Opcion A**: Dejar `importeServicio = 0` en las rentas retrospectivas. El importe del Excel en CF Cobros ya refleja lo que se cobro al inquilino (incluye servicio).
- **Opcion B**: Calcular `importeServicio` a partir de los datos del deal (`comisionProductoConIVA / meses`). Mas preciso pero requiere leer datos adicionales.

### 8.3 Sistema de pago historico

Los datos historicos son de CaixaBank (SEPA). Hay que decidir:
- Marcar todas las rentas/cashflows retrospectivos como `sistemaPago = "Caixa"`
- O dejar vacio y rellenar despues

### 8.4 Rentas de tipo "Comision Advancing"

La hoja CF Cobros solo tiene las rentas de alquiler (cobros al inquilino). Hay que decidir:
- **Opcion A**: Solo crear rentas tipo "Alquiler" en la retrospectiva
- **Opcion B**: Tambien crear rentas tipo "Comision Advancing" (requiere calcular importeServicio por mes)

### 8.5 Balance: campo importe

El campo `balance.importe` se usa como precio actual del alquiler. Hay que decidir:
- Rellenarlo con el ultimo importe del Excel
- O dejarlo como esta si el balance ya existe

### 8.6 Volumen y limites de API

- CF Cobros tiene **~3460 filas** (operaciones)
- Cada operacion puede tener hasta **77 meses** de datos
- Cada mes genera 2-3 registros (1 renta + 1-2 cashflows)
- **Total estimado**: ~3460 × 30 meses promedio × 2 registros = **~207.600 registros**
- Limite API Airtable: **5 requests/segundo**
- **Tiempo estimado por operacion**: ~30 meses × 2 llamadas × 0.2s = ~12 segundos
- **Recomendacion**: Procesar operacion por operacion (trigger manual desde balance), no en batch masivo

---

## 9. Configuracion en Airtable

### Campos nuevos a crear en tabla `balance` (tblYNdOLuMvpBavEu)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `crearRetro` | Checkbox | Trigger para lanzar la retrospectiva |
| `avisoRetro` | Long text | Log de auditoria de la retrospectiva |
| `webhookRetro` | URL / Button | URL del webhook de Make |

### Automatizacion en Airtable

- **Trigger**: "When record matches conditions" → `crearRetro` is checked
- **Action 1**: Find records en tabla `deals` linked al balance → obtener `indexDeal` (numOperacion)
- **Action 2**: Send webhook POST a Make con `{ balanceRecordId, numOperacion }`

---

## 10. Mapeo completo de estados (referencia rapida)

```
Excel → Airtable cashflow.statusIns / cashflow.statusOut

C/c    → Cobrado           / Pagado
C'/c'  → Cobrada con retraso / Pagado
P/p    → Pendiente         / Pendiente
PP/pp  → Pago parcial      / Pendiente
D      → Devuelta          / Devuelto
R      → Recuperada via arrendatario / Pagado
R'     → Recuperada via arrendatario / Pagado
DAS    → Recuperada via DAS / Pagado
PR     → Pendiente         / Pendiente
I      → Devuelta          / Pendiente
```

---

## 11. Formulas Make para el modulo Set Variable

```
statusIn = switch(
  upper(estado),
  "C",   "Cobrado",
  "C'",  "Cobrada con retraso",
  "P",   "Pendiente",
  "PP",  "Pago parcial",
  "D",   "Devuelta",
  "R",   "Recuperada vía arrendatario",
  "R'",  "Recuperada vía arrendatario",
  "DAS", "Recuperada vía DAS",
  "PR",  "Pendiente",
  "I",   "Devuelta"
)

statusOut = switch(
  upper(estado),
  "C",   "Pagado",
  "C'",  "Pagado",
  "P",   "Pendiente",
  "PP",  "Pendiente",
  "D",   "Devuelto",
  "R",   "Pagado",
  "R'",  "Pagado",
  "DAS", "Pagado",
  "PR",  "Pendiente",
  "I",   "Pendiente"
)

importeFinal = if(
  importe != null,
  importe,
  importeNominal
)
```

---

## 12. Orden de implementacion sugerido

1. Subir Excel a Google Sheets
2. Crear y desplegar Google Apps Script (seccion 7)
3. Probar GAS manualmente con un numOp conocido
4. Crear campos en Airtable (`crearRetro`, `avisoRetro`)
5. Crear escenario en Make (seccion 6)
6. Probar con 1 operacion sencilla (solo cobrados, sin impagos)
7. Probar con 1 operacion con impagos (D, PP, R, DAS)
8. Validar que los registros en Airtable cuadran con el Excel
9. Ejecutar gradualmente (10 operaciones, luego 50, luego el resto)
