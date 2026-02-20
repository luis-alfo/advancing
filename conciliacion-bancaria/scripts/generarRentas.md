# Generacion de Rentas y Cashflows

Script de Airtable Automation para generar las rentas mensuales y sus cashflows asociados a partir de la configuracion del balance/deal. Soporta dos modalidades: **estandar** (gestion de cobro al inquilino) y **SEPA propietario mensual** (sin gestion de cobro, servicio cobrado al propietario).

---

## Caso de uso

Cuando se configura un balance y se marca `statusGenerarRentas = "Ejecutando"`, este script genera automaticamente todas las rentas y cashflows del periodo segun la configuracion del deal.

### Modalidad estandar

- Genera rentas tipo "Alquiler" con sus cashflows In (cobro al inquilino) y Out (pago al propietario)
- Si `cobroServicio = "Por anticipado"`, genera una renta extra de "Comision Advancing" en el mes 0
- El `importeServicio` se reparte segun la modalidad de cobro (primer mes, en 2 meses, mensualmente)

### Modalidad SEPA propietario mensual (NUEVO)

- Se activa cuando: `gestionCobroSelect != "Advancing"` AND `cobroServicio = "Mensualmente"` AND `pagadorServicio = "Propietario"`
- **No se gestiona el cobro del alquiler**: el inquilino paga directamente al propietario
- **Solo se cobra la comision de servicio**: rentas tipo "Comision Advancing"
- **Solo cashflows In**: sujeto = "Propietario", metodo = "SEPA"
- **No se crean cashflows Out**: el propietario ya cobra directamente del inquilino
- **Crea mandato SEPA** vinculado a la cuenta bancaria del propietario (si no existe)

---

## Prerequisitos en Airtable

No se requieren campos nuevos. Todos los campos y opciones de select necesarios ya existen:

| Concepto | Tabla | Campo / Opcion | Estado |
|----------|-------|----------------|--------|
| Tipo renta comision | rentas | tipo = "Comision Advancing" | Ya existe |
| Sujeto propietario | cashflow | sujeto = "Propietario" | Ya existe |
| Metodo SEPA | cashflow | metodoPago = "SEPA" | Ya existe |
| Gestion cobro | deals | gestionCobroSelect (Advancing/Propietario/Agencia) | Ya existe |

---

## Configuracion de la automatizacion

### Trigger

- **Tipo**: "When record matches conditions"
- **Tabla**: `balance`
- **Condicion**: `statusGenerarRentas` = "Ejecutando"

### Input variables

| Variable | Valor |
|----------|-------|
| `balanceRecordId` | Record ID del registro de balance (del trigger) |

### Action

- **Tipo**: "Run a script"
- **Script**: Copiar el contenido de `generarRentas.js`

---

## Que hace el script paso a paso

### Flujo comun (ambas modalidades)

```
Balance (statusGenerarRentas = "Ejecutando")
    |
    +-- Lee datos del balance (comision, alquiler, meses, dias, etc.)
    |
    +-- Lee gestionCobroSelect del deal (via linkDeal)
    |
    +-- Detecta modalidad:
    |     gestionCobroSelect != "Advancing"
    |     AND cobroServicio = "Mensualmente"
    |     AND pagadorServicio = "Propietario"
    |     → esSEPAPropietario = true
    |
    +-- Bifurca segun modalidad (ver abajo)
    |
    +-- Actualiza statusGenerarRentas = "Ok"
```

### Flujo SEPA propietario mensual

```
    +-- Calcula comision mensual = comisionTotal / meses
    |
    +-- Genera N rentas tipo "Comision Advancing"
    |     importe = comision mensual (prorrateado si ultimo mes)
    |     importeServicio = 0
    |     metodoPago = "SEPA"
    |
    +-- Para cada renta, crea 1 cashflow In
    |     sujeto = "Propietario"
    |     metodoPago = "SEPA"
    |     statusIns = "Pendiente"
    |     importe = comision mensual
    |
    +-- NO crea cashflows Out
    |
    +-- Verifica si existe mandato SEPA
    |     Si NO → crea mandato vinculado a bankAccountCashIn + balance
    |     Si SI → log confirmacion
```

### Flujo estandar (sin cambios respecto al original)

