# Conciliacion Bancaria Automatica (Caixa)

## Resumen

Script de automatizacion de Airtable que, al marcar una etiqueta nueva en un registro de balance (conciliacion bancaria), ejecuta el flujo completo:

1. Lee datos de pagador y cobrador del deal vinculado (sincronizados desde el Excel de control)
2. **Crea o actualiza registros en el gestor bancario** (tabla `bankAccounts`) para pagador y cobrador, y los vincula al balance
3. Filtra cashflows In pendientes con sistema de pago Caixa
4. Genera fichero SEPA Direct Debit XML (pain.008.001.02) compatible con CaixaBank
5. Crea una remesa y vincula los cashflows
6. Importa los pagos (asigna metodo SEPA y vincula remesa)
7. Escribe auditoria acumulativa

## Trigger

**Tabla:** `balance` (`tblYNdOLuMvpBavEu`)
**Tipo:** "When record matches conditions"
**Condicion:** `etiquetaConciliacion` is not empty

## Input Variables

| Variable | Descripcion |
|---|---|
| `balanceRecordId` | Record ID del registro de balance (del trigger) |

## Prerequisitos en Airtable

Crear manualmente los siguientes campos en la tabla `balance`:

| Campo | Tipo | Descripcion |
|---|---|---|
| `etiquetaConciliacion` | Single Select | Opciones: `Pendiente SEPA` / `Procesado` / `Error` |
| `avisoConciliacion` | Long Text | Historial de auditoria acumulativo |
| `sepaXML` | Long Text | XML SEPA generado (pain.008.001.02) |

## Configuracion SEPA

Antes de usar, configurar las constantes al inicio del script:

```javascript
const SEPA_CREDITOR_NAME = 'ADVANCING REAL ESTATE SL';
const SEPA_CREDITOR_ID = 'ES00000ADVANCINGRE';      // Identificador acreedor SEPA real
const SEPA_CREDITOR_IBAN = 'ES0000000000000000000000'; // IBAN real de Advancing en CaixaBank
const SEPA_CREDITOR_BIC = 'CAIXESBBXXX';              // BIC CaixaBank
```

## Flujo detallado

### Step 1 - Validacion

- Lee el registro de balance
- Verifica que `etiquetaConciliacion` no este vacia
- Verifica que `sistemaPago` sea "Caixa"
- Si no es Caixa, marca la etiqueta como "Error" y escribe auditoria

### Step 2 - Datos del deal (pagador/cobrador del Excel)

Lee del deal vinculado los datos que vienen sincronizados desde el Excel de control:

**Pagador (deudor SEPA = inquilino):**
- `pagadorNombre` / `pagadorNombreCompleto`
- `pagadorIBAN` / `linkPagadorNumeroCuenta`
- `linkPagadorNumeroDocumento`

**Cobrador (acreedor SEPA = Advancing):**
- `linkCobradorNombreCompleto`
- `linkCobradorNumeroDeCuenta`
- `linkCobradorSwiftBIC`
- `linkCobradorNumeroDocumento`

Si falta el IBAN o nombre del pagador, marca "Error" y aborta.

### Step 2b - Asignacion en el gestor bancario (bankAccounts)

**Este paso es clave:** los datos del Excel no se usan directamente, sino que se informan en el gestor bancario (tabla `bankAccounts` vinculada).

Para el **pagador** (tipo: "Pagador"):
1. Comprueba si el balance ya tiene un `linkBankAccountCashIn` vinculado
2. Si existe: actualiza los datos (nombre, IBAN, documento) por si han cambiado en el Excel
3. Si no existe: busca en `bankAccounts` un registro con el mismo IBAN y tipo "Pagador"
4. Si lo encuentra: lo vincula al balance
5. Si no lo encuentra: **crea un registro nuevo** en `bankAccounts` con:
   - `holderName` = nombre completo del pagador
   - `recipientIBANAccount` = IBAN del pagador
   - `holderAccountID` = numero de documento
   - `accountIDType` = DNI/CIF/NIE (autodetectado)
   - `tipo` = "Pagador"
   - `linkDealBalance` y `linkDealBalanceCashIns` = vinculo al balance

