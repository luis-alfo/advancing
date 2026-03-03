# Plan: Retrospectiva Excel → Airtable (solo Airtable Automation)

Workflow para migrar los datos historicos de la **Hoja Control (CF Cobros)** hacia las tablas `rentas` y `cashflow` en Airtable, usando unicamente un script de Airtable Automation con `fetch()` a la Google Sheets API. **Sin Make. Sin Google Apps Script.**

---

## 1. Resumen del flujo

```
┌──────────────────────────────────────────────────┐
│  AIRTABLE - tabla balance                        │
│  Campo trigger: crearRetro ✓                     │
│                                                  │
│  Automation: "Run a script"                      │
│  ┌────────────────────────────────────────────┐  │
│  │  crearRetrospectiva.js                     │  │
│  │                                            │  │
│  │  1. Lee balance → linkDeal → numOperacion  │  │
│  │                                            │  │
│  │  2. fetch() → Google Sheets API v4         │  │
│  │     • Fila 1 (headers con meses)           │  │
│  │     • Col A (buscar numOp → nº de fila)    │  │
│  │     • Fila N (datos: importe/estado)       │  │
│  │                                            │  │
│  │  3. Parsea los 77 pares Importe/Estado     │  │
│  │                                            │  │
│  │  4. createRecordsAsync() → rentas (batch)  │  │
│  │                                            │  │
│  │  5. createRecordsAsync() → cashflows In    │  │
│  │     (batch, linked a rentas del paso 4)    │  │
│  │                                            │  │
│  │  6. Escribe log en avisoRetro              │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Ventajas vs Make + GAS:**
- Una sola pieza: todo vive en Airtable (como los otros 3 scripts)
- Sin coste de Make
- Sin mantener un Google Apps Script aparte
- Mismo patron que `actualizarPrecioRentas.js`, `cancelarRentasFuturas.js`, `cambiarSistemaPago.js`

---

## 2. Estructura de la Hoja Control (CF Cobros)

### Columnas de metadatos (A - AI)

| Columna | Campo | Ejemplo | Uso en retrospectiva |
|---------|-------|---------|---------------------|
| A | Nº De Operacion | `4468783216` | **Clave de busqueda** (= indexDeal en Airtable) |
| E | Nombre deudor | `Antonio Rodriguez` | Verificacion (log) |
| F | Importe mes (nominal) | `1300` | Fallback si celda de importe vacia |

### Columnas mensuales (AJ - GG): 77 meses en pares

```
Fila 1 (headers):   AJ = 2021-03-01    AL = 2021-04-01    AN = 2021-05-01  ...  hasta 2027-07-01
Fila 2 (sub):        Importe  Estado    Importe  Estado    Importe  Estado  ...
Fila 3+ (datos):     813      c         1200     c         1200     c       ...
```

Patron: columna par = Importe, columna impar = Estado.

---

## 3. Mapeo de Estados: Excel → Airtable

| Excel | Significado | Airtable `statusIns` | Airtable `statusOut` | Crear registro? |
|-------|-------------|---------------------|---------------------|----------------|
| `C` / `c` | Cobrado | Cobrado | Pagado | SI |
| `C'` / `c'` | Cobrada con retraso | Cobrada con retraso | Pagado | SI |
| `P` / `p` | Pendiente | Pendiente | Pendiente | SI |
| `PP` / `pp` | Pago parcial | Pago parcial | Pendiente | SI |
| `D` | Devuelta | Devuelta | Devuelto | SI |
| `R` | Recuperada via DAS | Recuperada via DAS | Pagado | SI |
| `R'` | Recuperada via DAS y arrendatario | Recuperada via DAS y arrendatario | Pagado | SI |
| `DAS` | Recuperada via DAS | Recuperada via DAS | Pagado | SI |
| `PR` | Pendiente de recobro | Pendiente | Pendiente | SI |
| `I` | Impagado / Incidencia | Devuelta | Pendiente | SI |
| `-` | No aplica | — | — | **NO** |
| vacio | Sin datos | — | — | **NO** |

---

## 4. Registros a crear por cada mes valido

### 4.1 Renta (tbl2izIaOR37sRHGg)

| Campo | Field ID | Valor |
|-------|----------|-------|
| fecha | fldSdtfW7UfIw8z4V | `YYYY-MM-01` del mes |
| importe | fld2DbSB516n1bU8f | Importe del Excel (o fallback col F) |
| tipo | fldTWeJAYDxWOZWPJ | `Alquiler` |
| dealBalance | fldfh0vDzeqRuTFFE | `[balanceRecordId]` |
| importeServicio | fldS4Zqn2KLOox9jG | `0` |
| orden | fld5NwGSUP5onAOKd | Indice secuencial (1, 2, 3...) |
| sistemaPago | fldKBseprTEyZysG8 | `Caixa` |

### 4.2 Cashflow In (tblxY6upsLDmqzaaL)

