# Retrospectiva — Migracion de datos de Google Sheets a Airtable

Script de Airtable Automation para crear rentas y cashflows historicos a partir de los datos de la **Hoja Control (CF Cobros)** en Google Sheets. Un solo script — sin Make, sin Google Apps Script.

---

## Caso de uso

Cuando se necesita migrar los datos historicos de cobros y pagos de una operacion (que hasta ahora vivian solo en el Excel) hacia Airtable, este script:
1. Lee la fila de la operacion directamente desde Google Sheets (via `fetch()`)
2. Parsea los 77 meses de pares Importe/Estado
3. Crea rentas tipo "Alquiler" y "Comision Advancing"
4. Crea cashflows In (cobro inquilino) y Out (pago propietario) vinculados
5. Escribe un log de auditoria y desmarca el checkbox trigger

---

## Prerequisitos

### Google Sheets

1. Subir el Excel "Hoja control - MES A MES.xlsx" a Google Drive
2. Abrirlo como Google Sheet
3. Compartir como **"Cualquiera con el enlace puede ver"**
4. Anotar el `SPREADSHEET_ID` de la URL

### Google Cloud (API Key)

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Habilitar **Google Sheets API**
3. Crear una **Clave de API** (Credenciales > Crear credenciales)
4. Restringir la key a "Google Sheets API" (recomendado)

### Airtable — Campos nuevos en tabla balance

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `crearRetro` | Checkbox | Trigger de la automatizacion |
| `avisoRetro` | Long text | Log de auditoria acumulativo |

---

## Configuracion de la automatizacion

### Trigger

- **Tipo**: "When record matches conditions"
- **Tabla**: `balance`
- **Condicion**: `crearRetro` is checked

### Input variables

| Variable | Valor |
|----------|-------|
| `balanceRecordId` | Record ID del registro de balance (del trigger) |

### Action

- **Tipo**: "Run a script"
- **Script**: Copiar el contenido de `crearRetrospectiva.js`
- **Antes de copiar**: Reemplazar `TU_API_KEY_AQUI` y `TU_SPREADSHEET_ID_AQUI` con los valores reales

---

## Que hace el script paso a paso

```
Balance (crearRetro = true)
    |
    +- STEP 1: Lee balance → linkDeal → numOperacion (indexDeal)
    |           Lee tambien: comisionProductoConIVA, cobroServicio
    |
    +- STEP 2: fetch() → Google Sheets API
    |           a) Lee fila 1 de CF Cobros (headers con fechas de meses)
    |           b) Busca numOp en columna A → obtiene nro de fila
    |           c) Lee la fila completa (metadatos + 77 pares Importe/Estado)
    |           d) Busca numOp en Transferencia Propietario → importe propietario
    |
    +- STEP 3: Parsea los pares, filtra meses validos (no "-", no vacio)
    |           Mapea estados del Excel → estados de Airtable
    |
    +- STEP 4: Calcula importeServicio segun modalidad del deal:
    |           - "Mensualmente": comision / nº meses
    |           - "Primer mes" / "Por anticipado": toda en mes 1
    |
    +- STEP 5: Crea rentas "Alquiler" (batch de 50)
    |
    +- STEP 6: Crea rentas "Comision Advancing" si cobro mensual (batch de 50)
    |
    +- STEP 7: Crea cashflows In (batch de 50)
    |           - Importe = lo que paga el inquilino (del Excel)
    |           - statusIns = mapeo del estado Excel
    |
    +- STEP 8: Crea cashflows Out (batch de 50)
    |           - Importe = lo que cobra el propietario (de Transf. Propietario)
    |           - statusOut = derivado del estado Excel
    |
    +- STEP 9: Escribe auditoria en avisoRetro
              Desmarca crearRetro = false
```

---

## Mapeo de estados

| Excel | statusIns (cashflow In) | statusOut (cashflow Out) |
|-------|------------------------|-------------------------|
| C / c | Cobrado | Pagado |
| C' | Cobrada con retraso | Pagado |
| P / p | Pendiente | Pendiente |
| PP | Pago parcial | Pendiente |
| D | Devuelta | Devuelto |
| R | Recuperada via arrendatario | Pagado |
| R' | Recuperada via arrendatario | Pagado |
| DAS | Recuperada via DAS | Pagado |
| PR | Pendiente | Pendiente |
| I | Devuelta | Pendiente |
| - | SKIP (no se crea registro) | — |
| vacio | SKIP (no se crea registro) | — |

---

## Logica de importes

### Renta (Alquiler)

```
Si hay importeProp (de Transferencia Propietario):
    renta.importe = importeProp (lo que cobra el propietario)
Si no:
    renta.importe = importe del Excel (CF Cobros)
```

### Cashflow In (cobro al inquilino)

```
cashflowIn.importe = importe del Excel (CF Cobros)
(incluye rent + comision servicio cuando corresponde)
```

### Cashflow Out (pago al propietario)

```
cashflowOut.importe = importeProp (de Transferencia Propietario col E)
Si no existe: importe del Excel - importeServicio
```

### importeServicio (comision Advancing)