Para el **cobrador** (tipo: "Perceptor"):
- Mismo proceso pero con tipo "Perceptor" y campo `linkBankAccountCashOut`
- Incluye BIC y codigo bancario adicional

### Step 3 - Mandato Caixa

- Lee el mandato vinculado al balance (tabla `mandatosCaixa`)
- Extrae referencia y fecha de firma
- Si no hay mandato, genera una referencia automatica basada en el deal

### Step 4 - Filtrado de cashflows

Selecciona cashflows que cumplan TODOS estos criterios:
- Direccion: `In` (cobros)
- Status: `Pendiente`
- Sistema de pago: `Caixa`
- Sin remesa asignada (evita doble importacion)
- Importe > 0

### Step 5 - Generacion SEPA XML

Genera un fichero SEPA Direct Debit valido:

- **Formato:** pain.008.001.02 (ISO 20022)
- **Esquema:** CORE (adeudo directo basico)
- **Tipo secuencia:** RCUR (recurrente) si ya hay firma SEPA, FRST (primera vez) si no
- **Concepto:** "Alquiler [direccion inmueble] [mes/ano]"

El XML se guarda en el campo `sepaXML` del balance.

### Step 6 - Creacion de remesa

- Crea un registro en la tabla `remesas` con la fecha de cobro
- Vincula todos los cashflows procesados a la remesa

### Step 7 - Importacion de pagos

Similar al script de importacion de rentas existente:
- Asigna metodo de pago: `SEPA`
- Vincula cada cashflow a la remesa creada

### Step 8 - Actualizacion del balance

- Guarda el XML SEPA en el campo `sepaXML`
- Cambia la etiqueta a `Procesado`

### Step 9 - Auditoria

Escribe una linea acumulativa en `avisoConciliacion`:

```
[DD/MM/YYYY HH:MM] CONCILIACION CAIXA -- N cobros por EXXXX | SEPA MsgId: XXX | Remesa: XXX | Pagador: XXX [gestor:recXXX] | Cobrador: XXX [gestor:recXXX] | Mandato: XXX | Tipo: RCUR | Fecha cobro: YYYY-MM-DD
```

## Tablas y campos utilizados

### balance (`tblYNdOLuMvpBavEu`)
| Campo | Field ID | Uso |
|---|---|---|
| linkDeal | `fldOnUYgysh29VHMe` | Deal vinculado |
| linkMeses | `fldFlp2wDVWljyTtC` | Rentas vinculadas |
| sistemaPago | `fldSVisYm1biJH5jz` | Verificar que es Caixa |
| importe | `fldtJw4GfIzEtc7h2` | Precio actual |
| linkBankAccount | `fldZw3yDK5LKFqaAx` | Gestor bancario (general) |
| linkBankAccountCashIn | `fldEwSNtJlZRHKuRk` | **Pagador** en gestor bancario |
| linkBankAccountCashOut | `fldI4VmjA6mFbco12` | **Cobrador** en gestor bancario |
| linkCashflow | `fldVtegaBGTfKnJVO` | Cashflows vinculados |
| mandatosCaixa | `fldiZEWwafITebXmH` | Mandatos Caixa vinculados |
| etiquetaConciliacion | CREAR | Trigger del script |
| avisoConciliacion | CREAR | Auditoria |
| sepaXML | CREAR | XML generado |