```
    +-- [Opcional] Renta "Comision Advancing" por anticipado (mes 0)
    |
    +-- Genera N rentas tipo "Alquiler"
    |     importe = alquiler mensual (prorrateado si ultimo mes)
    |     importeServicio = segun modalidad cobro
    |
    +-- Para cada renta:
    |     Cashflow In (cobro inquilino)
    |     Cashflow Out (pago propietario)
    |     Importes segun pagadorServicio
```

---

## Logica de importes por modalidad

### SEPA propietario mensual

```
Renta:
    tipo = "Comision Advancing"
    importe = comisionTotal / meses
    importeServicio = 0

Cashflow In:
    importe = importe de la renta (comision mensual)
    sujeto = "Propietario"
    metodoPago = "SEPA"

Cashflow Out:
    NO SE CREA (el propietario cobra directamente del inquilino)
```

Ejemplo con comision = 600€, 12 meses:
```
Cada mes:
    Renta: importe = 50€, tipo = "Comision Advancing"
    Cashflow In: 50€, sujeto = "Propietario", SEPA
```

### Estandar (sin cambios)

```
Cashflow In (cobro al inquilino):
    - Pagador = Propietario/Agencia → alquiler
    - Pagador = Inquilino → alquiler + servicio
    - Pagador = 50/50 → alquiler + servicio/2

Cashflow Out (pago al propietario):
    - Pagador = Propietario/Agencia → alquiler - servicio
    - Pagador = Inquilino → alquiler
    - Pagador = 50/50 → alquiler - servicio/2
```

---

## Mandato SEPA (solo SEPA propietario)

El script crea un registro de mandato en la tabla `mandate` cuando no existe uno vinculado al balance:

1. Lee `linkMandate` del balance
2. Si esta vacio:
   - Lee `linkBankAccountCashIn` (cuenta bancaria del propietario)
   - Crea registro en `mandate` con:
     - `dealBalance` → link al balance
     - `linkBankAccount` → link a la cuenta del propietario
     - `recurring` = true
     - `scheme` = "CORE"
   - Vincula el mandato al balance via `linkMandate`
3. Si ya existe mandato, lo reporta en el log

> **Nota**: El mandato Airtable se crea como registro. Para activarlo en Unnax, hay que ejecutar el webhook `webhookCreateMandate` (generado automaticamente por formula). Este paso se hace fuera del script, ya sea manualmente o via otra automatizacion.

---

## Campos referenciados por tabla

### Tabla `deals` (tblWnB9SCfCFoXzfW)

| Campo | Field ID | Accion |
|-------|----------|--------|
| gestionCobroSelect | fldDH2gmTeqPrDZms | Lee (para detectar modalidad) |

### Tabla `balance` (tblYNdOLuMvpBavEu)

| Campo | Field ID | Accion |
|-------|----------|--------|
| linkDeal | fldOnUYgysh29VHMe | Lee (para navegar al deal) |
| linkDealComisionProductoConIVA | fld8ufg5a2oQD5zXH | Lee (comision total) |
| linkDealPrecioCalculo | fldJcNjpO6xdBzrsX | Lee (alquiler mensual) |
| meses | fldceXrAwBSiwyn5Q | Lee (duracion del contrato) |
| diasServicio | fldi0sHpqHsq1hLc2 | Lee (dias prorrateo) |
| linkDealCobroServicio | fldXmlZA1eftErNUH | Lee (modalidad cobro servicio) |
| linkDealPagadorServicio | fld8pWvwwTrSXW9UB | Lee (quien paga el servicio) |
| linkDealFechaInicio | fldCMnqOnCBuMp1RI | Lee (fecha inicio contrato) |
| diaCobroInq | fldhqOjGupd3dpW6G | Lee (dia del mes para cobro) |
| diaPagoProp | fldixiiRoT0qebXjS | Lee (dia del mes para pago) |
| sistemaPago | fldSVisYm1biJH5jz | Lee (Unnax/Caixa/Manual) |
| defaultTypeCashIn | fldy90BjhT4JiQmI2 | Lee (SEPA/Transferencia) |
| defaultTypeCashOut | fldBbo9myD9gmEDz7 | Lee (Transferencia) |
| linkMandate | fldwdq6pnPy5LCjXu | Lee/Escribe (mandato vinculado) |
| linkBankAccountCashIn | fldEwSNtJlZRHKuRk | Lee (cuenta propietario) |
| statusGenerarRentas | fldpH3ROL7agplPOE | Escribe → "Ok" |