| Campo | Field ID | Valor |
|-------|----------|-------|
| direccion | fld656RBx2XkCHzR7 | `In` |
| importe | fldbkCQZwDR8a9kRP | Importe del Excel |
| fechaProgramada | fldrquziQqJoTn08B | `YYYY-MM-01` del mes |
| statusIns | fldFyfq8PaqbCRgeN | Segun mapeo (seccion 3) |
| linkRenta | fldsTJCCfItHDoCgS | `[rentaRecordId]` del paso anterior |
| linkDealBalance | fldyCWFzrTMhWs7FT | `[balanceRecordId]` |
| sistemaPago | fldjNItVaCzrhlNhf | `Caixa` |
| razon | fld17mZxxLYPQfUzr | `Renta` |
| sujeto | fldazRk0SXXdqQo9L | `Pagador alquiler` |
| orden | fldc5yW3lEIo5OoE8 | Mismo indice que la renta |
| metodoPago | fldn69DhRftezHhcZ | `SEPA` |

---

## 5. Prerequisitos

### 5.1 Google Sheets

1. Subir el Excel "Hoja control - MES A MES.xlsx" a Google Drive
2. Abrirlo como Google Sheet
3. Compartir el documento como **"Cualquiera con el enlace puede ver"**
4. Anotar el `SHEET_ID` de la URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
5. Anotar el `GID` de la hoja "CF Cobros" (normalmente `0` si es la primera pestaña, si no se ve en la URL al seleccionarla)

### 5.2 Google Cloud (API Key)

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto (o usar existente)
3. Habilitar "Google Sheets API"
4. Crear una API Key (Credenciales > Crear credenciales > Clave de API)
5. Restringir la key solo a "Google Sheets API" (recomendado)

### 5.3 Airtable - Campos nuevos en tabla `balance`

| Campo | Tipo | Field ID (a crear) | Descripcion |
|-------|------|---------------------|-------------|
| `crearRetro` | Checkbox | — | Trigger de la automatizacion |
| `avisoRetro` | Long text | — | Log de auditoria acumulativo |

### 5.4 Airtable - Automatizacion

- **Trigger**: "When record matches conditions" en tabla `balance`
- **Condicion**: `crearRetro` is checked
- **Input variables**:
  - `balanceRecordId`: Record ID del registro de balance
- **Action**: "Run a script" → copiar `crearRetrospectiva.js`

---

## 6. Limites y consideraciones

### Timeout del script

- Airtable Automations: **30 segundos** de timeout
- Cada operacion tiene ~12-30 meses con datos → ~12-30 rentas + ~12-30 cashflows = ~24-60 registros
- `createRecordsAsync` crea hasta 50 registros por llamada
- **Estimacion**: 1 fetch + 1 batch rentas + 1 batch cashflows + 1 update balance = ~4 operaciones → **bien dentro del limite**

### Volumen total

- ~3460 operaciones × ~25 meses promedio × 2 registros = **~173.000 registros**
- Se procesan **una operacion a la vez** (trigger manual desde balance)
- Para procesamiento masivo: activar `crearRetro` en multiples balances → Airtable las ejecuta en cola

### Google Sheets API

- Limite gratuito: 300 requests/minuto por proyecto
- Cada ejecucion hace 2-3 requests (headers + buscar fila + leer datos)
- No es un problema para ejecucion operacion-por-operacion

---

## 7. Decisiones pendientes

### 7.1 Cashflows Out (pagos al propietario)

- **Opcion A (recomendada para v1)**: Solo crear cashflows In. Los Out se generan despues.
- **Opcion B**: Crear In + Out. Requiere saber el importe del Out (desde hoja "Transferencia Propietario" o calculando).

### 7.2 Importe del servicio

- **Opcion A (recomendada)**: `importeServicio = 0`. El importe del Excel ya es lo que se cobro.
- **Opcion B**: Calcular a posteriori con otro script.

### 7.3 Rentas de tipo "Comision Advancing"

- **Opcion A (recomendada para v1)**: Solo crear rentas tipo "Alquiler".
- **Opcion B**: Tambien crear "Comision Advancing" (requiere datos adicionales).

---

## 8. Orden de implementacion

1. Subir Excel a Google Sheets y compartir con enlace
2. Crear API Key de Google Sheets
3. Crear campos en Airtable (`crearRetro`, `avisoRetro`)
4. Crear automatizacion con el script `crearRetrospectiva.js`
5. **Test 1**: Probar con 1 operacion sencilla (solo estados C/P)
6. **Test 2**: Probar con 1 operacion con impagos (D, PP, R, DAS)
7. Validar en Airtable que rentas y cashflows cuadran con el Excel
8. Ejecutar gradualmente (10, luego 50, luego el resto)

---

## 9. Scripts relacionados

| Script | Funcion |
|--------|---------|
| **`crearRetrospectiva.js`** | Crea rentas y cashflows historicos desde Google Sheets |
| `actualizarPrecioRentas.js` | Cambia el importe de rentas futuras y sus cashflows |
| `cancelarRentasFuturas.js` | Cancela rentas y cashflows futuros |
| `cambiarSistemaPago.js` | Cambia el sistema de pago |