### bankAccounts - Gestor Bancario (`tblN8MtBDlLSQyu9o`)
| Campo | Field ID | Uso |
|---|---|---|
| holderName | `fldpT0lijU9t7WHtU` | Nombre del titular |
| holderAccountID | `fldcym0YEJPXKcktx` | Numero de documento (NIF/CIF) |
| recipientIBANAccount | `fldxArd414nF6BtbR` | IBAN del cliente |
| recipientBIC | `fldMJc2U6ASSLtSGl` | BIC |
| recipientBankCode | `fld627dcxvnCW7TuW` | Codigo bancario |
| tipo | `fldo56EdsafbyzWA6` | "Pagador" o "Perceptor" |
| accountIDType | `fldrQCW1mEowU8fTm` | DNI/CIF/NIE/Otros |
| linkDealBalance | `fld3xgc019HCaYJZP` | Vinculo al balance |
| linkDealBalanceCashIns | `fld5aGOXNNTD8oEyH` | Balance para cobros |
| linkDealBalanceCashOuts | `fldLckfyVd2mmEECQ` | Balance para pagos |
| mandatosCaixa | `fldEQMnRI4QOU2fcC` | Mandatos Caixa vinculados |

### deals (`tblWnB9SCfCFoXzfW`)
| Campo | Field ID | Uso |
|---|---|---|
| pagadorNombre | `fldjbfiwcIyiDhQf6` | Nombre corto del pagador |
| pagadorNombreCompleto | `fldMh3Lozbh20yv0l` | Nombre completo (SEPA) |
| pagadorIBAN | `flda2pglffZTzlTTS` | IBAN del deudor |
| linkPagadorNumeroDocumento | `fldDwt4Jb5Szp4D5S` | DNI/NIE del pagador |
| linkCobradorNombreCompleto | `fld5xxivn9SoV3Mqc` | Nombre del acreedor |
| linkCobradorNumeroDeCuenta | `fldWoxur4wvXNMVl7` | IBAN del acreedor |
| linkCobradorSwiftBIC | `fld73WKraSn9Qd9gb` | BIC del acreedor |
| fechaFirmaSEPA | `fldoNJ6HzEIYCdqlf` | Fecha firma del mandato |
| direccion inmueble | `fldU8QxRJP0kqZVrk` | Para concepto SEPA |

### cashflow (`tblxY6upsLDmqzaaL`)
| Campo | Field ID | Uso |
|---|---|---|
| direccion | `fld656RBx2XkCHzR7` | In/Out |
| fechaProgramada | `fldrquziQqJoTn08B` | Fecha del cobro |
| importe | `fldbkCQZwDR8a9kRP` | Importe a cobrar |
| statusIns | `fldFyfq8PaqbCRgeN` | Estado del cobro |
| sistemaPago | `fldjNItVaCzrhlNhf` | Filtrar solo Caixa |
| metodoPago | `fldn69DhRftezHhcZ` | Se pone a SEPA |
| linkRemesa | `fldTbaecb3VfmQR3d` | Se vincula a la remesa |

### remesas (`tbl4wzfXvZICfxqc0`)
| Campo | Field ID | Uso |
|---|---|---|
| fechaInicio | `fld1jTryAGMTzCcM5` | Fecha de la remesa |
| linkCashflows | `fldHjP7a35Fcsp3zb` | Cashflows incluidos |

### mandatosCaixa (`tbl3PChHmHfWSzZVs`)
| Campo | Field ID | Uso |
|---|---|---|
| referencia | `fldaSk5aP3IHfr9Xa` | Referencia del mandato |
| fechaFirma | `fldGmg1JtBLX3wReX` | Fecha firma mandato |

## Manejo de errores

El script gestiona los siguientes errores y marca la etiqueta como "Error":

- Sistema de pago no es Caixa
- Falta IBAN del pagador
- Falta nombre del pagador
- No hay cashflows vinculados
- No hay cashflows pendientes Caixa sin remesa

## Relacion con otros scripts

| Script | Relacion |
|---|---|
| `cambiarSistemaPago.js` | Cambia el sistema de pago a Caixa (pre-requisito) |
| `actualizarPrecioRentas.js` | Actualiza importes que luego cobra este script |
| `cancelarRentasFuturas.js` | Cancela cobros futuros (los excluye de este script) |