### Tabla `rentas` (tbl2izIaOR37sRHGg)

| Campo | Accion |
|-------|--------|
| fecha | Escribe (fecha del mes) |
| tipo | Escribe ("Alquiler" o "Comision Advancing") |
| importe | Escribe (alquiler o comision mensual) |
| importeServicio | Escribe (comision prorrateada o 0) |
| orden | Escribe (numero de mes) |
| dealBalance | Escribe (link al balance) |
| sistemaPago | Escribe (del balance) |
| metodoPago | Escribe ("SEPA" o defaultTypeCashIn) |

### Tabla `cashflow` (tblxY6upsLDmqzaaL)

| Campo | Accion |
|-------|--------|
| direccion | Escribe ("In" o "Out") |
| importe | Escribe (segun modalidad) |
| fechaProgramada | Escribe (fecha cobro/pago) |
| orden | Escribe (numero de mes) |
| linkRenta | Escribe (link a la renta) |
| linkDealBalance | Escribe (link al balance) |
| statusIns | Escribe ("Pendiente") |
| statusOut | Escribe ("Pendiente") |
| sujeto | Escribe ("Propietario" o "Pagador alquiler") |
| sistemaPago | Escribe (del balance) |
| metodoPago | Escribe ("SEPA", defaultTypeCashIn o defaultTypeCashOut) |
| razon | Escribe ("Renta") |

### Tabla `mandate` (tblAu0eMls9cOSFbZ) — solo SEPA propietario

| Campo | Accion |
|-------|--------|
| dealBalance | Escribe (link al balance) |
| linkBankAccount | Escribe (link a cuenta propietario) |
| recurring | Escribe (true) |
| scheme | Escribe ("CORE") |

---

## Protecciones

- **Deteccion automatica de modalidad**: El script detecta la modalidad leyendo 3 campos del deal/balance. No requiere configuracion manual.
- **Mandato duplicado**: Si ya existe un mandato vinculado al balance, no crea uno nuevo.
- **Cuenta bancaria ausente**: Si no hay `linkBankAccountCashIn`, crea el mandato sin cuenta y avisa en el log.
- **Comision cero**: Si la comision total es 0, no genera rentas en modalidad SEPA propietario.
- **Prorrateo**: El ultimo mes se prorratea por `diasServicio / 30` si hay dias de servicio extra.
- **Batches de 50**: Respeta el limite de Airtable para operaciones bulk.

---

## Flujo visual (SEPA propietario)

```
                    +---------------------+
                    |       BALANCE       |
                    |                     |
                    | statusGenerarRentas |---- "Ejecutando" (trigger)
                    | comisionTotal       |---- 600€
                    | meses               |---- 12
                    | linkBankAccountIn   |---- cuenta propietario
                    +----------+----------+
                               |
              +----------------+----------------+
              |                                 |
    +---------v----------+          +-----------v-----------+
    | RENTA x12          |          | MANDATO SEPA          |
    | (Comision Advancing)|          |                       |
    |                    |          | recurring = true       |
    | importe = 50€      |          | scheme = CORE          |
    | metodoPago = SEPA  |          | bankAccount = prop.    |
    +--------+-----------+          +-----------------------+
             |
    +--------v-----------+
    | CASHFLOW In x12    |
    |                    |
    | importe = 50€      |
    | sujeto = Propietario|
    | metodoPago = SEPA  |
    | status = Pendiente |
    +--------------------+

    (No se crean cashflows Out)
```

---

## Scripts relacionados

| Script | Funcion |
|--------|---------|
| **`generarRentas.js`** | Genera rentas y cashflows iniciales (estandar + SEPA propietario) |
| `actualizarPrecioRentas.js` | Cambia el importe de rentas futuras y sus cashflows |
| `cancelarRentasFuturas.js` | Cancela rentas y cashflows futuros |
| `cambiarSistemaPago.js` | Cambia el sistema de pago (Unnax/Caixa/Manual) |