```
Modalidad "Mensualmente":
    importeServicio = comisionProductoConIVA / nº meses

Modalidad "Primer mes" / "Por anticipado":
    Mes 1:  importeServicio = comisionProductoConIVA
    Resto:  importeServicio = 0
```

---

## Campos afectados por tabla

### Tabla `balance` (tblYNdOLuMvpBavEu)

| Campo | Accion |
|-------|--------|
| crearRetro | Lee (trigger), escribe false al finalizar |
| avisoRetro | Escribe log |
| linkDeal | Lee (para obtener numOperacion) |
| linkMeses | Lee (para verificar que no hay rentas existentes) |

### Tabla `deals` (tblWnB9SCfCFoXzfW)

| Campo | Accion |
|-------|--------|
| indexDeal | Lee (numOperacion para buscar en Sheets) |
| comisionProductoConIVA | Lee (para calcular importeServicio) |
| cobroServicio | Lee (modalidad: Mensualmente / Primer mes) |

### Tabla `rentas` (tbl2izIaOR37sRHGg)

| Campo | Field ID | Accion |
|-------|----------|--------|
| fecha | fldSdtfW7UfIw8z4V | Escribe |
| importe | fld2DbSB516n1bU8f | Escribe |
| tipo | fldTWeJAYDxWOZWPJ | Escribe (Alquiler / Comision Advancing) |
| dealBalance | fldfh0vDzeqRuTFFE | Escribe (link a balance) |
| importeServicio | fldS4Zqn2KLOox9jG | Escribe |
| orden | fld5NwGSUP5onAOKd | Escribe |
| sistemaPago | fldKBseprTEyZysG8 | Escribe (Caixa) |

### Tabla `cashflow` (tblxY6upsLDmqzaaL)

| Campo | Field ID | Accion |
|-------|----------|--------|
| direccion | fld656RBx2XkCHzR7 | Escribe (In / Out) |
| importe | fldbkCQZwDR8a9kRP | Escribe |
| fechaProgramada | fldrquziQqJoTn08B | Escribe |
| statusIns | fldFyfq8PaqbCRgeN | Escribe (para cashflows In) |
| statusOut | fldIMh0gNEA3TuaiG | Escribe (para cashflows Out) |
| linkRenta | fldsTJCCfItHDoCgS | Escribe (link a renta) |
| linkDealBalance | fldyCWFzrTMhWs7FT | Escribe (link a balance) |
| sistemaPago | fldjNItVaCzrhlNhf | Escribe (Caixa) |
| razon | fld17mZxxLYPQfUzr | Escribe (Renta) |
| sujeto | fldazRk0SXXdqQo9L | Escribe (Pagador alquiler / Propietario) |
| orden | fldc5yW3lEIo5OoE8 | Escribe |
| metodoPago | fldn69DhRftezHhcZ | Escribe (SEPA / Transferencia) |

---

## Protecciones

- **Anti-duplicados**: Si el balance ya tiene rentas vinculadas (linkMeses no vacio), el script aborta.
- **Auto-desactivacion**: Desmarca `crearRetro` al finalizar para evitar re-ejecucion.
- **SKIP seguro**: Estados vacios o "-" se ignoran (no se crean registros).
- **Auditoria acumulativa**: Cada ejecucion append al campo `avisoRetro`, nunca sobreescribe.
- **Trazabilidad**: El log incluye el numero de fila en Google Sheets para referencia cruzada.

---

## Ejemplo de linea de auditoria

```
[24/02/2026 14:30] RETROSPECTIVA op.4468783216 (Antonio Rodriguez Cumplido) — 8 meses (2021-03 → 2021-10) | 8 rentas Alquiler + 8 rentas Comision | 8 CF In + 8 CF Out | Fila 3 en Sheets
```

---

## Limites

- **Timeout**: 30 segundos (Airtable Automations). Una operacion tipica (~25 meses) genera ~100 registros en 4-5 batch calls. Bien dentro del limite.
- **Google Sheets API**: 300 req/min. Cada ejecucion usa 4-5 requests. No es un problema.
- **Ejecucion**: Operacion por operacion (trigger individual desde balance). Para procesar muchas, marcar multiples balances y Airtable las ejecuta en cola.

---

## Trazabilidad Excel ↔ Airtable

El log de auditoria incluye el numero de fila de Google Sheets. Para mayor trazabilidad futura, se puede:
1. Anadir una columna "Airtable Balance ID" en Google Sheets
2. Usar un segundo `fetch()` con POST a la Sheets API para escribir el balanceRecordId en esa columna
3. Esto requiere credenciales de escritura (service account o OAuth), no solo API key

---

## Scripts relacionados

| Script | Funcion |
|--------|---------|
| **`crearRetrospectiva.js`** | Crea rentas y cashflows historicos desde Google Sheets |
| `actualizarPrecioRentas.js` | Cambia el importe de rentas futuras y sus cashflows |
| `cancelarRentasFuturas.js` | Cancela rentas y cashflows futuros |
| `cambiarSistemaPago.js` | Cambia el sistema de pago |
